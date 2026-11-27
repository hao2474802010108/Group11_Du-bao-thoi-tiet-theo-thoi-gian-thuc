"""Tính bảng và hình báo cáo từ các mô hình đã đánh giá trên cùng tập kiểm thử."""

from __future__ import annotations

import argparse
import csv
import json
import math
import os
from pathlib import Path

import numpy as np
from sklearn.ensemble import HistGradientBoostingRegressor, RandomForestRegressor
from sklearn.linear_model import LinearRegression
from threadpoolctl import threadpool_limits

from weather_ml import MLService, hour, iso, location, scores, supervised
from weather_series import _fit_parameters, _forecast, _group_windows


LABELS = {
    "rf": "Random Forest",
    "gb": "Gradient Boosting",
    "chronos": "Chronos-2 Small",
    "hw": "Holt–Winters",
    "persistence": "Persistence",
}
DM_PAIRS = [("rf", "gb"), ("rf", "hw"), ("gb", "hw"), ("rf", "persistence"), ("hw", "persistence")]


def read_report(root: Path, key: str, method: str) -> dict:
    with (root / "models" / f"{key}.{method}.json").open(encoding="utf-8") as file:
        return json.load(file)["report"]


def benchmark_row(metrics: dict, reference_mae: float) -> dict:
    return {**metrics, "reduction": 100 * (reference_mae - metrics["mae"]) / reference_mae}


def distribution(actual: np.ndarray, predicted: np.ndarray) -> dict:
    errors = predicted - actual
    absolute = np.abs(errors)
    median, p90, p99 = (float(value) for value in np.quantile(absolute, [0.5, 0.9, 0.99]))
    return {"median": median, "p90": p90, "p99": p99, "max": float(absolute.max()), "bias": float(errors.mean())}


def dm_result(left: np.ndarray, right: np.ndarray, lag: int = 24) -> tuple[float, float, float]:
    """Kiểm định hai phía với sai số tuyệt đối, HAC Newey–West và trọng số Bartlett."""
    differences = left - right
    mean = float(differences.mean())
    centered = differences - mean
    count = len(centered)
    variance = float(centered @ centered / count)
    for k in range(1, min(lag, count - 1) + 1):
        variance += float(2 * (1 - k / (lag + 1)) * (centered[k:] @ centered[:-k]) / count)
    if variance <= 0:
        raise ValueError("Phương sai dài hạn không dương trong kiểm định Diebold–Mariano.")
    statistic = mean / math.sqrt(variance / count)
    return mean, statistic, math.erfc(abs(statistic) / math.sqrt(2))


def ablation_results(features, delta, base, actual, train_stop, test_start, rf_parameters, rf_metrics):
    """Giữ cách chia và tham số RF đã chọn ở validation khi kiểm tra từng biến thể."""
    ref_mae = rf_metrics["mae"]
    results = {"full": {"n_features": features.shape[1], **rf_metrics, "increase": 0.0}}
    # Cột 0–12 dùng nhiệt độ, 13–20 dùng khí tượng, 21–24 mã hóa chu kỳ lịch.
    variants = {
        "direct": features,
        "no_weather": features[:, [*range(13), *range(21, 25)]],
        "no_calendar": features[:, :21],
        "temp_only": features[:, :13],
        "linear": features,
    }
    for name, columns in variants.items():
        if name == "linear":
            model = LinearRegression()
        else:
            model = RandomForestRegressor(**rf_parameters)
        learn_delta = name != "direct"
        target = delta if learn_delta else base + delta
        model.fit(columns[:train_stop], target[:train_stop])
        predicted = model.predict(columns[test_start:])
        if learn_delta:
            predicted = predicted + base[test_start:]
        metrics = scores(actual, predicted)
        results[name] = {
            "n_features": columns.shape[1], **metrics, "increase": 100 * (metrics["mae"] - ref_mae) / ref_mae,
        }
    return results


