"""Kiểm tra Holt–Winters với chuỗi nhiệt độ tổng hợp chỉ dùng trong test."""

import copy
import math
import unittest
from datetime import datetime, timedelta

from weather_ml import iso
from weather_series import MIN_HOURS, build_report, predict_next


def series_fixture():
    start = datetime(2025, 1, 1)
    return [
        {"time": iso(start + timedelta(hours=index)),
         "temperature_2m": 27 + 4 * math.sin(math.tau * (index % 24) / 24) + 0.005 * index}
        for index in range(240)
    ]


def rf_fixture(rows):
    holdout = [
        {"time": current["time"], "actual": current["temperature_2m"],
         "predicted": current["temperature_2m"] + 0.2, "baseline": previous["temperature_2m"]}
        for previous, current in zip(rows[191:-1], rows[192:])
        if previous["temperature_2m"] is not None and current["temperature_2m"] is not None
    ]
    return {"report": {"train_end_target": rows[190]["time"], "history_start": rows[0]["time"],
                       "history_end": rows[-1]["time"]}, "holdout": holdout}


def context_from_rows(rows, anchor):
    return {"as_of": anchor, "hourly": {name: [row[name] for row in rows]
                                        for name in ("time", "temperature_2m")}}


class HoltWintersTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.rows = series_fixture()
        cls.rf = rf_fixture(cls.rows)
        cls.report = build_report(cls.rows, cls.rf)

    def test_learns_daily_seasonality_and_compares_same_timestamps(self):
        self.assertEqual(self.report["period_hours"], 24)
        self.assertEqual(self.report["test_samples"], len(self.rf["holdout"]))
        self.assertEqual([row["time"] for row in self.report["backtest"]],
                         [row["time"] for row in self.rf["holdout"]])
        self.assertLess(self.report["metrics"]["mae"], 0.001)
        self.assertAlmostEqual(self.report["random_forest"]["mae"], 0.2)

    def test_first_test_forecast_does_not_use_test_target_in_fit_or_input(self):
        rows = copy.deepcopy(self.rows)
        rows[192]["temperature_2m"] += 8
        changed = build_report(rows, rf_fixture(rows))
        before, after = self.report["backtest"][0], changed["backtest"][0]
        self.assertAlmostEqual(before["predicted"], after["predicted"])
        self.assertAlmostEqual(after["actual"] - before["actual"], 8)

    def test_missing_temperature_uses_common_metric_dates(self):
        rows = copy.deepcopy(self.rows)
        rows[201]["temperature_2m"] = None
        rf = rf_fixture(rows)
        report = build_report(rows, rf)
        self.assertEqual(report["rf_test_samples"], len(rf["holdout"]))
        self.assertEqual(report["test_samples"], 9)
        self.assertEqual(report["test_end_target"], rows[200]["time"])

    def test_refuses_historical_rows_that_do_not_match_rf_holdout(self):
        rows = copy.deepcopy(self.rows)
        rows[200]["temperature_2m"] += 10
        with self.assertRaisesRegex(ValueError, "không khớp"):
            build_report(rows, self.rf)

    def test_live_forecast_uses_only_temperature_until_anchor(self):
        context = context_from_rows(self.rows[120:197], self.rows[191]["time"])
        before = predict_next(context, self.report)
        context["hourly"]["temperature_2m"][-5:] = [60] * 5
        after = predict_next(context, self.report)
        self.assertEqual(before, after)
        self.assertEqual(before["input_hours"], MIN_HOURS)
        self.assertEqual(before["target_time"], self.rows[192]["time"])
        self.assertAlmostEqual(before["temperature"], self.rows[192]["temperature_2m"])

    def test_live_forecast_requires_consecutive_valid_hours(self):
        context = context_from_rows(self.rows[110:192], self.rows[191]["time"])
        context["hourly"]["temperature_2m"][20] = None
        with self.assertRaisesRegex(ValueError, rf"{MIN_HOURS} giờ liên tiếp"):
            predict_next(context, self.report)


if __name__ == "__main__":
    unittest.main()
