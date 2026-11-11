import { useEffect, useRef, useState } from "react";
import {
  BrainCircuit,
  ChevronDown,
  Download,
  FlaskConical,
  LoaderCircle,
  RefreshCw,
  Sparkles,
  TrendingUp,
  ArrowUpRight,
  Database,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Place } from "@/lib/weather";
import { clockTime, num, shortDate, toTemp } from "@/lib/weather";
import { fetchModelContext, modelInput } from "@/lib/weather-client";
import { mlPost, mlRequest, mlUrl } from "@/lib/ml-client";
import type { MLPrediction, MLStatus } from "@/lib/ml-client";

// [RF-UI-001] Component cha đặt key theo địa điểm: đổi nơi sẽ tháo toàn bộ state/requests của panel cũ.
export default function RandomForestPanel({
  place,
  unit,
}: {
  place: Place;
  unit: "C" | "F";
}) {
  const [status, setStatus] = useState<MLStatus | null>(null);
  const [serverError, setServerError] = useState("");
  const [trainError, setTrainError] = useState("");
  const [trainingRequest, setTrainingRequest] = useState(false);
  const [statusRevision, setStatusRevision] = useState(0);
  const [predictionRevision, setPredictionRevision] = useState(0);
  const [prediction, setPrediction] = useState<MLPrediction | null>(null);
  const [apiNext, setApiNext] = useState<number | null>(null);
  const [predicting, setPredicting] = useState(false);
  const [predictionError, setPredictionError] = useState("");
  const trainController = useRef<AbortController | null>(null);
  const model = status?.model;
  const busy = status?.state === "training" || trainingRequest;
  // [RF-UI-002] Sai số là chênh lệch nhiệt độ: đổi sang °F chỉ nhân 1,8, không cộng 32.
  const errorScale = unit === "F" ? 1.8 : 1;
  const displayTemp = (value: number | null | undefined) =>
    value == null ? "—" : num(toTemp(value, unit), 1);

  // [RF-UI-003] Poll chỉ khi đang train. GET status không tự download dữ liệu hay tạo model.
  useEffect(() => {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    async function load() {
      try {
        const value = await mlRequest<MLStatus>(
          mlUrl("status", place.latitude, place.longitude),
          { signal: controller.signal },
        );
        if (controller.signal.aborted) return;
        setStatus(value);
        setServerError("");
        if (value.state === "training") timer = setTimeout(load, 1500);
      } catch (e) {
        if (!controller.signal.aborted)
          setServerError(
            e instanceof Error
              ? e.message
              : "Chưa đọc được trạng thái mô hình.",
          );
      }
    }
    load();
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [place.latitude, place.longitude, statusRevision]);

  useEffect(() => () => trainController.current?.abort(), []);

  // [RF-UI-004] Chỉ suy luận khi đã có model. Context lấy trực tiếp từ browser có cache; dữ liệu t+1 không gửi cho RF.
  useEffect(() => {
    if (!model) return;
    const controller = new AbortController();
    setPredicting(true);
    setPredictionError("");
    async function load() {
      try {
        const raw = await fetchModelContext(
          place.latitude,
          place.longitude,
          predictionRevision > 0,
        );
        if (controller.signal.aborted) return;
        const input = modelInput(raw);
        const result = await mlPost<MLPrediction>(
          "predict",
          {
            latitude: place.latitude,
            longitude: place.longitude,
            context: input.context,
          },
          controller.signal,
        );
        if (controller.signal.aborted) return;
        if ("state" in result)
          throw new Error(
            "Chưa có thư viện ML. Xem hướng dẫn cài requirements.txt.",
          );
        setPrediction(result);
        setApiNext(
          input.apiTarget === result.target_time ? input.apiNext : null,
        );
      } catch (e) {
        if (!controller.signal.aborted) {
          setPrediction(null);
          setApiNext(null);
          setPredictionError(
            e instanceof Error ? e.message : "Chưa dự đoán được giờ kế tiếp.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setPredicting(false);
      }
    }
    load();
    return () => controller.abort();
  }, [model?.trained_at, place.latitude, place.longitude, predictionRevision]);

  // [RF-UI-005] POST train trả về ngay; tác vụ fit và tải lịch sử nằm ở luồng nền Python, có khóa chống trùng.
  async function train() {
    const controller = new AbortController();
    trainController.current = controller;
    setTrainingRequest(true);
    setTrainError("");
    try {
      const value = await mlPost<MLStatus>(
        "train",
        { latitude: place.latitude, longitude: place.longitude },
        controller.signal,
      );
      if (controller.signal.aborted) return;
      setStatus(value);
      setStatusRevision((v) => v + 1);
    } catch (e) {
      if (!controller.signal.aborted)
        setTrainError(e instanceof Error ? e.message : "Chưa huấn luyện được.");
    } finally {
      if (!controller.signal.aborted) setTrainingRequest(false);
    }
  }

  // [RF-UI-006] Chỉ đổi đơn vị trên bản sao cho biểu đồ; CSV/đánh giá gốc luôn là °C.
  const chart =
    model?.backtest.map((row) => ({
      ...row,
      actual: toTemp(row.actual, unit),
      predicted: toTemp(row.predicted, unit),
      baseline: toTemp(row.baseline, unit),
    })) || [];
  const improvement = model?.mae_improvement_percent;

  return (
    <section
      className="card rf-panel"
      id="random-forest"
      aria-labelledby="rf-title"
    >
      <div className="rf-heading">
        <div className="rf-heading-icon">
          <BrainCircuit size={22} />
        </div>
        <div className="rf-heading-copy">
          <div className="rf-eyebrow">MÔ HÌNH RIÊNG · THỰC NGHIỆM</div>
          <h2 id="rf-title">Dự báo bằng Random Forest</h2>
          <p>Thêm một góc nhìn cho giờ kế tiếp tại {place.name}</p>
        </div>
        <span
          className={`rf-status ${busy ? "is-training" : model ? "is-ready" : ""}`}
        >
          {busy ? <LoaderCircle className="spin" size={12} /> : <span />}
          {busy ? "Đang học" : model ? "Đã huấn luyện" : "Chưa sẵn sàng"}
        </span>
      </div>

      {(serverError || trainError || status?.state === "error") && (
        <div className="rf-notice rf-notice-error" role="alert">
          {serverError || trainError || status?.message}
          <button onClick={() => setStatusRevision((v) => v + 1)}>
            Đọc lại trạng thái
          </button>
        </div>
      )}
      {status?.state === "missing_dependencies" && (
        <div className="rf-notice">
          <strong>Cần cài thư viện học máy một lần</strong>
          <code>python -m pip install -r requirements.txt</code>
          <p>
            Sau đó mở lại app.py. Các phần thời tiết hiện tại vẫn sử dụng được.
          </p>
          <button onClick={() => setStatusRevision((v) => v + 1)}>
            Tôi đã cài, kiểm tra lại
          </button>
        </div>
      )}
      {status?.state === "ready" &&
        status.message.includes("Dùng lịch sử đã lưu") && (
          <div className="rf-notice">{status.message}</div>
        )}

      {!model && status?.state !== "missing_dependencies" && (
        <div className="rf-empty">
          <div className="rf-empty-art">
            <Database size={28} />
            <Sparkles size={16} />
          </div>
          <h3>
            {busy
              ? "Đang học từ lịch sử thời tiết"
              : "Cho mô hình làm quen với địa điểm này"}
          </h3>
          <p>
            {busy
              ? status?.message
              : status?.has_history
                ? "Đã có CSV lịch sử thật. Có thể huấn luyện tại máy, kể cả khi không có Internet."
                : "Mô hình học tối đa 365 ngày dữ liệu theo giờ, kiểm thử trên phần cuối trước khi dự đoán."}
          </p>
          {busy && (
            <div className="rf-progress" aria-label="Đang xử lý">
              <span />
            </div>
          )}
          {!busy && (
            <button
              className="rf-primary-button"
              onClick={train}
              disabled={!status || !!serverError}
            >
              <BrainCircuit size={16} /> Huấn luyện cho {place.name}
            </button>
          )}
        </div>
      )}

      {model && (
        <>
          {/* [RF-UI-007] RF, API và nhiệt độ đầu vào là ba giá trị riêng; không dùng giá trị API tương lai để giả làm dự đoán ML. */}
          <div className="rf-prediction-grid">
            <div className="rf-prediction-main">
              <div className="rf-prediction-label">
                <Sparkles size={13} /> RANDOM FOREST
              </div>
              <div className="rf-big-temperature">
                {displayTemp(prediction?.temperature)}
                <span>°{unit}</span>
              </div>
              <strong>
                {prediction
                  ? `${clockTime(prediction.target_time)} · ${shortDate(prediction.target_time)}`
                  : predicting
                    ? "Đang đọc dữ liệu đầu vào…"
                    : "Nhiệt độ giờ kế tiếp"}
              </strong>
              <p>
                {prediction
                  ? `Dùng lịch sử đến ${clockTime(prediction.as_of)} · GMT+7`
                  : "Chưa có dự đoán mới"}
              </p>
            </div>
            <div className="rf-comparison">
              <span>API cùng mốc giờ</span>
              <strong>
                {displayTemp(apiNext)}
                <small>°{unit}</small>
              </strong>
              <p>Dự báo của Open-Meteo</p>
            </div>
            <div className="rf-comparison">
              <span>Thay đổi RF dự đoán</span>
              <strong>
                {prediction && prediction.delta > 0 ? "+" : ""}
                {prediction ? num(prediction.delta * errorScale, 1) : "—"}
                <small>°{unit}</small>
              </strong>
              <p>So với đầu vào giờ trước</p>
            </div>
          </div>
          {prediction?.stale && (
            <div className="rf-notice">
              Đầu vào đã cũ hơn 2 giờ. Đây là dự đoán cho mốc ghi trên thẻ,
              không phải thời điểm hiện tại.
            </div>
          )}
          {predictionError && (
            <div className="rf-notice" role="alert">
              Chưa có dự đoán mới: {predictionError} Kết quả kiểm thử lịch sử
              vẫn xem được bên dưới.
            </div>
          )}
          <div className="rf-actions">
            <span>
              {busy
                ? status?.message
                : `Model học ${num(model.supervised_samples)} mẫu theo giờ`}
            </span>
            <button
              onClick={() => setPredictionRevision((v) => v + 1)}
              disabled={predicting || busy}
            >
              <RefreshCw size={13} className={predicting ? "spin" : ""} />{" "}
              {predicting ? "Đang đọc…" : "Đọc lại đầu vào"}
            </button>
          </div>

          {/* [RF-UI-008] MAE/RMSE là sai số trên holdout 20% theo thời gian. Không gọi đây là phần trăm chính xác. */}
          <div className="rf-metrics">
            <div>
              <span>MAE kiểm thử</span>
              <strong>
                {num(model.metrics.mae * errorScale, 2)}
                <small>°{unit}</small>
              </strong>
              <p>Sai số tuyệt đối trung bình</p>
            </div>
            <div>
              <span>RMSE kiểm thử</span>
              <strong>
                {num(model.metrics.rmse * errorScale, 2)}
                <small>°{unit}</small>
              </strong>
              <p>Nhạy với sai số lớn</p>
            </div>
            <div>
              <span>Số giờ kiểm thử</span>
              <strong>{num(model.test_samples)}</strong>
              <p>20% cuối · giữ thứ tự thời gian</p>
            </div>
          </div>
          <div
            className={`rf-baseline-note ${improvement != null && improvement > 0 ? "is-better" : ""}`}
          >
            <TrendingUp size={15} />
            <span>
              {improvement == null
                ? "Chưa so được baseline do nhãn gần như không đổi."
                : improvement > 0
                  ? `MAE giảm ${num(improvement, 1)}% so với cách đoán “giờ sau bằng giờ trước”, trên tập kiểm thử này.`
                  : "Ở tập kiểm thử này RF chưa vượt cách đoán “giờ sau bằng giờ trước”. Kết quả được giữ nguyên để đối chiếu."}
            </span>
          </div>

          <details className="rf-details">
            <summary>
              <span>
                <FlaskConical size={15} /> Kiểm thử & cách mô hình học
              </span>
              <ChevronDown size={15} />
            </summary>
            <div className="rf-details-body">
              <div className="rf-chart-heading">
                <div>
                  <h3>72 giờ cuối của tập kiểm thử</h3>
                  <p>
                    {shortDate(model.test_end_target)} · dữ liệu lịch sử ERA5
                  </p>
                </div>
                <a
                  href={mlUrl("export", place.latitude, place.longitude)}
                  download
                >
                  <Download size={13} /> CSV kiểm thử
                </a>
              </div>
              <div
                className="rf-chart"
                role="img"
                aria-label="So sánh nhiệt độ ERA5, dự đoán Random Forest và Persistence trên tập kiểm thử lịch sử"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chart}
                    margin={{ top: 10, right: 8, left: -15, bottom: 0 }}
                  >
                    <CartesianGrid
                      vertical={false}
                      stroke="var(--chart-grid)"
                      strokeDasharray="3 5"
                    />
                    <XAxis
                      dataKey="time"
                      tickFormatter={clockTime}
                      minTickGap={38}
                      tick={{ fill: "var(--subtle)", fontSize: 9 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      domain={["dataMin - 1", "dataMax + 1"]}
                      tickFormatter={(v) => `${Math.round(v)}°`}
                      tick={{ fill: "var(--subtle)", fontSize: 9 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      labelFormatter={(label) =>
                        `${clockTime(String(label))} · ${shortDate(String(label))}`
                      }
                      formatter={(value, name) => [
                        `${num(Number(value), 2)}°${unit}`,
                        name,
                      ]}
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid var(--border)",
                        background: "var(--card)",
                        fontSize: 11,
                      }}
                    />
                    <Line
                      name="ERA5 lịch sử"
                      type="linear"
                      dataKey="actual"
                      stroke="#96a3b8"
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={false}
                    />
                    <Line
                      name="Random Forest"
                      type="linear"
                      dataKey="predicted"
                      stroke="#3478ef"
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={false}
                    />
                    <Line
                      name="Persistence"
                      type="linear"
                      dataKey="baseline"
                      stroke="#c4aa72"
                      strokeDasharray="3 4"
                      strokeWidth={1}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="rf-chart-legend">
                <span>
                  <i className="rf-dot-actual" /> ERA5 lịch sử
                </span>
                <span>
                  <i className="rf-dot-predicted" /> Random Forest
                </span>
                <span>
                  <i className="rf-dot-baseline" /> Persistence
                </span>
              </div>
              <div className="rf-table-wrapper">
                <table className="rf-score-table">
                  <caption>
                    Đánh giá trên cùng {num(model.test_samples)} mẫu, từ{" "}
                    {shortDate(model.test_start_target)} đến{" "}
                    {shortDate(model.test_end_target)}. Sai số theo °{unit}.
                  </caption>
                  <thead>
                    <tr>
                      <th>Phương pháp</th>
                      <th>MAE</th>
                      <th>RMSE</th>
                      <th>R²</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: "Random Forest", score: model.metrics },
                      { label: "Persistence", score: model.baseline },
                    ].map((row) => (
                      <tr key={row.label}>
                        <td>{row.label}</td>
                        <td>{num(row.score.mae * errorScale, 3)}</td>
                        <td>{num(row.score.rmse * errorScale, 3)}</td>
                        <td>{num(row.score.r2, 3)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="rf-importance">
                <h3>Yếu tố mô hình sử dụng nhiều nhất</h3>
                <p>
                  Độ quan trọng trên toàn mô hình, không chứng minh quan hệ nhân
                  quả.
                </p>
                {model.feature_importance.slice(0, 5).map((feature) => (
                  <div className="rf-feature-row" key={feature.name}>
                    <div>
                      <span>{feature.name}</span>
                      <strong>{num(feature.value * 100, 1)}%</strong>
                    </div>
                    <div className="rf-feature-track">
                      <i style={{ width: `${feature.value * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="rf-method-notes">
                <p>
                  <strong>Phương pháp:</strong> RandomForestRegressor ·{" "}
                  {model.parameters.n_estimators} cây · {model.features} đặc
                  trưng. Học biến thiên nhiệt độ rồi cộng vào nhiệt độ đầu vào.
                </p>
                <p>
                  <strong>Dữ liệu:</strong> {num(model.raw_rows)} giờ ERA5 từ{" "}
                  {shortDate(model.history_start)} đến{" "}
                  {shortDate(model.history_end)}. Đây là tái phân tích khí
                  tượng, không phải trạm đo tại nhà bạn.
                </p>
                <p>
                  <strong>Kiểm thử:</strong> 80% đầu để học, 20% cuối để đánh
                  giá; cách một mẫu ở biên. Model triển khai được refit toàn bộ
                  lịch sử sau khi chốt điểm kiểm thử.
                </p>
                <p>
                  <strong>Đầu vào hiện tại:</strong> ước tính theo giờ từ
                  Forecast API. Nguồn đầu vào khác ERA5 nên sai số vận hành có
                  thể khác sai số lịch sử. Chưa có đánh giá bằng quan trắc độc
                  lập.
                </p>
                <a
                  href={model.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Nguồn dữ liệu huấn luyện <ArrowUpRight size={12} />
                </a>
              </div>
              <button
                className="rf-retrain-button"
                onClick={train}
                disabled={busy}
              >
                <BrainCircuit size={14} />{" "}
                {busy
                  ? "Đang huấn luyện…"
                  : "Huấn luyện lại / cập nhật lịch sử"}
              </button>
            </div>
          </details>
        </>
      )}
      <div className="rf-footnote">
        <FlaskConical size={12} />
        <span>
          Mô hình học máy thực nghiệm cho nhiệt độ một giờ tiếp theo. Dự báo 7
          ngày và khả năng mưa phía trên vẫn từ Open-Meteo.
        </span>
      </div>
    </section>
  );
}
