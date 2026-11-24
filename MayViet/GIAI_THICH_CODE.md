# Đọc mã nguồn Mây Việt

Để hiểu cách app chạy, bắt đầu từ `app.py`. Phần trình duyệt bắt đầu ở `src/main.tsx`. Mỗi tệp ở bảng dưới có một ghi chú ngắn về vai trò, kèm vị trí các đoạn cần đọc nếu đó là mã hoặc tệp cấu hình.

Trong VS Code, mở tệp và nhấn **Ctrl+G** để tới số dòng. Dòng có mã như `PY-001` hoặc `CHR-003` là dòng chú thích giải thích đoạn lệnh bên dưới. Nếu số dòng đổi sau khi sửa code, tìm mã ghi chú bằng **Ctrl+Shift+F**.

## Chạy ứng dụng và cấu hình

| Tệp | Công dụng |
| --- | --- |
| [README.md](README.md) | Hướng dẫn mở app, cài thư viện và xem kết quả kiểm thử. |
| [GIAI_THICH_CODE.md](GIAI_THICH_CODE.md) | Tra công dụng của từng tệp và chú thích theo số dòng. |
| [HUONG_DAN_MO_TREN_LAPTOP.txt](HUONG_DAN_MO_TREN_LAPTOP.txt) | Các bước mở bản đã giải nén bằng Python trên Windows. |
| [app.py](#tep-app-py) | Khởi động web cục bộ, phục vụ giao diện và xử lý các API mô hình. |
| [requirements.txt](#tep-requirements-txt) | Danh sách thư viện Python cho ba mô hình dự báo cơ bản. |
| [requirements-ai.txt](#tep-requirements-ai-txt) | Danh sách thư viện bổ sung cho Chronos và Qwen. |
| [.gitignore](#tep-gitignore) | Các đường dẫn Git bỏ qua, chẳng hạn môi trường ảo và bộ nhớ đệm. |
| [index.html](#tep-index-html) | Trang HTML đầu vào của Vite, đặt vị trí để React gắn giao diện. |
| [vite.config.ts](#tep-vite-config-ts) | Cấu hình React, đường dẫn `@/` và proxy đến máy chủ Python. |
| [tsconfig.json](#tep-tsconfig-json) | Các quy tắc để TypeScript kiểm tra mã nguồn. |
| [package.json](#tep-package-json) | Các lệnh phát triển, build, kiểm thử và thư viện phía giao diện. |
| [package-lock.json](#tep-package-lock-json) | Danh sách phiên bản phụ thuộc do npm khóa để các máy cài cùng một bộ. |

## Mô hình và dữ liệu

| Tệp | Công dụng |
| --- | --- |
| [weather_ml.py](#tep-weather-ml-py) | Đọc ERA5, tạo đặc trưng, huấn luyện và dự báo bằng Random Forest. |
| [train_model.py](#tep-train-model-py) | Chạy huấn luyện Random Forest từ terminal, dùng ERA5 trên mạng hoặc CSV đã lưu. |
| [weather_series.py](#tep-weather-series-py) | Dự báo nhiệt độ bằng Holt–Winters cộng tính với chu kỳ 24 giờ. |
| [weather_boosting.py](#tep-weather-boosting-py) | Huấn luyện và dự báo bằng Histogram Gradient Boosting. |
| [weather_chronos.py](#tep-weather-chronos-py) | Nạp Chronos‑2 Small và dự báo trung vị cùng khoảng P10–P90. |
| [weather_assistant.py](#tep-weather-assistant-py) | Chọn số liệu phù hợp với câu hỏi và gọi Qwen chạy trên máy. |
| [time_series_service.py](#tep-time-series-service-py) | Điều phối huấn luyện, kiểm thử, lưu kết quả và gọi dự báo cho ba mô hình bổ sung. |
| [NGUON_API.txt](NGUON_API.txt) | Các dịch vụ cung cấp dữ liệu và cách kiểm tra lời gọi Open-Meteo. |
| [PHUONG_PHAP_RANDOM_FOREST.md](PHUONG_PHAP_RANDOM_FOREST.md) | Cách chuẩn bị dữ liệu, huấn luyện và đọc kết quả Random Forest. |
| [data/history/vn_10p78_106p70.csv](#tep-data-history-vn-10p78-106p70-csv) | Lịch sử ERA5 theo giờ ở khu vực TP.HCM. |
| [data/history/vn_10p78_106p70.source.json](#tep-data-history-vn-10p78-106p70-source-json) | Nguồn, tọa độ, đơn vị và dấu kiểm của CSV lịch sử. |
| [models/vn_10p78_106p70.metrics.json](#tep-models-vn-10p78-106p70-metrics-json) | Thông tin huấn luyện và điểm kiểm thử Random Forest. |
| [models/vn_10p78_106p70.joblib](models/vn_10p78_106p70.joblib) | Mô hình Random Forest đã huấn luyện, lưu ở dạng nhị phân. |
| [models/vn_10p78_106p70.time-series.json](#tep-models-vn-10p78-106p70-time-series-json) | Tham số san bằng và kết quả kiểm thử Holt–Winters. |
| [models/vn_10p78_106p70.gradient-boosting.json](#tep-models-vn-10p78-106p70-gradient-boosting-json) | Điểm kiểm thử, cấu hình và dấu kiểm mô hình Gradient Boosting. |
| [models/vn_10p78_106p70.gradient-boosting.joblib](models/vn_10p78_106p70.gradient-boosting.joblib) | Mô hình Gradient Boosting đã huấn luyện, lưu ở dạng nhị phân. |
| [models/vn_10p78_106p70.chronos.json](#tep-models-vn-10p78-106p70-chronos-json) | Phiên bản checkpoint, sai số và độ bao phủ của khoảng dự báo Chronos. |
| [reports/vn_10p78_106p70_holdout.csv](#tep-reports-vn-10p78-106p70-holdout-csv) | Kết quả từng giờ của Random Forest trên tập kiểm thử. |

## Giao diện và tài nguyên

| Tệp | Công dụng |
| --- | --- |
| [src/main.tsx](#tep-src-main-tsx) | Nạp kiểu giao diện và gắn cây React vào `#root`. |
| [src/components/weather-app.tsx](#tep-src-components-weather-app-tsx) | Trang chính, tìm địa điểm, cài đặt và các mục ở thanh điều hướng. |
| [src/components/hourly-forecast.tsx](#tep-src-components-hourly-forecast-tsx) | Biểu đồ cùng thẻ xem dự báo từng giờ. |
| [src/components/random-forest-panel.tsx](#tep-src-components-random-forest-panel-tsx) | Khung huấn luyện, dự báo và xem kết quả Random Forest. |
| [src/components/time-series-panel.tsx](#tep-src-components-time-series-panel-tsx) | Khung dùng chung cho Holt–Winters, Gradient Boosting và Chronos. |
| [src/components/weather-assistant-panel.tsx](#tep-src-components-weather-assistant-panel-tsx) | Khung chuẩn bị Qwen, gửi câu hỏi và hiển thị câu trả lời. |
| [src/lib/weather.ts](#tep-src-lib-weather-ts) | Kiểu dữ liệu, đổi đơn vị, mã thời tiết và ghép các mốc theo giờ. |
| [src/lib/weather-client.ts](#tep-src-lib-weather-client-ts) | Lấy dữ liệu Open-Meteo, lưu cache và chuẩn bị đầu vào dự báo. |
| [src/lib/ml-client.ts](#tep-src-lib-ml-client-ts) | Kiểu dữ liệu và hàm gửi yêu cầu đến API cục bộ của Python. |
| [src/index.css](#tep-src-index-css) | Bố cục, màu, kiểu chữ và các quy tắc giao diện chung. |
| [src/glass-update.css](#tep-src-glass-update-css) | Hiệu ứng nền kính mờ và một số điều chỉnh bố cục. |
| [src/random-forest.css](#tep-src-random-forest-css) | Kiểu hiển thị khung Random Forest và biểu đồ so sánh. |
| [src/time-series.css](#tep-src-time-series-css) | Kiểu hiển thị chung và màu riêng của ba khung dự báo bổ sung. |
| [src/weather-assistant.css](#tep-src-weather-assistant-css) | Bố cục ô nhập, nút thao tác và vùng câu trả lời Qwen. |
| [public/favicon.svg](#tep-public-favicon-svg) | Biểu tượng Mây Việt hiện trên tab trình duyệt. |
| [public/manifest.webmanifest](#tep-public-manifest-webmanifest) | Tên, màu và biểu tượng khi mở ứng dụng web từ màn hình chính. |
| [public/fonts/OFL.txt](public/fonts/OFL.txt) | Văn bản giấy phép font Manrope. |
| [public/fonts/manrope-latin.woff2](public/fonts/manrope-latin.woff2) | Tệp font Manrope nén cho nhóm ký tự Latin cơ bản. |
| [public/fonts/manrope-vietnamese.woff2](public/fonts/manrope-vietnamese.woff2) | Tệp font Manrope nén chứa nhóm ký tự tiếng Việt. |

## Kiểm thử

| Tệp | Công dụng |
| --- | --- |
| [tests/test_app.py](#tep-tests-test-app-py) | Kiểm tra HTTP, đường dẫn tĩnh, cách chọn cổng và khởi chạy Python. |
| [tests/test_weather_ml.py](#tep-tests-test-weather-ml-py) | Kiểm tra dữ liệu, mô hình Random Forest và các API dự báo cục bộ. |
| [tests/test_weather_series.py](#tep-tests-test-weather-series-py) | Kiểm tra Holt–Winters, các mốc so sánh và việc chỉ dùng dữ liệu quá khứ. |
| [tests/test_weather_boosting.py](#tep-tests-test-weather-boosting-py) | Kiểm tra Gradient Boosting trên cùng mốc đánh giá với Random Forest. |
| [tests/test_weather_chronos.py](#tep-tests-test-weather-chronos-py) | Kiểm tra đầu vào, phân vị và cách tách các cửa sổ dự báo Chronos. |
| [tests/test_weather_assistant.py](#tep-tests-test-weather-assistant-py) | Kiểm tra cách chọn mốc thời tiết, chuẩn bị Qwen và đối chiếu lời khuyên về mưa. |
| [tests/weather-client.test.mjs](#tep-tests-weather-client-test-mjs) | Kiểm tra các yêu cầu Open-Meteo, bộ nhớ đệm, tìm kiếm và giới hạn 429. |
| [tests/hourly-timeline.test.mjs](#tep-tests-hourly-timeline-test-mjs) | Kiểm tra mốc hiện tại, các giờ qua nửa đêm và giá trị bị thiếu. |
| [tests/ml-context.test.mjs](#tep-tests-ml-context-test-mjs) | Kiểm tra cửa sổ dữ liệu đưa vào dự báo và việc loại các giờ tương lai. |

## Tệp trong dist

`dist/` là bản Vite tạo để `app.py` phục vụ ngay. Khi muốn theo dõi một dòng giao diện, mở mã trong `src/`. Các tệp nhị phân và kết quả build được ghi công dụng ở đây để dễ tìm.

| Tệp | Công dụng |
| --- | --- |
| [dist/assets/index-BNWFZNt2.css](dist/assets/index-BNWFZNt2.css) | Các kiểu CSS đã gộp và tối ưu khi build. |
| [dist/assets/index-Ciq8br2b.js](dist/assets/index-Ciq8br2b.js) | Gói JavaScript và thư viện của trang đã build. |
| [dist/favicon.svg](dist/favicon.svg) | Bản sao của `public/favicon.svg` để trình duyệt tải trực tiếp. |
| [dist/fonts/manrope-latin.woff2](dist/fonts/manrope-latin.woff2) | Bản sao của `public/fonts/manrope-latin.woff2` để trình duyệt tải trực tiếp. |
| [dist/fonts/manrope-vietnamese.woff2](dist/fonts/manrope-vietnamese.woff2) | Bản sao của `public/fonts/manrope-vietnamese.woff2` để trình duyệt tải trực tiếp. |
| [dist/fonts/OFL.txt](dist/fonts/OFL.txt) | Bản sao của `public/fonts/OFL.txt` để trình duyệt tải trực tiếp. |
| [dist/index.html](dist/index.html) | Trang HTML mà `app.py` trả về, chứa đường dẫn tới JS và CSS sau build. |
| [dist/manifest.webmanifest](dist/manifest.webmanifest) | Bản sao của `public/manifest.webmanifest` để trình duyệt tải trực tiếp. |

## Tra theo dòng

<a id="tep-app-py"></a>
### [app.py](app.py)

Khởi động web cục bộ, phục vụ giao diện và xử lý các API mô hình.

| Ghi chú | Dòng | Đoạn code làm gì |
| --- | ---: | --- |
| `PY-073` | 10 | File này mở Mây Việt trên localhost, phục vụ giao diện đã build và điều phối API mô hình. |
| `PY-001` | 11 | Để chú thích kiểu được xử lý muộn, thuận tiện khi hai lớp tham chiếu nhau. |
| `PY-002` | 15 | argparse đọc các tùy chọn như --port, --no-open và --verbose từ terminal. |
| `PY-003` | 17 | errno giúp nhận biết lỗi cổng đang được chương trình khác sử dụng. |
| `PY-004` | 20 | mimetypes tìm Content-Type cho những loại tài nguyên chưa có trong bảng riêng. |
| `PY-005` | 23 | socket cung cấp tùy chọn giữ cổng độc quyền trên Windows, tránh hai ứng dụng dùng nhầm cùng cổng. |
| `PY-006` | 25 | sys đọc phiên bản Python, in lỗi ra stderr và trả mã kết thúc chương trình. |
| `PY-007` | 27 | Timer mở trình duyệt ở luồng phụ để máy chủ không bị chặn khi mở ứng dụng. |
| `PY-008` | 29 | webbrowser gọi trình duyệt mặc định của Windows, macOS hoặc Linux. |
| `PY-009` | 31 | HTTPStatus đặt tên rõ ràng cho mã HTTP như 200, 400, 403, 404 và 405. |
| `PY-010` | 33 | Handler xử lý từng yêu cầu; ThreadingHTTPServer phục vụ nhiều file đồng thời. |
| `PY-011` | 36 | Path xử lý đường dẫn có dấu/khoảng trắng; PurePosixPath đọc đường dẫn trong URL. |
| `PY-012` | 38 | Tách phần đường dẫn khỏi query và giải mã các ký tự phần trăm trong URL. |
| `PY-013` | 43 | Lấy vị trí thật của app.py, không phụ thuộc thư mục đang đứng trong terminal. |
| `PY-014` | 45 | Tệp tĩnh chỉ được đọc trong dist. Các đường /api/ được chuyển đến dịch vụ riêng. |
| `PY-015` | 47 | Chỉ lắng nghe trên máy hiện tại; không mở máy chủ ra mạng LAN hoặc Internet. |
| `PY-016` | 49 | Giữ cổng cũ để yêu thích/cài đặt tại localhost:5173 tiếp tục được trình duyệt nhận. |
| `PY-017` | 51 | Nếu cổng bận, thử thêm 10 cổng tiếp theo thay vì đóng ứng dụng ngay. |
| `PY-074` | 53 | Giới hạn dung lượng JSON trước khi đọc thân yêu cầu để tránh giữ quá nhiều dữ liệu trong bộ nhớ. |
| `PY-075` | 55 | Mỗi đường dẫn cố định trỏ đến một phương thức HTTP, nhóm dịch vụ và thao tác được phép. |
| `PY-018` | 75 | Khai báo MIME rõ cho JS/CSS/font để tránh Windows nhận sai kiểu JavaScript. |
| `PY-019` | 95 | Bộ xử lý gửi giao diện và nhận yêu cầu mô hình. Trình duyệt vẫn gọi Open-Meteo để lấy dự báo thời tiết trực tiếp. |
| `PY-020` | 97 | Chú thích kiểu cho thuộc tính server có sẵn của lớp cha, giúp IDE gợi ý chính xác. |
| `PY-021` | 100 | Tên máy chủ dùng trong HTTP header; không thay đổi dữ liệu thời tiết. |
| `PY-022` | 103 | Mỗi kết nối có thời gian chờ để kết nối bỏ dở không giữ luồng quá lâu. |
| `PY-023` | 108 | Header chung cho cả phản hồi thành công và lỗi; gọi lớp cha để kết thúc header. |
| `PY-024` | 110 | Không cache file giao diện cũ: sau khi build lại, tải trang sẽ dùng file mới. |
| `PY-025` | 112 | Yêu cầu trình duyệt dùng đúng Content-Type, không tự đoán kiểu nội dung. |
| `PY-026` | 116 | GET đọc trạng thái mô hình, xuất CSV hoặc gửi tệp tĩnh theo đường dẫn. |
| `PY-027` | 121 | HEAD chỉ trả header, không gửi nội dung; hữu ích khi kiểm tra tài nguyên. |
| `PY-028` | 126 | POST nhận dữ liệu huấn luyện, dự báo, chuẩn bị Qwen hoặc câu hỏi thời tiết. |
| `PY-076` | 131 | Trả 405 khi phương thức HTTP không phù hợp, kèm danh sách phương thức có thể dùng. |
| `PY-029` | 138 | Dùng lại cùng một hàm cho những phương thức không hỗ trợ, tránh lặp code. |
| `PY-077` | 141 | Chỉ import và khởi tạo dịch vụ Random Forest khi được gọi lần đầu. Dùng khóa để các luồng dùng chung một bản. |
| `PY-078` | 150 | Tạo dịch vụ Holt–Winters với lịch sử và báo cáo Random Forest làm nguồn đối chiếu. |
| `PY-079` | 159 | Chọn dịch vụ theo nhóm trong bảng API và giữ lại đối tượng đã tạo để dùng cho lần gọi sau. |
| `PY-080` | 170 | Đặt mặc định tải Hugging Face trước khi các thư viện AI được nạp. Giữ giá trị người chạy đã cấu hình nếu có. |
| `PY-081` | 174 | Qwen có dịch vụ hỏi đáp riêng. Với hai mô hình còn lại, truyền hàm kiểm thử và hàm dự báo vào dịch vụ chung. |
| `PY-082` | 202 | Mã hóa phản hồi JSON thành UTF-8. Giữ nguyên tiếng Việt và từ chối xuất NaN hoặc vô cực. |
| `PY-083` | 207 | Kiểm tra kiểu nội dung, giới hạn kích thước và chỉ nhận đối tượng JSON cho các yêu cầu POST. |
| `PY-084` | 227 | Phân biệt đường dẫn API với tệp tĩnh. Sau khi kiểm tra phương thức, chuyển yêu cầu tới đúng dịch vụ. |
| `PY-085` | 241 | API chỉ chấp nhận tên máy cục bộ. Nếu trình duyệt gửi Origin, giá trị đó phải khớp trang đang chạy. |
| `PY-086` | 248 | POST đọc tham số từ JSON. GET đọc từ chuỗi truy vấn phía sau đường dẫn. |
| `PY-087` | 255 | Hỏi đáp nhận cả nội dung câu hỏi và dự báo nguồn. Các mô hình nhiệt độ làm việc theo tọa độ và giờ đầu vào. |
| `PY-088` | 263 | Trả CSV làm tệp tải về. Tên tệp được tạo bởi dịch vụ Random Forest. |
| `PY-089` | 272 | Trả mã HTTP theo loại lỗi để giao diện phân biệt dữ liệu sai, thư viện thiếu và lỗi xử lý. |
| `PY-030` | 289 | Đổi URL thành file hợp lệ dưới dist; trả None nếu đã gửi phản hồi lỗi. |
| `PY-031` | 292 | Query như ?v=1 không thuộc tên file; strict từ chối mã UTF-8 sai. |
| `PY-032` | 294 | Chặn ký tự NUL và dấu gạch chéo Windows để URL không bị hiểu thành đường dẫn khác. |
| `PY-033` | 298 | Không cho URL có .. đi ngược thư mục để đọc file bên ngoài dist. |
| `PY-034` | 302 | Bỏ dấu / đầu URL rồi ghép với thư mục giao diện; resolve xử lý cả liên kết tượng trưng. |
| `PY-035` | 304 | Kiểm tra lại sau resolve để chặn cả symlink/junction trỏ ra ngoài dist. |
| `PY-036` | 308 | URL thư mục như / dùng index.html; không hiển thị danh sách file. |
| `PY-037` | 311 | index.html cũng phải ở trong dist, kể cả khi là symlink. |
| `PY-038` | 315 | Chỉ chấp nhận file thật; thư mục không có index và URL lạ trả 404. |
| `PY-039` | 320 | URL/đường dẫn hỏng là lỗi yêu cầu; không làm dừng toàn bộ máy chủ. |
| `PY-040` | 325 | Hàm dùng chung cho GET/HEAD, giúp hai cách lấy file có header nhất quán. |
| `PY-041` | 328 | Nếu _requested_file đã trả lỗi thì dừng, tránh gửi thêm một phản hồi nữa. |
| `PY-042` | 332 | Đọc bytes để giữ nguyên font/ảnh/JavaScript; không giải mã nhầm file nhị phân. |
| `PY-043` | 335 | File có thể vừa bị xóa hoặc không đọc được sau bước kiểm tra; trả 404. |
| `PY-044` | 338 | Ưu tiên bảng MIME riêng, rồi thư viện Python; loại lạ dùng octet-stream. |
| `PY-045` | 342 | 200 nghĩa là tải thành công; Content-Length là số byte, không phải số ký tự. |
| `PY-090` | 345 | Dùng chung một đường gửi phản hồi cho HTML, tài nguyên và API. Với HEAD chỉ gửi tiêu đề. |
| `PY-046` | 354 | HEAD có cùng kích thước/header với GET nhưng không gửi thân phản hồi. |
| `PY-047` | 359 | Người dùng đóng tab hoặc hủy tải: bỏ qua kết nối đó, giữ ứng dụng hoạt động. |
| `PY-048` | 362 | Mặc định không in mỗi request; --verbose bật log để xem file nào lỗi khi gỡ rối. |
| `PY-091` | 368 | Mang theo mã HTTP và lời giải thích để bộ định tuyến trả đúng lỗi. |
| `PY-049` | 375 | ThreadingHTTPServer cho phép trình duyệt tải JS, CSS và font đồng thời. |
| `PY-050` | 377 | Luồng phục vụ không ngăn chương trình thoát sau khi người dùng bấm Ctrl+C. |
| `PY-051` | 380 | Trên Windows không bật SO_REUSEADDR vì ý nghĩa của nó khác Unix; cổng bận phải chuyển cổng. |
| `PY-052` | 385 | Nối handler với thư mục giao diện; địa chỉ luôn cố định là HOST cục bộ. |
| `PY-092` | 389 | Lưu dịch vụ mô hình dùng chung cho các yêu cầu. RLock cho phép tạo dịch vụ này từ dịch vụ khác đã giữ khóa. |
| `PY-053` | 396 | Windows đặt cờ độc quyền TRƯỚC bind; các hệ điều hành khác dùng cách bind của lớp cha. |
| `PY-054` | 404 | argparse gọi hàm này để kiểm tra --port trước khi khởi tạo máy chủ. |
| `PY-055` | 410 | Để lại 10 cổng phía sau cho cơ chế dự phòng; cổng TCP lớn nhất là 65535. |
| `PY-056` | 416 | Thử bind thật thay vì chỉ dò cổng, tránh khoảng trống giữa lúc dò và lúc mở server. |
| `PY-057` | 418 | Dừng sớm với hướng dẫn rõ nếu chỉ chép app.py mà thiếu giao diện đi kèm. |
| `PY-058` | 424 | Kiểm tra cả lời gọi trực tiếp từ Python, không chỉ tham số qua terminal. |
| `PY-059` | 428 | range dừng trước đầu mút nên +1 để thử cả cổng mặc định và 10 cổng tiếp theo. |
| `PY-060` | 433 | EADDRINUSE/10048 là cổng bận; Windows 10013 cũng có thể là cổng được giữ riêng/độc quyền. |
| `PY-061` | 437 | Thử hết khoảng cổng vẫn bận thì báo lỗi để chọn --port khác; không ghi đè chương trình đang chạy. |
| `PY-062` | 442 | Mở trình duyệt là tiện ích; nếu không mở tự động được, server vẫn chạy bình thường. |
| `PY-063` | 449 | Lỗi mở trình duyệt không phải lỗi API thời tiết; in URL để người dùng tự mở. |
| `PY-064` | 453 | Đóng gói thao tác khởi chạy trong main để import app trong test không tự bật server. |
| `PY-065` | 455 | Kiểm tra phiên bản Python tối thiểu trước khi khởi động. |
| `PY-066` | 459 | Giao diện dòng lệnh có --help để người dùng xem cách sử dụng mà không cần mở code. |
| `PY-067` | 467 | Lỗi thiếu giao diện, cổng hoặc quyền mở socket được báo ngắn gọn, không in traceback khó đọc. |
| `PY-068` | 472 | Dùng cổng đã bind thành công; có thể khác --port khi cổng được yêu cầu đang bận. |
| `PY-069` | 482 | Socket đã sẵn sàng; mở trình duyệt sau 0,4 giây trong lúc vòng phục vụ bắt đầu. |
| `PY-070` | 487 | Vòng lặp nhận yêu cầu cho đến Ctrl+C; khoảng poll ngắn giúp phản hồi dừng nhanh. |
| `PY-071` | 492 | Dọn timer và socket dù dừng bình thường hay có lỗi; không gọi shutdown từ chính luồng serve_forever. |
| `PY-072` | 499 | Chỉ chạy main khi gọi python app.py; SystemExit trả mã kết thúc cho terminal. |

<a id="tep-requirements-txt"></a>
### [requirements.txt](requirements.txt)

Danh sách thư viện Python cho ba mô hình dự báo cơ bản.

| Ghi chú | Dòng | Đoạn code làm gì |
| --- | ---: | --- |
| `DEP-000` | 1 | Các thư viện cần để chạy Random Forest, Holt–Winters và Gradient Boosting. |
| `DEP-001` | 2 | NumPy xử lý mảng số, SciPy hỗ trợ tối ưu và scikit-learn cung cấp mô hình cây. Các bản này khớp với mô hình TP.HCM đi kèm. |
| `DEP-002` | 6 | Với Python 3.10 hoặc 3.11, pip chọn bản tương thích theo khoảng phiên bản này. |
| `DEP-003` | 10 | Joblib lưu và nạp mô hình cây đã huấn luyện. |

<a id="tep-requirements-ai-txt"></a>
### [requirements-ai.txt](requirements-ai.txt)

Danh sách thư viện bổ sung cho Chronos và Qwen.

| Ghi chú | Dòng | Đoạn code làm gì |
| --- | ---: | --- |
| `AIDEP-000` | 1 | Cài thêm các thư viện để chạy Chronos‑2 Small và Qwen trên Python 3.12 hoặc 3.13. |
| `AIDEP-001` | 2 | Dùng chung các phiên bản thư viện của phần dự báo cơ bản. |
| `AIDEP-002` | 4 | PyTorch thực hiện phép tính cho Chronos và Qwen. |
| `AIDEP-003` | 6 | Thư viện Chronos nạp checkpoint và tạo các phân vị dự báo nhiệt độ. |
| `AIDEP-004` | 8 | Transformers nạp tokenizer và mô hình Qwen để xử lý câu hỏi. |

<a id="tep-gitignore"></a>
### [.gitignore](.gitignore)

Các đường dẫn Git bỏ qua, chẳng hạn môi trường ảo và bộ nhớ đệm.

| Ghi chú | Dòng | Đoạn code làm gì |
| --- | ---: | --- |
| `IGNORE-000` | 1 | Danh sách tệp và thư mục Git bỏ qua khi theo dõi dự án. |
| `IGNORE-001` | 2 | Thư viện npm, kết quả build và dữ liệu tạm của TypeScript được tạo lại khi cần. |
| `IGNORE-002` | 6 | Bỏ qua thiết lập riêng của máy và tệp log sinh ra khi dùng npm. |
| `IGNORE-003` | 11 | Bỏ qua bytecode và môi trường ảo Python. |
| `IGNORE-004` | 15 | Trọng số Chronos và Qwen tải về nằm trong cache cục bộ. |

<a id="tep-index-html"></a>
### [index.html](index.html)

Trang HTML đầu vào của Vite, đặt vị trí để React gắn giao diện.

| Ghi chú | Dòng | Đoạn code làm gì |
| --- | ---: | --- |
| `HTML-000` | 1 | Vỏ HTML của ứng dụng; giao diện chính được React render từ src/main.tsx. |
| `HTML-001` | 3 | Khai báo ngôn ngữ tiếng Việt cho trình đọc màn hình và trình duyệt. |
| `HTML-002` | 6 | UTF-8 giúp tiếng Việt có dấu hiển thị đúng. |
| `HTML-003` | 8 | Độ rộng theo màn hình thiết bị để CSS responsive hoạt động. |
| `HTML-009` | 10 | Đặt màu thanh trình duyệt, mô tả ngắn của trang và tùy chọn mở từ màn hình chính trên iOS. |
| `HTML-004` | 17 | Biểu tượng tab lấy từ public/favicon.svg; public được Vite chép vào dist. |
| `HTML-005` | 19 | Mô tả tên/icon/cách mở của ứng dụng web; không tạo chế độ offline khi chưa có service worker. |
| `HTML-006` | 21 | Tên xuất hiện trên tab trình duyệt; có thể sửa thương hiệu tại đây. |
| `HTML-007` | 25 | React sẽ đưa toàn bộ giao diện vào phần tử này; phải khớp getElementById trong main.tsx. |
| `HTML-008` | 27 | Vite xử lý TSX từ điểm vào này; mở bằng dev server, không nhấp đúp HTML dưới dạng file://. |

<a id="tep-vite-config-ts"></a>
### [vite.config.ts](vite.config.ts)

Cấu hình React, đường dẫn `@/` và proxy đến máy chủ Python.

| Ghi chú | Dòng | Đoạn code làm gì |
| --- | ---: | --- |
| `VITE-000` | 1 | CẤU HÌNH CÔNG CỤ: Vite phục vụ code lúc phát triển và tạo bản dist khi build. |
| `VITE-001` | 2 | defineConfig cung cấp kiểu và gợi ý thuộc tính cấu hình Vite. |
| `VITE-002` | 4 | Plugin biên dịch JSX/TSX và cập nhật giao diện nhanh khi sửa code React. |
| `VITE-003` | 6 | Đổi đường dẫn alias sang đường dẫn hệ điều hành. |
| `VITE-008` | 9 | Đọc cổng của app.py để Vite gửi các yêu cầu mô hình về đúng máy chủ khi phát triển. |
| `VITE-004` | 14 | Bật hỗ trợ React cho Vite. |
| `VITE-005` | 16 | Cho phép import @/lib/weather thay cho các đường dẫn ../../lib/weather dài. |
| `VITE-006` | 18 | Dev server dùng cổng cố định 5173 trên laptop; nếu bận thì báo lỗi để người dùng xử lý hoặc chọn --port khác. |
| `VITE-009` | 23 | Chuyển tiếp /api khi có cổng Python và giữ Host gốc để máy chủ kiểm tra Origin. |

<a id="tep-tsconfig-json"></a>
### [tsconfig.json](tsconfig.json)

Các quy tắc để TypeScript kiểm tra mã nguồn.

| Dòng | Nội dung |
| ---: | --- |
| 2 | `compilerOptions` — Nhóm các thiết lập cho trình kiểm tra TypeScript. |
| 3, 4 | `target`, `lib` — Chuẩn JavaScript và các API trình duyệt được khai báo. |
| 5, 6, 7 | `module`, `moduleResolution`, `jsx` — Cách tìm module và xử lý JSX khi build bằng Vite. |
| 8, 9, 10 | `strict`, `noEmit`, `isolatedModules` — Kiểm tra kiểu chặt, kiểm tra từng module và để Vite tạo bản build. |
| 11, 12, 13 | `esModuleInterop`, `skipLibCheck`, `resolveJsonModule` — Các tùy chọn tương thích module và nhập tệp JSON. |
| 14, 15, 16 | `types`, `baseUrl`, `paths` — Kiểu dữ liệu của Vite và Node, đường dẫn gốc và bí danh `@/`. |
| 18 | `include` — Giới hạn phạm vi kiểm tra ở `src` và cấu hình Vite. |

<a id="tep-package-json"></a>
### [package.json](package.json)

Các lệnh phát triển, build, kiểm thử và thư viện phía giao diện.

| Dòng | Nội dung |
| ---: | --- |
| 2, 3, 4, 5, 6 | `name`, `version`, `private`, `type`, `description` — Tên dự án, phiên bản, mô tả và chế độ ES module. `private` giữ gói ở phạm vi dự án. |
| 7 | `engines` — Phiên bản Node.js để dùng công cụ frontend. |
| 10 | `scripts` — Các lệnh mở Vite, build, xem thử, kiểm thử và khởi chạy Python. |
| 11, 13, 12, 14, 15 | `dev`, `preview`, `build`, `test`, `start` — Mở chế độ phát triển, xem thử bản build, tạo `dist/`, chạy kiểm thử JS và mở `app.py`. |
| 17, 23 | `dependencies`, `devDependencies` — Thư viện của giao diện và bộ công cụ để phát triển, kiểm tra kiểu, build. |

<a id="tep-package-lock-json"></a>
### [package-lock.json](package-lock.json)

Danh sách phiên bản phụ thuộc do npm khóa để các máy cài cùng một bộ.

| Dòng | Nội dung |
| ---: | --- |
| 2–6 | Thông tin dự án và phiên bản định dạng lockfile. |
| 7–27 | Mục gốc liệt kê thư viện trực tiếp của dự án. |
| 28–1419 | Các mục `node_modules/...` ghi phiên bản cài, nguồn tải, dấu kiểm và phụ thuộc của từng thư viện. |

<a id="tep-weather-ml-py"></a>
### [weather_ml.py](weather_ml.py)

Đọc ERA5, tạo đặc trưng, huấn luyện và dự báo bằng Random Forest.

| Ghi chú | Dòng | Đoạn code làm gì |
| --- | ---: | --- |
| `RF-028` | 7 | File này lấy lịch sử ERA5, tạo đặc trưng, huấn luyện Random Forest và cung cấp các hàm dùng chung cho mô hình nhiệt độ. |
| `RF-001` | 25 | Các thư viện ML được cài qua requirements.txt. app.py chỉ import module này khi gọi một API dùng mô hình. |
| `RF-002` | 37 | Thứ tự tên phải khớp tuyệt đối với vector trong _features_at; không đưa nhiệt độ tương lai vào đầu vào. |
| `RF-003` | 51 | Tọa độ được kiểm tra và làm tròn 2 chữ số (~1 km); mỗi khu vực có mô hình riêng, không dùng model TP.HCM cho Hà Nội. |
| `RF-004` | 62 | Chuỗi API đang dùng giờ Việt Nam; chuyển về datetime không tz nhưng luôn hiểu là GMT+7. |
| `RF-029` | 74 | Xuất mốc giờ theo định dạng có phút, thống nhất với dữ liệu và biểu đồ phía giao diện. |
| `RF-005` | 79 | Thiếu/NaN/vô cực/ngoài giới hạn thì giữ None; không thay bằng số 0 hoặc nội suy bằng dữ liệu tương lai. |
| `RF-006` | 90 | Kiểm tra các mảng cùng chiều dài, thời gian tăng đều và không trùng. Khoảng thiếu giờ được giữ để loại cửa sổ liên quan. |
| `RF-007` | 112 | Một mẫu dùng 25 mốc từ t-24 đến t. Tra bằng timestamp để khoảng trống không bị hiểu nhầm là trễ đúng một giờ. |
| `RF-008` | 120 | Giờ/ngày của mốc cần dự đoán là lịch đã biết, không phải dữ liệu thời tiết tương lai. |
| `RF-009` | 136 | X chỉ dùng quá khứ/hiện tại; y_delta = T(t+1)-T(t). Dự báo cuối cùng cộng delta trở lại T(t). |
| `RF-010` | 155 | Đánh giá trên nhiệt độ °C, không phải delta; R² không có ý nghĩa khi nhãn gần như không đổi nên trả None. |
| `RF-011` | 166 | Có random_state cố định, giới hạn độ sâu và min_samples_leaf để giảm quá khớp; tối đa 4 luồng CPU. |
| `RF-012` | 174 | Chia 80/20 theo thời gian, bỏ một mẫu ở biên. Không shuffle, không chọn tham số bằng tập kiểm thử. |
| `RF-013` | 185 | Model đánh giá chỉ học phần train. Baseline Persistence luôn đoán T(t+1)=T(t). |
| `RF-014` | 198 | Sau khi chốt kết quả holdout, fit model triển khai trên toàn bộ lịch sử. Không tính lại điểm bằng model đã học holdout. |
| `RF-015` | 226 | Ghi vào tệp tạm rồi thay tệp đích bằng thao tác nguyên tử để người đọc không thấy nội dung đang được ghi. |
| `RF-030` | 237 | Đổi dữ liệu báo cáo thành JSON UTF-8 trước khi ghi tệp nguyên tử. |
| `RF-016` | 242 | CSV có UTF-8 BOM để tên tiếng Việt đọc được bằng Excel; các số liệu gốc vẫn giữ đơn vị °C/kmh/hPa. |
| `RF-031` | 251 | Dịch vụ giữ trạng thái tác vụ và cache các tệp Random Forest theo tọa độ. |
| `RF-017` | 253 | Chỉ dùng các đường dẫn tự dựng theo tọa độ. RAM giữ tối đa 4 model; các model khác còn trên đĩa. |
| `RF-032` | 261 | Tạo đường dẫn CSV lịch sử, metadata nguồn, mô hình joblib, báo cáo và CSV kiểm thử của một địa điểm. |
| `RF-018` | 271 | Lịch sử lưu cục bộ có thể dùng để huấn luyện offline; không đọc pickle từ URL hoặc file người ngoài cung cấp. |
| `RF-033` | 284 | Ghi dữ liệu lịch sử cùng mã kiểm tra SHA-256 và số dòng để phát hiện tệp đã bị thay đổi. |
| `RF-019` | 292 | API cố định ERA5, 365 ngày, kết thúc trước hiện tại 7 ngày để tránh vùng lịch sử chưa hoàn tất. |
| `RF-034` | 303 | Đọc thời điểm được phép gọi lại nguồn lịch sử. Lưu giới hạn vào đĩa để lần chạy sau vẫn biết phải chờ. |
| `RF-020` | 325 | Tôn trọng Retry-After dạng giây hoặc HTTP-date, không tự gửi lại liên tục. |
| `RF-021` | 352 | Artifact chứa model thật và kết quả đánh giá; metrics JSON/holdout CSV là bản đọc được cho báo cáo. |
| `RF-035` | 365 | Xóa bản giữ trong RAM sau khi ghi mô hình mới để yêu cầu sau dùng đúng tệp hiện tại. |
| `RF-022` | 369 | Không nạp artifact khác phiên bản sklearn/NumPy/joblib: refit CSV để tránh pickle không tương thích. |
| `RF-036` | 374 | Dấu thời gian sửa tệp cho biết có thể dùng bản trong RAM hay phải đọc lại từ đĩa. |
| `RF-037` | 385 | Đối chiếu mã kiểm tra với báo cáo trước khi mở joblib, rồi xác nhận đúng loại mô hình. |
| `RF-023` | 398 | API trạng thái đọc kết quả đã có. Chỉ yêu cầu huấn luyện mới khởi động tác vụ và lấy lịch sử nếu cần. |
| `RF-024` | 419 | Khóa ngăn hai lượt train cùng lúc. Tác vụ chạy nền nên trang và dự báo API vẫn sử dụng được. |
| `RF-038` | 435 | Chạy huấn luyện nền. Có thể ưu tiên lịch sử cục bộ khi cần bộ kiểm thử cho các mô hình so sánh. |
| `RF-025` | 449 | Nếu nguồn trực tuyến lỗi, dùng lịch sử thật đã lưu. |
| `RF-039` | 454 | Tạo mô hình, lưu kết quả và trả trạng thái sẵn sàng. Nhánh xử lý lỗi bên dưới giữ thông báo để người dùng đọc. |
| `RF-026` | 469 | Chỉ giữ dữ liệu <= as_of trước khi tạo đặc trưng. Thay giá trị tương lai trong request không đổi kết quả RF. |
| `RF-027` | 493 | Xuất CSV đúng model đang chọn; endpoint không nhận tên đường dẫn từ trình duyệt. |

<a id="tep-train-model-py"></a>
### [train_model.py](train_model.py)

Chạy huấn luyện Random Forest từ terminal, dùng ERA5 trên mạng hoặc CSV đã lưu.

| Ghi chú | Dòng | Đoạn code làm gì |
| --- | ---: | --- |
| `RF-CLI-003` | 5 | File này chạy huấn luyện Random Forest bằng dòng lệnh. Dùng cờ offline để đọc lịch sử ERA5 đã lưu. |
| `RF-CLI-001` | 11 | Chỉ import ML sau khi đọc tham số, để --help vẫn hoạt động nếu chưa cài thư viện. |
| `RF-CLI-004` | 13 | Mặc định dùng tọa độ TP.HCM. Người chạy có thể chọn tọa độ khác bằng tham số dòng lệnh. |
| `RF-CLI-005` | 21 | Lấy đường dẫn lưu dữ liệu và mô hình theo thư mục chứa mã nguồn dù terminal đang mở ở chỗ khác. |
| `RF-CLI-002` | 24 | Cùng một pipeline như giao diện: tạo đặc trưng, holdout theo thời gian, refit và lưu model. |
| `RF-CLI-006` | 29 | In các chỉ số, số giờ kiểm thử và vị trí tệp mô hình để dùng trong báo cáo hoặc kiểm tra nhanh. |
| `RF-CLI-007` | 34 | Trả mã lỗi 1 nếu thiếu thư viện hoặc không huấn luyện được. Mã 0 ở trên báo lệnh hoàn tất. |
| `RF-CLI-008` | 43 | Chỉ bắt đầu huấn luyện khi chạy file trực tiếp. Import file sẽ không khởi động tác vụ. |

<a id="tep-weather-series-py"></a>
### [weather_series.py](weather_series.py)

Dự báo nhiệt độ bằng Holt–Winters cộng tính với chu kỳ 24 giờ.

| Ghi chú | Dòng | Đoạn code làm gì |
| --- | ---: | --- |
| `HW-001` | 3 | File này cài đặt Holt–Winters cộng tính cho mục Time Series và so sánh kết quả với Random Forest. |
| `HW-002` | 17 | Chu kỳ nhiệt độ tính theo ngày. Cần ít nhất ba ngày liên tiếp và dùng tối đa bảy ngày. |
| `HW-003` | 24 | Lùi từng giờ từ mốc đầu vào, dừng nếu thiếu dữ liệu rồi đảo danh sách sang thứ tự thời gian tăng dần. |
| `HW-004` | 38 | Chạy công thức Holt–Winters trên nhiều cửa sổ cùng độ dài. Alpha, beta và gamma là hệ số của mức, xu hướng và chu kỳ. |
| `HW-005` | 43 | Hai ngày đầu dùng để ước lượng mức nhiệt, xu hướng theo giờ và độ chênh của từng giờ trong ngày. |
| `HW-006` | 51 | Mỗi số đo mới cập nhật mức và xu hướng, sau đó cập nhật đúng vị trí giờ trong chu kỳ 24 giờ. |
| `HW-007` | 60 | Dự báo giờ kế tiếp bằng mức hiện tại cộng xu hướng một giờ và thành phần chu kỳ của giờ đích. |
| `HW-008` | 64 | Gom các mốc dự báo có cùng số giờ đầu vào để đưa vào một mảng NumPy. Mỗi cửa sổ kết thúc trước giờ đích. |
| `HW-009` | 75 | Chỉ lấy nhãn tới mốc cho phép khi tối ưu tham số. Ưu tiên cửa sổ đủ bảy ngày nếu có. |
| `HW-010` | 85 | Tổng bình phương sai số là mục tiêu tối ưu. Hàm tối ưu giới hạn mỗi hệ số trong khoảng 0 đến 1. |
| `HW-011` | 91 | Giữ bộ tham số ban đầu nếu thuật toán tối ưu không cho kết quả hữu hạn hoặc làm sai số tăng. |
| `HW-012` | 97 | Kiểm lại các mốc ERA5 của Random Forest rồi so sánh trên những mốc đủ đầu vào cho cả hai mô hình. |
| `HW-013` | 110 | Dùng dữ liệu huấn luyện để chọn tham số chấm điểm. Tham số dự báo trực tiếp được chọn lại từ toàn bộ dữ liệu đã có. |
| `HW-014` | 117 | Mỗi dòng đối chiếu gồm nhiệt độ thực và ba dự báo. Tính điểm trên toàn bộ phần giao, chỉ giữ 72 dòng cuối cho biểu đồ. |
| `HW-015` | 147 | Kiểm tra dữ liệu giờ từ giao diện trước khi áp dụng bộ tham số đã lưu để dự báo giờ tiếp theo. |
| `HW-016` | 157 | Hai mảng giờ và nhiệt độ phải khớp độ dài. Các mốc giờ phải tăng dần và không trùng. |
| `HW-017` | 167 | Chỉ dùng nhiệt độ tới mốc đầu vào và giữ giờ thiếu dữ liệu như một khoảng đứt trong chuỗi. |
| `HW-018` | 173 | Trả cả nhiệt độ, mức thay đổi và số giờ đầu vào. Cờ stale báo dữ liệu quá hai giờ. |

<a id="tep-weather-boosting-py"></a>
### [weather_boosting.py](weather_boosting.py)

Huấn luyện và dự báo bằng Histogram Gradient Boosting.

| Ghi chú | Dòng | Đoạn code làm gì |
| --- | ---: | --- |
| `GB-001` | 3 | File này dùng lại dữ liệu của Random Forest để huấn luyện và đánh giá Gradient Boosting, rồi dự báo trên dữ liệu mới. |
| `GB-002` | 17 | Dùng sai số tuyệt đối để huấn luyện. Ba tham số tiếp theo giới hạn tốc độ học, số vòng lặp và độ lớn của từng cây. |
| `GB-003` | 23 | Huấn luyện đủ số vòng đã chọn. Kết quả kiểm thử theo thời gian được tính riêng bên dưới. |
| `GB-004` | 30 | Tạo báo cáo kiểm thử và trả về mô hình đã học để dịch vụ lưu cho lần dự báo sau. |
| `GB-005` | 34 | Tái sử dụng cùng 25 đặc trưng. Nhãn học là mức chênh nhiệt độ, còn nhiệt độ gốc dùng để đổi kết quả về °C. |
| `GB-006` | 42 | Đối chiếu cả giờ, nhiệt độ thực và mốc đối chứng để chắc rằng hai mô hình được chấm trên đúng cùng dữ liệu. |
| `GB-007` | 53 | Tách mô hình chấm điểm khỏi mô hình triển khai để dữ liệu kiểm thử không ảnh hưởng điểm đánh giá. |
| `GB-008` | 57 | Giới hạn số luồng OpenMP. Cộng dự báo mức chênh vào nhiệt độ gốc trước khi tính sai số. |
| `GB-009` | 67 | Ghép từng dự báo với nhiệt độ thực, Random Forest và cách lấy nhiệt độ hiện tại cho giờ sau. |
| `GB-010` | 73 | Báo cáo lưu điểm trên toàn bộ tập kiểm thử cùng tối đa 72 mốc cuối cho biểu đồ. |
| `GB-011` | 94 | Nhận dữ liệu Open-Meteo theo giờ và dùng mô hình đã lưu để dự báo giờ kế tiếp. |
| `GB-012` | 103 | Xác thực các mảng theo giờ rồi lấy 25 giờ liên tiếp kết thúc tại mốc đầu vào. |
| `GB-013` | 110 | Chuyển dự báo chênh lệch về nhiệt độ tuyệt đối và đánh dấu dữ liệu đầu vào quá hai giờ. |

<a id="tep-weather-chronos-py"></a>
### [weather_chronos.py](weather_chronos.py)

Nạp Chronos‑2 Small và dự báo trung vị cùng khoảng P10–P90.

| Ghi chú | Dòng | Đoạn code làm gì |
| --- | ---: | --- |
| `CHR-001` | 3 | File này nạp Chronos-2 Small đã huấn luyện sẵn, kiểm thử theo mốc Random Forest và dự báo nhiệt độ giờ tới trên CPU. |
| `CHR-002` | 20 | Cố định phiên bản checkpoint và dùng chung thư mục ai-cache để lần chạy sau có thể đọc lại trọng số. |
| `CHR-003` | 25 | Mỗi mốc dự báo dùng từ 25 đến 168 giờ liên tiếp. Dự báo trả ba phân vị P10, P50 và P90. |
| `CHR-004` | 37 | Kiểm tra thư viện đã cài mà chưa cần nạp PyTorch hay tải dữ liệu mô hình. |
| `CHR-005` | 43 | Chỉ báo có cache khi đúng snapshot đã có cả cấu hình lẫn trọng số. |
| `CHR-006` | 50 | Dùng một bản mô hình đã nạp cho thư mục cache hiện tại. Khóa ngăn hai yêu cầu tải cùng lúc. |
| `CHR-007` | 68 | Tải các tệp cần thiết từ đúng phiên bản checkpoint khi được phép. Nếu có đủ cache, mở bản cục bộ. |
| `CHR-008` | 81 | Giới hạn tối đa 4 luồng và nạp trọng số safetensors từ đĩa vào CPU. |
| `CHR-009` | 93 | Lấy các giờ liên tiếp đến mốc đầu vào. Nhiệt độ là chuỗi cần dự báo, các chỉ số khác là đầu vào quá khứ. |
| `CHR-010` | 104 | Đảo thứ tự về cũ đến mới rồi đưa các chuỗi về mảng float32 theo định dạng Chronos. |
| `CHR-011` | 110 | Dự báo một bước theo lô. Tắt cross-learning để mỗi mốc kiểm thử chỉ dùng cửa sổ quá khứ của chính nó. |
| `CHR-012` | 121 | Lấy ba phân vị cho giờ kế tiếp rồi kiểm tra kích thước và tính hữu hạn của kết quả. |
| `CHR-013` | 125 | Giữ dự báo trung vị và sắp hai biên để khoảng dự báo luôn chứa trung vị. |
| `CHR-014` | 129 | Dùng checkpoint nguyên gốc trên các mốc kiểm thử Random Forest. Bước này không huấn luyện thêm Chronos. |
| `CHR-015` | 143 | Đối chiếu nhiệt độ thực và nhiệt độ giờ trước để tránh chấm trên phiên bản dữ liệu ERA5 khác. |
| `CHR-016` | 157 | Chia nhỏ bộ kiểm thử. Mỗi cửa sổ dừng trước giờ đích và thời gian đo chỉ tính phần gọi dự báo. |
| `CHR-017` | 167 | Tính sai số của dự báo trung vị, tỷ lệ nhiệt độ thực rơi vào khoảng P10–P90 và độ rộng trung bình. |
| `CHR-018` | 201 | Chỉ dự báo sau khi báo cáo đúng phiên bản checkpoint và mốc đầu vào không nằm ở tương lai. |
| `CHR-019` | 220 | Trả nhiệt độ giờ tới, hai biên dự báo, độ trễ dữ liệu và thời gian suy luận để giao diện hiển thị. |

<a id="tep-weather-assistant-py"></a>
### [weather_assistant.py](weather_assistant.py)

Chọn số liệu phù hợp với câu hỏi và gọi Qwen chạy trên máy.

| Ghi chú | Dòng | Đoạn code làm gì |
| --- | ---: | --- |
| `WA-001` | 3 | File này chọn dữ liệu Open-Meteo theo câu hỏi, nạp Qwen trên CPU và trả lời bằng tiếng Việt. |
| `WA-002` | 17 | Cố định tên và phiên bản Qwen. Danh sách bên dưới giới hạn những tệp cần cho mô hình và tokenizer. |
| `WA-003` | 23 | Đặt cách trả lời, ngôn ngữ và quy tắc dùng đúng số liệu, đơn vị, địa điểm và khung giờ. |
| `WA-004` | 33 | Giữ xác suất mưa cao nhất và giờ tương ứng để so với lời khuyên do Qwen tạo. |
| `WA-005` | 39 | Tạo lời khuyên trực tiếp từ dữ liệu. Từ 50% trở lên gợi ý mang ô, dưới mức đó cho người dùng cân nhắc. |
| `WA-006` | 45 | Kiểm tra lời khuyên, xác suất và giờ. Nếu ghi ngày thì ngày phải đúng. Dưới 50% cần khớp nguyên câu tham chiếu. |
| `WA-007` | 59 | Gom câu hỏi, các số liệu gửi vào Qwen, giờ dữ liệu và lời khuyên đối chứng nếu có. |
| `WA-008` | 68 | Giới hạn độ dài văn bản, bỏ dấu điều khiển dạng token và thu gọn khoảng trắng. |
| `WA-009` | 78 | Viết thường và bỏ dấu tiếng Việt để nhận ra các cụm giờ và từ khóa dù kiểu gõ khác nhau. |
| `WA-010` | 84 | Chuyển mốc ngày giờ từ Open-Meteo thành datetime. Trả None nếu định dạng hoặc giá trị không hợp lệ. |
| `WA-011` | 94 | Chuyển riêng mốc theo ngày sang date để lọc dự báo ngày. |
| `WA-012` | 104 | Giữ số hữu hạn trong khoảng hợp lệ của từng chỉ số. Giá trị thiếu hoặc sai sẽ không đi vào câu trả lời. |
| `WA-013` | 111 | Đổi °C sang °F nếu giao diện yêu cầu và ghép đơn vị vào số liệu đã làm tròn. |
| `WA-014` | 120 | Đọc chỉ số tại đúng vị trí trong mảng theo giờ hoặc theo ngày, sau đó áp dụng kiểm tra số. |
| `WA-015` | 128 | Nhận dạng ngày cụ thể, hôm nay, ngày mai và ngày kia dựa trên mốc Open-Meteo. |
| `WA-016` | 147 | Giờ viết rõ được ưu tiên. Nếu chỉ hỏi một buổi, chọn phạm vi giờ của buổi đó. |
| `WA-017` | 159 | Ghép tên vào chỉ số có dữ liệu. Trường thiếu sẽ được bỏ khi nối thành câu. |
| `WA-018` | 164 | Đọc dữ liệu thời tiết gửi từ giao diện, kiểm tra múi giờ Việt Nam và chỉ giữ thông tin liên quan để tạo ngữ cảnh. |
| `WA-019` | 193 | Nhận ra câu hỏi về hiện tại để mô hình không lẫn chỉ số tại mốc hiện tại với các giờ dự báo. |
| `WA-020` | 203 | Thêm các chỉ số hiện tại khi câu hỏi không chỉ định ngày hoặc hỏi về hôm nay. |
| `WA-021` | 226 | Lọc mốc đã qua và giờ ngoài yêu cầu. Với câu hỏi không chỉ định ngày, dùng tối đa 30 giờ tiếp theo. |
| `WA-022` | 252 | Chọn giờ có xác suất mưa cao nhất trong phần đã lọc để tạo lời khuyên có số liệu đối chiếu. |
| `WA-023` | 261 | Thêm phần dự báo theo ngày cho câu hỏi so sánh. Xác suất mưa tại đây là mức cao nhất của cả ngày. |
| `WA-024` | 279 | Quản lý trạng thái tải mô hình và trả lời qua API. Khóa tải và khóa sinh câu trả lời được dùng riêng. |
| `WA-025` | 289 | Kiểm tra tên thư viện AI mà chưa import Torch để nút trạng thái phản hồi nhanh. |
| `WA-026` | 293 | Trả trạng thái mô hình và hướng dẫn cài nếu thiếu phụ thuộc. |
| `WA-027` | 302 | Bắt đầu chuẩn bị Qwen trong luồng nền khi người dùng yêu cầu hoặc thử lại sau lỗi. |
| `WA-028` | 317 | Ưu tiên dùng snapshot đúng phiên bản đã lưu. Tải các tệp thiếu khi chưa mở được bản cục bộ. |
| `WA-029` | 331 | Giới hạn CPU, mở tokenizer và trọng số safetensors có sẵn rồi đưa mô hình sang chế độ suy luận. |
| `WA-030` | 342 | Cập nhật trạng thái sau khi tải mô hình. Phân biệt thiếu thư viện với lỗi khi lấy hoặc nạp trọng số. |
| `WA-031` | 360 | Chuẩn bị ngữ cảnh đã lọc rồi sinh câu trả lời. Mỗi thời điểm chỉ xử lý một yêu cầu sinh văn bản. |
| `WA-032` | 373 | Nếu lời khuyên mang ô không khớp số liệu, dùng câu tham chiếu và trả mode để giao diện ghi rõ nguồn. |
| `WA-033` | 382 | Dùng mẫu hội thoại của Qwen để đổi hướng dẫn và số liệu thành token, rồi giới hạn chiều dài và thời gian sinh. |
| `WA-034` | 396 | Chỉ giải mã phần Qwen vừa sinh, bỏ phần đầu vào và các token điều khiển. |

<a id="tep-time-series-service-py"></a>
### [time_series_service.py](time_series_service.py)

Điều phối huấn luyện, kiểm thử, lưu kết quả và gọi dự báo cho ba mô hình bổ sung.

| Ghi chú | Dòng | Đoạn code làm gì |
| --- | ---: | --- |
| `TSV-001` | 3 | File này quản lý tác vụ và kết quả cho Time Series, Gradient Boosting và Chronos. Cả ba đối chiếu với cùng bộ kiểm thử Random Forest. |
| `TSV-002` | 20 | Dịch vụ dùng chung nhận hàm tạo báo cáo và hàm dự báo riêng của từng mô hình. Holt–Winters là lựa chọn mặc định. |
| `TSV-003` | 36 | Khóa đọc và ghi trạng thái giữa các yêu cầu HTTP với luồng huấn luyện. RLock cho phép gọi status khi luồng hiện tại đã giữ khóa. |
| `TSV-004` | 43 | Tạo đường dẫn báo cáo theo tọa độ và tên phương pháp. Gradient Boosting còn có tệp joblib tương ứng. |
| `TSV-005` | 50 | Đọc thông tin bản Random Forest dùng làm mốc kiểm thử và dấu vân tay của tệp mô hình. |
| `TSV-006` | 55 | Chỉ dùng lại báo cáo khớp phiên bản định dạng và bản Random Forest hiện tại. |
| `TSV-007` | 63 | Nếu phương pháp lưu mô hình sklearn, kiểm tra phiên bản thư viện, tệp joblib và thông tin mã kiểm tra. |
| `TSV-008` | 75 | Trả tiến độ, lỗi hoặc báo cáo theo địa điểm để giao diện biết khi nào có thể dự báo. |
| `TSV-009` | 85 | Kiểm tra phụ thuộc của mô hình trước khi báo sẵn sàng. Chronos cần bộ thư viện AI riêng. |
| `TSV-010` | 106 | Bắt đầu một tác vụ nền cho phương pháp này. Nếu tác vụ tại cùng địa điểm đang chạy, trả lại trạng thái hiện có. |
| `TSV-011` | 119 | Luồng nền cho phép API trả về ngay trong lúc dữ liệu đang được chuẩn bị. |
| `TSV-012` | 127 | Dùng kết quả Random Forest có sẵn hoặc khởi tạo tác vụ lấy mốc so sánh từ lịch sử cục bộ nếu có. |
| `TSV-013` | 136 | Chờ tối đa ba phút cho tác vụ Random Forest. Thời gian chờ tính bằng đồng hồ đơn điệu. |
| `TSV-014` | 149 | Chạy hàm riêng của từng mô hình sau khi lấy báo cáo gốc và dữ liệu ERA5 cùng phiên bản. |
| `TSV-015` | 156 | Kiểm tra mốc huấn luyện và mã kiểm tra CSV trước khi chấm điểm để không trộn dữ liệu của hai lần chạy. |
| `TSV-016` | 164 | Kiểm lại kết quả Random Forest ngay trước khi lưu vì nó có thể đã được cập nhật trong lúc kiểm thử. |
| `TSV-017` | 171 | Giải phóng chỗ chạy tác vụ kể cả khi có lỗi, để người dùng có thể thử lại. |
| `TSV-018` | 178 | Cập nhật thông báo tiến độ mà giao diện đọc qua API trạng thái. |
| `TSV-019` | 183 | Lưu báo cáo bằng cách thay tệp nguyên vẹn. Nếu có mô hình sklearn, lưu cả tệp nén và mã kiểm tra SHA-256. |
| `TSV-020` | 197 | Dùng lại mô hình trong RAM nếu còn đúng. Khi đọc từ đĩa, kiểm tra SHA-256 trước khi nạp joblib. |
| `TSV-021` | 209 | Kiểm tra dữ liệu đã lưu rồi chuyển yêu cầu sang hàm dự báo của phương pháp tương ứng. |

<a id="tep-data-history-vn-10p78-106p70-csv"></a>
### [data/history/vn_10p78_106p70.csv](data/history/vn_10p78_106p70.csv)

Lịch sử ERA5 theo giờ ở khu vực TP.HCM.

| Dòng | Nội dung |
| ---: | --- |
| 1 | Tiêu đề cột gồm `time`, `temperature_2m`, `relative_humidity_2m`, `surface_pressure`, `wind_speed_10m`, `cloud_cover`. |
| 2–8761 | Mỗi dòng tương ứng một giờ theo cấu trúc của tiêu đề. |

<a id="tep-data-history-vn-10p78-106p70-source-json"></a>
### [data/history/vn_10p78_106p70.source.json](data/history/vn_10p78_106p70.source.json)

Nguồn, tọa độ, đơn vị và dấu kiểm của CSV lịch sử.

| Dòng | Nội dung |
| ---: | --- |
| 2, 3, 4, 5 | `provider`, `kind`, `url`, `downloaded_at` — Nhà cung cấp, loại dữ liệu, URL lấy ERA5 và thời điểm tải. |
| 6, 7 | `start_date`, `end_date` — Giai đoạn có số liệu. |
| 8, 9, 10, 11, 12 | `latitude`, `longitude`, `grid_latitude`, `grid_longitude`, `grid_elevation` — Tọa độ yêu cầu, ô lưới ERA5 trả về và cao độ của ô lưới. |
| 13, 21, 22 | `hourly_units`, `timezone`, `license` — Đơn vị các cột theo giờ, múi giờ và thông tin ghi nguồn. |
| 23, 24 | `csv_sha256`, `rows` — Dấu kiểm SHA-256 và số dòng để đối chiếu CSV đi kèm. |

<a id="tep-models-vn-10p78-106p70-metrics-json"></a>
### [models/vn_10p78_106p70.metrics.json](models/vn_10p78_106p70.metrics.json)

Thông tin huấn luyện và điểm kiểm thử Random Forest.

| Dòng | Nội dung |
| ---: | --- |
| 2 | `schema` — Phiên bản định dạng tệp mô hình. |
| 3, 4, 5, 6, 7 | `method`, `target`, `trained_at`, `latitude`, `longitude` — Tên phương pháp, biến cần dự báo, thời điểm huấn luyện và tọa độ nếu có. |
| 8, 9, 10, 11, 12 | `history_start`, `history_end`, `raw_rows`, `supervised_samples`, `features` — Phạm vi lịch sử và số dòng, số mẫu hoặc số đặc trưng sau khi chuẩn bị. |
| 13, 16, 17, 15 | `train_samples`, `train_start`, `train_end_target`, `gap_samples` — Phạm vi huấn luyện và khoảng đệm ở ranh giới chia tập. |
| 18, 19, 20, 14 | `test_start_anchor`, `test_start_target`, `test_end_target`, `test_samples` — Các mốc và số mẫu dùng để so sánh trên tập kiểm thử. |
| 21, 26 | `metrics`, `baseline` — MAE, RMSE và R² của mô hình, Random Forest đối chiếu hoặc Persistence. |
| 31, 32, 33 | `mae_improvement_percent`, `absolute_error_p90`, `feature_importance` — Mức cải thiện MAE so với đối chứng, phân vị 90 của sai số tuyệt đối và mức quan trọng của đặc trưng. |
| 160, 167 | `parameters`, `training_seconds` — Tham số mô hình và thời gian đo các bước nếu có. |
| 135, 168, 169, 170, 172, 171 | `source`, `sklearn_version`, `numpy_version`, `joblib_version`, `artifact_sha256`, `note` — Nguồn dữ liệu, phiên bản thư viện và dấu kiểm dùng khi nạp lại mô hình Random Forest. |

<a id="tep-models-vn-10p78-106p70-time-series-json"></a>
### [models/vn_10p78_106p70.time-series.json](models/vn_10p78_106p70.time-series.json)

Tham số san bằng và kết quả kiểm thử Holt–Winters.

| Dòng | Nội dung |
| ---: | --- |
| 2, 3, 4 | `schema`, `rf_artifact_sha256`, `report` — Phiên bản định dạng, dấu kiểm của mô hình Random Forest dùng để đối chiếu và khối kết quả. |
| 5 | `method` — Tên phương pháp, biến cần dự báo, thời điểm huấn luyện và tọa độ nếu có. |
| 8, 7, 6 | `window_hours`, `min_hours`, `period_hours` — Số giờ làm đầu vào và độ dài chu kỳ nếu mô hình có dùng chu kỳ. |
| 9, 10 | `history_start`, `history_end` — Phạm vi lịch sử và số dòng, số mẫu hoặc số đặc trưng sau khi chuẩn bị. |
| 11 | `train_end_target` — Phạm vi huấn luyện và khoảng đệm ở ranh giới chia tập. |
| 12, 13, 14, 15 | `test_start_target`, `test_end_target`, `test_samples`, `rf_test_samples` — Các mốc và số mẫu dùng để so sánh trên tập kiểm thử. |
| 16, 21, 26 | `metrics`, `random_forest`, `baseline` — MAE, RMSE và R² của mô hình, Random Forest đối chiếu hoặc Persistence. |
| 31 | `parameters` — Tham số mô hình và thời gian đo các bước nếu có. |
| 36 | `backtest` — Các mốc cuối để vẽ biểu đồ. Mỗi mốc chứa thời gian, nhiệt độ ERA5, dự báo và đối chứng. |

<a id="tep-models-vn-10p78-106p70-gradient-boosting-json"></a>
### [models/vn_10p78_106p70.gradient-boosting.json](models/vn_10p78_106p70.gradient-boosting.json)

Điểm kiểm thử, cấu hình và dấu kiểm mô hình Gradient Boosting.

| Dòng | Nội dung |
| ---: | --- |
| 2, 3, 4 | `schema`, `rf_artifact_sha256`, `report` — Phiên bản định dạng, dấu kiểm của mô hình Random Forest dùng để đối chiếu và khối kết quả. |
| 5 | `method` — Tên phương pháp, biến cần dự báo, thời điểm huấn luyện và tọa độ nếu có. |
| 6, 7 | `history_start`, `history_end` — Phạm vi lịch sử và số dòng, số mẫu hoặc số đặc trưng sau khi chuẩn bị. |
| 8 | `train_end_target` — Phạm vi huấn luyện và khoảng đệm ở ranh giới chia tập. |
| 9, 10, 11, 12 | `test_start_anchor`, `test_start_target`, `test_end_target`, `test_samples` — Các mốc và số mẫu dùng để so sánh trên tập kiểm thử. |
| 13, 18, 23 | `metrics`, `random_forest`, `baseline` — MAE, RMSE và R² của mô hình, Random Forest đối chiếu hoặc Persistence. |
| 28, 36, 37 | `parameters`, `training_seconds`, `evaluation_seconds` — Tham số mô hình và thời gian đo các bước nếu có. |
| 38 | `backtest` — Các mốc cuối để vẽ biểu đồ. Mỗi mốc chứa thời gian, nhiệt độ ERA5, dự báo và đối chứng. |
| 545, 546 | `estimator_sha256`, `sklearn_version` — Dấu kiểm của mô hình Gradient Boosting và phiên bản scikit-learn đã dùng. |

<a id="tep-models-vn-10p78-106p70-chronos-json"></a>
### [models/vn_10p78_106p70.chronos.json](models/vn_10p78_106p70.chronos.json)

Phiên bản checkpoint, sai số và độ bao phủ của khoảng dự báo Chronos.

| Dòng | Nội dung |
| ---: | --- |
| 2, 3, 4 | `schema`, `rf_artifact_sha256`, `report` — Phiên bản định dạng, dấu kiểm của mô hình Random Forest dùng để đối chiếu và khối kết quả. |
| 5 | `method` — Tên phương pháp, biến cần dự báo, thời điểm huấn luyện và tọa độ nếu có. |
| 6, 7 | `checkpoint`, `checkpoint_revision` — Tên và phiên bản checkpoint Chronos được dùng. |
| 8, 9 | `window_hours`, `min_hours` — Số giờ làm đầu vào và độ dài chu kỳ nếu mô hình có dùng chu kỳ. |
| 10, 11 | `history_start`, `history_end` — Phạm vi lịch sử và số dòng, số mẫu hoặc số đặc trưng sau khi chuẩn bị. |
| 12 | `train_end_target` — Phạm vi huấn luyện và khoảng đệm ở ranh giới chia tập. |
| 13, 14, 15, 16 | `test_start_target`, `test_end_target`, `test_samples`, `rf_test_samples` — Các mốc và số mẫu dùng để so sánh trên tập kiểm thử. |
| 17, 22, 27 | `metrics`, `random_forest`, `baseline` — MAE, RMSE và R² của mô hình, Random Forest đối chiếu hoặc Persistence. |
| 32 | `inference_seconds` — Tham số mô hình và thời gian đo các bước nếu có. |
| 33, 34 | `interval_coverage`, `interval_mean_width` — Tỷ lệ điểm nằm trong khoảng dự báo và độ rộng trung bình của khoảng đó. |
| 35 | `backtest` — Các mốc cuối để vẽ biểu đồ. Mỗi mốc chứa thời gian, nhiệt độ ERA5, dự báo và đối chứng. |

<a id="tep-reports-vn-10p78-106p70-holdout-csv"></a>
### [reports/vn_10p78_106p70_holdout.csv](reports/vn_10p78_106p70_holdout.csv)

Kết quả từng giờ của Random Forest trên tập kiểm thử.

| Dòng | Nội dung |
| ---: | --- |
| 1 | Tiêu đề cột gồm `time`, `actual`, `predicted`, `baseline`, `absolute_error`. |
| 2–1748 | Mỗi dòng tương ứng một giờ theo cấu trúc của tiêu đề. |

<a id="tep-src-main-tsx"></a>
### [src/main.tsx](src/main.tsx)

Nạp kiểu giao diện và gắn cây React vào `#root`.

| Ghi chú | Dòng | Đoạn code làm gì |
| --- | ---: | --- |
| `MAIN-000` | 1 | ĐIỂM KHỞI ĐỘNG: gắn ứng dụng React vào HTML. Đọc README.md trước khi chạy. |
| `MAIN-001` | 2 | StrictMode giúp phát hiện tác dụng phụ chưa được dọn dẹp trong lúc phát triển; có thể chạy effect thêm một lượt ở chế độ dev. |
| `MAIN-002` | 4 | createRoot tạo nơi React quản lý giao diện bên trong thẻ HTML #root. |
| `MAIN-003` | 6 | Nạp component màn hình chính; đây là nơi phối hợp trạng thái và các phần giao diện. |
| `MAIN-004` | 8 | Nạp CSS nền tảng trước: màu sắc, bố cục, biểu tượng, responsive. |
| `MAIN-005` | 10 | Nạp sau index.css để ghi đè giao diện kính mờ và bố cục từng giờ. Thứ tự này có ý nghĩa. |
| `MAIN-007` | 12 | Nạp kiểu trình bày riêng của khung Random Forest sau hai lớp CSS dùng chung. |
| `MAIN-006` | 15 | Tìm #root trong index.html rồi render WeatherApp. Dấu ! là cam kết kiểu TypeScript rằng phần tử tồn tại, không phải kiểm tra lúc chạy. |

<a id="tep-src-components-weather-app-tsx"></a>
### [src/components/weather-app.tsx](src/components/weather-app.tsx)

Trang chính, tìm địa điểm, cài đặt và các mục ở thanh điều hướng.

| Ghi chú | Dòng | Đoạn code làm gì |
| --- | ---: | --- |
| `APP-000` | 1 | MÀN HÌNH CHÍNH: trạng thái, vòng đời tải dữ liệu, thao tác người dùng và bố cục. Chú thích JSX nằm trong {/* ... */}. |
| `APP-001` | 4 | Các hook React: useState giữ trạng thái, useEffect làm việc bên ngoài render, useMemo ghi nhớ kết quả, useRef giữ phần tử, useCallback giữ hàm. |
| `APP-002` | 6 | Hai kiểu này mô tả nội dung React có thể hiển thị và sự kiện bàn phím của ô tìm kiếm. |
| `APP-003` | 8 | Bộ icon SVG cho nút và chỉ số. Icon chỉ minh họa; số liệu vẫn đến từ API. |
| `APP-004` | 57 | Các kiểu và hàm xử lý thuần được dùng chung với component theo giờ và các bài kiểm tra. |
| `APP-005` | 71 | Các kiểu và hàm xử lý thuần được dùng chung với component theo giờ và các bài kiểm tra. |
| `APP-006` | 73 | Tầng dữ liệu gọi Open-Meteo trực tiếp từ trình duyệt; component không tự dựng logic fetch/cache. |
| `APP-007` | 80 | Tách biểu đồ và các thẻ từng giờ thành component riêng để dễ đọc và bảo trì. |
| `APP-107` | 82 | Nạp các khung gọi mô hình Python. TimeSeriesPanel được dùng cho ba mô hình khác nhau. |
| `APP-008` | 87 | Chỉ cho phép C hoặc F làm đơn vị hiển thị; dữ liệu gốc vẫn dùng °C. |
| `APP-009` | 89 | Bảng ánh xạ WeatherKind sang component icon; tra bảng tránh viết nhiều nhánh JSX giống nhau. |
| `APP-010` | 101 | Tên khóa cài đặt và yêu thích trong localStorage của trình duyệt hiện tại. |
| `APP-011` | 106 | Đọc và giải mã JSON; nếu storage hỏng hoặc bị chặn thì trả null, tránh làm sập giao diện. |
| `APP-012` | 115 | Lưu đối tượng bằng JSON.stringify. Bắt lỗi vì storage có thể đầy hoặc không khả dụng. |
| `APP-013` | 123 | Chọn icon từ mã WMO; tham số mặc định giúp component vẫn render khi chưa có dữ liệu. |
| `APP-014` | 146 | Logo bằng icon và chữ; small thu gọn cách hiển thị ở màn hình hẹp. |
| `APP-015` | 160 | Minh họa mây, nắng, mưa bằng các phần tử CSS. Đây là trang trí dựa trên mã WMO, không phải ảnh radar. |
| `APP-016` | 200 | Khung chỉ số dùng lại cho UV, gió, độ ẩm... children là phần nội dung chi tiết truyền từ bên ngoài. |
| `APP-017` | 230 | Component cha phối hợp dữ liệu và các thao tác. Mỗi lần setState, React tính lại giao diện cần cập nhật. |
| `APP-018` | 232 | Địa điểm đang chọn; mặc định Hồ Chí Minh. setPlace đổi địa điểm và kích hoạt effect tải dự báo. |
| `APP-019` | 234 | Gắn dự báo với placeId để khi đổi địa điểm không hiển thị nhầm dữ liệu của nơi cũ. |
| `APP-020` | 239 | Cờ đang tải, dùng để hiện trạng thái chờ và vô hiệu hóa thao tác phù hợp. |
| `APP-021` | 241 | Thông báo lỗi tải dự báo chính; chuỗi rỗng nghĩa là không có lỗi. |
| `APP-022` | 243 | Cờ cho biết lần cập nhật thất bại; dữ liệu đang giữ có thể đã cũ. |
| `APP-023` | 245 | Chờ khôi phục cài đặt từ localStorage trước khi tải và ghi lại tùy chọn. |
| `APP-024` | 247 | Đơn vị nhiệt độ đang hiển thị, C hoặc F; đổi đơn vị không cần gọi lại API. |
| `APP-025` | 249 | Giao diện sáng/tối; effect gắn vào data-theme của thẻ html để CSS đổi màu. |
| `APP-026` | 251 | Danh sách địa điểm đã lưu trên trình duyệt này, không phải tài khoản trên máy chủ. |
| `APP-027` | 253 | Bộ đếm làm mới thủ công. Tăng số để effect chạy lại; tầng API vẫn giữ khoảng chờ tối thiểu 30 giây. |
| `APP-028` | 255 | Dữ liệu rút gọn của 4 thẻ thành phố ở phần khám phá. |
| `APP-029` | 257 | Theo dõi lỗi riêng cho thẻ thành phố, không thay thế lỗi dự báo chính. |
| `APP-030` | 259 | Nội dung ô tìm kiếm; thay đổi sẽ kích hoạt effect debounce. |
| `APP-031` | 261 | Cho biết danh sách gợi ý tìm kiếm có đang mở hay không. |
| `APP-032` | 263 | Các địa danh do Geocoding API trả về, được kết hợp với danh sách PLACES. |
| `APP-033` | 265 | Cờ đang đợi tìm kiếm, dùng để hiện biểu tượng tải. |
| `APP-034` | 267 | Cờ lỗi nguồn tìm kiếm để vẫn có thể dùng địa điểm mẫu. |
| `APP-035` | 269 | Chỉ số kết quả đang được chọn bằng bàn phím; -1 nghĩa là chưa chọn. |
| `APP-036` | 271 | Chỉ số ngày đang chọn trong dự báo 7 ngày; 0 là hôm nay. |
| `APP-037` | 273 | Màn hình đang xem: tổng quan hoặc địa điểm đã lưu. |
| `APP-038` | 275 | Điều khiển thanh điều hướng dạng trượt ở màn hình nhỏ. |
| `APP-039` | 277 | Đóng/mở bảng cài đặt đơn vị và chủ đề. |
| `APP-040` | 279 | Đóng/mở hộp giải thích nguồn dữ liệu và quyền riêng tư. |
| `APP-041` | 281 | Thông báo ngắn sau thao tác lưu/bỏ lưu/định vị; tự ẩn sau 3,8 giây. |
| `APP-042` | 283 | Cờ đang chờ trình duyệt trả vị trí GPS/Wi-Fi/IP. |
| `APP-043` | 285 | Đồng hồ để hiển thị ngày hiện tại; cập nhật mỗi phút, không gọi API thời tiết mỗi phút. |
| `APP-044` | 287 | Tham chiếu khung tìm kiếm để nhận biết thao tác bấm ra ngoài. |
| `APP-045` | 289 | Tham chiếu khung cài đặt để đóng khi bấm ra ngoài. |
| `APP-046` | 291 | Tham chiếu input, dùng focus/blur sau thao tác bàn phím hoặc nút tìm kiếm. |
| `APP-047` | 293 | Chỉ nhận dữ liệu nếu bundle thuộc đúng địa điểm đang chọn. |
| `APP-048` | 295 | Kiểm tra địa điểm hiện tại có trong favorites để tô nút ngôi sao. |
| `APP-049` | 298 | Khởi tạo một lần: đọc cài đặt/yêu thích hợp lệ, tạo đồng hồ mỗi 60 giây; cleanup xóa timer khi component được tháo. |
| `APP-050` | 300 | Khôi phục dữ liệu lưu, sau đó vẫn kiểm tra từng giá trị thay vì tin hoàn toàn nội dung localStorage. |
| `APP-051` | 316 | Khi unit/place/theme đổi và đã ready: cập nhật data-theme và lưu tùy chọn. Mảng phụ thuộc kiểm soát lúc effect chạy lại. |
| `APP-052` | 322 | Lưu favorites sau khi khôi phục xong, tránh ghi đè danh sách cũ bằng mảng rỗng lúc khởi động. |
| `APP-053` | 326 | Đăng ký bấm ngoài và phím Esc để đóng các bảng. Cleanup gỡ listener để tránh rò rỉ và xử lý trùng. |
| `APP-054` | 347 | Toast có nội dung thì hẹn 3.800 ms để ẩn; thay toast hoặc rời component sẽ hủy timer cũ. |
| `APP-055` | 354 | Vòng đời dự báo chính: đọc bản thành công gần nhất (<3 giờ), tải API, kiểm tra mỗi 15 phút khi tab hiển thị và khi quay lại tab. |
| `APP-056` | 358 | Khóa lưu bản dự báo thành công gần nhất theo tọa độ; dùng khi mở lại hoặc gặp lỗi mạng. |
| `APP-057` | 360 | Bản dự báo đã lưu ở giao diện; khác cache URL trong weather-client.ts. |
| `APP-097` | 372 | Mốc thành công gần nhất quyết định có cần tải lại sau 15 phút hay không; khác đồng hồ now của giao diện. |
| `APP-098` | 379 | Cờ cục bộ ngăn hai lần load trong cùng vòng đời effect chạy chồng nhau. |
| `APP-058` | 381 | Tải dự báo chính: chặn tải trùng, kiểm tra tuổi cache, cập nhật trạng thái và giữ dữ liệu cũ khi lỗi. |
| `APP-099` | 400 | Controller trong component chỉ ngăn kết quả cũ ghi vào giao diện sau khi đổi nơi. fetch chia sẻ có controller/timeout riêng ở weather-client.ts. |
| `APP-100` | 419 | Lần đầu dùng cache thường; sau thao tác làm mới, force=true nhưng không vượt quy tắc 30 giây của tầng API. |
| `APP-101` | 423 | Lần kiểm tra theo timer chỉ chạy khi tab hiển thị để giảm công việc khi người dùng ở tab khác. |
| `APP-102` | 433 | Cleanup đánh dấu vòng đời cũ đã kết thúc; đồng thời xóa timer và listener phía dưới. |
| `APP-059` | 439 | Vòng đời thẻ thành phố: lấy 4 nơi bằng batch, kiểm tra mỗi 15 phút; timer này chưa được chặn theo visibility như dự báo chính. |
| `APP-060` | 443 | Tải tóm tắt 4 địa điểm mẫu bằng một request, thay vì gọi riêng từng thành phố. |
| `APP-061` | 461 | Debounce tìm kiếm 350 ms: chỉ gửi khi dừng gõ; đổi từ khóa sẽ hủy timer và bỏ qua kết quả cũ. |
| `APP-103` | 483 | Khoảng chờ 350 ms là debounce, không phải khoảng dự báo thời tiết. |
| `APP-062` | 491 | useMemo kết hợp tìm kiếm tên không dấu/tên tắt với kết quả API; bỏ kết quả gần trùng tọa độ và giữ tối đa 8 mục. |
| `APP-063` | 511 | Hàm chọn địa điểm dùng lại ở tìm kiếm, GPS và thẻ thành phố; đồng thời đặt lại ngày, ô tìm kiếm và menu. |
| `APP-064` | 521 | Thêm/bỏ một địa điểm, tối đa 30 mục. Cập nhật bằng prev để dùng danh sách mới nhất. |
| `APP-104` | 524 | Giới hạn số địa điểm lưu để danh sách gọn và tránh tăng dữ liệu localStorage quá nhiều. |
| `APP-065` | 534 | Đóng menu trên điện thoại và chọn trang. Các mục dự báo cuộn đến thẻ tương ứng trên trang tổng quan. |
| `APP-108` | 545 | Chờ React hiện trang tổng quan rồi mới tìm thẻ đích để cuộn vào. |
| `APP-066` | 552 | Hỗ trợ bàn phím trong tìm kiếm: ↑/↓ chọn kết quả, Enter mở địa điểm. |
| `APP-067` | 569 | Xin vị trí qua Geolocation của trình duyệt; chỉ chạy khi người dùng nhấn nút định vị. |
| `APP-105` | 578 | API định vị của trình duyệt, không phải API thời tiết. Trình duyệt sẽ quản lý quyền vị trí. |
| `APP-106` | 610 | Ưu tiên tiết kiệm tài nguyên; chờ tối đa 12 giây và chấp nhận vị trí đã có tối đa 5 phút. |
| `APP-068` | 615 | Rút ngắn đường dẫn đến nhóm dữ liệu hiện tại; ?. cho phép data chưa tải xong. |
| `APP-069` | 617 | Nhóm dự báo tổng hợp theo ngày, dùng cho nhiệt độ cao/thấp và mặt trời mọc/lặn. |
| `APP-070` | 619 | Tên tiếng Việt và nhóm minh họa được suy ra từ mã WMO và cờ ngày/đêm. |
| `APP-071` | 621 | Tìm giờ đang chứa current.time trong mảng hourly; dùng để lấy UV và 24 giờ cần xem. |
| `APP-072` | 630 | Chỉ số UV của giờ tương ứng; giữ giá trị thiếu để giao diện không báo UV = 0 sai lệch. |
| `APP-073` | 632 | Chuyển giá trị UV thành mức diễn giải: thấp, trung bình, cao, rất cao, cực cao. |
| `APP-074` | 645 | Chọn lớp màu theo UV; nhãn ở trên vẫn phân biệt khi thiếu dữ liệu. |
| `APP-075` | 647 | Trong 24 giờ tới, lấy những giờ có khả năng mưa từ 60% để tạo lời nhắc mang ô. |
| `APP-076` | 657 | Lời nhắc theo quy tắc if/else: ưu tiên mưa, rồi nóng cảm nhận ≥35°C, cuối cùng là gợi ý chung. Không phải AI tự học. |
| `APP-077` | 675 | Định dạng ngày theo tiếng Việt và múi giờ Việt Nam dù laptop dùng múi giờ khác. |
| `APP-078` | 685 | Chuẩn hóa tiến trình từ bình minh đến hoàng hôn về khoảng 0..1 để đặt biểu tượng trên cung minh họa. |
| `APP-109` | 737 | Các nút dự báo và hỏi đáp dùng tên trùng với id của khung để cuộn đến mục tương ứng. |
| `APP-079` | 833 | Vùng nội dung chính; id main là đích đến của liên kết hỗ trợ bàn phím. |
| `APP-080` | 835 | Tiêu đề, tìm kiếm, định vị và cài đặt; input được điều khiển bằng state query. |
| `APP-081` | 858 | Khối combobox: kết quả mẫu xuất hiện ngay, kết quả API bổ sung sau debounce. |
| `APP-082` | 957 | Bảng chọn °C/°F và sáng/tối; đổi state rồi CSS/formatter tự cập nhật. |
| `APP-083` | 1006 | Tab địa điểm và trạng thái lần tải gần nhất; nút làm mới tăng revision. |
| `APP-084` | 1080 | Bố cục hai cột: thời tiết hiện tại/theo giờ/chỉ số và dự báo ngày/mặt trời/gợi ý. |
| `APP-085` | 1087 | Tên địa điểm và nút yêu thích; nút gọi toggleFavorite, không gửi dữ liệu tài khoản. |
| `APP-086` | 1148 | Tóm tắt độ ẩm, gió, khả năng mưa; mỗi chỉ số có đơn vị riêng. |
| `APP-087` | 1206 | Truyền dữ liệu và ngày đã chọn xuống component từng giờ; onSource mở hộp nguồn dữ liệu. |
| `APP-088` | 1216 | Các chỉ số nổi bật dùng MetricCard để tái sử dụng bố cục. |
| `APP-089` | 1357 | Danh sách 7 ngày; chọn một hàng cập nhật selectedDay cho cả chi tiết và biểu đồ từng giờ. |
| `APP-090` | 1450 | Hiển thị giờ bình minh/hoàng hôn từ API; cung mặt trời chỉ là minh họa. |
| `APP-091` | 1456 | Cung SVG dùng sunProgress; không phải mô phỏng thiên văn chính xác. |
| `APP-092` | 1531 | Lời nhắc được tạo từ biến tip theo quy tắc đã giải thích ở trên. |
| `APP-110` | 1556 | Khóa React gắn với tọa độ. Khi đổi địa điểm, mỗi khung khởi tạo lại trạng thái và dọn lượt chờ cũ. |
| `APP-111` | 1579 | Trợ lý lấy lại bản dự báo của trang chính và biết khi dữ liệu đang xem là bản lưu cũ. |
| `APP-093` | 1588 | Bốn thẻ thành phố dùng dữ liệu batch; bấm thẻ gọi selectPlace. |
| `APP-094` | 1729 | Ghi nguồn dữ liệu, giấy phép và thời điểm nhận để người xem kiểm tra độ mới. |
| `APP-095` | 1769 | Hộp giới thiệu nguồn/API/quyền riêng tư; đóng bằng nút hoặc Esc. |
| `APP-096` | 1823 | Công khai endpoint và liên kết JSON thật cho tọa độ đang chọn. |

<a id="tep-src-components-hourly-forecast-tsx"></a>
### [src/components/hourly-forecast.tsx](src/components/hourly-forecast.tsx)

Biểu đồ cùng thẻ xem dự báo từng giờ.

| Ghi chú | Dòng | Đoạn code làm gì |
| --- | ---: | --- |
| `HOUR-000` | 1 | DỰ BÁO TỪNG GIỜ: cùng một danh sách dữ liệu cấp cho biểu đồ, thẻ giờ và bảng chi tiết; cuộn chung để không lệch mốc. |
| `HOUR-001` | 4 | Các hook quản lý tab chỉ số, giờ đang chọn, vị trí cuộn và dữ liệu đã chuẩn hóa. |
| `HOUR-002` | 6 | Thư viện vẽ biểu đồ React. AreaChart dựng biểu đồ, XAxis/YAxis là trục, Tooltip hiển thị giá trị khi rê chuột. |
| `HOUR-003` | 16 | Icon minh họa thời tiết, điều hướng và các chỉ số. |
| `HOUR-004` | 37 | getHourlyTimeline giữ đủ các giờ liên tiếp; formatter và kiểu dữ liệu được dùng chung với màn hình chính. |
| `HOUR-005` | 48 | getHourlyTimeline giữ đủ các giờ liên tiếp; formatter và kiểu dữ liệu được dùng chung với màn hình chính. |
| `HOUR-006` | 50 | Dùng cùng hàm forecastUrl để liên kết dữ liệu gốc khớp đúng địa điểm trên giao diện. |
| `HOUR-007` | 53 | Chỉ số của biểu đồ: nhiệt độ, xác suất mưa hoặc tốc độ gió. |
| `HOUR-008` | 55 | Đơn vị nhiệt độ hiển thị, C hoặc F. |
| `HOUR-009` | 57 | Bảng chọn icon theo nhóm thời tiết được weatherInfo trả về. |
| `HOUR-010` | 69 | Mỗi mốc chiếm 72 px: dùng chung cho độ rộng biểu đồ, thẻ và quãng cuộn mỗi lần bấm mũi tên. |
| `HOUR-011` | 71 | Chọn icon cho một giờ từ mã WMO và cờ ban ngày/ban đêm. |
| `HOUR-012` | 84 | Nội dung tooltip tùy chỉnh: giờ thực, ngày, GMT+7, giá trị và đúng đơn vị của chỉ số. |
| `HOUR-043` | 101 | Tooltip chưa hoạt động hoặc chưa có dữ liệu thì không render; tránh truy cập phần tử không tồn tại. |
| `HOUR-013` | 129 | Nhận dữ liệu từ component cha qua props; quản lý riêng chỉ số biểu đồ và mốc chi tiết đang chọn. |
| `HOUR-014` | 145 | Tab chỉ số đang chọn; đổi state chỉ tính lại dữ liệu vẽ, không gọi API mới. |
| `HOUR-015` | 147 | Khóa mốc được bấm để hiển thị chi tiết; null sẽ chọn mốc đầu danh sách. |
| `HOUR-016` | 149 | Cờ đang ở đầu/cuối vùng cuộn để tắt mũi tên không còn tác dụng. |
| `HOUR-017` | 151 | Tham chiếu vùng cuộn chung của biểu đồ và hàng thẻ theo giờ. |
| `HOUR-018` | 153 | useMemo chỉ tạo lại danh sách giờ khi data hoặc selectedDay đổi, không lặp lại khi chỉ đóng/mở giao diện khác. |
| `HOUR-019` | 158 | Tìm mốc được chọn; nếu khóa không còn trong ngày hiện tại thì dùng phần tử đầu. |
| `HOUR-020` | 160 | Màu nhất quán theo chỉ số: vàng nhiệt độ, xanh dương mưa, xanh ngọc gió. |
| `HOUR-021` | 167 | Chuyển danh sách giờ thành cấu trúc Recharts; time là nhãn, actualTime/date dành cho tooltip, value là chỉ số đang chọn. |
| `HOUR-022` | 180 | Đo scrollLeft/clientWidth/scrollWidth để biết còn giờ ở bên trái/phải; dung sai 3 px tránh sai số làm tròn. |
| `HOUR-023` | 189 | Đổi địa điểm hoặc ngày: bỏ chọn mốc cũ, đưa vùng cuộn về đầu và đo lại trạng thái mũi tên. |
| `HOUR-024` | 195 | ResizeObserver đo lại khi khung thay kích thước; disconnect trong cleanup để tránh giữ observer thừa. |
| `HOUR-044` | 200 | Bỏ qua cơ chế quan sát nếu trình duyệt không có API này, tránh lỗi runtime. |
| `HOUR-025` | 206 | Cuộn đúng một bước STEP về trái/phải. direction nhận -1 hoặc 1 từ nút và bàn phím. |
| `HOUR-026` | 208 | Tôn trọng tùy chọn giảm chuyển động của hệ điều hành: dùng cuộn tức thì thay vì smooth. |
| `HOUR-027` | 240 | Ba tab chọn chỉ số và hai nút dịch từng giờ; mỗi nút chỉ thay state hoặc vị trí cuộn. |
| `HOUR-028` | 242 | role tablist và aria-selected hỗ trợ người dùng bàn phím/trình đọc màn hình. |
| `HOUR-029` | 263 | disabled phụ thuộc edges và danh sách giờ để không cuộn vượt đầu/cuối. |
| `HOUR-030` | 285 | Hiển thị số mốc thực sự có; không khẳng định đủ 24 nếu API cung cấp ít hơn. |
| `HOUR-031` | 295 | Biểu đồ và thẻ nằm chung một phần tử cuộn; phím ←/→ cũng dùng được khi vùng này có focus. |
| `HOUR-032` | 313 | Độ rộng = số giờ ×72 +32 px cho trục Y. Nhờ đó mỗi thẻ khớp đúng điểm trên biểu đồ. |
| `HOUR-033` | 323 | Cho biểu đồ dùng kích thước của khung cha; CSS đặt chiều cao riêng. |
| `HOUR-034` | 325 | Nguồn data là chart đã chuẩn hóa; không lấy mẫu cách 3 giờ. |
| `HOUR-035` | 350 | Các đường ngang nét đứt hỗ trợ đọc giá trị, không tạo số liệu. |
| `HOUR-036` | 356 | interval=0 giữ mọi nhãn giờ; padding mỗi bên STEP/2 đặt điểm ở giữa thẻ tương ứng. |
| `HOUR-037` | 366 | Trục Y rộng 32 px; xác suất mưa cố định 0..100, các chỉ số khác dùng miền phù hợp. |
| `HOUR-038` | 384 | Tooltip dùng HourTooltip để giữ ngày và giờ Việt Nam khi rê chuột qua nửa đêm. |
| `HOUR-039` | 392 | monotone chỉ làm mượt nét vẽ. connectNulls=false để dữ liệu thiếu tạo khoảng trống, không nối thành số liệu giả. |
| `HOUR-040` | 410 | Một cột cho mỗi mốc; map không dùng bước nhảy nên giữ cả 00:00, 01:00, 02:00... |
| `HOUR-041` | 455 | Nhiệt độ, xác suất mưa, gió và độ ẩm của mốc đã chọn; null hiển thị —. |
| `HOUR-042` | 496 | Nút nguồn và liên kết JSON dùng đúng tọa độ của place, giúp tự kiểm tra dữ liệu thật. |

<a id="tep-src-components-random-forest-panel-tsx"></a>
### [src/components/random-forest-panel.tsx](src/components/random-forest-panel.tsx)

Khung huấn luyện, dự báo và xem kết quả Random Forest.

| Ghi chú | Dòng | Đoạn code làm gì |
| --- | ---: | --- |
| `RF-UI-009` | 1 | Khung Random Forest hiển thị dự báo giờ kế tiếp, kết quả kiểm thử ERA5 và CSV tải từ Python. |
| `RF-UI-001` | 30 | Component cha đặt key theo địa điểm: đổi nơi sẽ tháo toàn bộ state/requests của panel cũ. |
| `RF-UI-002` | 51 | Sai số là chênh lệch nhiệt độ: đổi sang °F chỉ nhân 1,8, không cộng 32. |
| `RF-UI-003` | 56 | Poll chỉ khi đang train. GET status không tự download dữ liệu hay tạo model. |
| `RF-UI-010` | 86 | Hủy việc chờ phản hồi huấn luyện ở trình duyệt khi đổi địa điểm. |
| `RF-UI-004` | 89 | Chỉ suy luận khi đã có model. Context lấy trực tiếp từ browser có cache; dữ liệu t+1 không gửi cho RF. |
| `RF-UI-011` | 118 | Chỉ đặt số liệu Open-Meteo cạnh dự báo RF khi cả hai cùng giờ mục tiêu. |
| `RF-UI-005` | 139 | POST train trả về ngay; tác vụ fit và tải lịch sử nằm ở luồng nền Python, có khóa chống trùng. |
| `RF-UI-006` | 162 | Chỉ đổi đơn vị trên bản sao cho biểu đồ; CSV/đánh giá gốc luôn là °C. |
| `RF-UI-012` | 195 | Hiện lỗi kết nối hoặc lỗi huấn luyện theo phản hồi mới nhất và cho phép đọc lại trạng thái. |
| `RF-UI-013` | 221 | Khi chưa có mô hình, hiện lựa chọn huấn luyện và báo địa điểm đã có CSV lịch sử hay chưa. |
| `RF-UI-007` | 259 | Ba thẻ lần lượt hiện nhiệt độ RF dự báo, nhiệt độ Open-Meteo cùng giờ và mức thay đổi so với đầu vào. |
| `RF-UI-014` | 312 | Nút đọc lại tăng predictionRevision để yêu cầu dữ liệu mới và tính lại dự báo. |
| `RF-UI-008` | 328 | MAE/RMSE là sai số trên holdout 20% theo thời gian. Không gọi đây là phần trăm chính xác. |
| `RF-UI-015` | 365 | Phần mở rộng gom biểu đồ theo giờ, CSV kiểm thử, bảng sai số và thông tin học của mô hình. |
| `RF-UI-016` | 505 | Lấy năm đặc trưng có điểm cao nhất từ báo cáo và đổi tỷ trọng thành phần trăm để vẽ thanh. |

<a id="tep-src-components-time-series-panel-tsx"></a>
### [src/components/time-series-panel.tsx](src/components/time-series-panel.tsx)

Khung dùng chung cho Holt–Winters, Gradient Boosting và Chronos.

| Ghi chú | Dòng | Đoạn code làm gì |
| --- | ---: | --- |
| `SERIES-UI-001` | 1 | Một khung React dùng chung cho Holt–Winters, Gradient Boosting và Chronos‑2 Small. |
| `SERIES-UI-002` | 22 | Báo cáo lịch sử gồm các điểm dùng để vẽ biểu đồ và sai số trên cả tập kiểm thử. |
| `SERIES-UI-003` | 41 | Trạng thái mô hình quyết định khi nào hiện nút huấn luyện, dự báo hoặc thông báo thiếu thư viện. |
| `SERIES-UI-004` | 49 | as_of là giờ dữ liệu đầu vào cuối cùng, target_time là giờ cần dự báo. Hai cận chỉ có khi API trả khoảng dự báo. |
| `SERIES-UI-005` | 60 | variant chọn tiêu đề, biểu tượng và hàm lấy đúng các cột thời tiết mà mô hình cần. |
| `SERIES-UI-006` | 90 | Tên variant cũng là tên route Python. Chronos được chờ lâu hơn khi dự báo lần đầu vì có thể cần tải trọng số. |
| `SERIES-UI-007` | 105 | Dùng một kiểu hiển thị ngày giờ cho nhãn biểu đồ, mốc đầu vào và mốc dự báo. |
| `SERIES-UI-008` | 110 | Ưu tiên thông báo từ lỗi mạng hoặc Python. Giá trị lỗi khác dùng câu mặc định của thao tác. |
| `SERIES-UI-009` | 115 | Phần kiểm thử vẽ ERA5, Random Forest và mô hình đang xem trên cùng các mốc lịch sử. |
| `SERIES-UI-010` | 130 | Giá trị nhiệt độ đổi C/F khi vẽ. Sai số là độ chênh nên sang °F chỉ nhân 1,8. |
| `SERIES-UI-011` | 138 | Bảng sai số có thêm Persistence làm mốc so sánh theo quy tắc giờ sau bằng giờ trước. |
| `SERIES-UI-012` | 153 | Khi báo cáo có số đo thời gian và độ bao phủ P10–P90, hiển thị chúng cạnh số giờ kiểm thử. |
| `SERIES-UI-013` | 251 | Nhận vị trí, đơn vị và tên mô hình từ trang chính. Mặc định là khung Holt–Winters. |
| `SERIES-UI-014` | 263 | Chronos chỉ dự báo sau khi bấm nút để tránh phải tải mô hình ngay khi mở trang. |
| `SERIES-UI-015` | 278 | Đọc trạng thái theo tọa độ. Trong lúc huấn luyện, hỏi lại sau 1,5 giây và dọn lượt hỏi khi đổi khung. |
| `SERIES-UI-016` | 308 | Dừng chờ phản hồi yêu cầu huấn luyện ở trình duyệt khi khung cũ bị tháo. |
| `SERIES-UI-017` | 311 | Khi đủ điều kiện dự báo, lấy dữ liệu đến giờ hiện tại từ Open-Meteo rồi chuyển cho Python tính giờ kế tiếp. |
| `SERIES-UI-018` | 349 | Khóa lần khởi động trùng. Nếu Python còn xử lý, tăng statusRevision để tiếp tục theo dõi. |
| `SERIES-UI-019` | 378 | Mỗi khung có nhãn xử lý phù hợp. Chronos đang kiểm thử mô hình có sẵn thay vì huấn luyện mới. |
| `SERIES-UI-020` | 407 | Báo lỗi mạng, thiếu thư viện hoặc tiến độ. Nút kiểm tra lại yêu cầu đọc trạng thái mới. |
| `SERIES-UI-021` | 440 | Kết quả giờ tới có thể chưa sẵn sàng trong khi báo cáo kiểm thử lịch sử vẫn xem được. |
| `SERIES-UI-022` | 458 | Chỉ hiện khoảng P10–P90 khi dự báo có đủ cận dưới và cận trên. |

<a id="tep-src-components-weather-assistant-panel-tsx"></a>
### [src/components/weather-assistant-panel.tsx](src/components/weather-assistant-panel.tsx)

Khung chuẩn bị Qwen, gửi câu hỏi và hiển thị câu trả lời.

| Ghi chú | Dòng | Đoạn code làm gì |
| --- | ---: | --- |
| `ASSIST-UI-001` | 1 | Khung hỏi đáp gọi Qwen qua máy chủ Python và gửi kèm bản dự báo của địa điểm đang xem. |
| `ASSIST-UI-002` | 9 | Phản hồi trạng thái cho biết có thể mở ô hỏi đáp hay cần chuẩn bị mô hình trước. |
| `ASSIST-UI-003` | 18 | Kết quả trả kèm nguồn, thời điểm dữ liệu và cách tạo câu trả lời để giao diện ghi nhãn. |
| `ASSIST-UI-004` | 27 | Các nút gợi ý điền câu hỏi vào ô nhập để người dùng có thể sửa trước khi gửi. |
| `ASSIST-UI-005` | 42 | Đọc trạng thái bằng GET. Chuẩn bị mô hình và gửi câu hỏi dùng POST với nội dung JSON. |
| `ASSIST-UI-006` | 48 | Hợp nhất tín hiệu hủy khi đổi giao diện với giới hạn chờ. Câu hỏi được chờ lâu hơn vì Qwen chạy trên máy. |
| `ASSIST-UI-007` | 63 | Trang HTML trả về thay JSON thường là dấu hiệu route trợ lý chưa đi qua app.py. |
| `ASSIST-UI-008` | 71 | Phân biệt hết thời gian chờ với thao tác hủy của giao diện để báo đúng lỗi. |
| `ASSIST-UI-009` | 82 | Nhận dự báo, địa điểm và đơn vị từ màn hình chính để phần hỏi đáp dùng đúng ngữ cảnh đang xem. |
| `ASSIST-UI-010` | 94 | Tách trạng thái tải mô hình với lần gửi câu hỏi để hai thao tác có thông báo riêng. |
| `ASSIST-UI-011` | 108 | Hỏi lại trạng thái mỗi 2 giây trong lúc máy chủ đang chuẩn bị Qwen. |
| `ASSIST-UI-012` | 132 | Hủy yêu cầu đang chờ khi rời khung để câu trả lời cũ không xuất hiện ở địa điểm mới. |
| `ASSIST-UI-013` | 138 | Khởi động việc chuẩn bị mô hình theo yêu cầu và bật lại lượt kiểm tra nếu máy chủ còn tải. |
| `ASSIST-UI-014` | 160 | Chỉ gửi khi mô hình sẵn sàng, có dự báo và chưa có câu hỏi khác đang chờ. |
| `ASSIST-UI-015` | 170 | Kèm dữ liệu hiện tại, theo giờ, theo ngày và múi giờ để Python lọc theo nội dung câu hỏi. |
| `ASSIST-UI-016` | 211 | Hiện lỗi kết nối hoặc nút chuẩn bị theo trạng thái mà máy chủ trả về. |
| `ASSIST-UI-017` | 232 | Chỉ mở ô hỏi đáp sau khi Qwen sẵn sàng. Dữ liệu lưu cũ được thông báo ngay trong khung. |
| `ASSIST-UI-018` | 274 | Ghi nguồn và mốc giờ dưới câu trả lời. Gợi ý theo dữ liệu có nhãn riêng với câu do Qwen sinh. |

<a id="tep-src-lib-weather-ts"></a>
### [src/lib/weather.ts](src/lib/weather.ts)

Kiểu dữ liệu, đổi đơn vị, mã thời tiết và ghép các mốc theo giờ.

| Ghi chú | Dòng | Đoạn code làm gì |
| --- | ---: | --- |
| `DATA-000` | 1 | KIỂU DỮ LIỆU VÀ HÀM THUẦN: không gọi API và không vẽ giao diện. Các hàm nhận dữ liệu, xử lý rồi trả kết quả. |
| `DATA-001` | 2 | Một địa điểm. Dấu ? là trường không bắt buộc; aliases chứa tên gõ thay thế như sai gon, hcm. |
| `DATA-002` | 4 | Mã nhận diện ổn định của địa điểm. |
| `DATA-003` | 6 | Tên hiển thị. |
| `DATA-004` | 8 | Vĩ độ (độ). |
| `DATA-005` | 10 | Kinh độ (độ). |
| `DATA-006` | 12 | Tên vùng hoặc tỉnh/thành để phân biệt kết quả. |
| `DATA-007` | 14 | Các cách gọi/tên viết tắt hỗ trợ tìm kiếm không dấu. |
| `DATA-008` | 17 | 18 địa điểm mẫu giúp tìm nhanh mà không cần chờ Geocoding. Đây là tọa độ, không phải số liệu thời tiết giả. |
| `DATA-009` | 152 | Dữ liệu hiện tại từ API. number \| null cho phép biểu diễn giá trị bị thiếu mà không biến thành số 0. |
| `DATA-010` | 154 | Chuỗi thời gian ISO địa phương; mảng time là trục đối chiếu cho các mảng số liệu. |
| `DATA-011` | 156 | Nhiệt độ không khí ở cao độ 2 m, °C. |
| `DATA-012` | 158 | Độ ẩm tương đối ở 2 m, %. Không phải khả năng mưa. |
| `DATA-013` | 160 | Nhiệt độ cảm nhận, °C. |
| `DATA-014` | 162 | 1 là ban ngày, 0 là ban đêm; dùng để chọn mặt trời/mặt trăng. |
| `DATA-015` | 164 | Lượng giáng thủy, mm; khác với xác suất có mưa. |
| `DATA-016` | 166 | Mã trạng thái thời tiết WMO; weatherInfo đổi sang nhãn và icon. |
| `DATA-017` | 168 | Tỉ lệ mây che phủ, %. |
| `DATA-018` | 170 | Áp suất tại bề mặt, hPa. |
| `DATA-019` | 172 | Tốc độ gió ở độ cao 10 m, mặc định km/h. |
| `DATA-020` | 174 | Hướng gió THỔI TỪ, tính bằng độ; 0/360 là Bắc. |
| `DATA-021` | 176 | Tốc độ gió giật ở 10 m, km/h. |
| `DATA-022` | 179 | Dự báo từng giờ: mọi mảng dùng chung chỉ số i với time[i]. Ví dụ temperature_2m[i] thuộc giờ time[i]. |
| `DATA-023` | 181 | Chuỗi thời gian ISO địa phương; mảng time là trục đối chiếu cho các mảng số liệu. |
| `DATA-024` | 183 | Nhiệt độ không khí ở cao độ 2 m, °C. |
| `DATA-025` | 185 | Độ ẩm tương đối ở 2 m, %. Không phải khả năng mưa. |
| `DATA-026` | 187 | Khả năng có giáng thủy theo giờ, %. Không diễn giải là lượng mưa. |
| `DATA-027` | 189 | Lượng giáng thủy, mm; khác với xác suất có mưa. |
| `DATA-028` | 191 | Mã trạng thái thời tiết WMO; weatherInfo đổi sang nhãn và icon. |
| `DATA-029` | 193 | Tầm nhìn, m; giao diện đổi sang km khi cần. |
| `DATA-030` | 195 | Tốc độ gió ở độ cao 10 m, mặc định km/h. |
| `DATA-031` | 197 | Chỉ số UV theo giờ. |
| `DATA-032` | 199 | 1 là ban ngày, 0 là ban đêm; dùng để chọn mặt trời/mặt trăng. |
| `DATA-033` | 202 | Tổng hợp từng ngày: mọi mảng dùng chung chỉ số ngày, dùng để vẽ dự báo 7 ngày. |
| `DATA-034` | 204 | Chuỗi thời gian ISO địa phương; mảng time là trục đối chiếu cho các mảng số liệu. |
| `DATA-035` | 206 | Mã trạng thái thời tiết WMO; weatherInfo đổi sang nhãn và icon. |
| `DATA-036` | 208 | Nhiệt độ cao nhất ngày, °C. |
| `DATA-037` | 210 | Nhiệt độ thấp nhất ngày, °C. |
| `DATA-038` | 212 | Giờ mặt trời mọc từng ngày, GMT+7. |
| `DATA-039` | 214 | Giờ mặt trời lặn từng ngày, GMT+7. |
| `DATA-040` | 216 | Chỉ số UV lớn nhất ngày. |
| `DATA-041` | 218 | Tổng giáng thủy trong ngày, mm. |
| `DATA-042` | 220 | Khả năng giáng thủy lớn nhất trong ngày, %. |
| `DATA-043` | 222 | Tốc độ gió lớn nhất ngày, km/h. |
| `DATA-044` | 225 | Gói dữ liệu ứng dụng dùng: current + hourly + daily + tọa độ + thời điểm nhận fetchedAt. |
| `DATA-045` | 230 | Múi giờ phản hồi, yêu cầu là Asia/Ho_Chi_Minh. |
| `DATA-046` | 232 | Vĩ độ (độ). |
| `DATA-047` | 234 | Kinh độ (độ). |
| `DATA-048` | 236 | Thời điểm ứng dụng nhận gói dữ liệu; khác thời điểm dự báo current.time. |
| `DATA-049` | 239 | Dữ liệu rút gọn cho thẻ thành phố, không cần toàn bộ dự báo 7 ngày. |
| `DATA-050` | 241 | Mã nhận diện ổn định của địa điểm. |
| `DATA-051` | 243 | Nhiệt độ °C hoặc null; chỉ đổi sang °F khi hiển thị. |
| `DATA-052` | 245 | Mã WMO hoặc null. |
| `DATA-053` | 247 | Cờ ban ngày sau khi đổi từ số 1/0 thành boolean. |
| `DATA-054` | 250 | Union type: chỉ cho phép các tên nhóm thời tiết đã định nghĩa, dùng để chọn icon và màu. |
| `DATA-055` | 261 | Ánh xạ mã WMO thành mô tả tiếng Việt và nhóm icon; phân biệt trời quang ban ngày với ban đêm. |
| `DATA-079` | 266 | Kiểm tra null/undefined trước để không gán nhầm dữ liệu thiếu thành trời quang (mã 0). |
| `DATA-056` | 290 | Chuẩn hóa tiếng Việt: tách dấu Unicode, bỏ dấu, đổi đ thành d, viết thường và bỏ khoảng trắng ở hai đầu. |
| `DATA-080` | 293 | NFD tách chữ và dấu; biểu thức Unicode ở dòng sau mới xóa được phần dấu. |
| `DATA-057` | 300 | Đổi °C sang °F bằng C × 9/5 + 32; giữ null nếu thiếu số liệu. |
| `DATA-058` | 303 | Định dạng nhiệt độ làm tròn kèm ký hiệu °; thiếu số liệu thì hiển thị dấu —. |
| `DATA-059` | 306 | Định dạng số theo vi-VN và giới hạn số chữ số lẻ; không biến null thành số 0. |
| `DATA-060` | 313 | Hôm nay/Ngày mai cho hai ngày đầu; các ngày sau định dạng thứ trong tuần theo giờ Việt Nam. |
| `DATA-061` | 324 | Lấy ngày/tháng từ chuỗi ISO. Cắt chuỗi giữ đúng ngày GMT+7 do API trả về. |
| `DATA-062` | 327 | Lấy phần HH:mm từ chuỗi ISO; ?. và \|\| giúp trả — khi chưa có chuỗi. |
| `DATA-063` | 329 | Chia vòng tròn thành 8 hướng, làm tròn mỗi 45°. Kết quả mô tả hướng gió thổi từ. |
| `DATA-064` | 343 | Type guard kiểm tra dữ liệu đọc từ storage/tìm kiếm. Hộp tọa độ 7..24, 101..118 chỉ là vùng giới hạn rộng, không phải đường biên Việt Nam. |
| `DATA-065` | 359 | Chuẩn hóa một mốc cho giao diện: tách khóa ổn định key, thời gian thực, dấu Bây giờ và các chỉ số. |
| `DATA-066` | 361 | Khóa của giờ gốc, giúp React nhận diện phần tử dù nhãn Bây giờ đổi. |
| `DATA-067` | 363 | Chuỗi thời gian ISO địa phương; mảng time là trục đối chiếu cho các mảng số liệu. |
| `DATA-068` | 365 | true chỉ cho mốc đầu của hôm nay; các mốc tiếp theo là dự báo từng giờ. |
| `DATA-069` | 367 | Nhiệt độ °C hoặc null; chỉ đổi sang °F khi hiển thị. |
| `DATA-070` | 369 | Mã WMO hoặc null. |
| `DATA-071` | 371 | Cờ ban ngày sau khi đổi từ số 1/0 thành boolean. |
| `DATA-072` | 373 | Xác suất giáng thủy của giờ tương ứng, %. |
| `DATA-073` | 375 | Tốc độ gió, km/h. |
| `DATA-074` | 377 | Độ ẩm tương đối, %. |
| `DATA-075` | 382 | Tạo danh sách từng giờ cho component: Bây giờ → giờ tròn kế tiếp → các giờ sau; ngày khác có 00:00..23:00 nếu API cung cấp đủ. |
| `DATA-076` | 393 | Tìm chỉ số giờ chứa thời điểm current bằng cách so sánh đến YYYY-MM-DDTHH. Không bỏ qua mốc 00:00 khi qua ngày. |
| `DATA-081` | 397 | Không tìm thấy giờ hiện tại trong dữ liệu thì trả danh sách rỗng, không tự bịa mốc dự báo. |
| `DATA-077` | 399 | Hôm nay: lấy tối đa 24 mốc liên tiếp từ giờ hiện tại. Ngày tương lai: lấy mọi giờ có cùng tiền tố ngày. |
| `DATA-078` | 408 | Chỉ mốc đầu của hôm nay dùng dữ liệu current; các mốc còn lại dùng mảng hourly. |
| `DATA-082` | 411 | Khóa vẫn là giờ gốc để nhận diện phần tử; nhãn thời gian có thể hiển thị phút hiện tại. |
| `DATA-083` | 413 | Ví dụ current là 23:45: mốc đầu ghi Bây giờ (23:45), mốc kế tiếp là 00:00 ngày mai. |
| `DATA-084` | 424 | API không có xác suất mưa trong nhóm current đã chọn; mốc Bây giờ dùng xác suất của giờ tương ứng. ?? giữ số 0 hợp lệ. |

<a id="tep-src-lib-weather-client-ts"></a>
### [src/lib/weather-client.ts](src/lib/weather-client.ts)

Lấy dữ liệu Open-Meteo, lưu cache và chuẩn bị đầu vào dự báo.

| Ghi chú | Dòng | Đoạn code làm gì |
| --- | ---: | --- |
| `API-000` | 1 | TẦNG GỌI API: dựng URL, dùng cache, gộp yêu cầu trùng và chuyển lỗi mạng thành thông báo dễ hiểu. Không chứa giao diện. |
| `API-001` | 2 | Chỉ nhập kiểu dữ liệu để TypeScript kiểm tra đầu vào/đầu ra; import type không tạo mã JavaScript khi build. |
| `API-002` | 5 | TTL dự báo = 15 phút. 60_000 là 60.000 ms; dấu gạch dưới chỉ giúp đọc số. |
| `API-003` | 7 | Làm mới thủ công vẫn dùng cache nếu dữ liệu mới nhận chưa đủ 30 giây, tránh bấm liên tục gọi API. |
| `API-004` | 10 | Tiền tố cho khóa localStorage của tầng API, giúp phân biệt với cài đặt và yêu thích. |
| `API-005` | 12 | Cache là cặp giá trị + thời điểm nhận (mili giây). T là kiểu tổng quát: dùng được cho dự báo, thành phố và tìm kiếm. |
| `API-006` | 14 | Map cache trong RAM của tab hiện tại: tra cứu theo toàn bộ URL, nhanh hơn đọc/giải mã localStorage. |
| `API-007` | 16 | Map các Promise đang chạy. Hai nơi cùng hỏi một URL sẽ chờ chung một yêu cầu mạng. |
| `API-008` | 18 | Lưu thời điểm được phép gọi lại theo hostname khi nhà cung cấp trả HTTP 429. |
| `API-009` | 21 | Đọc JSON từ localStorage. try/catch xử lý dữ liệu hỏng hoặc trình duyệt chặn storage; khi đó trả undefined. |
| `API-010` | 32 | Ghi JSON vào localStorage. Nếu hết dung lượng hoặc bị chặn, phần cache RAM vẫn dùng được. |
| `API-032` | 41 | Lỗi riêng có mã status để phân biệt lỗi HTTP với lỗi mạng; message được đưa lên giao diện. |
| `API-011` | 49 | Tính số giây còn phải đợi, làm tròn lên và tạo thông báo HTTP 429 bằng tiếng Việt. |
| `API-012` | 54 | Retry-After có thể là số giây hoặc ngày HTTP. Nếu thiếu/không hợp lệ, chờ mặc định 60 giây. |
| `API-013` | 65 | Hàm gọi JSON dùng chung: cache → kiểm tra giới hạn → gộp yêu cầu → fetch → validate → lưu cache. force không bỏ qua giới hạn 30 giây. |
| `API-014` | 72 | Ưu tiên cache RAM; nếu chưa có thì đọc cache bền hơn trong localStorage. |
| `API-033` | 76 | Chỉ dùng cache khi dữ liệu hợp lệ và tuổi cache nhỏ hơn TTL; làm mới thủ công dùng mốc 30 giây. |
| `API-015` | 86 | Tách hostname để áp dụng thời gian chờ cho mọi địa điểm dùng chung nguồn API. |
| `API-016` | 88 | Kết hợp thời gian chờ trong RAM và localStorage; tải lại trang cũng không bỏ qua Retry-After. |
| `API-034` | 93 | Đang trong thời gian chờ thì báo lỗi ngay, không gửi request mới đến nguồn. |
| `API-017` | 96 | Nếu URL này đang tải, tái sử dụng Promise thay vì tạo thêm fetch. |
| `API-035` | 98 | Trả cùng Promise cho các lời gọi đồng thời của cùng URL. |
| `API-018` | 101 | Tạo tác vụ bất đồng bộ dùng chung; IIFE async chạy ngay và trả về một Promise. |
| `API-019` | 103 | Bộ điều khiển cho yêu cầu mạng thực sự; timeout bên dưới gọi abort để ngắt fetch. |
| `API-020` | 105 | Hủy fetch sau 18 giây để ứng dụng không chờ vô hạn khi đường truyền gặp lỗi. |
| `API-021` | 110 | fetch gửi HTTP GET trực tiếp từ trình duyệt. credentials omit không gửi cookie đến nhà cung cấp. |
| `API-036` | 117 | 429 nghĩa là quá nhiều yêu cầu: ghi hạn chờ theo nguồn, rồi dừng để người dùng thử lại sau. |
| `API-022` | 119 | Đọc Retry-After, chuyển thành thời điểm được thử lại rồi dùng cho thông báo và cache giới hạn. |
| `API-037` | 125 | Các HTTP lỗi khác không được coi là dữ liệu thời tiết hợp lệ. |
| `API-023` | 131 | Giải mã JSON; ép kiểu T chỉ giúp kiểm tra khi viết code, nên vẫn cần validate ở bước kế tiếp. |
| `API-038` | 133 | Chặn JSON thiếu các trường chính trước khi lưu cache; tránh giữ lại phản hồi không sử dụng được. |
| `API-024` | 138 | Ghi thời điểm nhận mới đúng một lần; đọc cache không làm dữ liệu cũ trở thành dữ liệu mới. |
| `API-039` | 140 | Giới hạn cache RAM khoảng 60 URL bằng cách bỏ khóa được chèn sớm nhất; đây không phải thuật toán LRU đầy đủ. |
| `API-040` | 151 | finally luôn dọn bộ hẹn giờ, kể cả khi fetch thành công, thất bại hoặc bị hủy. |
| `API-041` | 155 | Đăng ký tác vụ ngay để các nơi gọi tiếp theo có thể dùng chung. |
| `API-042` | 160 | Xóa dấu đang tải sau khi hoàn thành để lần cần cập nhật sau có thể gọi lại. |
| `API-025` | 182 | Dựng URL dự báo từ tọa độ. URLSearchParams mã hóa tham số; timezone cố định GMT+7, lấy 7 ngày. |
| `API-044` | 189 | Nhóm giá trị hiện tại: nhiệt độ, độ ẩm, cảm nhận, ngày/đêm, mưa, mây, áp suất và gió. |
| `API-045` | 192 | Nhóm mảng theo từng giờ, dùng cho biểu đồ và thông tin từng mốc thời gian. |
| `API-046` | 195 | Nhóm tổng hợp theo ngày, dùng cho danh sách 7 ngày và giờ mặt trời mọc/lặn. |
| `API-026` | 201 | Lấy dự báo của một địa điểm, kiểm tra ba nhóm dữ liệu chính và bổ sung fetchedAt (lúc ứng dụng nhận dữ liệu). |
| `API-051` | 217 | Dữ liệu đầu vào mô hình gồm một trục giờ và một mảng số liệu cho mỗi cột được yêu cầu. |
| `API-052` | 227 | Random Forest, Gradient Boosting và Chronos lấy cùng năm chỉ số thời tiết theo giờ. |
| `API-053` | 237 | Lấy dữ liệu riêng cho mô hình từ Open-Meteo và kiểm tra các cột có đủ phần tử tương ứng với trục giờ. |
| `API-054` | 270 | Làm tròn mốc thời gian hiện tại xuống đầu giờ Việt Nam và tìm điểm cắt trong mảng giờ. |
| `API-055` | 279 | Lấy ba ngày trước cho Random Forest và Gradient Boosting. Phần tương lai được cắt trước khi gửi Python. |
| `API-056` | 284 | Chronos lấy lịch sử dài hơn và chỉ dùng gói dữ liệu đến mốc hiện tại. |
| `API-057` | 290 | Cắt đồng thời các cột đến cùng một mốc. Nhiệt độ giờ sau lấy từ API chỉ để đối chiếu trên giao diện. |
| `API-058` | 312 | Holt–Winters chỉ cần một chuỗi nhiệt độ. Cắt bỏ các giờ sau mốc hiện tại. |
| `API-027` | 329 | Mô tả phần JSON tối thiểu cần đọc khi lấy tóm tắt nhiều thành phố cùng lúc. |
| `API-028` | 337 | Gộp các tọa độ vào một request. Thứ tự phản hồi tương ứng thứ tự places, nên phải kiểm tra số phần tử. |
| `API-047` | 343 | Nối các vĩ độ bằng dấu phẩy; kinh độ bên dưới phải giữ đúng cùng thứ tự địa điểm. |
| `API-029` | 369 | Cấu trúc một kết quả địa danh do Geocoding API trả về, trước khi đổi sang kiểu Place của ứng dụng. |
| `API-030` | 378 | Tìm địa danh Việt Nam bằng Open-Meteo Geocoding; cache từ khóa 1 giờ và đổi kết quả về kiểu Place. |
| `API-031` | 380 | Xóa khoảng trắng thừa và giới hạn từ khóa 80 ký tự trước khi đưa vào URL. |
| `API-048` | 382 | Không gọi tìm kiếm cho từ khóa quá ngắn để giảm request và kết quả nhiễu. |
| `API-049` | 388 | Giới hạn tìm kiếm ở Việt Nam ngay trong tham số API. |
| `API-050` | 397 | Kiểm tra lại mã quốc gia trên phản hồi trước khi hiển thị. |

<a id="tep-src-lib-ml-client-ts"></a>
### [src/lib/ml-client.ts](src/lib/ml-client.ts)

Kiểu dữ liệu và hàm gửi yêu cầu đến API cục bộ của Python.

| Ghi chú | Dòng | Đoạn code làm gì |
| --- | ---: | --- |
| `ML-CLIENT-001` | 1 | Định nghĩa phản hồi của API mô hình trong app.py và cung cấp hàm gọi API cho các khung dự báo. |
| `ML-CLIENT-003` | 3 | Báo cáo Random Forest ghi mốc chia tập, sai số, độ quan trọng đặc trưng và các điểm để vẽ biểu đồ. |
| `ML-CLIENT-004` | 34 | Trạng thái cho biết có thể huấn luyện, dự báo hay cần xử lý lỗi trước. |
| `ML-CLIENT-005` | 41 | Kết quả dự báo lưu cả nhiệt độ đầu vào, mức thay đổi và giờ mục tiêu để hiển thị rõ ba giá trị. |
| `ML-CLIENT-002` | 53 | Mặc định chờ tối đa 15 giây. Khung dự báo có thể đổi giới hạn này và hủy yêu cầu khi bị tháo. |
| `ML-CLIENT-006` | 71 | Nếu route trả về một trang HTML, nhắc người dùng mở qua Python hoặc cấu hình Vite proxy. |
| `ML-CLIENT-007` | 78 | Giữ lỗi thiếu thư viện ở dạng trạng thái để khung có thể hiện hướng dẫn cài đặt. |
| `ML-CLIENT-008` | 95 | Ghép tọa độ vào URL để lấy trạng thái hoặc tải CSV của đúng địa điểm. |
| `ML-CLIENT-009` | 104 | Gửi tọa độ và dữ liệu đầu vào dưới dạng JSON cho thao tác huấn luyện hoặc dự báo Random Forest. |

<a id="tep-src-index-css"></a>
### [src/index.css](src/index.css)

Bố cục, màu, kiểu chữ và các quy tắc giao diện chung.

| Ghi chú | Dòng | Đoạn code làm gì |
| --- | ---: | --- |
| `CSS-000` | 1 | Kiểu nền cho toàn ứng dụng, gồm bố cục, màu, icon thời tiết và các kích thước màn hình. |
| `CSS-001` | 2 | Nạp font Manrope từ file trong public/fonts; không phải tải từ Google Fonts khi mở trang. |
| `CSS-002` | 21 | Biến thiết kế dùng chung: nền, thẻ, chữ, đường viền, màu nhấn và bo góc. glass-update.css sẽ ghi đè một số biến. |
| `CSS-003` | 36 | Bộ màu tối; được bật khi React đặt data-theme="dark" trên thẻ html. |
| `CSS-004` | 50 | Tính kích thước gồm cả padding/border, giúp grid và responsive dễ kiểm soát. |
| `CSS-005` | 54 | Thiết lập cuộn mượt và khoảng chừa khi cuộn đến mục dự báo. |
| `CSS-006` | 59 | Thiết lập font, cỡ chữ và màu nền/chữ toàn trang. |
| `CSS-007` | 92 | Viền focus hỗ trợ điều khiển bàn phím, áp dụng cho nút và liên kết. |
| `CSS-008` | 128 | Khung bao toàn ứng dụng; các vùng con tạo bố cục chi tiết. |
| `CSS-009` | 132 | Liên kết Đến nội dung chính chỉ hiện khi focus để bỏ qua thanh điều hướng. |
| `CSS-010` | 146 | Thanh điều hướng bên trái; các media query phía cuối đổi thành menu cho màn hình nhỏ. |
| `CSS-072` | 156 | Cho thanh bên cuộn riêng khi các mục điều hướng dài hơn chiều cao màn hình. |
| `CSS-011` | 164 | Sắp xếp biểu tượng và chữ thương hiệu. |
| `CSS-012` | 205 | Bố cục các nút điều hướng chính. |
| `CSS-013` | 211 | Kiểu nút điều hướng; .active và :hover đổi màu theo trạng thái. |
| `CSS-014` | 270 | Danh sách địa điểm đã lưu ở thanh bên. |
| `CSS-015` | 312 | Thẻ trang trí nhỏ cuối thanh điều hướng. |
| `CSS-016` | 398 | Vùng nội dung bên phải thanh điều hướng. |
| `CSS-017` | 404 | Hàng tiêu đề và các thao tác tìm kiếm/cài đặt. |
| `CSS-018` | 454 | Khung định vị danh sách kết quả tìm kiếm so với input. |
| `CSS-019` | 460 | Bề mặt và bố cục ô tìm kiếm; input nhận dữ liệu từ React state. |
| `CSS-020` | 499 | Nút chỉ có icon; aria-label được khai báo ở JSX để mô tả chức năng. |
| `CSS-021` | 519 | Bảng nổi chọn đơn vị và giao diện, dùng z-index để nằm trên nội dung. |
| `CSS-022` | 574 | Danh sách gợi ý nổi bên dưới ô tìm kiếm. |
| `CSS-023` | 658 | Tab địa điểm và trạng thái cập nhật dữ liệu. |
| `CSS-024` | 733 | Khung thông báo lỗi mạng/nguồn dữ liệu với nút thử lại. |
| `CSS-025` | 756 | Grid bố cục chính hai cột trên laptop rộng; responsive ở cuối file thay đổi theo màn hình. |
| `CSS-026` | 769 | Kiểu thẻ chung. File glass-update.css thay nền/viền/bóng để có độ trong nhẹ. |
| `CSS-027` | 776 | Thẻ thời tiết hiện tại với nền chuyển màu; phiên bản ban đêm dùng .current-night. |
| `CSS-028` | 859 | Kiểu chữ số nhiệt độ lớn; đơn vị có kiểu nhỏ riêng. |
| `CSS-029` | 903 | Các chỉ số tóm tắt bên dưới nhiệt độ. |
| `CSS-030` | 940 | Khung minh họa CSS; các lớp scene-sun/cloud/rain tạo hình bằng màu, bóng và phần tử giả. |
| `CSS-031` | 965 | Hình mặt trời bằng CSS, không cần tải ảnh bên ngoài. |
| `CSS-032` | 986 | Hình mặt trăng bằng CSS. |
| `CSS-033` | 1007 | Hình mây; ::before/::after và các lớp trước/sau thêm các khối tròn. |
| `CSS-034` | 1064 | Những nét mưa trang trí chỉ xuất hiện khi mã thời tiết thuộc nhóm mưa. |
| `CSS-035` | 1125 | Bảng màu thẻ hiện tại khi API cho is_day = 0. |
| `CSS-036` | 1177 | Khung chờ có chuyển động nhẹ trong lúc dữ liệu đang tải; không chứa số liệu giả. |
| `CSS-037` | 1212 | Trạng thái chưa có dữ liệu và nút tải lại. |
| `CSS-038` | 1259 | Khung dự báo theo giờ; phần bố cục cuộn mới được ghi đè trong glass-update.css. |
| `CSS-039` | 1271 | Ba nút chuyển biểu đồ nhiệt độ/mưa/gió. |
| `CSS-040` | 1298 | Khung nổi hiển thị giá trị khi rê chuột trên biểu đồ. |
| `CSS-041` | 1321 | Kiểu hàng thẻ giờ nền tảng; glass-update.css đổi sang số cột động để giữ đủ từng giờ. |
| `CSS-042` | 1359 | Màu mặc định của icon; các lớp weather-rain/moon/... đổi theo nhóm thời tiết. |
| `CSS-043` | 1412 | Grid các chỉ số nổi bật: UV, gió, độ ẩm, tầm nhìn, mây và áp suất. |
| `CSS-044` | 1496 | Thanh màu UV; vị trí con trỏ do dữ liệu trong JSX quyết định. |
| `CSS-045` | 1547 | La bàn gió trang trí; hướng chữ và phép quay nằm trong JSX. |
| `CSS-046` | 1575 | Thanh tỉ lệ độ ẩm; độ rộng được truyền từ dữ liệu %. |
| `CSS-047` | 1642 | Khung dự báo 7 ngày bên phải. |
| `CSS-048` | 1660 | Mỗi hàng là một ngày; lớp selected đánh dấu ngày đang xem chi tiết. |
| `CSS-049` | 1741 | Mưa và gió của ngày đang chọn. |
| `CSS-050` | 1781 | Khung giờ bình minh và hoàng hôn. |
| `CSS-051` | 1837 | Thẻ lời nhắc hằng ngày, nội dung được tạo bằng quy tắc trong weather-app.tsx. |
| `CSS-052` | 1902 | Grid các thành phố gợi ý; số liệu đến từ request batch. |
| `CSS-053` | 2015 | Hình trang trí từng thành phố bằng CSS, không phải bản đồ hoặc ảnh đo đạc. |
| `CSS-054` | 2081 | Chân trang ghi nguồn và thời điểm dữ liệu. |
| `CSS-055` | 2162 | Grid địa điểm đã lưu; thay đổi số cột theo màn hình. |
| `CSS-056` | 2220 | Nội dung hướng dẫn khi người dùng chưa lưu địa điểm nào. |
| `CSS-057` | 2263 | Thông báo ngắn, nổi trên nội dung; timer trong React tự ẩn sau 3,8 giây. |
| `CSS-058` | 2293 | Lớp phủ phía sau hộp thông tin nguồn dữ liệu. |
| `CSS-059` | 2306 | Khung thông tin về ứng dụng và nhà cung cấp API. |
| `CSS-060` | 2446 | Định nghĩa chuyển động nền cho skeleton tải dữ liệu. |
| `CSS-061` | 2455 | Định nghĩa chuyển động quay cho biểu tượng đang tải. |
| `CSS-062` | 2461 | Hiệu ứng xuất hiện của toast. |
| `CSS-063` | 2472 | Màn hình lớn: tăng không gian và kích thước đọc; không thay đổi dữ liệu. |
| `CSS-064` | 2541 | Điều chỉnh riêng cho màn hình rất rộng. |
| `CSS-065` | 2549 | Laptop hẹp: thu gọn kích thước và khoảng cách của bố cục. |
| `CSS-066` | 2781 | Màn hình vừa: điều chỉnh các cột/thẻ để tránh tràn ngang toàn trang. |
| `CSS-067` | 3005 | Tablet: sắp xếp lại vùng điều hướng và nội dung. |
| `CSS-068` | 3203 | Điện thoại: hiển thị menu thu gọn và bố cục ưu tiên chiều dọc. |
| `CSS-069` | 3611 | Điện thoại nhỏ: tiếp tục giảm khoảng cách và kích thước điều khiển phù hợp. |
| `CSS-070` | 4097 | Thông báo khi chưa tải được dự báo ngày, tách khỏi trạng thái skeleton. |
| `CSS-071` | 4116 | Giảm chuyển động theo tùy chọn trợ năng của hệ điều hành/trình duyệt. |

<a id="tep-src-glass-update-css"></a>
### [src/glass-update.css](src/glass-update.css)

Hiệu ứng nền kính mờ và một số điều chỉnh bố cục.

| Ghi chú | Dòng | Đoạn code làm gì |
| --- | ---: | --- |
| `GLASS-000` | 1 | Nạp sau kiểu nền để áp dụng bảng màu kính mờ và bố cục cuộn theo giờ. |
| `GLASS-001` | 3 | Ghi đè biến thiết kế sáng: nền pastel, thẻ bán trong suốt, viền sáng và bóng nhẹ. |
| `GLASS-002` | 6 | Alpha 0.76 nghĩa là nền thẻ có độ đục 76%; giảm số cuối để nhìn xuyên nhiều hơn. Không làm mờ chữ bên trong. |
| `GLASS-003` | 9 | Độ đục riêng cho thanh bên, độc lập với thẻ nội dung. |
| `GLASS-004` | 11 | Bảng nổi gần đặc hơn để chữ vẫn dễ đọc trên nội dung phía sau. |
| `GLASS-005` | 15 | Ba lớp radial-gradient tạo vùng sáng mềm thay vì một nền phẳng. |
| `GLASS-006` | 33 | Các biến kính mờ tương ứng cho giao diện tối, tránh dùng màu trắng trong suốt quá sáng. |
| `GLASS-007` | 64 | Lớp màu nền cố định; pointer-events none cho phép bấm xuyên qua lớp trang trí. |
| `GLASS-008` | 73 | Bo góc, viền và bóng chung giúp bề mặt thẻ mềm hơn. |
| `GLASS-009` | 85 | Làm mờ và tăng nhẹ độ bão hòa của NỀN SAU bề mặt, không làm nhòe chữ. Dòng -webkit- hỗ trợ trình duyệt tương ứng. |
| `GLASS-010` | 89 | Thanh bên dùng biến nền bán trong suốt riêng. |
| `GLASS-011` | 100 | Gradient RGBA cho thẻ hiện tại; alpha chỉ áp dụng nền, không dùng opacity toàn thẻ. |
| `GLASS-012` | 115 | Thẻ ban đêm dùng gradient đậm để giữ tương phản. |
| `GLASS-013` | 132 | Thẻ thành phố dùng nền và blur riêng; các lớp city-1/2/3 đổi sắc thái. |
| `GLASS-014` | 148 | Thẻ gợi ý dùng màu xanh dịu, bán trong suốt. |
| `GLASS-015` | 174 | Cho khung theo giờ được co trong grid (min-width 0), nội dung dài cuộn ở vùng con. |
| `GLASS-016` | 179 | Đặt tab chỉ số và nút mũi tên trên cùng một hàng. |
| `GLASS-017` | 191 | Nhóm mũi tên không bị co khi khung hẹp. |
| `GLASS-018` | 212 | Nút ở đầu/cuối vùng cuộn được giảm độ nổi bật và không còn tác dụng. |
| `GLASS-019` | 217 | Dòng hướng dẫn cuộn và số mốc dữ liệu thật. |
| `GLASS-020` | 241 | Chỉ vùng biểu đồ/thẻ cuộn ngang; chặn tràn sang toàn trang. |
| `GLASS-021` | 244 | Bật thanh cuộn ngang khi 24 mốc rộng hơn vùng hiển thị. |
| `GLASS-022` | 261 | Khung bên trong có độ rộng do React tính theo số giờ ×72 +32. |
| `GLASS-023` | 265 | Giữ chiều cao biểu đồ ổn định, trong khi độ rộng theo toàn bộ danh sách giờ. |
| `GLASS-024` | 270 | Lưới có số cột do JSX truyền; padding trái dành cho trục Y rộng 32 px. |
| `GLASS-025` | 279 | Mỗi nút giờ chứa thời gian, ngày, icon, nhiệt độ và xác suất mưa. |
| `GLASS-026` | 319 | Đánh dấu mốc được chọn để đọc chi tiết bên dưới. |
| `GLASS-027` | 333 | Khung chi tiết giữ vị trí ngoài vùng cuộn ngang. |
| `GLASS-028` | 372 | Sắp xếp bốn chỉ số nhiệt độ, mưa, gió và độ ẩm. |
| `GLASS-029` | 392 | Hàng nút nguồn và liên kết dữ liệu gốc phía cuối thẻ. |
| `GLASS-030` | 419 | Khối công khai API trong hộp thông tin; URL dài được phép xuống dòng. |
| `GLASS-031` | 458 | Fallback nền đặc khi trình duyệt không hỗ trợ backdrop-filter, giữ chữ dễ đọc. |
| `GLASS-032` | 471 | Thu gọn các điều khiển theo giờ trên màn hình vừa. |
| `GLASS-033` | 494 | Điều chỉnh độ lớn nút/chữ cho điện thoại. |
| `GLASS-034` | 514 | Tối ưu khoảng cách trên màn hình nhỏ; vẫn giữ STEP 72 px để không lệch mốc. |

<a id="tep-src-random-forest-css"></a>
### [src/random-forest.css](src/random-forest.css)

Kiểu hiển thị khung Random Forest và biểu đồ so sánh.

| Ghi chú | Dòng | Đoạn code làm gì |
| --- | ---: | --- |
| `RF-CSS-001` | 1 | Kiểu riêng cho khung Random Forest, từ dự báo hiện tại đến biểu đồ và bảng kiểm thử. |
| `RF-CSS-006` | 44 | Nhãn ở đầu thẻ đổi màu khi mô hình sẵn sàng hoặc đang huấn luyện. |
| `RF-CSS-002` | 75 | Ba ô so sánh RF/API/thay đổi nhiệt độ; giá trị thiếu hiển thị — thay vì số mẫu giả. |
| `RF-CSS-007` | 154 | Đặt thông tin lần chạy bên trái và nút thao tác bên phải. |
| `RF-CSS-008` | 181 | Các ô số liệu kiểm thử và ghi chú kết quả so với cách giữ nguyên nhiệt độ. |
| `RF-CSS-003` | 239 | Details giúp giao diện chính gọn, vẫn mở được biểu đồ và số liệu để làm báo cáo C3/C4. |
| `RF-CSS-009` | 318 | Giữ bảng chỉ số trong khung cuộn ngang khi các cột cần thêm chỗ. |
| `RF-CSS-010` | 349 | Mỗi thanh có độ dài do giao diện truyền vào theo mức đóng góp của đặc trưng. |
| `RF-CSS-004` | 421 | Trạng thái chờ/lỗi có lời giải thích và nút thao tác, không sinh nhiệt độ/sai số giả. |
| `RF-CSS-011` | 496 | Thanh chạy qua lại báo tác vụ còn đang chạy, không biểu diễn phần trăm hoàn thành. |
| `RF-CSS-005` | 518 | Các cột chuyển thành bố cục nhỏ hơn trên điện thoại; không thay dữ liệu hoặc đơn vị. |
| `RF-CSS-012` | 608 | Hiển thị thanh chờ tĩnh khi người dùng bật chế độ giảm chuyển động. |

<a id="tep-src-time-series-css"></a>
### [src/time-series.css](src/time-series.css)

Kiểu hiển thị chung và màu riêng của ba khung dự báo bổ sung.

| Ghi chú | Dòng | Đoạn code làm gì |
| --- | ---: | --- |
| `SERIES-CSS-001` | 1 | Kiểu chung cho khung Time Series, Gradient Boosting và Chronos. |
| `SERIES-CSS-002` | 12 | Đổi màu chữ và các đường biểu đồ cho nền tối. |
| `SERIES-CSS-003` | 20 | Gradient Boosting và Chronos có màu nhấn riêng qua thuộc tính data-variant. |
| `SERIES-CSS-004` | 41 | Đặt biểu tượng, tên mô hình và trạng thái trên cùng một hàng. |
| `SERIES-CSS-005` | 73 | Giữ nhãn trạng thái đủ rộng và đổi màu khi mô hình sẵn sàng. |
| `SERIES-CSS-006` | 94 | Thông báo và kết quả có thể xuống dòng để nút vẫn vừa khi thẻ hẹp. |
| `SERIES-CSS-007` | 119 | Kiểu nút huấn luyện và dự báo, chỉ đổi viền khi nút còn dùng được. |
| `SERIES-CSS-008` | 145 | Nhấn mạnh số nhiệt độ, phần đơn vị dùng cỡ chữ nhỏ hơn. |
| `SERIES-CSS-009` | 165 | Chú giải dùng đúng màu của từng đường, với nét đứt cho Random Forest. |
| `SERIES-CSS-010` | 197 | Giữ biểu đồ trong chiều rộng thẻ và giới hạn chiều cao theo màn hình. |
| `SERIES-CSS-011` | 207 | Bảng sai số canh phải các số và cho tên dài xuống dòng ở cột đầu. |
| `SERIES-CSS-012` | 243 | Trên điện thoại, nhãn trạng thái chuyển xuống dưới tên mô hình. |

<a id="tep-src-weather-assistant-css"></a>
### [src/weather-assistant.css](src/weather-assistant.css)

Bố cục ô nhập, nút thao tác và vùng câu trả lời Qwen.

| Ghi chú | Dòng | Đoạn code làm gì |
| --- | ---: | --- |
| `QA-CSS-001` | 1 | Kiểu khung Hỏi đáp thời tiết, gồm trạng thái Qwen, ô hỏi và câu trả lời. |
| `QA-CSS-002` | 11 | Dùng cặp màu nhấn sáng hơn để giữ tương phản trong giao diện tối. |
| `QA-CSS-003` | 17 | Xếp biểu tượng, tiêu đề và nhãn trạng thái theo hàng ngang. |
| `QA-CSS-004` | 49 | Tô màu nhãn riêng khi mô hình đã nạp và có thể nhận câu hỏi. |
| `QA-CSS-005` | 70 | Dùng chung khoảng cách cho thông báo chuẩn bị mô hình và khung câu trả lời. |
| `QA-CSS-006` | 91 | Ô nhập chiếm chiều ngang của thẻ và có thể kéo cao thêm. |
| `QA-CSS-007` | 120 | Các câu hỏi gợi ý và nút gửi xuống dòng khi hàng ngang hết chỗ. |
| `QA-CSS-008` | 135 | Nút gửi và nút gợi ý dùng cùng bộ màu. Câu hỏi gợi ý có hình dạng gọn hơn. |
| `QA-CSS-009` | 166 | Thêm viền rõ khi người dùng dùng bàn phím để chuyển giữa các điều khiển. |
| `QA-CSS-010` | 187 | Giữ các xuống dòng trong câu trả lời và ngắt từ quá dài để thẻ không tràn ngang. |
| `QA-CSS-011` | 196 | Trên điện thoại, đưa nhãn trạng thái xuống hàng và đặt nút gửi về bên phải. |

<a id="tep-public-favicon-svg"></a>
### [public/favicon.svg](public/favicon.svg)

Biểu tượng Mây Việt hiện trên tab trình duyệt.

| Dòng | Nội dung |
| ---: | --- |
| 1 | `viewBox` đặt hệ tọa độ 64 × 64. `rect` vẽ nền xanh, `circle` vẽ mặt trời và `path` vẽ đám mây. |

<a id="tep-public-manifest-webmanifest"></a>
### [public/manifest.webmanifest](public/manifest.webmanifest)

Tên, màu và biểu tượng khi mở ứng dụng web từ màn hình chính.

| Dòng | Nội dung |
| ---: | --- |
| 2, 3, 4, 5 | `name`, `short_name`, `description`, `lang` — Thông tin hiển thị và ngôn ngữ của ứng dụng web. |
| 6, 7 | `start_url`, `display` — Đường dẫn mở và kiểu cửa sổ khi mở từ màn hình chính. |
| 8, 9, 10 | `background_color`, `theme_color`, `icons` — Màu giao diện và biểu tượng được trình duyệt dùng khi mở. |

<a id="tep-tests-test-app-py"></a>
### [tests/test_app.py](tests/test_app.py)

Kiểm tra HTTP, đường dẫn tĩnh, cách chọn cổng và khởi chạy Python.

| Ghi chú | Dòng | Đoạn code làm gì |
| --- | ---: | --- |
| `TEST-PY-000` | 6 | Kiểm tra đường dẫn, phản hồi HTTP và cách app.py khởi động máy chủ trên máy người dùng. |
| `TEST-PY-001` | 28 | Xin hệ điều hành một cổng trống; make_server vẫn tự bind/thử lại để tránh cổng bị chiếm sau đó. |
| `TEST-PY-002` | 38 | Gửi một request thật và đọc hết phản hồi; always close để bài kiểm tra không giữ kết nối. |
| `TEST-PY-003` | 49 | Mỗi bài có thư mục tạm riêng; dữ liệu kiểm tra không được dùng làm thời tiết của app. |
| `TEST-PY-004` | 67 | Cổng 0 chỉ dùng nội bộ test để hệ điều hành cấp cổng, không phải tùy chọn CLI của người dùng. |
| `TEST-PY-005` | 73 | Luôn dừng máy chủ trước khi xóa thư mục tạm; không để lại tiến trình/cổng sau test. |
| `TEST-PY-006` | 81 | Trang chủ phải tải đúng bytes UTF-8 và có header ngăn cache giao diện cũ. |
| `TEST-PY-007` | 91 | JS/CSS/font/manifest phải có MIME đúng, kể cả trên Windows có registry MIME khác. |
| `TEST-PY-008` | 105 | HEAD phải có kích thước thật nhưng không gửi body. |
| `TEST-PY-009` | 112 | Query cập nhật cache không được trở thành một phần tên file. |
| `TEST-PY-010` | 118 | URL có tiếng Việt và khoảng trắng mã hóa vẫn đọc đúng file. |
| `TEST-PY-011` | 124 | File thiếu trả 404, không gửi index.html giả thành JavaScript. |
| `TEST-PY-012` | 129 | Không mở danh sách file khi yêu cầu thư mục không có index.html. |
| `TEST-PY-013` | 135 | Phương thức ghi bị từ chối và phản hồi nêu rõ chỉ hỗ trợ GET/HEAD. |
| `TEST-PY-014` | 145 | Chặn cả .. bình thường và dạng mã hóa, không làm lộ file nằm ngoài dist. |
| `TEST-PY-015` | 153 | UTF-8 sai, NUL và đường dẫn dùng gạch chéo Windows đều trả 400. |
| `TEST-PY-016` | 159 | Symlink không được dùng để đi vòng qua kiểm tra thư mục gốc; Windows có thể cần quyền tạo symlink. |
| `TEST-PY-017` | 169 | Kiểm tra riêng index.html là symlink, không chỉ file được yêu cầu trực tiếp. |
| `TEST-PY-018` | 179 | Nhiều tài nguyên tải đồng thời đều nhận đúng dữ liệu, không xung đột trạng thái giữa các request. |
| `TEST-PY-028` | 186 | Nhóm sau kiểm tra cách chạy app khi đổi cổng, thư mục hoặc trình duyệt. |
| `TEST-PY-019` | 188 | Chiếm một cổng thật rồi kiểm tra ứng dụng tự chuyển sang cổng lân cận, vẫn chỉ bind localhost. |
| `TEST-PY-020` | 199 | Đầu vào CLI sai phải báo lỗi và thoát, không bắt đầu server hay mở trình duyệt. |
| `TEST-PY-021` | 211 | Nếu chỉ chép app.py thiếu dist, hiển thị hướng dẫn giải nén thay vì lỗi traceback. |
| `TEST-PY-022` | 221 | Không có trình duyệt mặc định không làm crash ứng dụng; người dùng vẫn nhận URL để mở tay. |
| `TEST-PY-023` | 228 | Chạy CLI thật trong thư mục có dấu/khoảng trắng, từ CWD khác; tải bản dist thật và mọi tài nguyên chính. |
| `TEST-PY-024` | 258 | Font nằm trong CSS nên kiểm tra thêm mọi URL font cục bộ. |
| `TEST-PY-025` | 268 | Trên POSIX, gửi SIGINT tương đương Ctrl+C và xác nhận dọn dẹp/thoát bình thường. |
| `TEST-PY-026` | 274 | Windows dùng terminate để dọn tiến trình test; tránh gửi Ctrl+C vào terminal của người dùng. |
| `TEST-PY-027` | 284 | Cho phép chạy trực tiếp python tests/test_app.py khi thư mục gốc có trong PYTHONPATH; ưu tiên lệnh discover ở đầu file. |

<a id="tep-tests-test-weather-ml-py"></a>
### [tests/test_weather_ml.py](tests/test_weather_ml.py)

Kiểm tra dữ liệu, mô hình Random Forest và các API dự báo cục bộ.

| Ghi chú | Dòng | Đoạn code làm gì |
| --- | ---: | --- |
| `RF-TEST-000` | 5 | Kiểm tra tính năng Random Forest, dữ liệu lịch sử và các API mô hình trên localhost. |
| `RF-TEST-001` | 24 | Chuỗi 60 ngày giả lập có chu kỳ giờ để kiểm tra thuật toán; không download mạng khi chạy test. |
| `RF-TEST-013` | 38 | Chuyển các hàng theo giờ thành mảng theo trường, giống yêu cầu gửi từ giao diện. |
| `RF-TEST-014` | 43 | Huấn luyện một lần trên dữ liệu mẫu, rồi lưu bản riêng trong thư mục tạm cho từng bài. |
| `RF-TEST-002` | 58 | Mô hình đúng lớp RandomForestRegressor, không phải lấy API hoặc Persistence đổi nhãn thành RF. |
| `RF-TEST-003` | 64 | Thay nhiệt độ tương lai không đổi vector đặc trưng tại t; nhãn y phải thay đổi đúng. |
| `RF-TEST-004` | 77 | Khoảng thiếu giờ không được biến thành lag 1h nhờ việc đánh lại chỉ số. |
| `RF-TEST-005` | 87 | Train kết thúc trước anchor của test; số dòng báo cáo cộng với gap phải khớp số mẫu thực. |
| `RF-TEST-006` | 93 | Tự tính lại MAE/RMSE từ holdout xuất CSV; baseline đúng là nhiệt độ giờ trước. |
| `RF-TEST-007` | 105 | Predict cũng loại dữ liệu tương lai, không chỉ pipeline train. |
| `RF-TEST-015` | 116 | Thiếu cửa sổ 25 giờ thì yêu cầu bị từ chối. |
| `RF-TEST-008` | 122 | Chọn địa điểm khác không được nhận model/metrics của TP.HCM. |
| `RF-TEST-016` | 128 | Từ chối tọa độ không hữu hạn, sai kiểu hoặc nằm ngoài khoảng cho phép. |
| `RF-TEST-017` | 134 | Bộ dữ liệu quá ít phải báo lỗi trước khi huấn luyện. |
| `RF-TEST-009` | 139 | Metadata khác phiên bản sklearn không được nạp; CSV lịch sử vẫn có thể dùng để refit. |
| `RF-TEST-018` | 149 | Sửa CSV đã lưu và kiểm tra mã băm phát hiện nội dung thay đổi. |
| `RF-TEST-010` | 157 | Tải lại artifact giữ nguyên dự đoán; CSV holdout đủ dòng và có BOM cho Excel. |
| `RF-TEST-011` | 167 | HTTP 429 giữ cooldown dùng chung cho địa điểm khác; không gọi URL nguồn lần thứ hai. |
| `RF-TEST-012` | 177 | Hai lần bấm train cùng lúc không tạo hai tác vụ; status trả ngay và chuyển ready sau khi lưu. |
| `RF-HTTP-TEST-004` | 198 | Chạy máy chủ trên một cổng tạm với dữ liệu riêng của bài kiểm tra. |
| `RF-HTTP-TEST-005` | 224 | Gửi yêu cầu HTTP thật, lấy mã trạng thái, tiêu đề và nội dung phản hồi. |
| `RF-HTTP-TEST-001` | 235 | Kiểm tra HTTP thật nối vào model thật đã fit trong fixture, không mock kết quả predict. |
| `RF-HTTP-TEST-006` | 246 | Huấn luyện Holt–Winters qua API, chờ sẵn sàng rồi kiểm tra dự báo sau khi nạp lại. |
| `RF-HTTP-TEST-007` | 281 | Kiểm tra mã lỗi khi tham số sai, phương thức sai hoặc đường dẫn không tồn tại. |
| `RF-HTTP-TEST-002` | 288 | Trang ngoài localhost không kích hoạt train được và body không phải JSON bị từ chối. |
| `RF-HTTP-TEST-008` | 295 | CSV xuất cho đúng tọa độ và có dấu UTF-8 BOM để mở bằng Excel. |
| `RF-HTTP-TEST-003` | 303 | Thiếu thư viện ML chỉ trả 503 có hướng dẫn; server HTML vẫn hoạt động. |

<a id="tep-tests-test-weather-series-py"></a>
### [tests/test_weather_series.py](tests/test_weather_series.py)

Kiểm tra Holt–Winters, các mốc so sánh và việc chỉ dùng dữ liệu quá khứ.

| Ghi chú | Dòng | Đoạn code làm gì |
| --- | ---: | --- |
| `HW-TEST-000` | 3 | Kiểm tra dự báo theo chu kỳ ngày, giờ bị thiếu và cách đối chiếu với Random Forest. |
| `HW-TEST-001` | 13 | Tạo chuỗi nhiệt độ có chu kỳ 24 giờ và xu hướng tăng chậm để dự báo có thể kiểm tra lại. |
| `HW-TEST-002` | 23 | Dựng báo cáo đối chứng với sai số cố định và bỏ các cặp giờ thiếu nhiệt độ. |
| `HW-TEST-003` | 35 | Đóng gói giờ và nhiệt độ theo đúng định dạng mà điểm dự báo nhận. |
| `HW-TEST-004` | 42 | Dùng chung báo cáo ban đầu để mỗi bài so được kết quả trước và sau khi sửa chuỗi. |
| `HW-TEST-005` | 49 | Hai mô hình được chấm cùng khung giờ. Chu kỳ của chuỗi mẫu phải được học gần đúng. |
| `HW-TEST-006` | 58 | Thay nhiệt độ thật của giờ đầu trong tập kiểm thử mà dự đoán cho giờ đó vẫn giữ nguyên. |
| `HW-TEST-007` | 67 | Khi chuỗi đứt quãng, chỉ tính sai số ở những giờ đủ dữ liệu cho cả hai mô hình. |
| `HW-TEST-008` | 77 | Từ chối tính báo cáo nếu giá trị thật của Random Forest không khớp lịch sử đang dùng. |
| `HW-TEST-009` | 84 | Sửa các nhiệt độ sau mốc đầu vào để kiểm tra chúng bị loại trước khi dự báo. |
| `HW-TEST-010` | 95 | Xóa một nhiệt độ giữa cửa sổ để kiểm tra yêu cầu số giờ hợp lệ liên tiếp. |

<a id="tep-tests-test-weather-boosting-py"></a>
### [tests/test_weather_boosting.py](tests/test_weather_boosting.py)

Kiểm tra Gradient Boosting trên cùng mốc đánh giá với Random Forest.

| Ghi chú | Dòng | Đoạn code làm gì |
| --- | ---: | --- |
| `GB-TEST-000` | 3 | Huấn luyện thử trên dữ liệu giả lập để kiểm tra tập đánh giá và đầu vào dự báo. |
| `GB-TEST-001` | 15 | Hai mô hình dùng chung dữ liệu và được huấn luyện một lần cho cả nhóm bài kiểm tra. |
| `GB-TEST-002` | 23 | So sánh cùng số đặc trưng, cùng mốc kiểm thử và cùng số liệu đối chứng. |
| `GB-TEST-003` | 36 | Đổi nhiệt độ và độ ẩm ở các giờ sau mốc dự báo để chắc chúng không ảnh hưởng kết quả. |
| `GB-TEST-004` | 46 | Nếu giá trị thực ở tập đối chiếu lệch với lịch sử đang dùng, dừng lập báo cáo. |

<a id="tep-tests-test-weather-chronos-py"></a>
### [tests/test_weather_chronos.py](tests/test_weather_chronos.py)

Kiểm tra đầu vào, phân vị và cách tách các cửa sổ dự báo Chronos.

| Ghi chú | Dòng | Đoạn code làm gì |
| --- | ---: | --- |
| `CHRONOS-TEST-000` | 3 | Dùng mô hình thay thế để kiểm tra các tham số gửi sang Chronos và cách đọc kết quả. |
| `CHRONOS-TEST-001` | 17 | Tạo 210 giờ có đủ nhiệt độ và các yếu tố thời tiết đi kèm. |
| `CHRONOS-TEST-002` | 28 | Chuẩn bị tập đối chiếu mẫu. Mỗi dự báo giữ nguyên lấy nhiệt độ của giờ trước đó. |
| `CHRONOS-TEST-003` | 39 | Đưa các hàng dữ liệu về dạng mảng theo trường, giống dữ liệu gửi từ giao diện. |
| `CHRONOS-TEST-004` | 45 | Ghi lại từng lần dự báo và tạo ba phân vị quanh giá trị cuối của cửa sổ mẫu. |
| `CHRONOS-TEST-005` | 60 | Thay bộ nạp trong từng bài để chạy ngoại tuyến và tự gỡ thay thế khi kết thúc. |
| `CHRONOS-TEST-006` | 68 | Kiểm tra tập đối chiếu, cỡ lô và dữ liệu quá khứ đi vào từng cửa sổ dự báo. |
| `CHRONOS-TEST-007` | 95 | Giá trị ở giờ tương lai không đổi ba phân vị. Lần dự báo này chỉ dùng bộ nhớ đệm. |
| `CHRONOS-TEST-008` | 114 | Cửa sổ bị thiếu nhiệt độ phải báo lỗi trước khi nạp mô hình. |
| `CHRONOS-TEST-009` | 123 | Thay nhiệt độ thực trong lịch sử để kiểm tra việc từ chối tập đối chiếu lệch nguồn. |

<a id="tep-tests-test-weather-assistant-py"></a>
### [tests/test_weather_assistant.py](tests/test_weather_assistant.py)

Kiểm tra cách chọn mốc thời tiết, chuẩn bị Qwen và đối chiếu lời khuyên về mưa.

| Ghi chú | Dòng | Đoạn code làm gì |
| --- | ---: | --- |
| `QA-TEST-000` | 1 | Kiểm tra chọn dữ liệu cho câu hỏi thời tiết và vòng chuẩn bị Qwen bằng mô hình thay thế. |
| `QA-TEST-001` | 11 | Dữ liệu mẫu có cả giờ đã qua, giờ cùng ngày và giờ hôm sau để kiểm tra chọn mốc. |
| `QA-TEST-002` | 37 | Câu hỏi chiều nay chỉ lấy các giờ chiều của hôm nay và bỏ chỉ số thiếu. |
| `QA-TEST-003` | 48 | Khi người dùng chỉ rõ giờ, ngày và đơn vị °F, phần dữ liệu gửi sang dùng đúng các lựa chọn đó. |
| `QA-TEST-004` | 54 | Bỏ ký hiệu điều khiển và giá trị sai kiểu, vẫn giữ lượng mưa bằng 0 là hợp lệ. |
| `QA-TEST-005` | 65 | Báo lỗi khi ngày được hỏi nằm ngoài dữ liệu hoặc thời điểm hiện tại không đọc được. |
| `QA-TEST-006` | 74 | Kiểm tra trạng thái thiếu thư viện, quá trình nạp và nguồn ghi trên câu trả lời. |
| `QA-TEST-007` | 83 | Dùng tín hiệu Event để chờ luồng nạp giả hoàn tất, không cần tải Qwen. |
| `QA-TEST-008` | 105 | Khi câu trả lời trái với ngưỡng xác suất mưa, giao diện nhận gợi ý theo dữ liệu. |

<a id="tep-tests-weather-client-test-mjs"></a>
### [tests/weather-client.test.mjs](tests/weather-client.test.mjs)

Kiểm tra các yêu cầu Open-Meteo, bộ nhớ đệm, tìm kiếm và giới hạn 429.

| Ghi chú | Dòng | Đoạn code làm gì |
| --- | ---: | --- |
| `TEST-API-000` | 1 | Kiểm tra cách tầng dữ liệu gọi API, lưu cache và xử lý giới hạn số lượt gọi. |
| `TEST-API-007` | 20 | Sau mỗi bài, khôi phục fetch và đồng hồ thật để bài kế tiếp chạy độc lập. |
| `TEST-API-001` | 26 | Tọa độ sai phải bị chặn trước khi gọi mạng; URL hợp lệ luôn yêu cầu múi giờ Việt Nam. |
| `TEST-API-002` | 41 | Năm lời gọi đồng thời cùng địa điểm chỉ tạo một fetch; làm mới ngay không gọi thêm và không sửa fetchedAt. |
| `TEST-API-003` | 59 | Phản hồi thiếu hourly/daily không được lưu cache; lần tiếp theo vẫn phải gọi lại được. |
| `TEST-API-004` | 73 | Hai địa điểm dùng một request batch; thứ tự địa điểm và giá trị null được giữ đúng. |
| `TEST-API-005` | 94 | URL mã hóa đúng tiếng Việt, có countryCode=VN và lọc bỏ kết quả quốc gia khác. |
| `TEST-API-006` | 123 | HTTP 429 áp dụng thời gian chờ cho cả địa điểm khác cùng nguồn; chỉ gọi lại sau mốc Retry-After. |

<a id="tep-tests-hourly-timeline-test-mjs"></a>
### [tests/hourly-timeline.test.mjs](tests/hourly-timeline.test.mjs)

Kiểm tra mốc hiện tại, các giờ qua nửa đêm và giá trị bị thiếu.

| Ghi chú | Dòng | Đoạn code làm gì |
| --- | ---: | --- |
| `TEST-HOUR-000` | 1 | Kiểm tra chuỗi giờ trên biểu đồ, gồm mốc hiện tại, lúc qua nửa đêm và các giờ bị thiếu. |
| `TEST-HOUR-001` | 35 | Từ 23:45 phải có Bây giờ, 00:00, 01:00, 02:00...; xác nhận khoảng cách khóa giờ đúng 3.600.000 ms và ngày đổi ở nửa đêm. |
| `TEST-HOUR-002` | 52 | Mốc Bây giờ phải dùng số đo mô hình current (27,8), không thay bằng giá trị hourly của giờ tròn (25). |
| `TEST-HOUR-003` | 60 | Chọn ngày mai phải lấy đủ 00:00..23:00 của đúng ngày, không có mốc Bây giờ. |
| `TEST-HOUR-004` | 68 | Cuối phạm vi API thì chỉ dùng số giờ thực có; ngày/chỉ số không hợp lệ trả mảng rỗng. |
| `TEST-HOUR-005` | 77 | Giá trị null vẫn là thiếu dữ liệu; không được coi là 0°C hoặc xác suất mưa 0%. |

<a id="tep-tests-ml-context-test-mjs"></a>
### [tests/ml-context.test.mjs](tests/ml-context.test.mjs)

Kiểm tra cửa sổ dữ liệu đưa vào dự báo và việc loại các giờ tương lai.

| Ghi chú | Dòng | Đoạn code làm gì |
| --- | ---: | --- |
| `RF-JS-TEST-000` | 1 | Kiểm tra dữ liệu theo giờ mà giao diện gửi sang các mô hình dự báo. |
| `RF-JS-TEST-001` | 10 | Chuỗi giả chỉ dùng để kiểm tra cắt mốc thời gian, không phải dataset của ứng dụng. |
| `RF-JS-TEST-002` | 29 | Dữ liệu đầu vào dừng ở 23:00, còn dự báo đối chiếu của API có thể ở 00:00 ngày hôm sau. |
| `RF-JS-TEST-003` | 41 | Giữ null ở trường áp suất để mã phía mô hình tự xử lý dữ liệu thiếu. |
| `RF-JS-TEST-004` | 49 | Yêu cầu dữ liệu cho Random Forest là yêu cầu riêng, gửi lại sớm thì dùng cache. |
| `RF-JS-TEST-005` | 72 | Holt–Winters chỉ cần nhiệt độ. Mảng gửi đi kết thúc đúng giờ dùng làm mốc dự báo. |
