"""Kiểm tra giao tiếp Chronos và ranh giới thời gian mà không cần tải checkpoint."""

import copy
import unittest
from datetime import datetime, timedelta
from unittest.mock import patch

import numpy as np

from weather_chronos import (
    BATCH_WINDOWS, CHECKPOINT_REVISION, MIN_HOURS, WINDOW_HOURS, build_report, predict_next,
)
from weather_ml import VARIABLES, iso


def fixture():
    start = datetime(2025, 1, 1)
    return [
        {"time": iso(start + timedelta(hours=i)), "temperature_2m": 25 + (i % 24) / 5,
         "relative_humidity_2m": 80 + i % 10, "surface_pressure": 1000 + i % 15,
         "wind_speed_10m": 5 + i % 6, "cloud_cover": 40 + i % 15}
        for i in range(210)
    ]


def reference(rows):
    holdout = [
        {"time": row["time"], "actual": row["temperature_2m"], "predicted": row["temperature_2m"] + 0.2,
         "baseline": previous["temperature_2m"]}
        for previous, row in zip(rows[174:-1], rows[175:])
    ]
    return {"report": {"train_end_target": rows[173]["time"], "history_start": rows[0]["time"],
                       "history_end": rows[-1]["time"]}, "holdout": holdout}


def context_from(rows, anchor):
    return {"as_of": anchor, "hourly": {field: [row[field] for row in rows]
                                        for field in ("time", *VARIABLES)}}


class StubPipeline:
    def __init__(self):
        self.calls = []

    def predict_quantiles(self, inputs, **kwargs):
        self.calls.append((inputs, kwargs))
        result = []
        for window in inputs:
            prediction = float(window["target"][-1]) + 0.1
            result.append(np.array([[[prediction - 0.5, prediction, prediction + 0.5]]]))
        return result, None


class ChronosTests(unittest.TestCase):
    def setUp(self):
        self.rows = fixture()
        self.pipeline = StubPipeline()
        self.patch = patch("weather_chronos._pipeline", return_value=self.pipeline)
        self.load = self.patch.start()
        self.addCleanup(self.patch.stop)

    def test_same_holdout_and_separate_past_only_windows(self):
        updates = []
        rf = reference(self.rows)
        report = build_report(self.rows, rf, updates.append)
        self.assertEqual(report["test_samples"], len(rf["holdout"]))
        self.assertEqual([row["time"] for row in report["backtest"]], [row["time"] for row in rf["holdout"]])
        self.assertAlmostEqual(report["random_forest"]["mae"], 0.2)
        self.assertEqual(report["checkpoint_revision"], CHECKPOINT_REVISION)
        self.assertIn(f"{len(rf['holdout'])}/{len(rf['holdout'])}", updates[-1])

        count = 0
        for inputs, options in self.pipeline.calls:
            self.assertLessEqual(len(inputs), BATCH_WINDOWS)
            self.assertEqual(options["prediction_length"], 1)
            self.assertEqual(options["quantile_levels"], [0.1, 0.5, 0.9])
            self.assertFalse(options["cross_learning"])
            for window in inputs:
                anchor = self.rows[174 + count]
                self.assertNotIn("future_covariates", window)
                self.assertAlmostEqual(float(window["target"][-1]), anchor["temperature_2m"], places=5)
                self.assertEqual(len(window["target"]), WINDOW_HOURS)
                for field in VARIABLES[1:]:
                    self.assertEqual(float(window["past_covariates"][field][-1]), anchor[field])
                count += 1
        self.assertEqual(count, len(rf["holdout"]))

    def test_live_inference_excludes_future_weather_and_requests_cache_only(self):
        anchor = 190
        report = {"checkpoint_revision": CHECKPOINT_REVISION}
        baseline = predict_next(context_from(self.rows, self.rows[anchor]["time"]), report)
        changed = copy.deepcopy(self.rows)
        for row in changed[anchor + 1:]:
            row["temperature_2m"] = 40
            row["relative_humidity_2m"] = 10
        alternate = predict_next(context_from(changed, self.rows[anchor]["time"]), report)
        self.assertEqual(baseline["target_time"], self.rows[anchor + 1]["time"])
        for key in ("temperature", "lower", "upper", "input_hours"):
            self.assertEqual(baseline[key], alternate[key])
        first_calls, second_calls = [inputs[0] for inputs, _ in self.pipeline.calls]
        for field in VARIABLES[1:]:
            np.testing.assert_array_equal(first_calls["past_covariates"][field],
                                          second_calls["past_covariates"][field])
        self.load.assert_called_with(None, False)

    def test_window_gaps_require_contiguous_temperatures(self):
        anchor = 190
        rows = copy.deepcopy(self.rows)
        rows[anchor + 1 - MIN_HOURS]["temperature_2m"] = None
        with self.assertRaisesRegex(ValueError, f"{MIN_HOURS} giờ"):
            predict_next(context_from(rows, rows[anchor]["time"]), {"checkpoint_revision": CHECKPOINT_REVISION})
        self.load.assert_not_called()

    def test_rejects_reference_from_other_weather_data(self):
        rf = reference(self.rows)
        self.rows[175]["temperature_2m"] = 45
        with self.assertRaisesRegex(ValueError, "không khớp"):
            build_report(self.rows, rf)
        self.load.assert_not_called()


if __name__ == "__main__":
    unittest.main()
