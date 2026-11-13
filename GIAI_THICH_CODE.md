# Mây Việt — Chú thích code

Muốn học phần Python thì mở **app.py** trước. Giao diện React nằm trong `src/`, bản đã build nằm trong `dist/`. Python chỉ phục vụ file tĩnh, không gọi API thời tiết thay trình duyệt.

Bảng dưới đây ghi **mã chú thích** và **dòng** tương ứng. Trong VS Code:
- **Ctrl+P** → gõ tên file để mở nhanh
- **Ctrl+G** → nhảy đến số dòng
- **Ctrl+Shift+F** → tìm mã như `PY-001` nếu số dòng đã thay đổi sau khi sửa file

Tổng cộng có **530 chú thích có mã** trong 13 file, riêng `app.py` có 72 chú thích.

## Danh sách file

| File | Vai trò | Số chú thích |
|---|---|---:|
| `app.py` | Khởi chạy và máy chủ Python | 72 |
| `tests/test_app.py` | 18 bài test máy chủ Python | 27 |
| `src/main.tsx` | Điểm vào React | 7 |
| `src/lib/weather.ts` | Kiểu dữ liệu, format, dữ liệu từng giờ | 85 |
| `src/lib/weather-client.ts` | Gọi API, cache, xử lý lỗi | 51 |
| `src/components/weather-app.tsx` | State, vòng đời, màn hình chính | 107 |
| `src/components/hourly-forecast.tsx` | Biểu đồ và tương tác từng giờ | 45 |
| `src/index.css` | CSS nền tảng, responsive | 72 |
| `src/glass-update.css` | Hiệu ứng kính mờ, vùng cuộn giờ | 35 |
| `vite.config.ts` | Cấu hình Vite | 7 |
| `index.html` | Vỏ HTML | 9 |
| `tests/weather-client.test.mjs` | Test tầng API | 7 |
| `tests/hourly-timeline.test.mjs` | Test chuỗi giờ | 6 |

## app.py

