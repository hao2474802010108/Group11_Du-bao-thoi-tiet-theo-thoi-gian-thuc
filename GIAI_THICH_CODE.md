# Mây Việt — Tra cứu chú thích của bản Python

Bắt đầu với **app.py** nếu bạn muốn học phần Python. Giao diện hiện tại tiếp tục ở src và bản đã build nằm trong dist. Python không gọi Open-Meteo thay trình duyệt.

Bảng trỏ đến **dòng chú thích**; dòng lệnh/khối được giải thích nằm ngay sau đó. Trong VS Code: **Ctrl+P** nhập tên file, **Ctrl+G** nhập số dòng; hoặc tìm mã như `[PY-001]` bằng **Ctrl+Shift+F**. Có thể nhập `app.py:20` trực tiếp trong Ctrl+P.

Số dòng là vị trí tại bản giao này; sửa file có thể làm thay đổi số dòng nhưng vẫn tìm theo mã chú thích được. README giải thích luồng dữ liệu và những file JSON không cho phép ghi comment.

Có **530 chú thích có mã** trong 13 file. Trong đó **72 chú thích** giải thích phần app.py; ngoài ra còn có ghi chú ngắn và docstring không gắn mã.

## Các file

| File                                                                     | Vai trò                                | Số chú thích |
| ------------------------------------------------------------------------ | -------------------------------------- | -----------: |
| [app.py](app.py)                                                         | Khởi chạy và máy chủ Python            |           72 |
| [tests/test_app.py](tests/test_app.py)                                   | 18 bài kiểm tra máy chủ Python         |           27 |
| [src/main.tsx](src/main.tsx)                                             | Điểm vào giao diện React               |            7 |
| [src/lib/weather.ts](src/lib/weather.ts)                                 | Kiểu dữ liệu, định dạng và từng giờ    |           85 |
| [src/lib/weather-client.ts](src/lib/weather-client.ts)                   | API, cache và xử lý lỗi                |           51 |
| [src/components/weather-app.tsx](src/components/weather-app.tsx)         | Trạng thái, vòng đời và màn hình chính |          107 |
| [src/components/hourly-forecast.tsx](src/components/hourly-forecast.tsx) | Biểu đồ và tương tác từng giờ          |           45 |
| [src/index.css](src/index.css)                                           | CSS nền tảng và responsive             |           72 |
| [src/glass-update.css](src/glass-update.css)                             | Kính mờ và vùng cuộn từng giờ          |           35 |
| [vite.config.ts](vite.config.ts)                                         | Cấu hình công cụ lập trình frontend    |            7 |
| [index.html](index.html)                                                 | Vỏ HTML của mã nguồn giao diện         |            9 |
| [tests/weather-client.test.mjs](tests/weather-client.test.mjs)           | Kiểm tra tầng dữ liệu API              |            7 |
| [tests/hourly-timeline.test.mjs](tests/hourly-timeline.test.mjs)         | Kiểm tra chuỗi giờ                     |            6 |

## app.py

Khởi chạy và máy chủ Python.

| Mã       | Dòng | Tác dụng của phần code ngay sau đó                                                                   |
| -------- | ---: | ---------------------------------------------------------------------------------------------------- |
| `PY-001` |   10 | Để chú thích kiểu được xử lý muộn, thuận tiện khi hai lớp tham chiếu nhau.                           |
| `PY-002` |   14 | argparse đọc các tùy chọn như --port, --no-open và --verbose từ terminal.                            |
| `PY-003` |   16 | errno giúp nhận biết lỗi cổng đang được chương trình khác sử dụng.                                   |
| `PY-004` |   18 | mimetypes tìm Content-Type cho những loại tài nguyên chưa có trong bảng riêng.                       |
| `PY-005` |   20 | socket cung cấp tùy chọn giữ cổng độc quyền trên Windows, tránh hai ứng dụng dùng nhầm cùng cổng.    |
| `PY-006` |   22 | sys đọc phiên bản Python, in lỗi ra stderr và trả mã kết thúc chương trình.                          |
| `PY-007` |   24 | Timer mở trình duyệt ở luồng phụ để máy chủ không bị chặn khi mở ứng dụng.                           |
| `PY-008` |   26 | webbrowser gọi trình duyệt mặc định của Windows, macOS hoặc Linux.                                   |
| `PY-009` |   28 | HTTPStatus đặt tên rõ ràng cho mã HTTP như 200, 400, 403, 404 và 405.                                |
| `PY-010` |   30 | Handler xử lý từng yêu cầu; ThreadingHTTPServer phục vụ nhiều file đồng thời.                        |
| `PY-011` |   32 | Path xử lý đường dẫn có dấu/khoảng trắng; PurePosixPath đọc đường dẫn trong URL.                     |
| `PY-012` |   34 | Tách phần đường dẫn khỏi query và giải mã các ký tự phần trăm trong URL.                             |
| `PY-013` |   39 | Lấy vị trí thật của app.py, không phụ thuộc thư mục đang đứng trong terminal.                        |
| `PY-014` |   41 | Chỉ phục vụ nội dung trong dist; không công khai README, code hay file khác của laptop.              |
| `PY-015` |   43 | Chỉ lắng nghe trên máy hiện tại; không mở máy chủ ra mạng LAN hoặc Internet.                         |
| `PY-016` |   45 | Giữ cổng cũ để yêu thích/cài đặt tại localhost:5173 tiếp tục được trình duyệt nhận.                  |
| `PY-017` |   47 | Nếu cổng bận, thử thêm 10 cổng tiếp theo thay vì đóng ứng dụng ngay.                                 |
| `PY-018` |   50 | Khai báo MIME rõ cho JS/CSS/font để tránh Windows nhận sai kiểu JavaScript.                          |
| `PY-019` |   70 | Lớp này gửi HTML/JS/CSS/font cho trình duyệt; không gọi API dự báo thay người dùng.                  |
| `PY-020` |   72 | Chú thích kiểu cho thuộc tính server có sẵn của lớp cha, giúp IDE gợi ý chính xác.                   |
| `PY-021` |   75 | Tên máy chủ dùng trong HTTP header; không thay đổi dữ liệu thời tiết.                                |
| `PY-022` |   78 | Mỗi kết nối có thời gian chờ để kết nối bỏ dở không giữ luồng quá lâu.                               |
| `PY-023` |   83 | Header chung cho cả phản hồi thành công và lỗi; gọi lớp cha để kết thúc header.                      |
| `PY-024` |   85 | Không cache file giao diện cũ: sau khi build lại, tải trang sẽ dùng file mới.                        |
| `PY-025` |   87 | Yêu cầu trình duyệt dùng đúng Content-Type, không tự đoán kiểu nội dung.                             |
| `PY-026` |   91 | GET lấy nội dung file, dùng khi trình duyệt tải trang và các tài nguyên.                             |
| `PY-027` |   95 | HEAD chỉ trả header, không gửi nội dung; hữu ích khi kiểm tra tài nguyên.                            |
| `PY-028` |   99 | Máy chủ này chỉ đọc file; các phương thức ghi không có chức năng và trả 405.                         |
| `PY-029` |  106 | Dùng lại cùng một hàm cho những phương thức không hỗ trợ, tránh lặp code.                            |
| `PY-030` |  109 | Đổi URL thành file hợp lệ dưới dist; trả None nếu đã gửi phản hồi lỗi.                               |
| `PY-031` |  112 | Query như ?v=1 không thuộc tên file; strict từ chối mã UTF-8 sai.                                    |
| `PY-032` |  114 | Chặn ký tự NUL và dấu gạch chéo Windows để URL không bị hiểu thành đường dẫn khác.                   |
| `PY-033` |  118 | Không cho URL có .. đi ngược thư mục để đọc file bên ngoài dist.                                     |
| `PY-034` |  122 | Bỏ dấu / đầu URL rồi ghép với thư mục giao diện; resolve xử lý cả liên kết tượng trưng.              |
| `PY-035` |  124 | Kiểm tra lại sau resolve để chặn cả symlink/junction trỏ ra ngoài dist.                              |
| `PY-036` |  128 | URL thư mục như / dùng index.html; không hiển thị danh sách file.                                    |
| `PY-037` |  131 | index.html cũng phải ở trong dist, kể cả khi là symlink.                                             |
| `PY-038` |  135 | Chỉ chấp nhận file thật; thư mục không có index và URL lạ trả 404.                                   |
| `PY-039` |  140 | URL/đường dẫn hỏng là lỗi yêu cầu; không làm dừng toàn bộ máy chủ.                                   |
| `PY-040` |  145 | Hàm dùng chung cho GET/HEAD, giúp hai cách lấy file có header nhất quán.                             |
| `PY-041` |  148 | Nếu \_requested_file đã trả lỗi thì dừng, tránh gửi thêm một phản hồi nữa.                           |
| `PY-042` |  152 | Đọc bytes để giữ nguyên font/ảnh/JavaScript; không giải mã nhầm file nhị phân.                       |
| `PY-043` |  155 | File có thể vừa bị xóa hoặc không đọc được sau bước kiểm tra; trả 404.                               |
| `PY-044` |  158 | Ưu tiên bảng MIME riêng, rồi thư viện Python; loại lạ dùng octet-stream.                             |
| `PY-045` |  162 | 200 nghĩa là tải thành công; Content-Length là số byte, không phải số ký tự.                         |
| `PY-046` |  167 | HEAD có cùng kích thước/header với GET nhưng không gửi thân phản hồi.                                |
| `PY-047` |  172 | Người dùng đóng tab hoặc hủy tải: bỏ qua kết nối đó, giữ ứng dụng hoạt động.                         |
| `PY-048` |  175 | Mặc định không in mỗi request; --verbose bật log để xem file nào lỗi khi gỡ rối.                     |
| `PY-049` |  181 | ThreadingHTTPServer cho phép trình duyệt tải JS, CSS và font đồng thời.                              |
| `PY-050` |  183 | Luồng phục vụ không ngăn chương trình thoát sau khi người dùng bấm Ctrl+C.                           |
| `PY-051` |  186 | Trên Windows không bật SO_REUSEADDR vì ý nghĩa của nó khác Unix; cổng bận phải chuyển cổng.          |
| `PY-052` |  191 | Nối handler với thư mục giao diện; địa chỉ luôn cố định là HOST cục bộ.                              |
| `PY-053` |  197 | Windows đặt cờ độc quyền TRƯỚC bind; các hệ điều hành khác dùng cách bind của lớp cha.               |
| `PY-054` |  205 | argparse gọi hàm này để kiểm tra --port trước khi khởi tạo máy chủ.                                  |
| `PY-055` |  211 | Để lại 10 cổng phía sau cho cơ chế dự phòng; cổng TCP lớn nhất là 65535.                             |
| `PY-056` |  217 | Thử bind thật thay vì chỉ dò cổng, tránh khoảng trống giữa lúc dò và lúc mở server.                  |
| `PY-057` |  219 | Dừng sớm với hướng dẫn rõ nếu chỉ chép app.py mà thiếu giao diện đi kèm.                             |
| `PY-058` |  225 | Kiểm tra cả lời gọi trực tiếp từ Python, không chỉ tham số qua terminal.                             |
| `PY-059` |  229 | range dừng trước đầu mút nên +1 để thử cả cổng mặc định và 10 cổng tiếp theo.                        |
| `PY-060` |  234 | EADDRINUSE/10048 là cổng bận; Windows 10013 cũng có thể là cổng được giữ riêng/độc quyền.            |
| `PY-061` |  238 | Thử hết khoảng cổng vẫn bận thì báo lỗi để chọn --port khác; không ghi đè chương trình đang chạy.    |
| `PY-062` |  243 | Mở trình duyệt là tiện ích; nếu không mở tự động được, server vẫn chạy bình thường.                  |
| `PY-063` |  250 | Lỗi mở trình duyệt không phải lỗi API thời tiết; in URL để người dùng tự mở.                         |
| `PY-064` |  254 | Đóng gói thao tác khởi chạy trong main để import app trong test không tự bật server.                 |
| `PY-065` |  256 | Kiểm tra môi trường thực thi; các phiên bản Python mới hơn vẫn được chấp nhận.                       |
| `PY-066` |  260 | Giao diện dòng lệnh có --help để người dùng xem cách sử dụng mà không cần mở code.                   |
| `PY-067` |  268 | Lỗi thiếu giao diện, cổng hoặc quyền mở socket được báo ngắn gọn, không in traceback khó đọc.        |
| `PY-068` |  273 | Dùng cổng đã bind thành công; có thể khác --port khi cổng được yêu cầu đang bận.                     |
| `PY-069` |  283 | Socket đã sẵn sàng; mở trình duyệt sau 0,4 giây trong lúc vòng phục vụ bắt đầu.                      |
| `PY-070` |  288 | Vòng lặp nhận yêu cầu cho đến Ctrl+C; khoảng poll ngắn giúp phản hồi dừng nhanh.                     |
| `PY-071` |  293 | Dọn timer và socket dù dừng bình thường hay có lỗi; không gọi shutdown từ chính luồng serve_forever. |
| `PY-072` |  300 | Chỉ chạy main khi gọi python app.py; SystemExit trả mã kết thúc cho terminal.                        |

