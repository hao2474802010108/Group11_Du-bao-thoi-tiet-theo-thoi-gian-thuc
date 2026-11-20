"""Kiểm tra máy chủ Python bằng HTTP thật trên localhost, không gọi API thời tiết.

Chạy tại thư mục MayViet: python -m unittest discover -s tests -p "test_*.py" -v
"""

import contextlib
import http.client
import io
import os
import re
import shutil
import signal
import socket
import subprocess
import sys
import tempfile
import threading
import time
import unittest
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from unittest.mock import patch

import app


# [TEST-PY-001] Xin hệ điều hành một cổng trống; make_server vẫn tự bind/thử lại để tránh cổng bị chiếm sau đó.
def available_port() -> int:
    with socket.socket() as sock:
        sock.bind((app.HOST, 0))
        port = sock.getsockname()[1]
    if port > 65525:
        return available_port()
    return port


# [TEST-PY-002] Gửi một request thật và đọc hết phản hồi; always close để bài kiểm tra không giữ kết nối.
def request(port: int, path: str, method: str = "GET") -> tuple[int, dict[str, str], bytes]:
    connection = http.client.HTTPConnection(app.HOST, port, timeout=5)
    try:
        connection.request(method, path)
        response = connection.getresponse()
        return response.status, {k.lower(): v for k, v in response.getheaders()}, response.read()
    finally:
        connection.close()


