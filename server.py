#!/usr/bin/env python3
"""
AuraFinance™ Industrial Server
Zero-dependency HTTP server with automatic port detection, CORS, and clean static file serving.
"""

import http.server
import socketserver
import os
import sys
import webbrowser
from urllib.parse import urlparse

DEFAULT_PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class AuraFinanceHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Enable CORS and disable aggressive caching for local development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == '/api/health':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(b'{"status": "healthy", "service": "AuraFinance Server", "version": "2.4.0"}')
            return

        # Default root route to index.html
        if parsed.path == '/' or parsed.path == '':
            self.path = '/index.html'

        return super().do_GET()

def run_server(start_port=DEFAULT_PORT, auto_open=True):
    port = start_port
    max_port = start_port + 20
    httpd = None

    while port < max_port:
        try:
            handler = AuraFinanceHandler
            httpd = socketserver.TCPServer(("", port), handler)
            break
        except OSError:
            port += 1

    if not httpd:
        print(f"Error: Could not bind to any port between {start_port} and {max_port}")
        sys.exit(1)

    url = f"http://localhost:{port}"
    print("=" * 65)
    print("  [*] AuraFinance Industrial Data Studio Server Running")
    print(f"  [-] Local URL:     {url}")
    print(f"  [-] Serving from:  {DIRECTORY}")
    print(f"  [-] Palette:       Light Theme (Olive, Ivory & Caramel)")
    print("  [-] Press Ctrl+C to stop the server")
    print("=" * 65)

    if auto_open:
        try:
            webbrowser.open(url)
        except Exception:
            pass

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer shutting down gracefully.")
        httpd.server_close()

if __name__ == '__main__':
    auto_open = '--no-browser' not in sys.argv
    port = DEFAULT_PORT
    for arg in sys.argv[1:]:
        if arg.isdigit():
            port = int(arg)
    run_server(port, auto_open=auto_open)
