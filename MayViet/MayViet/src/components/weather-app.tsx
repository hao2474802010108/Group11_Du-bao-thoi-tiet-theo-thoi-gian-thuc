// [APP-000] MÀN HÌNH CHÍNH: trạng thái, vòng đời tải dữ liệu, thao tác người dùng và bố cục. Chú thích JSX nằm trong {/* ... */}.
"use client";

// [APP-001] Các hook React: useState giữ trạng thái, useEffect làm việc bên ngoài render, useMemo ghi nhớ kết quả, useRef giữ phần tử, useCallback giữ hàm.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
// [APP-002] Các hook React: useState giữ trạng thái, useEffect làm việc bên ngoài render, useMemo ghi nhớ kết quả, useRef giữ phần tử, useCallback giữ hàm.
import type { ReactNode, KeyboardEvent } from "react";
// [APP-003] Bộ icon SVG cho nút và chỉ số. Icon chỉ minh họa; số liệu vẫn đến từ API.
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Check,
  ChevronDown,
  ChevronRight,
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Compass,
  Droplets,
  Eye,
  Heart,
  Info,
  LayoutGrid,
  Leaf,
  LoaderCircle,
  LocateFixed,
  MapPin,
  Menu,
  Moon,
  Navigation,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  Sun,
  Sunrise,
  Sunset,
  Thermometer,
  Umbrella,
  Wind,
  X,
  CalendarDays,
  CircleAlert,
} from "lucide-react";
// [APP-004] Các kiểu và hàm xử lý thuần được dùng chung với component theo giờ và các bài kiểm tra.
import {
  PLACES,
  clockTime,
  dayLabel,
  direction,
  fold,
  isPlace,
  num,
  shortDate,
  temp,
  toTemp,
  weatherInfo,
} from "@/lib/weather";
// [APP-005] Các kiểu và hàm xử lý thuần được dùng chung với component theo giờ và các bài kiểm tra.
import type { CityWeather, Forecast, Place } from "@/lib/weather";
// [APP-006] Tầng dữ liệu gọi Open-Meteo trực tiếp từ trình duyệt; component không tự dựng logic fetch/cache.
import {
  fetchCities,
  fetchForecast,
  forecastUrl,
  searchPlaces,
} from "@/lib/weather-client";
// [APP-007] Tách biểu đồ và các thẻ từng giờ thành component riêng để dễ đọc và bảo trì.
import HourlyForecast from "@/components/hourly-forecast";