# [TEST-PY-003] Mỗi bài có thư mục tạm riêng; dữ liệu kiểm tra không được dùng làm thời tiết của app.
class StaticServerTests(unittest.TestCase):
    def setUp(self) -> None:
        temporary = tempfile.TemporaryDirectory(prefix="Mây Việt kiểm tra ")
        self.addCleanup(temporary.cleanup)
        self.parent = Path(temporary.name)
        self.web = self.parent / "dist"
        (self.web / "assets").mkdir(parents=True)
        (self.web / "fonts").mkdir()
        self.html = "<!doctype html><html lang='vi'>Mây Việt có dấu</html>".encode()
        (self.web / "index.html").write_bytes(self.html)
        (self.web / "assets/main.js").write_bytes(b"console.log('May Viet');")
        (self.web / "assets/main.css").write_bytes(b"body{color:blue}")
        (self.web / "fonts/test.woff2").write_bytes(b"wOF2\x00\x80\xff")
        (self.web / "manifest.webmanifest").write_text('{"name":"May Viet"}')
        (self.web / "mây việt.txt").write_text("Đường dẫn tiếng Việt", encoding="utf-8")
        self.secret = b"FILE_OUTSIDE_DIST_MUST_NOT_BE_READ"
        (self.parent / "outside.txt").write_bytes(self.secret)
        # [TEST-PY-004] Cổng 0 chỉ dùng nội bộ test để hệ điều hành cấp cổng, không phải tùy chọn CLI của người dùng.
        self.server = app.MayVietServer(0, self.web)
        self.port = self.server.server_address[1]
        self.thread = threading.Thread(target=self.server.serve_forever, kwargs={"poll_interval": 0.02}, daemon=True)
        self.thread.start()

        # [TEST-PY-005] Luôn dừng máy chủ trước khi xóa thư mục tạm; không để lại tiến trình/cổng sau test.
        def stop() -> None:
            self.server.shutdown()
            self.server.server_close()
            self.thread.join(timeout=2)

        self.addCleanup(stop)

    # [TEST-PY-006] Trang chủ phải tải đúng bytes UTF-8 và có header ngăn cache giao diện cũ.
    def test_homepage_and_common_headers(self) -> None:
        status, headers, body = request(self.port, "/")
        self.assertEqual(status, 200)
        self.assertEqual(body, self.html)
        self.assertIn("charset=utf-8", headers["content-type"])
        self.assertEqual(int(headers["content-length"]), len(self.html))
        self.assertEqual(headers["cache-control"], "no-store")
        self.assertEqual(headers["x-content-type-options"], "nosniff")

    # [TEST-PY-007] JS/CSS/font/manifest phải có MIME đúng, kể cả trên Windows có registry MIME khác.
    def test_asset_mime_types_and_binary_integrity(self) -> None:
        for path, mime in [
            ("/assets/main.js", "text/javascript"),
            ("/assets/main.css", "text/css"),
            ("/fonts/test.woff2", "font/woff2"),
            ("/manifest.webmanifest", "application/manifest+json"),
        ]:
            with self.subTest(path=path):
                status, headers, body = request(self.port, path)
                self.assertEqual(status, 200)
                self.assertTrue(headers["content-type"].startswith(mime))
                self.assertEqual(body, (self.web / path.lstrip("/")).read_bytes())

    # [TEST-PY-008] HEAD phải có kích thước thật nhưng không gửi body.
    def test_head_has_headers_without_body(self) -> None:
        status, headers, body = request(self.port, "/", "HEAD")
        self.assertEqual(status, 200)
        self.assertEqual(int(headers["content-length"]), len(self.html))
        self.assertEqual(body, b"")

    # [TEST-PY-009] Query cập nhật cache không được trở thành một phần tên file.
    def test_query_string_does_not_break_assets(self) -> None:
        status, _, body = request(self.port, "/assets/main.js?v=2")
        self.assertEqual(status, 200)
        self.assertEqual(body, (self.web / "assets/main.js").read_bytes())

    # [TEST-PY-010] URL có tiếng Việt và khoảng trắng mã hóa vẫn đọc đúng file.
    def test_encoded_vietnamese_filename(self) -> None:
        status, _, body = request(self.port, "/m%C3%A2y%20vi%E1%BB%87t.txt")
        self.assertEqual(status, 200)
        self.assertEqual(body.decode(), "Đường dẫn tiếng Việt")

    # [TEST-PY-011] File thiếu trả 404, không gửi index.html giả thành JavaScript.
    def test_missing_file_returns_404(self) -> None:
        status, _, _ = request(self.port, "/assets/missing.js")
        self.assertEqual(status, 404)

    # [TEST-PY-012] Không mở danh sách file khi yêu cầu thư mục không có index.html.
    def test_directory_listing_is_disabled(self) -> None:
        for path in ["/assets/", "/fonts", "/fonts/"]:
            with self.subTest(path=path):
                self.assertEqual(request(self.port, path)[0], 404)

    # [TEST-PY-013] Phương thức ghi bị từ chối và phản hồi nêu rõ chỉ hỗ trợ GET/HEAD.
    def test_write_methods_return_405(self) -> None:
        for method in ["POST", "PUT", "PATCH", "DELETE", "OPTIONS", "TRACE"]:
            with self.subTest(method=method):
                status, headers, body = request(self.port, "/index.html", method)
                self.assertEqual(status, 405)
                self.assertEqual(headers["allow"], "GET, HEAD")
                self.assertEqual(body, b"")
        self.assertEqual((self.web / "index.html").read_bytes(), self.html)

    # [TEST-PY-014] Chặn cả .. bình thường và dạng mã hóa, không làm lộ file nằm ngoài dist.
    def test_traversal_is_blocked(self) -> None:
        for path in ["/../outside.txt", "/%2e%2e/outside.txt", "/assets/%2e%2e/%2e%2e/outside.txt"]:
            with self.subTest(path=path):
                status, _, body = request(self.port, path)
                self.assertEqual(status, 403)
                self.assertNotIn(self.secret, body)

    # [TEST-PY-015] UTF-8 sai, NUL và đường dẫn dùng gạch chéo Windows đều trả 400.
    def test_malformed_paths_return_400(self) -> None:
        for path in ["/%ff", "/%00", "/assets%5c..%5coutside.txt"]:
            with self.subTest(path=path):
                self.assertEqual(request(self.port, path)[0], 400)

    # [TEST-PY-016] Symlink không được dùng để đi vòng qua kiểm tra thư mục gốc; Windows có thể cần quyền tạo symlink.
    def test_symlink_outside_dist_is_blocked(self) -> None:
        try:
            (self.web / "linked.txt").symlink_to(self.parent / "outside.txt")
        except (OSError, NotImplementedError) as e:
            self.skipTest(f"Môi trường không cho tạo symlink: {e}")
        status, _, body = request(self.port, "/linked.txt")
        self.assertEqual(status, 403)
        self.assertNotIn(self.secret, body)

    # [TEST-PY-017] Kiểm tra riêng index.html là symlink, không chỉ file được yêu cầu trực tiếp.
    def test_directory_index_symlink_outside_is_blocked(self) -> None:
        folder = self.web / "escape"
        folder.mkdir()
        try:
            (folder / "index.html").symlink_to(self.parent / "outside.txt")
        except (OSError, NotImplementedError) as e:
            self.skipTest(f"Môi trường không cho tạo symlink: {e}")
        self.assertEqual(request(self.port, "/escape/")[0], 403)

    # [TEST-PY-018] Nhiều tài nguyên tải đồng thời đều nhận đúng dữ liệu, không xung đột trạng thái giữa các request.
    def test_concurrent_requests(self) -> None:
        with ThreadPoolExecutor(max_workers=6) as pool:
            results = list(pool.map(lambda _: request(self.port, "/"), range(12)))
        self.assertTrue(all(status == 200 and body == self.html for status, _, body in results))


