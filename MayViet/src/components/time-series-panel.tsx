// [SERIES-UI-001] Một khung React dùng chung cho Holt–Winters, Gradient Boosting và Chronos‑2 Small.
import { useEffect, useRef, useState } from "react";
import { Activity, Layers, LoaderCircle, RefreshCw, Sparkles } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { mlRequest } from "@/lib/ml-client";
import type { Scores } from "@/lib/ml-client";
import { clockTime, num, shortDate, toTemp } from "@/lib/weather";
import type { Place } from "@/lib/weather";
import { fetchChronosInput, fetchModelContext, fetchTimeSeriesInput, modelInput } from "@/lib/weather-client";
import "../time-series.css";

type TemperatureUnit = "C" | "F";

// [SERIES-UI-002] Báo cáo lịch sử gồm các điểm dùng để vẽ biểu đồ và sai số trên cả tập kiểm thử.
type SeriesReport = {
  test_start_target: string;
  test_end_target: string;
  test_samples: number;
  metrics: Scores;
  random_forest: Scores;
  baseline: Scores;
  inference_seconds?: number;
  interval_coverage?: number;
  backtest: {
    time: string;
    actual: number;
    predicted: number;
    random_forest: number;
    baseline: number;
  }[];
};

// [SERIES-UI-003] Trạng thái mô hình quyết định khi nào hiện nút huấn luyện, dự báo hoặc thông báo thiếu thư viện.
type SeriesStatus = {
  state: "idle" | "training" | "ready" | "error" | "missing_dependencies";
  message: string;
  has_history: boolean;
  model: SeriesReport | null;
};

// [SERIES-UI-004] as_of là giờ dữ liệu đầu vào cuối cùng, target_time là giờ cần dự báo. Hai cận chỉ có khi API trả khoảng dự báo.
type SeriesPrediction = {
  as_of: string;
  target_time: string;
  temperature: number;
  delta: number;
  stale: boolean;
  lower?: number;
  upper?: number;
};

// [SERIES-UI-005] variant chọn tiêu đề, biểu tượng và hàm lấy đúng các cột thời tiết mà mô hình cần.
const forecastPanels = {
  "time-series": {
    title: "Dự báo chuỗi thời gian (Time Series)", name: "Holt–Winters", Icon: Activity,
    description: "Holt–Winters học chu kỳ nhiệt độ 24 giờ.",
    trainText: "Huấn luyện Holt–Winters", fetchInput: fetchTimeSeriesInput,
  },
  "gradient-boosting": {
    title: "Dự báo bằng Gradient Boosting", name: "Gradient Boosting", Icon: Layers,
    description: "Dự báo nhiệt độ giờ tới từ các đặc trưng thời tiết đã dùng cho Random Forest.",
    trainText: "Huấn luyện Gradient Boosting",
    fetchInput: async (latitude: number, longitude: number, force: boolean) =>
      modelInput(await fetchModelContext(latitude, longitude, force)).context,
  },
  chronos: {
    title: "Dự báo bằng Chronos‑2 Small", name: "Chronos‑2 Small", Icon: Sparkles,
    description: "Mô hình học sẵn phân tích chuỗi thời tiết và ước lượng khoảng nhiệt độ giờ tới.",
    trainText: "Tải mô hình và kiểm thử", fetchInput: fetchChronosInput,
  },
};

const statusText = {
  checking: "Đang kiểm tra",
  idle: "Chưa huấn luyện",
  training: "Đang huấn luyện",
  ready: "Sẵn sàng",
  error: "Cần thử lại",
  missing_dependencies: "Thiếu thư viện",
};

