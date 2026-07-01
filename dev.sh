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
sed "s/YOUR_GOOGLE_MAPS_API_KEY/${GOOGLE_MAPS_API_KEY}/g" index.html > "$OUT/index.html"
cp talks.toml "$OUT/talks.toml"

echo "Serving at http://localhost:${PORT}. Press Ctrl+C to stop."
echo "Add 'localhost:${PORT}' to your Maps API key referrer restrictions if not already there."

python3 - <<EOF
import http.server, os

os.chdir("${OUT}")

class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

http.server.HTTPServer(("", ${PORT}), Handler).serve_forever()
EOF
