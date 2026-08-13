#!/usr/bin/env bash
set -euo pipefail

# Load .envrc then .env if present.
# set +eu while sourcing so direnv-specific builtins fail silently.
for envfile in .envrc .env; do
  if [[ -f "$envfile" ]]; then
    set +eu
    set -a
    # shellcheck source=/dev/null
    source "$envfile" 2>/dev/null
    set +a
    set -eu
  fi
done

: "${GOOGLE_MAPS_API_KEY:?GOOGLE_MAPS_API_KEY is not set. Add it to .envrc or .env, or export it before running.}"

masked="${GOOGLE_MAPS_API_KEY:0:4}****${GOOGLE_MAPS_API_KEY: -4}"
echo "GOOGLE_MAPS_API_KEY detected: ${masked}"

PORT="${PORT:-8080}"
OUT=".dev"

mkdir -p "$OUT"
cp favicon.ico favicon-16x16.png favicon-32x32.png apple-touch-icon.png \
   android-chrome-192x192.png android-chrome-512x512.png site.webmanifest "$OUT/"

echo "Serving at http://localhost:${PORT}. Press Ctrl+C to stop."
echo "Live reload is on. Edits to index.html and talks.toml refresh the browser."
echo "Add 'localhost:${PORT}' to your Maps API key referrer restrictions if not already there."

export GOOGLE_MAPS_API_KEY PORT OUT

python3 <<'PYEOF'
import http.server
import os
import threading
import time

OUT = os.environ["OUT"]
PORT = int(os.environ["PORT"])
API_KEY = os.environ["GOOGLE_MAPS_API_KEY"]

# Source files that trigger a rebuild and browser reload when they change.
SOURCES = ["index.html", "talks.toml"]

# Development live reload snippet. Injected by dev.sh; absent from production.
LIVE_RELOAD = """
<script>
  (function () {
    const source = new EventSource("/__livereload");
    source.onmessage = function (event) {
      if (event.data === "reload") location.reload();
    };
  })();
</script>
"""

# Incremented by the watcher on every successful rebuild. Open Server-Sent
# Events streams compare against their last-seen value to push a reload.
generation = 0


def build():
    with open("index.html", "r", encoding="utf-8") as handle:
        html = handle.read()
    html = html.replace("YOUR_GOOGLE_MAPS_API_KEY", API_KEY)
    if "</body>" in html:
        html = html.replace("</body>", LIVE_RELOAD + "</body>", 1)
    else:
        html += LIVE_RELOAD
    with open(os.path.join(OUT, "index.html"), "w", encoding="utf-8") as handle:
        handle.write(html)
    with open("talks.toml", "r", encoding="utf-8") as source:
        with open(os.path.join(OUT, "talks.toml"), "w", encoding="utf-8") as target:
            target.write(source.read())


def snapshot():
    stamps = []
    for path in SOURCES:
        try:
            stamps.append(os.stat(path).st_mtime)
        except FileNotFoundError:
            stamps.append(0)
    return tuple(stamps)


def watch():
    global generation
    last = snapshot()
    while True:
        time.sleep(0.3)
        current = snapshot()
        if current != last:
            last = current
            try:
                build()
                generation += 1
                print("Rebuilt. Reloading browser.", flush=True)
            except Exception as error:
                print("Build failed:", error, flush=True)


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=OUT, **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_GET(self):
        if self.path == "/__livereload":
            self.serve_live_reload()
            return
        super().do_GET()

    def serve_live_reload(self):
        self.send_response(200)
        self.send_header("Content-Type", "text/event-stream")
        self.end_headers()
        seen = generation
        try:
            while True:
                if generation != seen:
                    seen = generation
                    self.wfile.write(b"data: reload\n\n")
                else:
                    self.wfile.write(b": ping\n\n")
                self.wfile.flush()
                time.sleep(0.5)
        except (BrokenPipeError, ConnectionResetError):
            pass


build()
threading.Thread(target=watch, daemon=True).start()
http.server.ThreadingHTTPServer(("", PORT), Handler).serve_forever()
PYEOF
