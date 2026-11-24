"""Histogram Gradient Boosting dự báo biến thiên nhiệt độ sau một giờ."""

# [GB-001] File này dùng lại dữ liệu của Random Forest để huấn luyện và đánh giá Gradient Boosting, rồi dự báo trên dữ liệu mới.
from __future__ import annotations

from datetime import datetime, timedelta
from time import perf_counter

import numpy as np
from sklearn.ensemble import HistGradientBoostingRegressor
from threadpoolctl import threadpool_limits

from weather_ml import VN, _features_at, hour, iso, rows_from_hourly, scores, supervised


METHOD = "HistGradientBoostingRegressor"
# [GB-002] Dùng sai số tuyệt đối để huấn luyện. Ba tham số tiếp theo giới hạn tốc độ học, số vòng lặp và độ lớn của từng cây.
PARAMETERS = {
    "loss": "absolute_error",  # Huấn luyện theo độ lớn sai số, tính bằng °C.
    "max_iter": 300,  # Số vòng xây cây để sửa sai số còn lại.
    "learning_rate": 0.05,  # Mỗi cây mới chỉ góp một phần nhỏ vào kết quả.
    "max_leaf_nodes": 31,  # Giới hạn số lá của mỗi cây.
    # [GB-003] Huấn luyện đủ số vòng đã chọn. Kết quả kiểm thử theo thời gian được tính riêng bên dưới.
    "early_stopping": False,
    "random_state": 42,  # Cố định hạt giống để dễ chạy lại thí nghiệm.
}
ONE_HOUR = timedelta(hours=1)


# [GB-004] Tạo báo cáo kiểm thử và trả về mô hình đã học để dịch vụ lưu cho lần dự báo sau.
def build_report(rows: list[dict], rf_artifact: dict) -> tuple[dict, HistGradientBoostingRegressor]:
    """Giữ nguyên đặc trưng, khoảng đệm và mốc kiểm thử của Random Forest."""
    rf_report, reference = rf_artifact["report"], rf_artifact["holdout"]
    # [GB-005] Tái sử dụng cùng 25 đặc trưng. Nhãn học là mức chênh nhiệt độ, còn nhiệt độ gốc dùng để đổi kết quả về °C.
    features, deltas, bases, anchors = supervised(rows)
    train_stop = rf_report["train_samples"]
    test_start = len(features) - len(reference)
    disagreement = "Lịch sử ERA5 không khớp bộ kiểm thử bảng so sánh. Hãy huấn luyện lại Random Forest."
    if not reference or not 0 < train_stop < test_start < len(features):
        raise ValueError(disagreement)

    # [GB-006] Đối chiếu cả giờ, nhiệt độ thực và mốc đối chứng để chắc rằng hai mô hình được chấm trên đúng cùng dữ liệu.
    train_end = iso(hour(anchors[train_stop - 1]) + ONE_HOUR)
    test_times = [iso(hour(anchor) + ONE_HOUR) for anchor in anchors[test_start:]]
    actual = bases[test_start:] + deltas[test_start:]
    if (train_end != rf_report["train_end_target"]
            or anchors[test_start] != rf_report["test_start_anchor"]
            or test_times != [row["time"] for row in reference]
            or not np.allclose(actual, [row["actual"] for row in reference], rtol=0, atol=1e-8)
            or not np.allclose(bases[test_start:], [row["baseline"] for row in reference], rtol=0, atol=1e-8)):
        raise ValueError(disagreement)

    # [GB-007] Tách mô hình chấm điểm khỏi mô hình triển khai để dữ liệu kiểm thử không ảnh hưởng điểm đánh giá.
    evaluation_model = HistGradientBoostingRegressor(**PARAMETERS)
    fitted_model = HistGradientBoostingRegressor(**PARAMETERS)
    started = perf_counter()
    # [GB-008] Giới hạn số luồng OpenMP. Cộng dự báo mức chênh vào nhiệt độ gốc trước khi tính sai số.
    with threadpool_limits(limits=4, user_api="openmp"):
        evaluation_model.fit(features[:train_stop], deltas[:train_stop])
        evaluation_started = perf_counter()
        predictions = bases[test_start:] + evaluation_model.predict(features[test_start:])
        evaluation_seconds = perf_counter() - evaluation_started
        # Mô hình dùng trực tiếp học thêm từ lịch sử đã có sau khi chốt điểm kiểm thử.
        fitted_model.fit(features, deltas)
    training_seconds = perf_counter() - started - evaluation_seconds

    # [GB-009] Ghép từng dự báo với nhiệt độ thực, Random Forest và cách lấy nhiệt độ hiện tại cho giờ sau.
    backtest = [
        {"time": row["time"], "actual": float(observation), "predicted": float(prediction),
         "random_forest": row["predicted"], "baseline": row["baseline"]}
        for row, observation, prediction in zip(reference, actual, predictions)
    ]
    # [GB-010] Báo cáo lưu điểm trên toàn bộ tập kiểm thử cùng tối đa 72 mốc cuối cho biểu đồ.
    report = {
        "method": METHOD,
        "history_start": rf_report["history_start"],
        "history_end": rf_report["history_end"],
        "train_end_target": train_end,
        "test_start_anchor": anchors[test_start],
        "test_start_target": test_times[0],
        "test_end_target": test_times[-1],
        "test_samples": len(reference),
        "metrics": scores(actual, predictions),
        "random_forest": scores(actual, np.asarray([row["predicted"] for row in reference])),
        "baseline": scores(actual, bases[test_start:]),
        "parameters": dict(PARAMETERS),
        "training_seconds": training_seconds,
        "evaluation_seconds": evaluation_seconds,
        "backtest": backtest[-72:],
    }
    return report, fitted_model


# [GB-011] Nhận dữ liệu Open-Meteo theo giờ và dùng mô hình đã lưu để dự báo giờ kế tiếp.
def predict_next(context: dict, fitted_model: HistGradientBoostingRegressor, report: dict) -> dict:
    if not isinstance(context, dict):
        raise ValueError("Thiếu dữ liệu thời tiết theo giờ.")
    anchor = hour(context.get("as_of"))
    now = datetime.now(VN).replace(tzinfo=None)
    if anchor > now.replace(minute=0, second=0, microsecond=0):
        raise ValueError("Mốc đầu vào đang ở tương lai; hãy kiểm tra thời gian nguồn dữ liệu.")

    # [GB-012] Xác thực các mảng theo giờ rồi lấy 25 giờ liên tiếp kết thúc tại mốc đầu vào.
    rows = rows_from_hourly(context, max_hours=200)
    by_time = {hour(row["time"]): row for row in rows}
    features = _features_at(by_time, anchor)
    if features is None:
        raise ValueError("Gradient Boosting cần 25 giờ liên tiếp có đủ các chỉ số thời tiết.")

    # [GB-013] Chuyển dự báo chênh lệch về nhiệt độ tuyệt đối và đánh dấu dữ liệu đầu vào quá hai giờ.
    previous = by_time[anchor]["temperature_2m"]
    with threadpool_limits(limits=4, user_api="openmp"):
        delta = float(fitted_model.predict(features.reshape(1, -1))[0])
    return {
        "method": report["method"],
        "as_of": iso(anchor),
        "target_time": iso(anchor + ONE_HOUR),
        "input_temperature": previous,
        "temperature": previous + delta,
        "delta": delta,
        "stale": (now - anchor).total_seconds() > 7200,
    }
