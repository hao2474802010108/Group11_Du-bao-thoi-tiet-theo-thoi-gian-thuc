// [DATA-000] KIỂU DỮ LIỆU VÀ HÀM THUẦN: không gọi API và không vẽ giao diện. Các hàm nhận dữ liệu, xử lý rồi trả kết quả.
// [DATA-001] Một địa điểm. Dấu ? là trường không bắt buộc; aliases chứa tên gõ thay thế như sai gon, hcm.
export type Place = {
  // [DATA-002] Mã nhận diện ổn định của địa điểm.
  id: string;
  // [DATA-003] Tên hiển thị.
  name: string;
  // [DATA-004] Vĩ độ (độ).
  latitude: number;
  // [DATA-005] Kinh độ (độ).
  longitude: number;
  // [DATA-006] Tên vùng hoặc tỉnh/thành để phân biệt kết quả.
  region?: string;
  // [DATA-007] Các cách gọi/tên viết tắt hỗ trợ tìm kiếm không dấu.
  aliases?: string[];
};
// [DATA-008] 18 địa điểm mẫu giúp tìm nhanh mà không cần chờ Geocoding. Đây là tọa độ, không phải số liệu thời tiết giả.
export const PLACES: Place[] = [
  {
    id: "hcm",
    name: "Hồ Chí Minh",
    latitude: 10.7769,
    longitude: 106.7009,
    region: "Miền Nam",
    aliases: ["sai gon", "saigon", "tphcm", "hcm", "ho chi minh"],
  },
  {
    id: "hanoi",
    name: "Hà Nội",
    latitude: 21.0285,
    longitude: 105.8542,
    region: "Miền Bắc",
    aliases: ["hanoi", "ha noi"],
  },
  {
    id: "danang",
    name: "Đà Nẵng",
    latitude: 16.0544,
    longitude: 108.2022,
    region: "Miền Trung",
    aliases: ["danang", "da nang"],
  },
  {
    id: "dalat",
    name: "Đà Lạt",
    latitude: 11.9404,
    longitude: 108.4583,
    region: "Tây Nguyên",
    aliases: ["dalat", "da lat"],
  },
  {
    id: "hue",
    name: "Huế",
    latitude: 16.4637,
    longitude: 107.5909,
    region: "Miền Trung",
  },
  {
    id: "cantho",
    name: "Cần Thơ",
    latitude: 10.0452,
    longitude: 105.7469,
    region: "Miền Nam",
  },
  {
    id: "haiphong",
    name: "Hải Phòng",
    latitude: 20.8449,
    longitude: 106.6881,
    region: "Miền Bắc",
  },
  {
    id: "nhatrang",
    name: "Nha Trang",
    latitude: 12.2388,
    longitude: 109.1967,
    region: "Duyên hải Nam Trung Bộ",
  },
  {
    id: "vungtau",
    name: "Vũng Tàu",
    latitude: 10.346,
    longitude: 107.0843,
    region: "Miền Nam",
  },
  {
    id: "phuquoc",
    name: "Phú Quốc",
    latitude: 10.2899,
    longitude: 103.984,
    region: "Miền Nam",
  },
  {
    id: "sapa",
    name: "Sa Pa",
    latitude: 22.3364,
    longitude: 103.8438,
    region: "Miền Bắc",
    aliases: ["sapa"],
  },
  {
    id: "halong",
    name: "Hạ Long",
    latitude: 20.9712,
    longitude: 107.0448,
    region: "Miền Bắc",
  },
  {
    id: "hoian",
    name: "Hội An",
    latitude: 15.8801,
    longitude: 108.338,
    region: "Miền Trung",
  },
  {
    id: "tanan",
    name: "Tân An",
    latitude: 10.5359,
    longitude: 106.4137,
    region: "Miền Nam",
    aliases: ["long an"],
  },
  {
    id: "buonmathuot",
    name: "Buôn Ma Thuột",
    latitude: 12.6667,
    longitude: 108.05,
    region: "Tây Nguyên",
  },
  {
    id: "quynhon",
    name: "Quy Nhơn",
    latitude: 13.782,
    longitude: 109.2197,
    region: "Miền Trung",
  },
  {
    id: "vinh",
    name: "Vinh",
    latitude: 18.6796,
    longitude: 105.6813,
    region: "Miền Trung",
  },
  {
    id: "ninhbinh",
    name: "Ninh Bình",
    latitude: 20.2506,
    longitude: 105.9745,
    region: "Miền Bắc",
  },
];
// [DATA-009] Dữ liệu hiện tại từ API. number | null cho phép biểu diễn giá trị bị thiếu mà không biến thành số 0.
export type Current = {
  // [DATA-010] Chuỗi thời gian ISO địa phương; mảng time là trục đối chiếu cho các mảng số liệu.
  time: string;
  // [DATA-011] Nhiệt độ không khí ở cao độ 2 m, °C.
  temperature_2m: number | null;
  // [DATA-012] Độ ẩm tương đối ở 2 m, %. Không phải khả năng mưa.
  relative_humidity_2m: number | null;
  // [DATA-013] Nhiệt độ cảm nhận, °C.
  apparent_temperature: number | null;
  // [DATA-014] 1 là ban ngày, 0 là ban đêm; dùng để chọn mặt trời/mặt trăng.
  is_day: number;
  // [DATA-015] Lượng giáng thủy, mm; khác với xác suất có mưa.
  precipitation: number | null;
  // [DATA-016] Mã trạng thái thời tiết WMO; weatherInfo đổi sang nhãn và icon.
  weather_code: number;
  // [DATA-017] Tỉ lệ mây che phủ, %.
  cloud_cover: number | null;
  // [DATA-018] Áp suất tại bề mặt, hPa.
  surface_pressure: number | null;
  // [DATA-019] Tốc độ gió ở độ cao 10 m, mặc định km/h.
  wind_speed_10m: number | null;
  // [DATA-020] Hướng gió THỔI TỪ, tính bằng độ; 0/360 là Bắc.
  wind_direction_10m: number | null;
  // [DATA-021] Tốc độ gió giật ở 10 m, km/h.
  wind_gusts_10m: number | null;
};
// [DATA-022] Dự báo từng giờ: mọi mảng dùng chung chỉ số i với time[i]. Ví dụ temperature_2m[i] thuộc giờ time[i].
export type Hourly = {
  // [DATA-023] Chuỗi thời gian ISO địa phương; mảng time là trục đối chiếu cho các mảng số liệu.
  time: string[];
  // [DATA-024] Nhiệt độ không khí ở cao độ 2 m, °C.
  temperature_2m: (number | null)[];
  // [DATA-025] Độ ẩm tương đối ở 2 m, %. Không phải khả năng mưa.
  relative_humidity_2m: (number | null)[];
  // [DATA-026] Khả năng có giáng thủy theo giờ, %. Không diễn giải là lượng mưa.
  precipitation_probability: (number | null)[];
  // [DATA-027] Lượng giáng thủy, mm; khác với xác suất có mưa.
  precipitation: (number | null)[];
  // [DATA-028] Mã trạng thái thời tiết WMO; weatherInfo đổi sang nhãn và icon.
  weather_code: (number | null)[];
  // [DATA-029] Tầm nhìn, m; giao diện đổi sang km khi cần.
  visibility: (number | null)[];
  // [DATA-030] Tốc độ gió ở độ cao 10 m, mặc định km/h.
  wind_speed_10m: (number | null)[];
  // [DATA-031] Chỉ số UV theo giờ.
  uv_index: (number | null)[];
  // [DATA-032] 1 là ban ngày, 0 là ban đêm; dùng để chọn mặt trời/mặt trăng.
  is_day: number[];
};
// [DATA-033] Tổng hợp từng ngày: mọi mảng dùng chung chỉ số ngày, dùng để vẽ dự báo 7 ngày.
export type Daily = {
  // [DATA-034] Chuỗi thời gian ISO địa phương; mảng time là trục đối chiếu cho các mảng số liệu.
  time: string[];
  // [DATA-035] Mã trạng thái thời tiết WMO; weatherInfo đổi sang nhãn và icon.
  weather_code: (number | null)[];
  // [DATA-036] Nhiệt độ cao nhất ngày, °C.
  temperature_2m_max: (number | null)[];
  // [DATA-037] Nhiệt độ thấp nhất ngày, °C.
  temperature_2m_min: (number | null)[];
  // [DATA-038] Giờ mặt trời mọc từng ngày, GMT+7.
  sunrise: string[];
  // [DATA-039] Giờ mặt trời lặn từng ngày, GMT+7.
  sunset: string[];
  // [DATA-040] Chỉ số UV lớn nhất ngày.
  uv_index_max: (number | null)[];
  // [DATA-041] Tổng giáng thủy trong ngày, mm.
  precipitation_sum: (number | null)[];
  // [DATA-042] Khả năng giáng thủy lớn nhất trong ngày, %.
  precipitation_probability_max: (number | null)[];
  // [DATA-043] Tốc độ gió lớn nhất ngày, km/h.
  wind_speed_10m_max: (number | null)[];
};
// [DATA-044] Gói dữ liệu ứng dụng dùng: current + hourly + daily + tọa độ + thời điểm nhận fetchedAt.
export type Forecast = {
  current: Current;
  hourly: Hourly;
  daily: Daily;
  // [DATA-045] Múi giờ phản hồi, yêu cầu là Asia/Ho_Chi_Minh.
  timezone: string;
  // [DATA-046] Vĩ độ (độ).
  latitude: number;
  // [DATA-047] Kinh độ (độ).
  longitude: number;
  // [DATA-048] Thời điểm ứng dụng nhận gói dữ liệu; khác thời điểm dự báo current.time.
  fetchedAt: string;
};
// [DATA-049] Dữ liệu rút gọn cho thẻ thành phố, không cần toàn bộ dự báo 7 ngày.
export type CityWeather = {
  // [DATA-050] Mã nhận diện ổn định của địa điểm.
  id: string;
  // [DATA-051] Nhiệt độ °C hoặc null; chỉ đổi sang °F khi hiển thị.
  temperature: number | null;
  // [DATA-052] Mã WMO hoặc null.
  code: number;
  // [DATA-053] Cờ ban ngày sau khi đổi từ số 1/0 thành boolean.
  isDay: boolean;
};
// [DATA-054] Union type: chỉ cho phép các tên nhóm thời tiết đã định nghĩa, dùng để chọn icon và màu.
export type WeatherKind =
  | "sun"
  | "moon"
  | "partly"
  | "cloud"
  | "fog"
  | "rain"
  | "drizzle"
  | "storm"
  | "snow";