class StartupTests(unittest.TestCase):
    # [TEST-PY-019] Chiếm một cổng thật rồi kiểm tra ứng dụng tự chuyển sang cổng lân cận, vẫn chỉ bind localhost.
    def test_busy_port_uses_another_local_port(self) -> None:
        port = available_port()
        with socket.socket() as occupied:
            occupied.bind((app.HOST, port))
            occupied.listen()
            with app.make_server(port) as server:
                self.assertEqual(server.server_address[0], app.HOST)
                self.assertGreater(server.server_address[1], port)
                self.assertLessEqual(server.server_address[1], port + app.EXTRA_PORTS)

    # [TEST-PY-020] Đầu vào CLI sai phải báo lỗi và thoát, không bắt đầu server hay mở trình duyệt.
    def test_invalid_cli_ports_fail_cleanly(self) -> None:
        for value in ["abc", "80", "65530", "-1"]:
            with self.subTest(value=value):
                result = subprocess.run(
                    [sys.executable, str(app.APP_DIR / "app.py"), f"--port={value}", "--no-open"],
                    capture_output=True, timeout=5,
                )
                self.assertEqual(result.returncode, 2)
                self.assertIn(b"--port", result.stderr)
                self.assertNotIn(b"Traceback", result.stderr)

    # [TEST-PY-021] Nếu chỉ chép app.py thiếu dist, hiển thị hướng dẫn giải nén thay vì lỗi traceback.
    def test_missing_dist_has_actionable_error(self) -> None:
        with tempfile.TemporaryDirectory() as folder:
            script = Path(folder) / "app.py"
            shutil.copyfile(app.APP_DIR / "app.py", script)
            result = subprocess.run([sys.executable, str(script), "--no-open"], capture_output=True, timeout=5)
            self.assertEqual(result.returncode, 1)
            self.assertIn(b"dist/index.html", result.stderr)
            self.assertNotIn(b"Traceback", result.stderr)

    # [TEST-PY-022] Không có trình duyệt mặc định không làm crash ứng dụng; người dùng vẫn nhận URL để mở tay.
    def test_browser_failure_keeps_manual_url_available(self) -> None:
        output = io.StringIO()
        with patch.object(app.webbrowser, "open", side_effect=OSError("No browser")), contextlib.redirect_stdout(output):
            app.open_browser("http://localhost:5173")
        self.assertIn("http://localhost:5173", output.getvalue())

    # [TEST-PY-023] Chạy CLI thật trong thư mục có dấu/khoảng trắng, từ CWD khác; tải bản dist thật và mọi tài nguyên chính.
    def test_cli_serves_packaged_app_from_any_working_directory(self) -> None:
        with tempfile.TemporaryDirectory(prefix="Mây Việt Python ") as folder:
            project = Path(folder) / "Thư mục ứng dụng"
            project.mkdir()
            shutil.copyfile(app.APP_DIR / "app.py", project / "app.py")
            shutil.copytree(app.DIST_DIR, project / "dist")
            log = Path(folder) / "run.log"
            environment = dict(os.environ, PYTHONUTF8="1")
            with log.open("w", encoding="utf-8") as output:
                process = subprocess.Popen(
                    [sys.executable, str(project / "app.py"), "--no-open", "--port", str(available_port())],
                    cwd=folder, stdout=output, stderr=subprocess.STDOUT, env=environment,
                )
                try:
                    deadline = time.monotonic() + 5
                    match = None
                    while time.monotonic() < deadline:
                        match = re.search(r"http://localhost:(\d+)", log.read_text(encoding="utf-8"))
                        if match or process.poll() is not None:
                            break
                        time.sleep(0.03)
                    self.assertIsNone(process.poll(), log.read_text(encoding="utf-8"))
                    self.assertIsNotNone(match, "CLI chưa in địa chỉ khởi chạy.")
                    port = int(match.group(1))
                    status, _, body = request(port, "/")
                    self.assertEqual(status, 200)
                    self.assertEqual(body, (project / "dist/index.html").read_bytes())
                    html = body.decode("utf-8")
                    resources = set(re.findall(r'(?:src|href)="(/[^"#]+)"', html))
                    # [TEST-PY-024] Font nằm trong CSS nên kiểm tra thêm mọi URL font cục bộ.
                    for css in (project / "dist/assets").glob("*.css"):
                        resources.update(re.findall(r'url\([\"\']?(/fonts/[^)\"\']+)', css.read_text()))
                    self.assertTrue(any(path.endswith(".js") for path in resources))
                    self.assertTrue(any(path.endswith(".css") for path in resources))
                    for path in resources:
                        with self.subTest(resource=path):
                            status, _, data = request(port, path)
                            self.assertEqual(status, 200)
                            self.assertEqual(data, (project / "dist" / path.lstrip("/")).read_bytes())
                    # [TEST-PY-025] Trên POSIX, gửi SIGINT tương đương Ctrl+C và xác nhận dọn dẹp/thoát bình thường.
                    if os.name != "nt":
                        process.send_signal(signal.SIGINT)
                        self.assertEqual(process.wait(timeout=5), 0)
                        self.assertIn("Đã dừng Mây Việt", log.read_text(encoding="utf-8"))
                finally:
                    # [TEST-PY-026] Windows dùng terminate để dọn tiến trình test; tránh gửi Ctrl+C vào terminal của người dùng.
                    if process.poll() is None:
                        process.terminate()
                    try:
                        process.wait(timeout=5)
                    except subprocess.TimeoutExpired:
                        process.kill()
                        process.wait(timeout=5)


# [TEST-PY-027] Cho phép chạy trực tiếp python tests/test_app.py khi thư mục gốc có trong PYTHONPATH; ưu tiên lệnh discover ở đầu file.
if __name__ == "__main__":
    unittest.main()
