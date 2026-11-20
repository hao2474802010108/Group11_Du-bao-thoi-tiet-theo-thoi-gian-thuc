"""Kiểm tra ML: dữ liệu tổng hợp CHỈ dùng trong test, không nằm trong dataset sản phẩm.

Dữ liệu thật đi kèm ở data/history có URL nguồn, checksum và 8.760 dòng ERA5.
"""
import copy
import http.client
import json
import math
import tempfile
import threading
import time
import unittest
from datetime import datetime, timedelta
from pathlib import Path
from urllib.error import HTTPError
from unittest.mock import patch

import numpy as np
import app
import weather_ml as ml


# [RF-TEST-001] Chuỗi 60 ngày giả lập có chu kỳ giờ để kiểm tra thuật toán; không download mạng khi chạy test.
def fixture():
    start = datetime(2025, 1, 1)
    result = []
    for i in range(60 * 24):
        phase = 2 * math.pi * (i % 24) / 24
        result.append({"time": ml.iso(start + timedelta(hours=i)),
                       "temperature_2m": 27 + 4 * math.sin(phase) + .002 * i,
                       "relative_humidity_2m": 70 - 12 * math.sin(phase),
                       "surface_pressure": 1008 + math.cos(phase),
                       "wind_speed_10m": 10 + 3 * math.cos(phase), "cloud_cover": 50 + 20 * math.sin(phase)})
    return result


def payload(rows, anchor):
    return {"as_of": anchor, "hourly": {name: [r[name] for r in rows] for name in ["time", *ml.VARIABLES]}}


class ModelTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.rows = fixture()
        cls.artifact = ml.fit_model(cls.rows, 10.78, 106.7,
                                    {"provider": "UNIT TEST SYNTHETIC ONLY", "url": "https://example.invalid/test"}, trees=16)

    def setUp(self):
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        self.service = ml.MLService(Path(temporary.name))
        self.key, self.lat, self.lon = ml.location(10.7769, 106.7009)
        self.service.persist(self.key, self.artifact)

    # [RF-TEST-002] Mô hình đúng lớp RandomForestRegressor, không phải lấy API hoặc Persistence đổi nhãn thành RF.
    def test_real_random_forest_is_fitted(self):
        self.assertIsInstance(self.artifact["model"], ml.RandomForestRegressor)
        self.assertEqual(len(self.artifact["model"].estimators_), 16)
        self.assertEqual(self.artifact["model"].n_features_in_, len(ml.FEATURE_NAMES))

    # [RF-TEST-003] Thay nhiệt độ tương lai không đổi vector đặc trưng tại t; nhãn y phải thay đổi đúng.
    def test_features_do_not_see_future(self):
        before = {ml.hour(r["time"]): r for r in self.rows}
        changed = copy.deepcopy(self.rows)
        changed[201]["temperature_2m"] += 10
        after = {ml.hour(r["time"]): r for r in changed}
        np.testing.assert_array_equal(ml._features_at(before, ml.hour(self.rows[200]["time"])),
                                      ml._features_at(after, ml.hour(self.rows[200]["time"])))
        _, y1, _, anchors1 = ml.supervised(self.rows)
        _, y2, _, _ = ml.supervised(changed)
        i = anchors1.index(self.rows[200]["time"])
        self.assertAlmostEqual(y2[i] - y1[i], 10)

    # [RF-TEST-004] Khoảng thiếu giờ không được biến thành lag 1h nhờ việc đánh lại chỉ số.
    def test_gap_and_null_remove_affected_windows(self):
        missing = self.rows[:100] + self.rows[101:]
        mapping = {ml.hour(r["time"]): r for r in missing}
        self.assertIsNone(ml._features_at(mapping, ml.hour(self.rows[110]["time"])))
        changed = copy.deepcopy(self.rows)
        changed[110]["surface_pressure"] = None
        mapping = {ml.hour(r["time"]): r for r in changed}
        self.assertIsNone(ml._features_at(mapping, ml.hour(self.rows[111]["time"])))

    # [RF-TEST-005] Train kết thúc trước anchor của test; số dòng báo cáo cộng với gap phải khớp số mẫu thực.
    def test_chronological_split_and_gap(self):
        report = self.artifact["report"]
        self.assertLess(ml.hour(report["train_end_target"]), ml.hour(report["test_start_anchor"]))
        self.assertEqual(report["train_samples"] + report["test_samples"] + 1, report["supervised_samples"])

    # [RF-TEST-006] Tự tính lại MAE/RMSE từ holdout xuất CSV; baseline đúng là nhiệt độ giờ trước.
    def test_metrics_are_computed_from_held_out_predictions(self):
        holdout = self.artifact["holdout"]
        actual = np.array([r["actual"] for r in holdout])
        predicted = np.array([r["predicted"] for r in holdout])
        self.assertAlmostEqual(np.abs(actual - predicted).mean(), self.artifact["report"]["metrics"]["mae"])
        self.assertAlmostEqual(np.sqrt(((actual - predicted) ** 2).mean()), self.artifact["report"]["metrics"]["rmse"])
        history = {r["time"]: r for r in self.rows}
        for row in holdout:
            previous = ml.iso(ml.hour(row["time"]) - timedelta(hours=1))
            self.assertEqual(row["baseline"], history[previous]["temperature_2m"])

    # [RF-TEST-007] Predict cũng loại dữ liệu tương lai, không chỉ pipeline train.
    def test_predict_ignores_future_rows(self):
        context = payload(self.rows[170:204], self.rows[200]["time"])
        first = self.service.predict(self.lat, self.lon, context)
        altered = copy.deepcopy(context)
        altered["hourly"]["temperature_2m"][-3:] = [60, 60, 60]
        second = self.service.predict(self.lat, self.lon, altered)
        self.assertEqual(first["temperature"], second["temperature"])
        self.assertTrue(first["stale"])
        self.assertEqual(first["target_time"], self.rows[201]["time"])

    def test_prediction_needs_enough_valid_input(self):
        context = payload(self.rows[190:201], self.rows[200]["time"])
        with self.assertRaisesRegex(ValueError, "25 giờ"):
            self.service.predict(self.lat, self.lon, context)

    # [RF-TEST-008] Chọn địa điểm khác không được nhận model/metrics của TP.HCM.
    def test_model_is_scoped_to_location(self):
        self.assertEqual(self.service.status(21.0285, 105.8542)["state"], "idle")
        with self.assertRaisesRegex(ValueError, "huấn luyện"):
            self.service.predict(21.0285, 105.8542, {})

    def test_bad_coordinates_are_rejected(self):
        for lat, lon in [(float("nan"), 106), (10, float("inf")), (True, 106), (999, 106)]:
            with self.subTest(lat=lat, lon=lon), self.assertRaises(ValueError):
                ml.location(lat, lon)

    def test_small_dataset_does_not_create_fake_model(self):
        with self.assertRaisesRegex(ValueError, "720"):
            ml.fit_model(self.rows[:100], self.lat, self.lon, {}, trees=2)

    # [RF-TEST-009] Metadata khác phiên bản sklearn không được nạp; CSV lịch sử vẫn có thể dùng để refit.
    def test_incompatible_model_is_not_unpickled(self):
        p = self.service.paths(self.key)["report"]
        report = json.loads(p.read_text())
        report["sklearn_version"] = "0.0-incompatible"
        p.write_text(json.dumps(report))
        with patch.object(ml.joblib, "load") as loader:
            self.assertIsNone(self.service.load(self.key))
            loader.assert_not_called()

    def test_history_checksum_detects_changes(self):
        self.service.save_history(self.key, self.rows, {"end_date": "2025-03-01"})
        history = self.service.paths(self.key)["history"]
        history.write_bytes(history.read_bytes() + b"\n")
        with self.assertRaisesRegex(ValueError, "thay đổi"):
            self.service.history(self.key)

    # [RF-TEST-010] Tải lại artifact giữ nguyên dự đoán; CSV holdout đủ dòng và có BOM cho Excel.
    def test_persistence_and_export(self):
        context = payload(self.rows[170:201], self.rows[200]["time"])
        result = self.service.predict(self.lat, self.lon, context)
        reopened = ml.MLService(self.service.root)
        self.assertEqual(result["temperature"], reopened.predict(self.lat, self.lon, context)["temperature"])
        _, exported = reopened.export(self.lat, self.lon)
        self.assertTrue(exported.startswith(b"\xef\xbb\xbf"))
        self.assertEqual(len(exported.decode("utf-8-sig").splitlines()) - 1, self.artifact["report"]["test_samples"])

    # [RF-TEST-011] HTTP 429 giữ cooldown dùng chung cho địa điểm khác; không gọi URL nguồn lần thứ hai.
    def test_archive_rate_limit_is_respected(self):
        error = HTTPError("https://archive-api.open-meteo.com", 429, "limited", {"Retry-After": "120"}, None)
        with patch.object(ml, "urlopen", side_effect=error) as network:
            with self.assertRaisesRegex(ValueError, "429"):
                self.service.download_history(self.lat, self.lon)
            with self.assertRaisesRegex(ValueError, "giới hạn"):
                self.service.download_history(21.03, 105.85)
            self.assertEqual(network.call_count, 1)

    # [RF-TEST-012] Hai lần bấm train cùng lúc không tạo hai tác vụ; status trả ngay và chuyển ready sau khi lưu.
    def test_training_job_is_deduplicated(self):
        gate = threading.Event()
        def download(*_):
            gate.wait(3)
            return self.rows, {"provider": "UNIT TEST"}
        with patch.object(self.service, "download_history", side_effect=download) as fetch, patch.object(ml, "fit_model", return_value=self.artifact):
            try:
                self.service.start_training(self.lat, self.lon)
                self.service.start_training(self.lat, self.lon)
                self.assertEqual(self.service.status(self.lat, self.lon)["state"], "training")
            finally:
                gate.set()
            deadline = time.monotonic() + 5
            while self.service.active is not None and time.monotonic() < deadline:
                time.sleep(.03)
            self.assertIsNone(self.service.active)
            self.assertEqual(fetch.call_count, 1)
            self.assertEqual(self.service.status(self.lat, self.lon)["state"], "ready")


class MLHTTPTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.rows = fixture()
        cls.artifact = ml.fit_model(cls.rows, 10.78, 106.7, {"provider": "UNIT TEST", "url": "https://example.invalid"}, trees=8)

    def setUp(self):
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        root = Path(temporary.name)
        (root / "dist").mkdir()
        (root / "dist/index.html").write_text("test")
        service = ml.MLService(root)
        key, _, _ = ml.location(10.78, 106.7)
        service.persist(key, self.artifact)
        self.server = app.MayVietServer(0, root / "dist")
        self.server.ml_service = service
        thread = threading.Thread(target=self.server.serve_forever, kwargs={"poll_interval": .02}, daemon=True)
        thread.start()
        def close():
            self.server.shutdown()
            self.server.server_close()
            thread.join(2)
        self.addCleanup(close)

    def request(self, method, path, payload=None, headers=None):
        connection = http.client.HTTPConnection(app.HOST, self.server.server_address[1], timeout=5)
        try:
            body = None if payload is None else json.dumps(payload)
            connection.request(method, path, body, headers or {"Content-Type": "application/json"})
            response = connection.getresponse()
            return response.status, dict(response.getheaders()), response.read()
        finally:
            connection.close()

    # [RF-HTTP-TEST-001] Kiểm tra HTTP thật nối vào model thật đã fit trong fixture, không mock kết quả predict.
    def test_status_and_prediction(self):
        status, _, data = self.request("GET", "/api/ml/status?latitude=10.7769&longitude=106.7009")
        self.assertEqual(status, 200)
        self.assertEqual(json.loads(data)["model"]["method"], "RandomForestRegressor")
        status, _, data = self.request("POST", "/api/ml/predict", {"latitude": 10.78, "longitude": 106.7,
                        "context": payload(self.rows[170:201], self.rows[200]["time"])})
        self.assertEqual(status, 200)
        result = json.loads(data)
        self.assertAlmostEqual(result["temperature"], result["input_temperature"] + result["delta"])

    def test_bad_request_and_unknown_route(self):
        self.assertEqual(self.request("GET", "/api/ml/status?latitude=NaN&longitude=106")[0], 400)
        self.assertEqual(self.request("GET", "/api/ml/train")[0], 405)
        self.assertEqual(self.request("GET", "/api/unknown")[0], 404)
        self.assertEqual(self.request("POST", "/api/ml/train", [1, 2])[0], 400)

    # [RF-HTTP-TEST-002] Trang ngoài localhost không kích hoạt train được và body không phải JSON bị từ chối.
    def test_origin_content_type_and_size(self):
        data = {"latitude": 10.78, "longitude": 106.7}
        self.assertEqual(self.request("POST", "/api/ml/train", data, {"Origin": "https://evil.example", "Content-Type": "application/json"})[0], 403)
        self.assertEqual(self.request("POST", "/api/ml/train", data, {"Content-Type": "text/plain"})[0], 415)
        self.assertEqual(self.request("POST", "/api/ml/train", {}, {"Content-Type": "application/json", "Content-Length": "1000001"})[0], 413)

    def test_export_is_csv_for_requested_model(self):
        status, headers, data = self.request("GET", "/api/ml/export?latitude=10.78&longitude=106.7")
        self.assertEqual(status, 200)
        self.assertIn("text/csv", headers["Content-Type"])
        self.assertIn("vn_10p78_106p70", headers["Content-Disposition"])
        self.assertTrue(data.startswith(b"\xef\xbb\xbf"))

    # [RF-HTTP-TEST-003] Thiếu thư viện ML chỉ trả 503 có hướng dẫn; server HTML vẫn hoạt động.
    def test_missing_ml_dependencies_does_not_break_weather_page(self):
        with patch.object(app.WeatherRequestHandler, "_ml_service", side_effect=ImportError()):
            status, _, data = self.request("GET", "/api/ml/status?latitude=10.78&longitude=106.7")
            self.assertEqual(status, 503)
            self.assertEqual(json.loads(data)["state"], "missing_dependencies")
            self.assertEqual(self.request("GET", "/")[0], 200)


if __name__ == "__main__":
    unittest.main()
