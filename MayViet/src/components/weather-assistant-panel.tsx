// [ASSIST-UI-001] Khung hỏi đáp gọi Qwen qua máy chủ Python và gửi kèm bản dự báo của địa điểm đang xem.
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Download, LoaderCircle, MessagesSquare, Send } from "lucide-react";
import { clockTime, shortDate } from "@/lib/weather";
import type { Forecast, Place } from "@/lib/weather";
import "../weather-assistant.css";

// [ASSIST-UI-002] Phản hồi trạng thái cho biết có thể mở ô hỏi đáp hay cần chuẩn bị mô hình trước.
type AssistantState = "idle" | "loading" | "ready" | "missing_dependencies" | "error";

type AssistantStatus = {
  state: AssistantState;
  model: string;
  message: string;
};

// [ASSIST-UI-003] Kết quả trả kèm nguồn, thời điểm dữ liệu và cách tạo câu trả lời để giao diện ghi nhãn.
type AssistantResponse = {
  answer: string;
  model: string;
  source: string;
  as_of: string;
  mode: "generated" | "reference";
};

// [ASSIST-UI-004] Các nút gợi ý điền câu hỏi vào ô nhập để người dùng có thể sửa trước khi gửi.
const questions = [
  "Chiều nay có nên mang ô không?",
  "Bây giờ nhiệt độ và độ ẩm thế nào?",
  "Ngày mai có nóng hơn hôm nay không?",
];

const labels: Record<AssistantState, string> = {
  idle: "Chưa chuẩn bị",
  loading: "Đang chuẩn bị",
  ready: "Sẵn sàng",
  missing_dependencies: "Cần thư viện AI",
  error: "Cần thử lại",
};

// [ASSIST-UI-005] Đọc trạng thái bằng GET. Chuẩn bị mô hình và gửi câu hỏi dùng POST với nội dung JSON.
async function assistantRequest<Result>(
  endpoint: "status" | "prepare" | "ask",
  signal: AbortSignal,
  payload?: object,
): Promise<Result> {
  // [ASSIST-UI-006] Hợp nhất tín hiệu hủy khi đổi giao diện với giới hạn chờ. Câu hỏi được chờ lâu hơn vì Qwen chạy trên máy.
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal.aborted) abort();
  signal.addEventListener("abort", abort, { once: true });
  const timer = window.setTimeout(abort, endpoint === "ask" ? 100_000 : 15_000);
  try {
    const response = await fetch(`/api/weather-assistant/${endpoint}`, {
      method: payload ? "POST" : "GET",
      headers: payload
        ? { Accept: "application/json", "Content-Type": "application/json" }
        : { Accept: "application/json" },
      body: payload ? JSON.stringify(payload) : undefined,
      signal: controller.signal,
    });
    // [ASSIST-UI-007] Trang HTML trả về thay JSON thường là dấu hiệu route trợ lý chưa đi qua app.py.
    if (!response.headers.get("content-type")?.includes("application/json")) {
      throw new Error("Mở bằng python app.py để dùng trợ lý thời tiết.");
    }
    const value = await response.json();
    if (!response.ok) throw new Error(value.error || "Chưa kết nối được trợ lý thời tiết.");
    return value;
  } catch (error) {
    // [ASSIST-UI-008] Phân biệt hết thời gian chờ với thao tác hủy của giao diện để báo đúng lỗi.
    if (controller.signal.aborted && !signal.aborted) {
      throw new Error("Trợ lý phản hồi quá lâu. Hãy thử lại.");
    }
    throw error;
  } finally {
    window.clearTimeout(timer);
    signal.removeEventListener("abort", abort);
  }
}

