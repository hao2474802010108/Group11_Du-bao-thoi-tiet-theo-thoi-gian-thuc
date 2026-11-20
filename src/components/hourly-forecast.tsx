// [HOUR-000] DỰ BÁO TỪNG GIỜ: cùng một danh sách dữ liệu cấp cho biểu đồ, thẻ giờ và bảng chi tiết; cuộn chung để không lệch mốc.
"use client";

// [HOUR-001] Các hook quản lý tab chỉ số, giờ đang chọn, vị trí cuộn và dữ liệu đã chuẩn hóa.
import { useEffect, useMemo, useRef, useState } from "react";
// [HOUR-002] Thư viện vẽ biểu đồ React. AreaChart dựng biểu đồ, XAxis/YAxis là trục, Tooltip hiển thị giá trị khi rê chuột.
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
// [HOUR-003] Icon minh họa thời tiết, điều hướng và các chỉ số.
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Droplets,
  Info,
  Moon,
  Sun,
  Thermometer,
  Umbrella,
  Wind,
} from "lucide-react";
// [HOUR-004] getHourlyTimeline giữ đủ các giờ liên tiếp; formatter và kiểu dữ liệu được dùng chung với màn hình chính.
import {
  clockTime,
  dayLabel,
  getHourlyTimeline,
  num,
  shortDate,
  temp,
  toTemp,
  weatherInfo,
} from "@/lib/weather";
// [HOUR-005] getHourlyTimeline giữ đủ các giờ liên tiếp; formatter và kiểu dữ liệu được dùng chung với màn hình chính.
import type { Forecast, Place } from "@/lib/weather";
// [HOUR-006] Dùng cùng hàm forecastUrl để liên kết dữ liệu gốc khớp đúng địa điểm trên giao diện.
import { forecastUrl } from "@/lib/weather-client";

// [HOUR-007] Chỉ số của biểu đồ: nhiệt độ, xác suất mưa hoặc tốc độ gió.
type Metric = "temperature" | "rain" | "wind";
// [HOUR-008] Đơn vị nhiệt độ hiển thị, C hoặc F.
type Unit = "C" | "F";
// [HOUR-009] Bảng chọn icon theo nhóm thời tiết được weatherInfo trả về.
const icons = {
  sun: Sun,
  moon: Moon,
  partly: CloudSun,
  cloud: Cloud,
  fog: CloudFog,
  rain: CloudRain,
  drizzle: CloudDrizzle,
  storm: CloudLightning,
  snow: CloudSnow,
};
// [HOUR-010] Mỗi mốc chiếm 72 px: dùng chung cho độ rộng biểu đồ, thẻ và quãng cuộn mỗi lần bấm mũi tên.
const STEP = 72;
// [HOUR-011] Chọn icon cho một giờ từ mã WMO và cờ ban ngày/ban đêm.
function HourIcon({ code, isDay }: { code: number | null; isDay: boolean }) {
  const kind = weatherInfo(code, isDay).kind,
    Icon = icons[kind];
  return (
    <Icon
      size={27}
      strokeWidth={1.6}
      className={`weather-icon weather-${kind}`}
      aria-hidden="true"
    />
  );
}
// [HOUR-012] Nội dung tooltip tùy chỉnh: giờ thực, ngày, GMT+7, giá trị và đúng đơn vị của chỉ số.
function HourTooltip({
  active,
  payload,
  label,
  metric,
  unit,
}: {
  active?: boolean;
  payload?: readonly {
    value?: unknown;
    payload?: { date?: string; actualTime?: string };
  }[];
  label?: unknown;
  metric: Metric;
  unit: Unit;
}) {
  // [HOUR-043] Tooltip chưa hoạt động hoặc chưa có dữ liệu thì không render; tránh truy cập phần tử không tồn tại.
  if (!active || !payload?.length) return null;
  const point = payload[0];
  return (
    <div className="chart-tooltip">
      <small>
        {point.payload?.actualTime || String(label)} · {point.payload?.date} ·
        GMT+7
      </small>
      <strong>
        {point.value == null ? "—" : num(Number(point.value), 1)}
        {metric === "temperature"
          ? `°${unit}`
          : metric === "rain"
            ? "%"
            : " km/h"}
      </strong>
      <span>
        {metric === "temperature"
          ? "Nhiệt độ"
          : metric === "rain"
            ? "Khả năng mưa"
            : "Tốc độ gió"}
      </span>
    </div>
  );
}