| Mã | Dòng | Giải thích |
|---|---:|---|
| `PY-001` | 10 | Cho phép chú thích kiểu tham chiếu lớp khai báo sau. |
| `PY-002` | 14 | Đọc tham số dòng lệnh: `--port`, `--no-open`, `--verbose`. |
| `PY-003` | 16 | Nhận diện lỗi "cổng đang bận". |
| `PY-004` | 18 | Đoán Content-Type cho file lạ. |
| `PY-005` | 20 | Giữ cổng độc quyền trên Windows, tránh trùng cổng. |
| `PY-006` | 22 | Kiểm tra phiên bản Python, in lỗi, trả mã thoát. |
| `PY-007` | 24 | Mở trình duyệt ở luồng phụ để không chặn server. |
| `PY-008` | 26 | Gọi trình duyệt mặc định của hệ điều hành. |
| `PY-009` | 28 | Đặt tên cho các mã HTTP (200, 404, 405...). |
| `PY-010` | 30 | Handler xử lý request, ThreadingHTTPServer phục vụ song song. |
| `PY-011` | 32 | `Path` xử lý đường dẫn có dấu; `PurePosixPath` đọc path trong URL. |
| `PY-012` | 34 | Tách path khỏi query, giải mã `%xx` trong URL. |
| `PY-013` | 39 | Lấy thư mục thật chứa `app.py`, không phụ thuộc terminal đang đứng đâu. |
| `PY-014` | 41 | Chỉ phục vụ file trong `dist/`, không lộ code hay file khác. |
| `PY-015` | 43 | Chỉ nghe trên máy local, không mở ra mạng LAN. |
| `PY-016` | 45 | Giữ cổng 5173 để bookmark cũ vẫn dùng được. |
| `PY-017` | 47 | Cổng bận thì thử thêm 10 cổng kế tiếp. |
| `PY-018` | 50 | Khai báo MIME rõ cho JS/CSS/font, tránh Windows đoán sai. |
| `PY-019` | 70 | Lớp gửi file tĩnh cho trình duyệt, không gọi API thay người dùng. |
| `PY-020` | 72 | Chú thích kiểu cho thuộc tính `server` để IDE gợi ý đúng. |
| `PY-021` | 75 | Tên server trong HTTP header. |
| `PY-022` | 78 | Đặt timeout 15 giây cho mỗi kết nối. |
| `PY-023` | 83 | Thêm header chung cho mọi phản hồi. |
| `PY-024` | 85 | Không cache — build lại là trình duyệt thấy file mới. |
| `PY-025` | 87 | Bắt trình duyệt dùng đúng Content-Type. |
| `PY-026` | 91 | GET để tải file. |
| `PY-027` | 95 | HEAD chỉ trả header, không trả body. |
| `PY-028` | 99 | Chỉ cho đọc; phương thức ghi trả 405. |
| `PY-029` | 106 | Gán chung một hàm cho mọi phương thức không hỗ trợ. |
| `PY-030` | 109 | Đổi URL thành đường dẫn file trong `dist/`. |
| `PY-031` | 112 | Bỏ query (`?v=1`) khỏi tên file; báo lỗi nếu UTF-8 hỏng. |
| `PY-032` | 114 | Chặn ký tự NUL và dấu `\` kiểu Windows. |
| `PY-033` | 118 | Chặn `..` để không đọc file ngoài `dist/`. |
| `PY-034` | 122 | Ghép URL với thư mục giao diện, resolve luôn symlink. |
| `PY-035` | 124 | Kiểm tra lại sau resolve — chặn symlink trỏ ra ngoài. |
| `PY-036` | 128 | URL thư mục (`/`) thì dùng `index.html`. |
| `PY-037` | 131 | `index.html` cũng phải nằm trong `dist/`. |
| `PY-038` | 135 | Chỉ nhận file thật, còn lại trả 404. |
| `PY-039` | 140 | URL hỏng chỉ là lỗi request, không làm sập server. |
| `PY-040` | 145 | Hàm chung cho GET và HEAD. |
| `PY-041` | 148 | Nếu đã trả lỗi rồi thì dừng. |
| `PY-042` | 152 | Đọc bytes để giữ nguyên font/ảnh/nhị phân. |
| `PY-043` | 155 | File vừa bị xóa thì trả 404. |
| `PY-044` | 158 | Ưu tiên bảng MIME riêng, sau đó đến thư viện Python. |
| `PY-045` | 162 | Trả 200 kèm Content-Length (số byte). |
| `PY-046` | 167 | HEAD có cùng header nhưng không gửi body. |
| `PY-047` | 172 | Người dùng đóng tab — bỏ qua, không làm server chết. |
| `PY-048` | 175 | Mặc định không log mỗi request; `--verbose` mới in. |
| `PY-049` | 181 | ThreadingHTTPServer cho tải nhiều file cùng lúc. |
| `PY-050` | 183 | Ctrl+C là thoát được, không bị luồng giữ lại. |
| `PY-051` | 186 | Windows không bật SO_REUSEADDR vì ý nghĩa khác Unix. |
| `PY-052` | 191 | Gắn handler với thư mục giao diện, địa chỉ cố định 127.0.0.1. |
| `PY-053` | 197 | Windows đặt cờ độc quyền trước khi bind. |
| `PY-054` | 205 | Hàm kiểm tra `--port` hợp lệ. |
| `PY-055` | 211 | Chừa 10 cổng phía sau cho cơ chế dự phòng. |
| `PY-056` | 217 | Bind thật để biết chắc cổng dùng được. |
| `PY-057` | 219 | Thiếu `dist/index.html` thì báo rõ cách sửa. |
| `PY-058` | 225 | Kiểm tra cổng cả khi gọi từ Python, không chỉ qua CLI. |
| `PY-059` | 229 | `range` không tính đầu mút nên phải `+1`. |
| `PY-060` | 234 | Nhận diện lỗi cổng bận của Windows và Unix. |
| `PY-061` | 238 | Thử hết mà vẫn bận thì báo để chọn `--port` khác. |
| `PY-062` | 243 | Mở trình duyệt chỉ là tiện ích, lỗi cũng không sao. |
| `PY-063` | 250 | Không mở được trình duyệt thì in URL để tự mở. |
| `PY-064` | 254 | Gói khởi chạy trong `main()` để import không tự bật server. |
| `PY-065` | 256 | Yêu cầu Python ≥ 3.10. |
| `PY-066` | 260 | CLI có `--help`. |
| `PY-067` | 268 | Lỗi thiếu file/cổng/quyền thì báo gọn, không in traceback. |
| `PY-068` | 273 | Dùng cổng đã bind thành công (có thể khác `--port`). |
| `PY-069` | 283 | Mở trình duyệt sau 0,4 giây, lúc server đã sẵn sàng. |
| `PY-070` | 288 | Vòng lặp phục vụ đến khi Ctrl+C. |
| `PY-071` | 293 | Dọn timer và socket khi thoát. |
| `PY-072` | 300 | Chỉ chạy `main()` khi gọi `python app.py`. |

## tests/test_app.py

| Mã | Dòng | Giải thích |
|---|---:|---|
| `TEST-PY-001` | 27 | Xin OS một cổng trống cho test. |
| `TEST-PY-002` | 37 | Gửi request thật, đọc hết phản hồi. |
| `TEST-PY-003` | 48 | Mỗi bài test có thư mục tạm riêng. |
| `TEST-PY-004` | 66 | Cổng 0 chỉ dùng trong test, không phải tùy chọn CLI. |
| `TEST-PY-005` | 72 | Dừng server trước khi xóa thư mục tạm. |
| `TEST-PY-006` | 80 | Trang chủ trả đúng UTF-8, có header chống cache. |
| `TEST-PY-007` | 90 | JS/CSS/font/manifest có MIME đúng. |
| `TEST-PY-008` | 104 | HEAD có Content-Length thật nhưng không có body. |
| `TEST-PY-009` | 111 | Query `?v=...` không bị coi là tên file. |
| `TEST-PY-010` | 117 | URL có tiếng Việt và khoảng trắng vẫn đọc đúng. |
| `TEST-PY-011` | 123 | File thiếu trả 404, không trả `index.html` giả. |
| `TEST-PY-012` | 128 | Không liệt kê file khi thư mục không có `index.html`. |
| `TEST-PY-013` | 134 | Phương thức ghi bị từ chối, báo chỉ hỗ trợ GET/HEAD. |
| `TEST-PY-014` | 144 | Chặn `..` cả dạng thường lẫn mã hóa. |
| `TEST-PY-015` | 152 | UTF-8 sai, NUL, dấu `\` đều trả 400. |
| `TEST-PY-016` | 158 | Symlink không lách được kiểm tra thư mục gốc. |
| `TEST-PY-017` | 168 | Riêng `index.html` là symlink cũng bị chặn. |
| `TEST-PY-018` | 178 | Nhiều request đồng thời không xung đột. |
| `TEST-PY-019` | 186 | Cổng bận thì tự chuyển sang cổng kế. |
| `TEST-PY-020` | 197 | Tham số CLI sai thì báo lỗi và thoát. |
| `TEST-PY-021` | 209 | Thiếu `dist/` thì báo hướng dẫn, không in traceback. |
| `TEST-PY-022` | 219 | Không có trình duyệt cũng không crash. |
| `TEST-PY-023` | 226 | Chạy CLI thật trong thư mục có dấu/khoảng trắng. |
| `TEST-PY-024` | 256 | Kiểm tra cả các URL font trong CSS. |
| `TEST-PY-025` | 266 | Trên POSIX, gửi SIGINT và xác nhận thoát sạch. |
| `TEST-PY-026` | 272 | Windows dùng terminate thay vì SIGINT. |
| `TEST-PY-027` | 282 | Cho chạy trực tiếp `python tests/test_app.py`. |

## src/main.tsx

| Mã | Dòng | Giải thích |
|---|---:|---|
| `MAIN-000` | 1 | Điểm khởi động, gắn React vào HTML. |
| `MAIN-001` | 2 | StrictMode phát hiện side-effect chưa dọn (dev chạy effect 2 lần). |
| `MAIN-002` | 4 | `createRoot` tạo chỗ để React quản lý giao diện. |
| `MAIN-003` | 6 | Import component màn hình chính. |
| `MAIN-004` | 8 | Nạp CSS nền tảng trước. |
| `MAIN-005` | 10 | Nạp `glass-update.css` sau để ghi đè — thứ tự có ý nghĩa. |
| `MAIN-006` | 13 | Tìm `#root` rồi render `WeatherApp`. |