// [ASSIST-UI-009] Nhận dự báo, địa điểm và đơn vị từ màn hình chính để phần hỏi đáp dùng đúng ngữ cảnh đang xem.
export default function WeatherAssistantPanel({
  place,
  forecast,
  unit,
  stale = false,
}: {
  place: Place;
  forecast: Forecast | null | undefined;
  unit: "C" | "F";
  stale?: boolean;
}) {
  // [ASSIST-UI-010] Tách trạng thái tải mô hình với lần gửi câu hỏi để hai thao tác có thông báo riêng.
  const [status, setStatus] = useState<AssistantStatus | null>(null);
  const [statusError, setStatusError] = useState("");
  const [statusRevision, setStatusRevision] = useState(0);
  const [preparing, setPreparing] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<AssistantResponse | null>(null);
  const [asking, setAsking] = useState(false);
  const [answerError, setAnswerError] = useState("");
  const prepareRequest = useRef<AbortController | null>(null);
  const askRequest = useRef<AbortController | null>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const ready = status?.state === "ready";

  // [ASSIST-UI-011] Hỏi lại trạng thái mỗi 2 giây trong lúc máy chủ đang chuẩn bị Qwen.
  useEffect(() => {
    const controller = new AbortController();
    let nextPoll: number | undefined;
    async function pollStatus() {
      try {
        const next = await assistantRequest<AssistantStatus>("status", controller.signal);
        if (controller.signal.aborted) return;
        setStatus(next);
        setStatusError("");
        if (next.state === "loading") nextPoll = window.setTimeout(pollStatus, 2000);
      } catch (error) {
        if (!controller.signal.aborted) {
          setStatusError(error instanceof Error ? error.message : "Chưa đọc được trạng thái hỏi đáp.");
        }
      }
    }
    void pollStatus();
    return () => {
      controller.abort();
      window.clearTimeout(nextPoll);
    };
  }, [statusRevision]);

  // [ASSIST-UI-012] Hủy yêu cầu đang chờ khi rời khung để câu trả lời cũ không xuất hiện ở địa điểm mới.
  useEffect(() => () => {
    prepareRequest.current?.abort();
    askRequest.current?.abort();
  }, []);

  // [ASSIST-UI-013] Khởi động việc chuẩn bị mô hình theo yêu cầu và bật lại lượt kiểm tra nếu máy chủ còn tải.
  async function prepare() {
    if (prepareRequest.current) return;
    const controller = new AbortController();
    prepareRequest.current = controller;
    setPreparing(true);
    setStatusError("");
    try {
      const next = await assistantRequest<AssistantStatus>("prepare", controller.signal, {});
      if (controller.signal.aborted) return;
      setStatus(next);
      if (next.state === "loading") setStatusRevision((revision) => revision + 1);
    } catch (error) {
      if (!controller.signal.aborted) {
        setStatusError(error instanceof Error ? error.message : "Chưa chuẩn bị được trợ lý hỏi đáp.");
      }
    } finally {
      prepareRequest.current = null;
      if (!controller.signal.aborted) setPreparing(false);
    }
  }

  // [ASSIST-UI-014] Chỉ gửi khi mô hình sẵn sàng, có dự báo và chưa có câu hỏi khác đang chờ.
  async function ask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ready || !forecast || !question.trim() || askRequest.current) return;
    const controller = new AbortController();
    askRequest.current = controller;
    setAsking(true);
    setAnswer(null);
    setAnswerError("");
    try {
      // [ASSIST-UI-015] Kèm dữ liệu hiện tại, theo giờ, theo ngày và múi giờ để Python lọc theo nội dung câu hỏi.
      const reply = await assistantRequest<AssistantResponse>("ask", controller.signal, {
        question: question.trim(),
        place: place.name,
        unit,
        forecast: {
          current: forecast.current,
          hourly: forecast.hourly,
          daily: forecast.daily,
          timezone: forecast.timezone,
        },
      });
      if (!controller.signal.aborted) setAnswer(reply);
    } catch (error) {
      if (!controller.signal.aborted) {
        setAnswerError(error instanceof Error ? error.message : "Trợ lý chưa trả lời được câu hỏi này.");
      }
    } finally {
      askRequest.current = null;
      if (!controller.signal.aborted) setAsking(false);
    }
  }

  const loading = preparing || status?.state === "loading";

  return (
    <section className="card weather-assistant" id="weather-assistant" aria-labelledby="weather-assistant-title">
      <header className="weather-assistant-heading">
        <span className="weather-assistant-icon" aria-hidden="true">
          <MessagesSquare size={23} />
        </span>
        <div>
          <h2 id="weather-assistant-title">Hỏi đáp thời tiết (LLM)</h2>
          <p>Qwen trả lời bằng tiếng Việt dựa trên dữ liệu Open-Meteo tại {place.name}.</p>
        </div>
        <span className="weather-assistant-status" data-ready={ready} role="status">
          {loading && <LoaderCircle className="spin" size={12} />}
          {statusError ? "Cần thử lại" : status ? labels[status.state] : "Đang kiểm tra"}
        </span>
      </header>

      {/* [ASSIST-UI-016] Hiện lỗi kết nối hoặc nút chuẩn bị theo trạng thái mà máy chủ trả về. */}
      {statusError && (
        <div className="weather-assistant-notice" role="alert">
          <span>{statusError}</span>
          <button type="button" className="weather-assistant-button" onClick={() => setStatusRevision((value) => value + 1)}>
            Kiểm tra lại
          </button>
        </div>
      )}
      {status && status.state !== "ready" && (
        <div className="weather-assistant-notice">
          <p role="status">{status.message}</p>
          {(status.state === "idle" || status.state === "error") && (
            <button type="button" className="weather-assistant-button" onClick={prepare} disabled={loading}>
              {loading ? <LoaderCircle size={16} className="spin" /> : <Download size={16} />}
              {loading ? "Đang chuẩn bị" : "Chuẩn bị Qwen"}
            </button>
          )}
        </div>
      )}

      {/* [ASSIST-UI-017] Chỉ mở ô hỏi đáp sau khi Qwen sẵn sàng. Dữ liệu lưu cũ được thông báo ngay trong khung. */}
      {ready && (
        <form className="weather-assistant-form" onSubmit={ask}>
          {(!forecast || stale) && (
            <p className="weather-assistant-hint" role="status">
              {forecast ? "Ứng dụng đang dùng dữ liệu Open-Meteo đã lưu." : "Đang chờ dữ liệu thời tiết của địa điểm này."}
            </p>
          )}
          <label htmlFor="weather-assistant-question">Câu hỏi của bạn</label>
          <textarea
            id="weather-assistant-question"
            ref={input}
            value={question}
            maxLength={300}
            rows={2}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Chiều nay có nên mang ô không?"
            disabled={!forecast || asking}
            required
          />
          <div className="weather-assistant-actions">
            <div className="weather-assistant-questions" aria-label="Câu hỏi gợi ý">
              {questions.map((example) => (
                <button
                  key={example}
                  type="button"
                  className="weather-assistant-example"
                  onClick={() => { setQuestion(example); input.current?.focus(); }}
                  disabled={!forecast || asking}
                >
                  {example}
                </button>
              ))}
            </div>
            <button type="submit" className="weather-assistant-button weather-assistant-submit" disabled={!forecast || !question.trim() || asking}>
              {asking ? <LoaderCircle size={16} className="spin" /> : <Send size={16} />}
              {asking ? "Đang trả lời" : "Gửi câu hỏi"}
            </button>
          </div>
        </form>
      )}

      {/* [ASSIST-UI-018] Ghi nguồn và mốc giờ dưới câu trả lời. Gợi ý theo dữ liệu có nhãn riêng với câu do Qwen sinh. */}
      <div aria-live="polite" aria-busy={asking}>
        {answerError && <p className="weather-assistant-notice" role="alert">{answerError}</p>}
        {answer && (
          <div className="weather-assistant-answer">
            <h3>Câu trả lời</h3>
            <p>{answer.answer}</p>
            <small>
              {answer.mode === "reference" ? "Gợi ý từ dữ liệu " : "Qwen · "}
              {answer.source} · {clockTime(answer.as_of)} ngày {shortDate(answer.as_of)} (GMT+7)
            </small>
          </div>
        )}
      </div>
    </section>
  );
}
