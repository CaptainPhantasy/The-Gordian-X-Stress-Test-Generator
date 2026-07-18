#!/usr/bin/env python3
"""Static file server + CORS-bypass proxy for Gordian-X.

Routes:
  GET  /*              -> static files from project dir
  POST /proxy/<key>    -> forward to UPSTREAM[key] preserving headers/body

Run: python3 server.py
Port 10777 is governance-assigned and permanent. Do not override.
"""
import http.server
import json
import os
import socketserver
import sys
import urllib.error
import urllib.parse
import urllib.request

# Port 10777 is Gordian-X's permanent, governance-assigned port for the
# entire lifecycle of this application. It is locked per
# .supercache/manifests/port-allocation-policy.yaml and FLOYD.md. Do not
# parameterize, override, or relocate without Douglas Talley's approval.
PORT = 10777
ROOT = os.path.dirname(os.path.abspath(__file__))
MAX_BODY_BYTES = 2 * 1024 * 1024
ALLOWED_ORIGINS = {
    f"http://127.0.0.1:{PORT}",
    f"http://localhost:{PORT}",
}
STATIC_ROUTES = {
    "/": "/index.html",
    "/index.html": "/index.html",
    "/app.js": "/app.js",
    "/style.css": "/style.css",
    "/gordiux.png": "/gordiux.png",
}

UPSTREAM = {
    'openai':           'https://api.openai.com/v1/chat/completions',
    'openrouter':       'https://openrouter.ai/api/v1/chat/completions',
    'anthropic':        'https://api.anthropic.com/v1/messages',
    'google':           'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
    'groq':             'https://api.groq.com/openai/v1/chat/completions',
    'together':         'https://api.together.xyz/v1/chat/completions',
    'xai':              'https://api.x.ai/v1/chat/completions',
    'opencode_zen':     'https://opencode.ai/zen/v1/chat/completions',
    'opencode_go':      'https://opencode.ai/zen/go/v1/chat/completions',
    'opencode_go_mini': 'https://opencode.ai/zen/go/v1/messages',
}

FORWARD_HEADERS = {
    'authorization', 'x-api-key', 'anthropic-version',
    'anthropic-dangerous-direct-browser-access',
    'content-type', 'http-referer', 'x-title', 'accept'
}

FALLBACK_UA = (
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
    'AppleWebKit/537.36 (KHTML, like Gecko) '
    'Chrome/131.0.0.0 Safari/537.36'
)


class Handler(http.server.SimpleHTTPRequestHandler):
    def _origin_allowed(self):
        origin = self.headers.get('Origin')
        return origin is None or origin in ALLOWED_ORIGINS

    def _local_cors(self):
        origin = self.headers.get('Origin')
        if origin in ALLOWED_ORIGINS:
            self.send_header('Access-Control-Allow-Origin', origin)
            self.send_header('Vary', 'Origin')
        self.send_header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
        self.send_header(
            'Access-Control-Allow-Headers',
            'authorization,content-type,x-api-key,anthropic-version,'
            'anthropic-dangerous-direct-browser-access,http-referer,x-title',
        )

    def do_GET(self):
        path = urllib.parse.urlsplit(self.path).path
        static_path = STATIC_ROUTES.get(path)
        if static_path is None:
            self.send_error(404, 'Not found')
            return
        self.path = static_path
        super().do_GET()

    def do_OPTIONS(self):
        if not self._origin_allowed():
            self._send_json(403, {'error': 'origin not allowed'})
            return
        self.send_response(204)
        self._local_cors()
        self.end_headers()

    def do_POST(self):
        if not self._origin_allowed():
            self._send_json(403, {'error': 'origin not allowed'})
            return

        path = urllib.parse.urlsplit(self.path).path
        if not path.startswith('/proxy/'):
            self._send_json(404, {'error': 'not found'})
            return
        key = path.split('/proxy/', 1)[1].strip('/')
        if key not in UPSTREAM:
            self._send_json(400, {'error': f'unknown provider: {key}'})
            return

        try:
            length = int(self.headers.get('Content-Length', 0) or 0)
        except ValueError:
            self._send_json(400, {'error': 'invalid content length'})
            return
        if length < 0 or length > MAX_BODY_BYTES:
            self._send_json(413, {'error': 'request body too large'})
            return
        body = self.rfile.read(length) if length else b''

        upstream_headers = {}
        for h, v in self.headers.items():
            if h.lower() in FORWARD_HEADERS:
                upstream_headers[h] = v
        upstream_headers.setdefault('Content-Type', 'application/json')
        # Cloudflare (fronting opencode.ai) blocks the default Python UA.
        if not any(k.lower() == 'user-agent' for k in upstream_headers):
            upstream_headers['User-Agent'] = FALLBACK_UA
        upstream_headers.setdefault('Accept', 'application/json, text/event-stream;q=0.9, */*;q=0.1')

        req = urllib.request.Request(
            UPSTREAM[key], data=body, headers=upstream_headers, method='POST'
        )
        try:
            with urllib.request.urlopen(req, timeout=180) as resp:
                self.send_response(resp.status)
                self._local_cors()
                self.send_header('Content-Type',
                                 resp.headers.get('Content-Type', 'application/json'))
                self.send_header('Cache-Control', 'no-store')
                self.end_headers()
                while True:
                    chunk = resp.read(8192)
                    if not chunk:
                        break
                    try:
                        self.wfile.write(chunk)
                        self.wfile.flush()
                    except (BrokenPipeError, ConnectionResetError):
                        return
        except urllib.error.HTTPError as e:
            self.send_response(e.code)
            self._local_cors()
            self.send_header('Content-Type',
                             e.headers.get('Content-Type', 'application/json'))
            self.send_header('Cache-Control', 'no-store')
            self.end_headers()
            try:
                self.wfile.write(e.read())
            except Exception:
                pass
        except Exception:
            self._send_json(502, {'error': 'upstream request failed'})

    def _send_json(self, status, obj):
        payload = json.dumps(obj).encode()
        self.send_response(status)
        self._local_cors()
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(payload)))
        self.send_header('Cache-Control', 'no-store')
        self.end_headers()
        try:
            self.wfile.write(payload)
        except Exception:
            pass

    def log_message(self, fmt, *args):
        sys.stderr.write('[gordy] ' + (fmt % args) + '\n')


class ThreadingServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True


if __name__ == '__main__':
    os.chdir(ROOT)
    with ThreadingServer(('127.0.0.1', PORT), Handler) as s:
        print(f'Gordian-X serving at http://localhost:{PORT}/', flush=True)
        print(f'Proxy routes: {", ".join(sorted(UPSTREAM.keys()))}', flush=True)
        try:
            s.serve_forever()
        except KeyboardInterrupt:
            pass
