#!/usr/bin/env bash
# One-click start of local development environment: giscus theme preview + hugo serve + matplotlib hot reload
# - Automatically cleans up stale processes before starting (avoid port conflicts)
# - Outputs with colored prefixes ([giscus] cyan / [hugo] yellow / [render] green) for easy distinction
# - Automatically re-runs matplotlib pre-rendering when Content/scripts/templates change
# - Ctrl+C gracefully shuts down all services simultaneously, no leftover processes
#
# Usage:
#   pnpm dev
#   PATH="$PWD/bin:$PATH" hugo dev
set -uo pipefail
cd "$(git rev-parse --show-toplevel)"

GISCUS_PORT=8443
HUGO_PORT=1313
WATCH_ROOTS=(content layouts assets scripts)
WATCH_EXTENSIONS='\.(md|html|css|py|mjs|sh)$'

CYAN='\033[36m'
YELLOW='\033[33m'
GREEN='\033[32m'
RESET='\033[0m'

prefix() {
  awk -v l="$1" -v c="$2" -v r="$RESET" '{printf "%s[%s]%s %s\n", c, l, r, $0; fflush()}'
}


render_matplotlib() {
  printf "${GREEN}→ Running matplotlib pre-render${RESET}\n"
  if python3 scripts/render_matplotlib.py; then
    printf "${GREEN}✓ matplotlib pre-render completed${RESET}\n"
  else
    printf "${YELLOW}⚠️  matplotlib pre-render failed${RESET}\n"
  fi
}

watch_matplotlib() {
  if ! command -v fswatch >/dev/null 2>&1; then
    printf "${YELLOW}⚠️  fswatch not found, hot reload will only use Hugo's built-in capability${RESET}\n"
    return 0
  fi

  printf "${GREEN}→ Starting matplotlib file watcher${RESET}\n"
  fswatch -0 "${WATCH_ROOTS[@]}" \
    | while IFS= read -r -d '' changed; do
        case "$changed" in
          *.md|*.html|*.css|*.py|*.mjs|*.sh)
            if [[ "$changed" =~ $WATCH_EXTENSIONS ]]; then
              printf "${CYAN}[watch]${RESET} Changed: %s\n" "$changed"
              render_matplotlib
            fi
            ;;
        esac
      done
}

cleanup() {
  echo
  printf "${YELLOW}→ Shutting down services…${RESET}\n"
  pkill -9 -f "serve-giscus.py" 2>/dev/null || true
  pkill -9 -f "hugo serve" 2>/dev/null || true
  pkill -9 -f "fswatch" 2>/dev/null || true
  sleep 0.3
  printf "${GREEN}✓ Shut down${RESET}\n"
}
trap cleanup EXIT

# Clean up any stale port occupancy before starting
pre_clean() {
  for port in "$GISCUS_PORT" "$HUGO_PORT"; do
    if lsof -ti :"$port" >/dev/null 2>&1; then
      printf "${YELLOW}⚠️  Port %s is occupied, cleaning up…${RESET}\n" "$port"
      lsof -ti :"$port" | xargs kill -9 2>/dev/null || true
    fi
  done
  sleep 0.3
}

main() {
  printf "${GREEN}→ Starting local development environment${RESET}\n"
  pre_clean
  render_matplotlib

  # Start giscus theme preview in background
  printf "${GREEN}→ giscus preview: https://localhost:%s${RESET}\n" "$GISCUS_PORT"
  scripts/dev-giscus.sh 2>&1 | prefix "giscus" "$CYAN" &

  # Start matplotlib pre-render watcher in background
  watch_matplotlib 2>&1 | prefix "render" "$GREEN" &

  # Start hugo in foreground (blocking; Ctrl+C triggers cleanup)
  printf "${GREEN}→ hugo site:  http://localhost:%s${RESET}\n" "$HUGO_PORT"
  hugo serve 2>&1 | prefix "hugo" "$YELLOW"
}

main "$@"
