// [MAIN-000] ĐIỂM KHỞI ĐỘNG: gắn ứng dụng React vào HTML. Đọc README.md trước khi chạy.
// [MAIN-001] StrictMode giúp phát hiện tác dụng phụ chưa được dọn dẹp trong lúc phát triển; có thể chạy effect thêm một lượt ở chế độ dev.
import { StrictMode } from "react";
// [MAIN-002] createRoot tạo nơi React quản lý giao diện bên trong thẻ HTML #root.
import { createRoot } from "react-dom/client";
// [MAIN-003] Nạp component màn hình chính; đây là nơi phối hợp trạng thái và các phần giao diện.
import WeatherApp from "./components/weather-app";
// [MAIN-004] Nạp CSS nền tảng trước: màu sắc, bố cục, biểu tượng, responsive.
import "./index.css";
// [MAIN-005] Nạp sau index.css để ghi đè giao diện kính mờ và bố cục từng giờ. Thứ tự này có ý nghĩa.
import "./glass-update.css";

// [MAIN-006] Tìm #root trong index.html rồi render WeatherApp. Dấu ! là cam kết kiểu TypeScript rằng phần tử tồn tại, không phải kiểm tra lúc chạy.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <WeatherApp />
  </StrictMode>,
);
