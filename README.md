# 🌤️ Mây Việt

> Ứng dụng thời tiết Việt Nam chạy trên laptop chỉ với một lệnh: **`python app.py`**

Mây Việt hiển thị thời tiết hiện tại, dự báo **từng giờ liên tiếp** (kể cả qua nửa đêm), dự báo **7 ngày**, tìm kiếm địa điểm, định vị GPS, danh sách yêu thích và giao diện sáng/tối với phong cách kính mờ. Dữ liệu dự báo lấy từ [Open-Meteo](https://open-meteo.com/).

## Tính năng

- Thời tiết hiện tại: nhiệt độ, cảm nhận, độ ẩm, mưa, mây, áp suất, gió.
- Dự báo từng giờ: biểu đồ nhiệt độ, xác suất mưa, gió; cuộn ngang, chọn giờ để xem chi tiết.
- Dự báo 7 ngày: nhiệt độ cao/thấp, mặt trời mọc/lặn, UV, tổng mưa.
- Tìm địa điểm trong Việt Nam, định vị bằng GPS, lưu tối đa 30 địa điểm yêu thích.
- Giao diện sáng/tối, đổi đơn vị °C/°F.
- Cache nhiều tầng, gộp request, xử lý HTTP 429 để dùng nguồn dữ liệu tiết kiệm và lịch sự.

## Yêu cầu

| Mục đích                              | Cần có                                    |
| ------------------------------------- | ----------------------------------------- |
| **Chỉ chạy ứng dụng**                 | Python 3.10 trở lên + Internet            |
| Sửa/build giao diện React/TypeScript  | Thêm Node.js 22.13 trở lên và npm         |

Không cần BAT, Node.js, Flask hay cài thêm gói pip để chạy bản có sẵn. `app.py` chỉ dùng thư viện chuẩn của Python để phục vụ giao diện và tự mở trình duyệt.

## Bắt đầu nhanh

1. Giải nén ZIP, mở thư mục `MayViet` (có **`app.py`** và **`dist/`** nằm cạnh nhau).
2. Mở terminal tại thư mục đó (VS Code: **Terminal → New Terminal**).
3. Chạy:

```powershell
python app.py
```

Trên Windows nếu không nhận lệnh `python`, dùng `py app.py`. Trên macOS/Linux dùng `python3 app.py`. Trình duyệt tự mở tại **http://localhost:5173**; bấm **Ctrl+C** trong terminal để dừng.

> **Lưu ý:** Mây Việt là ứng dụng web mở trong trình duyệt, không phải cửa sổ Tkinter. Python chỉ đảm nhiệm khởi chạy và phục vụ giao diện; **không tự huấn luyện mô hình dự báo**. Dự báo vẫn lấy từ Open-Meteo, nên dữ liệu mới cần Internet. Giao diện hiện tại là React/TypeScript đã build sẵn trong `dist/`.

## Mục lục

1. [Nên đọc file nào trước?](#1-nên-đọc-file-nào-trước)
2. [Mở ứng dụng bằng Python trên laptop Windows](#2-mở-ứng-dụng-bằng-python-trên-laptop-windows)
3. [Đọc code và chỉnh sửa bằng VS Code](#3-đọc-code-và-chỉnh-sửa-bằng-vs-code)
4. [Cấu trúc thư mục và trách nhiệm](#4-cấu-trúc-thư-mục-và-trách-nhiệm)
5. [Dùng module và thư viện nào?](#5-dùng-module-và-thư-viện-nào)
6. [Dữ liệu đi qua ứng dụng như thế nào?](#6-dữ-liệu-đi-qua-ứng-dụng-như-thế-nào)
7. [API lấy từ đâu và gọi chỗ nào?](#7-api-lấy-từ-đâu-và-gọi-chỗ-nào)
8. [Cách hiển thị đủ từng giờ](#8-cách-hiển-thị-đủ-từng-giờ)
9. [Những phương pháp tối ưu đã có](#9-những-phương-pháp-tối-ưu-đã-có)
10. [Hiểu các hook React trong code](#10-hiểu-các-hook-react-trong-code)
11. [Chỉnh giao diện kính mờ](#11-chỉnh-giao-diện-kính-mờ)
12. [Muốn đổi chức năng thì sửa ở đâu?](#12-muốn-đổi-chức-năng-thì-sửa-ở-đâu)
13. [Dữ liệu lưu ở đâu? Có cần backend không?](#13-dữ-liệu-lưu-ở-đâu-có-cần-backend-không)
14. [Các bài kiểm tra và phạm vi đã xác nhận](#14-các-bài-kiểm-tra-và-phạm-vi-đã-xác-nhận)
15. [Những file JSON không ghi chú trực tiếp được](#15-những-file-json-không-ghi-chú-trực-tiếp-được)
16. [Từ khóa và cú pháp thường gặp khi đọc code](#16-từ-khóa-và-cú-pháp-thường-gặp-khi-đọc-code)
17. [Xử lý lỗi thường gặp](#17-xử-lý-lỗi-thường-gặp)
18. [Nguồn dữ liệu, giấy phép và phạm vi](#18-nguồn-dữ-liệu-giấy-phép-và-phạm-vi)
19. [Cách học code theo thứ tự dễ hiểu](#19-cách-học-code-theo-thứ-tự-dễ-hiểu)
20. [Tài liệu kỹ thuật của phần Python](#20-tài-liệu-kỹ-thuật-của-phần-python)

---

## 1. Nên đọc file nào trước?

| Bạn muốn làm gì?                  | File cần mở                                       |
| --------------------------------- | ------------------------------------------------- |
| Chạy bằng Python                  | `app.py`, mục 2 và `HUONG_DAN_MO_TREN_LAPTOP.txt` |
| Hiểu từng phần Python             | Chú thích `[PY-...]` trong `app.py` và mục 3.1    |
| Tra chức năng theo số dòng        | [GIAI_THICH_CODE.md](GIAI_THICH_CODE.md)          |
| Xem thư viện, thuật toán, API, tối ưu | Các mục 5–10 của README này                   |
| Kiểm tra nguồn API                | `NGUON_API.txt`, `src/lib/weather-client.ts`      |
| Đọc giao diện hiện tại            | `src/components/weather-app.tsx`                  |
| Đọc xử lý từng giờ qua nửa đêm    | `getHourlyTimeline()` trong `src/lib/weather.ts`  |
| Chỉnh nền trong nhẹ               | `src/glass-update.css`                            |
| Kiểm tra server Python            | `tests/test_app.py`                               |

**Mẹo trong VS Code:** `Ctrl+P` tìm file, `Ctrl+G` đến số dòng, `Ctrl+Shift+F` tìm mã chú thích như `[PY-001]`, `[API-001]`, `[HOUR-001]`, `Alt+Z` bật xuống dòng khi comment dài. Chú thích giải thích các dòng/khối có ý nghĩa; dấu ngoặc đóng và dòng trắng không có ghi chú riêng.

## 2. Mở ứng dụng bằng Python trên laptop Windows

### Chuẩn bị

1. Cài **Python 3.10 trở lên** từ [python.org/downloads](https://www.python.org/downloads/) nếu máy chưa có.
2. Ở trình cài Windows, chọn **Add Python to PATH**; sau đó đóng và mở lại terminal hoặc VS Code.
3. Nhấp phải file ZIP → **Extract All / Giải nén tất cả**.
4. Mở thư mục `MayViet` có **`app.py`** và thư mục **`dist`** nằm cạnh nhau. Không chạy trực tiếp từ trong ZIP và không chép riêng mỗi `app.py`.
5. Trong VS Code chọn **File → Open Folder → MayViet**, rồi **Terminal → New Terminal**.

### Chạy

```powershell
python --version
python app.py
```

Nếu Windows nhận lệnh `py` thay cho `python`:

```powershell
py app.py
```

Trình duyệt tự mở, thường tại **http://localhost:5173**. Nếu chưa mở, nhập URL mà terminal in ra. Giữ terminal đang chạy; muốn dừng bấm **Ctrl+C**. Bạn cũng có thể mở `app.py` trong VS Code rồi chọn **Run Python File in Terminal** nếu đã cài phần mở rộng Python.

Nếu cổng 5173 bận, app thử thêm tối đa 10 cổng và in cổng đã chọn; hãy dùng đúng địa chỉ đó. Khi cổng đổi, cài đặt và yêu thích có thể nằm ở vùng lưu khác của trình duyệt; quay về `localhost:5173` sẽ dùng lại vùng lưu cũ.

`requirements.txt` chỉ có ghi chú vì bản này không có phụ thuộc pip, nên không cần tạo môi trường ảo. **Không nhấp đúp `index.html`** để chạy mã TSX.

### Các tùy chọn dòng lệnh

```powershell
python app.py --help
python app.py --port 5175
python app.py --no-open
python app.py --verbose
```

| Tùy chọn      | Tác dụng                                       |
| ------------- | ---------------------------------------------- |
| `--port 5175` | Chọn cổng bắt đầu khác; chấp nhận 1024..65525  |
| `--no-open`   | Chạy server nhưng không tự bật trình duyệt     |
| `--verbose`   | In log file được trình duyệt yêu cầu để gỡ lỗi |
| `--help`      | Xem hướng dẫn mà không mở server               |

## 3. Đọc code và chỉnh sửa bằng VS Code

### 3.1. Hiểu app.py theo thứ tự

| Phần Python                 | Tác dụng                                                                   |
| --------------------------- | -------------------------------------------------------------------------- |
| Các `import`                | Dùng module chuẩn Python; mỗi module có chú thích công dụng                |
| `APP_DIR`, `DIST_DIR`       | Tìm thư mục giao diện theo vị trí `app.py`, không phụ thuộc CWD            |
| `HOST`, `DEFAULT_PORT`      | Giới hạn server trên laptop và đặt cổng mặc định                           |
| `CONTENT_TYPES`             | Đảm bảo JS/CSS/font/manifest có MIME chính xác                             |
| `WeatherRequestHandler`     | Nhận GET/HEAD, kiểm tra đường dẫn và gửi file dưới `dist`                  |
| `MayVietServer`             | Tải nhiều tài nguyên đồng thời, xử lý khác biệt bind cổng Windows          |
| `parse_port()`              | Kiểm tra số cổng hợp lệ từ terminal                                        |
| `make_server()`             | Kiểm tra có `dist`, thử cổng được chọn và các cổng dự phòng                |
| `open_browser()`            | Mở trình duyệt; nếu thất bại vẫn có URL để mở tay                          |
| `main()`                    | Đọc tham số, khởi động, in địa chỉ, chờ sử dụng và dọn tài nguyên khi dừng |
| `if __name__ == "__main__"` | Chỉ chạy ứng dụng khi gọi file trực tiếp; import để test không tự mở web   |

Một vài điểm cú pháp Python hay gặp: `self` là đối tượng đang xử lý; `class` định nghĩa lớp; `def` định nghĩa hàm; thụt lề xác định khối lệnh; `try/except` xử lý lỗi; `finally` dọn tài nguyên; `return` trả kết quả; `raise` báo lỗi cho nơi gọi; `# ...` là chú thích, không thực thi.

**Quy trình sửa `app.py`:** sửa → lưu → `Ctrl+C` ở terminal đang chạy → chạy lại `python app.py`. Khởi chạy Python không tự biên dịch lại TSX.

### 3.2. Khi cần sửa giao diện React/TypeScript

Chỉ phần này mới cần **Node.js 22.13 trở lên** và npm. Để mở/xem app thường ngày bằng Python thì không cần cài chúng.

Tại thư mục MayViet:

```powershell
npm.cmd ci
npm.cmd run dev -- --port 5174
```

Mở URL Vite in ra, sửa trong `src/`, bấm `Ctrl+S` để xem thay đổi. Cổng 5174 tránh trùng server Python mặc định 5173; có thể dừng Python khi chỉ dùng chế độ dev. Trên macOS/Linux thay `npm.cmd` bằng `npm`.

Sau khi sửa giao diện, kiểm tra rồi build:

```powershell
npm.cmd test
npm.cmd run build
python app.py
```

`build` kiểm tra TypeScript và tạo lại `dist`. Nếu server Python đang chạy, chỉ cần tải lại trang sau khi build xong, không mở thêm server mới.

> **Nhớ:** chỉ sửa `src/` mà chưa build thì `app.py` vẫn phục vụ bản giao diện cũ trong `dist/`.

### 3.3. Kiểm tra phần Python

```powershell
python -m unittest discover -s tests -p "test_*.py" -v
```

Không cần npm hoặc pip để chạy 18 bài kiểm tra Python. Chúng dùng HTTP localhost và thư mục tạm, không gọi dữ liệu dự báo thật. Chi tiết ở mục 14.

## 4. Cấu trúc thư mục và trách nhiệm

| File / thư mục                       | Tác dụng                                                              | Có nên sửa?                         |
| ------------------------------------ | --------------------------------------------------------------------- | ----------------------------------- |
| `app.py`                             | Server Python phục vụ `dist`, kiểm tra đường dẫn/cổng, mở trình duyệt | Có, phần chính đều có chú thích     |
| `src/main.tsx`                       | Điểm vào: nạp CSS và render React vào `#root`                         | Khi đổi cấu trúc khởi động          |
| `src/components/weather-app.tsx`     | Màn hình chính, state, tìm kiếm, GPS, yêu thích, dự báo ngày          | Có                                  |
| `src/components/hourly-forecast.tsx` | Biểu đồ, cuộn từng giờ, chọn giờ và chi tiết                          | Có                                  |
| `src/lib/weather-client.ts`          | URL API, fetch, cache, gộp yêu cầu, xử lý 429                         | Có                                  |
| `src/lib/weather.ts`                 | Kiểu dữ liệu, địa điểm mẫu, định dạng và `getHourlyTimeline()`        | Có                                  |
| `src/index.css`                      | CSS nền tảng, bố cục, responsive và chế độ tối                        | Có                                  |
| `src/glass-update.css`               | Ghi đè nền kính mờ và bố cục đủ từng giờ                              | Có, ưu tiên khi chỉnh độ trong      |
| `public/`                            | Favicon, manifest, font; được sao chép vào `dist/` khi build          | Có nếu đổi tài nguyên               |
| `tests/`                             | 18 kiểm tra Python và 11 kiểm tra xử lý dữ liệu/API                   | Đọc hoặc chạy khi sửa logic         |
| `index.html`                         | Vỏ HTML, tiêu đề tab, `#root`, điểm vào TSX                           | Có                                  |
| `vite.config.ts`                     | Plugin React, alias `@`, địa chỉ/cổng dev server                      | Khi cần cấu hình công cụ            |
| `tsconfig.json`                      | Quy tắc kiểm tra kiểu TypeScript                                      | Đọc mục 15 trước khi sửa            |
| `package.json`                       | Thư viện, phiên bản và các lệnh npm                                   | Khi thay phụ thuộc/lệnh chạy        |
| `package-lock.json`                  | Khóa cây phiên bản phụ thuộc để cài lặp lại được                      | Để npm cập nhật, không sửa tay      |
| `requirements.txt`                   | Giải thích không cần gói pip ngoài thư viện chuẩn                     | Không cần cài gì từ file này        |
| `dist/`                              | Kết quả build để chạy ngay                                            | Không sửa tay; build lại từ `src/`  |

`node_modules/` không được đóng gói vì lớn và có thể tạo lại bằng `npm.cmd ci`. Các file trong `dist/assets/` đã được tối ưu, nên hãy đọc `src/` thay vì bundle.

## 5. Dùng module và thư viện nào?

Phiên bản dưới đây là phiên bản được khóa trong gói mã nguồn này, không phải lời khẳng định đây là bản mới nhất.

| Công nghệ              | Phiên bản | Vai trò                                                                        |
| ---------------------- | --------- | ------------------------------------------------------------------------------ |
| Python                 | Từ 3.10   | Chạy `app.py` bằng các module chuẩn, không cần pip                             |
| React + React DOM      | 19.2.6    | Component, state và cập nhật giao diện trình duyệt                             |
| TypeScript             | 5.9.3     | Kiểm tra kiểu dữ liệu, phát hiện nhiều lỗi trước khi build                     |
| Vite                   | 8.0.13    | Máy chủ phát triển và công cụ build                                            |
| `@vitejs/plugin-react` | 6.0.2     | Hỗ trợ JSX/TSX và cập nhật nhanh khi sửa React                                 |
| Recharts               | 3.8.0     | Biểu đồ nhiệt độ, xác suất mưa và gió                                          |
| lucide-react           | 1.31.0    | Icon SVG như mặt trời, mây, mưa và tìm kiếm                                    |
| CSS                    | Tự viết   | Màu, responsive, giao diện sáng/tối, kính mờ                                   |
| Node.js                | Từ 22.13  | Chỉ để sửa/build frontend và chạy test TypeScript; không cần để mở bằng app.py |

API/module có sẵn, không cần cài thêm bằng pip/npm:

| API / module                                        | Tác dụng                                                          |
| --------------------------------------------------- | ----------------------------------------------------------------- |
| `fetch`, `URL`, `URLSearchParams`                   | Gọi HTTP và dựng URL với tham số được mã hóa an toàn              |
| `AbortController`                                   | Hủy fetch khi timeout; ở component dùng cờ abort để bỏ kết quả cũ |
| `localStorage`, `Map`                               | Lưu tùy chọn/cache trong trình duyệt và RAM                       |
| `navigator.geolocation`                             | Xin vị trí khi người dùng bấm định vị                             |
| `ResizeObserver`                                    | Đo lại vùng cuộn khi khung đổi kích thước                         |
| `Intl.NumberFormat`, `Intl.DateTimeFormat`          | Định dạng số/ngày bằng tiếng Việt                                 |
| `http.server`, `http.HTTPStatus`                    | Server localhost, xử lý GET/HEAD và mã phản hồi HTTP              |
| `pathlib`, `urllib.parse`, `mimetypes`              | Kiểm tra đường dẫn, giải mã URL và nhận diện kiểu file            |
| `argparse`, `errno`, `socket`                       | Đọc tham số và xử lý cổng, gồm khác biệt trên Windows             |
| `threading`, `webbrowser`, `sys`                    | Mở trình duyệt, giữ vòng chạy và kết thúc chương trình            |
| `unittest`, `http.client`, `tempfile`, `subprocess` | Kiểm tra Python bằng HTTP, file tạm và tiến trình thật            |
| `node:test`, `node:assert/strict`                   | Chạy và xác nhận kết quả kiểm thử                                 |

Bản này dùng **Python cho máy chủ cục bộ** và React/TypeScript cho giao diện. Không dùng Flask, Pandas hay SQL vì hiện chưa cần. Python thay phần khởi chạy; nguồn dự báo, cache và xử lý 429 vẫn nằm ở tầng dữ liệu của giao diện.

## 6. Dữ liệu đi qua ứng dụng như thế nào?

```text
python app.py ──► dist/index.html + JS/CSS/font ──► trình duyệt
                                                       │
                          Open-Meteo (gọi trực tiếp) ◄─┘
```

1. `python app.py` mở server và gửi `dist/index.html` cùng JS/CSS đã build cho trình duyệt. Trong mã nguồn, `src/main.tsx` là điểm vào React render `WeatherApp`.
2. `WeatherApp` khôi phục cài đặt và địa điểm đã lưu, rồi xác định địa điểm cần xem.
3. Effect gọi `fetchForecast(latitude, longitude)` trong `weather-client.ts`.
4. `forecastUrl()` tạo URL. `publicJson()` kiểm tra cache, yêu cầu đang chạy và thời gian chờ 429 trước khi dùng `fetch`.
5. JSON hợp lệ được gắn `fetchedAt`, đưa vào state và cache.
6. Giao diện đọc `current`, `hourly`, `daily`. `HourlyForecast` dùng `getHourlyTimeline()` để lấy từng mốc liên tiếp.
7. Khi chọn giờ/ngày/đơn vị, React cập nhật hiển thị từ dữ liệu đã tải; không gọi API riêng cho từng giờ.

`app.py` chỉ gửi file HTML/JS/CSS/font cho trình duyệt. **Yêu cầu Open-Meteo đi trực tiếp từ trình duyệt**, không qua máy chủ Python; cách này giữ nguyên cơ chế lấy dữ liệu hiện có. Server không đọc CSV hay dựng số liệu ngẫu nhiên. Dữ liệu mới cần Internet dù giao diện chạy bằng localhost.

## 7. API lấy từ đâu và gọi chỗ nào?

### 7.1. Dự báo thời tiết — Open-Meteo Forecast API

- Endpoint: `https://api.open-meteo.com/v1/forecast`
- Tài liệu: [Open-Meteo Weather Forecast API](https://open-meteo.com/en/docs)
- File thực hiện: `src/lib/weather-client.ts`
  - `forecastUrl()` dựng URL.
  - `fetchForecast()` lấy một nơi.
  - `fetchCities()` lấy tóm tắt nhiều nơi cùng lúc.
- Dùng endpoint công khai, không có khóa API bí mật trong mã nguồn.

| Tham số                 | Giá trị / mục đích                                                                                   |
| ----------------------- | ---------------------------------------------------------------------------------------------------- |
| `latitude`, `longitude` | Tọa độ nơi người dùng chọn                                                                           |
| `timezone`              | `Asia/Ho_Chi_Minh` — GMT+7                                                                           |
| `forecast_days`         | `7` cho dự báo chính, `1` cho tóm tắt thành phố                                                      |
| `current`               | Nhiệt độ, độ ẩm, cảm nhận, ngày/đêm, mưa, mã thời tiết, mây, áp suất, gió                            |
| `hourly`                | Nhiệt độ, độ ẩm, xác suất mưa, lượng mưa, mã thời tiết, tầm nhìn, gió, UV, ngày/đêm                  |
| `daily`                 | Mã thời tiết, nhiệt độ cao/thấp, mặt trời mọc/lặn, UV cực đại, tổng mưa, xác suất mưa và gió cực đại |

Ví dụ rút gọn cho TP.HCM để bạn tự xem JSON (URL đầy đủ nằm trong `forecastUrl()` và nút **Xem dữ liệu gốc**):

```text
https://api.open-meteo.com/v1/forecast?latitude=10.7769&longitude=106.7009&current=temperature_2m,weather_code&hourly=temperature_2m,precipitation_probability,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=Asia%2FHo_Chi_Minh&forecast_days=7
```

Cấu trúc phản hồi — ví dụ minh họa, không phải thời tiết đang xảy ra:

```json
{
  "current": { "time": "2026-11-07T23:45", "temperature_2m": 27.8 },
  "hourly": {
    "time": ["2026-11-07T23:00", "2026-11-08T00:00", "2026-11-08T01:00"],
    "temperature_2m": [27, 26, 25],
    "precipitation_probability": [40, 50, 60]
  }
}
```

`hourly.time[i]`, `hourly.temperature_2m[i]` và `hourly.precipitation_probability[i]` thuộc **cùng một giờ**. Không ghép thời gian ở chỉ số này với giá trị ở chỉ số khác.

### 7.2. Tìm địa điểm — Open-Meteo Geocoding API

- Endpoint: `https://geocoding-api.open-meteo.com/v1/search`
- Tài liệu: [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api)
- Hàm: `searchPlaces()` trong `weather-client.ts`.
- Tham số: `name`, `count=8`, `language=vi`, `countryCode=VN`.
- Chỉ gọi khi từ khóa có ít nhất 2 ký tự; cắt tối đa 80 ký tự.
- Dữ liệu địa danh dựa trên GeoNames; kết quả được đổi thành kiểu `Place` và kiểm tra mã quốc gia.

```text
https://geocoding-api.open-meteo.com/v1/search?name=Da%20Lat&count=8&language=vi&countryCode=VN
```

### 7.3. Tự kiểm tra API đang dùng

1. Mở ứng dụng và chọn địa điểm.
2. Bấm **Xem dữ liệu gốc** dưới biểu đồ để mở JSON đúng tọa độ.
3. Hoặc bấm **F12 → Network → Fetch/XHR**, tải lại trang rồi mở request tới Open-Meteo → Response.
4. Chưa thấy request mới nghĩa là ứng dụng có thể đang dùng cache. Không cần bấm liên tục vì làm mới có khoảng chờ tối thiểu.

### 7.4. Đơn vị và độ mới

| Trường                                   | Ý nghĩa / đơn vị dùng trong bản này        |
| ---------------------------------------- | ------------------------------------------ |
| `temperature_2m`, `apparent_temperature` | °C gốc; chỉ đổi sang °F khi hiển thị       |
| `relative_humidity_2m`, `cloud_cover`    | %                                          |
| `precipitation_probability`              | Xác suất có giáng thủy, %, khác lượng mưa  |
| `precipitation`, `precipitation_sum`     | Lượng giáng thủy, mm                       |
| `wind_speed_10m`, `wind_gusts_10m`       | km/h                                       |
| `wind_direction_10m`                     | Hướng gió thổi **từ**, theo độ             |
| `visibility`                             | m, giao diện đổi sang km khi trình bày     |
| `surface_pressure`                       | hPa                                        |
| `uv_index`                               | Chỉ số UV                                  |
| `weather_code`                           | Mã WMO, được Việt hóa bằng `weatherInfo()` |

`current.time` là thời điểm của dữ liệu mô hình. `fetchedAt` là lúc ứng dụng nhận phản hồi; đọc từ cache thì giữ nguyên mốc này. Kiểm tra mỗi 15 phút không có nghĩa mô hình dự báo được phát hành mới mỗi 15 phút. Đây không phải luồng cảm biến đo trực tiếp từng giây tại vị trí của bạn.

## 8. Cách hiển thị đủ từng giờ

Phần xử lý nằm ở **`getHourlyTimeline()`**, phần vẽ ở **`HourlyForecast`**.

- **Hôm nay:** tìm giờ chứa `current.time`, lấy tối đa **24 mốc**, mỗi mốc cách 1 giờ (không nhảy 3 giờ).
- **Mốc đầu** ghi **Bây giờ**, dùng nhiệt độ/gió/độ ẩm/mã thời tiết từ `current`.
- **Các mốc sau** lấy `hourly` theo từng giờ tròn. Ví dụ lúc 23:45: **Bây giờ → 00:00 → 01:00 → 02:00...**; ngày hiển thị dưới mỗi mốc.
- **Xác suất mưa** của "Bây giờ" lấy từ giờ tương ứng trong `hourly`, vì nhóm `current` đã chọn không có trường này.
- **Ngày tương lai:** lấy các giờ 00:00..23:00 của ngày đó nếu API có đủ.
- **Thiếu dữ liệu cuối phạm vi:** chỉ hiển thị số mốc có thật, không tự tạo thêm.
- **`null`** là thiếu dữ liệu: hiển thị `—`, không chuyển thành 0°C hay 0%.

Mỗi mốc có bề rộng `STEP = 72` px. Biểu đồ và hàng thẻ nằm trong **cùng vùng cuộn**. Trục X có `interval={0}` để giữ mọi nhãn giờ, trục Y dành 32 px. Mũi tên dịch mỗi lần 72 px; có thể kéo ngang hoặc dùng phím trái/phải khi vùng cuộn được focus.

Đường biểu đồ dùng `monotone` để làm mượt nét vẽ; tùy chọn này không gọi thêm dự báo hay tạo thêm giờ dữ liệu. `connectNulls={false}` giữ khoảng trống khi chỉ số bị thiếu.

## 9. Những phương pháp tối ưu đã có

| Phương pháp            | Mốc / cách làm thực tế                                                            | Tác dụng                                                         |
| ---------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Cache dự báo           | 15 phút (`REFRESH_MS`)                                                            | Giảm số request khi mở lại/chuyển qua lại                        |
| Chặn làm mới quá nhanh | 30 giây (`MIN_REFRESH_MS`)                                                        | Bấm liên tục không gọi lại ngay                                  |
| Cache tìm kiếm         | 1 giờ theo URL từ khóa                                                            | Không hỏi lại cùng tên quá thường xuyên                          |
| Cache hai tầng         | `Map` trong RAM + `localStorage`                                                  | RAM nhanh, storage dùng lại sau khi tải trang                    |
| Gộp yêu cầu trùng      | `pending: Map<URL, Promise>`                                                      | Nhiều component hỏi cùng URL chỉ có một fetch đang chạy          |
| Batch thành phố        | 4 tọa độ trong một request                                                        | Giảm số lượt gọi cho các thẻ                                     |
| Debounce tìm kiếm      | 350 ms sau khi dừng gõ                                                            | Không gọi Geocoding với từng phím nhập                           |
| Timeout mạng           | 18 giây                                                                           | Không treo chờ vô hạn                                            |
| Tuân thủ HTTP 429      | Dùng `Retry-After`; mặc định 60 giây khi thiếu/hỏng                               | Không gửi thêm request trong thời gian nguồn yêu cầu chờ         |
| Giới hạn cache RAM     | Khoảng 60 URL, bỏ khóa chèn sớm nhất                                              | Hạn chế số mục RAM; không phải LRU đầy đủ                        |
| `useMemo`              | Kết quả tìm kiếm và danh sách giờ                                                 | Tránh tính lại khi đầu vào không đổi                             |
| Giữ dữ liệu gần nhất   | Khôi phục bản thành công nếu dưới 3 giờ                                           | Có thể xem bản đã lưu trong lúc tải/có lỗi; có ghi trạng thái cũ |
| Kiểm tra tab hiển thị  | Dự báo chính kiểm tra mỗi 15 phút khi visible; quay lại tab kiểm tra tuổi dữ liệu | Giảm cập nhật dự báo chính ở nền                                 |
| Tài nguyên cục bộ      | Font và icon nằm trong gói build                                                  | Giảm phụ thuộc tải ảnh/font từ dịch vụ khác                      |

Hai điều cần hiểu đúng:

- Timer tóm tắt thành phố vẫn chạy mỗi 15 phút dù tab ở nền; không phải mọi timer đều dừng khi ẩn tab.
- Giới hạn 3 giờ chỉ áp dụng lúc khôi phục bản lưu; dữ liệu đã có trong phiên đang mở vẫn được giữ nếu lần cập nhật tiếp theo thất bại.

Các phương pháp này tối ưu việc **lấy và hiển thị** dữ liệu, **không thay đổi độ chính xác của mô hình khí tượng**. Cache cũng có nghĩa là bấm làm mới có thể vẫn thấy cùng số liệu khi bản trước còn mới.

## 10. Hiểu các hook React trong code

| Hook          | Hiểu đơn giản                                                      | Ví dụ trong ứng dụng                          |
| ------------- | ------------------------------------------------------------------ | --------------------------------------------- |
| `useState`    | Giữ một giá trị và hàm cập nhật để React render lại                | `place`, `unit`, `theme`, `selectedDay`       |
| `useEffect`   | Chạy việc cần tác động ra ngoài sau render; theo dõi các phụ thuộc | Tải API, lưu storage, gắn listener, tạo timer |
| `useMemo`     | Nhớ kết quả tính toán đến khi đầu vào đổi                          | Danh sách giờ từ `data` và `selectedDay`      |
| `useRef`      | Giữ tham chiếu qua các lần render; đổi ref không tự render         | Input tìm kiếm, phần tử cuộn                  |
| `useCallback` | Nhớ tham chiếu hàm khi các phụ thuộc không đổi                     | `selectPlace()` dùng chung nhiều vị trí       |

Effect có thể trả về **cleanup**, ví dụ `return () => clearInterval(timer)`. Cleanup chạy trước khi effect chạy lại hoặc khi component bị tháo, giúp gỡ timer/listener và không giữ công việc cũ.

Trong component, `controller.abort()` chủ yếu đánh dấu kết quả đã lỗi thời để không ghi đè địa điểm/từ khóa mới. Request dùng chung ở tầng API có controller riêng và bị ngắt thực sự khi timeout 18 giây; đổi từ khóa không có nghĩa request chia sẻ đã bị hủy trên mạng.

Trong chế độ phát triển, `StrictMode` có thể chạy effect thêm một lượt để phát hiện lỗi cleanup. Map `pending` ở tầng API giúp gộp những yêu cầu giống nhau đang chạy.

## 11. Chỉnh giao diện kính mờ

File **`src/glass-update.css`** được import sau `src/index.css`, nên các quy tắc ghi đè cùng độ ưu tiên được áp dụng sau.

Ví dụ đang có trong code:

```css
:root {
  --card: rgba(255, 255, 255, 0.76);
}
```

- `0.76`: nền đục 76%, vẫn thấy nhẹ màu phía sau. Giảm về `0.65` để trong hơn; tăng về `0.90` để đặc hơn.
- `backdrop-filter: blur(20px)`: làm mờ nền phía sau bề mặt kính.
- `radial-gradient` trong `--canvas-glow`: tạo vùng sáng pastel.
- `border-radius` bo góc; `box-shadow` tạo bóng nhẹ.
- Bộ màu riêng cho chế độ tối nằm dưới `:root[data-theme="dark"]`.
- `@supports not (...)`: chuyển sang nền đặc khi trình duyệt không hỗ trợ blur.

Để chữ rõ, hãy đổi alpha của **màu nền**. Nếu đặt `opacity: 0.7` cho cả thẻ thì chữ và icon cũng mờ theo. Hiệu ứng trong suốt chỉ nằm trong trang web, không xuyên ra desktop laptop.

## 12. Muốn đổi chức năng thì sửa ở đâu?

| Mục tiêu                   | Chỗ sửa                                                       | Điều cần giữ                                                                       |
| -------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Đổi địa điểm mặc định      | Phần khởi tạo `place` trong `WeatherApp` hoặc thứ tự `PLACES` | Cài đặt đã lưu có thể ghi đè mặc định; chọn lại nơi hoặc xóa tùy chọn cũ           |
| Thêm địa điểm tìm nhanh    | Mảng `PLACES` trong `weather.ts`                              | `id` duy nhất, tọa độ đúng; `aliases` hỗ trợ tên tắt                               |
| Đổi thời gian cache dự báo | `REFRESH_MS` trong `weather-client.ts`                        | Đối chiếu lịch 15 phút và `lastSuccess` trong `weather-app.tsx` để hành vi đồng bộ |
| Đổi độ trễ tìm kiếm        | `setTimeout(..., 350)` trong effect tìm kiếm                  | Quá ngắn tăng số request; đây không phải khoảng dự báo                             |
| Thêm một chỉ số            | Chuỗi `current`/`hourly`/`daily`, kiểu dữ liệu và JSX         | Phải yêu cầu trường đó từ API, xác định đơn vị và xử lý null                       |
| Đổi số mốc hôm nay         | `first + 24` trong `getHourlyTimeline()`                      | Đổi nhãn tiêu đề nếu cần; kiểm tra API có đủ dữ liệu tương lai                     |
| Đổi chiều rộng một giờ     | `STEP` trong `hourly-forecast.tsx`                            | Giữ độ rộng inner, padding trục và grid thẻ khớp nhau                              |
| Đổi màu/độ trong           | Biến CSS trong `glass-update.css`                             | Chỉnh cả sáng/tối và giữ tương phản chữ                                            |
| Đổi lời nhắc               | Biến `tip` trong `weather-app.tsx`                            | Đơn vị so ngưỡng vẫn là dữ liệu °C gốc                                             |
| Đổi tên ứng dụng           | Component `Brand`, `index.html`, manifest trong `public/`     | Build lại để cập nhật bản chạy nhanh                                               |
| Đổi cổng nhanh             | `--port` khi chạy `python app.py`                             | Dùng URL được in ra, không đoán cổng                                               |

**Trình tự sửa hợp lý:** sửa một nhóm nhỏ → lưu để xem bằng dev server → chạy kiểm tra khi sửa xử lý dữ liệu → build lại → mở bản `dist`.

## 13. Dữ liệu lưu ở đâu? Có cần backend không?

Bản hiện tại không có đăng nhập/đăng ký, không lưu yêu thích vào SQL và không đồng bộ giữa nhiều thiết bị.

| Nhóm dữ liệu                          | Nơi lưu                                             |
| ------------------------------------- | --------------------------------------------------- |
| Đơn vị, giao diện, địa điểm đang chọn | localStorage: `may-viet-preferences-v1`             |
| Địa điểm yêu thích, tối đa 30 mục     | localStorage: `may-viet-favorites-v1`               |
| Dự báo gần nhất theo tọa độ           | Khóa bắt đầu `may-viet-weather-`                    |
| Cache JSON theo URL và hạn chờ 429    | Khóa bắt đầu `may-viet-direct-v1:`                  |
| Cache RAM và request đang chạy        | Các Map trong `weather-client.ts`, mất khi tab đóng |

Xem bằng **F12 → Application → Local Storage** trong Chrome/Edge. Storage gắn với trình duyệt và địa chỉ truy cập: `localhost:5173`, `localhost:5174`, `127.0.0.1:5173` và bản web đã xuất bản **không** chia sẻ dữ liệu lưu.

`app.py` hiện chỉ phục vụ giao diện trên localhost. Nếu bổ sung tài khoản, đồng bộ, lưu lịch sử hoặc dịch vụ cần khóa bí mật, cần phát triển thêm backend. Khi dùng API có khóa bí mật, **không** đặt khóa đó vào file frontend hay biến môi trường `VITE_...`, vì mã build được gửi đến trình duyệt.

**Về GPS:** chỉ dùng khi bạn nhấn định vị và trình duyệt cấp quyền. Tọa độ được gửi đến Open-Meteo để lấy dự báo và có thể nằm trong cài đặt/cache trình duyệt. Việc kiểm tra vùng tọa độ hiện là hộp giới hạn rộng, không phải xác thực ranh giới hành chính chính xác.

## 14. Các bài kiểm tra và phạm vi đã xác nhận

| File                             | Số bài | Nội dung                                                                                                                                                         |
| -------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tests/test_app.py`              | 18     | HTTP thật, GET/HEAD, MIME JS/CSS/font, file có dấu, query, lỗi 404/405, chặn thoát `dist`, cổng bận, thiếu `dist`, chạy CLI khác CWD, tải bản build thật, xử lý dừng |
| `tests/weather-client.test.mjs`  | 6      | Tọa độ sai, gộp request/giữ `fetchedAt`, không cache JSON thiếu, batch, tìm ở VN, `Retry-After`                                                                  |
| `tests/hourly-timeline.test.mjs` | 5      | Mọi giờ qua nửa đêm, `current` cho "Bây giờ", đủ ngày tương lai, phạm vi thiếu và giữ null                                                                       |

Kiểm tra Python (không cần thư viện ngoài):

```powershell
python -m unittest discover -s tests -p "test_*.py" -v
```

Kiểm tra logic frontend (khi máy đã có Node):

```powershell
npm.cmd test
```

**Kết quả bản giao ngày 10/11/2026:** đạt **18/18 test Python và 11/11 test dữ liệu**, không có bài bị bỏ qua trong môi trường kiểm tra. Mã nguồn `src/`, `public/` và toàn bộ `dist` được đối chiếu với bản trước để giữ nguyên giao diện và logic thời tiết. Test CLI tải thực tế HTML, JS, CSS, font và manifest qua server Python, gồm cả đường dẫn có dấu/khoảng trắng và chạy từ thư mục khác.

**Phạm vi và giới hạn:**

- Môi trường kiểm tra: Python 3.12 trên Linux, Node.js 24. **Chưa chạy trên laptop Windows thật**; code có xử lý riêng cổng Windows và bạn có thể chạy lại test trên máy mình.
- Một số Windows cần quyền bổ sung để tạo symlink, nên hai test symlink có thể báo *skipped* khi bạn tự chạy; các phần còn lại vẫn chạy bình thường.
- Test dữ liệu dùng fixture/fetch giả, không kiểm chứng độ chính xác dự báo ngoài trời hay tình trạng API tại mọi thời điểm.
- Server Python đã được kiểm tra bằng HTTP thật, nhưng quyền GPS và trình duyệt mặc định còn phụ thuộc máy người dùng.

Khi đọc test: `assertEqual`/`assert.equal` yêu cầu giá trị bằng nhau; `assert.deepEqual` so mảng/đối tượng; `assert.rejects` kiểm tra lỗi async. `setUp` và cleanup tạo/dọn môi trường riêng để test không sửa dữ liệu thật.

## 15. Những file JSON không ghi chú trực tiếp được

JSON chuẩn không cho phép `//` hoặc `/* ... */`, nên phần giải thích của các file JSON nằm ở đây để chúng vẫn đọc/chạy đúng.

### `package.json`

| Trường / lệnh                    | Tác dụng                                                                                                   |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `name`, `version`, `description` | Thông tin gói dự án                                                                                        |
| `private: true`                  | Ngăn vô tình đưa dự án lên npm như một package công khai                                                   |
| `type: module`                   | Dùng chuẩn ES module `import` / `export`                                                                   |
| `engines.node`                   | Yêu cầu Node từ 22.13 cho công cụ phát triển frontend; không áp dụng cho `python app.py`                   |
| `dev`                            | Chạy Vite để phát triển trên localhost                                                                     |
| `build`                          | `tsc --noEmit` kiểm tra kiểu rồi `vite build` tạo `dist`                                                   |
| `preview`                        | Xem thử `dist` bằng Vite sau khi đã cài dependencies                                                       |
| `start`                          | Lối gọi Python qua npm nếu máy đã có Node: `python app.py`. Cách trực tiếp `python app.py` được khuyên dùng |
| `test`                           | Node test runner; `--experimental-strip-types` cho phép đọc TypeScript trong các module được kiểm tra      |
| `dependencies`                   | Thư viện ứng dụng dùng lúc xây dựng/chạy trong trình duyệt                                                 |
| `devDependencies`                | Công cụ build và bộ khai báo kiểu                                                                          |

Bản `dist` đã chứa mã cần dùng từ các thư viện, nên chế độ mở nhanh không phải cài lại React/Recharts bằng npm.

### `tsconfig.json`

| Thiết lập                                     | Ý nghĩa                                                     |
| --------------------------------------------- | ----------------------------------------------------------- |
| `target: ES2022`                              | Mức ngôn ngữ JavaScript mục tiêu                            |
| `lib`                                         | Khai báo những API ngôn ngữ/trình duyệt mà TypeScript biết  |
| `module: ESNext`, `moduleResolution: Bundler` | Kiểu module phù hợp quy trình Vite                          |
| `jsx: react-jsx`                              | Cách xử lý JSX của React                                    |
| `strict: true`                                | Bật kiểm tra kiểu chặt, gồm việc xử lý giá trị thiếu        |
| `noEmit: true`                                | TypeScript chỉ kiểm tra, việc tạo bundle giao cho Vite      |
| `isolatedModules`                             | Giữ code tương thích với cách chuyển đổi theo từng module   |
| `esModuleInterop`                             | Hỗ trợ tương tác kiểu import với thư viện khác chuẩn module |
| `skipLibCheck`                                | Bỏ kiểm tra sâu phần khai báo kiểu của thư viện             |
| `resolveJsonModule`                           | Cho phép import file JSON khi cần                           |
| `types`                                       | Nạp kiểu hỗ trợ Vite và Node                                |
| `baseUrl`, `paths`                            | TypeScript hiểu alias `@/*`; cần khớp với `vite.config.ts`  |
| `include`                                     | Giới hạn file cần kiểm tra trong `src` và cấu hình Vite     |

### `public/manifest.webmanifest`

Mô tả tên đầy đủ, tên ngắn, ngôn ngữ, icon, màu nền/thanh trình duyệt, `start_url` và `display: standalone`. Đây là mô tả giao diện khi trình duyệt dùng manifest; ứng dụng chưa có service worker để cache toàn bộ và chạy offline đầy đủ.

## 16. Từ khóa và cú pháp thường gặp khi đọc code

| Cú pháp                              | Hiểu đơn giản                                                                  |
| ------------------------------------ | ------------------------------------------------------------------------------ |
| `const` / `let`                      | Khai báo biến; `const` không gán lại biến, `let` cho phép gán lại              |
| `type Place = {...}`                 | Khai báo hình dạng dữ liệu, không tạo bảng cơ sở dữ liệu                       |
| `number \| null`                     | Giá trị là số hoặc bị thiếu; dấu `\|` đọc là "hoặc"                            |
| `region?: string`                    | Thuộc tính không bắt buộc                                                      |
| `data?.current`                      | Chỉ đọc `current` nếu `data` không null/undefined                              |
| `value ?? null`                      | Chỉ dùng giá trị thay thế khi null/undefined; vẫn giữ 0                        |
| `value \|\| fallback`                | Dùng fallback với mọi giá trị falsy, gồm 0, chuỗi rỗng, false, null, undefined |
| `x ? a : b`                          | Nếu x đúng dùng a, ngược lại dùng b                                            |
| `async` / `await`                    | Viết việc bất đồng bộ theo thứ tự dễ đọc, không chặn toàn bộ trình duyệt       |
| `Promise<T>`                         | Kết quả sẽ có sau này, có thể thành công hoặc lỗi, với kiểu dữ liệu T          |
| `<T>` trong hàm                      | Kiểu tổng quát, giúp dùng cùng một hàm cho nhiều cấu trúc dữ liệu              |
| `.map()` / `.filter()`               | Tạo mảng kết quả mới / giữ lại phần tử thỏa điều kiện                          |
| `...prev`                            | Sao chép các phần tử/thuộc tính để tạo dữ liệu cập nhật                        |
| `setState(prev => ...)`              | Tính trạng thái mới dựa vào trạng thái mới nhất                                |
| `try / catch / finally`              | Thử thao tác / xử lý lỗi / luôn dọn dẹp sau cùng                               |
| `as Forecast`                        | Khai báo cách TypeScript hiểu kiểu; không tự kiểm chứng JSON lúc chạy          |
| `<Component />`                      | JSX gọi component, không phải chuỗi HTML thuần                                 |
| `{expression}` trong JSX             | Chèn biểu thức JavaScript vào giao diện                                        |
| `key={p.id}`                         | Khóa giúp React nhận diện từng phần tử trong danh sách                         |
| `onClick={() => ...}`                | Hàm chỉ chạy khi bấm nút, không chạy ngay trong lúc render                     |
| `aria-*`                             | Thông tin hỗ trợ trình đọc màn hình và trạng thái điều khiển                   |
| `// ...`, `/* ... */`, `{/* ... */}` | Chú thích JS/TS, CSS/khối và JSX; không tạo chức năng mới                      |
| `# ...` trong Python                 | Chú thích giải thích code, không thực thi                                      |

## 17. Xử lý lỗi thường gặp

| Hiện tượng                               | Cách xử lý                                                                                                 |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Máy không nhận lệnh `python`             | Thử `py app.py` trên Windows; kiểm tra đã cài Python và PATH, mở lại terminal                              |
| Gõ `python` lại mở Microsoft Store       | Dùng Python đã cài với lệnh `py`, hoặc kiểm tra thiết lập App execution aliases/PATH của Windows           |
| Python báo không mở được `app.py`        | Terminal phải ở thư mục MayViet đã giải nén; chọn Open Folder trong VS Code rồi New Terminal               |
| Báo thiếu `dist/index.html`              | Giải nén toàn bộ ZIP, đặt `dist` cạnh `app.py`; nếu đã sửa frontend thì build lại                          |
| Trình duyệt không tự mở                  | Mở URL terminal in ra; server vẫn hoạt động, không cần chạy lại nhiều lần                                  |
| Cổng mặc định đang bận                   | Ứng dụng tự thử cổng tiếp theo; hoặc chạy `python app.py --port 5200`                                      |
| Tất cả cổng dự phòng đều không khả dụng  | Chọn khoảng cổng khác bằng `--port`; dừng các phiên Mây Việt cũ nếu không còn dùng                         |
| Đóng terminal thì web không mở nữa       | Server đã dừng; chạy lại `python app.py` và giữ terminal đang mở                                           |
| Sửa `app.py` chưa thấy tác dụng          | `Ctrl+C`, lưu file rồi chạy lại `python app.py`                                                            |
| Sửa TSX/CSS nhưng bản Python chưa đổi    | Chạy `npm.cmd run build`, sau đó tải lại trang `app.py` đang phục vụ                                       |
| Không thấy yêu thích cũ                  | Kiểm tra cùng trình duyệt và đúng `localhost:cổng` trước đó; vùng lưu không dùng chung giữa các cổng/địa chỉ |
| Không tải được dữ liệu thời tiết         | Kiểm tra Internet/đồng hồ hệ thống, mở **Xem dữ liệu gốc**, xem F12 → Network; thử lại khi nguồn hoạt động |
| API báo 429                              | Chờ thời gian app thông báo, không bấm liên tục hoặc xóa hạn chờ để gọi dồn                                |
| Một chỉ số hiển thị `—`                  | Dữ liệu chưa có hoặc nguồn trả null; không nên thay bằng 0 để che phần thiếu                               |
| GPS không hoạt động                      | Cấp quyền vị trí cho đúng localhost và trong hệ điều hành; vẫn có thể tìm tên địa điểm                     |
| PowerShell chặn `npm.ps1` lúc sửa frontend | Dùng `npm.cmd`; mở `app.py` thường ngày không cần npm                                                    |
| JSON/JS/CSS bị trả lỗi                   | Chạy `python app.py --verbose`, tải lại trang, xem đường dẫn file và kiểm tra giải nén đủ `dist`           |

Nếu link API gốc cũng không tải, cần kiểm tra kết nối/nhà cung cấp. Nếu JSON tải được nhưng giao diện lỗi, xem F12 → Console/Network. Việc dùng Python không bỏ qua giới hạn hay làm thay đổi dữ liệu của nguồn dự báo.

## 18. Nguồn dữ liệu, giấy phép và phạm vi

- **Dữ liệu thời tiết:** [Open-Meteo](https://open-meteo.com/), ghi nguồn theo [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/); ứng dụng Việt hóa, đổi đơn vị và trực quan hóa.
- **Địa danh:** GeoNames qua Open-Meteo Geocoding.
- **Font Manrope:** giấy phép SIL Open Font License, bản kèm ở `public/fonts/OFL.txt`.
- **Giới hạn sử dụng:** endpoint miễn phí có giới hạn và điều kiện sử dụng phi thương mại. Nếu triển khai thương mại/quảng cáo hoặc tăng lượng truy cập, xem [điều khoản Open-Meteo](https://open-meteo.com/en/terms) và chọn quyền truy cập phù hợp.
- **Chưa có:** hệ thống tài khoản, đồng bộ nhiều thiết bị, cảnh báo thiên tai chính thức.
- **Độ tin cậy:** độ đầy đủ/độ mới của dự báo phụ thuộc dữ liệu nhà cung cấp. Gợi ý mang ô/giữ mát là quy tắc viết trong code, không phải mô hình AI tự huấn luyện.

## 19. Cách học code theo thứ tự dễ hiểu

1. Đọc `app.py` từ các import, hằng số đến `main` và phần gọi `__main__` để hiểu cách ứng dụng mở.
2. Đọc `WeatherRequestHandler` để hiểu một URL biến thành file giao diện; xem comment về MIME, GET/HEAD và bảo vệ đường dẫn.
3. Đọc `src/main.tsx`, sau đó các kiểu `Place`/`Current`/`Hourly`/`Daily`/`Forecast` trong `weather.ts`.
4. Đọc `forecastUrl()`, `fetchForecast()` và `publicJson()` để hiểu nguồn dữ liệu, cache và xử lý lỗi.
5. Đọc state/effect trong `WeatherApp` để biết khi nào tải và lưu dữ liệu.
6. Đọc `getHourlyTimeline()` và `hourly-forecast.tsx` để hiểu từng giờ qua nửa đêm.
7. Đối chiếu class trong JSX với CSS khi chỉnh giao diện; dùng `GIAI_THICH_CODE.md` để tìm đúng dòng.

**Câu tóm tắt khi cần trình bày:**

> Mây Việt dùng máy chủ Python chạy trên laptop để phục vụ giao diện React/TypeScript. Trình duyệt lấy dự báo từ Open-Meteo; tầng dữ liệu có cache, debounce, gộp request, timeout và xử lý giới hạn. App hiển thị từng giờ liên tiếp, 7 ngày và lưu tùy chọn trong trình duyệt.

## 20. Tài liệu kỹ thuật của phần Python

- [HTTP server và các lớp xử lý request của Python](https://docs.python.org/3.10/library/http.server.html)
- [Vòng đời và cơ chế thread của socketserver](https://docs.python.org/3.10/library/socketserver.html)
- [Khác biệt SO_REUSEADDR / SO_EXCLUSIVEADDRUSE trên Windows](https://learn.microsoft.com/en-us/windows/win32/winsock/using-so-reuseaddr-and-so-exclusiveaddruse)

Máy chủ trong `app.py` phục vụ việc sử dụng cá nhân trên localhost. Chưa có cấu hình triển khai dịch vụ công khai cho nhiều người dùng; đó là một phạm vi phát triển riêng.