def evaluate(root: Path, latitude: float, longitude: float):
    key, _, _ = location(latitude, longitude)
    service = MLService(root)
    rows, _ = service.history(key)
    artifact = service.load(key)
    if artifact is None:
        raise ValueError("Cần mô hình Random Forest đã chạy bằng phiên bản thư viện phù hợp.")
    rf = artifact["report"]
    gb = read_report(root, key, "gradient-boosting")
    hw = read_report(root, key, "time-series")
    chronos = read_report(root, key, "chronos")
    if "validation" not in rf or "validation" not in gb:
        raise ValueError("Hãy tạo báo cáo Random Forest và Gradient Boosting theo quy trình validation trước.")

    features, delta, base, anchors = supervised(rows)
    train_stop, test_start = rf["train_samples"], len(features) - rf["test_samples"]
    holdout = artifact["holdout"]
    dates = [hour(row["time"]) for row in holdout]
    actual = np.asarray([row["actual"] for row in holdout])
    persistence = np.asarray([row["baseline"] for row in holdout])
    if anchors[test_start] != rf["test_start_anchor"]:
        raise ValueError("Lịch sử giờ của tập kiểm thử đã thay đổi.")
    np.testing.assert_allclose(actual, base[test_start:] + delta[test_start:], atol=1e-8, rtol=0)
    np.testing.assert_allclose(persistence, base[test_start:], atol=1e-8, rtol=0)
    for record in (gb, hw, chronos):
        if (record["test_samples"] != len(dates) or record["test_start_target"] != holdout[0]["time"]
                or record["test_end_target"] != holdout[-1]["time"]):
            raise ValueError(f"Mốc kiểm thử của {record['method']} không khớp với Random Forest.")

    # Dùng lại cấu hình Gradient Boosting đã chọn, chỉ học trên phần 80% đầu để dựng dự báo đánh giá.
    with threadpool_limits(limits=4, user_api="openmp"):
        gb_evaluation = HistGradientBoostingRegressor(**gb["parameters"])
        gb_evaluation.fit(features[:train_stop], delta[:train_stop])
        gb_predictions = base[test_start:] + gb_evaluation.predict(features[test_start:])
    by_time = {hour(row["time"]): row["temperature_2m"] for row in rows}
    hw_evaluation_parameters = _fit_parameters(by_time, hour(rf["train_end_target"]))
    hw_by_time = {}
    for times, windows in _group_windows(by_time, dates):
        hw_by_time.update(zip(times, _forecast(windows, hw_evaluation_parameters)))
    predictions = {
        "rf": np.asarray([row["predicted"] for row in holdout]),
        "gb": gb_predictions,
        "hw": np.asarray([hw_by_time[date] for date in dates]),
        "persistence": persistence,
    }
    metrics = {name: scores(actual, values) for name, values in predictions.items()}
    for name, record in (("rf", rf), ("gb", gb), ("hw", hw)):
        for metric, value in metrics[name].items():
            if not math.isclose(value, record["metrics"][metric], abs_tol=1e-10):
                raise ValueError(f"{name} {metric} tính lại khác báo cáo đã lưu. Cần kiểm tra phiên bản thư viện.")
    metrics["chronos"] = chronos["metrics"]
    chronos_backtest = {hour(row["time"]): row for row in chronos["backtest"]}
    if list(chronos_backtest) != dates[-72:]:
        raise ValueError("72 mốc Chronos cuối không khớp thời điểm kiểm thử.")
    np.testing.assert_allclose([row["actual"] for row in chronos_backtest.values()], actual[-72:], atol=1e-8, rtol=0)

    absolute_errors = {name: np.abs(actual - values) for name, values in predictions.items()}
    hours = np.asarray([date.hour for date in dates])
    months = np.asarray([date.strftime("%Y-%m") for date in dates])
    monthly = []
    for month in sorted(set(months)):
        group = months == month
        monthly.append({"month": month, "count": int(group.sum()), **{
            name: float(errors[group].mean()) for name, errors in absolute_errors.items()
        }})
    hourly = {
        name: [float(errors[hours == h].mean()) if np.any(hours == h) else None for h in range(24)]
        for name, errors in absolute_errors.items()
    }
    dm = []
    for left, right in DM_PAIRS:
        diff, stat, p = dm_result(absolute_errors[left], absolute_errors[right])
        dm.append({"a": left, "b": right, "diff": diff, "stat": stat, "p": p})
    params = {**rf["parameters"], "n_jobs": min(4, os.cpu_count() or 1)}
    ablations = ablation_results(features, delta, base, actual, train_stop, test_start, params, metrics["rf"])

    recent_predictions = {name: values[-72:] for name, values in predictions.items()}
    recent_predictions["chronos"] = np.asarray([row["predicted"] for row in chronos_backtest.values()])
    largest_recent = {}
    for name, values in recent_predictions.items():
        errors = np.abs(actual[-72:] - values)
        index = int(errors.argmax())
        largest_recent[name] = {"time": iso(dates[-72 + index]), "absolute_error": float(errors[index])}
    cases = {}
    for stamp in ("2026-11-02T07:00", "2026-11-03T14:00"):
        date = hour(stamp)
        if date in chronos_backtest:
            index = dates.index(date)
            cases[stamp] = {"actual": float(actual[index]), "chronos": chronos_backtest[date]["predicted"], **{
                name: float(values[index]) for name, values in predictions.items()
            }}
    analysis = {
        "split": {name: rf[name] for name in (
            "raw_rows", "supervised_samples", "train_samples", "test_samples", "gap_samples", "history_start",
            "history_end", "train_start", "train_end_target", "test_start_target", "test_end_target",
        )},
        "validation": {"rf": rf["validation"], "gb": gb["validation"]},
        "parameters": {"rf": rf["parameters"], "gb": gb["parameters"], "hw": hw["parameters"],
                       "chronos": {name: chronos[name] for name in ("checkpoint", "checkpoint_revision", "window_hours")}},
        "benchmark": {name: benchmark_row(row, metrics["persistence"]["mae"]) for name, row in metrics.items()},
        "distributions": {name: distribution(actual, values) for name, values in predictions.items()},
        "monthly": monthly, "hourly": hourly, "dm": dm, "ablations": ablations,
        "importance": rf["feature_importance"], "examples": cases, "largest_recent": largest_recent,
        "chronos": {name: chronos[name] for name in (
            "interval_coverage", "interval_mean_width", "inference_seconds", "test_samples",
        )},
        "timings": {"rf": {"training_seconds": rf["training_seconds"]}, "gb": {
            "training_seconds": gb["training_seconds"], "evaluation_seconds": gb["evaluation_seconds"],
        }},
    }
    return analysis, dates, actual, predictions, chronos_backtest


