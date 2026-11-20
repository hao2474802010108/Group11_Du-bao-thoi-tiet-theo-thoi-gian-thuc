// [VITE-000] CẤU HÌNH CÔNG CỤ: Vite phục vụ code lúc phát triển và tạo bản dist khi build.
// [VITE-001] defineConfig cung cấp kiểu và gợi ý thuộc tính cấu hình Vite.
import { defineConfig } from "vite";
// [VITE-002] Plugin biên dịch JSX/TSX và cập nhật giao diện nhanh khi sửa code React.
import react from "@vitejs/plugin-react";
// [VITE-003] Đổi đường dẫn alias sang đường dẫn hệ điều hành.
import { fileURLToPath } from "node:url";

export default defineConfig({
  // [VITE-004] Bật hỗ trợ React cho Vite.
  plugins: [react()],
  // [VITE-005] Cho phép import @/lib/weather thay cho các đường dẫn ../../lib/weather dài.
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  // [VITE-006] Dev server dùng cổng cố định 5173 trên laptop; nếu bận thì báo lỗi để người dùng xử lý hoặc chọn --port khác.
  server: { port: 5173, host: "127.0.0.1", strictPort: true },
});
