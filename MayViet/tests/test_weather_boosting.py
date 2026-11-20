"""Kiểm tra phép đối chiếu Gradient Boosting với bộ kiểm thử Random Forest."""

import copy
import unittest

from sklearn.ensemble import HistGradientBoostingRegressor

import weather_ml as ml
from test_weather_ml import fixture, payload
from weather_boosting import build_report, predict_next


class GradientBoostingTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.rows = fixture()
        source = {"provider": "UNIT TEST", "url": "https://example.invalid"}
        cls.reference = ml.fit_model(cls.rows, 10.78, 106.7, source, trees=8)
        cls.report, cls.model = build_report(cls.rows, cls.reference)

    def test_uses_same_holdout_as_random_forest(self):
        reference_report = self.reference["report"]
        self.assertIsInstance(self.model, HistGradientBoostingRegressor)
        self.assertEqual(self.model.n_features_in_, len(ml.FEATURE_NAMES))
        for name in ("train_end_target", "test_start_target", "test_end_target", "test_samples", "baseline"):
            self.assertEqual(self.report[name], reference_report[name])
        self.assertEqual(self.report["random_forest"], reference_report["metrics"])
        self.assertEqual(
            [row["time"] for row in self.report["backtest"]],
            [row["time"] for row in self.reference["holdout"][-72:]],
        )

    def test_live_prediction_ignores_future_weather(self):
        context = payload(self.rows[100:127], self.rows[124]["time"])
        first = predict_next(context, self.model, self.report)
        context["hourly"]["temperature_2m"][-2:] = [-75, 60]
        context["hourly"]["relative_humidity_2m"][-2:] = [1, 99]
        self.assertEqual(first, predict_next(context, self.model, self.report))
        self.assertEqual(first["target_time"], self.rows[125]["time"])
        self.assertAlmostEqual(first["temperature"], first["input_temperature"] + first["delta"])

    def test_mismatched_holdout_is_rejected(self):
        reference = copy.deepcopy(self.reference)
        reference["holdout"][0]["actual"] += 2
        with self.assertRaisesRegex(ValueError, "không khớp"):
            build_report(self.rows, reference)


if __name__ == "__main__":
    unittest.main()