def write_predictions(path: Path, dates, actual, predictions, chronos):
    # Các mốc ngoài đoạn Chronos đã lưu có ô trống vì báo cáo lưu 72 giá trị dự báo cuối.
    with path.open("w", encoding="utf-8-sig", newline="") as file:
        writer = csv.writer(file)
        writer.writerow(["time", "era5", *predictions, "chronos", "chronos_lower", "chronos_upper"])
        for i, date in enumerate(dates):
            item = chronos.get(date, {})
            writer.writerow([iso(date), actual[i], *(values[i] for values in predictions.values()),
                             item.get("predicted"), item.get("lower"), item.get("upper")])


def plot_figures(directory: Path, analysis, dates, actual, predictions, chronos):
    # Chỉ cần matplotlib khi tái tạo hình, các lệnh dự báo của ứng dụng dùng bộ thư viện riêng.
    import matplotlib

    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    from matplotlib.dates import DateFormatter
    from matplotlib.ticker import FuncFormatter

    directory.mkdir(parents=True, exist_ok=True)
    plt.rcParams.update({"font.family": "DejaVu Sans", "font.size": 12, "savefig.dpi": 240})
    colors = {"rf": "#2072ba", "gb": "#ad551e", "hw": "#b85031", "chronos": "#16846c", "persistence": "#666666"}
    styles = {"rf": "--", "gb": ":", "hw": "--", "chronos": "-.", "persistence": "-"}

    def save(fig, ax, number):
        ax.spines[["top", "right"]].set_visible(False)
        ax.grid(axis="y", color="#dedede", linewidth=0.7)
        ax.set_axisbelow(True)
        fig.savefig(directory / f"figure-{number}.png", facecolor="white")
        plt.close(fig)

    fig, ax = plt.subplots(figsize=(6, 6 * 488 / 726), layout="constrained")
    recent = dates[-72:]
    ax.plot(recent, actual[-72:], color="#202020", linewidth=1.55, label="ERA5 tham chiếu")
    for name in ("rf", "hw"):
        ax.plot(recent, predictions[name][-72:], color=colors[name], linestyle=styles[name], linewidth=1.45, label=LABELS[name])
    ax.plot(recent, [row["predicted"] for row in chronos.values()], color=colors["chronos"],
            linestyle=styles["chronos"], linewidth=1.45, label="Chronos-2 (trung vị)")
    ax.fill_between(recent, [row["lower"] for row in chronos.values()], [row["upper"] for row in chronos.values()],
                    color=colors["chronos"], alpha=0.16, linewidth=0, label="Chronos-2 P10–P90")
    ax.set_xticks(recent[::12])
    ax.xaxis.set_major_formatter(DateFormatter("%H:%M\n%d/%m"))
    ax.set_ylabel("Nhiệt độ (°C)")
    ax.legend(loc="lower left", bbox_to_anchor=(0, 1.0), ncol=2, fontsize=10, frameon=False, borderaxespad=0)
    save(fig, ax, 3)

    fig, ax = plt.subplots(figsize=(6, 6 * 455 / 726), layout="constrained")
    for name, style in (("rf", "--"), ("gb", ":"), ("hw", "-."), ("persistence", "-")):
        color = "#16846c" if name == "hw" else colors[name]
        ax.plot(range(24), analysis["hourly"][name], color=color, linestyle=style,
                linewidth=1.5, marker="o", markersize=3, label=LABELS[name])
    ax.set_xticks(range(0, 24, 3))
    ax.set_xlabel("Giờ trong ngày của mốc dự báo (GMT+7)")
    ax.set_ylabel("MAE (°C)")
    ax.set_ylim(bottom=0)
    ax.yaxis.set_major_formatter(FuncFormatter(lambda value, _: f"{value:g}".replace(".", ",")))
    ax.legend(loc="lower left", bbox_to_anchor=(0, 1.0), ncol=2, fontsize=10, frameon=False, borderaxespad=0)
    save(fig, ax, 4)

    fig, ax = plt.subplots(figsize=(6, 6 * 477 / 726), layout="constrained")
    importance = analysis["importance"][:10]
    ax.barh([item["name"] for item in importance], [item["value"] for item in importance], color=colors["rf"])
    ax.invert_yaxis()
    ax.bar_label(ax.containers[0], labels=[f"{item['value']:.3f}".replace(".", ",") for item in importance],
                 padding=4, fontsize=10)
    ax.set_xlim(0, max(item["value"] for item in importance) * 1.25)
    ax.set_xlabel("Độ quan trọng MDI")
    ax.tick_params(axis="y", labelsize=9.5)
    ax.xaxis.set_major_formatter(FuncFormatter(lambda value, _: f"{value:g}".replace(".", ",")))
    ax.spines[["top", "right"]].set_visible(False)
    ax.grid(axis="x", color="#dedede", linewidth=0.7)
    ax.set_axisbelow(True)
    fig.savefig(directory / "figure-5.png", facecolor="white")
    plt.close(fig)


def main():
    parser = argparse.ArgumentParser(description="Tái lập bảng và hình trong báo cáo Mây Việt.")
    root = Path(__file__).resolve().parent
    parser.add_argument("--latitude", type=float, default=10.78)
    parser.add_argument("--longitude", type=float, default=106.70)
    parser.add_argument("--output-dir", type=Path, default=root / "reports" / "validation_analysis")
    parser.add_argument("--figures-dir", type=Path, help="Thư mục lưu hình PNG nếu đã cài matplotlib.")
    args = parser.parse_args()
    analysis, dates, actual, predictions, chronos = evaluate(root, args.latitude, args.longitude)
    args.output_dir.mkdir(parents=True, exist_ok=True)
    (args.output_dir / "analysis.json").write_text(
        json.dumps(analysis, ensure_ascii=False, indent=2, allow_nan=False) + "\n", encoding="utf-8",
    )
    write_predictions(args.output_dir / "holdout_predictions.csv", dates, actual, predictions, chronos)
    if args.figures_dir is not None:
        plot_figures(args.figures_dir, analysis, dates, actual, predictions, chronos)


if __name__ == "__main__":
    main()
