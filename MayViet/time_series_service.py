"""Chạy các phương pháp dự báo trên cùng bộ kiểm thử, theo từng địa điểm."""

from __future__ import annotations

import hashlib
import io
import json
import threading
import time
from pathlib import Path

import joblib
from sklearn import __version__ as sklearn_version

from weather_ml import MLService, atomic_bytes, json_bytes, location
from weather_series import build_report, predict_next


class TimeSeriesService:
    def __init__(
        self, random_forest: MLService, *, slug="time-series", name="Holt–Winters",
        builder=build_report, predictor=predict_next, store_estimator=False,
        runtime_check=None, training_verb="huấn luyện", report_progress=False,
    ) -> None:
        self.random_forest = random_forest
        self.slug = slug
        self.name = name
        self.builder = builder
        self.predictor = predictor
        self.store_estimator = store_estimator
        self.runtime_check = runtime_check
        self.training_verb = training_verb
        self.report_progress = report_progress
        self.lock = threading.RLock()
        self.active: str | None = None
        self.failures: dict[str, str] = {}
        self.progress_message = ""
        self.loaded_estimator = None

    def _report_path(self, key: str) -> Path:
        return self.random_forest.root / "models" / f"{key}.{self.slug}.json"

    def _estimator_path(self, key: str) -> Path:
        return self._report_path(key).with_suffix(".joblib")

    def _reference_metadata(self, key: str) -> dict:
        path = self.random_forest.paths(key)["report"]
        return json.loads(path.read_text(encoding="utf-8"))

    def _load_record(self, key: str) -> dict | None:
        try:
            saved = json.loads(self._report_path(key).read_text(encoding="utf-8"))
            metadata = self._reference_metadata(key)
            if saved["schema"] == 1 and saved["rf_artifact_sha256"] == metadata["artifact_sha256"]:
                report = saved["report"]
                if isinstance(report, dict):
                    if self.store_estimator and (
                        saved.get("sklearn_version") != sklearn_version
                        or not self._estimator_path(key).is_file()
                        or not saved.get("estimator_sha256")
                    ):
                        return None
                    return saved
        except (OSError, ValueError, KeyError, TypeError):
            pass
        return None

    def status(self, latitude: object, longitude: object) -> dict:
        key, lat, lon = location(latitude, longitude)
        with self.lock:
            training = self.active == key
            failure = self.failures.get(key)
            progress = self.progress_message
            stored = self._load_record(key)
        report = stored["report"] if stored else None
        missing = ""
        if self.runtime_check:
            try:
                self.runtime_check()
            except ImportError as error:
                missing = str(error)
        if training:
            state, message = "training", progress
        elif missing:
            state, message = "missing_dependencies", missing
        elif failure:
            state, message = "error", failure
        elif report:
            state, message = "ready", f"{self.name} đã sẵn sàng."
        else:
            state, message = "idle", f"Bắt đầu {self.training_verb} {self.name} cho địa điểm này."
        return {
            "state": state, "message": message, "latitude": lat, "longitude": lon,
            "has_history": self.random_forest.paths(key)["history"].is_file(), "model": report,
        }

    def start_training(self, latitude: object, longitude: object) -> dict:
        key, lat, lon = location(latitude, longitude)
        if self.runtime_check:
            self.runtime_check()
        with self.lock:
            if self.active == key:
                return self.status(lat, lon)
            if self.active is not None:
                raise ValueError(f"{self.name} đang xử lý một địa điểm khác.")
            self.active = key
            self.failures.pop(key, None)
            self.progress_message = f"Đang chuẩn bị dữ liệu ERA5 để {self.training_verb} {self.name}…"
            try:
                threading.Thread(target=self._train_job, args=(key, lat, lon), daemon=True).start()
            except RuntimeError:
                self.active = None
                raise
        return self.status(lat, lon)

    def _reference_artifact(self, key: str, lat: float, lon: float) -> dict:
        status = self.random_forest.status(lat, lon)
        if status["state"] != "training":
            artifact = self.random_forest.load(key) if status["model"] else None
            if artifact is not None:
                return artifact
            status = self.random_forest.start_training(lat, lon, prefer_local_history=True)

        deadline = time.monotonic() + 180
        while status["state"] == "training" and time.monotonic() < deadline:
            time.sleep(0.3)
            status = self.random_forest.status(lat, lon)

        if status["state"] != "ready":
            raise ValueError(f"Cần kết quả Random Forest để so sánh. {status['message']}")
        artifact = self.random_forest.load(key)
        if artifact is None:
            raise ValueError("Chưa đọc được kết quả kiểm thử Random Forest.")
        return artifact

    def _train_job(self, key: str, lat: float, lon: float) -> None:
        failure = None
        try:
            artifact = self._reference_artifact(key, lat, lon)
            metadata = self._reference_metadata(key)
            rows, source = self.random_forest.history(key)
            if (artifact["report"]["trained_at"] != metadata["trained_at"]
                    or artifact["report"]["source"].get("csv_sha256") != source.get("csv_sha256")):
                raise ValueError("Dữ liệu hoặc mô hình Random Forest vừa đổi. Hãy thử huấn luyện lại.")
            self._set_progress(f"Đang {self.training_verb} {self.name} trên dữ liệu ERA5…")
            options = {"progress": self._set_progress} if self.report_progress else {}
            result = self.builder(rows, artifact, **options)
            report, estimator = result if self.store_estimator else (result, None)
            reference_hash = metadata["artifact_sha256"]
            if self._reference_metadata(key)["artifact_sha256"] != reference_hash:
                raise ValueError("Kết quả Random Forest vừa thay đổi. Hãy thử huấn luyện lại.")
            self._save_record(key, reference_hash, report, estimator)
        except Exception as error:
            failure = f"Chưa hoàn tất {self.name}. {error}"
        finally:
            with self.lock:
                if failure:
                    self.failures[key] = failure
                self.active = None

    def _set_progress(self, message: str) -> None:
        with self.lock:
            self.progress_message = message

    def _save_record(self, key: str, reference_hash: str, report: dict, estimator) -> None:
        record = {"schema": 1, "rf_artifact_sha256": reference_hash, "report": report}
        with self.lock:
            if estimator is not None:
                stream = io.BytesIO()
                joblib.dump(estimator, stream, compress=3)
                binary = stream.getvalue()
                checksum = hashlib.sha256(binary).hexdigest()
                record.update(estimator_sha256=checksum, sklearn_version=sklearn_version)
                atomic_bytes(self._estimator_path(key), binary)
                self.loaded_estimator = (key, checksum, estimator)
            atomic_bytes(self._report_path(key), json_bytes(record))

    def _load_estimator(self, key: str, checksum: str):
        cached = self.loaded_estimator
        if cached and cached[:2] == (key, checksum):
            return cached[2]
        binary = self._estimator_path(key).read_bytes()
        if hashlib.sha256(binary).hexdigest() != checksum:
            raise ValueError("Tệp mô hình bị thay đổi. Hãy huấn luyện lại để tạo tệp mới.")
        estimator = joblib.load(io.BytesIO(binary))
        self.loaded_estimator = (key, checksum, estimator)
        return estimator

    def predict(self, latitude: object, longitude: object, context: dict) -> dict:
        key, _, _ = location(latitude, longitude)
        if self.runtime_check:
            self.runtime_check()
        with self.lock:
            record = self._load_record(key)
            if record is None:
                raise ValueError(f"Cần {self.training_verb} {self.name} cho địa điểm này trước.")
            report = record["report"]
            if self.store_estimator:
                estimator = self._load_estimator(key, record["estimator_sha256"])
        if self.store_estimator:
            return self.predictor(context, estimator, report)
        return self.predictor(context, report)
