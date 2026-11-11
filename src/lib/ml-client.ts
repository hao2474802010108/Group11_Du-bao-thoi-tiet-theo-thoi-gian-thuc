// [ML-CLIENT-001] Hợp đồng dữ liệu với app.py; tách endpoint ML cục bộ khỏi nguồn dự báo Open-Meteo.
export type Scores = { mae: number; rmse: number; r2: number | null };
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
export type MLStatus = {
  state: "idle" | "training" | "ready" | "error" | "missing_dependencies";
  message: string;
  has_history: boolean;
  model: MLReport | null;
};
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

// [ML-CLIENT-002] Timeout 15 giây cho API nội bộ; AbortSignal từ component ngăn phản hồi cũ ghi vào nơi mới.
export async function mlRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (init.signal?.aborted) controller.abort();
  init.signal?.addEventListener("abort", abort, { once: true });
  const timer = setTimeout(abort, 15_000);
  try {
    const response = await fetch(path, {
      ...init,
      signal: controller.signal,
      credentials: "omit",
      headers: { Accept: "application/json", ...init.headers },
    });
    if (!response.headers.get("content-type")?.includes("application/json"))
      throw new Error(
        "API ML cần app.py. Hãy mở bằng python app.py hoặc bật Vite proxy theo README.",
      );
    const value = await response.json();
    if (!response.ok) {
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

export function mlUrl(
  route: "status" | "export",
  latitude: number,
  longitude: number,
) {
  return `/api/ml/${route}?${new URLSearchParams({ latitude: String(latitude), longitude: String(longitude) })}`;
}

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
