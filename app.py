#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Mây Việt: chạy giao diện bằng Python, không cần file BAT.

Cách chạy: python app.py
Yêu cầu: Python 3.10 trở lên, chỉ dùng thư viện chuẩn.
Cần giữ thư mục dist cạnh app.py vì đó là giao diện đã build.
"""

from __future__ import annotations

import argparse
import errno
import mimetypes
import socket
import sys
import threading
import webbrowser
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path, PurePosixPath
from urllib.parse import unquote, urlsplit


APP_DIR = Path(__file__).resolve().parent
DIST_DIR = APP_DIR / "dist"
HOST = "127.0.0.1"
DEFAULT_PORT = 5173
EXTRA_PORTS = 10

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


class WeatherRequestHandler(BaseHTTPRequestHandler):
    server: MayVietServer

    server_version = "MayVietPython/1.0"

    def setup(self) -> None:
        self.request.settimeout(15)
        super().setup()

    def end_headers(self) -> None:
        # Không cache: build lại là trình duyệt thấy file mới.
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        super().end_headers()

    def do_GET(self) -> None:
        self._serve_file(head_only=False)

    def do_HEAD(self) -> None:
        self._serve_file(head_only=True)

    # Chỉ cho đọc file, các phương thức ghi trả 405.
    def _method_not_allowed(self) -> None:
        self.send_response(HTTPStatus.METHOD_NOT_ALLOWED)
        self.send_header("Allow", "GET, HEAD")
        self.send_header("Content-Length", "0")
        self.end_headers()

    do_POST = do_PUT = do_PATCH = do_DELETE = do_OPTIONS = do_TRACE = _method_not_allowed

    # Đổi URL thành đường dẫn file trong dist. Trả None nếu đã gửi lỗi.
    def _requested_file(self) -> Path | None:
        try:
            decoded = unquote(urlsplit(self.path).path, errors="strict")
            # Chặn NUL và dấu \ kiểu Windows.
            if "\x00" in decoded or "\\" in decoded:
                self.send_error(HTTPStatus.BAD_REQUEST)
                return None
            # Chặn .. để không đọc file ngoài dist.
            if ".." in PurePosixPath(decoded).parts:
                self.send_error(HTTPStatus.FORBIDDEN)
                return None
            file_path = (self.server.directory / decoded.lstrip("/")).resolve()
            # resolve xong phải vẫn nằm trong dist (chặn symlink trỏ ra ngoài).
            if not file_path.is_relative_to(self.server.directory):
                self.send_error(HTTPStatus.FORBIDDEN)
                return None
            # URL thư mục thì dùng index.html.
            if decoded.endswith("/"):
                file_path = (file_path / "index.html").resolve()
                if not file_path.is_relative_to(self.server.directory):
                    self.send_error(HTTPStatus.FORBIDDEN)
                    return None
            if not file_path.is_file():
                self.send_error(HTTPStatus.NOT_FOUND)
                return None
            return file_path
        # URL hỏng chỉ là lỗi request, không làm sập server.
        except (ValueError, UnicodeError, OSError, RuntimeError):
            self.send_error(HTTPStatus.BAD_REQUEST)
            return None

    def _serve_file(self, head_only: bool) -> None:
        file_path = self._requested_file()
        if file_path is None:
            return
        try:
            # Đọc bytes để giữ nguyên font/ảnh/nhị phân.
            content = file_path.read_bytes()
        except OSError:
            self.send_error(HTTPStatus.NOT_FOUND)
            return
        content_type = CONTENT_TYPES.get(file_path.suffix.lower())
        if content_type is None:
            content_type = mimetypes.guess_type(str(file_path))[0] or "application/octet-stream"
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(content)))
        self.end_headers()
        if not head_only:
            try:
                self.wfile.write(content)
            except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError, TimeoutError):
                # Người dùng đóng tab giữa chừng, bỏ qua.
                pass

    # Mặc định không log mỗi request; bật bằng --verbose.
    def log_message(self, format: str, *args: object) -> None:
        if self.server.verbose:
            super().log_message(format, *args)


class MayVietServer(ThreadingHTTPServer):
    daemon_threads = True

    # Trên Windows, SO_REUSEADDR có ý nghĩa khác Unix nên tắt đi.
    allow_reuse_address = sys.platform != "win32"
    allow_reuse_port = False

    def __init__(self, port: int, directory: Path, verbose: bool = False) -> None:
        self.directory = directory.resolve()
        self.verbose = verbose
        super().__init__((HOST, port), WeatherRequestHandler)

    # Windows cần đặt cờ độc quyền trước khi bind.
    def server_bind(self) -> None:
        if sys.platform == "win32" and hasattr(socket, "SO_EXCLUSIVEADDRUSE"):
            self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_EXCLUSIVEADDRUSE, 1)
        super().server_bind()


def parse_port(value: str) -> int:
    try:
        port = int(value)
    except ValueError as e:
        raise argparse.ArgumentTypeError("Cổng phải là một số nguyên.") from e
    # Chừa 10 cổng phía sau cho cơ chế dự phòng.
    if not 1024 <= port <= 65535 - EXTRA_PORTS:
        raise argparse.ArgumentTypeError("Chọn cổng từ 1024 đến 65525.")
    return port


def make_server(port: int, directory: Path = DIST_DIR, verbose: bool = False) -> MayVietServer:
    if not (directory / "index.html").is_file():
        raise FileNotFoundError(
            "Thiếu dist/index.html. Hãy giải nén toàn bộ ZIP, giữ thư mục dist cạnh app.py. "
            "Nếu đang sửa giao diện, xem phần build trong README.md."
        )
    if not 1024 <= port <= 65535 - EXTRA_PORTS:
        raise ValueError("Cổng phải nằm trong khoảng 1024..65525.")
    last_error: OSError | None = None
    for candidate in range(port, port + EXTRA_PORTS + 1):
        try:
            return MayVietServer(candidate, directory, verbose)
        except OSError as e:
            # 10048/10013 là mã lỗi cổng bận của Windows.
            if e.errno not in (errno.EADDRINUSE, 10048, 10013) and getattr(e, "winerror", None) not in (10048, 10013):
                raise
            last_error = e
    raise OSError(f"Các cổng {port}..{port + EXTRA_PORTS} không khả dụng. Hãy chọn --port khác.") from last_error


def open_browser(url: str) -> None:
    try:
        opened = webbrowser.open(url, new=2)
        if not opened:
            print(f"Bạn có thể tự mở trình duyệt tại: {url}", flush=True)
    except Exception as e:
        print(f"Chưa tự mở được trình duyệt ({e}). Hãy mở: {url}", flush=True)


def main(argv: list[str] | None = None) -> int:
    if sys.version_info < (3, 10):
        print("Mây Việt cần Python 3.10 trở lên.", file=sys.stderr)
        return 1
    parser = argparse.ArgumentParser(description="Mây Việt — chạy ứng dụng thời tiết bằng Python.")
    parser.add_argument("--port", type=parse_port, default=DEFAULT_PORT, help="Cổng bắt đầu, mặc định 5173.")
    parser.add_argument("--no-open", action="store_true", help="Không tự mở trình duyệt.")
    parser.add_argument("--verbose", action="store_true", help="In các yêu cầu HTTP để gỡ lỗi.")
    args = parser.parse_args(argv)
    try:
        server = make_server(args.port, verbose=args.verbose)
    except (OSError, ValueError) as e:
        print(f"Không mở được Mây Việt: {e}", file=sys.stderr)
        return 1

    # Có thể khác --port nếu cổng yêu cầu đang bận.
    actual_port = server.server_address[1]
    url = f"http://localhost:{actual_port}"
    print(f"\nMÂY VIỆT — THỜI TIẾT VIỆT NAM\nMở ứng dụng: {url}", flush=True)
    if actual_port != args.port:
        print(f"Cổng {args.port} đang bận; đã dùng cổng {actual_port}.", flush=True)
    print("Giữ cửa sổ này mở khi sử dụng. Nhấn Ctrl+C để dừng.\n", flush=True)

    browser_timer: threading.Timer | None = None
    if not args.no_open:
        # Socket đã sẵn sàng, mở trình duyệt sau 0,4 giây.
        browser_timer = threading.Timer(0.4, open_browser, args=(url,))
        browser_timer.daemon = True
        browser_timer.start()
    try:
        server.serve_forever(poll_interval=0.2)
    except KeyboardInterrupt:
        print("\nĐã dừng Mây Việt.", flush=True)
    finally:
        if browser_timer is not None:
            browser_timer.cancel()
        server.server_close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())