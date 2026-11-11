# Phương pháp Random Forest của Mây Việt

Tài liệu mô tả **phần đã triển khai**, không phải đề xuất chưa có trong code. Có thể dùng làm căn cứ cho C2–C4 trong bố cục báo cáo của bạn; số liệu là kết quả chạy thật trên dataset đi kèm.

## 1. Tên phương pháp và phạm vi

**Random Forest Regression — Hồi quy rừng ngẫu nhiên**, lớp **sklearn.ensemble.RandomForestRegressor**. Bài toán hồi quy nhiệt độ không khí 2 m của giờ kế tiếp tại một tọa độ. Không dùng classifier để báo một phần trăm accuracy cho nhiệt độ.

Phương pháp học biến thiên một giờ:

```text
y(t) = T(t+1) - T(t)
T_dự_đoán(t+1) = T(t) + RandomForestRegressor.predict(X(t))
```

Việc cộng lại nhiệt độ hiện tại không biến mô hình thành Persistence: RF học delta từ 25 đặc trưng. Persistence là delta luôn bằng 0, được giữ làm baseline độc lập.

## 2. Dữ liệu thật và nguồn

- Nguồn: Open-Meteo Historical Weather API, tham số models=era5.
- Lịch sử TP.HCM đi kèm: 8,760 giờ, 2025-11-04T00:00 đến 2026-11-03T23:00 (GMT+7).
- Tọa độ tra cứu model: 10.78, 106.70; ô lưới ERA5 trả về: 10.75, 106.75.
- Các biến: temperature_2m (°C), relative_humidity_2m (%), surface_pressure (hPa), wind_speed_10m (km/h), cloud_cover (%).
- CSV, URL đầy đủ, ngày tải, checksum và thông tin ô lưới ở data/history.
- Dữ liệu ERA5 là tái phân tích theo lưới, không phải trạm đo tại đúng tọa độ; làm tròn khóa 0,01° không nâng độ phân giải ERA5 lên 1 km.
- Thời gian tải mặc định: 365 ngày, kết thúc trước hiện tại 7 ngày để tránh lịch sử chưa hoàn tất.

Đầu vào khi vận hành lấy từ Forecast API, vì cần các giờ gần hiện tại. Khác biệt nguồn ERA5/Forecast tạo nguy cơ dịch chuyển phân phối. Điểm holdout bên dưới chỉ phản ánh ERA5; chưa có kiểm chứng quan trắc trạm và chưa phải chứng minh kỹ năng dự báo độc lập ngoài trời.

## 3. Tạo 25 đặc trưng

| Nhóm              | Đặc trưng                                             |
| ----------------- | ----------------------------------------------------- |
| Nhiệt độ trễ      | t, t-1, t-2, t-3, t-6, t-12, t-24                     |
| Thống kê nhiệt độ | Trung bình 3/6/24 giờ tính đến t, độ lệch chuẩn 6 giờ |
| Xu hướng nhiệt độ | T(t)-T(t-1), T(t)-T(t-3)                              |
| Độ ẩm             | Giá trị tại t và thay đổi so với t-3                  |
| Áp suất           | Giá trị tại t và thay đổi so với t-3                  |
| Gió               | Giá trị tại t và thay đổi so với t-3                  |
| Mây               | Giá trị tại t và thay đổi so với t-3                  |
| Chu kỳ lịch       | sin/cos giờ của t+1, sin/cos ngày trong năm của t+1   |

Biết giờ/ngày tiếp theo không đồng nghĩa biết thời tiết tương lai; đó là thông tin lịch hợp lệ. Nhiệt độ API tại t+1 không nằm trong X và không gửi vào backend predict. Tra lag bằng timestamp, không chỉ bằng số dòng.

Không điền null thành 0. Nếu thiếu giờ hoặc có giá trị thiếu trong cửa sổ t-24..t, loại mẫu train liên quan hoặc báo lỗi đầu vào khi predict. Không bfill hay nội suy từ tương lai. Random Forest dùng cây nên không thêm StandardScaler chỉ để chuẩn hóa những thang đo này.

Sau xử lý có 8,735 mẫu hợp lệ, từ CSV gốc 8,760 giờ. 24 giờ đầu chưa đủ lag, giờ cuối chưa có nhãn t+1.

## 4. Thuật toán và tham số

Random Forest tạo nhiều cây từ các mẫu bootstrap thuộc **tập train** và kết hợp dự đoán của các cây. Tham số thực trong estimator:

| Tham số          | Giá trị              |
| ---------------- | -------------------- |
| n_estimators     | 160                  |
| max_depth        | 14                   |
| min_samples_leaf | 3                    |
| max_features     | 0.9                  |
| random_state     | 42                   |
| n_jobs           | Tối đa 4 CPU threads |

Không chạy GridSearch để chọn model theo chính holdout rồi gọi đó là đánh giá khách quan. Bộ tham số được cố định trong code. Nếu sau này tối ưu tham số, cần chia thêm validation hoặc dùng TimeSeriesSplit bên trong phần train rồi giữ tập test cuối độc lập.

## 5. Chia tập và chống rò rỉ