## src/lib/weather.ts

| Mã | Dòng | Giải thích |
|---|---:|---|
| `DATA-000` | 1 | Nhóm kiểu dữ liệu và hàm thuần — không gọi API, không vẽ giao diện. |
| `DATA-001` | 2 | Kiểu `Place`; `aliases` là các tên gõ tắt khi tìm kiếm. |
| `DATA-002` | 4 | ID ổn định của địa điểm. |
| `DATA-003` | 6 | Tên hiển thị. |
| `DATA-004` | 8 | Vĩ độ. |
| `DATA-005` | 10 | Kinh độ. |
| `DATA-006` | 12 | Vùng/tỉnh. |
| `DATA-007` | 14 | Các cách gọi khác (không dấu). |
| `DATA-008` | 17 | 18 địa điểm mẫu — toạ độ thật, không phải thời tiết giả. |
| `DATA-009` | 152 | Kiểu dữ liệu hiện tại; `null` nghĩa là thiếu, không phải 0. |
| `DATA-010` | 154 | Chuỗi ISO giờ địa phương. |
| `DATA-011` | 156 | Nhiệt độ 2 m, °C. |
| `DATA-012` | 158 | Độ ẩm tương đối, %. |
| `DATA-013` | 160 | Nhiệt độ cảm nhận, °C. |
| `DATA-014` | 162 | 1 = ban ngày, 0 = ban đêm. |
| `DATA-015` | 164 | Lượng mưa, mm (khác xác suất mưa). |
| `DATA-016` | 166 | Mã WMO. |
| `DATA-017` | 168 | Độ che phủ mây, %. |
| `DATA-018` | 170 | Áp suất bề mặt, hPa. |
| `DATA-019` | 172 | Tốc độ gió 10 m, km/h. |
| `DATA-020` | 174 | Hướng gió thổi từ, độ (0/360 = Bắc). |
| `DATA-021` | 176 | Gió giật, km/h. |
| `DATA-022` | 179 | Nhóm dự báo từng giờ — mọi mảng dùng chung chỉ số `i`. |
| `DATA-023` | 181 | Chuỗi ISO giờ. |
| `DATA-024` | 183 | Nhiệt độ °C. |
| `DATA-025` | 185 | Độ ẩm %. |
| `DATA-026` | 187 | Xác suất mưa %. |
| `DATA-027` | 189 | Lượng mưa mm. |
| `DATA-028` | 191 | Mã WMO. |
| `DATA-029` | 193 | Tầm nhìn, m. |
| `DATA-030` | 195 | Gió km/h. |
| `DATA-031` | 197 | Chỉ số UV. |
| `DATA-032` | 199 | 1 = ngày, 0 = đêm. |
| `DATA-033` | 202 | Nhóm dự báo theo ngày. |
| `DATA-034` | 204 | Chuỗi ISO ngày. |
| `DATA-035` | 206 | Mã WMO. |
| `DATA-036` | 208 | Nhiệt độ cao nhất. |
| `DATA-037` | 210 | Nhiệt độ thấp nhất. |
| `DATA-038` | 212 | Giờ mặt trời mọc. |
| `DATA-039` | 214 | Giờ mặt trời lặn. |
| `DATA-040` | 216 | UV cao nhất. |
| `DATA-041` | 218 | Tổng mưa ngày. |
| `DATA-042` | 220 | Xác suất mưa cao nhất. |
| `DATA-043` | 222 | Gió mạnh nhất. |
| `DATA-044` | 225 | Gói dữ liệu ứng dụng dùng. |
| `DATA-045` | 230 | Múi giờ, yêu cầu `Asia/Ho_Chi_Minh`. |
| `DATA-046` | 232 | Vĩ độ. |
| `DATA-047` | 234 | Kinh độ. |
| `DATA-048` | 236 | Thời điểm nhận dữ liệu (khác `current.time`). |
| `DATA-049` | 239 | Bản rút gọn cho thẻ thành phố. |
| `DATA-050` | 241 | ID địa điểm. |
| `DATA-051` | 243 | Nhiệt độ hoặc null. |
| `DATA-052` | 245 | Mã WMO hoặc null. |
| `DATA-053` | 247 | Cờ ngày/đêm dạng boolean. |
| `DATA-054` | 250 | Union các nhóm thời tiết để chọn icon/màu. |
| `DATA-055` | 261 | Bảng mã WMO → mô tả tiếng Việt + nhóm icon. |
| `DATA-079` | 266 | Kiểm tra null trước, tránh gán nhầm thành "trời quang". |
| `DATA-056` | 290 | Chuẩn hóa tiếng Việt: bỏ dấu, đổi `đ` → `d`. |
| `DATA-080` | 293 | NFD tách chữ và dấu, rồi regex mới xóa được dấu. |
| `DATA-057` | 300 | Đổi °C sang °F, giữ nguyên null. |
| `DATA-058` | 303 | Format nhiệt độ có ký hiệu `°`; thiếu thì hiện `—`. |
| `DATA-059` | 306 | Format số theo `vi-VN`, không đổi null thành 0. |
| `DATA-060` | 313 | "Hôm nay"/"Ngày mai", các ngày sau là thứ. |
| `DATA-061` | 324 | Lấy ngày/tháng từ ISO, giữ đúng ngày GMT+7. |
| `DATA-062` | 327 | Lấy `HH:mm`; thiếu thì trả `—`. |
| `DATA-063` | 329 | Chia 8 hướng gió, mỗi hướng 45°. |
| `DATA-064` | 343 | Kiểm tra dữ liệu từ storage/tìm kiếm; hộp toạ độ chỉ là vùng rộng, không phải biên giới. |
| `DATA-065` | 359 | Chuẩn hóa một mốc giờ cho giao diện. |
| `DATA-066` | 361 | Khóa ổn định của giờ — React dùng để nhận diện phần tử. |
| `DATA-067` | 363 | Chuỗi ISO giờ. |
| `DATA-068` | 365 | `true` chỉ cho mốc đầu tiên của hôm nay. |
| `DATA-069` | 367 | Nhiệt độ hoặc null. |
| `DATA-070` | 369 | Mã WMO hoặc null. |
| `DATA-071` | 371 | Cờ ngày/đêm. |
| `DATA-072` | 373 | Xác suất mưa %. |
| `DATA-073` | 375 | Gió km/h. |
| `DATA-074` | 377 | Độ ẩm %. |
| `DATA-075` | 382 | Tạo danh sách giờ: Bây giờ → giờ tròn kế → các giờ sau. |
| `DATA-076` | 393 | Tìm giờ chứa `current.time`. |
| `DATA-081` | 397 | Không tìm thấy thì trả danh sách rỗng. |
| `DATA-077` | 399 | Hôm nay: tối đa 24 mốc; ngày khác: mọi giờ cùng ngày. |
| `DATA-078` | 408 | Mốc đầu dùng `current`, các mốc sau dùng `hourly`. |
| `DATA-082` | 411 | Khóa vẫn là giờ gốc; nhãn có thể là phút hiện tại. |
| `DATA-083` | 413 | 23:45 → "Bây giờ", mốc sau là 00:00 ngày mai. |
| `DATA-084` | 424 | Mốc "Bây giờ" lấy xác suất mưa từ giờ tương ứng. |

