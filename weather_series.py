"""Holt–Winters cộng tính cho nhiệt độ giờ kế tiếp, với chu kỳ 24 giờ."""

from __future__ import annotations

from collections import defaultdict
from datetime import datetime, timedelta
from math import isclose

import numpy as np
from scipy.optimize import minimize

from weather_ml import LIMITS, VN, hour, iso, numeric, scores


METHOD = "Holt–Winters"
PERIOD_HOURS = 24
MIN_HOURS = 3 * PERIOD_HOURS
WINDOW_HOURS = 7 * PERIOD_HOURS
ONE_HOUR = timedelta(hours=1)


def _past_temperatures(by_time: dict, anchor: datetime) -> list[float]:
    """Lấy tối đa 7 ngày liên tiếp, kết thúc đúng giờ đang dự báo."""
    temperatures = []
    timestamp = anchor
    for _ in range(WINDOW_HOURS):
        value = by_time.get(timestamp)
        if value is None:
            break
        temperatures.append(value)
        timestamp -= ONE_HOUR
    return temperatures[::-1]


def _forecast(windows: np.ndarray, parameters: tuple[float, float, float]) -> np.ndarray:
    """Mỗi hàng là một cửa sổ nhiệt độ. Trả về một dự báo giờ kế tiếp mỗi hàng."""
    alpha, beta, gamma = parameters
    period = PERIOD_HOURS
    # Hai ngày đầu khởi tạo mức, xu hướng theo giờ và chu kỳ đã khử xu hướng.
    first = windows[:, :period]
    second = windows[:, period : 2 * period]
    trend = (second - first).mean(axis=1) / period
    initial = windows[:, : 2 * period] - trend[:, None] * np.arange(1 - 2 * period, 1)
    level = initial.mean(axis=1)
    seasonal = (initial[:, :period] + initial[:, period:]) / 2 - level[:, None]

    for i in range(2 * period, windows.shape[1]):
        observation = windows[:, i]
        slot = i % period
        previous_level = level
        level = alpha * (observation - seasonal[:, slot]) + (1 - alpha) * (level + trend)
        trend = beta * (level - previous_level) + (1 - beta) * trend
        seasonal[:, slot] = gamma * (observation - level) + (1 - gamma) * seasonal[:, slot]

    return level + trend + seasonal[:, windows.shape[1] % period]


def _group_windows(by_time: dict, targets, minimum: int = MIN_HOURS):
    groups = defaultdict(list)
    for target in targets:
        past = _past_temperatures(by_time, target - ONE_HOUR)
        if len(past) >= minimum and by_time.get(target) is not None:
            groups[len(past)].append((target, past))
    for group in groups.values():
        yield [target for target, _ in group], np.asarray([past for _, past in group])


def _fit_parameters(by_time: dict, latest_target: datetime) -> tuple[float, float, float]:
    targets = [timestamp for timestamp in by_time if timestamp <= latest_target]
    windows = list(_group_windows(by_time, targets, minimum=WINDOW_HOURS))
    if not windows:
        windows = list(_group_windows(by_time, targets))
    if not windows:
        raise ValueError(f"Dữ liệu huấn luyện cần ít nhất {MIN_HOURS + 1} giờ nhiệt độ liên tiếp.")
    training = [(np.asarray([by_time[t] for t in times]), values) for times, values in windows]

    def loss(parameters):
        return sum(np.sum((actual - _forecast(values, parameters)) ** 2) for actual, values in training)

    initial = (0.3, 0.05, 0.1)
    result = minimize(loss, initial, method="L-BFGS-B", bounds=[(0, 1)] * 3)
    if not np.isfinite(result.fun) or result.fun > loss(initial):
        return initial
    return float(result.x[0]), float(result.x[1]), float(result.x[2])