## tests/test_app.py

18 bài kiểm tra máy chủ Python.

| Mã            | Dòng | Tác dụng của phần code ngay sau đó                                                                                      |
| ------------- | ---: | ----------------------------------------------------------------------------------------------------------------------- |
| `TEST-PY-001` |   27 | Xin hệ điều hành một cổng trống; make_server vẫn tự bind/thử lại để tránh cổng bị chiếm sau đó.                         |
| `TEST-PY-002` |   37 | Gửi một request thật và đọc hết phản hồi; always close để bài kiểm tra không giữ kết nối.                               |
| `TEST-PY-003` |   48 | Mỗi bài có thư mục tạm riêng; dữ liệu kiểm tra không được dùng làm thời tiết của app.                                   |
| `TEST-PY-004` |   66 | Cổng 0 chỉ dùng nội bộ test để hệ điều hành cấp cổng, không phải tùy chọn CLI của người dùng.                           |
| `TEST-PY-005` |   72 | Luôn dừng máy chủ trước khi xóa thư mục tạm; không để lại tiến trình/cổng sau test.                                     |
| `TEST-PY-006` |   80 | Trang chủ phải tải đúng bytes UTF-8 và có header ngăn cache giao diện cũ.                                               |
| `TEST-PY-007` |   90 | JS/CSS/font/manifest phải có MIME đúng, kể cả trên Windows có registry MIME khác.                                       |
| `TEST-PY-008` |  104 | HEAD phải có kích thước thật nhưng không gửi body.                                                                      |
| `TEST-PY-009` |  111 | Query cập nhật cache không được trở thành một phần tên file.                                                            |
| `TEST-PY-010` |  117 | URL có tiếng Việt và khoảng trắng mã hóa vẫn đọc đúng file.                                                             |
| `TEST-PY-011` |  123 | File thiếu trả 404, không gửi index.html giả thành JavaScript.                                                          |
| `TEST-PY-012` |  128 | Không mở danh sách file khi yêu cầu thư mục không có index.html.                                                        |
| `TEST-PY-013` |  134 | Phương thức ghi bị từ chối và phản hồi nêu rõ chỉ hỗ trợ GET/HEAD.                                                      |
| `TEST-PY-014` |  144 | Chặn cả .. bình thường và dạng mã hóa, không làm lộ file nằm ngoài dist.                                                |
| `TEST-PY-015` |  152 | UTF-8 sai, NUL và đường dẫn dùng gạch chéo Windows đều trả 400.                                                         |
| `TEST-PY-016` |  158 | Symlink không được dùng để đi vòng qua kiểm tra thư mục gốc; Windows có thể cần quyền tạo symlink.                      |
| `TEST-PY-017` |  168 | Kiểm tra riêng index.html là symlink, không chỉ file được yêu cầu trực tiếp.                                            |
| `TEST-PY-018` |  178 | Nhiều tài nguyên tải đồng thời đều nhận đúng dữ liệu, không xung đột trạng thái giữa các request.                       |
| `TEST-PY-019` |  186 | Chiếm một cổng thật rồi kiểm tra ứng dụng tự chuyển sang cổng lân cận, vẫn chỉ bind localhost.                          |
| `TEST-PY-020` |  197 | Đầu vào CLI sai phải báo lỗi và thoát, không bắt đầu server hay mở trình duyệt.                                         |
| `TEST-PY-021` |  209 | Nếu chỉ chép app.py thiếu dist, hiển thị hướng dẫn giải nén thay vì lỗi traceback.                                      |
| `TEST-PY-022` |  219 | Không có trình duyệt mặc định không làm crash ứng dụng; người dùng vẫn nhận URL để mở tay.                              |
| `TEST-PY-023` |  226 | Chạy CLI thật trong thư mục có dấu/khoảng trắng, từ CWD khác; tải bản dist thật và mọi tài nguyên chính.                |
| `TEST-PY-024` |  256 | Font nằm trong CSS nên kiểm tra thêm mọi URL font cục bộ.                                                               |
| `TEST-PY-025` |  266 | Trên POSIX, gửi SIGINT tương đương Ctrl+C và xác nhận dọn dẹp/thoát bình thường.                                        |
| `TEST-PY-026` |  272 | Windows dùng terminate để dọn tiến trình test; tránh gửi Ctrl+C vào terminal của người dùng.                            |
| `TEST-PY-027` |  282 | Cho phép chạy trực tiếp python tests/test_app.py khi thư mục gốc có trong PYTHONPATH; ưu tiên lệnh discover ở đầu file. |

## src/main.tsx

Điểm vào giao diện React.

| Mã         | Dòng | Tác dụng của phần code ngay sau đó                                                                                                     |
| ---------- | ---: | -------------------------------------------------------------------------------------------------------------------------------------- |
| `MAIN-000` |    1 | ĐIỂM KHỞI ĐỘNG: gắn ứng dụng React vào HTML. Đọc README.md trước khi chạy.                                                             |
| `MAIN-001` |    2 | StrictMode giúp phát hiện tác dụng phụ chưa được dọn dẹp trong lúc phát triển; có thể chạy effect thêm một lượt ở chế độ dev.          |
| `MAIN-002` |    4 | createRoot tạo nơi React quản lý giao diện bên trong thẻ HTML #root.                                                                   |
| `MAIN-003` |    6 | Nạp component màn hình chính; đây là nơi phối hợp trạng thái và các phần giao diện.                                                    |
| `MAIN-004` |    8 | Nạp CSS nền tảng trước: màu sắc, bố cục, biểu tượng, responsive.                                                                       |
| `MAIN-005` |   10 | Nạp sau index.css để ghi đè giao diện kính mờ và bố cục từng giờ. Thứ tự này có ý nghĩa.                                               |
| `MAIN-006` |   13 | Tìm #root trong index.html rồi render WeatherApp. Dấu ! là cam kết kiểu TypeScript rằng phần tử tồn tại, không phải kiểm tra lúc chạy. |

## src/lib/weather.ts

Kiểu dữ liệu, định dạng và từng giờ.

