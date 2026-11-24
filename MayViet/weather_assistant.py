"""Hỏi đáp tiếng Việt bằng Qwen chạy trên CPU và số liệu Open-Meteo của ứng dụng."""

# [WA-001] File này chọn dữ liệu Open-Meteo theo câu hỏi, nạp Qwen trên CPU và trả lời bằng tiếng Việt.
from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime, timedelta
from importlib.util import find_spec
from pathlib import Path
from threading import Lock, Thread
import math
import os
import re
import unicodedata


# [WA-002] Cố định tên và phiên bản Qwen. Danh sách bên dưới giới hạn những tệp cần cho mô hình và tokenizer.
MODEL = "Qwen/Qwen2.5-0.5B-Instruct"
MODEL_REVISION = "7ae557604adf67be50417f59c2c2f167def9a775"
MODEL_FILES = ("config.json", "generation_config.json", "model.safetensors", "tokenizer.json", "tokenizer_config.json")
SOURCE = "Open-Meteo"
MAX_QUESTION_LENGTH = 300
# [WA-003] Đặt cách trả lời, ngôn ngữ và quy tắc dùng đúng số liệu, đơn vị, địa điểm và khung giờ.
SYSTEM_PROMPT = (
    "Bạn là trợ lý thời tiết Mây Việt. Trả lời bằng tiếng Việt trong 1 hoặc 2 câu ngắn. "
    "Trả lời đúng địa điểm và khung thời gian của câu hỏi. Dùng số liệu được cung cấp và giữ đúng đơn vị. "
    "Xác suất mưa biểu thị khả năng mưa, không phải mm. "
    "Với câu hỏi mang ô, làm theo gợi ý đã được tính từ dữ liệu và nêu đúng giờ. "
    "Nếu thiếu số liệu phù hợp, hãy nói chưa có dữ liệu cho câu hỏi."
)


# [WA-004] Giữ xác suất mưa cao nhất và giờ tương ứng để so với lời khuyên do Qwen tạo.
@dataclass(frozen=True)
class RainAdvice:
    probability: float
    hour: datetime

    # [WA-005] Tạo lời khuyên trực tiếp từ dữ liệu. Từ 50% trở lên gợi ý mang ô, dưới mức đó cho người dùng cân nhắc.
    @property
    def reference(self) -> str:
        advice = "Bạn nên mang ô" if self.probability >= 50 else "Bạn có thể cân nhắc mang ô"
        return f"{advice}. Xác suất mưa cao nhất trong khung giờ được hỏi là {_display(self.probability, '%')} lúc {self.hour:%H:%M} ngày {self.hour:%d/%m}."

    # [WA-006] Kiểm tra lời khuyên, xác suất và giờ. Nếu ghi ngày thì ngày phải đúng. Dưới 50% cần khớp nguyên câu tham chiếu.
    def matches(self, answer: str) -> bool:
        phrase = _fold(answer)
        if self.probability < 50:
            return self.reference == answer
        negative = re.search(r"\bkhong (?:nen|can|nhat thiet)\b", phrase)
        positive = re.search(r"\bnen (?:mang|dem|cam) (?:theo )?(?:o|du)\b", phrase)
        quoted = {float(value.replace(",", ".")) for value in re.findall(r"\b(\d+(?:[.,]\d+)?)\s*%", answer)}
        times = set(re.findall(r"\b[0-2]?\d:[0-5]\d\b", answer))
        dates = set(re.findall(r"\b\d{1,2}/\d{1,2}\b", answer))
        return (not negative and bool(positive) and quoted == {round(self.probability, 1)}
                and times == {f"{self.hour:%H:%M}"} and dates <= {f"{self.hour:%d/%m}"})


# [WA-007] Gom câu hỏi, các số liệu gửi vào Qwen, giờ dữ liệu và lời khuyên đối chứng nếu có.
@dataclass(frozen=True)
class ForecastContext:
    question: str
    facts: str
    as_of: str
    rain_advice: RainAdvice | None = None


# [WA-008] Giới hạn độ dài văn bản, bỏ dấu điều khiển dạng token và thu gọn khoảng trắng.
def _clean_text(value: object, name: str, maximum: int) -> str:
    if not isinstance(value, str) or len(value) > maximum:
        raise ValueError(f"{name} cần là văn bản tối đa {maximum} ký tự.")
    value = " ".join(re.sub(r"<\|[^\r\n]*?\|>", "", value).split())
    if not value:
        raise ValueError(f"Vui lòng nhập {name.lower()}.")
    return value


