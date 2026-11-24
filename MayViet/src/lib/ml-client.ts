// [ML-CLIENT-001] Định nghĩa phản hồi của API mô hình trong app.py và cung cấp hàm gọi API cho các khung dự báo.
export type Scores = { mae: number; rmse: number; r2: number | null };
// [ML-CLIENT-003] Báo cáo Random Forest ghi mốc chia tập, sai số, độ quan trọng đặc trưng và các điểm để vẽ biểu đồ.
export type MLReport = {
  method: string;
  trained_at: string;
  latitude: number;
  longitude: number;
  history_start: string;
  history_end: string;
  raw_rows: number;
  supervised_samples: number;
  features: number;
  train_samples: number;
  test_samples: number;
  train_end_target: string;
  test_start_target: string;
  test_end_target: string;
  metrics: Scores;
  baseline: Scores;
  mae_improvement_percent: number | null;
  absolute_error_p90: number;
  feature_importance: { name: string; value: number }[];
  source: { provider: string; url: string };
  parameters: { n_estimators: number };
  backtest: {
    time: string;
    actual: number;
    predicted: number;
    baseline: number;
    absolute_error: number;
  }[];
};
// [ML-CLIENT-004] Trạng thái cho biết có thể huấn luyện, dự báo hay cần xử lý lỗi trước.
export type MLStatus = {
  state: "idle" | "training" | "ready" | "error" | "missing_dependencies";
  message: string;
  has_history: boolean;
  model: MLReport | null;
};
// [ML-CLIENT-005] Kết quả dự báo lưu cả nhiệt độ đầu vào, mức thay đổi và giờ mục tiêu để hiển thị rõ ba giá trị.
export type MLPrediction = {
  as_of: string;
  target_time: string;
  input_temperature: number;
  temperature: number;
  delta: number;
  stale: boolean;
  reference_error_p90: number;
  note: string;
};

// [ML-CLIENT-002] Mặc định chờ tối đa 15 giây. Khung dự báo có thể đổi giới hạn này và hủy yêu cầu khi bị tháo.
export async function mlRequest<T>(
  path: string,
  init: RequestInit = {},
  timeoutMs = 15_000,
): Promise<T> {
  const controller = new AbortController(); // Dùng chung tín hiệu hủy cho yêu cầu và bộ hẹn giờ.
  const abort = () => controller.abort();
  if (init.signal?.aborted) controller.abort();
  init.signal?.addEventListener("abort", abort, { once: true });
  const timer = setTimeout(abort, timeoutMs); // Ngắt yêu cầu khi đã chờ quá thời hạn.
  try {
    const response = await fetch(path, {
      ...init,
      signal: controller.signal,
      credentials: "omit", // API mô hình chạy cục bộ và không dùng cookie đăng nhập.
      headers: { Accept: "application/json", ...init.headers },
    });
    // [ML-CLIENT-006] Nếu route trả về một trang HTML, nhắc người dùng mở qua Python hoặc cấu hình Vite proxy.
    if (!response.headers.get("content-type")?.includes("application/json"))
      throw new Error(
        "API ML cần app.py. Hãy mở bằng python app.py hoặc bật Vite proxy theo README.",
      );
    const value = await response.json();
    if (!response.ok) {
      // [ML-CLIENT-007] Giữ lỗi thiếu thư viện ở dạng trạng thái để khung có thể hiện hướng dẫn cài đặt.
      if (response.status === 503 && value.state === "missing_dependencies")
        return {
          ...value,
          message: value.error,
          model: null,
          has_history: false,
        } as T;
      throw new Error(value.error || "Chưa kết nối được mô hình Python.");
    }
    return value as T;
  } finally {
    clearTimeout(timer);
    init.signal?.removeEventListener("abort", abort);
  }
}

// [ML-CLIENT-008] Ghép tọa độ vào URL để lấy trạng thái hoặc tải CSV của đúng địa điểm.
export function mlUrl(
  route: "status" | "export",
  latitude: number,
  longitude: number,
) {
  return `/api/ml/${route}?${new URLSearchParams({ latitude: String(latitude), longitude: String(longitude) })}`;
}

// [ML-CLIENT-009] Gửi tọa độ và dữ liệu đầu vào dưới dạng JSON cho thao tác huấn luyện hoặc dự báo Random Forest.
export function mlPost<T>(
  route: "train" | "predict",
  payload: object,
  signal?: AbortSignal,
) {
  return mlRequest<T>(`/api/ml/${route}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });
}
