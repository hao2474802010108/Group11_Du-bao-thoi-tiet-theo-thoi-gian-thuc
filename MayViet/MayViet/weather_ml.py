"""Random Forest thực sự: dữ liệu giờ -> đặc trưng quá khứ -> nhiệt độ giờ kế tiếp.

Không thay thế dự báo khí tượng Open-Meteo. Nhãn huấn luyện là ERA5 tái phân tích,
không phải số đo trạm tại nhà người dùng. Xem PHUONG_PHAP_RANDOM_FOREST.md.
"""

from __future__ import annotations

import csv
import hashlib
import io
import json
import math
import os
import threading
import time
from collections import OrderedDict
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

# [RF-001] Các thư viện ML được cài qua requirements.txt; app.py chỉ nạp module này khi dùng chức năng ML.
import joblib
import numpy as np
import sklearn
from sklearn.ensemble import RandomForestRegressor

VN = timezone(timedelta(hours=7))
SCHEMA = 1
VARIABLES = (
    "temperature_2m", "relative_humidity_2m", "surface_pressure",
    "wind_speed_10m", "cloud_cover",
)
# [RF-002] Thứ tự tên phải khớp tuyệt đối với vector trong _features_at; không đưa nhiệt độ tương lai vào đầu vào.
FEATURE_NAMES = (
    "Nhiệt độ giờ hiện tại", "Nhiệt độ trễ 1 giờ", "Nhiệt độ trễ 2 giờ",
    "Nhiệt độ trễ 3 giờ", "Nhiệt độ trễ 6 giờ", "Nhiệt độ trễ 12 giờ",
    "Nhiệt độ trễ 24 giờ", "Trung bình nhiệt độ 3 giờ", "Trung bình nhiệt độ 6 giờ",
    "Trung bình nhiệt độ 24 giờ", "Độ lệch chuẩn nhiệt độ 6 giờ", "Biến thiên nhiệt độ 1 giờ",
    "Biến thiên nhiệt độ 3 giờ", "Độ ẩm hiện tại", "Biến thiên độ ẩm 3 giờ",
    "Áp suất hiện tại", "Biến thiên áp suất 3 giờ", "Tốc độ gió hiện tại",
    "Biến thiên gió 3 giờ", "Mây che phủ hiện tại", "Biến thiên mây 3 giờ",
    "Chu kỳ giờ sin", "Chu kỳ giờ cos", "Chu kỳ năm sin", "Chu kỳ năm cos",
)
LIMITS = ((-80, 65), (0, 100), (400, 1150), (0, 400), (0, 100))


# [RF-003] Tọa độ được kiểm tra và làm tròn 2 chữ số (~1 km); mỗi khu vực có mô hình riêng, không dùng model TP.HCM cho Hà Nội.
def location(latitude: object, longitude: object) -> tuple[str, float, float]:
    if isinstance(latitude, bool) or isinstance(longitude, bool):
        raise ValueError("Tọa độ không hợp lệ.")
    lat, lon = float(latitude), float(longitude)
    if not math.isfinite(lat) or not math.isfinite(lon) or not (7 <= lat <= 24 and 101 <= lon <= 118):
        raise ValueError("Chỉ hỗ trợ tọa độ trong vùng Việt Nam.")
    lat, lon = round(lat, 2), round(lon, 2)
    return f"vn_{lat:.2f}_{lon:.2f}".replace(".", "p"), lat, lon


# [RF-004] Chuỗi API đang dùng giờ Việt Nam; chuyển về datetime không tz nhưng luôn hiểu là GMT+7.
def hour(value: object) -> datetime:
    if not isinstance(value, str) or len(value) > 40:
        raise ValueError("Mốc thời gian không hợp lệ.")
    result = datetime.fromisoformat(value)
    if result.tzinfo is not None:
        result = result.astimezone(VN).replace(tzinfo=None)
    if result.minute or result.second or result.microsecond:
        raise ValueError("Dữ liệu ML phải ở mốc giờ tròn.")
    return result


