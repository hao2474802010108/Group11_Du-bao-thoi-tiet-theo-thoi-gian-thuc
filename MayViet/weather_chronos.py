"""Dự báo trước một giờ bằng checkpoint Chronos-2 Small trên CPU."""

# [CHR-001] File này nạp Chronos-2 Small đã huấn luyện sẵn, kiểm thử theo mốc Random Forest và dự báo nhiệt độ giờ tới trên CPU.
from __future__ import annotations

from collections.abc import Callable
from datetime import datetime, timedelta
from importlib.util import find_spec
from math import isclose
from pathlib import Path
from threading import Lock
from time import perf_counter

import numpy as np

from weather_ml import VARIABLES, VN, hour, iso, rows_from_hourly, scores


METHOD = "Chronos-2 Small"
# [CHR-002] Cố định phiên bản checkpoint và dùng chung thư mục ai-cache để lần chạy sau có thể đọc lại trọng số.
CHECKPOINT = "autogluon/chronos-2-small"
CHECKPOINT_REVISION = "ddec01313e50b6bc58ebaa92ede81bc24a3d9f9a"
DEFAULT_CACHE_DIR = Path(__file__).resolve().parent / "models" / "ai-cache"
CHECKPOINT_FILES = ("config.json", "model.safetensors")
# [CHR-003] Mỗi mốc dự báo dùng từ 25 đến 168 giờ liên tiếp. Dự báo trả ba phân vị P10, P50 và P90.
WINDOW_HOURS = 168  # Tối đa bảy ngày nhiệt độ theo giờ cho mỗi dự báo.
MIN_HOURS = 25  # Yêu cầu ít nhất 25 giờ liên tiếp ở mốc đầu vào.
ONE_HOUR = timedelta(hours=1)
BATCH_WINDOWS = 16  # Xử lý mỗi nhóm 16 mốc để kiểm thử trên CPU.
QUANTILES = (0.1, 0.5, 0.9)  # Hai cận P10, P90 và giá trị trung vị P50.
_load_lock = Lock()
_prediction_lock = Lock()
_model = None
_loaded_cache: Path | None = None


# [CHR-004] Kiểm tra thư viện đã cài mà chưa cần nạp PyTorch hay tải dữ liệu mô hình.
def check_runtime() -> None:
    if any(find_spec(package) is None for package in ("chronos", "huggingface_hub", "torch")):
        raise ImportError("Chạy python -m pip install -r requirements-ai.txt rồi khởi động lại Mây Việt.")


# [CHR-005] Chỉ báo có cache khi đúng snapshot đã có cả cấu hình lẫn trọng số.
def weights_cached(cache_dir: Path | None = None) -> bool:
    cache = (cache_dir or DEFAULT_CACHE_DIR).resolve()
    snapshot = cache / "models--autogluon--chronos-2-small" / "snapshots" / CHECKPOINT_REVISION
    return all((snapshot / name).is_file() for name in CHECKPOINT_FILES)


# [CHR-006] Dùng một bản mô hình đã nạp cho thư mục cache hiện tại. Khóa ngăn hai yêu cầu tải cùng lúc.
def _pipeline(cache_dir: Path | None, allow_download: bool):
    global _model, _loaded_cache
    cache = (cache_dir or DEFAULT_CACHE_DIR).resolve()
    with _load_lock:
        if _loaded_cache == cache and _model is not None:
            return _model
        check_runtime()
        if not weights_cached(cache) and not allow_download:
            raise ValueError("Hãy tải Chronos-2 Small trong khung mô hình trước khi dự báo.")

        try:
            import torch
            from chronos import Chronos2Pipeline
            from huggingface_hub import snapshot_download
        except (ImportError, OSError) as error:
            raise ImportError("Chưa nạp được thư viện Chronos hoặc PyTorch. Hãy kiểm tra cài đặt AI.") from error

        # [CHR-007] Tải các tệp cần thiết từ đúng phiên bản checkpoint khi được phép. Nếu có đủ cache, mở bản cục bộ.
        try:
            snapshot = snapshot_download(
                CHECKPOINT,
                revision=CHECKPOINT_REVISION,
                cache_dir=cache,
                allow_patterns=CHECKPOINT_FILES,
                local_files_only=weights_cached(cache),
                token=False,
            )
        except Exception as error:
            raise RuntimeError("Chưa tải được Chronos-2 Small từ Hugging Face. Kiểm tra kết nối và thử lại.") from error

        # [CHR-008] Giới hạn tối đa 4 luồng và nạp trọng số safetensors từ đĩa vào CPU.
        torch.set_num_threads(min(torch.get_num_threads(), 4))
        try:
            _model = Chronos2Pipeline.from_pretrained(
                snapshot, device_map="cpu", local_files_only=True, use_safetensors=True,
            )
        except (OSError, RuntimeError, ValueError) as error:
            raise RuntimeError("Chưa mở được checkpoint Chronos-2 Small đã tải.") from error
        _loaded_cache = cache
        return _model