| Mã         | Dòng | Tác dụng của phần code ngay sau đó                                                                                                         |
| ---------- | ---: | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `DATA-000` |    1 | KIỂU DỮ LIỆU VÀ HÀM THUẦN: không gọi API và không vẽ giao diện. Các hàm nhận dữ liệu, xử lý rồi trả kết quả.                               |
| `DATA-001` |    2 | Một địa điểm. Dấu ? là trường không bắt buộc; aliases chứa tên gõ thay thế như sai gon, hcm.                                               |
| `DATA-002` |    4 | Mã nhận diện ổn định của địa điểm.                                                                                                         |
| `DATA-003` |    6 | Tên hiển thị.                                                                                                                              |
| `DATA-004` |    8 | Vĩ độ (độ).                                                                                                                                |
| `DATA-005` |   10 | Kinh độ (độ).                                                                                                                              |
| `DATA-006` |   12 | Tên vùng hoặc tỉnh/thành để phân biệt kết quả.                                                                                             |
| `DATA-007` |   14 | Các cách gọi/tên viết tắt hỗ trợ tìm kiếm không dấu.                                                                                       |
| `DATA-008` |   17 | 18 địa điểm mẫu giúp tìm nhanh mà không cần chờ Geocoding. Đây là tọa độ, không phải số liệu thời tiết giả.                                |
| `DATA-009` |  152 | Dữ liệu hiện tại từ API. number \| null cho phép biểu diễn giá trị bị thiếu mà không biến thành số 0.                                      |
| `DATA-010` |  154 | Chuỗi thời gian ISO địa phương; mảng time là trục đối chiếu cho các mảng số liệu.                                                          |
| `DATA-011` |  156 | Nhiệt độ không khí ở cao độ 2 m, °C.                                                                                                       |
| `DATA-012` |  158 | Độ ẩm tương đối ở 2 m, %. Không phải khả năng mưa.                                                                                         |
| `DATA-013` |  160 | Nhiệt độ cảm nhận, °C.                                                                                                                     |
| `DATA-014` |  162 | 1 là ban ngày, 0 là ban đêm; dùng để chọn mặt trời/mặt trăng.                                                                              |
| `DATA-015` |  164 | Lượng giáng thủy, mm; khác với xác suất có mưa.                                                                                            |
| `DATA-016` |  166 | Mã trạng thái thời tiết WMO; weatherInfo đổi sang nhãn và icon.                                                                            |
| `DATA-017` |  168 | Tỉ lệ mây che phủ, %.                                                                                                                      |
| `DATA-018` |  170 | Áp suất tại bề mặt, hPa.                                                                                                                   |
| `DATA-019` |  172 | Tốc độ gió ở độ cao 10 m, mặc định km/h.                                                                                                   |
| `DATA-020` |  174 | Hướng gió THỔI TỪ, tính bằng độ; 0/360 là Bắc.                                                                                             |
| `DATA-021` |  176 | Tốc độ gió giật ở 10 m, km/h.                                                                                                              |
| `DATA-022` |  179 | Dự báo từng giờ: mọi mảng dùng chung chỉ số i với time[i]. Ví dụ temperature_2m[i] thuộc giờ time[i].                                      |
| `DATA-023` |  181 | Chuỗi thời gian ISO địa phương; mảng time là trục đối chiếu cho các mảng số liệu.                                                          |
| `DATA-024` |  183 | Nhiệt độ không khí ở cao độ 2 m, °C.                                                                                                       |
| `DATA-025` |  185 | Độ ẩm tương đối ở 2 m, %. Không phải khả năng mưa.                                                                                         |
| `DATA-026` |  187 | Khả năng có giáng thủy theo giờ, %. Không diễn giải là lượng mưa.                                                                          |
| `DATA-027` |  189 | Lượng giáng thủy, mm; khác với xác suất có mưa.                                                                                            |
| `DATA-028` |  191 | Mã trạng thái thời tiết WMO; weatherInfo đổi sang nhãn và icon.                                                                            |
| `DATA-029` |  193 | Tầm nhìn, m; giao diện đổi sang km khi cần.                                                                                                |
| `DATA-030` |  195 | Tốc độ gió ở độ cao 10 m, mặc định km/h.                                                                                                   |
| `DATA-031` |  197 | Chỉ số UV theo giờ.                                                                                                                        |
| `DATA-032` |  199 | 1 là ban ngày, 0 là ban đêm; dùng để chọn mặt trời/mặt trăng.                                                                              |
| `DATA-033` |  202 | Tổng hợp từng ngày: mọi mảng dùng chung chỉ số ngày, dùng để vẽ dự báo 7 ngày.                                                             |
| `DATA-034` |  204 | Chuỗi thời gian ISO địa phương; mảng time là trục đối chiếu cho các mảng số liệu.                                                          |
| `DATA-035` |  206 | Mã trạng thái thời tiết WMO; weatherInfo đổi sang nhãn và icon.                                                                            |
| `DATA-036` |  208 | Nhiệt độ cao nhất ngày, °C.                                                                                                                |
| `DATA-037` |  210 | Nhiệt độ thấp nhất ngày, °C.                                                                                                               |
| `DATA-038` |  212 | Giờ mặt trời mọc từng ngày, GMT+7.                                                                                                         |
| `DATA-039` |  214 | Giờ mặt trời lặn từng ngày, GMT+7.                                                                                                         |
| `DATA-040` |  216 | Chỉ số UV lớn nhất ngày.                                                                                                                   |
| `DATA-041` |  218 | Tổng giáng thủy trong ngày, mm.                                                                                                            |
| `DATA-042` |  220 | Khả năng giáng thủy lớn nhất trong ngày, %.                                                                                                |
| `DATA-043` |  222 | Tốc độ gió lớn nhất ngày, km/h.                                                                                                            |
| `DATA-044` |  225 | Gói dữ liệu ứng dụng dùng: current + hourly + daily + tọa độ + thời điểm nhận fetchedAt.                                                   |
| `DATA-045` |  230 | Múi giờ phản hồi, yêu cầu là Asia/Ho_Chi_Minh.                                                                                             |
| `DATA-046` |  232 | Vĩ độ (độ).                                                                                                                                |
| `DATA-047` |  234 | Kinh độ (độ).                                                                                                                              |
| `DATA-048` |  236 | Thời điểm ứng dụng nhận gói dữ liệu; khác thời điểm dự báo current.time.                                                                   |
| `DATA-049` |  239 | Dữ liệu rút gọn cho thẻ thành phố, không cần toàn bộ dự báo 7 ngày.                                                                        |
| `DATA-050` |  241 | Mã nhận diện ổn định của địa điểm.                                                                                                         |
| `DATA-051` |  243 | Nhiệt độ °C hoặc null; chỉ đổi sang °F khi hiển thị.                                                                                       |
| `DATA-052` |  245 | Mã WMO hoặc null.                                                                                                                          |
| `DATA-053` |  247 | Cờ ban ngày sau khi đổi từ số 1/0 thành boolean.                                                                                           |
| `DATA-054` |  250 | Union type: chỉ cho phép các tên nhóm thời tiết đã định nghĩa, dùng để chọn icon và màu.                                                   |
| `DATA-055` |  261 | Ánh xạ mã WMO thành mô tả tiếng Việt và nhóm icon; phân biệt trời quang ban ngày với ban đêm.                                              |
| `DATA-079` |  266 | Kiểm tra null/undefined trước để không gán nhầm dữ liệu thiếu thành trời quang (mã 0).                                                     |
| `DATA-056` |  290 | Chuẩn hóa tiếng Việt: tách dấu Unicode, bỏ dấu, đổi đ thành d, viết thường và bỏ khoảng trắng ở hai đầu.                                   |
| `DATA-080` |  293 | NFD tách chữ và dấu; biểu thức Unicode ở dòng sau mới xóa được phần dấu.                                                                   |
| `DATA-057` |  300 | Đổi °C sang °F bằng C × 9/5 + 32; giữ null nếu thiếu số liệu.                                                                              |
| `DATA-058` |  303 | Định dạng nhiệt độ làm tròn kèm ký hiệu °; thiếu số liệu thì hiển thị dấu —.                                                               |
| `DATA-059` |  306 | Định dạng số theo vi-VN và giới hạn số chữ số lẻ; không biến null thành số 0.                                                              |
| `DATA-060` |  313 | Hôm nay/Ngày mai cho hai ngày đầu; các ngày sau định dạng thứ trong tuần theo giờ Việt Nam.                                                |
| `DATA-061` |  324 | Lấy ngày/tháng từ chuỗi ISO. Cắt chuỗi giữ đúng ngày GMT+7 do API trả về.                                                                  |
| `DATA-062` |  327 | Lấy phần HH:mm từ chuỗi ISO; ?. và \|\| giúp trả — khi chưa có chuỗi.                                                                      |
| `DATA-063` |  329 | Chia vòng tròn thành 8 hướng, làm tròn mỗi 45°. Kết quả mô tả hướng gió thổi từ.                                                           |
| `DATA-064` |  343 | Type guard kiểm tra dữ liệu đọc từ storage/tìm kiếm. Hộp tọa độ 7..24, 101..118 chỉ là vùng giới hạn rộng, không phải đường biên Việt Nam. |
| `DATA-065` |  359 | Chuẩn hóa một mốc cho giao diện: tách khóa ổn định key, thời gian thực, dấu Bây giờ và các chỉ số.                                         |
| `DATA-066` |  361 | Khóa của giờ gốc, giúp React nhận diện phần tử dù nhãn Bây giờ đổi.                                                                        |
| `DATA-067` |  363 | Chuỗi thời gian ISO địa phương; mảng time là trục đối chiếu cho các mảng số liệu.                                                          |
| `DATA-068` |  365 | true chỉ cho mốc đầu của hôm nay; các mốc tiếp theo là dự báo từng giờ.                                                                    |
| `DATA-069` |  367 | Nhiệt độ °C hoặc null; chỉ đổi sang °F khi hiển thị.                                                                                       |
| `DATA-070` |  369 | Mã WMO hoặc null.                                                                                                                          |
| `DATA-071` |  371 | Cờ ban ngày sau khi đổi từ số 1/0 thành boolean.                                                                                           |
| `DATA-072` |  373 | Xác suất giáng thủy của giờ tương ứng, %.                                                                                                  |
| `DATA-073` |  375 | Tốc độ gió, km/h.                                                                                                                          |
| `DATA-074` |  377 | Độ ẩm tương đối, %.                                                                                                                        |
| `DATA-075` |  382 | Tạo danh sách từng giờ cho component: Bây giờ → giờ tròn kế tiếp → các giờ sau; ngày khác có 00:00..23:00 nếu API cung cấp đủ.             |
| `DATA-076` |  393 | Tìm chỉ số giờ chứa thời điểm current bằng cách so sánh đến YYYY-MM-DDTHH. Không bỏ qua mốc 00:00 khi qua ngày.                            |
| `DATA-081` |  397 | Không tìm thấy giờ hiện tại trong dữ liệu thì trả danh sách rỗng, không tự bịa mốc dự báo.                                                 |
| `DATA-077` |  399 | Hôm nay: lấy tối đa 24 mốc liên tiếp từ giờ hiện tại. Ngày tương lai: lấy mọi giờ có cùng tiền tố ngày.                                    |
| `DATA-078` |  408 | Chỉ mốc đầu của hôm nay dùng dữ liệu current; các mốc còn lại dùng mảng hourly.                                                            |
| `DATA-082` |  411 | Khóa vẫn là giờ gốc để nhận diện phần tử; nhãn thời gian có thể hiển thị phút hiện tại.                                                    |
| `DATA-083` |  413 | Ví dụ current là 23:45: mốc đầu ghi Bây giờ (23:45), mốc kế tiếp là 00:00 ngày mai.                                                        |
| `DATA-084` |  424 | API không có xác suất mưa trong nhóm current đã chọn; mốc Bây giờ dùng xác suất của giờ tương ứng. ?? giữ số 0 hợp lệ.                     |

## src/lib/weather-client.ts

API, cache và xử lý lỗi.

