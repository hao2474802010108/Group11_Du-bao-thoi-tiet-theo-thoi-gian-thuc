// [API-000] TẦNG GỌI API: dựng URL, dùng cache, gộp yêu cầu trùng và chuyển lỗi mạng thành thông báo dễ hiểu. Không chứa giao diện.
// [API-001] Chỉ nhập kiểu dữ liệu để TypeScript kiểm tra đầu vào/đầu ra; import type không tạo mã JavaScript khi build.
import type { CityWeather, Forecast, Place } from "./weather";

// [API-002] TTL dự báo = 15 phút. 60_000 là 60.000 ms; dấu gạch dưới chỉ giúp đọc số.
const REFRESH_MS = 15 * 60_000;
// [API-003] Làm mới thủ công vẫn dùng cache nếu dữ liệu mới nhận chưa đủ 30 giây, tránh bấm liên tục gọi API.
const MIN_REFRESH_MS = 30_000;
// [API-004] Tiền tố cho khóa localStorage của tầng API, giúp phân biệt với cài đặt và yêu thích.
const PREFIX = "may-viet-direct-v1:";
// [API-005] Cache là cặp giá trị + thời điểm nhận (mili giây). T là kiểu tổng quát: dùng được cho dự báo, thành phố và tìm kiếm.
type Cached<T> = { value: T; receivedAt: number };
// [API-006] Map cache trong RAM của tab hiện tại: tra cứu theo toàn bộ URL, nhanh hơn đọc/giải mã localStorage.
const memory = new Map<string, Cached<unknown>>();
// [API-007] Map các Promise đang chạy. Hai nơi cùng hỏi một URL sẽ chờ chung một yêu cầu mạng.
const pending = new Map<string, Promise<Cached<unknown>>>();
// [API-008] Lưu thời điểm được phép gọi lại theo hostname khi nhà cung cấp trả HTTP 429.
const rateLimits = new Map<string, number>();

