"""Serve a folder locally as UTF-8 for testing.

  python3 tools/serve.py [port] [folder]   (folder defaults to app/; use dist to try the built site)
"""
import functools, http.server, pathlib, sys

H = http.server.SimpleHTTPRequestHandler
for ext, t in {".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".webmanifest": "application/manifest+json"}.items():
    H.extensions_map[ext] = t + "; charset=utf-8"
root = pathlib.Path(__file__).resolve().parent.parent
folder = root / (sys.argv[2] if len(sys.argv) > 2 else "app")
port = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
http.server.test(HandlerClass=functools.partial(H, directory=str(folder)), port=port)