| Mã        | Dòng | Tác dụng của phần code ngay sau đó                                                                                                    |
| --------- | ---: | ------------------------------------------------------------------------------------------------------------------------------------- |
| `API-000` |    1 | TẦNG GỌI API: dựng URL, dùng cache, gộp yêu cầu trùng và chuyển lỗi mạng thành thông báo dễ hiểu. Không chứa giao diện.               |
| `API-001` |    2 | Chỉ nhập kiểu dữ liệu để TypeScript kiểm tra đầu vào/đầu ra; import type không tạo mã JavaScript khi build.                           |
| `API-002` |    5 | TTL dự báo = 15 phút. 60_000 là 60.000 ms; dấu gạch dưới chỉ giúp đọc số.                                                             |
| `API-003` |    7 | Làm mới thủ công vẫn dùng cache nếu dữ liệu mới nhận chưa đủ 30 giây, tránh bấm liên tục gọi API.                                     |
| `API-004` |    9 | Tiền tố cho khóa localStorage của tầng API, giúp phân biệt với cài đặt và yêu thích.                                                  |
| `API-005` |   11 | Cache là cặp giá trị + thời điểm nhận (mili giây). T là kiểu tổng quát: dùng được cho dự báo, thành phố và tìm kiếm.                  |
| `API-006` |   13 | Map cache trong RAM của tab hiện tại: tra cứu theo toàn bộ URL, nhanh hơn đọc/giải mã localStorage.                                   |
| `API-007` |   15 | Map các Promise đang chạy. Hai nơi cùng hỏi một URL sẽ chờ chung một yêu cầu mạng.                                                    |
| `API-008` |   17 | Lưu thời điểm được phép gọi lại theo hostname khi nhà cung cấp trả HTTP 429.                                                          |
| `API-009` |   20 | Đọc JSON từ localStorage. try/catch xử lý dữ liệu hỏng hoặc trình duyệt chặn storage; khi đó trả undefined.                           |
| `API-010` |   31 | Ghi JSON vào localStorage. Nếu hết dung lượng hoặc bị chặn, phần cache RAM vẫn dùng được.                                             |
| `API-032` |   40 | Lỗi riêng có mã status để phân biệt lỗi HTTP với lỗi mạng; message được đưa lên giao diện.                                            |
| `API-011` |   48 | Tính số giây còn phải đợi, làm tròn lên và tạo thông báo HTTP 429 bằng tiếng Việt.                                                    |
| `API-012` |   53 | Retry-After có thể là số giây hoặc ngày HTTP. Nếu thiếu/không hợp lệ, chờ mặc định 60 giây.                                           |
| `API-013` |   64 | Hàm gọi JSON dùng chung: cache → kiểm tra giới hạn → gộp yêu cầu → fetch → validate → lưu cache. force không bỏ qua giới hạn 30 giây. |
| `API-014` |   71 | Ưu tiên cache RAM; nếu chưa có thì đọc cache bền hơn trong localStorage.                                                              |
| `API-033` |   75 | Chỉ dùng cache khi dữ liệu hợp lệ và tuổi cache nhỏ hơn TTL; làm mới thủ công dùng mốc 30 giây.                                       |
| `API-015` |   85 | Tách hostname để áp dụng thời gian chờ cho mọi địa điểm dùng chung nguồn API.                                                         |
| `API-016` |   87 | Kết hợp thời gian chờ trong RAM và localStorage; tải lại trang cũng không bỏ qua Retry-After.                                         |
| `API-034` |   92 | Đang trong thời gian chờ thì báo lỗi ngay, không gửi request mới đến nguồn.                                                           |
| `API-017` |   95 | Nếu URL này đang tải, tái sử dụng Promise thay vì tạo thêm fetch.                                                                     |
| `API-035` |   97 | Trả cùng Promise cho các lời gọi đồng thời của cùng URL.                                                                              |
| `API-018` |  100 | Tạo tác vụ bất đồng bộ dùng chung; IIFE async chạy ngay và trả về một Promise.                                                        |
| `API-019` |  102 | Bộ điều khiển cho yêu cầu mạng thực sự; timeout bên dưới gọi abort để ngắt fetch.                                                     |
| `API-020` |  104 | Hủy fetch sau 18 giây để ứng dụng không chờ vô hạn khi đường truyền gặp lỗi.                                                          |
| `API-021` |  109 | fetch gửi HTTP GET trực tiếp từ trình duyệt. credentials omit không gửi cookie đến nhà cung cấp.                                      |
| `API-036` |  116 | 429 nghĩa là quá nhiều yêu cầu: ghi hạn chờ theo nguồn, rồi dừng để người dùng thử lại sau.                                           |
| `API-022` |  118 | Đọc Retry-After, chuyển thành thời điểm được thử lại rồi dùng cho thông báo và cache giới hạn.                                        |
| `API-037` |  124 | Các HTTP lỗi khác không được coi là dữ liệu thời tiết hợp lệ.                                                                         |
| `API-023` |  130 | Giải mã JSON; ép kiểu T chỉ giúp kiểm tra khi viết code, nên vẫn cần validate ở bước kế tiếp.                                         |
| `API-038` |  132 | Chặn JSON thiếu các trường chính trước khi lưu cache; tránh giữ lại phản hồi không sử dụng được.                                      |
| `API-024` |  137 | Ghi thời điểm nhận mới đúng một lần; đọc cache không làm dữ liệu cũ trở thành dữ liệu mới.                                            |
| `API-039` |  139 | Giới hạn cache RAM khoảng 60 URL bằng cách bỏ khóa được chèn sớm nhất; đây không phải thuật toán LRU đầy đủ.                          |
| `API-040` |  150 | finally luôn dọn bộ hẹn giờ, kể cả khi fetch thành công, thất bại hoặc bị hủy.                                                        |
| `API-041` |  154 | Đăng ký tác vụ ngay để các nơi gọi tiếp theo có thể dùng chung.                                                                       |
| `API-042` |  159 | Xóa dấu đang tải sau khi hoàn thành để lần cần cập nhật sau có thể gọi lại.                                                           |
| `API-025` |  164 | Dựng URL dự báo từ tọa độ. URLSearchParams mã hóa tham số; timezone cố định GMT+7, lấy 7 ngày.                                        |
| `API-043` |  180 | Yêu cầu API trả thời gian địa phương Việt Nam; các chuỗi hourly.time không cần đổi sang múi giờ laptop.                               |
| `API-044` |  183 | Nhóm giá trị hiện tại: nhiệt độ, độ ẩm, cảm nhận, ngày/đêm, mưa, mây, áp suất và gió.                                                 |
| `API-045` |  186 | Nhóm mảng theo từng giờ, dùng cho biểu đồ và thông tin từng mốc thời gian.                                                            |
| `API-046` |  189 | Nhóm tổng hợp theo ngày, dùng cho danh sách 7 ngày và giờ mặt trời mọc/lặn.                                                           |
| `API-026` |  195 | Lấy dự báo của một địa điểm, kiểm tra ba nhóm dữ liệu chính và bổ sung fetchedAt (lúc ứng dụng nhận dữ liệu).                         |
| `API-027` |  210 | Mô tả phần JSON tối thiểu cần đọc khi lấy tóm tắt nhiều thành phố cùng lúc.                                                           |
| `API-028` |  218 | Gộp các tọa độ vào một request. Thứ tự phản hồi tương ứng thứ tự places, nên phải kiểm tra số phần tử.                                |
| `API-047` |  224 | Nối các vĩ độ bằng dấu phẩy; kinh độ bên dưới phải giữ đúng cùng thứ tự địa điểm.                                                     |
| `API-029` |  250 | Cấu trúc một kết quả địa danh do Geocoding API trả về, trước khi đổi sang kiểu Place của ứng dụng.                                    |
| `API-030` |  259 | Tìm địa danh Việt Nam bằng Open-Meteo Geocoding; cache từ khóa 1 giờ và đổi kết quả về kiểu Place.                                    |
| `API-031` |  261 | Xóa khoảng trắng thừa và giới hạn từ khóa 80 ký tự trước khi đưa vào URL.                                                             |
| `API-048` |  263 | Không gọi tìm kiếm cho từ khóa quá ngắn để giảm request và kết quả nhiễu.                                                             |
| `API-049` |  269 | Giới hạn tìm kiếm ở Việt Nam ngay trong tham số API.                                                                                  |
| `API-050` |  278 | Kiểm tra lại mã quốc gia trên phản hồi trước khi hiển thị.                                                                            |

## src/components/weather-app.tsx

Trạng thái, vòng đời và màn hình chính.