def iso(value: datetime) -> str:
    return value.isoformat(timespec="minutes")


# [RF-005] Thiếu/NaN/vô cực/ngoài giới hạn thì giữ None; không thay bằng số 0 hoặc nội suy bằng dữ liệu tương lai.
def numeric(value: object, bounds: tuple[float, float]) -> float | None:
    if value is None or isinstance(value, bool):
        return None
    try:
        number = float(value)
        return number if math.isfinite(number) and bounds[0] <= number <= bounds[1] else None
    except (TypeError, ValueError):
        return None


# [RF-006] Kiểm tra các mảng cùng chiều dài, thời gian tăng đều và không trùng. Khoảng thiếu giờ được giữ để loại cửa sổ liên quan.
def rows_from_hourly(payload: dict, max_hours: int = 18000) -> list[dict]:
    data = payload.get("hourly")
    if not isinstance(data, dict) or not isinstance(data.get("time"), list):
        raise ValueError("Thiếu mảng thời gian theo giờ.")
    times = data["time"]
    if not 1 <= len(times) <= max_hours:
        raise ValueError("Số mốc thời gian không hợp lệ.")
    if any(not isinstance(data.get(v), list) or len(data[v]) != len(times) for v in VARIABLES):
        raise ValueError("Các mảng thời tiết phải có cùng số phần tử.")
    result, previous = [], None
    for index, raw_time in enumerate(times):
        timestamp = hour(raw_time)
        if previous is not None and timestamp <= previous:
            raise ValueError("Thời gian phải tăng và không trùng.")
        previous = timestamp
        row = {"time": iso(timestamp)}
        row.update({name: numeric(data[name][index], LIMITS[j]) for j, name in enumerate(VARIABLES)})
        result.append(row)
    return result


# [RF-007] Một mẫu dùng 25 mốc từ t-24 đến t. Tra bằng timestamp để khoảng trống không bị hiểu nhầm là trễ đúng một giờ.
def _features_at(by_time: dict, anchor: datetime) -> np.ndarray | None:
    window = [by_time.get(anchor - timedelta(hours=lag)) for lag in range(25)]
    if any(row is None or any(row.get(name) is None for name in VARIABLES) for row in window):
        return None
    temperatures = np.asarray([r["temperature_2m"] for r in window], dtype=float)
    current, lag3 = window[0], window[3]
    target_time = anchor + timedelta(hours=1)
    # [RF-008] Giờ/ngày của mốc cần dự đoán là lịch đã biết, không phải dữ liệu thời tiết tương lai.
    hour_phase = 2 * math.pi * target_time.hour / 24
    year_phase = 2 * math.pi * target_time.timetuple().tm_yday / 365.25
    values = [
        *temperatures[[0, 1, 2, 3, 6, 12, 24]],
        temperatures[:3].mean(), temperatures[:6].mean(), temperatures[:24].mean(),
        temperatures[:6].std(), temperatures[0] - temperatures[1], temperatures[0] - temperatures[3],
        current["relative_humidity_2m"], current["relative_humidity_2m"] - lag3["relative_humidity_2m"],
        current["surface_pressure"], current["surface_pressure"] - lag3["surface_pressure"],
        current["wind_speed_10m"], current["wind_speed_10m"] - lag3["wind_speed_10m"],
        current["cloud_cover"], current["cloud_cover"] - lag3["cloud_cover"],
        math.sin(hour_phase), math.cos(hour_phase), math.sin(year_phase), math.cos(year_phase),
    ]
    return np.asarray(values, dtype=float)


# [RF-009] X chỉ dùng quá khứ/hiện tại; y_delta = T(t+1)-T(t). Dự báo cuối cùng cộng delta trở lại T(t).
def supervised(rows: list[dict]) -> tuple[np.ndarray, np.ndarray, np.ndarray, list[str]]:
    by_time = {hour(row["time"]): row for row in rows}
    features, deltas, bases, anchors = [], [], [], []
    for timestamp in sorted(by_time):
        following = by_time.get(timestamp + timedelta(hours=1))
        if following is None or following.get("temperature_2m") is None:
            continue
        vector = _features_at(by_time, timestamp)
        if vector is None:
            continue
        base = by_time[timestamp]["temperature_2m"]
        features.append(vector)
        deltas.append(following["temperature_2m"] - base)
        bases.append(base)
        anchors.append(iso(timestamp))
    return np.asarray(features), np.asarray(deltas), np.asarray(bases), anchors


