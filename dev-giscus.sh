#!/usr/bin/env bash
# Start local giscus theme preview service (HTTPS + CORS), so that while running hugo serve,
# changes to static/giscus/*.css are reflected live. See the top of scripts/serve-giscus.py for details.
#
# Usage:
#   scripts/dev-giscus.sh           # Start preview service (foreground, Ctrl+C to exit)
#   In another terminal, run: hugo serve       # The site itself
# Then open http://localhost:1313/posts/... in browser, and the comments will use the local CSS.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

PORT="${1:-8443}"
CERT_DIR="certs"
# mkcert localhost 127.0.0.1 ::1 → localhost+2.pem / localhost+2-key.pem
CERT="$CERT_DIR/localhost+2.pem"
KEY="$CERT_DIR/localhost+2-key.pem"

if ! command -v mkcert >/dev/null 2>&1; then
  echo "✗ mkcert not installed. Please run: brew install mkcert" >&2
  exit 1
fi

# First run: generate localhost certificate (mkcert -install only needs to be done once, see note below)
if [ ! -f "$CERT" ] || [ ! -f "$KEY" ]; then
  mkdir -p "$CERT_DIR"
  echo "→ Generating localhost certificate into $CERT_DIR/ …"
  (cd "$CERT_DIR" && mkcert localhost 127.0.0.1 "::1")
fi

if ! security find-certificate -c "mkcert" /Library/Keychains/System.keychain >/dev/null 2>&1 \
   && ! security find-certificate -c "mkcert" ~/Library/Keychains/login.keychain-db >/dev/null 2>&1; then
  echo "⚠️  It seems you haven't run \`mkcert -install\` yet (if the browser doesn't trust the certificate, giscus will fail to load)."
  echo "    Please run in another terminal (once, requires sudo): mkcert -install"
  echo
fi

echo "→ Starting giscus theme preview at https://localhost:$PORT …"
echo "  Edit static/giscus/*.css and refresh the page to see changes."
exec python3 scripts/serve-giscus.py "$PORT" "$CERT" "$KEY"