| Mã        | Dòng | Tác dụng của phần code ngay sau đó                                                                                                               |
| --------- | ---: | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `APP-000` |    1 | MÀN HÌNH CHÍNH: trạng thái, vòng đời tải dữ liệu, thao tác người dùng và bố cục. Chú thích JSX nằm trong {/_ ... _/}.                            |
| `APP-001` |    4 | Các hook React: useState giữ trạng thái, useEffect làm việc bên ngoài render, useMemo ghi nhớ kết quả, useRef giữ phần tử, useCallback giữ hàm.  |
| `APP-002` |    6 | Các hook React: useState giữ trạng thái, useEffect làm việc bên ngoài render, useMemo ghi nhớ kết quả, useRef giữ phần tử, useCallback giữ hàm.  |
| `APP-003` |    8 | Bộ icon SVG cho nút và chỉ số. Icon chỉ minh họa; số liệu vẫn đến từ API.                                                                        |
| `APP-004` |   52 | Các kiểu và hàm xử lý thuần được dùng chung với component theo giờ và các bài kiểm tra.                                                          |
| `APP-005` |   66 | Các kiểu và hàm xử lý thuần được dùng chung với component theo giờ và các bài kiểm tra.                                                          |
| `APP-006` |   68 | Tầng dữ liệu gọi Open-Meteo trực tiếp từ trình duyệt; component không tự dựng logic fetch/cache.                                                 |
| `APP-007` |   75 | Tách biểu đồ và các thẻ từng giờ thành component riêng để dễ đọc và bảo trì.                                                                     |
| `APP-008` |   78 | Chỉ cho phép C hoặc F làm đơn vị hiển thị; dữ liệu gốc vẫn dùng °C.                                                                              |
| `APP-009` |   80 | Bảng ánh xạ WeatherKind sang component icon; tra bảng tránh viết nhiều nhánh JSX giống nhau.                                                     |
| `APP-010` |   92 | Tên khóa cài đặt và yêu thích trong localStorage của trình duyệt hiện tại.                                                                       |
| `APP-011` |   97 | Đọc và giải mã JSON; nếu storage hỏng hoặc bị chặn thì trả null, tránh làm sập giao diện.                                                        |
| `APP-012` |  106 | Lưu đối tượng bằng JSON.stringify. Bắt lỗi vì storage có thể đầy hoặc không khả dụng.                                                            |
| `APP-013` |  114 | Chọn icon từ mã WMO; tham số mặc định giúp component vẫn render khi chưa có dữ liệu.                                                             |
| `APP-014` |  137 | Logo bằng icon và chữ; small thu gọn cách hiển thị ở màn hình hẹp.                                                                               |
| `APP-015` |  151 | Minh họa mây, nắng, mưa bằng các phần tử CSS. Đây là trang trí dựa trên mã WMO, không phải ảnh radar.                                            |
| `APP-016` |  191 | Khung chỉ số dùng lại cho UV, gió, độ ẩm... children là phần nội dung chi tiết truyền từ bên ngoài.                                              |
| `APP-017` |  221 | Component cha phối hợp dữ liệu và các thao tác. Mỗi lần setState, React tính lại giao diện cần cập nhật.                                         |
| `APP-018` |  223 | Địa điểm đang chọn; mặc định Hồ Chí Minh. setPlace đổi địa điểm và kích hoạt effect tải dự báo.                                                  |
| `APP-019` |  225 | Gắn dự báo với placeId để khi đổi địa điểm không hiển thị nhầm dữ liệu của nơi cũ.                                                               |
| `APP-020` |  230 | Cờ đang tải, dùng để hiện trạng thái chờ và vô hiệu hóa thao tác phù hợp.                                                                        |
| `APP-021` |  232 | Thông báo lỗi tải dự báo chính; chuỗi rỗng nghĩa là không có lỗi.                                                                                |
| `APP-022` |  234 | Cờ cho biết lần cập nhật thất bại; dữ liệu đang giữ có thể đã cũ.                                                                                |
| `APP-023` |  236 | Chờ khôi phục cài đặt từ localStorage trước khi tải và ghi lại tùy chọn.                                                                         |
| `APP-024` |  238 | Đơn vị nhiệt độ đang hiển thị, C hoặc F; đổi đơn vị không cần gọi lại API.                                                                       |
| `APP-025` |  240 | Giao diện sáng/tối; effect gắn vào data-theme của thẻ html để CSS đổi màu.                                                                       |
| `APP-026` |  242 | Danh sách địa điểm đã lưu trên trình duyệt này, không phải tài khoản trên máy chủ.                                                               |
| `APP-027` |  244 | Bộ đếm làm mới thủ công. Tăng số để effect chạy lại; tầng API vẫn giữ khoảng chờ tối thiểu 30 giây.                                              |
| `APP-028` |  246 | Dữ liệu rút gọn của 4 thẻ thành phố ở phần khám phá.                                                                                             |
| `APP-029` |  248 | Theo dõi lỗi riêng cho thẻ thành phố, không thay thế lỗi dự báo chính.                                                                           |
| `APP-030` |  250 | Nội dung ô tìm kiếm; thay đổi sẽ kích hoạt effect debounce.                                                                                      |
| `APP-031` |  252 | Cho biết danh sách gợi ý tìm kiếm có đang mở hay không.                                                                                          |
| `APP-032` |  254 | Các địa danh do Geocoding API trả về, được kết hợp với danh sách PLACES.                                                                         |
| `APP-033` |  256 | Cờ đang đợi tìm kiếm, dùng để hiện biểu tượng tải.                                                                                               |
| `APP-034` |  258 | Cờ lỗi nguồn tìm kiếm để vẫn có thể dùng địa điểm mẫu.                                                                                           |
| `APP-035` |  260 | Chỉ số kết quả đang được chọn bằng bàn phím; -1 nghĩa là chưa chọn.                                                                              |
| `APP-036` |  262 | Chỉ số ngày đang chọn trong dự báo 7 ngày; 0 là hôm nay.                                                                                         |
| `APP-037` |  264 | Màn hình đang xem: tổng quan hoặc địa điểm đã lưu.                                                                                               |
| `APP-038` |  266 | Điều khiển thanh điều hướng dạng trượt ở màn hình nhỏ.                                                                                           |
| `APP-039` |  268 | Đóng/mở bảng cài đặt đơn vị và chủ đề.                                                                                                           |
| `APP-040` |  270 | Đóng/mở hộp giải thích nguồn dữ liệu và quyền riêng tư.                                                                                          |
| `APP-041` |  272 | Thông báo ngắn sau thao tác lưu/bỏ lưu/định vị; tự ẩn sau 3,8 giây.                                                                              |
| `APP-042` |  274 | Cờ đang chờ trình duyệt trả vị trí GPS/Wi-Fi/IP.                                                                                                 |
| `APP-043` |  276 | Đồng hồ để hiển thị ngày hiện tại; cập nhật mỗi phút, không gọi API thời tiết mỗi phút.                                                          |
| `APP-044` |  278 | Tham chiếu khung tìm kiếm để nhận biết thao tác bấm ra ngoài.                                                                                    |
| `APP-045` |  280 | Tham chiếu khung cài đặt để đóng khi bấm ra ngoài.                                                                                               |
| `APP-046` |  282 | Tham chiếu input, dùng focus/blur sau thao tác bàn phím hoặc nút tìm kiếm.                                                                       |
| `APP-047` |  284 | Chỉ nhận dữ liệu nếu bundle thuộc đúng địa điểm đang chọn.                                                                                       |
| `APP-048` |  286 | Kiểm tra địa điểm hiện tại có trong favorites để tô nút ngôi sao.                                                                                |
| `APP-049` |  289 | Khởi tạo một lần: đọc cài đặt/yêu thích hợp lệ, tạo đồng hồ mỗi 60 giây; cleanup xóa timer khi component được tháo.                              |
| `APP-050` |  291 | Khôi phục dữ liệu lưu, sau đó vẫn kiểm tra từng giá trị thay vì tin hoàn toàn nội dung localStorage.                                             |
| `APP-051` |  307 | Khi unit/place/theme đổi và đã ready: cập nhật data-theme và lưu tùy chọn. Mảng phụ thuộc kiểm soát lúc effect chạy lại.                         |
| `APP-052` |  313 | Lưu favorites sau khi khôi phục xong, tránh ghi đè danh sách cũ bằng mảng rỗng lúc khởi động.                                                    |
| `APP-053` |  317 | Đăng ký bấm ngoài và phím Esc để đóng các bảng. Cleanup gỡ listener để tránh rò rỉ và xử lý trùng.                                               |
| `APP-054` |  338 | Toast có nội dung thì hẹn 3.800 ms để ẩn; thay toast hoặc rời component sẽ hủy timer cũ.                                                         |
| `APP-055` |  345 | Vòng đời dự báo chính: đọc bản thành công gần nhất (<3 giờ), tải API, kiểm tra mỗi 15 phút khi tab hiển thị và khi quay lại tab.                 |
| `APP-056` |  349 | Khóa lưu bản dự báo thành công gần nhất theo tọa độ; dùng khi mở lại hoặc gặp lỗi mạng.                                                          |
| `APP-057` |  351 | Bản dự báo đã lưu ở giao diện; khác cache URL trong weather-client.ts.                                                                           |
| `APP-097` |  363 | Mốc thành công gần nhất quyết định có cần tải lại sau 15 phút hay không; khác đồng hồ now của giao diện.                                         |
| `APP-098` |  370 | Cờ cục bộ ngăn hai lần load trong cùng vòng đời effect chạy chồng nhau.                                                                          |
| `APP-058` |  372 | Tải dự báo chính: chặn tải trùng, kiểm tra tuổi cache, cập nhật trạng thái và giữ dữ liệu cũ khi lỗi.                                            |
| `APP-099` |  391 | Controller trong component chỉ ngăn kết quả cũ ghi vào giao diện sau khi đổi nơi. fetch chia sẻ có controller/timeout riêng ở weather-client.ts. |
| `APP-100` |  410 | Lần đầu dùng cache thường; sau thao tác làm mới, force=true nhưng không vượt quy tắc 30 giây của tầng API.                                       |
| `APP-101` |  414 | Lần kiểm tra theo timer chỉ chạy khi tab hiển thị để giảm công việc khi người dùng ở tab khác.                                                   |
| `APP-102` |  424 | Cleanup đánh dấu vòng đời cũ đã kết thúc; đồng thời xóa timer và listener phía dưới.                                                             |
| `APP-059` |  430 | Vòng đời thẻ thành phố: lấy 4 nơi bằng batch, kiểm tra mỗi 15 phút; timer này chưa được chặn theo visibility như dự báo chính.                   |
| `APP-060` |  434 | Tải tóm tắt 4 địa điểm mẫu bằng một request, thay vì gọi riêng từng thành phố.                                                                   |
| `APP-061` |  452 | Debounce tìm kiếm 350 ms: chỉ gửi khi dừng gõ; đổi từ khóa sẽ hủy timer và bỏ qua kết quả cũ.                                                    |
| `APP-103` |  474 | Khoảng chờ 350 ms là debounce, không phải khoảng dự báo thời tiết.                                                                               |
| `APP-062` |  482 | useMemo kết hợp tìm kiếm tên không dấu/tên tắt với kết quả API; bỏ kết quả gần trùng tọa độ và giữ tối đa 8 mục.                                 |
| `APP-063` |  502 | Hàm chọn địa điểm dùng lại ở tìm kiếm, GPS và thẻ thành phố; đồng thời đặt lại ngày, ô tìm kiếm và menu.                                         |
| `APP-064` |  512 | Thêm/bỏ một địa điểm, tối đa 30 mục. Cập nhật bằng prev để dùng danh sách mới nhất.                                                              |
| `APP-104` |  515 | Giới hạn số địa điểm lưu để danh sách gọn và tránh tăng dữ liệu localStorage quá nhiều.                                                          |
| `APP-065` |  525 | Đổi màn hình tổng quan/đã lưu; mục Dự báo cuộn đến vùng #weekly sau khi vùng đó được render.                                                     |
| `APP-066` |  539 | Hỗ trợ bàn phím trong tìm kiếm: ↑/↓ chọn kết quả, Enter mở địa điểm.                                                                             |
| `APP-067` |  556 | Xin vị trí qua Geolocation của trình duyệt; chỉ chạy khi người dùng nhấn nút định vị.                                                            |
| `APP-105` |  565 | API định vị của trình duyệt, không phải API thời tiết. Trình duyệt sẽ quản lý quyền vị trí.                                                      |
| `APP-106` |  597 | Ưu tiên tiết kiệm tài nguyên; chờ tối đa 12 giây và chấp nhận vị trí đã có tối đa 5 phút.                                                        |
| `APP-068` |  602 | Rút ngắn đường dẫn đến nhóm dữ liệu hiện tại; ?. cho phép data chưa tải xong.                                                                    |
| `APP-069` |  604 | Nhóm dự báo tổng hợp theo ngày, dùng cho nhiệt độ cao/thấp và mặt trời mọc/lặn.                                                                  |
| `APP-070` |  606 | Tên tiếng Việt và nhóm minh họa được suy ra từ mã WMO và cờ ngày/đêm.                                                                            |
| `APP-071` |  608 | Tìm giờ đang chứa current.time trong mảng hourly; dùng để lấy UV và 24 giờ cần xem.                                                              |
| `APP-072` |  617 | Chỉ số UV của giờ tương ứng; giữ giá trị thiếu để giao diện không báo UV = 0 sai lệch.                                                           |
| `APP-073` |  619 | Chuyển giá trị UV thành mức diễn giải: thấp, trung bình, cao, rất cao, cực cao.                                                                  |
| `APP-074` |  632 | Chọn lớp màu theo UV; nhãn ở trên vẫn phân biệt khi thiếu dữ liệu.                                                                               |
| `APP-075` |  634 | Trong 24 giờ tới, lấy những giờ có khả năng mưa từ 60% để tạo lời nhắc mang ô.                                                                   |
| `APP-076` |  644 | Lời nhắc theo quy tắc if/else: ưu tiên mưa, rồi nóng cảm nhận ≥35°C, cuối cùng là gợi ý chung. Không phải AI tự học.                             |
| `APP-077` |  662 | Định dạng ngày theo tiếng Việt và múi giờ Việt Nam dù laptop dùng múi giờ khác.                                                                  |
| `APP-078` |  672 | Chuẩn hóa tiến trình từ bình minh đến hoàng hôn về khoảng 0..1 để đặt biểu tượng trên cung minh họa.                                             |
| `APP-079` |  799 | Vùng nội dung chính; id main là đích đến của liên kết hỗ trợ bàn phím.                                                                           |
| `APP-080` |  801 | Tiêu đề, tìm kiếm, định vị và cài đặt; input được điều khiển bằng state query.                                                                   |
| `APP-081` |  824 | Khối combobox: kết quả mẫu xuất hiện ngay, kết quả API bổ sung sau debounce.                                                                     |
| `APP-082` |  923 | Bảng chọn °C/°F và sáng/tối; đổi state rồi CSS/formatter tự cập nhật.                                                                            |
| `APP-083` |  972 | Tab địa điểm và trạng thái lần tải gần nhất; nút làm mới tăng revision.                                                                          |
| `APP-084` | 1046 | Bố cục hai cột: thời tiết hiện tại/theo giờ/chỉ số và dự báo ngày/mặt trời/gợi ý.                                                                |
| `APP-085` | 1053 | Tên địa điểm và nút yêu thích; nút gọi toggleFavorite, không gửi dữ liệu tài khoản.                                                              |
| `APP-086` | 1114 | Tóm tắt độ ẩm, gió, khả năng mưa; mỗi chỉ số có đơn vị riêng.                                                                                    |
| `APP-087` | 1172 | Truyền dữ liệu và ngày đã chọn xuống component từng giờ; onSource mở hộp nguồn dữ liệu.                                                          |
| `APP-088` | 1182 | Các chỉ số nổi bật dùng MetricCard để tái sử dụng bố cục.                                                                                        |
| `APP-089` | 1323 | Danh sách 7 ngày; chọn một hàng cập nhật selectedDay cho cả chi tiết và biểu đồ từng giờ.                                                        |
| `APP-090` | 1416 | Hiển thị giờ bình minh/hoàng hôn từ API; cung mặt trời chỉ là minh họa.                                                                          |
| `APP-091` | 1422 | Cung SVG dùng sunProgress; không phải mô phỏng thiên văn chính xác.                                                                              |
| `APP-092` | 1497 | Lời nhắc được tạo từ biến tip theo quy tắc đã giải thích ở trên.                                                                                 |
| `APP-093` | 1522 | Bốn thẻ thành phố dùng dữ liệu batch; bấm thẻ gọi selectPlace.                                                                                   |
| `APP-094` | 1663 | Ghi nguồn dữ liệu, giấy phép và thời điểm nhận để người xem kiểm tra độ mới.                                                                     |
| `APP-095` | 1703 | Hộp giới thiệu nguồn/API/quyền riêng tư; đóng bằng nút hoặc Esc.                                                                                 |
| `APP-096` | 1757 | Công khai endpoint và liên kết JSON thật cho tọa độ đang chọn.                                                                                   |

