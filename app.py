#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Mây Việt: chạy giao diện hiện tại bằng Python, không cần file BAT.

Cách chạy: python app.py
Yêu cầu: Python 3.10 trở lên; chỉ dùng thư viện chuẩn, không cần pip install.
Giữ nguyên thư mục dist cạnh app.py vì đó là giao diện đã được biên dịch.
"""

# [PY-001] Để chú thích kiểu được xử lý muộn, thuận tiện khi hai lớp tham chiếu nhau.
from __future__ import annotations

# 1. CÁC MODULE CÓ SẴN TRONG PYTHON
# [PY-002] argparse đọc các tùy chọn như --port, --no-open và --verbose từ terminal.
import argparse
# [PY-003] errno giúp nhận biết lỗi cổng đang được chương trình khác sử dụng.
import errno
# [PY-004] mimetypes tìm Content-Type cho những loại tài nguyên chưa có trong bảng riêng.
import mimetypes
# [PY-005] socket cung cấp tùy chọn giữ cổng độc quyền trên Windows, tránh hai ứng dụng dùng nhầm cùng cổng.
import socket
# [PY-006] sys đọc phiên bản Python, in lỗi ra stderr và trả mã kết thúc chương trình.
import sys
# [PY-007] Timer mở trình duyệt ở luồng phụ để máy chủ không bị chặn khi mở ứng dụng.
import threading
# [PY-008] webbrowser gọi trình duyệt mặc định của Windows, macOS hoặc Linux.
import webbrowser
# [PY-009] HTTPStatus đặt tên rõ ràng cho mã HTTP như 200, 400, 403, 404 và 405.
from http import HTTPStatus
# [PY-010] Handler xử lý từng yêu cầu; ThreadingHTTPServer phục vụ nhiều file đồng thời.
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
# [PY-011] Path xử lý đường dẫn có dấu/khoảng trắng; PurePosixPath đọc đường dẫn trong URL.
from pathlib import Path, PurePosixPath
# [PY-012] Tách phần đường dẫn khỏi query và giải mã các ký tự phần trăm trong URL.
from urllib.parse import unquote, urlsplit


# 2. THƯ MỤC VÀ THÔNG SỐ MẶC ĐỊNH
# [PY-013] Lấy vị trí thật của app.py, không phụ thuộc thư mục đang đứng trong terminal.
APP_DIR = Path(__file__).resolve().parent
# [PY-014] Chỉ phục vụ nội dung trong dist; không công khai README, code hay file khác của laptop.
DIST_DIR = APP_DIR / "dist"
# [PY-015] Chỉ lắng nghe trên máy hiện tại; không mở máy chủ ra mạng LAN hoặc Internet.
HOST = "127.0.0.1"
# [PY-016] Giữ cổng cũ để yêu thích/cài đặt tại localhost:5173 tiếp tục được trình duyệt nhận.
DEFAULT_PORT = 5173
# [PY-017] Nếu cổng bận, thử thêm 10 cổng tiếp theo thay vì đóng ứng dụng ngay.
EXTRA_PORTS = 10

# [PY-018] Khai báo MIME rõ cho JS/CSS/font để tránh Windows nhận sai kiểu JavaScript.
CONTENT_TYPES = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".mjs": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".svg": "image/svg+xml",
    ".woff2": "font/woff2",
    ".woff": "font/woff",
    ".json": "application/json; charset=utf-8",
    ".webmanifest": "application/manifest+json; charset=utf-8",
    ".txt": "text/plain; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".ico": "image/x-icon",
}


# 3. XỬ LÝ CÁC YÊU CẦU TỪ TRÌNH DUYỆT
# [PY-019] Lớp này gửi HTML/JS/CSS/font cho trình duyệt; không gọi API dự báo thay người dùng.
class WeatherRequestHandler(BaseHTTPRequestHandler):
    # [PY-020] Chú thích kiểu cho thuộc tính server có sẵn của lớp cha, giúp IDE gợi ý chính xác.
    server: MayVietServer

    # [PY-021] Tên máy chủ dùng trong HTTP header; không thay đổi dữ liệu thời tiết.
    server_version = "MayVietPython/1.0"

    # [PY-022] Mỗi kết nối có thời gian chờ để kết nối bỏ dở không giữ luồng quá lâu.
    def setup(self) -> None:
        self.request.settimeout(15)
        super().setup()

    # [PY-023] Header chung cho cả phản hồi thành công và lỗi; gọi lớp cha để kết thúc header.
    def end_headers(self) -> None:
        # [PY-024] Không cache file giao diện cũ: sau khi build lại, tải trang sẽ dùng file mới.
        self.send_header("Cache-Control", "no-store")
        # [PY-025] Yêu cầu trình duyệt dùng đúng Content-Type, không tự đoán kiểu nội dung.
        self.send_header("X-Content-Type-Options", "nosniff")
        super().end_headers()

    # [PY-026] GET lấy nội dung file, dùng khi trình duyệt tải trang và các tài nguyên.
    def do_GET(self) -> None:
        self._serve_file(head_only=False)

    # [PY-027] HEAD chỉ trả header, không gửi nội dung; hữu ích khi kiểm tra tài nguyên.
    def do_HEAD(self) -> None:
        self._serve_file(head_only=True)

    # [PY-028] Máy chủ này chỉ đọc file; các phương thức ghi không có chức năng và trả 405.
    def _method_not_allowed(self) -> None:
        self.send_response(HTTPStatus.METHOD_NOT_ALLOWED)
        self.send_header("Allow", "GET, HEAD")
        self.send_header("Content-Length", "0")
        self.end_headers()

    # [PY-029] Dùng lại cùng một hàm cho những phương thức không hỗ trợ, tránh lặp code.
    do_POST = do_PUT = do_PATCH = do_DELETE = do_OPTIONS = do_TRACE = _method_not_allowed

    # [PY-030] Đổi URL thành file hợp lệ dưới dist; trả None nếu đã gửi phản hồi lỗi.
    def _requested_file(self) -> Path | None:
        try:
            # [PY-031] Query như ?v=1 không thuộc tên file; strict từ chối mã UTF-8 sai.
            decoded = unquote(urlsplit(self.path).path, errors="strict")
            # [PY-032] Chặn ký tự NUL và dấu gạch chéo Windows để URL không bị hiểu thành đường dẫn khác.
            if "\x00" in decoded or "\\" in decoded:
                self.send_error(HTTPStatus.BAD_REQUEST)
                return None
            # [PY-033] Không cho URL có .. đi ngược thư mục để đọc file bên ngoài dist.
            if ".." in PurePosixPath(decoded).parts:
                self.send_error(HTTPStatus.FORBIDDEN)
                return None
            # [PY-034] Bỏ dấu / đầu URL rồi ghép với thư mục giao diện; resolve xử lý cả liên kết tượng trưng.
            file_path = (self.server.directory / decoded.lstrip("/")).resolve()
            # [PY-035] Kiểm tra lại sau resolve để chặn cả symlink/junction trỏ ra ngoài dist.
            if not file_path.is_relative_to(self.server.directory):
                self.send_error(HTTPStatus.FORBIDDEN)
                return None
            # [PY-036] URL thư mục như / dùng index.html; không hiển thị danh sách file.
            if decoded.endswith("/"):
                file_path = (file_path / "index.html").resolve()
                # [PY-037] index.html cũng phải ở trong dist, kể cả khi là symlink.
                if not file_path.is_relative_to(self.server.directory):
                    self.send_error(HTTPStatus.FORBIDDEN)
                    return None
            # [PY-038] Chỉ chấp nhận file thật; thư mục không có index và URL lạ trả 404.
            if not file_path.is_file():
                self.send_error(HTTPStatus.NOT_FOUND)
                return None
            return file_path
        # [PY-039] URL/đường dẫn hỏng là lỗi yêu cầu; không làm dừng toàn bộ máy chủ.
        except (ValueError, UnicodeError, OSError, RuntimeError):
            self.send_error(HTTPStatus.BAD_REQUEST)
            return None

    # [PY-040] Hàm dùng chung cho GET/HEAD, giúp hai cách lấy file có header nhất quán.
    def _serve_file(self, head_only: bool) -> None:
        file_path = self._requested_file()
        # [PY-041] Nếu _requested_file đã trả lỗi thì dừng, tránh gửi thêm một phản hồi nữa.
        if file_path is None:
            return
        try:
            # [PY-042] Đọc bytes để giữ nguyên font/ảnh/JavaScript; không giải mã nhầm file nhị phân.
            content = file_path.read_bytes()
        except OSError:
            # [PY-043] File có thể vừa bị xóa hoặc không đọc được sau bước kiểm tra; trả 404.
            self.send_error(HTTPStatus.NOT_FOUND)
            return
        # [PY-044] Ưu tiên bảng MIME riêng, rồi thư viện Python; loại lạ dùng octet-stream.
        content_type = CONTENT_TYPES.get(file_path.suffix.lower())
        if content_type is None:
            content_type = mimetypes.guess_type(str(file_path))[0] or "application/octet-stream"
        # [PY-045] 200 nghĩa là tải thành công; Content-Length là số byte, không phải số ký tự.
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(content)))
        self.end_headers()
        # [PY-046] HEAD có cùng kích thước/header với GET nhưng không gửi thân phản hồi.
        if not head_only:
            try:
                self.wfile.write(content)
            except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError, TimeoutError):
                # [PY-047] Người dùng đóng tab hoặc hủy tải: bỏ qua kết nối đó, giữ ứng dụng hoạt động.
                pass

    # [PY-048] Mặc định không in mỗi request; --verbose bật log để xem file nào lỗi khi gỡ rối.
    def log_message(self, format: str, *args: object) -> None:
        if self.server.verbose:
            super().log_message(format, *args)


# [PY-049] ThreadingHTTPServer cho phép trình duyệt tải JS, CSS và font đồng thời.
class MayVietServer(ThreadingHTTPServer):
    # [PY-050] Luồng phục vụ không ngăn chương trình thoát sau khi người dùng bấm Ctrl+C.
    daemon_threads = True

    # [PY-051] Trên Windows không bật SO_REUSEADDR vì ý nghĩa của nó khác Unix; cổng bận phải chuyển cổng.
    allow_reuse_address = sys.platform != "win32"
    # Không chia sẻ cùng cổng giữa nhiều server, kể cả khi bản Python tương lai đổi mặc định.
    allow_reuse_port = False

    # [PY-052] Nối handler với thư mục giao diện; địa chỉ luôn cố định là HOST cục bộ.
    def __init__(self, port: int, directory: Path, verbose: bool = False) -> None:
        self.directory = directory.resolve()
        self.verbose = verbose
        super().__init__((HOST, port), WeatherRequestHandler)

    # [PY-053] Windows đặt cờ độc quyền TRƯỚC bind; các hệ điều hành khác dùng cách bind của lớp cha.
    def server_bind(self) -> None:
        if sys.platform == "win32" and hasattr(socket, "SO_EXCLUSIVEADDRUSE"):
            self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_EXCLUSIVEADDRUSE, 1)
        super().server_bind()


# 4. THAM SỐ VÀ TỰ CHỌN CỔNG KHI CỔNG CŨ ĐANG BẬN
# [PY-054] argparse gọi hàm này để kiểm tra --port trước khi khởi tạo máy chủ.
def parse_port(value: str) -> int:
    try:
        port = int(value)
    except ValueError as e:
        raise argparse.ArgumentTypeError("Cổng phải là một số nguyên.") from e
    # [PY-055] Để lại 10 cổng phía sau cho cơ chế dự phòng; cổng TCP lớn nhất là 65535.
    if not 1024 <= port <= 65535 - EXTRA_PORTS:
        raise argparse.ArgumentTypeError("Chọn cổng từ 1024 đến 65525.")
    return port


# [PY-056] Thử bind thật thay vì chỉ dò cổng, tránh khoảng trống giữa lúc dò và lúc mở server.
def make_server(port: int, directory: Path = DIST_DIR, verbose: bool = False) -> MayVietServer:
    # [PY-057] Dừng sớm với hướng dẫn rõ nếu chỉ chép app.py mà thiếu giao diện đi kèm.
    if not (directory / "index.html").is_file():
        raise FileNotFoundError(
            "Thiếu dist/index.html. Hãy giải nén toàn bộ ZIP, giữ thư mục dist cạnh app.py. "
            "Nếu đang sửa giao diện, xem phần build trong README.md."
        )
    # [PY-058] Kiểm tra cả lời gọi trực tiếp từ Python, không chỉ tham số qua terminal.
    if not 1024 <= port <= 65535 - EXTRA_PORTS:
        raise ValueError("Cổng phải nằm trong khoảng 1024..65525.")
    last_error: OSError | None = None
    # [PY-059] range dừng trước đầu mút nên +1 để thử cả cổng mặc định và 10 cổng tiếp theo.
    for candidate in range(port, port + EXTRA_PORTS + 1):
        try:
            return MayVietServer(candidate, directory, verbose)
        except OSError as e:
            # [PY-060] EADDRINUSE/10048 là cổng bận; Windows 10013 cũng có thể là cổng được giữ riêng/độc quyền.
            if e.errno not in (errno.EADDRINUSE, 10048, 10013) and getattr(e, "winerror", None) not in (10048, 10013):
                raise
            last_error = e
    # [PY-061] Thử hết khoảng cổng vẫn bận thì báo lỗi để chọn --port khác; không ghi đè chương trình đang chạy.
    raise OSError(f"Các cổng {port}..{port + EXTRA_PORTS} không khả dụng. Hãy chọn --port khác.") from last_error


# 5. MỞ TRÌNH DUYỆT VÀ KHỞI ĐỘNG ỨNG DỤNG
# [PY-062] Mở trình duyệt là tiện ích; nếu không mở tự động được, server vẫn chạy bình thường.
def open_browser(url: str) -> None:
    try:
        opened = webbrowser.open(url, new=2)
        if not opened:
            print(f"Bạn có thể tự mở trình duyệt tại: {url}", flush=True)
    except Exception as e:
        # [PY-063] Lỗi mở trình duyệt không phải lỗi API thời tiết; in URL để người dùng tự mở.
        print(f"Chưa tự mở được trình duyệt ({e}). Hãy mở: {url}", flush=True)


# [PY-064] Đóng gói thao tác khởi chạy trong main để import app trong test không tự bật server.
def main(argv: list[str] | None = None) -> int:
    # [PY-065] Kiểm tra môi trường thực thi; các phiên bản Python mới hơn vẫn được chấp nhận.
    if sys.version_info < (3, 10):
        print("Mây Việt cần Python 3.10 trở lên.", file=sys.stderr)
        return 1
    # [PY-066] Giao diện dòng lệnh có --help để người dùng xem cách sử dụng mà không cần mở code.
    parser = argparse.ArgumentParser(description="Mây Việt — chạy ứng dụng thời tiết bằng Python.")
    parser.add_argument("--port", type=parse_port, default=DEFAULT_PORT, help="Cổng bắt đầu, mặc định 5173.")
    parser.add_argument("--no-open", action="store_true", help="Không tự mở trình duyệt.")
    parser.add_argument("--verbose", action="store_true", help="In các yêu cầu HTTP để gỡ lỗi.")
    args = parser.parse_args(argv)
    try:
        server = make_server(args.port, verbose=args.verbose)
    # [PY-067] Lỗi thiếu giao diện, cổng hoặc quyền mở socket được báo ngắn gọn, không in traceback khó đọc.
    except (OSError, ValueError) as e:
        print(f"Không mở được Mây Việt: {e}", file=sys.stderr)
        return 1

    # [PY-068] Dùng cổng đã bind thành công; có thể khác --port khi cổng được yêu cầu đang bận.
    actual_port = server.server_address[1]
    url = f"http://localhost:{actual_port}"
    print(f"\nMÂY VIỆT — THỜI TIẾT VIỆT NAM\nMở ứng dụng: {url}", flush=True)
    if actual_port != args.port:
        print(f"Cổng {args.port} đang bận; đã dùng cổng {actual_port}.", flush=True)
    print("Giữ cửa sổ này mở khi sử dụng. Nhấn Ctrl+C để dừng.\n", flush=True)

    browser_timer: threading.Timer | None = None
    if not args.no_open:
        # [PY-069] Socket đã sẵn sàng; mở trình duyệt sau 0,4 giây trong lúc vòng phục vụ bắt đầu.
        browser_timer = threading.Timer(0.4, open_browser, args=(url,))
        browser_timer.daemon = True
        browser_timer.start()
    try:
        # [PY-070] Vòng lặp nhận yêu cầu cho đến Ctrl+C; khoảng poll ngắn giúp phản hồi dừng nhanh.
        server.serve_forever(poll_interval=0.2)
    except KeyboardInterrupt:
        print("\nĐã dừng Mây Việt.", flush=True)
    finally:
        # [PY-071] Dọn timer và socket dù dừng bình thường hay có lỗi; không gọi shutdown từ chính luồng serve_forever.
        if browser_timer is not None:
            browser_timer.cancel()
        server.server_close()
    return 0


# [PY-072] Chỉ chạy main khi gọi python app.py; SystemExit trả mã kết thúc cho terminal.
if __name__ == "__main__":
    raise SystemExit(main())