# [CHR-009] Lấy các giờ liên tiếp đến mốc đầu vào. Nhiệt độ là chuỗi cần dự báo, các chỉ số khác là đầu vào quá khứ.
def _window(by_time: dict, anchor: datetime) -> dict:
    target = VARIABLES[0]
    history = []
    for lag in range(WINDOW_HOURS):
        row = by_time.get(anchor - lag * ONE_HOUR)
        if row is None or row[target] is None:
            break
        history.append(row)
    if len(history) < MIN_HOURS:
        raise ValueError(f"Chronos-2 Small cần ít nhất {MIN_HOURS} giờ nhiệt độ liên tiếp.")
    # [CHR-010] Đảo thứ tự về cũ đến mới rồi đưa các chuỗi về mảng float32 theo định dạng Chronos.
    history.reverse()
    values = {field: np.asarray([row[field] for row in history], dtype=np.float32) for field in VARIABLES}
    return {"target": values.pop(target), "past_covariates": values}


# [CHR-011] Dự báo một bước theo lô. Tắt cross-learning để mỗi mốc kiểm thử chỉ dùng cửa sổ quá khứ của chính nó.
def _forecast(pipeline, inputs: list[dict]) -> np.ndarray:
    with _prediction_lock:
        quantiles, _ = pipeline.predict_quantiles(
            inputs,
            prediction_length=1,
            quantile_levels=list(QUANTILES),
            batch_size=BATCH_WINDOWS * len(VARIABLES),
            context_length=WINDOW_HOURS,
            cross_learning=False,
        )
    # [CHR-012] Lấy ba phân vị cho giờ kế tiếp rồi kiểm tra kích thước và tính hữu hạn của kết quả.
    result = np.asarray([np.asarray(series)[0, 0] for series in quantiles], dtype=float)
    if result.shape != (len(inputs), len(QUANTILES)) or not np.isfinite(result).all():
        raise RuntimeError("Chronos-2 Small trả về dữ liệu dự báo không hợp lệ.")
    # [CHR-013] Giữ dự báo trung vị và sắp hai biên để khoảng dự báo luôn chứa trung vị.
    return np.column_stack((result.min(axis=1), result[:, 1], result.max(axis=1)))


