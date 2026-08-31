#!/usr/bin/env python3
"""Local giscus theme preview server.

Why it's needed: giscus uses `<link crossorigin="anonymous">` to load custom theme CSS,
so local preview requires not only HTTPS (mixed-content restrictions), but also CORS headers
from the server. hugo serve provides neither, so this small service serves CSS from static/giscus/.

Usage:
  1. One-time setup: `mkcert -install` (on macOS, use sudo to install the local CA into the system keychain)
  2. `scripts/dev-giscus.sh`            # Automatically generates certificates and starts the service
  Or manually:
     cd certs && mkcert localhost
     python3 scripts/serve-giscus.py 8443 certs/localhost.pem certs/localhost-key.pem

Then hugo serve will point giscus themeBaseURL to https://localhost:8443 (via config/development/params.toml).
Edit static/giscus/*.css and refresh the page to see changes.
"""
import http.server
import socketserver
import ssl
import sys
import pathlib
import functools

ROOT = pathlib.Path(__file__).resolve().parent.parent / "static" / "giscus"
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8443
CERT = sys.argv[2] if len(sys.argv) > 2 else "localhost.pem"
KEY = sys.argv[3] if len(sys.argv) > 3 else "localhost-key.pem"


class CORSHandler(http.server.SimpleHTTPRequestHandler):
    """Serve static/giscus/ with permissive CORS + no-cache for live editing."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Cache-Control", "no-store, must-revalidate")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def log_message(self, fmt, *args):
        # Brief logs: only method + path
        sys.stderr.write(f"  {self.command} {self.path}\n")


def main():
    if not ROOT.is_dir():
        sys.exit(f"[giscus] {ROOT} not found. Please run from the project root.")

    ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    try:
        ctx.load_cert_chain(CERT, KEY)
    except FileNotFoundError:
        sys.exit(
            f"[giscus] Certificate {CERT}/{KEY} not found.\n"
            "First run `mkcert -install` (one-time), then `scripts/dev-giscus.sh`."
        )

    handler = functools.partial(CORSHandler)
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("127.0.0.1", PORT), handler) as httpd:
        httpd.socket = ctx.wrap_socket(httpd.socket, server_side=True)
        print(f"[giscus] HTTPS+CORS service:  https://localhost:{PORT}")
        print(f"[giscus] Root directory:       {ROOT}")
        print("[giscus] Press Ctrl+C to exit. Edit static/giscus/*.css and refresh the page.")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n[giscus] Exited.")


if __name__ == "__main__":
    main()