// [APP-008] Chỉ cho phép C hoặc F làm đơn vị hiển thị; dữ liệu gốc vẫn dùng °C.
type Unit = "C" | "F";
// [APP-009] Bảng ánh xạ WeatherKind sang component icon; tra bảng tránh viết nhiều nhánh JSX giống nhau.
const WEATHER_ICONS = {
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
// [APP-010] Tên khóa cài đặt và yêu thích trong localStorage của trình duyệt hiện tại.
const STORAGE = {
  preferences: "may-viet-preferences-v1",
  favorites: "may-viet-favorites-v1",
};
// [APP-011] Đọc và giải mã JSON; nếu storage hỏng hoặc bị chặn thì trả null, tránh làm sập giao diện.
function readStorage<T>(key: string): T | null {
  try {
    const s = localStorage.getItem(key);
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}
// [APP-012] Lưu đối tượng bằng JSON.stringify. Bắt lỗi vì storage có thể đầy hoặc không khả dụng.
function saveStorage(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* Không ghi được storage thì vẫn cho ứng dụng tiếp tục hoạt động trong phiên hiện tại. */
  }
}
// [APP-013] Chọn icon từ mã WMO; tham số mặc định giúp component vẫn render khi chưa có dữ liệu.
function WeatherIcon({
  code,
  isDay = true,
  size = 26,
  className = "",
}: {
  code?: number | null;
  isDay?: boolean;
  size?: number;
  className?: string;
}) {
  const kind = weatherInfo(code, isDay).kind;
  const Icon = WEATHER_ICONS[kind];
  return (
    <Icon
      size={size}
      strokeWidth={1.7}
      className={`weather-icon weather-${kind} ${className}`}
      aria-hidden="true"
    />
  );
}
// [APP-014] Logo bằng icon và chữ; small thu gọn cách hiển thị ở màn hình hẹp.
function Brand({ small = false }: { small?: boolean }) {
  return (
    <div className={`brand ${small ? "brand-small" : ""}`}>
      <span className="brand-mark">
        <CloudSun size={25} strokeWidth={2} />
      </span>
      <span>
        Mây<span className="brand-light">Việt</span>
        <small>BẦU TRỜI TRONG TẦM TAY</small>
      </span>
    </div>
  );
}
// [APP-015] Minh họa mây, nắng, mưa bằng các phần tử CSS. Đây là trang trí dựa trên mã WMO, không phải ảnh radar.
function WeatherScene({ code, isDay }: { code: number; isDay: boolean }) {
  const kind = weatherInfo(code, isDay).kind;
  const rainy = ["rain", "drizzle", "storm"].includes(kind);
  return (
    <div
      className={`weather-scene scene-kind-${kind} ${!isDay ? "scene-night" : ""}`}
      aria-hidden="true"
    >
      <div className="scene-orbit orbit-one" />
      <div className="scene-orbit orbit-two" />
      {isDay ? (
        <div className="scene-sun">
          <div />
        </div>
      ) : (
        <div className="scene-moon" />
      )}
      {kind !== "sun" && kind !== "moon" && (
        <>
          <div className="scene-cloud cloud-back" />
          <div className="scene-cloud cloud-front" />
        </>
      )}
      {rainy && (
        <div className="scene-rain">
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
      )}
      {kind === "storm" && <div className="scene-lightning" />}
      <span className="scene-spark spark-one" />
      <span className="scene-spark spark-two" />
      <span className="scene-spark spark-three" />
    </div>
  );
}
// [APP-016] Khung chỉ số dùng lại cho UV, gió, độ ẩm... children là phần nội dung chi tiết truyền từ bên ngoài.
function MetricCard({
  icon,
  title,
  value,
  suffix,
  children,
  className = "",
}: {
  icon: ReactNode;
  title: string;
  value: string;
  suffix?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`card metric-card ${className}`}>
      <div className="metric-title">
        {icon}
        <h3>{title}</h3>
      </div>
      <div className="metric-value">
        {value}
        <span>{suffix}</span>
      </div>
      {children}
    </section>
  );
}
// [APP-017] Component cha phối hợp dữ liệu và các thao tác. Mỗi lần setState, React tính lại giao diện cần cập nhật.
export default function WeatherApp() {
  // [APP-018] Địa điểm đang chọn; mặc định Hồ Chí Minh. setPlace đổi địa điểm và kích hoạt effect tải dự báo.
  const [place, setPlace] = useState<Place>(PLACES[0]);
  // [APP-019] Gắn dự báo với placeId để khi đổi địa điểm không hiển thị nhầm dữ liệu của nơi cũ.
  const [bundle, setBundle] = useState<{
    placeId: string;
    data: Forecast;
  } | null>(null);
  // [APP-020] Cờ đang tải, dùng để hiện trạng thái chờ và vô hiệu hóa thao tác phù hợp.
  const [loading, setLoading] = useState(true);
  // [APP-021] Thông báo lỗi tải dự báo chính; chuỗi rỗng nghĩa là không có lỗi.
  const [error, setError] = useState("");
  // [APP-022] Cờ cho biết lần cập nhật thất bại; dữ liệu đang giữ có thể đã cũ.
  const [stale, setStale] = useState(false);
  // [APP-023] Chờ khôi phục cài đặt từ localStorage trước khi tải và ghi lại tùy chọn.
  const [ready, setReady] = useState(false);
  // [APP-024] Đơn vị nhiệt độ đang hiển thị, C hoặc F; đổi đơn vị không cần gọi lại API.
  const [unit, setUnit] = useState<Unit>("C");
  // [APP-025] Giao diện sáng/tối; effect gắn vào data-theme của thẻ html để CSS đổi màu.
  const [theme, setTheme] = useState<"light" | "dark">("light");
  // [APP-026] Danh sách địa điểm đã lưu trên trình duyệt này, không phải tài khoản trên máy chủ.
  const [favorites, setFavorites] = useState<Place[]>([]);
  // [APP-027] Bộ đếm làm mới thủ công. Tăng số để effect chạy lại; tầng API vẫn giữ khoảng chờ tối thiểu 30 giây.
  const [revision, setRevision] = useState(0);
  // [APP-028] Dữ liệu rút gọn của 4 thẻ thành phố ở phần khám phá.
  const [cities, setCities] = useState<CityWeather[]>([]);
  // [APP-029] Theo dõi lỗi riêng cho thẻ thành phố, không thay thế lỗi dự báo chính.
  const [citiesError, setCitiesError] = useState(false);
  // [APP-030] Nội dung ô tìm kiếm; thay đổi sẽ kích hoạt effect debounce.
  const [query, setQuery] = useState("");
  // [APP-031] Cho biết danh sách gợi ý tìm kiếm có đang mở hay không.
  const [searchOpen, setSearchOpen] = useState(false);
  // [APP-032] Các địa danh do Geocoding API trả về, được kết hợp với danh sách PLACES.
  const [remoteResults, setRemoteResults] = useState<Place[]>([]);
  // [APP-033] Cờ đang đợi tìm kiếm, dùng để hiện biểu tượng tải.
  const [searching, setSearching] = useState(false);
  // [APP-034] Cờ lỗi nguồn tìm kiếm để vẫn có thể dùng địa điểm mẫu.
  const [searchError, setSearchError] = useState(false);
  // [APP-035] Chỉ số kết quả đang được chọn bằng bàn phím; -1 nghĩa là chưa chọn.
  const [searchIndex, setSearchIndex] = useState(-1);
  // [APP-036] Chỉ số ngày đang chọn trong dự báo 7 ngày; 0 là hôm nay.
  const [selectedDay, setSelectedDay] = useState(0);
  // [APP-037] Màn hình đang xem: tổng quan hoặc địa điểm đã lưu.
  const [view, setView] = useState<"overview" | "saved">("overview");
  // [APP-038] Điều khiển thanh điều hướng dạng trượt ở màn hình nhỏ.
  const [mobileMenu, setMobileMenu] = useState(false);
  // [APP-039] Đóng/mở bảng cài đặt đơn vị và chủ đề.
  const [settings, setSettings] = useState(false);
  // [APP-040] Đóng/mở hộp giải thích nguồn dữ liệu và quyền riêng tư.
  const [info, setInfo] = useState(false);
  // [APP-041] Thông báo ngắn sau thao tác lưu/bỏ lưu/định vị; tự ẩn sau 3,8 giây.
  const [toast, setToast] = useState("");
  // [APP-042] Cờ đang chờ trình duyệt trả vị trí GPS/Wi-Fi/IP.
  const [locating, setLocating] = useState(false);
  // [APP-043] Đồng hồ để hiển thị ngày hiện tại; cập nhật mỗi phút, không gọi API thời tiết mỗi phút.
  const [now, setNow] = useState<Date | null>(null);
  // [APP-044] Tham chiếu khung tìm kiếm để nhận biết thao tác bấm ra ngoài.
  const searchRef = useRef<HTMLDivElement>(null);
  // [APP-045] Tham chiếu khung cài đặt để đóng khi bấm ra ngoài.
  const settingsRef = useRef<HTMLDivElement>(null);
  // [APP-046] Tham chiếu input, dùng focus/blur sau thao tác bàn phím hoặc nút tìm kiếm.
  const searchInput = useRef<HTMLInputElement>(null);
  // [APP-047] Chỉ nhận dữ liệu nếu bundle thuộc đúng địa điểm đang chọn.
  const data = bundle?.placeId === place.id ? bundle.data : null;
  // [APP-048] Kiểm tra địa điểm hiện tại có trong favorites để tô nút ngôi sao.
  const isSaved = favorites.some((f) => f.id === place.id);

  // [APP-049] Khởi tạo một lần: đọc cài đặt/yêu thích hợp lệ, tạo đồng hồ mỗi 60 giây; cleanup xóa timer khi component được tháo.
  useEffect(() => {
    // [APP-050] Khôi phục dữ liệu lưu, sau đó vẫn kiểm tra từng giá trị thay vì tin hoàn toàn nội dung localStorage.
    const prefs = readStorage<{
      unit?: Unit;
      place?: Place;
      theme?: "light" | "dark";
    }>(STORAGE.preferences);
    if (prefs?.unit === "F") setUnit("F");
    if (prefs?.theme === "dark") setTheme("dark");
    if (isPlace(prefs?.place)) setPlace(prefs.place);
    const saved = readStorage<unknown[]>(STORAGE.favorites);
    if (Array.isArray(saved)) setFavorites(saved.filter(isPlace).slice(0, 30));
    setNow(new Date());
    setReady(true);
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);
  // [APP-051] Khi unit/place/theme đổi và đã ready: cập nhật data-theme và lưu tùy chọn. Mảng phụ thuộc kiểm soát lúc effect chạy lại.
  useEffect(() => {
    if (!ready) return;
    document.documentElement.dataset.theme = theme;
    saveStorage(STORAGE.preferences, { unit, place, theme });
  }, [ready, unit, place, theme]);
  // [APP-052] Lưu favorites sau khi khôi phục xong, tránh ghi đè danh sách cũ bằng mảng rỗng lúc khởi động.
  useEffect(() => {
    if (ready) saveStorage(STORAGE.favorites, favorites);
  }, [favorites, ready]);
  // [APP-053] Đăng ký bấm ngoài và phím Esc để đóng các bảng. Cleanup gỡ listener để tránh rò rỉ và xử lý trùng.
  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!searchRef.current?.contains(e.target as Node)) setSearchOpen(false);
      if (!settingsRef.current?.contains(e.target as Node)) setSettings(false);
    };
    const escape = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearchOpen(false);
        setSettings(false);
        setInfo(false);
        setMobileMenu(false);
      }
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", escape);
    };
  }, []);
  // [APP-054] Toast có nội dung thì hẹn 3.800 ms để ẩn; thay toast hoặc rời component sẽ hủy timer cũ.
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 3800);
    return () => clearTimeout(timer);
  }, [toast]);

  // [APP-055] Vòng đời dự báo chính: đọc bản thành công gần nhất (<3 giờ), tải API, kiểm tra mỗi 15 phút khi tab hiển thị và khi quay lại tab.
  useEffect(() => {
    if (!ready) return;
    const controller = new AbortController();
    // [APP-056] Khóa lưu bản dự báo thành công gần nhất theo tọa độ; dùng khi mở lại hoặc gặp lỗi mạng.
    const key = `may-viet-weather-${place.latitude}-${place.longitude}`;
    // [APP-057] Bản dự báo đã lưu ở giao diện; khác cache URL trong weather-client.ts.
    const cached = readStorage<Forecast>(key);
    if (
      cached?.current &&
      cached.hourly?.time &&
      cached.daily?.time &&
      Date.now() - Date.parse(cached.fetchedAt) < 3 * 60 * 60 * 1000
    ) {
      setBundle((prev) =>
        prev?.placeId === place.id ? prev : { placeId: place.id, data: cached },
      );
    }
    // [APP-097] Mốc thành công gần nhất quyết định có cần tải lại sau 15 phút hay không; khác đồng hồ now của giao diện.
    let lastSuccess =
      cached?.current?.time &&
      cached.hourly?.time?.length &&
      cached.daily?.time?.length
        ? Date.parse(cached.fetchedAt)
        : 0;
    // [APP-098] Cờ cục bộ ngăn hai lần load trong cùng vòng đời effect chạy chồng nhau.
    let inFlight = false;
    // [APP-058] Tải dự báo chính: chặn tải trùng, kiểm tra tuổi cache, cập nhật trạng thái và giữ dữ liệu cũ khi lỗi.
    async function load(force = false) {
      if (inFlight) return;
      if (!force && lastSuccess && Date.now() - lastSuccess < 15 * 60_000) {
        setLoading(false);
        setError("");
        setStale(false);
        return;
      }
      inFlight = true;
      setLoading(true);
      setError("");
      setStale(false);
      try {
        const payload = await fetchForecast(
          place.latitude,
          place.longitude,
          force,
        );
        // [APP-099] Controller trong component chỉ ngăn kết quả cũ ghi vào giao diện sau khi đổi nơi. fetch chia sẻ có controller/timeout riêng ở weather-client.ts.
        if (controller.signal.aborted) return;
        lastSuccess = Date.parse(payload.fetchedAt);
        setBundle({ placeId: place.id, data: payload });
        setStale(false);
        saveStorage(key, payload);
      } catch (e) {
        if (controller.signal.aborted) return;
        setError(
          e instanceof Error
            ? e.message
            : "Chưa tải được thời tiết. Vui lòng thử lại.",
        );
        setStale(true);
      } finally {
        inFlight = false;
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    // [APP-100] Lần đầu dùng cache thường; sau thao tác làm mới, force=true nhưng không vượt quy tắc 30 giây của tầng API.
    load(revision > 0);
    const interval = setInterval(
      () => {
        // [APP-101] Lần kiểm tra theo timer chỉ chạy khi tab hiển thị để giảm công việc khi người dùng ở tab khác.
        if (document.visibilityState === "visible") load();
      },
      15 * 60 * 1000,
    );
    const onVisible = () => {
      if (document.visibilityState === "visible") load();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      // [APP-102] Cleanup đánh dấu vòng đời cũ đã kết thúc; đồng thời xóa timer và listener phía dưới.
      controller.abort();
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [ready, place.id, place.latitude, place.longitude, revision]);
  // [APP-059] Vòng đời thẻ thành phố: lấy 4 nơi bằng batch, kiểm tra mỗi 15 phút; timer này chưa được chặn theo visibility như dự báo chính.
  useEffect(() => {
    if (!ready) return;
    const controller = new AbortController();
    // [APP-060] Tải tóm tắt 4 địa điểm mẫu bằng một request, thay vì gọi riêng từng thành phố.
    async function loadCities() {
      try {
        const d = await fetchCities(PLACES.slice(0, 4), revision > 0);
        if (controller.signal.aborted) return;
        setCities(d.cities);
        setCitiesError(false);
      } catch {
        if (!controller.signal.aborted) setCitiesError(true);
      }
    }
    loadCities();
    const timer = setInterval(loadCities, 15 * 60 * 1000);
    return () => {
      controller.abort();
      clearInterval(timer);
    };
  }, [ready, revision]);
  // [APP-061] Debounce tìm kiếm 350 ms: chỉ gửi khi dừng gõ; đổi từ khóa sẽ hủy timer và bỏ qua kết quả cũ.
  useEffect(() => {
    const q = query.trim();
    setSearchIndex(-1);
    setRemoteResults([]);
    setSearchError(false);
    if (q.length < 2) {
      setSearching(false);
      return;
    }
    const controller = new AbortController();
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const places = await searchPlaces(q);
        if (!controller.signal.aborted)
          setRemoteResults(places.filter(isPlace));
      } catch {
        if (!controller.signal.aborted) setSearchError(true);
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
      // [APP-103] Khoảng chờ 350 ms là debounce, không phải khoảng dự báo thời tiết.
    }, 350);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  // [APP-062] useMemo kết hợp tìm kiếm tên không dấu/tên tắt với kết quả API; bỏ kết quả gần trùng tọa độ và giữ tối đa 8 mục.
  const results = useMemo(() => {
    const q = fold(query);
    if (!q) return PLACES.slice(0, 6);
    const local = PLACES.filter(
      (p) =>
        fold(p.name).includes(q) || p.aliases?.some((a) => fold(a).includes(q)),
    );
    return [
      ...local,
      ...remoteResults.filter(
        (p) =>
          !local.some(
            (l) =>
              Math.abs(l.latitude - p.latitude) < 0.1 &&
              Math.abs(l.longitude - p.longitude) < 0.1,
          ),
      ),
    ].slice(0, 8);
  }, [query, remoteResults]);
  // [APP-063] Hàm chọn địa điểm dùng lại ở tìm kiếm, GPS và thẻ thành phố; đồng thời đặt lại ngày, ô tìm kiếm và menu.
  const selectPlace = useCallback((p: Place) => {
    setPlace(p);
    setSelectedDay(0);
    setSearchOpen(false);
    setQuery("");
    setView("overview");
    setMobileMenu(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  // [APP-064] Thêm/bỏ một địa điểm, tối đa 30 mục. Cập nhật bằng prev để dùng danh sách mới nhất.
  function toggleFavorite(p = place) {
    const saved = favorites.some((f) => f.id === p.id);
    // [APP-104] Giới hạn số địa điểm lưu để danh sách gọn và tránh tăng dữ liệu localStorage quá nhiều.
    if (!saved && favorites.length >= 30) {
      setToast("Bạn có thể lưu tối đa 30 địa điểm.");
      return;
    }
    setFavorites((prev) =>
      saved ? prev.filter((f) => f.id !== p.id) : [...prev, p],
    );
    setToast(saved ? `Đã bỏ lưu ${p.name}` : `Đã lưu ${p.name} vào yêu thích`);
  }
  // [APP-065] Đổi màn hình tổng quan/đã lưu; mục Dự báo cuộn đến vùng #weekly sau khi vùng đó được render.
  function navigate(destination: "overview" | "forecast" | "saved") {
    setMobileMenu(false);
    setView(destination === "saved" ? "saved" : "overview");
    if (destination === "forecast")
      setTimeout(
        () =>
          document
            .getElementById("weekly")
            ?.scrollIntoView({ behavior: "smooth", block: "start" }),
        60,
      );
    else window.scrollTo({ top: 0, behavior: "smooth" });
  }
  // [APP-066] Hỗ trợ bàn phím trong tìm kiếm: ↑/↓ chọn kết quả, Enter mở địa điểm.
  function onSearchKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSearchOpen(true);
      setSearchIndex((i) => Math.min(i + 1, results.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSearchIndex((i) => Math.max(i - 1, 0));
    }
    if (e.key === "Enter" && results.length) {
      e.preventDefault();
      selectPlace(results[Math.max(0, searchIndex)]);
      searchInput.current?.blur();
    }
  }
  // [APP-067] Xin vị trí qua Geolocation của trình duyệt; chỉ chạy khi người dùng nhấn nút định vị.
  function locate() {
    if (!navigator.geolocation) {
      setToast(
        "Trình duyệt này chưa hỗ trợ định vị. Bạn có thể tìm địa điểm bằng tên.",
      );
      return;
    }
    setLocating(true);
    // [APP-105] API định vị của trình duyệt, không phải API thời tiết. Trình duyệt sẽ quản lý quyền vị trí.
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const { latitude, longitude } = pos.coords;
        if (
          latitude < 7 ||
          latitude > 24 ||
          longitude < 101 ||
          longitude > 118
        ) {
          setToast(
            "Vị trí đang ở ngoài khu vực hỗ trợ. Hãy chọn một địa điểm tại Việt Nam.",
          );
          return;
        }
        selectPlace({
          id: `gps-${latitude.toFixed(3)}-${longitude.toFixed(3)}`,
          name: "Vị trí của bạn",
          latitude: Number(latitude.toFixed(4)),
          longitude: Number(longitude.toFixed(4)),
          region: `${latitude.toFixed(3)}°B · ${longitude.toFixed(3)}°Đ`,
        });
      },
      (e) => {
        setLocating(false);
        setToast(
          e.code === 1
            ? "Bạn chưa cho phép định vị. Hãy cấp quyền vị trí hoặc tìm địa điểm bằng tên."
            : "Chưa xác định được vị trí. Bạn có thể thử lại hoặc tìm địa điểm bằng tên.",
        );
      },
      // [APP-106] Ưu tiên tiết kiệm tài nguyên; chờ tối đa 12 giây và chấp nhận vị trí đã có tối đa 5 phút.
      { enableHighAccuracy: false, timeout: 12_000, maximumAge: 300_000 },
    );
  }

  // [APP-068] Rút ngắn đường dẫn đến nhóm dữ liệu hiện tại; ?. cho phép data chưa tải xong.
  const current = data?.current;
  // [APP-069] Nhóm dự báo tổng hợp theo ngày, dùng cho nhiệt độ cao/thấp và mặt trời mọc/lặn.
  const daily = data?.daily;
  // [APP-070] Tên tiếng Việt và nhóm minh họa được suy ra từ mã WMO và cờ ngày/đêm.
  const weather = weatherInfo(current?.weather_code, current?.is_day !== 0);
  // [APP-071] Tìm giờ đang chứa current.time trong mảng hourly; dùng để lấy UV và 24 giờ cần xem.
  const startIndex = data
    ? Math.max(
        0,
        data.hourly.time.findIndex(
          (t) => t.slice(0, 13) >= data.current.time.slice(0, 13),
        ),
      )
    : 0;
  // [APP-072] Chỉ số UV của giờ tương ứng; giữ giá trị thiếu để giao diện không báo UV = 0 sai lệch.
  const uv = data?.hourly.uv_index[startIndex];
  // [APP-073] Chuyển giá trị UV thành mức diễn giải: thấp, trung bình, cao, rất cao, cực cao.
  const uvLabel =
    uv == null
      ? "Chưa có dữ liệu"
      : uv < 3
        ? "Thấp"
        : uv < 6
          ? "Trung bình"
          : uv < 8
            ? "Cao"
            : uv < 11
              ? "Rất cao"
              : "Cực cao";
  // [APP-074] Chọn lớp màu theo UV; nhãn ở trên vẫn phân biệt khi thiếu dữ liệu.
  const uvClass = uv == null || uv < 3 ? "green" : uv < 6 ? "amber" : "orange";
  // [APP-075] Trong 24 giờ tới, lấy những giờ có khả năng mưa từ 60% để tạo lời nhắc mang ô.
  const rainHours = data
    ? data.hourly.time
        .slice(startIndex, startIndex + 24)
        .map((t, j) => ({
          t,
          p: data.hourly.precipitation_probability[startIndex + j],
        }))
        .filter((h) => h.p != null && h.p >= 60)
    : [];
  // [APP-076] Lời nhắc theo quy tắc if/else: ưu tiên mưa, rồi nóng cảm nhận ≥35°C, cuối cùng là gợi ý chung. Không phải AI tự học.
  const tip = rainHours.length
    ? {
        title: "Đừng quên một chiếc ô",
        text: `Khả năng mưa từ ${clockTime(rainHours[0].t)} ngày ${shortDate(rainHours[0].t)} đạt ${num(rainHours[0].p)}%. Mang theo ô hoặc áo mưa khi ra ngoài.`,
        kind: "rain",
      }
    : (current?.apparent_temperature ?? 0) >= 35
      ? {
          title: "Nhớ giữ mát cho mình",
          text: `Nhiệt độ cảm nhận đang ở mức ${temp(current?.apparent_temperature, unit)}${unit}. Uống đủ nước và ưu tiên nơi có bóng mát.`,
          kind: "sun",
        }
      : {
          title: "Sẵn sàng cho ngày của bạn",
          text: "Xem dự báo theo giờ để chọn thời điểm phù hợp cho kế hoạch ngoài trời. Thời tiết địa phương có thể thay đổi.",
          kind: "leaf",
        };
  // [APP-077] Định dạng ngày theo tiếng Việt và múi giờ Việt Nam dù laptop dùng múi giờ khác.
  const dateText = now
    ? new Intl.DateTimeFormat("vi-VN", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
        timeZone: "Asia/Ho_Chi_Minh",
      }).format(now)
    : "Giờ Việt Nam · GMT+7";
  // [APP-078] Chuẩn hóa tiến trình từ bình minh đến hoàng hôn về khoảng 0..1 để đặt biểu tượng trên cung minh họa.
  const sunProgress =
    current && daily
      ? Math.max(
          0,
          Math.min(
            1,
            (Date.parse(`${current.time}+07:00`) -
              Date.parse(`${daily.sunrise[0]}+07:00`)) /
              (Date.parse(`${daily.sunset[0]}+07:00`) -
                Date.parse(`${daily.sunrise[0]}+07:00`)),
          ),
        )
      : 0;

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Đến nội dung chính
      </a>
      {mobileMenu && (
        <button
          className="sidebar-backdrop"
          onClick={() => setMobileMenu(false)}
          aria-label="Đóng menu"
        />
      )}
      <aside
        className={`sidebar ${mobileMenu ? "is-open" : ""}`}
        aria-label="Điều hướng chính"
      >
        <button
          className="brand-button"
          onClick={() => navigate("overview")}
          aria-label="Mây Việt — trang chủ"
        >
          <Brand />
        </button>
        <div className="sidebar-label">KHÁM PHÁ BẦU TRỜI</div>
        <nav className="main-nav">
          <button
            className={view === "overview" ? "nav-item active" : "nav-item"}
            onClick={() => navigate("overview")}
          >
            <LayoutGrid size={19} />
            <span>Tổng quan</span>
            <span className="nav-dot" />
          </button>
          <button className="nav-item" onClick={() => navigate("forecast")}>
            <CalendarDays size={19} />
            <span>Dự báo 7 ngày</span>
          </button>
          <button
            className={view === "saved" ? "nav-item active" : "nav-item"}
            onClick={() => navigate("saved")}
          >
            <Heart size={19} />
            <span>Địa điểm đã lưu</span>
            {favorites.length > 0 && (
              <span className="nav-count">{favorites.length}</span>
            )}
          </button>
        </nav>
        <div className="sidebar-separator" />
        <div className="sidebar-label saved-label">
          ĐỊA ĐIỂM CỦA BẠN
          <button
            onClick={() => {
              setSearchOpen(true);
              searchInput.current?.focus();
              setMobileMenu(false);
            }}
            aria-label="Tìm địa điểm để lưu"
          >
            <Plus size={16} />
          </button>
        </div>
        <div className="sidebar-places">
          {favorites.length ? (
            favorites.slice(0, 5).map((p) => (
              <button
                className={`saved-place ${place.id === p.id ? "selected" : ""}`}
                key={p.id}
                onClick={() => selectPlace(p)}
              >
                <MapPin size={16} />
                <span>{p.name}</span>
                {place.id === p.id && current ? (
                  <strong>{temp(current.temperature_2m, unit)}</strong>
                ) : (
                  <ChevronRight size={14} />
                )}
              </button>
            ))
          ) : (
            <p className="saved-empty">
              Chạm vào <Star size={12} /> để lưu những nơi bạn yêu thích.
            </p>
          )}
        </div>
        <div className="sidebar-bottom">
          <div className="little-sky">
            <div className="little-sun" />
            <Cloud size={62} fill="white" strokeWidth={0} />
            <span className="sky-dot one" />
            <span className="sky-dot two" />
          </div>
          <h3>
            Mỗi ngày,
            <br />
            một bầu trời mới.
          </h3>
          <p>
            Để Mây Việt cùng bạn
            <br />
            chuẩn bị cho ngày thật đẹp.
          </p>
          <button onClick={() => setInfo(true)}>
            Về Mây Việt{" "}
            <ArrowUp size={13} style={{ transform: "rotate(45deg)" }} />
          </button>
        </div>
        <div className="sidebar-footer">
          <span className="live-dot" /> Dữ liệu từ Open-Meteo
        </div>
      </aside>

      {/* [APP-079] Vùng nội dung chính; id main là đích đến của liên kết hỗ trợ bàn phím. */}
      <main className="main-content" id="main">
        {/* [APP-080] Tiêu đề, tìm kiếm, định vị và cài đặt; input được điều khiển bằng state query. */}
        <header className="topbar">
          <div className="mobile-brand">
            <button
              className="icon-button"
              onClick={() => setMobileMenu(true)}
              aria-label="Mở menu"
            >
              <Menu size={22} />
            </button>
            <Brand small />
          </div>
          <div className="page-heading">
            <div className="eyebrow">
              <span /> MÂY VIỆT · THỜI TIẾT VIỆT NAM
            </div>
            <h1>
              {view === "saved" ? "Những nơi bạn yêu" : "Thời tiết hôm nay"}
              <span className="heading-sun">✦</span>
            </h1>
            <p>{dateText}</p>
          </div>
          <div className="header-actions">
            {/* [APP-081] Khối combobox: kết quả mẫu xuất hiện ngay, kết quả API bổ sung sau debounce. */}
            <div className="search-wrapper" ref={searchRef}>
              <div className={`search-box ${searchOpen ? "focused" : ""}`}>
                <Search size={19} />
                <input
                  ref={searchInput}
                  role="combobox"
                  aria-expanded={searchOpen}
                  aria-controls="location-results"
                  aria-activedescendant={
                    searchIndex >= 0 ? `result-${searchIndex}` : undefined
                  }
                  aria-autocomplete="list"
                  aria-label="Tìm địa điểm ở Việt Nam"
                  placeholder="Tìm thành phố, địa điểm..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSearchOpen(true);
                  }}
                  onFocus={() => setSearchOpen(true)}
                  onKeyDown={onSearchKey}
                />
                {query ? (
                  <button
                    onClick={() => {
                      setQuery("");
                      searchInput.current?.focus();
                    }}
                    aria-label="Xóa tìm kiếm"
                  >
                    <X size={16} />
                  </button>
                ) : (
                  <span className="search-key">VN</span>
                )}
              </div>
              {searchOpen && (
                <div className="search-results">
                  <div className="search-label">
                    {query ? "ĐỊA ĐIỂM TẠI VIỆT NAM" : "ĐỊA ĐIỂM PHỔ BIẾN"}
                    {searching && <LoaderCircle size={14} className="spin" />}
                  </div>
                  <div
                    role="listbox"
                    id="location-results"
                    aria-label="Kết quả tìm địa điểm"
                  >
                    {results.map((p, i) => (
                      <button
                        role="option"
                        aria-selected={searchIndex === i}
                        id={`result-${i}`}
                        className={`search-result ${searchIndex === i ? "highlighted" : ""}`}
                        key={p.id}
                        onClick={() => selectPlace(p)}
                      >
                        <span className="result-pin">
                          <MapPin size={17} />
                        </span>
                        <span>
                          <strong>{p.name}</strong>
                          <small>{p.region || "Việt Nam"}</small>
                        </span>
                        <ArrowRight size={15} />
                      </button>
                    ))}
                  </div>
                  {!results.length && !searching && (
                    <p className="search-empty">
                      {searchError
                        ? "Chưa kết nối được tìm kiếm. Hãy thử tên thành phố lớn."
                        : "Chưa tìm thấy địa điểm. Hãy thử tên khác hoặc bỏ dấu."}
                    </p>
                  )}
                  {searchError && results.length > 0 && (
                    <p className="search-note">
                      Đang hiển thị các địa điểm có sẵn.
                    </p>
                  )}
                  <div className="search-footer">
                    <MapPin size={12} /> Tìm kiếm theo tên · Dữ liệu GeoNames
                  </div>
                </div>
              )}
            </div>
            <button
              className={`icon-button location-button ${locating ? "locating" : ""}`}
              title="Dùng vị trí của tôi"
              aria-label="Dùng vị trí của tôi"
              disabled={locating}
              onClick={locate}
            >
              {locating ? (
                <LoaderCircle size={20} className="spin" />
              ) : (
                <LocateFixed size={20} />
              )}
            </button>
            {/* [APP-082] Bảng chọn °C/°F và sáng/tối; đổi state rồi CSS/formatter tự cập nhật. */}
            <div className="settings-wrapper" ref={settingsRef}>
              <button
                className={`icon-button settings-button ${settings ? "selected" : ""}`}
                onClick={() => setSettings((s) => !s)}
                aria-label="Cài đặt hiển thị"
                aria-expanded={settings}
              >
                <SlidersHorizontal size={19} />
              </button>
              {settings && (
                <div className="settings-popover">
                  <h3>Tùy chỉnh hiển thị</h3>
                  <label>Đơn vị nhiệt độ</label>
                  <div className="segmented">
                    {(["C", "F"] as const).map((u) => (
                      <button
                        key={u}
                        className={unit === u ? "active" : ""}
                        onClick={() => setUnit(u)}
                      >
                        °{u} {unit === u && <Check size={13} />}
                      </button>
                    ))}
                  </div>
                  <label>Giao diện</label>
                  <div className="segmented">
                    <button
                      className={theme === "light" ? "active" : ""}
                      onClick={() => setTheme("light")}
                    >
                      <Sun size={14} /> Sáng
                    </button>
                    <button
                      className={theme === "dark" ? "active" : ""}
                      onClick={() => setTheme("dark")}
                    >
                      <Moon size={14} /> Tối
                    </button>
                  </div>
                  <p>Cài đặt được lưu trên trình duyệt này.</p>
                </div>
              )}
            </div>
          </div>
        </header>

        {view === "overview" ? (
          <>
            {/* [APP-083] Tab địa điểm và trạng thái lần tải gần nhất; nút làm mới tăng revision. */}
            <div className="location-bar">
              <div className="location-tabs">
                {PLACES.slice(0, 4).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => selectPlace(p)}
                    className={
                      place.id === p.id ? "location-tab active" : "location-tab"
                    }
                  >
                    {place.id === p.id && <MapPin size={14} />} {p.name}
                  </button>
                ))}
                {!PLACES.slice(0, 4).some((p) => p.id === place.id) && (
                  <button className="location-tab active">
                    <MapPin size={14} />
                    {place.name}
                  </button>
                )}
                <button
                  className="add-location"
                  onClick={() => {
                    setSearchOpen(true);
                    searchInput.current?.focus();
                  }}
                  aria-label="Tìm địa điểm khác"
                >
                  <Plus size={17} />
                </button>
              </div>
              <div className={`update-status ${stale ? "is-stale" : ""}`}>
                <span
                  className={stale ? "status-dot stale-dot" : "status-dot"}
                />
                {loading
                  ? "Đang cập nhật..."
                  : stale
                    ? "Kết nối gián đoạn"
                    : "Tự cập nhật mỗi 15 phút"}
                <button
                  className="refresh-button"
                  onClick={() => setRevision((v) => v + 1)}
                  disabled={loading}
                  aria-label="Làm mới dữ liệu"
                  title="Làm mới dữ liệu"
                >
                  <RefreshCw size={14} className={loading ? "spin" : ""} />
                </button>
              </div>
            </div>
            {error && (
              <div className="error-banner" role="alert">
                <CircleAlert size={19} />
                <span>
                  {error}
                  {data && (
                    <>
                      {" "}
                      Đang hiển thị dữ liệu đã lưu:{" "}
                      {clockTime(data.current.time)} ·{" "}
                      {shortDate(data.current.time)}.
                    </>
                  )}
                </span>
                <button
                  onClick={() => setRevision((v) => v + 1)}
                  disabled={loading}
                >
                  Thử lại
                </button>
              </div>
            )}

            {/* [APP-084] Bố cục hai cột: thời tiết hiện tại/theo giờ/chỉ số và dự báo ngày/mặt trời/gợi ý. */}
            <div className="primary-grid">
              <div className="weather-main">
                <section
                  className={`current-card ${current?.is_day === 0 ? "current-night" : ""}`}
                  aria-label={`Thời tiết hiện tại tại ${place.name}`}
                >
                  {/* [APP-085] Tên địa điểm và nút yêu thích; nút gọi toggleFavorite, không gửi dữ liệu tài khoản. */}
                  <div className="current-top">
                    <div>
                      <div className="current-location">
                        <MapPin size={19} />
                        <h2>{place.name}</h2>
                        <span className="country-label">VIỆT NAM</span>
                      </div>
                      <p>
                        {place.region || "Việt Nam"} <span>·</span>{" "}
                        {current
                          ? `${clockTime(current.time)} GMT+7`
                          : "Đang kết nối dữ liệu"}
                      </p>
                    </div>
                    <button
                      className={`favorite-button ${isSaved ? "is-saved" : ""}`}
                      aria-label={
                        isSaved ? `Bỏ lưu ${place.name}` : `Lưu ${place.name}`
                      }
                      title={isSaved ? "Bỏ lưu địa điểm" : "Lưu địa điểm"}
                      aria-pressed={isSaved}
                      onClick={() => toggleFavorite()}
                    >
                      <Star
                        size={20}
                        fill={isSaved ? "currentColor" : "none"}
                      />
                    </button>
                  </div>
                  {current ? (
                    <>
                      <div className="current-body">
                        <div className="current-reading">
                          <div className="current-temperature">
                            {temp(current.temperature_2m, unit)}
                            <span>{unit}</span>
                          </div>
                          <div className="current-description">
                            {weather.label}
                          </div>
                          <div className="current-range">
                            <span>
                              <ArrowUp size={13} />{" "}
                              {temp(daily?.temperature_2m_max[0], unit)}
                            </span>
                            <span>
                              <ArrowDown size={13} />{" "}
                              {temp(daily?.temperature_2m_min[0], unit)}
                            </span>
                            <span className="feels-label">
                              Cảm nhận{" "}
                              {temp(current.apparent_temperature, unit)}
                            </span>
                          </div>
                        </div>
                        <WeatherScene
                          code={current.weather_code}
                          isDay={current.is_day === 1}
                        />
                      </div>
                      {/* [APP-086] Tóm tắt độ ẩm, gió, khả năng mưa; mỗi chỉ số có đơn vị riêng. */}
                      <div className="current-stats">
                        <div>
                          <Droplets size={17} />
                          <span>
                            Độ ẩm{" "}
                            <strong>
                              {num(current.relative_humidity_2m)}%
                            </strong>
                          </span>
                        </div>
                        <div>
                          <Wind size={18} />
                          <span>
                            Gió{" "}
                            <strong>
                              {num(current.wind_speed_10m, 1)} km/h
                            </strong>
                          </span>
                        </div>
                        <div>
                          <Umbrella size={17} />
                          <span>
                            Mưa hôm nay{" "}
                            <strong>
                              {num(daily?.precipitation_probability_max[0])}%
                            </strong>
                          </span>
                        </div>
                      </div>
                    </>
                  ) : loading ? (
                    <div className="current-loading">
                      <div className="skeleton temperature-skeleton" />
                      <div className="skeleton line-skeleton" />
                      <div className="skeleton line-skeleton short" />
                      <div className="loading-orb" />
                    </div>
                  ) : (
                    <div className="current-unavailable">
                      <Cloud size={55} />
                      <h3>Chờ một chút nhé, mây đang ghé qua</h3>
                      <p>Chưa tải được dữ liệu tại {place.name}.</p>
                      <button onClick={() => setRevision((v) => v + 1)}>
                        <RefreshCw size={15} /> Kết nối lại
                      </button>
                    </div>
                  )}
                  <svg
                    className="city-silhouette"
                    viewBox="0 0 700 90"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path d="M0 90V65h25V50h20v40h15V38h24v52h15V60h25V25h15v-9h10v9h15v65h18V48h28v42h12V65h20v25h15V35h15V22h8V7h4v15h8v13h16v55h22V60h30v30h15V42h12V29h18v13h12v48h25V67h16v23h15V51h23v39h15V31h13V18h10V31h13v59h20V62h20v28h15V47h24v43h30V70h32v20h20V56h26v34h25V68h20v22h40Z" />
                  </svg>
                </section>

                {/* [APP-087] Truyền dữ liệu và ngày đã chọn xuống component từng giờ; onSource mở hộp nguồn dữ liệu. */}
                <HourlyForecast
                  data={data}
                  loading={loading}
                  selectedDay={selectedDay}
                  place={place}
                  unit={unit}
                  onSource={() => setInfo(true)}
                />

                {/* [APP-088] Các chỉ số nổi bật dùng MetricCard để tái sử dụng bố cục. */}
                <section className="highlights-section">
                  <div className="section-heading">
                    <h2>Hôm nay có gì đáng chú ý?</h2>
                    <span className="section-caption">Chi tiết thời tiết</span>
                  </div>
                  <div className="metrics-grid">
                    <MetricCard
                      icon={<Sun size={17} />}
                      title="Chỉ số UV"
                      value={num(uv, 1)}
                    >
                      <div className="uv-meter">
                        <span />
                        <span />
                        <span />
                        <span />
                        <span />
                        {uv != null && (
                          <i
                            style={{
                              left: `${Math.min(98, Math.max(2, (uv / 12) * 100))}%`,
                            }}
                          />
                        )}
                      </div>
                      <p className="metric-note">
                        <span className={`small-tag tag-${uvClass}`}>
                          {uvLabel}
                        </span>
                        <span>Đỉnh ngày: {num(daily?.uv_index_max[0], 1)}</span>
                      </p>
                    </MetricCard>
                    <MetricCard
                      icon={<Wind size={17} />}
                      title="Tốc độ gió"
                      value={num(current?.wind_speed_10m, 1)}
                      suffix="km/h"
                      className="wind-card"
                    >
                      <div className="wind-compass">
                        <span>B</span>
                        <Navigation
                          size={28}
                          fill="currentColor"
                          style={{
                            transform: `rotate(${(current?.wind_direction_10m || 0) + 180 - 45}deg)`,
                          }}
                        />
                        <span>N</span>
                      </div>
                      <p className="metric-note">
                        Từ {direction(current?.wind_direction_10m)}{" "}
                        <span>
                          · Giật {num(current?.wind_gusts_10m, 1)} km/h
                        </span>
                      </p>
                    </MetricCard>
                    <MetricCard
                      icon={<Droplets size={17} />}
                      title="Độ ẩm"
                      value={num(current?.relative_humidity_2m)}
                      suffix="%"
                    >
                      <div className="humidity-meter">
                        <i
                          style={{
                            width: `${current?.relative_humidity_2m ?? 0}%`,
                          }}
                        />
                      </div>
                      <p className="metric-note">
                        <span>Độ ẩm tương đối</span>
                        <Droplets size={13} />
                      </p>
                    </MetricCard>
                    <MetricCard
                      icon={<Thermometer size={17} />}
                      title="Nhiệt độ cảm nhận"
                      value={temp(current?.apparent_temperature, unit)}
                      suffix={unit}
                    >
                      <p className="metric-note two-line">
                        {current?.apparent_temperature == null ||
                        current.temperature_2m == null
                          ? "Đang chờ dữ liệu thời tiết"
                          : Math.abs(
                                current.apparent_temperature -
                                  current.temperature_2m,
                              ) < 1
                            ? "Gần với nhiệt độ thực tế"
                            : `${current.apparent_temperature > current.temperature_2m ? "Cao" : "Thấp"} hơn nhiệt độ thực ${num(Math.abs(toTemp(current.apparent_temperature, unit)! - toTemp(current.temperature_2m, unit)!), 1)}°${unit}`}
                        <span>Tính đến độ ẩm và gió</span>
                      </p>
                    </MetricCard>
                    <MetricCard
                      icon={<Eye size={17} />}
                      title="Tầm nhìn"
                      value={num(
                        data?.hourly.visibility[startIndex] == null
                          ? null
                          : data.hourly.visibility[startIndex]! / 1000,
                        1,
                      )}
                      suffix="km"
                    >
                      <div className="visibility-lines">
                        <i />
                        <i />
                        <i />
                      </div>
                      <p className="metric-note">
                        {data?.hourly.visibility[startIndex] == null
                          ? "Chưa có dữ liệu"
                          : data.hourly.visibility[startIndex]! >= 10000
                            ? "Tầm nhìn xa tốt"
                            : data.hourly.visibility[startIndex]! >= 5000
                              ? "Tầm nhìn trung bình"
                              : "Tầm nhìn hạn chế"}
                        <span>Ước tính theo giờ</span>
                      </p>
                    </MetricCard>
                    <MetricCard
                      icon={<Cloud size={17} />}
                      title="Mây che phủ"
                      value={num(current?.cloud_cover)}
                      suffix="%"
                    >
                      <div className="cloud-cover-visual">
                        <Cloud size={38} />
                        <span>Áp suất tại mặt đất</span>
                      </div>
                      <p className="metric-note">
                        <strong>{num(current?.surface_pressure, 1)} hPa</strong>
                      </p>
                    </MetricCard>
                  </div>
                </section>
              </div>

              <aside className="weather-aside">
                {/* [APP-089] Danh sách 7 ngày; chọn một hàng cập nhật selectedDay cho cả chi tiết và biểu đồ từng giờ. */}
                <section
                  className="card weekly-section"
                  id="weekly"
                  aria-labelledby="weekly-title"
                >
                  <div className="section-heading">
                    <h2 id="weekly-title">Dự báo 7 ngày</h2>
                    <CalendarDays size={18} />
                  </div>
                  <p className="weekly-subtitle">
                    Chọn một ngày để xem chi tiết
                  </p>
                  <div className="weekly-rows">
                    {daily ? (
                      daily.time.map((d, i) => (
                        <button
                          className={`day-row ${selectedDay === i ? "selected" : ""}`}
                          key={d}
                          onClick={() => setSelectedDay(i)}
                          aria-pressed={selectedDay === i}
                        >
                          <span className="day-name">
                            <strong>{dayLabel(d, i)}</strong>
                            <small>{shortDate(d)}</small>
                          </span>
                          <span className="day-weather">
                            <WeatherIcon
                              code={daily.weather_code[i]}
                              size={25}
                            />
                            <small>
                              <Droplets size={9} />
                              {num(daily.precipitation_probability_max[i])}%
                            </small>
                          </span>
                          <span className="day-temperatures">
                            <strong>
                              {temp(daily.temperature_2m_max[i], unit)}
                            </strong>
                            <span>
                              {temp(daily.temperature_2m_min[i], unit)}
                            </span>
                          </span>
                          <ChevronRight size={13} />
                        </button>
                      ))
                    ) : loading ? (
                      Array.from({ length: 7 }, (_, i) => (
                        <div className="day-row day-skeleton" key={i}>
                          <div className="skeleton" />
                          <div className="skeleton" />
                          <div className="skeleton" />
                        </div>
                      ))
                    ) : (
                      <div className="weekly-unavailable">
                        <Cloud size={34} />
                        <p>Chưa tải được dự báo 7 ngày.</p>
                        <button onClick={() => setRevision((v) => v + 1)}>
                          Thử kết nối lại
                        </button>
                      </div>
                    )}
                  </div>
                  {daily && (
                    <div className="selected-day-detail">
                      <div>
                        <span>
                          <Umbrella size={13} /> Lượng mưa
                        </span>
                        <strong>
                          {num(daily.precipitation_sum[selectedDay], 1)} mm
                        </strong>
                      </div>
                      <div>
                        <span>
                          <Wind size={13} /> Gió lớn nhất
                        </span>
                        <strong>
                          {num(daily.wind_speed_10m_max[selectedDay], 1)} km/h
                        </strong>
                      </div>
                    </div>
                  )}
                  <div className="forecast-footnote">
                    <Info size={12} />
                    <span>
                      Dự báo có thể thay đổi theo diễn biến thời tiết.
                    </span>
                  </div>
                </section>

                {/* [APP-090] Hiển thị giờ bình minh/hoàng hôn từ API; cung mặt trời chỉ là minh họa. */}
                <section className="card sun-section">
                  <div className="section-heading">
                    <h2>Mặt trời hôm nay</h2>
                    <Sun size={18} />
                  </div>
                  {/* [APP-091] Cung SVG dùng sunProgress; không phải mô phỏng thiên văn chính xác. */}
                  <div className="sun-arc">
                    <svg viewBox="0 0 280 100" aria-hidden="true">
                      <defs>
                        <linearGradient
                          id="sun-glow"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#ffda7a"
                            stopOpacity=".35"
                          />
                          <stop
                            offset="100%"
                            stopColor="#ffda7a"
                            stopOpacity="0"
                          />
                        </linearGradient>
                      </defs>
                      <path
                        d="M20 85 Q140 -45 260 85L20 85"
                        fill="url(#sun-glow)"
                      />
                      <path
                        d="M20 85 Q140 -45 260 85"
                        fill="none"
                        stroke="#eec765"
                        strokeWidth="1.5"
                        strokeDasharray="4 5"
                      />
                      <line
                        x1="10"
                        y1="85"
                        x2="270"
                        y2="85"
                        stroke="var(--border)"
                      />
                      {current && (
                        <circle
                          cx={20 + 240 * sunProgress}
                          cy={85 - 260 * sunProgress * (1 - sunProgress)}
                          r="8"
                          fill="#f4bd4e"
                          stroke="var(--card)"
                          strokeWidth="3"
                        />
                      )}
                    </svg>
                    <span className="sun-middle">
                      {current
                        ? current.is_day === 0
                          ? "Ban đêm"
                          : "Ban ngày"
                        : "Chờ dữ liệu"}
                    </span>
                  </div>
                  <div className="sun-times">
                    <div>
                      <Sunrise size={18} />
                      <span>
                        Bình minh<strong>{clockTime(daily?.sunrise[0])}</strong>
                      </span>
                    </div>
                    <div>
                      <Sunset size={18} />
                      <span>
                        Hoàng hôn<strong>{clockTime(daily?.sunset[0])}</strong>
                      </span>
                    </div>
                  </div>
                </section>
                {/* [APP-092] Lời nhắc được tạo từ biến tip theo quy tắc đã giải thích ở trên. */}
                <section className="tip-card">
                  <span className="tip-icon">
                    {tip.kind === "rain" ? (
                      <Umbrella size={21} />
                    ) : tip.kind === "sun" ? (
                      <Sun size={21} />
                    ) : (
                      <Leaf size={21} />
                    )}
                  </span>
                  <div className="eyebrow">MỘT CHÚT QUAN TÂM</div>
                  <h3>{data ? tip.title : "Ngày mới, chuẩn bị thật tốt"}</h3>
                  <p>
                    {data
                      ? tip.text
                      : "Tìm địa điểm của bạn để xem thời tiết và chuẩn bị cho kế hoạch hôm nay."}
                  </p>
                  <span className="tip-footer">
                    <Heart size={12} /> Từ Mây Việt, dành cho bạn
                  </span>
                </section>
              </aside>
            </div>

            {/* [APP-093] Bốn thẻ thành phố dùng dữ liệu batch; bấm thẻ gọi selectPlace. */}
            <section className="explore-section">
              <div className="section-heading">
                <div>
                  <h2>Một vòng Việt Nam</h2>
                  <p>Cùng một ngày, những sắc trời khác nhau</p>
                </div>
                <button
                  className="text-button"
                  onClick={() => {
                    setSearchOpen(true);
                    searchInput.current?.focus();
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  Khám phá thêm <ArrowRight size={15} />
                </button>
              </div>
              <div className="city-cards">
                {PLACES.slice(0, 4).map((p, i) => {
                  const c = cities.find((c) => c.id === p.id);
                  return (
                    <button
                      className={`city-card city-${i} ${place.id === p.id ? "city-selected" : ""}`}
                      key={p.id}
                      onClick={() => selectPlace(p)}
                    >
                      <div className="city-card-top">
                        <span>{p.region}</span>
                        <ArrowUp size={15} />
                      </div>
                      <div className="city-card-main">
                        <div>
                          <h3>{p.name}</h3>
                          <p>
                            {c
                              ? weatherInfo(c.code, c.isDay).label
                              : citiesError
                                ? "Chạm để xem dự báo"
                                : "Đang tải thời tiết..."}
                          </p>
                        </div>
                        {c ? (
                          <>
                            <WeatherIcon
                              code={c.code}
                              isDay={c.isDay}
                              size={35}
                            />
                            <strong>{temp(c.temperature, unit)}</strong>
                          </>
                        ) : (
                          <Cloud size={30} />
                        )}
                      </div>
                      <div className="city-art" aria-hidden="true">
                        <i />
                        <i />
                        <i />
                        <i />
                        <i />
                        <i />
                        <i />
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          </>
        ) : (
          <section className="saved-view">
            <div className="saved-view-heading">
              <p>Lưu một địa điểm để bầu trời nơi ấy luôn ở gần bạn.</p>
              <button
                className="primary-button"
                onClick={() => {
                  setQuery("");
                  setSearchOpen(true);
                  searchInput.current?.focus();
                }}
              >
                <Plus size={17} /> Thêm địa điểm
              </button>
            </div>
            {favorites.length ? (
              <div className="saved-grid">
                {favorites.map((p) => (
                  <div className="card saved-city-card" key={p.id}>
                    <button
                      className="saved-city-main"
                      onClick={() => selectPlace(p)}
                    >
                      <span className="saved-city-icon">
                        <MapPin size={23} />
                      </span>
                      <div>
                        <h2>{p.name}</h2>
                        <p>{p.region || "Việt Nam"}</p>
                        <span>
                          Xem dự báo <ArrowRight size={14} />
                        </span>
                      </div>
                    </button>
                    <button
                      className="remove-saved icon-button"
                      title={`Bỏ lưu ${p.name}`}
                      aria-label={`Bỏ lưu ${p.name}`}
                      onClick={() => toggleFavorite(p)}
                    >
                      <Star size={18} fill="currentColor" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-saved card">
                <div className="empty-saved-art">
                  <Heart size={45} />
                  <CloudSun size={30} />
                </div>
                <h2>Chưa có địa điểm nào được lưu</h2>
                <p>
                  Tìm thành phố bạn yêu thích rồi chạm vào ngôi sao
                  <br />
                  trên thẻ thời tiết để lưu vào đây.
                </p>
                <button
                  className="primary-button"
                  onClick={() => {
                    setSearchOpen(true);
                    searchInput.current?.focus();
                  }}
                >
                  Tìm địa điểm đầu tiên <ArrowRight size={16} />
                </button>
              </div>
            )}
          </section>
        )}

        {/* [APP-094] Ghi nguồn dữ liệu, giấy phép và thời điểm nhận để người xem kiểm tra độ mới. */}
        <footer className="page-footer">
          <div>
            <span className="footer-cloud">
              <CloudSun size={16} />
            </span>
            <span>
              Mây Việt <span className="footer-divider">·</span> Bầu trời trong
              tầm tay
            </span>
          </div>
          <div>
            <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">
              Dữ liệu Open-Meteo
            </a>
            <span>·</span>
            <button onClick={() => setInfo(true)}>
              Thông tin dữ liệu <Info size={12} />
            </button>
          </div>
        </footer>
        {current && view === "overview" && (
          <p className="data-timestamp">
            Dữ liệu thời tiết: {clockTime(current.time)} ngày{" "}
            {shortDate(current.time)} (GMT+7). Giá trị hiện tại được ước tính từ
            mô hình; có thể khác quan trắc tại chỗ.
          </p>
        )}
      </main>
      {toast && (
        <div className="toast" role="status">
          <Check size={17} />
          <span>{toast}</span>
          <button onClick={() => setToast("")} aria-label="Đóng thông báo">
            <X size={15} />
          </button>
        </div>
      )}
      {info && (
        <div className="modal-backdrop" onClick={() => setInfo(false)}>
          {/* [APP-095] Hộp giới thiệu nguồn/API/quyền riêng tư; đóng bằng nút hoặc Esc. */}
          <section
            className="info-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="info-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close icon-button"
              onClick={() => setInfo(false)}
              aria-label="Đóng thông tin"
            >
              <X size={20} />
            </button>
            <Brand />
            <h2 id="info-title">Hiểu hơn về bầu trời của bạn</h2>
            <p>
              Mây Việt giúp bạn theo dõi thời tiết tại các địa điểm ở Việt Nam,
              với dữ liệu từ Open-Meteo và tìm kiếm địa danh từ GeoNames.
            </p>
            <div className="info-item">
              <RefreshCw size={20} />
              <div>
                <strong>Cập nhật có thời điểm rõ ràng</strong>
                <p>
                  Ứng dụng kiểm tra dữ liệu mỗi 15 phút khi đang mở. Tần suất mô
                  hình được cập nhật phụ thuộc nguồn cung cấp; tải lại không
                  đồng nghĩa có bản dự báo mới.
                </p>
              </div>
            </div>
            <div className="info-item">
              <CloudSun size={20} />
              <div>
                <strong>Dự báo từ mô hình thời tiết</strong>
                <p>
                  Thời tiết hiện tại là giá trị ước tính từ mô hình. Dữ liệu 15
                  phút ở Việt Nam có thể được nội suy từ dữ liệu theo giờ. Đây
                  không phải số đo từ cảm biến ngay tại vị trí của bạn.
                </p>
              </div>
            </div>
            <div className="info-item">
              <ShieldCheck size={20} />
              <div>
                <strong>Vị trí và dữ liệu của bạn</strong>
                <p>
                  Chỉ lấy vị trí khi bạn nhấn nút định vị và cấp quyền. Tọa độ
                  được gửi đến dịch vụ thời tiết để lấy dự báo. Địa điểm yêu
                  thích và cài đặt được lưu trên trình duyệt của bạn.
                </p>
              </div>
            </div>
            {/* [APP-096] Công khai endpoint và liên kết JSON thật cho tọa độ đang chọn. */}
            <div className="api-disclosure">
              <strong>Nguồn API đang sử dụng</strong>
              <a
                href={forecastUrl(place.latitude, place.longitude)}
                target="_blank"
                rel="noopener noreferrer"
              >
                Xem JSON thời tiết tại {place.name}{" "}
                <ArrowUp size={12} style={{ transform: "rotate(45deg)" }} />
              </a>
              <code>api.open-meteo.com/v1/forecast</code>
              <a
                href="https://open-meteo.com/en/docs"
                target="_blank"
                rel="noopener noreferrer"
              >
                Tài liệu API thời tiết
              </a>
              <a
                href="https://open-meteo.com/en/docs/geocoding-api"
                target="_blank"
                rel="noopener noreferrer"
              >
                Tài liệu tìm địa danh (GeoNames)
              </a>
              <code>geocoding-api.open-meteo.com/v1/search</code>
              <p>
                Dữ liệu từng giờ được lấy trực tiếp từ nguồn; việc hiển thị mỗi
                giờ không làm phát sinh một lượt gọi API cho từng giờ.
              </p>
            </div>
            <p className="info-license">
              Dữ liệu thời tiết{" "}
              <a
                href="https://open-meteo.com/"
                target="_blank"
                rel="noreferrer"
              >
                Open-Meteo
              </a>{" "}
              theo{" "}
              <a
                href="https://creativecommons.org/licenses/by/4.0/"
                target="_blank"
                rel="noreferrer"
              >
                CC BY 4.0
              </a>
              ; đã Việt hóa, đổi đơn vị và trực quan hóa. Dự báo phục vụ tham
              khảo, không phải bản tin cảnh báo thiên tai chính thức.
            </p>
            <button className="primary-button" onClick={() => setInfo(false)}>
              Mình đã hiểu <Check size={16} />
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
