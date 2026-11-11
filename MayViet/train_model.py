"""Huấn luyện lại Random Forest từ lịch sử thật; không cần mở trình duyệt.

python train_model.py --latitude 10.78 --longitude 106.70 --offline
"""
from pathlib import Path
import argparse
import json


# [RF-CLI-001] Chỉ import ML sau khi đọc tham số, để --help vẫn hoạt động nếu chưa cài thư viện.
def main() -> int:
    parser = argparse.ArgumentParser(description="Huấn luyện RandomForestRegressor cho Mây Việt.")
    parser.add_argument("--latitude", type=float, default=10.78)
    parser.add_argument("--longitude", type=float, default=106.70)
    parser.add_argument("--offline", action="store_true", help="Chỉ dùng CSV có sẵn, không gọi API.")
    args = parser.parse_args()
    try:
        from weather_ml import MLService, fit_model, location
        service = MLService(Path(__file__).resolve().parent)
        key, lat, lon = location(args.latitude, args.longitude)
        # [RF-CLI-002] Cùng một pipeline như giao diện: tạo đặc trưng, holdout theo thời gian, refit và lưu model.
        rows, source = service.history(key) if args.offline else service.download_history(lat, lon)
        print(f"Dữ liệu thật: {len(rows)} giờ, từ {rows[0]['time']} đến {rows[-1]['time']}.", flush=True)
        artifact = fit_model(rows, lat, lon, source)
        service.persist(key, artifact)
        report = artifact["report"]
        print(json.dumps({"method": report["method"], "metrics": report["metrics"], "baseline": report["baseline"],
                          "test_samples": report["test_samples"], "model": str(service.paths(key)["model"])}, ensure_ascii=False, indent=2))
        return 0
    except ImportError:
        print("Cài thư viện: python -m pip install -r requirements.txt")
        return 1
    except Exception as e:
        print(f"Chưa huấn luyện được: {e}")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