1. Tạo mẫu theo thời gian tăng dần, mỗi mẫu chỉ dùng dữ liệu <=t và nhãn ở t+1.
2. Lấy khoảng 80% mẫu đầu để train, 20% cuối để test; không shuffle.
3. Bỏ một mẫu tại biên để giờ nhãn cuối train < giờ anchor đầu test.
4. Fit evaluation_model trên train; đo RF và Persistence trên cùng holdout.
5. Chốt metrics/CSV holdout. Sau đó fit final_model trên toàn bộ lịch sử cho ứng dụng sử dụng.

Bootstrap bên trong Random Forest chỉ dùng phần train, không trộn tập test vào train. Số liệu cụ thể:

| Mục                | Giá trị                             |
| ------------------ | ----------------------------------- |
| Train              | 6,987 mẫu                           |
| Gap                | 1 mẫu                               |
| Test               | 1,747 mẫu                           |
| Nhãn cuối train    | 2026-08-23T03:00                    |
| Anchor đầu test    | 2026-08-23T04:00                    |
| Nhãn đầu/cuối test | 2026-08-23T05:00 / 2026-11-03T23:00 |

Các đặc trưng lag của test có thể dùng giờ trước đó trong lịch sử test: đây là đánh giá rolling one-step với quá khứ đã có tại t, không phải dự báo cả 72 ngày một lần từ đầu tập test. Không refit model giữa các giờ test trong phép đánh giá này.

## 6. Kết quả và thảo luận C4

| Phương pháp                         | MAE (°C) | RMSE (°C) |       R² |
| ----------------------------------- | -------: | --------: | -------: |
| Random Forest                       | 0.348306 |  0.512547 | 0.937965 |
| Persistence: giờ sau bằng giờ trước | 0.545163 |  0.761765 | 0.862971 |

MAE RF giảm 36.11% so với Persistence trên cùng test. Đây là phần trăm **giảm sai số MAE**, không phải phần trăm accuracy. R² 0.937965 cũng không nên viết thành “chính xác 93.8%”.

- MAE và RMSE nhỏ hơn baseline trong lần chạy này, cho thấy mô hình đã học được biến thiên vượt baseline trên chuỗi ERA5 đã chọn.
- Chuỗi giờ liên tiếp tương quan cao; cần giữ baseline để tránh đánh giá mô hình chỉ bằng R² cao.
- Chưa thể suy ra mô hình tốt hơn Open-Meteo Forecast API. Cần một bộ quan trắc độc lập và cùng thời điểm phát hành dự báo để so công bằng.
- Kiểm thử trong một khu vực và một khoảng thời gian, chưa chứng minh khả năng tổng quát hóa cho mọi tỉnh/thành hoặc thời tiết cực đoan.
- Biểu đồ trên UI là 72 mốc cuối của holdout, không phải dự báo tương lai 72 giờ. CSV xuất toàn bộ 1,747 dòng test.
- Độ quan trọng MDI lấy từ final_model. Các lag nhiệt độ tương quan nhau nên không diễn giải thành quan hệ nguyên nhân-kết quả.

Kết quả đầy đủ: models/vn_10p78_106p70.metrics.json và reports/vn_10p78_106p70_holdout.csv. Bản đã giao dùng sklearn 1.8.0. Tái lập cùng dữ liệu/tham số/phiên bản cho kết quả gần như trùng; phép cộng song song có thể khác rất nhỏ ở phần thập phân.

## 7. Cách tái lập

```powershell
python -m pip install -r requirements.txt
python train_model.py --latitude 10.78 --longitude 106.70 --offline
python -m unittest discover -s tests -p "test_*.py" -v
python app.py
```

Không cần Node để train hoặc sử dụng model. Nếu sklearn/NumPy/joblib khác bản artifact, huấn luyện lại từ CSV; không bỏ kiểm tra phiên bản để cố nạp pickle cũ. Chỉ nạp artifact tự tạo/tin cậy.

## 8. Gắn vào bố cục C1–C5

| Chương               | Nội dung có thể trình bày                                                                    |
| -------------------- | -------------------------------------------------------------------------------------------- |
| C1 Giới thiệu        | Bài toán bổ sung dự đoán nhiệt độ giờ kế tiếp cho ứng dụng thời tiết                         |
| C2 Cơ sở lý thuyết   | Hồi quy, cây quyết định, bootstrap, Random Forest, lag, MAE/RMSE/R²                          |
| C3 Phương pháp       | Nguồn ERA5, kiểm tra/tiền xử lý, 25 đặc trưng, y_delta, tham số và holdout theo thời gian    |
| C4 Kết quả/thảo luận | Bảng RF/baseline, biểu đồ CSV, đặc trưng, giới hạn dữ liệu và nguồn vận hành                 |
| C5 Kết luận          | Kết quả trên bộ dữ liệu đã thử và hướng mở rộng: thêm trạm đo, vùng, walk-forward validation |

## 9. Tài liệu chính thức

- [RandomForestRegressor](https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.RandomForestRegressor.html).
- [TimeSeriesSplit](https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.TimeSeriesSplit.html), tham khảo khi mở rộng đánh giá/tối ưu.
- [Open-Meteo Historical Weather / ERA5](https://open-meteo.com/en/docs/historical-weather-api).
- [Open-Meteo Forecast API](https://open-meteo.com/en/docs).
