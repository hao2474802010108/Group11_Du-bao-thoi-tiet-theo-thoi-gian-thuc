// [TEST-HOUR-000] KIỂM THỬ HỒI QUY: dữ liệu fixture/fetch giả chỉ dùng trong test, không phải dữ liệu hiển thị của ứng dụng.
import test from "node:test";
import assert from "node:assert/strict";
import { getHourlyTimeline, clockTime } from "../src/lib/weather.ts";

// Fixture là dữ liệu cố định để kết quả kiểm tra lặp lại được, không phụ thuộc thời tiết ngoài mạng.
function fixture() {
  const times = Array.from({ length: 168 }, (_, i) =>
    new Date(Date.UTC(2026, 10, 7) + i * 3600000).toISOString().slice(0, 16),
  );
  const values = (n) => Array(times.length).fill(n);
  return {
    current: {
      time: "2026-11-07T23:45",
      temperature_2m: 27.8,
      weather_code: 0,
      is_day: 0,
      wind_speed_10m: 5.2,
      relative_humidity_2m: 72,
    },
    hourly: {
      time: times,
      temperature_2m: values(25),
      weather_code: values(3),
      is_day: values(1),
      precipitation_probability: values(40),
      wind_speed_10m: values(7),
      relative_humidity_2m: values(80),
    },
    daily: {
      time: Array.from({ length: 7 }, (_, i) => times[i * 24].slice(0, 10)),
    },
  };
}
// [TEST-HOUR-001] Từ 23:45 phải có Bây giờ, 00:00, 01:00, 02:00...; xác nhận khoảng cách khóa giờ đúng 3.600.000 ms và ngày đổi ở nửa đêm.
test("shows now, midnight, 01:00 and every following hour without skipping", () => {
  const rows = getHourlyTimeline(fixture());
  assert.equal(rows.length, 24);
  assert.equal(rows[0].isCurrent, true);
  assert.deepEqual(
    rows.slice(0, 4).map((h) => clockTime(h.time)),
    ["23:45", "00:00", "01:00", "02:00"],
  );
  for (let i = 1; i < rows.length; i++)
    assert.equal(
      Date.parse(rows[i].key + "+07:00") -
        Date.parse(rows[i - 1].key + "+07:00"),
      3600000,
    );
  assert.equal(rows[1].time.slice(0, 10), "2026-11-08");
});
// [TEST-HOUR-002] Mốc Bây giờ phải dùng số đo mô hình current (27,8), không thay bằng giá trị hourly của giờ tròn (25).
test("uses the actual current reading for Now instead of the rounded-hour forecast", () => {
  const rows = getHourlyTimeline(fixture());
  assert.equal(rows[0].temperature, 27.8);
  assert.equal(rows[0].isDay, false);
  assert.equal(rows[0].wind, 5.2);
  assert.equal(rows[1].temperature, 25);
});
// [TEST-HOUR-003] Chọn ngày mai phải lấy đủ 00:00..23:00 của đúng ngày, không có mốc Bây giờ.
test("a selected future day contains its full 00:00 through 23:00 forecast", () => {
  const rows = getHourlyTimeline(fixture(), 1);
  assert.equal(rows.length, 24);
  assert.equal(clockTime(rows[0].time), "00:00");
  assert.equal(clockTime(rows[23].time), "23:00");
  assert(rows.every((h) => h.time.startsWith("2026-11-08") && !h.isCurrent));
});
// [TEST-HOUR-004] Cuối phạm vi API thì chỉ dùng số giờ thực có; ngày/chỉ số không hợp lệ trả mảng rỗng.
test("does not fabricate missing hours at the end of the provider time range", () => {
  const data = fixture();
  data.current.time = "2026-11-13T23:45";
  assert.equal(getHourlyTimeline(data).length, 1);
  data.current.time = "2026-11-14T01:00";
  assert.equal(getHourlyTimeline(data).length, 0);
  assert.deepEqual(getHourlyTimeline(data, 8), []);
});
// [TEST-HOUR-005] Giá trị null vẫn là thiếu dữ liệu; không được coi là 0°C hoặc xác suất mưa 0%.
test("preserves unavailable forecast values instead of reporting zero", () => {
  const data = fixture();
  data.hourly.temperature_2m[24] = null;
  data.hourly.precipitation_probability[24] = null;
  const rows = getHourlyTimeline(data);
  assert.equal(rows[1].temperature, null);
  assert.equal(rows[1].rainProbability, null);
});