// [HOUR-013] Nhận dữ liệu từ component cha qua props; quản lý riêng chỉ số biểu đồ và mốc chi tiết đang chọn.
export default function HourlyForecast({
  data,
  loading,
  selectedDay,
  place,
  unit,
  onSource,
}: {
  data: Forecast | null;
  loading: boolean;
  selectedDay: number;
  place: Place;
  unit: Unit;
  onSource: () => void;
}) {
  // [HOUR-014] Tab chỉ số đang chọn; đổi state chỉ tính lại dữ liệu vẽ, không gọi API mới.
  const [metric, setMetric] = useState<Metric>("temperature");
  // [HOUR-015] Khóa mốc được bấm để hiển thị chi tiết; null sẽ chọn mốc đầu danh sách.
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  // [HOUR-016] Cờ đang ở đầu/cuối vùng cuộn để tắt mũi tên không còn tác dụng.
  const [edges, setEdges] = useState({ start: true, end: false });
  // [HOUR-017] Tham chiếu vùng cuộn chung của biểu đồ và hàng thẻ theo giờ.
  const scroller = useRef<HTMLDivElement>(null);
  // [HOUR-018] useMemo chỉ tạo lại danh sách giờ khi data hoặc selectedDay đổi, không lặp lại khi chỉ đóng/mở giao diện khác.
  const hours = useMemo(
    () => (data ? getHourlyTimeline(data, selectedDay) : []),
    [data, selectedDay],
  );
  // [HOUR-019] Tìm mốc được chọn; nếu khóa không còn trong ngày hiện tại thì dùng phần tử đầu.
  const selected = hours.find((h) => h.key === selectedKey) || hours[0];
  // [HOUR-020] Màu nhất quán theo chỉ số: vàng nhiệt độ, xanh dương mưa, xanh ngọc gió.
  const color =
    metric === "temperature"
      ? "#eeb04a"
      : metric === "rain"
        ? "#568be9"
        : "#35a896";
  // [HOUR-021] Chuyển danh sách giờ thành cấu trúc Recharts; time là nhãn, actualTime/date dành cho tooltip, value là chỉ số đang chọn.
  const chart = hours.map((h) => ({
    time: h.isCurrent ? "Bây giờ" : clockTime(h.time),
    actualTime: clockTime(h.time),
    date: shortDate(h.time),
    value:
      metric === "temperature"
        ? toTemp(h.temperature, unit)
        : metric === "rain"
          ? h.rainProbability
          : h.wind,
  }));

  // [HOUR-022] Đo scrollLeft/clientWidth/scrollWidth để biết còn giờ ở bên trái/phải; dung sai 3 px tránh sai số làm tròn.
  function measure() {
    const el = scroller.current;
    if (el)
      setEdges({
        start: el.scrollLeft < 3,
        end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 3,
      });
  }
  // [HOUR-023] Đổi địa điểm hoặc ngày: bỏ chọn mốc cũ, đưa vùng cuộn về đầu và đo lại trạng thái mũi tên.
  useEffect(() => {
    setSelectedKey(null);
    scroller.current?.scrollTo({ left: 0 });
    measure();
  }, [place.id, selectedDay]);
  // [HOUR-024] ResizeObserver đo lại khi khung thay kích thước; disconnect trong cleanup để tránh giữ observer thừa.
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    measure();
    // [HOUR-044] Bỏ qua cơ chế quan sát nếu trình duyệt không có API này, tránh lỗi runtime.
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [hours.length, !!data]);
  // [HOUR-025] Cuộn đúng một bước STEP về trái/phải. direction nhận -1 hoặc 1 từ nút và bàn phím.
  function move(direction: number) {
    // [HOUR-026] Tôn trọng tùy chọn giảm chuyển động của hệ điều hành: dùng cuộn tức thì thay vì smooth.
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    scroller.current?.scrollBy({
      left: direction * STEP,
      behavior: reduce ? "auto" : "smooth",
    });
  }

  return (
    <section
      className="card hourly-section hourly-glass"
      aria-labelledby="hourly-title"
    >
      <div className="section-heading">
        <div>
          <h2 id="hourly-title">
            {selectedDay === 0
              ? "24 giờ tới"
              : `Dự báo ${data ? dayLabel(data.daily.time[selectedDay], selectedDay).toLowerCase() : "theo giờ"}`}
          </h2>
          <p>
            {selectedDay === 0
              ? "Từng giờ liên tiếp, cho mọi kế hoạch của bạn"
              : `${data ? shortDate(data.daily.time[selectedDay]) : ""} · Giờ Việt Nam (GMT+7)`}
          </p>
        </div>
        <span className="hourly-badge">
          <Clock3 size={13} /> Mỗi 1 giờ
        </span>
      </div>
      {/* [HOUR-027] Ba tab chọn chỉ số và hai nút dịch từng giờ; mỗi nút chỉ thay state hoặc vị trí cuộn. */}
      <div className="hourly-toolbar">
        {/* [HOUR-028] role tablist và aria-selected hỗ trợ người dùng bàn phím/trình đọc màn hình. */}
        <div className="chart-tabs" role="tablist" aria-label="Loại biểu đồ">
          {(
            [
              { id: "temperature", label: "Nhiệt độ", icon: Thermometer },
              { id: "rain", label: "Khả năng mưa", icon: Umbrella },
              { id: "wind", label: "Gió", icon: Wind },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={metric === t.id}
              className={metric === t.id ? "active" : ""}
              onClick={() => setMetric(t.id)}
            >
              <t.icon size={15} />
              {t.label}
            </button>
          ))}
        </div>
        {/* [HOUR-029] disabled phụ thuộc edges và danh sách giờ để không cuộn vượt đầu/cuối. */}
        <div className="hour-navigation">
          <button
            onClick={() => move(-1)}
            disabled={edges.start || !hours.length}
            aria-label="Xem giờ trước"
            title="Xem giờ trước"
          >
            <ChevronLeft size={17} />
          </button>
          <button
            onClick={() => move(1)}
            disabled={edges.end || !hours.length}
            aria-label="Xem giờ tiếp theo"
            title="Xem giờ tiếp theo"
          >
            <ChevronRight size={17} />
          </button>
        </div>
      </div>
      {hours.length ? (
        <>
          {/* [HOUR-030] Hiển thị số mốc thực sự có; không khẳng định đủ 24 nếu API cung cấp ít hơn. */}
          <div className="timeline-hint">
            <span>
              <span className="tiny-live-dot" />
              {hours.length} mốc thời gian liên tiếp
            </span>
            <span>
              Kéo ngang hoặc chọn một giờ <ChevronRight size={12} />
            </span>
          </div>
          {/* [HOUR-031] Biểu đồ và thẻ nằm chung một phần tử cuộn; phím ←/→ cũng dùng được khi vùng này có focus. */}
          <div
            className="hourly-scroller"
            ref={scroller}
            onScroll={measure}
            tabIndex={0}
            role="region"
            aria-label="Dự báo từng giờ, cuộn ngang để xem tiếp"
            onKeyDown={(e) => {
              if (
                e.target === e.currentTarget &&
                ["ArrowLeft", "ArrowRight"].includes(e.key)
              ) {
                e.preventDefault();
                move(e.key === "ArrowRight" ? 1 : -1);
              }
            }}
          >
            {/* [HOUR-032] Độ rộng = số giờ ×72 +32 px cho trục Y. Nhờ đó mỗi thẻ khớp đúng điểm trên biểu đồ. */}
            <div
              className="timeline-inner"
              style={{ width: hours.length * STEP + 32 }}
            >
              <div
                className={`weather-chart chart-${metric}`}
                role="img"
                aria-label={`Biểu đồ ${metric === "temperature" ? "nhiệt độ" : metric === "rain" ? "khả năng mưa" : "tốc độ gió"} từng giờ`}
              >
                {/* [HOUR-033] Cho biểu đồ dùng kích thước của khung cha; CSS đặt chiều cao riêng. */}
                <ResponsiveContainer width="100%" height="100%">
                  {/* [HOUR-034] Nguồn data là chart đã chuẩn hóa; không lấy mẫu cách 3 giờ. */}
                  <AreaChart
                    data={chart}
                    margin={{ top: 14, right: 0, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="hourly-chart-fill"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor={color}
                          stopOpacity={0.22}
                        />
                        <stop
                          offset="100%"
                          stopColor={color}
                          stopOpacity={0.01}
                        />
                      </linearGradient>
                    </defs>
                    {/* [HOUR-035] Các đường ngang nét đứt hỗ trợ đọc giá trị, không tạo số liệu. */}
                    <CartesianGrid
                      strokeDasharray="3 6"
                      vertical={false}
                      stroke="var(--chart-grid)"
                    />
                    {/* [HOUR-036] interval=0 giữ mọi nhãn giờ; padding mỗi bên STEP/2 đặt điểm ở giữa thẻ tương ứng. */}
                    <XAxis
                      dataKey="time"
                      padding={{ left: STEP / 2, right: STEP / 2 }}
                      interval={0}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "var(--subtle)", fontSize: 10 }}
                      dy={7}
                    />
                    {/* [HOUR-037] Trục Y rộng 32 px; xác suất mưa cố định 0..100, các chỉ số khác dùng miền phù hợp. */}
                    <YAxis
                      width={32}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "var(--muted)", fontSize: 10 }}
                      domain={
                        metric === "temperature"
                          ? ["dataMin - 2", "dataMax + 2"]
                          : metric === "rain"
                            ? [0, 100]
                            : [0, "auto"]
                      }
                      tickFormatter={(v) =>
                        `${Math.round(v)}${metric === "temperature" ? "°" : metric === "rain" ? "%" : ""}`
                      }
                      tickCount={4}
                    />
                    {/* [HOUR-038] Tooltip dùng HourTooltip để giữ ngày và giờ Việt Nam khi rê chuột qua nửa đêm. */}
                    <Tooltip
                      content={<HourTooltip metric={metric} unit={unit} />}
                      cursor={{
                        stroke: "var(--border)",
                        strokeDasharray: "3 3",
                      }}
                    />
                    {/* [HOUR-039] monotone chỉ làm mượt nét vẽ. connectNulls=false để dữ liệu thiếu tạo khoảng trống, không nối thành số liệu giả. */}
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={color}
                      strokeWidth={2.5}
                      fill="url(#hourly-chart-fill)"
                      activeDot={{
                        r: 5,
                        strokeWidth: 3,
                        stroke: "var(--card)",
                      }}
                      isAnimationActive={false}
                      connectNulls={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              {/* [HOUR-040] Một cột cho mỗi mốc; map không dùng bước nhảy nên giữ cả 00:00, 01:00, 02:00... */}
              <div
                className="hourly-cards"
                style={{
                  gridTemplateColumns: `repeat(${hours.length},minmax(0,1fr))`,
                }}
              >
                {hours.map((h) => (
                  <button
                    className={`hour-item ${h.isCurrent ? "hour-now" : ""} ${selected?.key === h.key ? "hour-selected" : ""}`}
                    key={h.key}
                    aria-label={`${h.isCurrent ? "Bây giờ" : clockTime(h.time)} ngày ${shortDate(h.time)}`}
                    aria-pressed={selected?.key === h.key}
                    onClick={() => setSelectedKey(h.key)}
                  >
                    <span>{h.isCurrent ? "Bây giờ" : clockTime(h.time)}</span>
                    <span className="hour-date">{shortDate(h.time)}</span>
                    <HourIcon code={h.code} isDay={h.isDay} />
                    <strong>{temp(h.temperature, unit)}</strong>
                    <small>
                      <Droplets size={10} />
                      {num(h.rainProbability)}%
                    </small>
                  </button>
                ))}
              </div>
            </div>
          </div>
          {selected && (
            <div className="selected-hour-detail" aria-live="polite">
              <div className="selected-hour-title">
                <Clock3 size={15} />
                <div>
                  <strong>
                    {selected.isCurrent ? "Bây giờ" : clockTime(selected.time)}{" "}
                    <span>· {shortDate(selected.time)}</span>
                  </strong>
                  <small>
                    {weatherInfo(selected.code, selected.isDay).label}
                    {selected.isCurrent
                      ? ` · Dữ liệu lúc ${clockTime(selected.time)}`
                      : " · Dự báo theo giờ"}
                  </small>
                </div>
              </div>
              {/* [HOUR-041] Nhiệt độ, xác suất mưa, gió và độ ẩm của mốc đã chọn; null hiển thị —. */}
              <div className="selected-hour-values">
                <span>
                  <Thermometer size={14} />
                  <strong>
                    {selected.temperature == null
                      ? "—"
                      : `${num(toTemp(selected.temperature, unit), 1)}°${unit}`}
                  </strong>
                </span>
                <span>
                  <Umbrella size={14} />
                  <strong>{num(selected.rainProbability)}%</strong>
                </span>
                <span>
                  <Wind size={14} />
                  <strong>{num(selected.wind, 1)} km/h</strong>
                </span>
                <span>
                  <Droplets size={14} />
                  <strong>{num(selected.humidity)}%</strong>
                </span>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="chart-placeholder">
          {loading ? (
            <>
              <div className="skeleton chart-skeleton" />
              <span>Đang tải dự báo từng giờ...</span>
            </>
          ) : (
            <>
              <Cloud size={32} />
              <span>Biểu đồ sẽ xuất hiện khi có dữ liệu.</span>
            </>
          )}
        </div>
      )}
      {/* [HOUR-042] Nút nguồn và liên kết JSON dùng đúng tọa độ của place, giúp tự kiểm tra dữ liệu thật. */}
      <div className="hourly-source">
        <button onClick={onSource}>
          <Info size={12} /> Nguồn: Open-Meteo
        </button>
        <a
          href={forecastUrl(place.latitude, place.longitude)}
          target="_blank"
          rel="noopener noreferrer"
        >
          Xem dữ liệu gốc <ArrowUpRight size={13} />
        </a>
      </div>
    </section>
  );
}