// [API-009] Đọc JSON từ localStorage. try/catch xử lý dữ liệu hỏng hoặc trình duyệt chặn storage; khi đó trả undefined.
function read<T>(key: string): T | undefined {
  try {
    if (typeof localStorage !== "undefined")
      return (
        JSON.parse(localStorage.getItem(PREFIX + key) || "null") || undefined
      );
  } catch {
    /* Trình duyệt có thể chặn storage; bỏ qua lỗi để ứng dụng tiếp tục chạy. */
  }
}
// [API-010] Ghi JSON vào localStorage. Nếu hết dung lượng hoặc bị chặn, phần cache RAM vẫn dùng được.
function write(key: string, value: unknown) {
  try {
    if (typeof localStorage !== "undefined")
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* Cache RAM vẫn có thể hoạt động khi localStorage không ghi được. */
  }
}
// [API-032] Lỗi riêng có mã status để phân biệt lỗi HTTP với lỗi mạng; message được đưa lên giao diện.
class DataError extends Error {
  status: number;
  constructor(message: string, status = 0) {
    super(message);
    this.status = status;
  }
}
// [API-011] Tính số giây còn phải đợi, làm tròn lên và tạo thông báo HTTP 429 bằng tiếng Việt.
function waitMessage(until: number) {
  const seconds = Math.max(1, Math.ceil((until - Date.now()) / 1000));
  return `Nguồn dữ liệu đang giới hạn truy cập. Vui lòng chờ khoảng ${seconds} giây trước khi thử lại.`;
}
// [API-012] Retry-After có thể là số giây hoặc ngày HTTP. Nếu thiếu/không hợp lệ, chờ mặc định 60 giây.
function retryTime(header: string | null) {
  if (header?.trim()) {
    const seconds = Number(header);
    if (Number.isFinite(seconds) && seconds > 0)
      return Date.now() + seconds * 1000;
    const date = Date.parse(header);
    if (Number.isFinite(date) && date > Date.now()) return date;
  }
  return Date.now() + 60_000;
}
// [API-013] Hàm gọi JSON dùng chung: cache → kiểm tra giới hạn → gộp yêu cầu → fetch → validate → lưu cache. force không bỏ qua giới hạn 30 giây.
async function publicJson<T>(
  url: string,
  ttl: number,
  force = false,
  validate?: (value: T) => boolean,
): Promise<Cached<T>> {
  // [API-014] Ưu tiên cache RAM; nếu chưa có thì đọc cache bền hơn trong localStorage.
  const cached = (memory.get(url) || read<Cached<T>>(url)) as
    | Cached<T>
    | undefined;
  // [API-033] Chỉ dùng cache khi dữ liệu hợp lệ và tuổi cache nhỏ hơn TTL; làm mới thủ công dùng mốc 30 giây.
  if (
    cached &&
    (!validate || validate(cached.value)) &&
    Number.isFinite(cached.receivedAt) &&
    Date.now() - cached.receivedAt < (force ? MIN_REFRESH_MS : ttl)
  ) {
    memory.set(url, cached);
    return cached;
  }
  // [API-015] Tách hostname để áp dụng thời gian chờ cho mọi địa điểm dùng chung nguồn API.
  const host = new URL(url).hostname;
  // [API-016] Kết hợp thời gian chờ trong RAM và localStorage; tải lại trang cũng không bỏ qua Retry-After.
  const blockedUntil = Math.max(
    rateLimits.get(host) || 0,
    read<number>(`retry:${host}`) || 0,
  );
  // [API-034] Đang trong thời gian chờ thì báo lỗi ngay, không gửi request mới đến nguồn.
  if (blockedUntil > Date.now())
    throw new DataError(waitMessage(blockedUntil), 429);
  // [API-017] Nếu URL này đang tải, tái sử dụng Promise thay vì tạo thêm fetch.
  const existing = pending.get(url);
  // [API-035] Trả cùng Promise cho các lời gọi đồng thời của cùng URL.
  if (existing) return existing as Promise<Cached<T>>;

  // [API-018] Tạo tác vụ bất đồng bộ dùng chung; IIFE async chạy ngay và trả về một Promise.
  const request = (async () => {
    // [API-019] Bộ điều khiển cho yêu cầu mạng thực sự; timeout bên dưới gọi abort để ngắt fetch.
    const controller = new AbortController();
    // [API-020] Hủy fetch sau 18 giây để ứng dụng không chờ vô hạn khi đường truyền gặp lỗi.
    const timeout = setTimeout(() => controller.abort(), 18_000);
    try {
      // Endpoint công khai hỗ trợ CORS; bản này không dùng khóa API bí mật.
      // Yêu cầu xuất phát từ trình duyệt của người đang xem ứng dụng.
      // [API-021] fetch gửi HTTP GET trực tiếp từ trình duyệt. credentials omit không gửi cookie đến nhà cung cấp.
      const response = await fetch(url, {
        signal: controller.signal,
        mode: "cors",
        credentials: "omit",
        headers: { Accept: "application/json" },
      });
      // [API-036] 429 nghĩa là quá nhiều yêu cầu: ghi hạn chờ theo nguồn, rồi dừng để người dùng thử lại sau.
      if (response.status === 429) {
        // [API-022] Đọc Retry-After, chuyển thành thời điểm được thử lại rồi dùng cho thông báo và cache giới hạn.
        const until = retryTime(response.headers.get("Retry-After"));
        rateLimits.set(host, until);
        write(`retry:${host}`, until);
        throw new DataError(waitMessage(until), 429);
      }
      // [API-037] Các HTTP lỗi khác không được coi là dữ liệu thời tiết hợp lệ.
      if (!response.ok)
        throw new DataError(
          "Nguồn thời tiết tạm thời chưa phản hồi. Vui lòng thử lại sau.",
          response.status,
        );
      // [API-023] Giải mã JSON; ép kiểu T chỉ giúp kiểm tra khi viết code, nên vẫn cần validate ở bước kế tiếp.
      const value = (await response.json()) as T;
      // [API-038] Chặn JSON thiếu các trường chính trước khi lưu cache; tránh giữ lại phản hồi không sử dụng được.
      if (validate && !validate(value))
        throw new DataError(
          "Dữ liệu thời tiết chưa đầy đủ. Vui lòng thử lại sau.",
        );
      // [API-024] Ghi thời điểm nhận mới đúng một lần; đọc cache không làm dữ liệu cũ trở thành dữ liệu mới.
      const result = { value, receivedAt: Date.now() };
      // [API-039] Giới hạn cache RAM khoảng 60 URL bằng cách bỏ khóa được chèn sớm nhất; đây không phải thuật toán LRU đầy đủ.
      if (memory.size >= 60) memory.delete(memory.keys().next().value!);
      memory.set(url, result);
      write(url, result);
      return result;
    } catch (error) {
      if (error instanceof DataError) throw error;
      throw new DataError(
        "Chưa kết nối được nguồn thời tiết. Kiểm tra Internet và thử lại sau.",
      );
    } finally {
      // [API-040] finally luôn dọn bộ hẹn giờ, kể cả khi fetch thành công, thất bại hoặc bị hủy.
      clearTimeout(timeout);
    }
  })();
  // [API-041] Đăng ký tác vụ ngay để các nơi gọi tiếp theo có thể dùng chung.
  pending.set(url, request);
  try {
    return await request;
  } finally {
    // [API-042] Xóa dấu đang tải sau khi hoàn thành để lần cần cập nhật sau có thể gọi lại.
    pending.delete(url);
  }
}

