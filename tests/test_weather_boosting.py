"""Kiểm tra phép đối chiếu Gradient Boosting với bộ kiểm thử Random Forest."""

# [GB-TEST-000] Huấn luyện thử trên dữ liệu giả lập để kiểm tra tập đánh giá và đầu vào dự báo.
import copy
import unittest

from sklearn.ensemble import HistGradientBoostingRegressor

import weather_ml as ml
from test_weather_ml import fixture, payload
from weather_boosting import build_report, predict_next


class GradientBoostingTests(unittest.TestCase):
    # [GB-TEST-001] Hai mô hình dùng chung dữ liệu và được huấn luyện một lần cho cả nhóm bài kiểm tra.
    @classmethod
    def setUpClass(cls):
        cls.rows = fixture()
        source = {"provider": "UNIT TEST", "url": "https://example.invalid"}
        cls.reference = ml.fit_model(cls.rows, 10.78, 106.7, source, trees=8)
        cls.report, cls.model = build_report(cls.rows, cls.reference)

    # [GB-TEST-002] So sánh cùng số đặc trưng, cùng mốc kiểm thử và cùng số liệu đối chứng.
    def test_uses_same_holdout_as_random_forest(self):
        reference_report = self.reference["report"]
        self.assertIsInstance(self.model, HistGradientBoostingRegressor)
        self.assertEqual(self.model.n_features_in_, len(ml.FEATURE_NAMES))
        for name in ("train_end_target", "test_start_target", "test_end_target", "test_samples", "baseline"):
            self.assertEqual(self.report[name], reference_report[name])
        self.assertEqual(self.report["random_forest"], reference_report["metrics"])
        validation = self.report["validation"]
        for name in ("candidate_train_samples", "validation_samples", "validation_start_target", "validation_end_target"):
            self.assertEqual(validation[name], reference_report["validation"][name])
        self.assertEqual(validation["mae"], min(candidate["mae"] for candidate in validation["candidates"]))
        self.assertEqual(validation["selected"], self.report["parameters"])
        self.assertEqual(self.model.max_iter, validation["selected"]["max_iter"])
        self.assertEqual(
            [row["time"] for row in self.report["backtest"]],
            [row["time"] for row in self.reference["holdout"][-72:]],
        )

    # [GB-TEST-003] Đổi nhiệt độ và độ ẩm ở các giờ sau mốc dự báo để chắc chúng không ảnh hưởng kết quả.
    def test_live_prediction_ignores_future_weather(self):
        context = payload(self.rows[100:127], self.rows[124]["time"])
        first = predict_next(context, self.model, self.report)
        context["hourly"]["temperature_2m"][-2:] = [-75, 60]
        context["hourly"]["relative_humidity_2m"][-2:] = [1, 99]
        self.assertEqual(first, predict_next(context, self.model, self.report))
        self.assertEqual(first["target_time"], self.rows[125]["time"])
        self.assertAlmostEqual(first["temperature"], first["input_temperature"] + first["delta"])

    # [GB-TEST-004] Nếu giá trị thực ở tập đối chiếu lệch với lịch sử đang dùng, dừng lập báo cáo.
    def test_mismatched_holdout_is_rejected(self):
        reference = copy.deepcopy(self.reference)
        reference["holdout"][0]["actual"] += 2
        with self.assertRaisesRegex(ValueError, "không khớp"):
            build_report(self.rows, reference)


if __name__ == "__main__":
    unittest.main()
