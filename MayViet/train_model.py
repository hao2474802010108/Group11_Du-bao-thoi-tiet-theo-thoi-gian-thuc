"""Huấn luyện lại Random Forest từ lịch sử thật; không cần mở trình duyệt.

python train_model.py --latitude 10.78 --longitude 106.70 --offline
"""
# [RF-CLI-003] File này chạy huấn luyện Random Forest bằng dòng lệnh. Dùng cờ offline để đọc lịch sử ERA5 đã lưu.
from pathlib import Path
import argparse
import json


# [RF-CLI-001] Chỉ import ML sau khi đọc tham số, để --help vẫn hoạt động nếu chưa cài thư viện.
def main() -> int:
    # [RF-CLI-004] Mặc định dùng tọa độ TP.HCM. Người chạy có thể chọn tọa độ khác bằng tham số dòng lệnh.
    parser = argparse.ArgumentParser(description="Huấn luyện RandomForestRegressor cho Mây Việt.")
    parser.add_argument("--latitude", type=float, default=10.78)
    parser.add_argument("--longitude", type=float, default=106.70)
    parser.add_argument("--offline", action="store_true", help="Chỉ dùng CSV có sẵn, không gọi API.")
    args = parser.parse_args()
    try:
        from weather_ml import MLService, fit_model, location
        # [RF-CLI-005] Lấy đường dẫn lưu dữ liệu và mô hình theo thư mục chứa mã nguồn dù terminal đang mở ở chỗ khác.
        service = MLService(Path(__file__).resolve().parent)
        key, lat, lon = location(args.latitude, args.longitude)
        # [RF-CLI-002] Dùng pipeline của giao diện: chọn tham số bằng validation, chấm trên test và lưu mô hình triển khai.
        rows, source = service.history(key) if args.offline else service.download_history(lat, lon)
        print(f"Dữ liệu thật: {len(rows)} giờ, từ {rows[0]['time']} đến {rows[-1]['time']}.", flush=True)
        artifact = fit_model(rows, lat, lon, source)
        service.persist(key, artifact)
        # [RF-CLI-006] In cấu hình được chọn, số liệu validation/test và vị trí mô hình để kiểm tra nhanh.
        report = artifact["report"]
        print(json.dumps({"method": report["method"], "validation": report["validation"],
                          "metrics": report["metrics"], "baseline": report["baseline"],
                          "test_samples": report["test_samples"], "model": str(service.paths(key)["model"])}, ensure_ascii=False, indent=2))
        return 0
    # [RF-CLI-007] Trả mã lỗi 1 nếu thiếu thư viện hoặc không huấn luyện được. Mã 0 ở trên báo lệnh hoàn tất.
    except ImportError:
        print("Cài thư viện: python -m pip install -r requirements.txt")
        return 1
    except Exception as e:
        print(f"Chưa huấn luyện được: {e}")
        return 1


# [RF-CLI-008] Chỉ bắt đầu huấn luyện khi chạy file trực tiếp. Import file sẽ không khởi động tác vụ.
if __name__ == "__main__":
    raise SystemExit(main())