## src/lib/weather-client.ts

| Mã | Dòng | Giải thích |
|---|---:|---|
| `API-000` | 1 | Tầng gọi API: dựng URL, cache, gộp request, chuyển lỗi thành thông báo. |
| `API-001` | 2 | Chỉ import kiểu — không tạo mã JS khi build. |
| `API-002` | 5 | Cache dự báo 15 phút. |
| `API-003` | 7 | Làm mới thủ công vẫn dùng cache nếu chưa quá 30 giây. |
| `API-004` | 9 | Tiền tố khóa localStorage, tránh trùng với cài đặt khác. |
| `API-005` | 11 | Cache kiểu `{ value, time }`, dùng generic `T`. |
| `API-006` | 13 | Cache RAM trong tab, tra theo URL. |
| `API-007` | 15 | Gộp request đang chạy — cùng URL thì chờ chung. |
| `API-008` | 17 | Lưu thời điểm được gọi lại sau HTTP 429, theo hostname. |
| `API-009` | 20 | Đọc JSON từ localStorage, lỗi thì trả `undefined`. |
| `API-010` | 31 | Ghi JSON; lỗi thì bỏ qua, cache RAM vẫn dùng được. |
| `API-032` | 40 | Lỗi có `status` để phân biệt HTTP với mạng. |
| `API-011` | 48 | Tính số giây phải chờ, tạo thông báo 429 tiếng Việt. |
| `API-012` | 53 | `Retry-After` có thể là số giây hoặc ngày HTTP. |
| `API-013` | 64 | Hàm gọi JSON chung: cache → kiểm tra limit → gộp → fetch → validate → lưu. |
| `API-014` | 71 | Ưu tiên cache RAM, sau đó localStorage. |
| `API-033` | 75 | Chỉ dùng cache khi còn hạn; làm mới thủ công dùng mốc 30 giây. |
| `API-015` | 85 | Tách hostname để áp limit cho mọi địa điểm cùng nguồn. |
| `API-016` | 87 | Gộp limit RAM + localStorage, reload trang không vượt được. |
| `API-034` | 92 | Đang chờ thì báo lỗi ngay, không gửi request. |
| `API-017` | 95 | URL đang tải thì dùng lại Promise. |
| `API-035` | 97 | Trả cùng Promise cho các lời gọi đồng thời. |
| `API-018` | 100 | IIFE async tạo tác vụ, chạy ngay và trả Promise. |
| `API-019` | 102 | `AbortController` cho request thật. |
| `API-020` | 104 | Hủy fetch sau 18 giây. |
| `API-021` | 109 | Gửi GET từ trình duyệt; `credentials: omit` — không gửi cookie. |
| `API-036` | 116 | 429: ghi hạn chờ theo nguồn rồi dừng. |
| `API-022` | 118 | Đọc `Retry-After`, chuyển thành thời điểm được thử lại. |
| `API-037` | 124 | Các HTTP lỗi khác không phải dữ liệu hợp lệ. |
| `API-023` | 130 | Parse JSON; ép kiểu chỉ để TypeScript yên tâm, vẫn cần validate. |
| `API-038` | 132 | Chặn JSON thiếu trường chính trước khi cache. |
| `API-024` | 137 | Ghi `fetchedAt` đúng một lần; đọc cache không làm mới dữ liệu. |
| `API-039` | 139 | Cache RAM tối đa ~60 URL, bỏ cái chèn sớm nhất (không phải LRU). |
| `API-040` | 150 | `finally` luôn dọn timer, dù thành công hay thất bại. |
| `API-041` | 154 | Đăng ký tác vụ để lời gọi sau dùng chung. |
| `API-042` | 159 | Xóa dấu "đang tải" khi xong. |
| `API-025` | 164 | Dựng URL dự báo; cố định `Asia/Ho_Chi_Minh`, 7 ngày. |
| `API-043` | 180 | Yêu cầu API trả giờ địa phương — không phải giờ laptop. |
| `API-044` | 183 | Nhóm giá trị hiện tại. |
| `API-045` | 186 | Nhóm mảng từng giờ. |
| `API-046` | 189 | Nhóm tổng hợp theo ngày. |
| `API-026` | 195 | Lấy dự báo một địa điểm, kiểm tra 3 nhóm chính, thêm `fetchedAt`. |
| `API-027` | 210 | JSON tối thiểu cần đọc khi lấy tóm tắt nhiều thành phố. |
| `API-028` | 218 | Gộp toạ độ vào 1 request; thứ tự phản hồi khớp thứ tự `places`. |
| `API-047` | 224 | Nối vĩ độ bằng dấu phẩy; kinh độ bên dưới phải cùng thứ tự. |
| `API-029` | 250 | Kiểu kết quả Geocoding trước khi đổi sang `Place`. |
| `API-030` | 259 | Tìm địa danh VN qua Open-Meteo Geocoding, cache 1 giờ. |
| `API-031` | 261 | Trim, giới hạn 80 ký tự. |
| `API-048` | 263 | Từ khóa quá ngắn thì không gọi. |
| `API-049` | 269 | Giới hạn tìm trong VN ngay trong API. |
| `API-050` | 278 | Kiểm tra lại `country_code` trên phản hồi. |

