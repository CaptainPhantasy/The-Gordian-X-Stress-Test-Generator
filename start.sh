#!/usr/bin/env bash
# Gordian-X launcher: static server + CORS proxy + browser.
#
# Port 10777 is the permanent, governance-assigned port for Gordian-X
# (see FLOYD.md and .supercache/manifests/port-allocation-policy.yaml).
# It is NOT configurable. Do not add a port argument.
#
# Usage: ./start.sh            (launches + opens browser)
#        ./start.sh --no-open  (launches without opening browser)

set -euo pipefail

ROOT=$(cd "$(dirname "$0")" && pwd -P)
cd "$ROOT"

readonly PORT=10777
readonly LOG="/tmp/gordy-server.log"
readonly PIDFILE="/tmp/gordy-server.pid"
OPEN_BROWSER=1
for arg in "$@"; do
  case "$arg" in
    --no-open) OPEN_BROWSER=0 ;;
    --help|-h)
      echo "Usage: $0 [--no-open]"
      echo "Port is locked at $PORT (governance-assigned)."
      exit 0 ;;
    *)
      echo "[gordy] ERROR: unknown argument '$arg'." >&2
      echo "[gordy] Port is locked at $PORT. Only --no-open is accepted." >&2
      exit 2 ;;
  esac
done

# --- Replace only a previously tracked Gordian-X instance ---
EXISTING=$(lsof -tiTCP:"$PORT" -sTCP:LISTEN 2>/dev/null || true)
if [ -n "$EXISTING" ]; then
  TRACKED=$(sed -n '1p' "$PIDFILE" 2>/dev/null || true)
  COMMAND=$(ps -p "$EXISTING" -o command= 2>/dev/null || true)
  if [ "$TRACKED" = "$EXISTING" ] && [[ "$COMMAND" == *"$ROOT/server.py"* ]]; then
    echo "[gordy] replacing tracked server on :$PORT (pid $EXISTING)"
    ./stop.sh
  else
    echo "[gordy] ERROR: :$PORT is owned by an untracked process (pid $EXISTING)." >&2
    echo "[gordy] Refusing to terminate it. Stop that process explicitly or free the port." >&2
    exit 1
  fi
fi

# --- Preflight ---
if [ ! -f "server.py" ]; then
  echo "[gordy] ERROR: server.py not found in $(pwd)" >&2
  exit 1
fi
if ! command -v python3 >/dev/null 2>&1; then
  echo "[gordy] ERROR: python3 not on PATH" >&2
  exit 1
fi

# --- Start server (static + proxy in one process, locked to :10777) ---
echo "[gordy] launching server.py on :$PORT (governance-locked) ..."
python3 "$ROOT/server.py" >"$LOG" 2>&1 &
SERVER_PID=$!
echo "$SERVER_PID" >"$PIDFILE"

# --- Wait for listen ---
for _ in 1 2 3 4 5 6 7 8 9 10; do
  if lsof -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then break; fi
  sleep 0.3
done

if ! lsof -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "[gordy] ERROR: server did not start. Last 20 lines of $LOG:" >&2
  tail -20 "$LOG" >&2 || true
  if kill -0 "$SERVER_PID" 2>/dev/null; then kill "$SERVER_PID" 2>/dev/null || true; fi
  : >"$PIDFILE"
  exit 1
fi

URL="http://localhost:$PORT/"
echo "[gordy] ready at $URL  (pid $SERVER_PID, log: $LOG)"
echo "[gordy] proxy routes: /proxy/openai, /proxy/opencode_zen, /proxy/opencode_go, /proxy/opencode_go_mini, ..."

if [ "$OPEN_BROWSER" = "1" ]; then
  if command -v open >/dev/null 2>&1; then
    open "$URL"
  elif command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$URL"
  fi
fi

echo "[gordy] tail the log with:  tail -f $LOG"
echo "[gordy] stop the server with: ./stop.sh  (or: kill \$(cat $PIDFILE))"