## src/components/hourly-forecast.tsx

Biểu đồ và tương tác từng giờ.

| Mã         | Dòng | Tác dụng của phần code ngay sau đó                                                                                       |
| ---------- | ---: | ------------------------------------------------------------------------------------------------------------------------ |
| `HOUR-000` |    1 | DỰ BÁO TỪNG GIỜ: cùng một danh sách dữ liệu cấp cho biểu đồ, thẻ giờ và bảng chi tiết; cuộn chung để không lệch mốc.     |
| `HOUR-001` |    4 | Các hook quản lý tab chỉ số, giờ đang chọn, vị trí cuộn và dữ liệu đã chuẩn hóa.                                         |
| `HOUR-002` |    6 | Thư viện vẽ biểu đồ React. AreaChart dựng biểu đồ, XAxis/YAxis là trục, Tooltip hiển thị giá trị khi rê chuột.           |
| `HOUR-003` |   16 | Icon minh họa thời tiết, điều hướng và các chỉ số.                                                                       |
| `HOUR-004` |   37 | getHourlyTimeline giữ đủ các giờ liên tiếp; formatter và kiểu dữ liệu được dùng chung với màn hình chính.                |
| `HOUR-005` |   48 | getHourlyTimeline giữ đủ các giờ liên tiếp; formatter và kiểu dữ liệu được dùng chung với màn hình chính.                |
| `HOUR-006` |   50 | Dùng cùng hàm forecastUrl để liên kết dữ liệu gốc khớp đúng địa điểm trên giao diện.                                     |
| `HOUR-007` |   53 | Chỉ số của biểu đồ: nhiệt độ, xác suất mưa hoặc tốc độ gió.                                                              |
| `HOUR-008` |   55 | Đơn vị nhiệt độ hiển thị, C hoặc F.                                                                                      |
| `HOUR-009` |   57 | Bảng chọn icon theo nhóm thời tiết được weatherInfo trả về.                                                              |
| `HOUR-010` |   69 | Mỗi mốc chiếm 72 px: dùng chung cho độ rộng biểu đồ, thẻ và quãng cuộn mỗi lần bấm mũi tên.                              |
| `HOUR-011` |   71 | Chọn icon cho một giờ từ mã WMO và cờ ban ngày/ban đêm.                                                                  |
| `HOUR-012` |   84 | Nội dung tooltip tùy chỉnh: giờ thực, ngày, GMT+7, giá trị và đúng đơn vị của chỉ số.                                    |
| `HOUR-043` |  101 | Tooltip chưa hoạt động hoặc chưa có dữ liệu thì không render; tránh truy cập phần tử không tồn tại.                      |
| `HOUR-013` |  129 | Nhận dữ liệu từ component cha qua props; quản lý riêng chỉ số biểu đồ và mốc chi tiết đang chọn.                         |
| `HOUR-014` |  145 | Tab chỉ số đang chọn; đổi state chỉ tính lại dữ liệu vẽ, không gọi API mới.                                              |
| `HOUR-015` |  147 | Khóa mốc được bấm để hiển thị chi tiết; null sẽ chọn mốc đầu danh sách.                                                  |
| `HOUR-016` |  149 | Cờ đang ở đầu/cuối vùng cuộn để tắt mũi tên không còn tác dụng.                                                          |
| `HOUR-017` |  151 | Tham chiếu vùng cuộn chung của biểu đồ và hàng thẻ theo giờ.                                                             |
| `HOUR-018` |  153 | useMemo chỉ tạo lại danh sách giờ khi data hoặc selectedDay đổi, không lặp lại khi chỉ đóng/mở giao diện khác.           |
| `HOUR-019` |  158 | Tìm mốc được chọn; nếu khóa không còn trong ngày hiện tại thì dùng phần tử đầu.                                          |
| `HOUR-020` |  160 | Màu nhất quán theo chỉ số: vàng nhiệt độ, xanh dương mưa, xanh ngọc gió.                                                 |
| `HOUR-021` |  167 | Chuyển danh sách giờ thành cấu trúc Recharts; time là nhãn, actualTime/date dành cho tooltip, value là chỉ số đang chọn. |
| `HOUR-022` |  180 | Đo scrollLeft/clientWidth/scrollWidth để biết còn giờ ở bên trái/phải; dung sai 3 px tránh sai số làm tròn.              |
| `HOUR-023` |  189 | Đổi địa điểm hoặc ngày: bỏ chọn mốc cũ, đưa vùng cuộn về đầu và đo lại trạng thái mũi tên.                               |
| `HOUR-024` |  195 | ResizeObserver đo lại khi khung thay kích thước; disconnect trong cleanup để tránh giữ observer thừa.                    |
| `HOUR-044` |  200 | Bỏ qua cơ chế quan sát nếu trình duyệt không có API này, tránh lỗi runtime.                                              |
| `HOUR-025` |  206 | Cuộn đúng một bước STEP về trái/phải. direction nhận -1 hoặc 1 từ nút và bàn phím.                                       |
| `HOUR-026` |  208 | Tôn trọng tùy chọn giảm chuyển động của hệ điều hành: dùng cuộn tức thì thay vì smooth.                                  |
| `HOUR-027` |  240 | Ba tab chọn chỉ số và hai nút dịch từng giờ; mỗi nút chỉ thay state hoặc vị trí cuộn.                                    |
| `HOUR-028` |  242 | role tablist và aria-selected hỗ trợ người dùng bàn phím/trình đọc màn hình.                                             |
| `HOUR-029` |  263 | disabled phụ thuộc edges và danh sách giờ để không cuộn vượt đầu/cuối.                                                   |
| `HOUR-030` |  285 | Hiển thị số mốc thực sự có; không khẳng định đủ 24 nếu API cung cấp ít hơn.                                              |
| `HOUR-031` |  295 | Biểu đồ và thẻ nằm chung một phần tử cuộn; phím ←/→ cũng dùng được khi vùng này có focus.                                |
| `HOUR-032` |  313 | Độ rộng = số giờ ×72 +32 px cho trục Y. Nhờ đó mỗi thẻ khớp đúng điểm trên biểu đồ.                                      |
| `HOUR-033` |  323 | Cho biểu đồ dùng kích thước của khung cha; CSS đặt chiều cao riêng.                                                      |
| `HOUR-034` |  325 | Nguồn data là chart đã chuẩn hóa; không lấy mẫu cách 3 giờ.                                                              |
| `HOUR-035` |  350 | Các đường ngang nét đứt hỗ trợ đọc giá trị, không tạo số liệu.                                                           |
| `HOUR-036` |  356 | interval=0 giữ mọi nhãn giờ; padding mỗi bên STEP/2 đặt điểm ở giữa thẻ tương ứng.                                       |
| `HOUR-037` |  366 | Trục Y rộng 32 px; xác suất mưa cố định 0..100, các chỉ số khác dùng miền phù hợp.                                       |
| `HOUR-038` |  384 | Tooltip dùng HourTooltip để giữ ngày và giờ Việt Nam khi rê chuột qua nửa đêm.                                           |
| `HOUR-039` |  392 | monotone chỉ làm mượt nét vẽ. connectNulls=false để dữ liệu thiếu tạo khoảng trống, không nối thành số liệu giả.         |
| `HOUR-040` |  410 | Một cột cho mỗi mốc; map không dùng bước nhảy nên giữ cả 00:00, 01:00, 02:00...                                          |
| `HOUR-041` |  455 | Nhiệt độ, xác suất mưa, gió và độ ẩm của mốc đã chọn; null hiển thị —.                                                   |
| `HOUR-042` |  496 | Nút nguồn và liên kết JSON dùng đúng tọa độ của place, giúp tự kiểm tra dữ liệu thật.                                    |