# [WA-009] Viết thường và bỏ dấu tiếng Việt để nhận ra các cụm giờ và từ khóa dù kiểu gõ khác nhau.
def _fold(value: str) -> str:
    normalized = unicodedata.normalize("NFD", value.lower().replace("đ", "d"))
    return "".join(character for character in normalized if not unicodedata.combining(character))


# [WA-010] Chuyển mốc ngày giờ từ Open-Meteo thành datetime. Trả None nếu định dạng hoặc giá trị không hợp lệ.
def _time(value: object) -> datetime | None:
    if not isinstance(value, str) or not re.fullmatch(r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}", value):
        return None
    try:
        return datetime.fromisoformat(value)
    except ValueError:
        return None


# [WA-011] Chuyển riêng mốc theo ngày sang date để lọc dự báo ngày.
def _date(value: object) -> date | None:
    if not isinstance(value, str) or not re.fullmatch(r"\d{4}-\d{2}-\d{2}", value):
        return None
    try:
        return date.fromisoformat(value)
    except ValueError:
        return None


# [WA-012] Giữ số hữu hạn trong khoảng hợp lệ của từng chỉ số. Giá trị thiếu hoặc sai sẽ không đi vào câu trả lời.
def _number(value: object, minimum: float, maximum: float) -> float | None:
    if type(value) not in (int, float) or not minimum <= value <= maximum:
        return None
    return float(value) if math.isfinite(value) else None


# [WA-013] Đổi °C sang °F nếu giao diện yêu cầu và ghép đơn vị vào số liệu đã làm tròn.
def _display(value: float | None, unit: str = "") -> str | None:
    if value is None:
        return None
    if unit == "°F":
        value = value * 9 / 5 + 32
    return f"{value:.1f}".removesuffix(".0") + unit


# [WA-014] Đọc chỉ số tại đúng vị trí trong mảng theo giờ hoặc theo ngày, sau đó áp dụng kiểm tra số.
def _value(series: dict, key: str, index: int, minimum: float, maximum: float) -> float | None:
    values = series.get(key)
    if not isinstance(values, list) or index >= len(values):
        return None
    return _number(values[index], minimum, maximum)


# [WA-015] Nhận dạng ngày cụ thể, hôm nay, ngày mai và ngày kia dựa trên mốc Open-Meteo.
def _select_period(question: str, current: datetime, available_days: list[date]) -> tuple[date | None, range]:
    query = _fold(question)
    requested_day = None
    explicit_date = re.search(r"\b(\d{1,2})/(\d{1,2})(?:/(\d{4}))?\b", query)
    if explicit_date:
        day, month, year = explicit_date.groups()
        requested_day = next((value for value in available_days
                              if value.day == int(day) and value.month == int(month)
                              and (year is None or value.year == int(year))), None)
        if requested_day is None:
            raise ValueError("Ngày bạn hỏi nằm ngoài dự báo hiện có.")
    elif "ngay kia" in query:
        requested_day = current.date() + timedelta(days=2)
    elif re.search(r"\bmai\b", query):
        requested_day = current.date() + timedelta(days=1)
    elif re.search(r"\b(hom nay|sang nay|trua nay|chieu nay|toi nay|dem nay)\b", query):
        requested_day = current.date()

    # [WA-016] Giờ viết rõ được ưu tiên. Nếu chỉ hỏi một buổi, chọn phạm vi giờ của buổi đó.
    explicit_hour = re.search(r"\b([0-9]|[01][0-9]|2[0-3])\s*(?:h\b|gio\b|:[0-5]\d\b)", query)
    if explicit_hour:
        hour = int(explicit_hour.group(1))
        return requested_day or current.date(), range(hour, hour + 1)
    for word, hours in (("buoi sang", range(5, 12)), ("sang", range(5, 12)), ("trua", range(11, 14)),
                        ("chieu", range(12, 18)), ("toi", range(18, 24)), ("dem", range(18, 24))):
        if re.search(rf"\b{word}\s+(?:nay|mai|ngay|hom)\b", query) or re.search(rf"\b{word}\b", query) and requested_day:
            return requested_day or current.date(), hours
    return requested_day, range(24)


# [WA-017] Ghép tên vào chỉ số có dữ liệu. Trường thiếu sẽ được bỏ khi nối thành câu.
def _describe(label: str, value: str | None) -> str | None:
    return f"{label} {value}" if value is not None else None