# [CHR-014] Dùng checkpoint nguyên gốc trên các mốc kiểm thử Random Forest. Bước này không huấn luyện thêm Chronos.
def build_report(
    rows: list[dict],
    rf_artifact: dict,
    progress: Callable[[str], None] | None = None,
    *,
    cache_dir: Path | None = None,
) -> dict:
    """Kiểm thử nguyên checkpoint ở đúng các mốc dự báo của Random Forest."""
    rf_report, holdout = rf_artifact["report"], rf_artifact["holdout"]
    if not holdout:
        raise ValueError("Chưa có mốc kiểm thử Random Forest để so sánh.")
    target = VARIABLES[0]
    by_time = {hour(row["time"]): row for row in rows}
    # [CHR-015] Đối chiếu nhiệt độ thực và nhiệt độ giờ trước để tránh chấm trên phiên bản dữ liệu ERA5 khác.
    for reference in holdout:
        timestamp = hour(reference["time"])
        actual = by_time.get(timestamp, {}).get(target)
        previous = by_time.get(timestamp - ONE_HOUR, {}).get(target)
        if (actual is None or previous is None or not isclose(actual, reference["actual"], abs_tol=1e-8)
                or not isclose(previous, reference["baseline"], abs_tol=1e-8)):
            raise ValueError("Lịch sử ERA5 không khớp bộ kiểm thử. Hãy huấn luyện lại Random Forest.")

    if progress is not None:
        progress("Đang mở Chronos-2 Small. Lần đầu có thể tải khoảng 112 MB.")
    pipeline = _pipeline(cache_dir, allow_download=True)
    forecasts = []
    elapsed = 0.0
    # [CHR-016] Chia nhỏ bộ kiểm thử. Mỗi cửa sổ dừng trước giờ đích và thời gian đo chỉ tính phần gọi dự báo.
    for start in range(0, len(holdout), BATCH_WINDOWS):
        batch = holdout[start : start + BATCH_WINDOWS]
        inputs = [_window(by_time, hour(reference["time"]) - ONE_HOUR) for reference in batch]
        started = perf_counter()
        forecasts.extend(_forecast(pipeline, inputs))
        elapsed += perf_counter() - started
        if progress is not None:
            progress(f"Chronos-2 Small đã kiểm thử {len(forecasts):,}/{len(holdout):,} mốc giờ.")

    # [CHR-017] Tính sai số của dự báo trung vị, tỷ lệ nhiệt độ thực rơi vào khoảng P10–P90 và độ rộng trung bình.
    lower, predicted, upper = np.asarray(forecasts).T
    actual = np.asarray([row["actual"] for row in holdout])
    rf_predictions = np.asarray([row["predicted"] for row in holdout])
    baseline = np.asarray([row["baseline"] for row in holdout])
    last_rows = zip(holdout[-72:], lower[-72:], predicted[-72:], upper[-72:])
    return {
        "method": METHOD,
        "checkpoint": CHECKPOINT,
        "checkpoint_revision": CHECKPOINT_REVISION,
        "window_hours": WINDOW_HOURS,
        "min_hours": MIN_HOURS,
        "history_start": rf_report["history_start"],
        "history_end": rf_report["history_end"],
        "train_end_target": rf_report["train_end_target"],
        "test_start_target": holdout[0]["time"],
        "test_end_target": holdout[-1]["time"],
        "test_samples": len(holdout),
        "rf_test_samples": len(holdout),
        "metrics": scores(actual, predicted),
        "random_forest": scores(actual, rf_predictions),
        "baseline": scores(actual, baseline),
        "inference_seconds": elapsed,
        "interval_coverage": float(np.mean((lower <= actual) & (actual <= upper))),
        "interval_mean_width": float(np.mean(upper - lower)),
        "backtest": [
            {"time": row["time"], "actual": row["actual"], "predicted": float(median),
             "random_forest": row["predicted"], "baseline": row["baseline"],
             "lower": float(lo), "upper": float(hi)}
            for row, lo, median, hi in last_rows
        ],
    }


# [CHR-018] Chỉ dự báo sau khi báo cáo đúng phiên bản checkpoint và mốc đầu vào không nằm ở tương lai.
def predict_next(
    context: dict, report: dict, *, cache_dir: Path | None = None, allow_download: bool = False,
) -> dict:
    """Dự báo trực tiếp từ dữ liệu đến hết giờ `as_of`."""
    if not isinstance(context, dict):
        raise ValueError("Thiếu dữ liệu thời tiết theo giờ.")
    if report.get("checkpoint_revision") != CHECKPOINT_REVISION:
        raise ValueError("Checkpoint đã đổi phiên bản. Hãy kiểm thử lại Chronos-2 Small.")
    anchor = hour(context.get("as_of"))
    now = datetime.now(VN).replace(tzinfo=None)
    if anchor > now.replace(minute=0, second=0, microsecond=0):
        raise ValueError("Mốc dữ liệu đầu vào đang ở tương lai.")
    rows = rows_from_hourly(context, max_hours=240)
    by_time = {hour(row["time"]): row for row in rows}
    window = _window(by_time, anchor)
    base = by_time[anchor][VARIABLES[0]]
    pipeline = _pipeline(cache_dir, allow_download)
    started = perf_counter()
    # [CHR-019] Trả nhiệt độ giờ tới, hai biên dự báo, độ trễ dữ liệu và thời gian suy luận để giao diện hiển thị.
    lower, temperature, upper = map(float, _forecast(pipeline, [window])[0])
    return {
        "method": METHOD,
        "as_of": iso(anchor),
        "target_time": iso(anchor + ONE_HOUR),
        "input_temperature": base,
        "temperature": temperature,
        "delta": temperature - base,
        "stale": (now - anchor) > 2 * ONE_HOUR,
        "input_hours": len(window["target"]),
        "lower": lower,
        "upper": upper,
        "inference_seconds": perf_counter() - started,
    }
