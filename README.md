# Mây Việt

Mây Việt là đồ án dự báo thời tiết cho các địa điểm ở Việt Nam. Trang chính hiển thị thời tiết hiện tại, dự báo theo giờ và dự báo 7 ngày từ Open-Meteo. Phần thực nghiệm của đồ án so sánh bốn cách dự báo nhiệt độ trước một giờ. Ứng dụng còn có mục hỏi đáp thời tiết bằng tiếng Việt.

## Chạy cơ bản Windows

Giải nén toàn bộ gói rồi mở PowerShell trong thư mục `MayViet`. Thư mục `dist/` nằm cạnh `app.py`. Nên dùng Python 3.12 hoặc 3.13 để dùng các mô hình TP.HCM đi kèm.

```powershell
python -m pip install -r requirements.txt
python app.py
```

Nếu Windows dùng lệnh `py`, thay `python` bằng `py` trong các lệnh trên. Trình duyệt thường mở ở `http://localhost:5173`. Nếu cổng đó đang bận, mở địa chỉ được in trong PowerShell. Giữ cửa sổ PowerShell mở khi dùng app, nhấn **Ctrl+C** để dừng.

### Chạy Full chức năng

Dùng Python 3.12 hoặc 3.13. Cài thêm PyTorch bản CPU và các thư viện AI trong cùng môi trường Python rồi khởi động lại app.

```powershell
python -m pip install --index-url https://download.pytorch.org/whl/cpu torch==2.8.0
python -m pip install -r requirements-ai.txt
python app.py
```

Trong khung **Chronos‑2 Small**, bấm **Chạy dự báo**. Nếu địa điểm chưa có kết quả, bấm **Tải mô hình và kiểm thử**. Trong khung **Hỏi đáp thời tiết**, bấm **Chuẩn bị Qwen** rồi nhập câu hỏi.

Lần đầu cần Internet để tải trọng số Chronos (khoảng 112 MB) và Qwen (khoảng 988 MB). App lưu chúng trong `models/ai-cache/` để dùng lại. Cả hai mô hình chạy trên máy và dùng được mà không cần API key.

## Các mục ở thanh bên

| Mục | Cách hoạt động |
| --- | --- |
| Random Forest | Dùng 25 đặc trưng từ các giờ trước, các chỉ số thời tiết và chu kỳ thời gian để dự báo mức thay đổi nhiệt độ sau một giờ. |
| Time Series | Dùng Holt–Winters cộng tính với chu kỳ 24 giờ. Mỗi lần dự báo dùng từ 72 đến 168 giờ nhiệt độ liên tiếp. |
| Gradient Boosting | Dùng `HistGradientBoostingRegressor` với cùng 25 đặc trưng đầu vào như Random Forest. |
| Chronos‑2 Small | Dùng mô hình đã huấn luyện sẵn để dự báo giờ tới. Khung hiển thị giá trị trung vị và khoảng P10–P90. |
| Hỏi đáp thời tiết | Qwen2.5‑0.5B‑Instruct trả lời bằng tiếng Việt từ dữ liệu của địa điểm đang chọn. Với câu hỏi mang ô, app đối chiếu lời khuyên với xác suất mưa theo giờ. |

Khi chuyển sang địa điểm mới, bấm **Huấn luyện** trong khung dự báo tương ứng nếu app báo chưa có mô hình. Lịch sử ERA5 được lưu theo địa điểm. Lệnh dưới đây dùng CSV TP.HCM đi kèm để huấn luyện lại Random Forest trên Python 3.10 hoặc 3.11.

```powershell
python train_model.py --latitude 10.78 --longitude 106.70 --offline
```

## Kết quả ở TP.HCM

Bốn mô hình dự báo được kiểm thử trên cùng 1.747 mốc giờ của dữ liệu ERA5. Ở mỗi mốc, mô hình dự báo trước một giờ và chỉ dùng dữ liệu đã có lúc dự báo. Cách đối chứng **Persistence** lấy nhiệt độ giờ hiện tại làm dự báo cho giờ sau.

Random Forest và Gradient Boosting chọn cấu hình theo MAE trên 873 mẫu validation sau 6.113 mẫu huấn luyện. Hai mô hình được huấn luyện lại trên 6.987 mẫu trước tập test sau khi đã chọn tham số. Tập test gồm 1.747 mốc cuối. Trình tự và các mốc này được lưu trong báo cáo JSON của từng mô hình.