## src/index.css

CSS nền tảng và responsive.

| Mã        | Dòng | Tác dụng của phần code ngay sau đó                                                                               |
| --------- | ---: | ---------------------------------------------------------------------------------------------------------------- |
| `CSS-000` |    1 | CHÚ THÍCH CSS: xem README để biết thứ tự nạp và nơi chỉnh màu/độ trong.                                          |
| `CSS-001` |    2 | Nạp font Manrope từ file trong public/fonts; không phải tải từ Google Fonts khi mở trang.                        |
| `CSS-002` |   21 | Biến thiết kế dùng chung: nền, thẻ, chữ, đường viền, màu nhấn và bo góc. glass-update.css sẽ ghi đè một số biến. |
| `CSS-003` |   36 | Bộ màu tối; được bật khi React đặt data-theme="dark" trên thẻ html.                                              |
| `CSS-004` |   50 | Tính kích thước gồm cả padding/border, giúp grid và responsive dễ kiểm soát.                                     |
| `CSS-005` |   54 | Thiết lập cuộn mượt và khoảng chừa khi cuộn đến mục dự báo.                                                      |
| `CSS-006` |   59 | Thiết lập font, cỡ chữ và màu nền/chữ toàn trang.                                                                |
| `CSS-007` |   92 | Viền focus hỗ trợ điều khiển bàn phím, áp dụng cho nút và liên kết.                                              |
| `CSS-008` |  128 | Khung bao toàn ứng dụng; các vùng con tạo bố cục chi tiết.                                                       |
| `CSS-009` |  132 | Liên kết Đến nội dung chính chỉ hiện khi focus để bỏ qua thanh điều hướng.                                       |
| `CSS-010` |  146 | Thanh điều hướng bên trái; các media query phía cuối đổi thành menu cho màn hình nhỏ.                            |
| `CSS-011` |  162 | Sắp xếp biểu tượng và chữ thương hiệu.                                                                           |
| `CSS-012` |  203 | Bố cục các nút điều hướng chính.                                                                                 |
| `CSS-013` |  209 | Kiểu nút điều hướng; .active và :hover đổi màu theo trạng thái.                                                  |
| `CSS-014` |  268 | Danh sách địa điểm đã lưu ở thanh bên.                                                                           |
| `CSS-015` |  310 | Thẻ trang trí nhỏ cuối thanh điều hướng.                                                                         |
| `CSS-016` |  396 | Vùng nội dung bên phải thanh điều hướng.                                                                         |
| `CSS-017` |  402 | Hàng tiêu đề và các thao tác tìm kiếm/cài đặt.                                                                   |
| `CSS-018` |  452 | Khung định vị danh sách kết quả tìm kiếm so với input.                                                           |
| `CSS-019` |  458 | Bề mặt và bố cục ô tìm kiếm; input nhận dữ liệu từ React state.                                                  |
| `CSS-020` |  497 | Nút chỉ có icon; aria-label được khai báo ở JSX để mô tả chức năng.                                              |
| `CSS-021` |  517 | Bảng nổi chọn đơn vị và giao diện, dùng z-index để nằm trên nội dung.                                            |
| `CSS-022` |  572 | Danh sách gợi ý nổi bên dưới ô tìm kiếm.                                                                         |
| `CSS-023` |  656 | Tab địa điểm và trạng thái cập nhật dữ liệu.                                                                     |
| `CSS-024` |  731 | Khung thông báo lỗi mạng/nguồn dữ liệu với nút thử lại.                                                          |
| `CSS-025` |  754 | Grid bố cục chính hai cột trên laptop rộng; responsive ở cuối file thay đổi theo màn hình.                       |
| `CSS-026` |  767 | Kiểu thẻ chung. File glass-update.css thay nền/viền/bóng để có độ trong nhẹ.                                     |
| `CSS-027` |  774 | Thẻ thời tiết hiện tại với nền chuyển màu; phiên bản ban đêm dùng .current-night.                                |
| `CSS-028` |  857 | Kiểu chữ số nhiệt độ lớn; đơn vị có kiểu nhỏ riêng.                                                              |
| `CSS-029` |  901 | Các chỉ số tóm tắt bên dưới nhiệt độ.                                                                            |
| `CSS-030` |  938 | Khung minh họa CSS; các lớp scene-sun/cloud/rain tạo hình bằng màu, bóng và phần tử giả.                         |
| `CSS-031` |  963 | Hình mặt trời bằng CSS, không cần tải ảnh bên ngoài.                                                             |
| `CSS-032` |  984 | Hình mặt trăng bằng CSS.                                                                                         |
| `CSS-033` | 1005 | Hình mây; ::before/::after và các lớp trước/sau thêm các khối tròn.                                              |
| `CSS-034` | 1062 | Những nét mưa trang trí chỉ xuất hiện khi mã thời tiết thuộc nhóm mưa.                                           |
| `CSS-035` | 1123 | Bảng màu thẻ hiện tại khi API cho is_day = 0.                                                                    |
| `CSS-036` | 1175 | Khung chờ có chuyển động nhẹ trong lúc dữ liệu đang tải; không chứa số liệu giả.                                 |
| `CSS-037` | 1210 | Trạng thái chưa có dữ liệu và nút tải lại.                                                                       |
| `CSS-038` | 1257 | Khung dự báo theo giờ; phần bố cục cuộn mới được ghi đè trong glass-update.css.                                  |
| `CSS-039` | 1269 | Ba nút chuyển biểu đồ nhiệt độ/mưa/gió.                                                                          |
| `CSS-040` | 1296 | Khung nổi hiển thị giá trị khi rê chuột trên biểu đồ.                                                            |
| `CSS-041` | 1319 | Kiểu hàng thẻ giờ nền tảng; glass-update.css đổi sang số cột động để giữ đủ từng giờ.                            |
| `CSS-042` | 1357 | Màu mặc định của icon; các lớp weather-rain/moon/... đổi theo nhóm thời tiết.                                    |
| `CSS-043` | 1410 | Grid các chỉ số nổi bật: UV, gió, độ ẩm, tầm nhìn, mây và áp suất.                                               |
| `CSS-044` | 1494 | Thanh màu UV; vị trí con trỏ do dữ liệu trong JSX quyết định.                                                    |
| `CSS-045` | 1545 | La bàn gió trang trí; hướng chữ và phép quay nằm trong JSX.                                                      |
| `CSS-046` | 1573 | Thanh tỉ lệ độ ẩm; độ rộng được truyền từ dữ liệu %.                                                             |
| `CSS-047` | 1640 | Khung dự báo 7 ngày bên phải.                                                                                    |
| `CSS-048` | 1658 | Mỗi hàng là một ngày; lớp selected đánh dấu ngày đang xem chi tiết.                                              |
| `CSS-049` | 1739 | Mưa và gió của ngày đang chọn.                                                                                   |
| `CSS-050` | 1779 | Khung giờ bình minh và hoàng hôn.                                                                                |
| `CSS-051` | 1835 | Thẻ lời nhắc hằng ngày, nội dung được tạo bằng quy tắc trong weather-app.tsx.                                    |
| `CSS-052` | 1900 | Grid các thành phố gợi ý; số liệu đến từ request batch.                                                          |
| `CSS-053` | 2013 | Hình trang trí từng thành phố bằng CSS, không phải bản đồ hoặc ảnh đo đạc.                                       |
| `CSS-054` | 2079 | Chân trang ghi nguồn và thời điểm dữ liệu.                                                                       |
| `CSS-055` | 2160 | Grid địa điểm đã lưu; thay đổi số cột theo màn hình.                                                             |
| `CSS-056` | 2218 | Nội dung hướng dẫn khi người dùng chưa lưu địa điểm nào.                                                         |
| `CSS-057` | 2261 | Thông báo ngắn, nổi trên nội dung; timer trong React tự ẩn sau 3,8 giây.                                         |
| `CSS-058` | 2291 | Lớp phủ phía sau hộp thông tin nguồn dữ liệu.                                                                    |
| `CSS-059` | 2304 | Khung thông tin về ứng dụng và nhà cung cấp API.                                                                 |
| `CSS-060` | 2444 | Định nghĩa chuyển động nền cho skeleton tải dữ liệu.                                                             |
| `CSS-061` | 2453 | Định nghĩa chuyển động quay cho biểu tượng đang tải.                                                             |
| `CSS-062` | 2459 | Hiệu ứng xuất hiện của toast.                                                                                    |
| `CSS-063` | 2470 | Màn hình lớn: tăng không gian và kích thước đọc; không thay đổi dữ liệu.                                         |
| `CSS-064` | 2539 | Điều chỉnh riêng cho màn hình rất rộng.                                                                          |
| `CSS-065` | 2547 | Laptop hẹp: thu gọn kích thước và khoảng cách của bố cục.                                                        |
| `CSS-066` | 2779 | Màn hình vừa: điều chỉnh các cột/thẻ để tránh tràn ngang toàn trang.                                             |
| `CSS-067` | 3003 | Tablet: sắp xếp lại vùng điều hướng và nội dung.                                                                 |
| `CSS-068` | 3201 | Điện thoại: hiển thị menu thu gọn và bố cục ưu tiên chiều dọc.                                                   |
| `CSS-069` | 3609 | Điện thoại nhỏ: tiếp tục giảm khoảng cách và kích thước điều khiển phù hợp.                                      |
| `CSS-070` | 4095 | Thông báo khi chưa tải được dự báo ngày, tách khỏi trạng thái skeleton.                                          |
| `CSS-071` | 4114 | Giảm chuyển động theo tùy chọn trợ năng của hệ điều hành/trình duyệt.                                            |

## src/glass-update.css

Kính mờ và vùng cuộn từng giờ.

