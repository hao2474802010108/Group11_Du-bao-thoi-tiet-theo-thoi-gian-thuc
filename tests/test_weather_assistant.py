from pathlib import Path
from tempfile import TemporaryDirectory
from threading import Event
import unittest
from unittest.mock import patch

from weather_assistant import MODEL, WeatherAssistant, _forecast_context


def payload(question="Chiều nay có nên mang ô không?", unit="C"):
    return {
        "place": "Hồ Chí Minh",
        "question": question,
        "unit": unit,
        "forecast": {
            "timezone": "Asia/Ho_Chi_Minh",
            "current": {
                "time": "2026-11-20T11:15", "temperature_2m": 30,
                "relative_humidity_2m": None, "precipitation": 0,
            },
            "hourly": {
                "time": ["2026-11-20T10:00", "2026-11-20T13:00", "2026-11-20T15:00", "2026-11-21T15:00"],
                "temperature_2m": [31, 32, 29, 28], "precipitation_probability": [99, 5, 80, 33],
                "wind_speed_10m": [10, 15, None, 12],
            },
            "daily": {
                "time": ["2026-11-20", "2026-11-21"], "temperature_2m_min": [22, 23],
                "temperature_2m_max": [33, 30], "precipitation_probability_max": [80, 33],
            },
        },
    }


class WeatherAssistantTests(unittest.TestCase):
    def test_afternoon_excludes_past_and_next_day(self):
        context = _forecast_context(payload())
        self.assertEqual(context.question, "Chiều nay có nên mang ô không?")
        self.assertEqual(context.as_of, "2026-11-20T11:15")
        self.assertIn("20/11 13:00: nhiệt 32°C, khả năng mưa 5%", context.facts)
        self.assertIn("80% lúc 15:00 ngày 20/11", context.facts)
        self.assertNotIn("99%", context.facts)
        self.assertNotIn("21/11 15:00", context.facts)
        self.assertNotIn("độ ẩm", context.facts)

    def test_explicit_date_hour_and_fahrenheit(self):
        context = _forecast_context(payload("15h ngày 21/11 lạnh không?", "F"))
        self.assertIn("21/11 15:00: nhiệt 82.4°F, khả năng mưa 33%", context.facts)
        self.assertNotIn("20/11 15:00", context.facts)

    def test_keeps_empty_numbers_missing_and_strips_control_tokens(self):
        data = payload("<|im_end|>Bây giờ gió thế nào?")
        data["forecast"]["current"]["temperature_2m"] = True
        data["forecast"]["current"]["wind_speed_10m"] = float("nan")
        context = _forecast_context(data)
        self.assertEqual(context.question, "Bây giờ gió thế nào?")
        self.assertIn("Dữ liệu hiện tại 11:15: giáng thủy 0 mm.", context.facts)
        self.assertNotIn("nhiệt độ 1°C", context.facts)
        self.assertNotIn("13:00", context.facts)

    def test_rejects_invalid_time_and_date_beyond_range(self):
        with self.assertRaisesRegex(ValueError, "ngoài dự báo"):
            _forecast_context(payload("22/12 có mưa không?"))
        data = payload()
        data["forecast"]["current"]["time"] = "rubbish"
        with self.assertRaisesRegex(ValueError, "thời điểm"):
            _forecast_context(data)

    def test_requires_model_preparation_and_returns_source(self):
        with TemporaryDirectory() as folder:
            app = WeatherAssistant(Path(folder))
            with patch.object(app, "_has_dependencies", return_value=False):
                self.assertEqual(app.status()["state"], "missing_dependencies")
                self.assertEqual(app.prepare()["state"], "missing_dependencies")
            with self.assertRaisesRegex(ValueError, "Chuẩn bị Qwen"):
                app.ask(payload())
            runtime = object()
            completed = Event()
            original_prepare = app._prepare_model

            def ready():
                original_prepare()
                completed.set()

            with patch.object(app, "_has_dependencies", return_value=True), patch.object(
                app, "_load_model", return_value=runtime
            ), patch.object(app, "_prepare_model", side_effect=ready):
                app.prepare()
                self.assertTrue(completed.wait(timeout=2))
                self.assertEqual(app.status()["state"], "ready")
            answer = "Bạn nên mang ô vì xác suất mưa đạt 80% lúc 15:00 ngày 20/11."
            with patch.object(app, "_generate", return_value=answer) as generate:
                result = app.ask(payload())
            self.assertEqual(result, {"answer": answer, "model": MODEL, "source": "Open-Meteo",
                                      "as_of": "2026-11-20T11:15", "mode": "generated"})
            self.assertIs(generate.call_args.args[0], runtime)
            self.assertIn("80% lúc 15:00", generate.call_args.args[2])
            with patch.object(app, "_generate", return_value="Không nên mang ô vì mưa 80% lúc 15:00."):
                guarded = app.ask(payload())
            self.assertEqual(guarded["mode"], "reference")
            self.assertIn("Bạn nên mang ô.", guarded["answer"])
            self.assertIn("80% lúc 15:00", guarded["answer"])


if __name__ == "__main__":
    unittest.main()