# [WA-018] Đọc dữ liệu thời tiết gửi từ giao diện, kiểm tra múi giờ Việt Nam và chỉ giữ thông tin liên quan để tạo ngữ cảnh.
def _forecast_context(payload: dict) -> ForecastContext:
    question = _clean_text(payload.get("question"), "Câu hỏi", MAX_QUESTION_LENGTH)
    place = _clean_text(payload.get("place"), "Địa điểm", 100)
    forecast = payload.get("forecast")
    if not isinstance(forecast, dict) or forecast.get("timezone") != "Asia/Ho_Chi_Minh":
        raise ValueError("Cần dữ liệu Open-Meteo theo giờ Việt Nam cho địa điểm đang chọn.")
    unit = payload.get("unit", "C")
    if unit not in ("C", "F"):
        raise ValueError("Đơn vị nhiệt độ phải là °C hoặc °F.")
    temp_unit = f"°{unit}"
    current = forecast.get("current")
    hourly = forecast.get("hourly")
    daily = forecast.get("daily")
    if not all(isinstance(section, dict) for section in (current, hourly, daily)):
        raise ValueError("Thiếu dữ liệu thời tiết hiện tại, từng giờ hoặc từng ngày.")
    current_time = _time(current.get("time"))
    if current_time is None:
        raise ValueError("Không đọc được thời điểm của dữ liệu thời tiết.")
    as_of = current_time.isoformat(timespec="minutes")
    known_daily_times = daily.get("time")
    known_hourly_times = hourly.get("time")
    if not isinstance(known_daily_times, list) or not isinstance(known_hourly_times, list):
        raise ValueError("Thiếu các mốc thời gian của dự báo.")
    day_rows = [(index, day) for index, raw in enumerate(known_daily_times[:7])
                if (day := _date(raw)) is not None and day >= current_time.date()]
    requested_day, hours = _select_period(question, current_time, [day for _, day in day_rows])
    query = _fold(question)
    umbrella = re.search(r"\b(?:mang|dem|cam) (?:theo )?(?:o|du)\b", query)
    # [WA-019] Nhận ra câu hỏi về hiện tại để mô hình không lẫn chỉ số tại mốc hiện tại với các giờ dự báo.
    current_only = (
        requested_day is None
        and umbrella is None
        and re.search(r"\b(bay gio|hien tai|luc nay)\b", query) is not None
        and re.search(r"\b(sau|tiep|toi|qua|du bao)\b", query) is None
    )

    facts = [f"Dữ liệu dự báo {SOURCE} tại {place}. Giờ Việt Nam (GMT+7). Mốc dữ liệu: {as_of}."]
    found_values = False
    # [WA-020] Thêm các chỉ số hiện tại khi câu hỏi không chỉ định ngày hoặc hỏi về hôm nay.
    if requested_day is None or requested_day == current_time.date():
        latest = [
            _describe("nhiệt độ", _display(_number(current.get("temperature_2m"), -100, 70), temp_unit)),
            _describe("cảm nhận", _display(_number(current.get("apparent_temperature"), -100, 90), temp_unit)),
            _describe("độ ẩm", _display(_number(current.get("relative_humidity_2m"), 0, 100), "%")),
            _describe("gió", _display(_number(current.get("wind_speed_10m"), 0, 500), " km/h")),
            _describe("gió giật", _display(_number(current.get("wind_gusts_10m"), 0, 500), " km/h")),
            _describe("giáng thủy", _display(_number(current.get("precipitation"), 0, 500), " mm")),
            _describe("mây che phủ", _display(_number(current.get("cloud_cover"), 0, 100), "%")),
        ]
        current_values = ", ".join(filter(None, latest))
        if current_values:
            facts.append(f"Dữ liệu hiện tại {current_time:%H:%M}: {current_values}.")
            found_values = True
    if current_only:
        if not found_values:
            raise ValueError("Chưa có số liệu thời tiết hiện tại cho địa điểm này.")
        return ForecastContext(question, "\n".join(facts), as_of)

    first_hour = current_time.replace(minute=0)
    hour_rows = []
    rain_rows = []
    # [WA-021] Lọc mốc đã qua và giờ ngoài yêu cầu. Với câu hỏi không chỉ định ngày, dùng tối đa 30 giờ tiếp theo.
    for index, raw in enumerate(known_hourly_times[:168]):
        time = _time(raw)
        if time is None or time < first_hour or time.hour not in hours:
            continue
        if requested_day is not None and time.date() != requested_day:
            continue
        if requested_day is None and time >= first_hour + timedelta(hours=30):
            continue
        rain = _value(hourly, "precipitation_probability", index, 0, 100)
        metrics = [
            _describe("nhiệt", _display(_value(hourly, "temperature_2m", index, -100, 70), temp_unit)),
            _describe("khả năng mưa", _display(rain, "%")),
            _describe("gió", _display(_value(hourly, "wind_speed_10m", index, 0, 500), " km/h")),
            _describe("UV", _display(_value(hourly, "uv_index", index, 0, 30))),
        ]
        values = ", ".join(filter(None, metrics))
        if values:
            hour_rows.append(f"{time:%d/%m %H:%M}: {values}.")
        if rain is not None:
            rain_rows.append((rain, time))
    if hour_rows:
        facts.extend(["Dự báo trong khung giờ đang hỏi:", *hour_rows])
        found_values = True
    elif requested_day is not None:
        facts.append(f"Không có số liệu từng giờ phù hợp ngày {requested_day:%d/%m} trong khung giờ được hỏi.")
    # [WA-022] Chọn giờ có xác suất mưa cao nhất trong phần đã lọc để tạo lời khuyên có số liệu đối chiếu.
    rain_advice = None
    if rain_rows:
        rain, time = max(rain_rows, key=lambda row: row[0])
        facts.append(f"Xác suất mưa cao nhất trong các giờ liệt kê là {_display(rain, '%')} lúc {time:%H:%M ngày %d/%m}.")
        if umbrella:
            rain_advice = RainAdvice(rain, time)
            facts.append(f"Gợi ý đã được tính cho người dùng: {rain_advice.reference}")

    # [WA-023] Thêm phần dự báo theo ngày cho câu hỏi so sánh. Xác suất mưa tại đây là mức cao nhất của cả ngày.
    facts.append("Tóm tắt theo ngày (khả năng mưa là mức cao nhất của cả ngày):")
    for index, day in day_rows:
        metrics = [
            _describe("thấp nhất", _display(_value(daily, "temperature_2m_min", index, -100, 70), temp_unit)),
            _describe("cao nhất", _display(_value(daily, "temperature_2m_max", index, -100, 70), temp_unit)),
            _describe("khả năng mưa cao nhất", _display(_value(daily, "precipitation_probability_max", index, 0, 100), "%")),
            _describe("gió mạnh nhất", _display(_value(daily, "wind_speed_10m_max", index, 0, 500), " km/h")),
        ]
        values = ", ".join(filter(None, metrics))
        if values:
            facts.append(f"{day:%d/%m}: {values}.")
            found_values = True
    if not found_values:
        raise ValueError("Chưa có số liệu thời tiết phù hợp cho địa điểm này.")
    return ForecastContext(question, "\n".join(facts), as_of, rain_advice)