// [DATA-055] Ánh xạ mã WMO thành mô tả tiếng Việt và nhóm icon; phân biệt trời quang ban ngày với ban đêm.
export function weatherInfo(
  code: number | null | undefined,
  isDay = true,
): { label: string; kind: WeatherKind } {
  // [DATA-079] Kiểm tra null/undefined trước để không gán nhầm dữ liệu thiếu thành trời quang (mã 0).
  if (code == null) return { label: "Chưa có dữ liệu", kind: "cloud" };
  if (code === 0)
    return {
      label: isDay ? "Trời quang" : "Đêm quang mây",
      kind: isDay ? "sun" : "moon",
    };
  if (code === 1 || code === 2)
    return { label: code === 1 ? "Ít mây" : "Có mây", kind: "partly" };
  if (code === 3) return { label: "Nhiều mây", kind: "cloud" };
  if (code === 45 || code === 48) return { label: "Sương mù", kind: "fog" };
  if ([51, 53, 55, 56, 57].includes(code))
    return { label: "Mưa phùn", kind: "drizzle" };
  if ([61, 66, 80].includes(code)) return { label: "Mưa nhẹ", kind: "rain" };
  if ([63, 65, 67, 81, 82].includes(code))
    return {
      label: [65, 67, 82].includes(code) ? "Mưa lớn" : "Có mưa",
      kind: "rain",
    };
  if (code >= 95) return { label: "Mưa dông", kind: "storm" };
  if ([71, 73, 75, 77, 85, 86].includes(code))
    return { label: "Có tuyết", kind: "snow" };
  return { label: "Có mây", kind: "cloud" };
}
// [DATA-056] Chuẩn hóa tiếng Việt: tách dấu Unicode, bỏ dấu, đổi đ thành d, viết thường và bỏ khoảng trắng ở hai đầu.
export const fold = (s: string) =>
  s
    // [DATA-080] NFD tách chữ và dấu; biểu thức Unicode ở dòng sau mới xóa được phần dấu.
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
// [DATA-057] Đổi °C sang °F bằng C × 9/5 + 32; giữ null nếu thiếu số liệu.
export const toTemp = (v: number | null | undefined, unit: "C" | "F") =>
  v == null ? null : unit === "F" ? (v * 9) / 5 + 32 : v;