| Phương pháp | MAE (°C) | RMSE (°C) |
| --- | ---: | ---: |
| Random Forest | 0,347 | 0,513 |
| Holt–Winters | 0,436 | 0,609 |
| Gradient Boosting | 0,347 | 0,520 |
| Chronos‑2 Small | 0,381 | 0,533 |
| Persistence | 0,546 | 0,762 |

Bảng tính sai số trên toàn bộ tập kiểm thử. Biểu đồ trong app hiển thị tối đa 72 mốc cuối. Số liệu tổng hợp nằm trong `models/`, còn CSV kết quả từng giờ của Random Forest nằm trong `reports/`.

### Tái lập số liệu trong báo cáo

Chạy lệnh sau với dữ liệu và mô hình TP.HCM đi kèm để tính lại các bảng trong báo cáo.

```powershell
python evaluate_report.py
```

Kết quả nằm tại `reports/validation_analysis/analysis.json` và `reports/validation_analysis/holdout_predictions.csv`. Cột dự báo Chronos trong CSV đi kèm có 72 mốc cuối, còn MAE và RMSE được tính trên toàn bộ tập test từ lần chạy Chronos đã lưu.

Cài thêm Matplotlib và chạy lệnh tạo lại các hình kết quả.

```powershell
python -m pip install matplotlib==3.11.2
python evaluate_report.py --figures-dir reports/validation_analysis/figures
```

## Dữ liệu và mã nguồn

Trình duyệt gọi Open-Meteo để lấy dự báo và tìm địa điểm. `app.py` phục vụ giao diện từ `dist/`, chạy API dự báo và hỏi đáp trên máy. Dữ liệu huấn luyện và kiểm thử lấy từ ERA5 qua Open-Meteo Historical Weather API. CSV nằm trong `data/history/`. Địa điểm yêu thích và tùy chọn hiển thị được lưu trong trình duyệt.

- `src/components/weather-app.tsx` dựng trang chính và thanh điều hướng.
- `src/lib/weather-client.ts` gọi API, lưu cache, gộp các yêu cầu trùng và xử lý giới hạn 429.
- `src/lib/weather.ts` chọn các mốc giờ để biểu đồ hiển thị liên tục, kể cả qua nửa đêm.
- `weather_ml.py`, `weather_series.py`, `weather_boosting.py` và `weather_chronos.py` chứa bốn cách dự báo. `weather_assistant.py` xử lý hỏi đáp.
- `src/index.css` và `src/glass-update.css` chứa các phần chính của giao diện sáng và tối.

Xem thêm [chú thích mã nguồn](GIAI_THICH_CODE.md), [nguồn dữ liệu và API](NGUON_API.txt) và [cách huấn luyện Random Forest](PHUONG_PHAP_RANDOM_FOREST.md).

Dữ liệu thời tiết do [Open-Meteo](https://open-meteo.com/) cung cấp theo [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Dữ liệu địa danh đến từ GeoNames qua Open-Meteo Geocoding. Giấy phép font Manrope nằm trong [public/fonts/OFL.txt](public/fonts/OFL.txt).

## Sửa giao diện và chạy kiểm thử

Nếu sửa React hoặc CSS, dùng Node.js từ 22.13 trở lên. Chạy `python app.py` ở cổng 5173 trong một PowerShell để Vite gọi được API mô hình. Mở cửa sổ PowerShell thứ hai để chạy Vite.

```powershell
npm.cmd ci
$env:MAYVIET_API_PORT = '5173'
npm.cmd run dev -- --port 5174
```

Nếu Python in ra cổng khác, đặt `MAYVIET_API_PORT` theo cổng đó. Sau khi sửa, chạy kiểm thử rồi build lại `dist/`. App Python sẽ phục vụ bản build đó khi tải lại trang.

```powershell
npm.cmd test
npm.cmd run build
python -X utf8 -m unittest discover -s tests -p "test_*.py" -v
```

## Khi chạy gặp lỗi

- Báo thiếu `app.py` hoặc `dist/index.html` thì kiểm tra đã giải nén hết và mở đúng thư mục `MayViet`.
- Nếu sửa `app.py`, dừng server rồi chạy lại. Nếu sửa giao diện, chạy `npm.cmd run build` rồi tải lại trang.
- Nếu không tải được dự báo, kiểm tra Internet hoặc mở **Xem dữ liệu gốc** trên app. Khi API báo 429, chờ hết thời gian được thông báo rồi thử lại.