## src/components/weather-app.tsx

| Mã | Dòng | Giải thích |
|---|---:|---|
| `APP-000` | 1 | Màn hình chính: state, vòng đời, thao tác, bố cục. |
| `APP-001` | 4 | Import hook React. |
| `APP-002` | 6 | Import hook React (tiếp). |
| `APP-003` | 8 | Bộ icon SVG cho nút và chỉ số. |
| `APP-004` | 52 | Kiểu/hàm dùng chung với component giờ và test. |
| `APP-005` | 66 | Tiếp tục kiểu/hàm dùng chung. |
| `APP-006` | 68 | Tầng dữ liệu gọi Open-Meteo trực tiếp từ trình duyệt. |
| `APP-007` | 75 | Tách biểu đồ và thẻ giờ ra component riêng. |
| `APP-008` | 78 | Chỉ cho chọn °C hoặc °F; dữ liệu gốc luôn °C. |
| `APP-009` | 80 | Bảng ánh xạ nhóm thời tiết → icon. |
| `APP-010` | 92 | Khóa localStorage cho cài đặt và yêu thích. |
| `APP-011` | 97 | Đọc JSON, lỗi thì trả `null`. |
| `APP-012` | 106 | Ghi JSON, bắt lỗi storage đầy/bị chặn. |
| `APP-013` | 114 | Chọn icon từ WMO, có mặc định khi chưa có dữ liệu. |
| `APP-014` | 137 | Logo icon + chữ; `small` cho màn hình hẹp. |
| `APP-015` | 151 | Minh họa mây/nắng/mưa bằng CSS. |
| `APP-016` | 191 | Khung chỉ số dùng chung (UV, gió, độ ẩm...). |
| `APP-017` | 221 | Component cha phối hợp dữ liệu và thao tác. |
| `APP-018` | 223 | Địa điểm đang chọn, mặc định Hồ Chí Minh. |
| `APP-019` | 225 | Gắn dự báo với `placeId` để không hiện nhầm khi đổi nơi. |
| `APP-020` | 230 | Cờ đang tải. |
| `APP-021` | 232 | Lỗi tải dự báo chính. |
| `APP-022` | 234 | Cờ báo lần cập nhật gần nhất thất bại. |
| `APP-023` | 236 | Chờ khôi phục cài đặt xong mới tải/ghi. |
| `APP-024` | 238 | Đơn vị °C/°F; đổi không cần gọi lại API. |
| `APP-025` | 240 | Chủ đề sáng/tối, gắn vào `data-theme`. |
| `APP-026` | 242 | Danh sách địa điểm đã lưu trên máy này. |
| `APP-027` | 244 | Bộ đếm làm mới thủ công. |
| `APP-028` | 246 | Dữ liệu 4 thẻ