// [DATA-058] Định dạng nhiệt độ làm tròn kèm ký hiệu °; thiếu số liệu thì hiển thị dấu —.
export const temp = (v: number | null | undefined, unit: "C" | "F") =>
  v == null ? "—" : `${Math.round(toTemp(v, unit)!)}°`;
// [DATA-059] Định dạng số theo vi-VN và giới hạn số chữ số lẻ; không biến null thành số 0.
export const num = (v: number | null | undefined, digits = 0) =>
  v == null
    ? "—"
    : new Intl.NumberFormat("vi-VN", { maximumFractionDigits: digits }).format(
        v,
      );
// [DATA-060] Hôm nay/Ngày mai cho hai ngày đầu; các ngày sau định dạng thứ trong tuần theo giờ Việt Nam.
export function dayLabel(iso: string, index?: number) {
  if (index === 0) return "Hôm nay";
  if (index === 1) return "Ngày mai";
  return new Intl.DateTimeFormat("vi-VN", {
    weekday: "short",
    timeZone: "Asia/Ho_Chi_Minh",
  })
    .format(new Date(`${iso}T12:00:00+07:00`))
    .replace("Th ", "Thứ ");
}
// [DATA-061] Lấy ngày/tháng từ chuỗi ISO. Cắt chuỗi giữ đúng ngày GMT+7 do API trả về.
export const shortDate = (iso: string) =>
  `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
// [DATA-062] Lấy phần HH:mm từ chuỗi ISO; ?. và || giúp trả — khi chưa có chuỗi.
export const clockTime = (iso?: string) => iso?.slice(11, 16) || "—";
// [DATA-063] Chia vòng tròn thành 8 hướng, làm tròn mỗi 45°. Kết quả mô tả hướng gió thổi từ.
export const direction = (degrees: number | null | undefined) =>
  degrees == null
    ? "—"
    : [
        "Bắc",
        "Đông Bắc",
        "Đông",
        "Đông Nam",
        "Nam",
        "Tây Nam",
        "Tây",
        "Tây Bắc",
      ][Math.round(degrees / 45) % 8];
// [DATA-064] Type guard kiểm tra dữ liệu đọc từ storage/tìm kiếm. Hộp tọa độ 7..24, 101..118 chỉ là vùng giới hạn rộng, không phải đường biên Việt Nam.
export function isPlace(value: unknown): value is Place {
  if (!value || typeof value !== "object") return false;
  const p = value as Place;
  return (
    typeof p.id === "string" &&
    typeof p.name === "string" &&
    Number.isFinite(p.latitude) &&
    Number.isFinite(p.longitude) &&
    p.latitude >= 7 &&
    p.latitude <= 24 &&
    p.longitude >= 101 &&
    p.longitude <= 118
  );
}

// [DATA-065] Chuẩn hóa một mốc cho giao diện: tách khóa ổn định key, thời gian thực, dấu Bây giờ và các chỉ số.
export type ForecastHour = {
  // [DATA-066] Khóa của giờ gốc, giúp React nhận diện phần tử dù nhãn Bây giờ đổi.
  key: string;
  // [DATA-067] Chuỗi thời gian ISO địa phương; mảng time là trục đối chiếu cho các mảng số liệu.
  time: string;
  // [DATA-068] true chỉ cho mốc đầu của hôm nay; các mốc tiếp theo là dự báo từng giờ.
  isCurrent: boolean;
  // [DATA-069] Nhiệt độ °C hoặc null; chỉ đổi sang °F khi hiển thị.
  temperature: number | null;
  // [DATA-070] Mã WMO hoặc null.
  code: number | null;
  // [DATA-071] Cờ ban ngày sau khi đổi từ số 1/0 thành boolean.
  isDay: boolean;
  // [DATA-072] Xác suất giáng thủy của giờ tương ứng, %.
  rainProbability: number | null;
  // [DATA-073] Tốc độ gió, km/h.
  wind: number | null;
  // [DATA-074] Độ ẩm tương đối, %.
  humidity: number | null;
};

/** Giữ đủ các giờ liên tiếp, bao gồm nửa đêm; không lấy bước nhảy 3 giờ. */
// [DATA-075] Tạo danh sách từng giờ cho component: Bây giờ → giờ tròn kế tiếp → các giờ sau; ngày khác có 00:00..23:00 nếu API cung cấp đủ.
export function getHourlyTimeline(
  data: Forecast,
  selectedDay = 0,
): ForecastHour[] {
  if (
    !Number.isInteger(selectedDay) ||
    selectedDay < 0 ||
    selectedDay >= data.daily.time.length
  )
    return [];
  // [DATA-076] Tìm chỉ số giờ chứa thời điểm current bằng cách so sánh đến YYYY-MM-DDTHH. Không bỏ qua mốc 00:00 khi qua ngày.
  const first = data.hourly.time.findIndex(
    (t) => t.slice(0, 13) >= data.current.time.slice(0, 13),
  );
  // [DATA-081] Không tìm thấy giờ hiện tại trong dữ liệu thì trả danh sách rỗng, không tự bịa mốc dự báo.
  if (selectedDay === 0 && first < 0) return [];
  // [DATA-077] Hôm nay: lấy tối đa 24 mốc liên tiếp từ giờ hiện tại. Ngày tương lai: lấy mọi giờ có cùng tiền tố ngày.
  const indexes = data.hourly.time
    .map((_, i) => i)
    .filter((i) =>
      selectedDay === 0
        ? i >= first && i < first + 24
        : data.hourly.time[i].startsWith(data.daily.time[selectedDay]),
    );
  return indexes.map((i, position) => {
    // [DATA-078] Chỉ mốc đầu của hôm nay dùng dữ liệu current; các mốc còn lại dùng mảng hourly.
    const isCurrent = selectedDay === 0 && position === 0;
    return {
      // [DATA-082] Khóa vẫn là giờ gốc để nhận diện phần tử; nhãn thời gian có thể hiển thị phút hiện tại.
      key: data.hourly.time[i],
      // [DATA-083] Ví dụ current là 23:45: mốc đầu ghi Bây giờ (23:45), mốc kế tiếp là 00:00 ngày mai.
      time: isCurrent ? data.current.time : data.hourly.time[i],
      isCurrent,
      temperature:
        (isCurrent
          ? data.current.temperature_2m
          : data.hourly.temperature_2m[i]) ?? null,
      code:
        (isCurrent ? data.current.weather_code : data.hourly.weather_code[i]) ??
        null,
      isDay: (isCurrent ? data.current.is_day : data.hourly.is_day[i]) === 1,
      // [DATA-084] API không có xác suất mưa trong nhóm current đã chọn; mốc Bây giờ dùng xác suất của giờ tương ứng. ?? giữ số 0 hợp lệ.
      rainProbability: data.hourly.precipitation_probability[i] ?? null,
      wind:
        (isCurrent
          ? data.current.wind_speed_10m
          : data.hourly.wind_speed_10m[i]) ?? null,
      humidity:
        (isCurrent
          ? data.current.relative_humidity_2m
          : data.hourly.relative_humidity_2m[i]) ?? null,
    };
  });
}