# [RF-010] Đánh giá trên nhiệt độ °C, không phải delta; R² không có ý nghĩa khi nhãn gần như không đổi nên trả None.
def scores(actual: np.ndarray, predicted: np.ndarray) -> dict:
    errors = actual - predicted
    denominator = float(np.sum((actual - actual.mean()) ** 2))
    return {
        "mae": float(np.abs(errors).mean()),
        "rmse": float(np.sqrt(np.mean(errors ** 2))),
        "r2": float(1 - np.sum(errors ** 2) / denominator) if denominator > 1e-12 else None,
    }


# [RF-011] Có random_state cố định, giới hạn độ sâu và min_samples_leaf để giảm quá khớp; tối đa 4 luồng CPU.
def estimator(trees: int = 160) -> RandomForestRegressor:
    return RandomForestRegressor(
        n_estimators=trees, max_depth=14, min_samples_leaf=3, max_features=0.9,
        random_state=42, n_jobs=min(4, os.cpu_count() or 1),
    )


# [RF-012] Chia 80/20 theo thời gian, bỏ một mẫu ở biên. Không shuffle, không chọn tham số bằng tập kiểm thử.
def fit_model(rows: list[dict], lat: float, lon: float, source: dict, trees: int = 160) -> dict:
    x, delta, base, anchors = supervised(rows)
    if len(x) < 720:
        raise ValueError("Cần ít nhất 720 mẫu hợp lệ (khoảng 30 ngày sau khi tạo đặc trưng).")
    split = int(len(x) * 0.8)
    train_stop = split - 1
    train_end = hour(anchors[train_stop - 1]) + timedelta(hours=1)
    test_start = hour(anchors[split])
    if train_end >= test_start:
        raise ValueError("Biên thời gian train/test bị chồng lấn.")
    # [RF-013] Model đánh giá chỉ học phần train. Baseline Persistence luôn đoán T(t+1)=T(t).
    evaluation_model = estimator(trees)
    started = time.perf_counter()
    evaluation_model.fit(x[:train_stop], delta[:train_stop])
    prediction = base[split:] + evaluation_model.predict(x[split:])
    actual = base[split:] + delta[split:]
    rf_metrics, baseline = scores(actual, prediction), scores(actual, base[split:])
    holdout = [
        {"time": iso(hour(anchors[i]) + timedelta(hours=1)), "actual": float(actual[j]),
         "predicted": float(prediction[j]), "baseline": float(base[i]),
         "absolute_error": float(abs(actual[j] - prediction[j]))}
        for j, i in enumerate(range(split, len(x)))
    ]
    # [RF-014] Sau khi chốt kết quả holdout, fit model triển khai trên toàn bộ lịch sử. Không tính lại điểm bằng model đã học holdout.
    final_model = estimator(trees)
    final_model.fit(x, delta)
    importance = sorted(
        ({"name": name, "value": float(weight)} for name, weight in zip(FEATURE_NAMES, final_model.feature_importances_)),
        key=lambda item: item["value"], reverse=True,
    )
    report = {
        "method": "RandomForestRegressor", "target": "temperature_2m_next_hour",
        "trained_at": datetime.now(VN).isoformat(), "latitude": lat, "longitude": lon,
        "history_start": rows[0]["time"], "history_end": rows[-1]["time"],
        "raw_rows": len(rows), "supervised_samples": len(x), "features": len(FEATURE_NAMES),
        "train_samples": train_stop, "test_samples": len(actual), "gap_samples": 1,
        "train_start": anchors[0], "train_end_target": iso(train_end),
        "test_start_anchor": anchors[split], "test_start_target": holdout[0]["time"],
        "test_end_target": holdout[-1]["time"], "metrics": rf_metrics, "baseline": baseline,
        "mae_improvement_percent": (1 - rf_metrics["mae"] / baseline["mae"]) * 100 if baseline["mae"] > 1e-12 else None,
        "absolute_error_p90": float(np.quantile(np.abs(actual - prediction), 0.9)),
        "feature_importance": importance, "source": source,
        "parameters": {"n_estimators": trees, "max_depth": 14, "min_samples_leaf": 3, "max_features": 0.9, "random_state": 42},
        "training_seconds": round(time.perf_counter() - started, 3),
        "sklearn_version": sklearn.__version__,
        "numpy_version": np.__version__, "joblib_version": joblib.__version__,
        "note": "Kiểm thử trên ERA5 tái phân tích, không phải xác minh trực tiếp bằng trạm đo. Độ quan trọng không chứng minh quan hệ nhân quả.",
    }
    return {"schema": SCHEMA, "model": final_model, "report": report, "holdout": holdout}