| Mã          | Dòng | Tác dụng của phần code ngay sau đó                                                                                |
| ----------- | ---: | ----------------------------------------------------------------------------------------------------------------- |
| `GLASS-000` |    1 | CHÚ THÍCH CSS: xem README để biết thứ tự nạp và nơi chỉnh màu/độ trong.                                           |
| `GLASS-001` |    3 | Ghi đè biến thiết kế sáng: nền pastel, thẻ bán trong suốt, viền sáng và bóng nhẹ.                                 |
| `GLASS-002` |    6 | Alpha 0.76 nghĩa là nền thẻ có độ đục 76%; giảm số cuối để nhìn xuyên nhiều hơn. Không làm mờ chữ bên trong.      |
| `GLASS-003` |    9 | Độ đục riêng cho thanh bên, độc lập với thẻ nội dung.                                                             |
| `GLASS-004` |   11 | Bảng nổi gần đặc hơn để chữ vẫn dễ đọc trên nội dung phía sau.                                                    |
| `GLASS-005` |   15 | Ba lớp radial-gradient tạo vùng sáng mềm thay vì một nền phẳng.                                                   |
| `GLASS-006` |   33 | Các biến kính mờ tương ứng cho giao diện tối, tránh dùng màu trắng trong suốt quá sáng.                           |
| `GLASS-007` |   64 | Lớp màu nền cố định; pointer-events none cho phép bấm xuyên qua lớp trang trí.                                    |
| `GLASS-008` |   73 | Bo góc, viền và bóng chung giúp bề mặt thẻ mềm hơn.                                                               |
| `GLASS-009` |   85 | Làm mờ và tăng nhẹ độ bão hòa của NỀN SAU bề mặt, không làm nhòe chữ. Dòng -webkit- hỗ trợ trình duyệt tương ứng. |
| `GLASS-010` |   89 | Thanh bên dùng biến nền bán trong suốt riêng.                                                                     |
| `GLASS-011` |  100 | Gradient RGBA cho thẻ hiện tại; alpha chỉ áp dụng nền, không dùng opacity toàn thẻ.                               |
| `GLASS-012` |  115 | Thẻ ban đêm dùng gradient đậm để giữ tương phản.                                                                  |
| `GLASS-013` |  132 | Thẻ thành phố dùng nền và blur riêng; các lớp city-1/2/3 đổi sắc thái.                                            |
| `GLASS-014` |  148 | Thẻ gợi ý dùng màu xanh dịu, bán trong suốt.                                                                      |
| `GLASS-015` |  174 | Cho khung theo giờ được co trong grid (min-width 0), nội dung dài cuộn ở vùng con.                                |
| `GLASS-016` |  179 | Đặt tab chỉ số và nút mũi tên trên cùng một hàng.                                                                 |
| `GLASS-017` |  191 | Nhóm mũi tên không bị co khi khung hẹp.                                                                           |
| `GLASS-018` |  212 | Nút ở đầu/cuối vùng cuộn được giảm độ nổi bật và không còn tác dụng.                                              |
| `GLASS-019` |  217 | Dòng hướng dẫn cuộn và số mốc dữ liệu thật.                                                                       |
| `GLASS-020` |  241 | Chỉ vùng biểu đồ/thẻ cuộn ngang; chặn tràn sang toàn trang.                                                       |
| `GLASS-021` |  244 | Bật thanh cuộn ngang khi 24 mốc rộng hơn vùng hiển thị.                                                           |
| `GLASS-022` |  261 | Khung bên trong có độ rộng do React tính theo số giờ ×72 +32.                                                     |
| `GLASS-023` |  265 | Giữ chiều cao biểu đồ ổn định, trong khi độ rộng theo toàn bộ danh sách giờ.                                      |
| `GLASS-024` |  270 | Lưới có số cột do JSX truyền; padding trái dành cho trục Y rộng 32 px.                                            |
| `GLASS-025` |  279 | Mỗi nút giờ chứa thời gian, ngày, icon, nhiệt độ và xác suất mưa.                                                 |
| `GLASS-026` |  319 | Đánh dấu mốc được chọn để đọc chi tiết bên dưới.                                                                  |
| `GLASS-027` |  333 | Khung chi tiết giữ vị trí ngoài vùng cuộn ngang.                                                                  |
| `GLASS-028` |  372 | Sắp xếp bốn chỉ số nhiệt độ, mưa, gió và độ ẩm.                                                                   |
| `GLASS-029` |  392 | Hàng nút nguồn và liên kết dữ liệu gốc phía cuối thẻ.                                                             |
| `GLASS-030` |  419 | Khối công khai API trong hộp thông tin; URL dài được phép xuống dòng.                                             |
| `GLASS-031` |  458 | Fallback nền đặc khi trình duyệt không hỗ trợ backdrop-filter, giữ chữ dễ đọc.                                    |
| `GLASS-032` |  471 | Thu gọn các điều khiển theo giờ trên màn hình vừa.                                                                |
| `GLASS-033` |  494 | Điều chỉnh độ lớn nút/chữ cho điện thoại.                                                                         |
| `GLASS-034` |  514 | Tối ưu khoảng cách trên màn hình nhỏ; vẫn giữ STEP 72 px để không lệch mốc.                                       |

## vite.config.ts

Cấu hình công cụ lập trình frontend.

| Mã         | Dòng | Tác dụng của phần code ngay sau đó                                                                            |
| ---------- | ---: | ------------------------------------------------------------------------------------------------------------- |
| `VITE-000` |    1 | CẤU HÌNH CÔNG CỤ: Vite phục vụ code lúc phát triển và tạo bản dist khi build.                                 |
| `VITE-001` |    2 | defineConfig cung cấp kiểu và gợi ý thuộc tính cấu hình Vite.                                                 |
| `VITE-002` |    4 | Plugin biên dịch JSX/TSX và cập nhật giao diện nhanh khi sửa code React.                                      |
| `VITE-003` |    6 | Đổi đường dẫn alias sang đường dẫn hệ điều hành.                                                              |
| `VITE-004` |   10 | Bật hỗ trợ React cho Vite.                                                                                    |
| `VITE-005` |   12 | Cho phép import @/lib/weather thay cho các đường dẫn ../../lib/weather dài.                                   |
| `VITE-006` |   14 | Dev server dùng cổng cố định 5173 trên laptop; nếu bận thì báo lỗi để người dùng xử lý hoặc chọn --port khác. |

## index.html

Vỏ HTML của mã nguồn giao diện.

| Mã         | Dòng | Tác dụng của phần code ngay sau đó                                                            |
| ---------- | ---: | --------------------------------------------------------------------------------------------- |
| `HTML-000` |    1 | Vỏ HTML của ứng dụng; giao diện chính được React render từ src/main.tsx.                      |
| `HTML-001` |    3 | Khai báo ngôn ngữ tiếng Việt cho trình đọc màn hình và trình duyệt.                           |
| `HTML-002` |    6 | UTF-8 giúp tiếng Việt có dấu hiển thị đúng.                                                   |
| `HTML-003` |    8 | Độ rộng theo màn hình thiết bị để CSS responsive hoạt động.                                   |
| `HTML-004` |   16 | Biểu tượng tab lấy từ public/favicon.svg; public được Vite chép vào dist.                     |
| `HTML-005` |   18 | Mô tả tên/icon/cách mở của ứng dụng web; không tạo chế độ offline khi chưa có service worker. |
| `HTML-006` |   20 | Tên xuất hiện trên tab trình duyệt; có thể sửa thương hiệu tại đây.                           |
| `HTML-007` |   24 | React sẽ đưa toàn bộ giao diện vào phần tử này; phải khớp getElementById trong main.tsx.      |
| `HTML-008` |   26 | Vite xử lý TSX từ điểm vào này; mở bằng dev server, không nhấp đúp HTML dưới dạng file://.    |

## tests/weather-client.test.mjs

Kiểm tra tầng dữ liệu API.

| Mã             | Dòng | Tác dụng của phần code ngay sau đó                                                                         |
| -------------- | ---: | ---------------------------------------------------------------------------------------------------------- |
| `TEST-API-000` |    1 | KIỂM THỬ HỒI QUY: dữ liệu fixture/fetch giả chỉ dùng trong test, không phải dữ liệu hiển thị của ứng dụng. |
| `TEST-API-001` |   26 | Tọa độ sai phải bị chặn trước khi gọi mạng; URL hợp lệ luôn yêu cầu múi giờ Việt Nam.                      |
| `TEST-API-002` |   41 | Năm lời gọi đồng thời cùng địa điểm chỉ tạo một fetch; làm mới ngay không gọi thêm và không sửa fetchedAt. |
| `TEST-API-003` |   59 | Phản hồi thiếu hourly/daily không được lưu cache; lần tiếp theo vẫn phải gọi lại được.                     |
| `TEST-API-004` |   73 | Hai địa điểm dùng một request batch; thứ tự địa điểm và giá trị null được giữ đúng.                        |
| `TEST-API-005` |   94 | URL mã hóa đúng tiếng Việt, có countryCode=VN và lọc bỏ kết quả quốc gia khác.                             |
| `TEST-API-006` |  123 | HTTP 429 áp dụng thời gian chờ cho cả địa điểm khác cùng nguồn; chỉ gọi lại sau mốc Retry-After.           |

## tests/hourly-timeline.test.mjs

Kiểm tra chuỗi giờ.

| Mã              | Dòng | Tác dụng của phần code ngay sau đó                                                                                       |
| --------------- | ---: | ------------------------------------------------------------------------------------------------------------------------ |
| `TEST-HOUR-000` |    1 | KIỂM THỬ HỒI QUY: dữ liệu fixture/fetch giả chỉ dùng trong test, không phải dữ liệu hiển thị của ứng dụng.               |
| `TEST-HOUR-001` |   35 | Từ 23:45 phải có Bây giờ, 00:00, 01:00, 02:00...; xác nhận khoảng cách khóa giờ đúng 3.600.000 ms và ngày đổi ở nửa đêm. |
| `TEST-HOUR-002` |   52 | Mốc Bây giờ phải dùng số đo mô hình current (27,8), không thay bằng giá trị hourly của giờ tròn (25).                    |
| `TEST-HOUR-003` |   60 | Chọn ngày mai phải lấy đủ 00:00..23:00 của đúng ngày, không có mốc Bây giờ.                                              |
| `TEST-HOUR-004` |   68 | Cuối phạm vi API thì chỉ dùng số giờ thực có; ngày/chỉ số không hợp lệ trả mảng rỗng.                                    |
| `TEST-HOUR-005` |   77 | Giá trị null vẫn là thiếu dữ liệu; không được coi là 0°C hoặc xác suất mưa 0%.                                           |