def build_report(rows: list[dict], rf_artifact: dict) -> dict:
    """Đối chiếu dự báo một giờ của hai mô hình tại các mốc kiểm thử chung."""
    rf_report, holdout = rf_artifact["report"], rf_artifact["holdout"]
    by_time = {hour(row["time"]): row["temperature_2m"] for row in rows}
    rf_by_time = {hour(row["time"]): row for row in holdout}
    for time, row in rf_by_time.items():
        current = by_time.get(time)
        previous = by_time.get(time - ONE_HOUR)
        if (current is None or previous is None or not isclose(current, row["actual"], abs_tol=1e-8)
                or not isclose(previous, row["baseline"], abs_tol=1e-8)):
            raise ValueError("Lịch sử ERA5 không khớp bộ kiểm thử. Hãy huấn luyện lại Random Forest.")

    # Giữ riêng tham số đánh giá (chỉ thấy train) và tham số dùng khi dự báo trực tiếp.
    train_end = hour(rf_report["train_end_target"])
    evaluation_parameters = _fit_parameters(by_time, train_end)
    estimates = {}
    for times, windows in _group_windows(by_time, rf_by_time):
        estimates.update(zip(times, _forecast(windows, evaluation_parameters)))

    backtest = [
        {"time": row["time"], "actual": row["actual"], "predicted": float(estimates[timestamp]),
         "random_forest": row["predicted"], "baseline": row["baseline"]}
        for timestamp, row in rf_by_time.items() if timestamp in estimates
    ]
    if not backtest:
        raise ValueError("Chưa có mốc kiểm thử nào đủ chuỗi nhiệt độ liên tiếp để so sánh hai mô hình.")
    actual = np.asarray([row["actual"] for row in backtest])
    parameters = _fit_parameters(by_time, max(by_time))
    return {
        "method": METHOD,
        "period_hours": PERIOD_HOURS,
        "min_hours": MIN_HOURS,
        "window_hours": WINDOW_HOURS,
        "history_start": rf_report["history_start"],
        "history_end": rf_report["history_end"],
        "train_end_target": rf_report["train_end_target"],
        "test_start_target": backtest[0]["time"],
        "test_end_target": backtest[-1]["time"],
        "test_samples": len(backtest),
        "rf_test_samples": len(holdout),
        "metrics": scores(actual, np.asarray([row["predicted"] for row in backtest])),
        "random_forest": scores(actual, np.asarray([row["random_forest"] for row in backtest])),
        "baseline": scores(actual, np.asarray([row["baseline"] for row in backtest])),
        "parameters": dict(zip(("alpha", "beta", "gamma"), parameters)),
        "backtest": backtest[-72:],
    }


def predict_next(context: dict, report: dict) -> dict:
    """Tính dự báo trực tiếp, chỉ cập nhật trạng thái bằng nhiệt độ đến mốc hiện tại."""
    if not isinstance(context, dict):
        raise ValueError("Thiếu dữ liệu nhiệt độ theo giờ.")
    anchor = hour(context.get("as_of"))
    now = datetime.now(VN).replace(tzinfo=None)
    if anchor > now.replace(minute=0, second=0, microsecond=0):
        raise ValueError("Mốc dữ liệu đầu vào đang ở tương lai.")

    hourly = context.get("hourly")
    times = hourly.get("time") if isinstance(hourly, dict) else None
    temperatures = hourly.get("temperature_2m") if isinstance(hourly, dict) else None
    if (not isinstance(times, list) or not isinstance(temperatures, list)
            or len(times) != len(temperatures) or not 1 <= len(times) <= 200):
        raise ValueError("Dữ liệu giờ và nhiệt độ phải là hai mảng cùng độ dài, tối đa 200 mốc.")
    timestamps = [hour(t) for t in times]
    if any(current <= previous for previous, current in zip(timestamps, timestamps[1:])):
        raise ValueError("Thời gian phải tăng và không trùng.")
    past = {timestamp: numeric(value, LIMITS[0]) for timestamp, value in zip(timestamps, temperatures)
            if timestamp <= anchor}
    window = _past_temperatures(past, anchor)
    if len(window) < MIN_HOURS:
        raise ValueError(f"Holt–Winters cần {MIN_HOURS} giờ liên tiếp có nhiệt độ đến mốc đầu vào.")
    parameters = report["parameters"]
    temperature = float(_forecast(np.asarray([window]), (parameters["alpha"], parameters["beta"],
                                                         parameters["gamma"]))[0])
    return {
        "method": METHOD,
        "as_of": iso(anchor),
        "target_time": iso(anchor + ONE_HOUR),
        "input_temperature": window[-1],
        "temperature": temperature,
        "delta": temperature - window[-1],
        "stale": (now - anchor).total_seconds() > 7200,
        "input_hours": len(window),
    }
