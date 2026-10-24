#!/usr/bin/env python3
"""
Local development server for ChronoVerse 3D (Interactive 3D Timeline for Kids).
Security: binds strictly to 127.0.0.1 (never 0.0.0.0), enforces an allow-list of HTTP methods (GET, HEAD),
and sends strict security headers (Content-Security-Policy, X-Content-Type-Options: nosniff,
X-Frame-Options: DENY, Permissions-Policy, Referrer-Policy).
"""

import http.server
import mimetypes
import os
from http.server import ThreadingHTTPServer

HOST = "127.0.0.1"
PORT = int(os.environ.get("PORT", "8090"))
WEB_ROOT = os.path.dirname(os.path.abspath(__file__))

mimetypes.add_type("application/javascript", ".js")
mimetypes.add_type("application/javascript", ".mjs")
mimetypes.add_type("image/svg+xml", ".svg")
mimetypes.add_type("image/webp", ".webp")


class SecureStaticHandler(http.server.SimpleHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=WEB_ROOT, **kwargs)

    # Allow-list only GET and HEAD methods; reject others (Fail Safe)
    def do_POST(self):
        self.send_error(405, "Method Not Allowed")

    def do_PUT(self):
        self.send_error(405, "Method Not Allowed")

    def do_DELETE(self):
        self.send_error(405, "Method Not Allowed")

    def do_TRACE(self):
        self.send_error(405, "Method Not Allowed")

    def end_headers(self):
        self.send_header(
            "Content-Security-Policy",
            "default-src 'self'; script-src 'self'; style-src 'self'; "
            "img-src 'self' data: blob:; media-src 'self' data: blob:; "
            "connect-src 'self' blob:; object-src 'none'; frame-ancestors 'none'; "
            "base-uri 'self'; form-action 'self';",
        )
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "DENY")
        self.send_header("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
        self.send_header("Referrer-Policy", "strict-origin-when-cross-origin")
        if self.path.startswith("/assets/") or self.path.startswith("/vendor/"):
            self.send_header("Cache-Control", "public, max-age=86400")
        else:
            self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def log_message(self, fmt, *args):
        if args and str(args[1]).startswith(("4", "5")):
            super().log_message(fmt, *args)


if __name__ == "__main__":
    ThreadingHTTPServer.allow_reuse_address = True
    ThreadingHTTPServer.daemon_threads = True
    ThreadingHTTPServer.request_queue_size = 128
    with ThreadingHTTPServer((HOST, PORT), SecureStaticHandler) as httpd:
        print(f"⏳ ChronoVerse 3D running at http://{HOST}:{PORT}")
        httpd.serve_forever()
