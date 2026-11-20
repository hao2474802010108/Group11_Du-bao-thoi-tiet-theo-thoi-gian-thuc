// [TEST-API-000] KIỂM THỬ HỒI QUY: dữ liệu fixture/fetch giả chỉ dùng trong test, không phải dữ liệu hiển thị của ứng dụng.
import test from "node:test";
import assert from "node:assert/strict";
import {
  fetchForecast,
  fetchCities,
  searchPlaces,
  forecastUrl,
} from "../src/lib/weather-client.ts";

// Fixture là dữ liệu cố định để kết quả kiểm tra lặp lại được, không phụ thuộc thời tiết ngoài mạng.
const fixture = {
  current: { time: "2026-11-07T10:00", temperature_2m: 31.2, weather_code: 2 },
  hourly: { time: ["2026-11-07T10:00"], temperature_2m: [31.2] },
  daily: { time: ["2026-11-07"], temperature_2m_max: [32.5] },
  timezone: "Asia/Ho_Chi_Minh",
};
const originalFetch = globalThis.fetch;
const originalNow = Date.now;
// Sau mỗi bài, khôi phục fetch và đồng hồ thật để không ảnh hưởng bài kế tiếp.
test.afterEach(() => {
  globalThis.fetch = originalFetch;
  Date.now = originalNow;
});

// [TEST-API-001] Tọa độ sai phải bị chặn trước khi gọi mạng; URL hợp lệ luôn yêu cầu múi giờ Việt Nam.
test("rejects invalid coordinates before calling the provider", async () => {
  let calls = 0;
  globalThis.fetch = async () => {
    calls++;
    throw new Error("Unexpected request");
  };
  await assert.rejects(fetchForecast(NaN, 106), /Vị trí/);
  await assert.rejects(fetchForecast(11, 999), /Vị trí/);
  assert.equal(calls, 0);
  assert.equal(
    new URL(forecastUrl(10.7769, 106.7009)).searchParams.get("timezone"),
    "Asia/Ho_Chi_Minh",
  );
});
// [TEST-API-002] Năm lời gọi đồng thời cùng địa điểm chỉ tạo một fetch; làm mới ngay không gọi thêm và không sửa fetchedAt.
test("deduplicates concurrent requests and repeated refreshes while preserving the retrieval time", async () => {
  let calls = 0;
  globalThis.fetch = async (url, options) => {
    calls++;
    assert.equal(new URL(url).origin, "https://api.open-meteo.com");
    assert.equal(options.credentials, "omit");
    return Response.json(fixture);
  };
  const data = await Promise.all(
    Array.from({ length: 5 }, () => fetchForecast(10.77001, 106.70001)),
  );
  assert.equal(calls, 1);
  assert.equal(data[0].current.temperature_2m, 31.2);
  const refreshed = await fetchForecast(10.77001, 106.70001, true);
  assert.equal(calls, 1);
  assert.equal(refreshed.fetchedAt, data[0].fetchedAt);
});
// [TEST-API-003] Phản hồi thiếu hourly/daily không được lưu cache; lần tiếp theo vẫn phải gọi lại được.
test("does not cache incomplete provider responses", async () => {
  let calls = 0;
  globalThis.fetch = async () => {
    calls++;
    return Response.json(
      calls === 1 ? { current: { time: "2026-11-07T10:00" } } : fixture,
    );
  };
  await assert.rejects(fetchForecast(10.77002, 106.70002), /chưa đầy đủ/);
  const result = await fetchForecast(10.77002, 106.70002, true);
  assert.equal(calls, 2);
  assert.equal(result.current.temperature_2m, 31.2);
});
// [TEST-API-004] Hai địa điểm dùng một request batch; thứ tự địa điểm và giá trị null được giữ đúng.
test("uses one batched request for city summaries and preserves missing values", async () => {
  let calls = 0;
  const places = [
    { id: "a", name: "A", latitude: 11, longitude: 106 },
    { id: "b", name: "B", latitude: 12, longitude: 107 },
  ];
  globalThis.fetch = async (url) => {
    calls++;
    assert.equal(new URL(url).searchParams.get("latitude"), "11,12");
    return Response.json([
      { current: { temperature_2m: null, weather_code: 3, is_day: 0 } },
      { current: { temperature_2m: 29, weather_code: 0, is_day: 1 } },
    ]);
  };
  const result = await fetchCities(places);
  assert.equal(calls, 1);
  assert.equal(result.cities[0].temperature, null);
  assert.equal(result.cities[0].isDay, false);
  assert.equal(result.cities[1].id, "b");
});
// [TEST-API-005] URL mã hóa đúng tiếng Việt, có countryCode=VN và lọc bỏ kết quả quốc gia khác.
test("limits location search to Vietnam and encodes Vietnamese input", async () => {
  globalThis.fetch = async (url) => {
    const u = new URL(url);
    assert.equal(u.searchParams.get("countryCode"), "VN");
    assert.equal(u.searchParams.get("name"), "Cà Mau");
    return Response.json({
      results: [
        {
          id: 1,
          name: "Cà Mau",
          latitude: 9.17,
          longitude: 105.15,
          country_code: "VN",
        },
        {
          id: 2,
          name: "Other",
          latitude: 40,
          longitude: 100,
          country_code: "US",
        },
      ],
    });
  };
  const result = await searchPlaces("Cà Mau");
  assert.equal(result.length, 1);
  assert.equal(result[0].name, "Cà Mau");
});
// [TEST-API-006] HTTP 429 áp dụng thời gian chờ cho cả địa điểm khác cùng nguồn; chỉ gọi lại sau mốc Retry-After.
test("honors Retry-After across locations and only retries after the cooldown expires", async () => {
  let calls = 0;
  let now = originalNow();
  Date.now = () => now;
  globalThis.fetch = async () => {
    calls++;
    return calls === 1
      ? Response.json(
          { reason: "rate limited" },
          { status: 429, headers: { "Retry-After": "120" } },
        )
      : Response.json(fixture);
  };
  await assert.rejects(fetchForecast(10.77003, 106.70003), /120 giây/);
  now += 119_000;
  await assert.rejects(
    fetchForecast(10.77004, 106.70004, true),
    /giới hạn truy cập/,
  );
  assert.equal(calls, 1);
  now += 2_000;
  const result = await fetchForecast(10.77004, 106.70004, true);
  assert.equal(calls, 2);
  assert.equal(result.current.temperature_2m, 31.2);
});
