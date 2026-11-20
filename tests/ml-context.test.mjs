import test from "node:test";
import assert from "node:assert/strict";
import {
  fetchModelContext,
  fetchTimeSeriesInput,
  modelInput,
} from "../src/lib/weather-client.ts";

// [RF-JS-TEST-001] Chuỗi giả chỉ dùng để kiểm tra cắt mốc thời gian, không phải dataset của ứng dụng.
function fixture() {
  const time = Array.from({ length: 52 }, (_, i) =>
    new Date(Date.UTC(2025, 0, 1) + i * 3600000).toISOString().slice(0, 16),
  );
  const values = Array.from({ length: 52 }, (_, i) => i);
  return {
    current: { time: time[47].slice(0, 13) + ":45" },
    hourly: {
      time,
      temperature_2m: values,
      relative_humidity_2m: values,
      surface_pressure: values,
      wind_speed_10m: values,
      cloud_cover: values,
    },
  };
}

test("RF context excludes future data and preserves midnight API comparison separately", () => {
  const data = fixture();
  const result = modelInput(data);
  assert.equal(result.context.as_of, "2025-01-02T23:00");
  assert.equal(result.context.hourly.time.at(-1), "2025-01-02T23:00");
  assert(result.context.hourly.time.every((t) => t <= result.context.as_of));
  assert.equal(result.apiTarget, "2025-01-03T00:00");
  assert.equal(result.apiNext, 48);
  assert.equal(JSON.stringify(result.context).includes("2025-01-03"), false);
});

test("RF context preserves null rather than inventing weather inputs", () => {
  const data = fixture();
  data.hourly.surface_pressure[45] = null;
  const result = modelInput(data);
  assert.equal(result.context.hourly.surface_pressure[45], null);
});

test("RF input request uses past days without shifting the main daily forecast and uses cache", async () => {
  const original = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async (url) => {
    calls++;
    const parsed = new URL(url);
    assert.equal(parsed.searchParams.get("past_days"), "3");
    assert.equal(parsed.searchParams.get("forecast_days"), "2");
    assert.equal(parsed.searchParams.has("daily"), false);
    assert(parsed.searchParams.get("hourly").includes("surface_pressure"));
    assert(parsed.searchParams.get("hourly").includes("cloud_cover"));
    return Response.json(fixture());
  };
  try {
    await fetchModelContext(10.7788, 106.7011);
    await fetchModelContext(10.7788, 106.7011, true);
    assert.equal(calls, 1);
  } finally {
    globalThis.fetch = original;
  }
});

test("time-series input only sends past hourly temperatures through the reference hour", async () => {
  const original = globalThis.fetch;
  const data = fixture();
  const temperatures = data.hourly.temperature_2m.slice();
  temperatures[46] = null;
  globalThis.fetch = async (url) => {
    const params = new URL(url).searchParams;
    assert.equal(params.get("past_days"), "7");
    assert.equal(params.get("forecast_days"), "1");
    assert.equal(params.get("hourly"), "temperature_2m");
    assert.equal(params.has("daily"), false);
    return Response.json({
      current: data.current,
      hourly: { time: data.hourly.time, temperature_2m: temperatures },
    });
  };
  try {
    const result = await fetchTimeSeriesInput(10.78, 106.70);
    assert.equal(result.as_of, "2025-01-02T23:00");
    assert.deepEqual(result.hourly, {
      time: data.hourly.time.slice(0, 48),
      temperature_2m: temperatures.slice(0, 48),
    });
  } finally {
    globalThis.fetch = original;
  }
});