# [RF-015] Ghi file tạm rồi replace: đang tải trang hoặc mất điện không làm người đọc thấy nửa file.
def atomic_bytes(path: Path, content: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(path.name + f".{threading.get_ident()}.tmp")
    try:
        temporary.write_bytes(content)
        temporary.replace(path)
    finally:
        temporary.unlink(missing_ok=True)


def json_bytes(value: object) -> bytes:
    return json.dumps(value, ensure_ascii=False, allow_nan=False, indent=2).encode("utf-8")


# [RF-016] CSV có UTF-8 BOM để tên tiếng Việt đọc được bằng Excel; các số liệu gốc vẫn giữ đơn vị °C/kmh/hPa.
def csv_bytes(rows: list[dict], fields: list[str]) -> bytes:
    stream = io.StringIO(newline="")
    writer = csv.DictWriter(stream, fieldnames=fields, extrasaction="ignore")
    writer.writeheader()
    writer.writerows(rows)
    return stream.getvalue().encode("utf-8-sig")


class MLService:
    # [RF-017] Chỉ dùng các đường dẫn tự dựng theo tọa độ. RAM giữ tối đa 4 model; các model khác còn trên đĩa.
    def __init__(self, root: Path) -> None:
        self.root = Path(root)
        self.lock = threading.RLock()
        self.jobs: dict[str, dict] = {}
        self.loaded: OrderedDict[str, tuple[int, dict]] = OrderedDict()
        self.active: str | None = None

    def paths(self, key: str) -> dict[str, Path]:
        return {
            "history": self.root / "data" / "history" / f"{key}.csv",
            "source": self.root / "data" / "history" / f"{key}.source.json",
            "model": self.root / "models" / f"{key}.joblib",
            "report": self.root / "models" / f"{key}.metrics.json",
            "backtest": self.root / "reports" / f"{key}_holdout.csv",
        }

    # [RF-018] Lịch sử lưu cục bộ có thể dùng để huấn luyện offline; không đọc pickle từ URL hoặc file người ngoài cung cấp.
    def history(self, key: str) -> tuple[list[dict], dict]:
        paths = self.paths(key)
        source = json.loads(paths["source"].read_text(encoding="utf-8"))
        if source.get("csv_sha256") and hashlib.sha256(paths["history"].read_bytes()).hexdigest() != source["csv_sha256"]:
            raise ValueError("CSV lịch sử bị thay đổi; hãy tải lại để giữ đúng nguồn dữ liệu.")
        with paths["history"].open(encoding="utf-8-sig", newline="") as stream:
            raw = list(csv.DictReader(stream))
        payload = {"hourly": {"time": [r["time"] for r in raw]}}
        for name in VARIABLES:
            payload["hourly"][name] = [r.get(name) or None for r in raw]
        return rows_from_hourly(payload), source

    def save_history(self, key: str, rows: list[dict], source: dict) -> None:
        paths = self.paths(key)
        encoded = csv_bytes(rows, ["time", *VARIABLES])
        source = {**source, "csv_sha256": hashlib.sha256(encoded).hexdigest(), "rows": len(rows)}
        atomic_bytes(paths["history"], encoded)
        atomic_bytes(paths["source"], json_bytes(source))

    # [RF-019] API cố định ERA5, 365 ngày, kết thúc trước hiện tại 7 ngày để tránh vùng lịch sử chưa hoàn tất.
    def download_history(self, latitude: float, longitude: float) -> tuple[list[dict], dict]:
        key, lat, lon = location(latitude, longitude)
        end = datetime.now(VN).date() - timedelta(days=7)
        start = end - timedelta(days=364)
        try:
            rows, source = self.history(key)
            if source["end_date"] >= end.isoformat():
                return rows, source
        except (OSError, ValueError, KeyError):
            pass
        rate_file = self.root / "data" / "archive_retry.json"
        try:
            blocked = float(json.loads(rate_file.read_text())["until"])
            if blocked > time.time():
                raise ValueError(f"Nguồn lịch sử đang giới hạn truy cập. Chờ khoảng {math.ceil(blocked - time.time())} giây.")
        except (OSError, KeyError, json.JSONDecodeError):
            pass
        params = {"latitude": lat, "longitude": lon, "start_date": start.isoformat(), "end_date": end.isoformat(),
                  "hourly": ",".join(VARIABLES), "timezone": "Asia/Ho_Chi_Minh", "models": "era5",
                  "temperature_unit": "celsius", "wind_speed_unit": "kmh"}
        url = "https://archive-api.open-meteo.com/v1/archive?" + urlencode(params)
        try:
            request = Request(url, headers={"Accept": "application/json", "User-Agent": "MayViet-Educational-RF/1.0"})
            with urlopen(request, timeout=35) as response:
                raw = response.read(5_000_001)
                if len(raw) > 5_000_000:
                    raise ValueError("Phản hồi lịch sử quá lớn.")
            payload = json.loads(raw)
            rows = rows_from_hourly(payload)
        except HTTPError as e:
            if e.code == 429:
                # [RF-020] Tôn trọng Retry-After dạng giây hoặc HTTP-date, không tự gửi lại liên tục.
                from email.utils import parsedate_to_datetime
                retry = e.headers.get("Retry-After", "60")
                try:
                    seconds = float(retry)
                    if not math.isfinite(seconds) or seconds <= 0:
                        raise ValueError("Invalid Retry-After")
                    until = time.time() + max(1, seconds)
                except ValueError:
                    try:
                        until = max(time.time() + 1, parsedate_to_datetime(retry).timestamp())
                    except (ValueError, TypeError, OverflowError):
                        until = time.time() + 60
                atomic_bytes(rate_file, json_bytes({"until": until}))
                raise ValueError("Nguồn lịch sử báo 429; hãy chờ theo Retry-After trước khi huấn luyện lại.") from e
            raise ValueError(f"Nguồn lịch sử tạm thời trả HTTP {e.code}. Thử lại sau.") from e
        except (URLError, TimeoutError, OSError) as e:
            raise ValueError("Chưa tải được lịch sử. Kiểm tra Internet hoặc dùng dữ liệu đã kèm tại TP.HCM.") from e
        source = {"provider": "Open-Meteo Historical Weather / ERA5", "kind": "reanalysis_not_station_observations",
                  "url": url, "downloaded_at": datetime.now(VN).isoformat(), "start_date": start.isoformat(),
                  "end_date": end.isoformat(), "latitude": lat, "longitude": lon,
                  "grid_latitude": payload.get("latitude"), "grid_longitude": payload.get("longitude"),
                  "grid_elevation": payload.get("elevation"), "hourly_units": payload.get("hourly_units"),
                  "timezone": "Asia/Ho_Chi_Minh", "license": "CC BY 4.0, attribution Open-Meteo and ECMWF ERA5"}
        self.save_history(key, rows, source)
        return self.history(key)

    # [RF-021] Artifact chứa model thật và kết quả đánh giá; metrics JSON/holdout CSV là bản đọc được cho báo cáo.
    def persist(self, key: str, artifact: dict) -> None:
        paths = self.paths(key)
        paths["model"].parent.mkdir(parents=True, exist_ok=True)
        temporary = paths["model"].with_suffix(".tmp")
        try:
            joblib.dump(artifact, temporary, compress=3)
            temporary.replace(paths["model"])
        finally:
            temporary.unlink(missing_ok=True)
        report = {"schema": SCHEMA, **artifact["report"], "artifact_sha256": hashlib.sha256(paths["model"].read_bytes()).hexdigest()}
        atomic_bytes(paths["report"], json_bytes(report))
        atomic_bytes(paths["backtest"], csv_bytes(artifact["holdout"], ["time", "actual", "predicted", "baseline", "absolute_error"]))
        with self.lock:
            self.loaded.pop(key, None)

    # [RF-022] Không nạp artifact khác phiên bản sklearn/NumPy/joblib: refit CSV để tránh pickle không tương thích.
    def load(self, key: str) -> dict | None:
        paths = self.paths(key)
        if not paths["model"].is_file() or not paths["report"].is_file():
            return None
        timestamp = paths["model"].stat().st_mtime_ns
        with self.lock:
            cached = self.loaded.get(key)
            if cached and cached[0] == timestamp:
                self.loaded.move_to_end(key)
                return cached[1]
        meta = json.loads(paths["report"].read_text(encoding="utf-8"))
        if (meta.get("sklearn_version") != sklearn.__version__ or meta.get("numpy_version") != np.__version__
                or meta.get("joblib_version") != joblib.__version__ or meta.get("schema") != SCHEMA):
            return None
        if hashlib.sha256(paths["model"].read_bytes()).hexdigest() != meta.get("artifact_sha256"):
            raise ValueError("File model hỏng hoặc bị đổi. Hãy huấn luyện lại từ CSV lịch sử.")
        artifact = joblib.load(paths["model"])
        if artifact.get("schema") != SCHEMA or not isinstance(artifact.get("model"), RandomForestRegressor):
            raise ValueError("Artifact không phải RandomForestRegressor của bản ứng dụng này.")
        with self.lock:
            self.loaded[key] = (timestamp, artifact)
            self.loaded.move_to_end(key)
            while len(self.loaded) > 4:
                self.loaded.popitem(last=False)
        return artifact

    # [RF-023] Trạng thái không tự tải API/huấn luyện; chuyển địa điểm không tạo tác vụ CPU hoặc request lịch sử ngoài ý muốn.
    def status(self, latitude: object, longitude: object) -> dict:
        key, lat, lon = location(latitude, longitude)
        with self.lock:
            job = dict(self.jobs.get(key, {}))
        artifact = None
        try:
            artifact = self.load(key)
        except Exception as e:
            if not job:
                job = {"state": "error", "message": str(e)}
        state = job.get("state", "ready" if artifact else "idle")
        if state == "ready" and artifact is None:
            state = "idle"
        paths = self.paths(key)
        result = {"state": state, "message": job.get("message", "Mô hình sẵn sàng." if artifact else "Chưa có model tương thích. Nhấn Huấn luyện để tạo model cho địa điểm này."),
                  "latitude": lat, "longitude": lon, "has_history": paths["history"].is_file(), "model": None}
        if artifact:
            result["model"] = {**artifact["report"], "backtest": artifact["holdout"][-72:]}
        return result

    # [RF-024] Khóa ngăn hai lượt train cùng lúc. Tác vụ chạy nền nên trang và dự báo API vẫn sử dụng được.
    def start_training(self, latitude: object, longitude: object) -> dict:
        key, lat, lon = location(latitude, longitude)
        with self.lock:
            if self.active == key:
                return self.status(lat, lon)
            if self.active is not None:
                raise ValueError("Đang huấn luyện một địa điểm khác. Hãy đợi tác vụ đó hoàn tất.")
            previous = self.jobs.get(key, {})
            if previous.get("state") == "ready" and time.monotonic() - previous.get("finished", 0) < 30:
                return self.status(lat, lon)
            self.active = key
            self.jobs[key] = {"state": "training", "message": "Đang chuẩn bị dữ liệu lịch sử 365 ngày…"}
        threading.Thread(target=self._train_job, args=(key, lat, lon), daemon=True).start()
        return self.status(lat, lon)

    def _train_job(self, key: str, lat: float, lon: float) -> None:
        try:
            notice = ""
            try:
                rows, source = self.download_history(lat, lon)
            except (ValueError, OSError) as error:
                # [RF-025] Chỉ fallback sang lịch sử thật đã lưu, ghi rõ dữ liệu cũ; không tạo số liệu ngẫu nhiên.
                if not self.paths(key)["history"].is_file():
                    raise error
                rows, source = self.history(key)
                notice = f" Dùng lịch sử đã lưu vì nguồn chưa cập nhật được ({error})."
            with self.lock:
                self.jobs[key] = {"state": "training", "message": "Đang fit Random Forest và kiểm thử 20% cuối theo thời gian…"}
            artifact = fit_model(rows, lat, lon, source)
            self.persist(key, artifact)
            with self.lock:
                self.jobs[key] = {"state": "ready", "message": "Đã huấn luyện và lưu model." + notice, "finished": time.monotonic()}
        except Exception as e:
            with self.lock:
                self.jobs[key] = {"state": "error", "message": f"Chưa huấn luyện được: {e}"}
        finally:
            with self.lock:
                self.active = None

    # [RF-026] Chỉ giữ dữ liệu <= as_of trước khi tạo đặc trưng. Thay giá trị tương lai trong request không đổi kết quả RF.
    def predict(self, latitude: object, longitude: object, context: dict) -> dict:
        key, lat, lon = location(latitude, longitude)
        artifact = self.load(key)
        if artifact is None:
            raise ValueError("Cần huấn luyện model tương thích cho địa điểm này trước.")
        anchor = hour(context.get("as_of"))
        now = datetime.now(VN).replace(tzinfo=None)
        if anchor > now.replace(minute=0, second=0, microsecond=0):
            raise ValueError("Mốc đầu vào đang ở tương lai; hãy kiểm tra thời gian nguồn dữ liệu.")
        rows = rows_from_hourly(context, max_hours=200)
        past = {hour(r["time"]): r for r in rows if hour(r["time"]) <= anchor}
        vector = _features_at(past, anchor)
        if vector is None:
            raise ValueError("Thiếu cửa sổ 25 giờ liên tiếp hoặc có chỉ số bị thiếu. Thử tải lại dữ liệu ML.")
        base = past[anchor]["temperature_2m"]
        delta = float(artifact["model"].predict(vector.reshape(1, -1))[0])
        return {"method": "RandomForestRegressor", "latitude": lat, "longitude": lon,
                "as_of": iso(anchor), "target_time": iso(anchor + timedelta(hours=1)),
                "input_temperature": base, "temperature": base + delta, "delta": delta,
                "stale": (now - anchor).total_seconds() > 7200,
                "reference_error_p90": artifact["report"]["absolute_error_p90"],
                "note": "Đầu vào là ước tính theo giờ của Forecast API; model học ERA5. Sai số thực tế có thể khác kiểm thử lịch sử."}

    # [RF-027] Xuất CSV đúng model đang chọn; endpoint không nhận tên đường dẫn từ trình duyệt.
    def export(self, latitude: object, longitude: object) -> tuple[str, bytes]:
        key, _, _ = location(latitude, longitude)
        artifact = self.load(key)
        if artifact is None:
            raise ValueError("Chưa có kết quả kiểm thử để xuất.")
        return f"MayViet_RF_{key}_holdout.csv", csv_bytes(
            artifact["holdout"], ["time", "actual", "predicted", "baseline", "absolute_error"],
        )