// [API-025] Dựng URL dự báo từ tọa độ. URLSearchParams mã hóa tham số; timezone cố định GMT+7, lấy 7 ngày.
export function forecastUrl(latitude: number, longitude: number) {
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < 7 ||
    latitude > 24 ||
    longitude < 101 ||
    longitude > 118
  )
    throw new DataError("Vị trí phải nằm trong khu vực Việt Nam.");
  return (
    "https://api.open-meteo.com/v1/forecast?" +
    new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),
      // [API-043] Yêu cầu API trả thời gian địa phương Việt Nam; các chuỗi hourly.time không cần đổi sang múi giờ laptop.
      timezone: "Asia/Ho_Chi_Minh",
      forecast_days: "7",
      // [API-044] Nhóm giá trị hiện tại: nhiệt độ, độ ẩm, cảm nhận, ngày/đêm, mưa, mây, áp suất và gió.
      current:
        "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m",
      // [API-045] Nhóm mảng theo từng giờ, dùng cho biểu đồ và thông tin từng mốc thời gian.
      hourly:
        "temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,weather_code,visibility,wind_speed_10m,uv_index,is_day",
      // [API-046] Nhóm tổng hợp theo ngày, dùng cho danh sách 7 ngày và giờ mặt trời mọc/lặn.
      daily:
        "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max",
    })
  );
}
// [API-026] Lấy dự báo của một địa điểm, kiểm tra ba nhóm dữ liệu chính và bổ sung fetchedAt (lúc ứng dụng nhận dữ liệu).
export async function fetchForecast(
  latitude: number,
  longitude: number,
  force = false,
): Promise<Forecast> {
  const { value, receivedAt } = await publicJson<Forecast>(
    forecastUrl(latitude, longitude),
    REFRESH_MS,
    force,
    (v) =>
      !!(v?.current?.time && v?.hourly?.time?.length && v?.daily?.time?.length),
  );
  return { ...value, fetchedAt: new Date(receivedAt).toISOString() };
}
// [API-027] Mô tả phần JSON tối thiểu cần đọc khi lấy tóm tắt nhiều thành phố cùng lúc.
type RawCity = {
  current: {
    temperature_2m: number | null;
    weather_code: number;
    is_day: number;
  };
};
// [API-028] Gộp các tọa độ vào một request. Thứ tự phản hồi tương ứng thứ tự places, nên phải kiểm tra số phần tử.
export async function fetchCities(
  places: Place[],
  force = false,
): Promise<{ cities: CityWeather[]; fetchedAt: string }> {
  const params = new URLSearchParams({
    // [API-047] Nối các vĩ độ bằng dấu phẩy; kinh độ bên dưới phải giữ đúng cùng thứ tự địa điểm.
    latitude: places.map((p) => p.latitude).join(","),
    longitude: places.map((p) => p.longitude).join(","),
    current: "temperature_2m,weather_code,is_day",
    timezone: "Asia/Ho_Chi_Minh",
    forecast_days: "1",
  });
  const { value, receivedAt } = await publicJson<RawCity[]>(
    `https://api.open-meteo.com/v1/forecast?${params}`,
    REFRESH_MS,
    force,
    (v) =>
      Array.isArray(v) &&
      v.length === places.length &&
      v.every((c) => !!c.current),
  );
  return {
    cities: value.map((d, i) => ({
      id: places[i].id,
      temperature: d.current.temperature_2m,
      code: d.current.weather_code,
      isDay: d.current.is_day === 1,
    })),
    fetchedAt: new Date(receivedAt).toISOString(),
  };
}
// [API-029] Cấu trúc một kết quả địa danh do Geocoding API trả về, trước khi đổi sang kiểu Place của ứng dụng.
type GeoResult = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country_code: string;
  admin1?: string;
};
// [API-030] Tìm địa danh Việt Nam bằng Open-Meteo Geocoding; cache từ khóa 1 giờ và đổi kết quả về kiểu Place.
export async function searchPlaces(query: string): Promise<Place[]> {
  // [API-031] Xóa khoảng trắng thừa và giới hạn từ khóa 80 ký tự trước khi đưa vào URL.
  const q = query.trim().slice(0, 80);
  // [API-048] Không gọi tìm kiếm cho từ khóa quá ngắn để giảm request và kết quả nhiễu.
  if (q.length < 2) return [];
  const params = new URLSearchParams({
    name: q,
    count: "8",
    language: "vi",
    // [API-049] Giới hạn tìm kiếm ở Việt Nam ngay trong tham số API.
    countryCode: "VN",
  });
  const { value } = await publicJson<{ results?: GeoResult[] }>(
    `https://geocoding-api.open-meteo.com/v1/search?${params}`,
    60 * 60_000,
  );
  return (
    (value.results || [])
      // [API-050] Kiểm tra lại mã quốc gia trên phản hồi trước khi hiển thị.
      .filter((p) => p.country_code === "VN")
      .map((p) => ({
        id: `geo-${p.id}`,
        name: p.name,
        latitude: p.latitude,
        longitude: p.longitude,
        region: p.admin1 || "Việt Nam",
      }))
  );
}