# [WA-024] Quản lý trạng thái tải mô hình và trả lời qua API. Khóa tải và khóa sinh câu trả lời được dùng riêng.
class WeatherAssistant:
    def __init__(self, root: Path) -> None:
        self.cache = root / "models" / "ai-cache"
        self._state_lock = Lock()
        self._generate_lock = Lock()
        self._state = "idle"
        self._message = "Chuẩn bị Qwen để hỏi đáp thời tiết (tải khoảng 1 GB trong lần đầu)."
        self._runtime = None

    # [WA-025] Kiểm tra tên thư viện AI mà chưa import Torch để nút trạng thái phản hồi nhanh.
    def _has_dependencies(self) -> bool:
        return all(find_spec(package) is not None for package in ("torch", "transformers", "huggingface_hub"))

    # [WA-026] Trả trạng thái mô hình và hướng dẫn cài nếu thiếu phụ thuộc.
    def status(self) -> dict:
        with self._state_lock:
            state, message = self._state, self._message
        if state == "idle" and not self._has_dependencies():
            state = "missing_dependencies"
            message = "Cài thư viện AI bằng python -m pip install -r requirements-ai.txt rồi khởi động lại Mây Việt."
        return {"state": state, "model": MODEL, "message": message}

    # [WA-027] Bắt đầu chuẩn bị Qwen trong luồng nền khi người dùng yêu cầu hoặc thử lại sau lỗi.
    def prepare(self) -> dict:
        if not self._has_dependencies():
            return self.status()
        with self._state_lock:
            if self._state in ("idle", "error"):
                self._state = "loading"
                self._message = "Đang tải hoặc nạp trọng số Qwen. Lần đầu có thể mất vài phút."
                try:
                    Thread(target=self._prepare_model, name="mayviet-prepare-qwen", daemon=True).start()
                except RuntimeError:
                    self._state = "error"
                    self._message = "Chưa khởi động được tác vụ chuẩn bị Qwen. Hãy thử lại."
        return self.status()

    # [WA-028] Ưu tiên dùng snapshot đúng phiên bản đã lưu. Tải các tệp thiếu khi chưa mở được bản cục bộ.
    def _load_model(self):
        import torch
        from huggingface_hub import snapshot_download
        from huggingface_hub.errors import LocalEntryNotFoundError
        from transformers import AutoModelForCausalLM, AutoTokenizer

        options = {"revision": MODEL_REVISION, "cache_dir": self.cache, "allow_patterns": MODEL_FILES, "token": False}
        try:
            model_path = Path(snapshot_download(MODEL, local_files_only=True, **options))
        except LocalEntryNotFoundError:
            model_path = None
        if model_path is None or not all((model_path / name).is_file() for name in MODEL_FILES):
            model_path = Path(snapshot_download(MODEL, max_workers=3, **options))
        # [WA-029] Giới hạn CPU, mở tokenizer và trọng số safetensors có sẵn rồi đưa mô hình sang chế độ suy luận.
        torch.set_num_threads(min(4, os.cpu_count() or 1))
        tokenizer = AutoTokenizer.from_pretrained(model_path, local_files_only=True, trust_remote_code=False)
        model = AutoModelForCausalLM.from_pretrained(
            model_path, local_files_only=True, trust_remote_code=False, use_safetensors=True, dtype=torch.float32,
        ).eval()
        model.generation_config.temperature = None
        model.generation_config.top_p = None
        model.generation_config.top_k = None
        return torch, tokenizer, model

    # [WA-030] Cập nhật trạng thái sau khi tải mô hình. Phân biệt thiếu thư viện với lỗi khi lấy hoặc nạp trọng số.
    def _prepare_model(self) -> None:
        try:
            runtime = self._load_model()
        except ImportError:
            with self._state_lock:
                self._state = "error"
                self._message = "Không nạp được thư viện AI. Hãy kiểm tra requirements-ai.txt và khởi động lại ứng dụng."
        except Exception:
            with self._state_lock:
                self._state = "error"
                self._message = "Chưa nạp được Qwen. Hãy kiểm tra kết nối Hugging Face, dung lượng trống và thử lại."
        else:
            with self._state_lock:
                self._runtime = runtime
                self._state = "ready"
                self._message = "Qwen đã sẵn sàng trên máy này."

    # [WA-031] Chuẩn bị ngữ cảnh đã lọc rồi sinh câu trả lời. Mỗi thời điểm chỉ xử lý một yêu cầu sinh văn bản.
    def ask(self, payload: dict) -> dict:
        context = _forecast_context(payload)
        with self._state_lock:
            runtime = self._runtime
        if runtime is None:
            raise ValueError("Bấm Chuẩn bị Qwen và đợi nạp mô hình trước khi gửi câu hỏi.")
        if not self._generate_lock.acquire(blocking=False):
            raise ValueError("Trợ lý đang trả lời một câu hỏi. Hãy thử lại sau vài giây.")
        try:
            answer = self._generate(runtime, context.question, context.facts)
        finally:
            self._generate_lock.release()
        # [WA-032] Nếu lời khuyên mang ô không khớp số liệu, dùng câu tham chiếu và trả mode để giao diện ghi rõ nguồn.
        mode = "generated"
        if context.rain_advice is not None and not context.rain_advice.matches(answer):
            answer = context.rain_advice.reference
            mode = "reference"
        if not answer:
            raise ValueError("Qwen chưa tạo được câu trả lời. Hãy thử diễn đạt câu hỏi cụ thể hơn.")
        return {"answer": answer, "model": MODEL, "source": SOURCE, "as_of": context.as_of, "mode": mode}

    # [WA-033] Dùng mẫu hội thoại của Qwen để đổi hướng dẫn và số liệu thành token, rồi giới hạn chiều dài và thời gian sinh.
    def _generate(self, runtime, question: str, facts: str) -> str:
        torch, tokenizer, model = runtime
        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"{facts}\n\nCâu hỏi: {question}\nTrả lời bằng tiếng Việt:"},
        ]
        prompt = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
        inputs = tokenizer(prompt, return_tensors="pt")
        with torch.inference_mode():
            output = model.generate(
                **inputs, max_new_tokens=110, max_time=80, do_sample=False, repetition_penalty=1.06,
                pad_token_id=tokenizer.eos_token_id,
            )
        # [WA-034] Chỉ giải mã phần Qwen vừa sinh, bỏ phần đầu vào và các token điều khiển.
        return tokenizer.decode(output[0][inputs.input_ids.shape[-1]:], skip_special_tokens=True).strip()