// [SERIES-UI-006] Tên variant cũng là tên route Python. Chronos được chờ lâu hơn khi dự báo lần đầu vì có thể cần tải trọng số.
function postSeries<T>(
  variant: keyof typeof forecastPanels,
  route: "train" | "predict",
  payload: object,
  signal: AbortSignal,
) {
  return mlRequest<T>(`/api/${variant}/${route}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  }, variant === "chronos" && route === "predict" ? 180_000 : 15_000);
}

// [SERIES-UI-007] Dùng một kiểu hiển thị ngày giờ cho nhãn biểu đồ, mốc đầu vào và mốc dự báo.
function dateAndTime(time: string) {
  return `${clockTime(time)} · ${shortDate(time)}`;
}

// [SERIES-UI-008] Ưu tiên thông báo từ lỗi mạng hoặc Python. Giá trị lỗi khác dùng câu mặc định của thao tác.
function messageFor(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

// [SERIES-UI-009] Phần kiểm thử vẽ ERA5, Random Forest và mô hình đang xem trên cùng các mốc lịch sử.
function SeriesBacktest({
  model,
  unit,
  name,
}: {
  model: SeriesReport;
  unit: TemperatureUnit;
  name: string;
}) {
  const chartLines = [
    { key: "actual", label: "ERA5 lịch sử", tone: "reference" },
    { key: "random_forest", label: "Random Forest", tone: "forest" },
    { key: "predicted", label: name, tone: "accent" },
  ] as const;
  // [SERIES-UI-010] Giá trị nhiệt độ đổi C/F khi vẽ. Sai số là độ chênh nên sang °F chỉ nhân 1,8.
  const errorScale = unit === "F" ? 1.8 : 1;
  const chart = model.backtest.map((row) => ({
    time: row.time,
    actual: toTemp(row.actual, unit),
    predicted: toTemp(row.predicted, unit),
    random_forest: toTemp(row.random_forest, unit),
  }));
  // [SERIES-UI-011] Bảng sai số có thêm Persistence làm mốc so sánh theo quy tắc giờ sau bằng giờ trước.
  const rows = [
    { label: name, scores: model.metrics },
    { label: "Random Forest", scores: model.random_forest },
    { label: "Giờ sau bằng giờ trước", scores: model.baseline },
  ];

  return (
    <div className="time-series-backtest">
      <h3>So sánh trên dữ liệu lịch sử</h3>
      <p className="time-series-meta">
        {num(model.test_samples)} giờ kiểm thử ERA5, từ{" "}
        {dateAndTime(model.test_start_target)} đến{" "}
        {dateAndTime(model.test_end_target)}. Cả hai mô hình đều dự báo trước một giờ.
      </p>
      {/* [SERIES-UI-012] Khi báo cáo có số đo thời gian và độ bao phủ P10–P90, hiển thị chúng cạnh số giờ kiểm thử. */}
      {model.inference_seconds != null && (
        <p className="time-series-meta">
          Thời gian dự báo toàn bộ tập kiểm thử trên máy đo {num(model.inference_seconds, 1)} giây.
          {model.interval_coverage != null && ` Có ${num(model.interval_coverage * 100, 1)}% giá trị ERA5 nằm trong khoảng P10–P90.`}
        </p>
      )}
      {chart.length > 0 && (
        <>
          <ul className="time-series-legend" aria-label="Chú giải biểu đồ">
            {chartLines.map(({ key, label, tone }) => (
              <li key={key}>
                <i data-tone={tone} aria-hidden="true" />{label}
              </li>
            ))}
          </ul>
          <div
            className="time-series-chart"
            role="figure"
            aria-label={`${chart.length} mốc kiểm thử cuối`}
          >
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <LineChart data={chart} margin={{ top: 8, right: 12, left: 0, bottom: 2 }}>
                <CartesianGrid
                  vertical={false}
                  stroke="var(--chart-grid)"
                  strokeDasharray="3 5"
                />
                <XAxis
                  dataKey="time"
                  tickFormatter={dateAndTime}
                  minTickGap={18}
                  tick={{ fill: "var(--subtle)", fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  domain={["dataMin - 1", "dataMax + 1"]}
                  tickFormatter={(value: number) => `${num(value, 1)}°`}
                  tick={{ fill: "var(--subtle)", fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                />
                <Tooltip
                  labelFormatter={(label) => dateAndTime(String(label))}
                  formatter={(value, name) => [`${num(Number(value), 2)}°${unit}`, name]}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    background: "var(--card)",
                    color: "var(--text)",
                    fontSize: 12,
                  }}
                />
                {chartLines.map(({ key, label, tone }) => (
                  <Line
                    key={key}
                    name={label}
                    dataKey={key}
                    stroke={`var(--time-series-${tone})`}
                    strokeDasharray={key === "random_forest" ? "5 4" : undefined}
                    strokeWidth={key === "predicted" ? 2.5 : 1.8}
                    dot={false}
                    isAnimationActive={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="time-series-meta">
            Biểu đồ hiển thị {num(chart.length)} mốc kiểm thử cuối.
          </p>
        </>
      )}
      <table className="time-series-scores">
        <caption>MAE là sai số tuyệt đối trung bình. RMSE nhấn mạnh các sai số lớn.</caption>
        <thead>
          <tr>
            <th scope="col">Phương pháp</th>
            <th scope="col">MAE (°{unit})</th>
            <th scope="col">RMSE (°{unit})</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ label, scores }) => (
            <tr key={label}>
              <th scope="row">{label}</th>
              <td>{num(scores.mae * errorScale, 3)}</td>
              <td>{num(scores.rmse * errorScale, 3)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// [SERIES-UI-013] Nhận vị trí, đơn vị và tên mô hình từ trang chính. Mặc định là khung Holt–Winters.
export default function TimeSeriesPanel({
  place,
  unit,
  variant = "time-series",
}: {
  place: Place;
  unit: TemperatureUnit;
  variant?: keyof typeof forecastPanels;
}) {
  const { latitude, longitude } = place;
  const { title, name, Icon, description, trainText, fetchInput } = forecastPanels[variant];
  // [SERIES-UI-014] Chronos chỉ dự báo sau khi bấm nút để tránh phải tải mô hình ngay khi mở trang.
  const manual = variant === "chronos";
  const [status, setStatus] = useState<SeriesStatus | null>(null);
  const [statusError, setStatusError] = useState("");
  const [statusRevision, setStatusRevision] = useState(0);
  const [startingTraining, setStartingTraining] = useState(false);
  const trainingRequest = useRef<AbortController | null>(null);
  const [prediction, setPrediction] = useState<SeriesPrediction | null>(null);
  const [predicting, setPredicting] = useState(false);
  const [predictionError, setPredictionError] = useState("");
  const [predictionRevision, setPredictionRevision] = useState(0);
  const model = status?.model;
  const busy = startingTraining || status?.state === "training";
  const unavailable = status?.state === "missing_dependencies";

  // [SERIES-UI-015] Đọc trạng thái theo tọa độ. Trong lúc huấn luyện, hỏi lại sau 1,5 giây và dọn lượt hỏi khi đổi khung.
  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ latitude: String(latitude), longitude: String(longitude) });
    let poll: ReturnType<typeof setTimeout> | undefined;

    async function loadStatus() {
      try {
        const next = await mlRequest<SeriesStatus>(
          `/api/${variant}/status?${params}`,
          { signal: controller.signal },
        );
        if (controller.signal.aborted) return;
        setStatus(next);
        setStatusError("");
        if (next.state === "training") poll = setTimeout(loadStatus, 1500);
      } catch (error) {
        if (!controller.signal.aborted) {
          setStatusError(messageFor(error, "Chưa đọc được trạng thái mô hình."));
        }
      }
    }

    void loadStatus();
    return () => {
      controller.abort();
      clearTimeout(poll);
    };
  }, [latitude, longitude, statusRevision, variant]);

  // [SERIES-UI-016] Dừng chờ phản hồi yêu cầu huấn luyện ở trình duyệt khi khung cũ bị tháo.
  useEffect(() => () => trainingRequest.current?.abort(), []);

  // [SERIES-UI-017] Khi đủ điều kiện dự báo, lấy dữ liệu đến giờ hiện tại từ Open-Meteo rồi chuyển cho Python tính giờ kế tiếp.
  useEffect(() => {
    if (!model || busy || unavailable || (manual && predictionRevision === 0)) return;
    const controller = new AbortController();
    setPredicting(true);
    setPredictionError("");

    async function loadForecast() {
      try {
        const context = await fetchInput(
          latitude,
          longitude,
          predictionRevision > 0,
        );
        if (controller.signal.aborted) return;
        const result = await postSeries<SeriesPrediction | SeriesStatus>(
          variant,
          "predict",
          { latitude, longitude, context },
          controller.signal,
        );
        if (controller.signal.aborted) return;
        if ("state" in result) throw new Error(result.message);
        setPrediction(result);
      } catch (error) {
        if (!controller.signal.aborted) {
          setPrediction(null);
          setPredictionError(messageFor(error, "Chưa dự báo được giờ kế tiếp."));
        }
      } finally {
        if (!controller.signal.aborted) setPredicting(false);
      }
    }

    void loadForecast();
    return () => controller.abort();
  }, [busy, fetchInput, latitude, longitude, manual, model, predictionRevision, unavailable, variant]);

  // [SERIES-UI-018] Khóa lần khởi động trùng. Nếu Python còn xử lý, tăng statusRevision để tiếp tục theo dõi.
  async function train() {
    if (trainingRequest.current) return;
    const controller = new AbortController();
    trainingRequest.current = controller;
    setStartingTraining(true);
    setStatusError("");
    try {
      const next = await postSeries<SeriesStatus>(
        variant,
        "train",
        { latitude, longitude },
        controller.signal,
      );
      if (controller.signal.aborted) return;
      setStatus(next);
      if (next.state === "training") setStatusRevision((value) => value + 1);
    } catch (error) {
      if (!controller.signal.aborted) {
        setStatusError(messageFor(error, "Chưa bắt đầu huấn luyện được."));
      }
    } finally {
      if (!controller.signal.aborted) {
        trainingRequest.current = null;
        setStartingTraining(false);
      }
    }
  }

  // [SERIES-UI-019] Mỗi khung có nhãn xử lý phù hợp. Chronos đang kiểm thử mô hình có sẵn thay vì huấn luyện mới.
  const modelState = status?.state || "checking";
  const statusLabel = busy
    ? manual ? "Đang kiểm thử" : statusText.training
    : statusError ? statusText.error
    : manual && modelState === "idle" ? "Chưa kiểm thử" : statusText[modelState];
  const delta = prediction && prediction.delta * (unit === "F" ? 1.8 : 1);

  return (
    <section
      className="card time-series-panel"
      data-variant={variant}
      id={variant}
      aria-labelledby={`${variant}-title`}
    >
      <header className="time-series-heading">
        <span className="time-series-icon" aria-hidden="true">
          <Icon size={23} />
        </span>
        <div>
          <h2 id={`${variant}-title`}>{title}</h2>
          <p>{place.name} · {description}</p>
        </div>
        <span className="time-series-status" data-ready={modelState === "ready"} role="status">
          {busy && <LoaderCircle className="spin" size={12} aria-hidden="true" />}
          {statusLabel}
        </span>
      </header>

      {/* [SERIES-UI-020] Báo lỗi mạng, thiếu thư viện hoặc tiến độ. Nút kiểm tra lại yêu cầu đọc trạng thái mới. */}
      {statusError && (
        <div className="time-series-notice" role="alert">
          <p>{statusError}</p>
          <button
            type="button"
            className="time-series-button"
            onClick={() => setStatusRevision((value) => value + 1)}
          >
            Kiểm tra lại
          </button>
        </div>
      )}
      {unavailable && (
        <div className="time-series-notice">
          <p>{status.message}</p>
          <button type="button" className="time-series-button" onClick={() => setStatusRevision((value) => value + 1)}>
            Kiểm tra lại
          </button>
        </div>
      )}
      {(!model || busy) && status && !unavailable && !statusError && (
        <div className="time-series-notice">
          <p aria-live="polite">{status.message}</p>
          {!busy && (
            <button type="button" className="time-series-button" onClick={train}>
              <Icon size={15} aria-hidden="true" />
              {status.state === "error" ? "Thử lại" : trainText}
            </button>
          )}
        </div>
      )}

      {/* [SERIES-UI-021] Kết quả giờ tới có thể chưa sẵn sàng trong khi báo cáo kiểm thử lịch sử vẫn xem được. */}
      {model && (
        <>
          {!unavailable && <div className="time-series-forecast">
            <div aria-live="polite" aria-busy={predicting}>
              <h3>Nhiệt độ giờ kế tiếp</h3>
              {prediction && delta != null ? (
                <>
                  <p className="time-series-temperature">
                    {num(toTemp(prediction.temperature, unit), 1)}<small>°{unit}</small>
                  </p>
                  <p>
                    <strong>{dateAndTime(prediction.target_time)}</strong>
                    {" · "}{delta > 0 ? "+" : ""}{num(delta, 1)}°{unit} so với đầu vào giờ trước
                  </p>
                  <p className="time-series-meta">
                    Dùng dữ liệu Open-Meteo đến {dateAndTime(prediction.as_of)} (GMT+7).
                  </p>
                  {/* [SERIES-UI-022] Chỉ hiện khoảng P10–P90 khi dự báo có đủ cận dưới và cận trên. */}
                  {prediction.lower != null && prediction.upper != null && (
                    <p className="time-series-meta">
                      Khoảng dự báo P10–P90 {num(toTemp(prediction.lower, unit), 1)}–{num(toTemp(prediction.upper, unit), 1)}°{unit}.
                    </p>
                  )}
                </>
              ) : (
                <p className="time-series-meta">
                  {predicting ? "Đang dự báo…" : manual ? "Lần đầu tải mô hình khoảng 112 MB." : "Chưa có dự báo."}
                </p>
              )}
            </div>
            <button
              type="button"
              className="time-series-button"
              disabled={predicting || busy}
              onClick={() => setPredictionRevision((value) => value + 1)}
            >
              <RefreshCw size={15} className={predicting ? "spin" : undefined} aria-hidden="true" />
              {manual && !prediction ? "Chạy dự báo" : "Dự báo lại"}
            </button>
          </div>}
          {prediction?.stale && (
            <p className="time-series-notice" role="status">
              Đầu vào đã cũ. Dự báo dành cho mốc giờ hiển thị ở trên.
            </p>
          )}
          {predictionError && <p className="time-series-notice" role="alert">{predictionError}</p>}
          <SeriesBacktest model={model} unit={unit} name={name} />
        </>
      )}
    </section>
  );
}
