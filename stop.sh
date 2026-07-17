#!/usr/bin/env bash
# Stop the Gordian-X server. Port 10777 is permanent (governance-locked).
set -euo pipefail

readonly PORT=10777
ROOT=$(cd "$(dirname "$0")" && pwd -P)
readonly PIDFILE="/tmp/gordy-server.pid"

if [ "${1:-}" = "--help" ] || [ "${1:-}" = "-h" ]; then
  echo "Usage: $0"
  echo "Port is locked at $PORT (governance-assigned)."
  exit 0
fi

PID=$(sed -n '1p' "$PIDFILE" 2>/dev/null || true)

if [ -z "$PID" ]; then
  echo "[gordy] no tracked server running on :$PORT"
  exit 0
fi
if ! [[ "$PID" =~ ^[0-9]+$ ]]; then
  echo "[gordy] ERROR: invalid PID file; refusing to signal any process." >&2
  exit 1
fi
if ! kill -0 "$PID" 2>/dev/null; then
  echo "[gordy] tracked process $PID is no longer running"
  : >"$PIDFILE"
  exit 0
fi

COMMAND=$(ps -p "$PID" -o command= 2>/dev/null || true)
if [[ "$COMMAND" != *"$ROOT/server.py"* ]]; then
  echo "[gordy] ERROR: tracked PID $PID is not this Gordian-X server." >&2
  echo "[gordy] Refusing to terminate it." >&2
  exit 1
fi

echo "[gordy] stopping pid $PID on :$PORT"
kill "$PID"
for _ in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20; do
  if ! kill -0 "$PID" 2>/dev/null; then break; fi
  sleep 0.2
done
if kill -0 "$PID" 2>/dev/null; then
  echo "[gordy] ERROR: server did not stop after SIGTERM; no stronger signal was sent." >&2
  exit 1
fi
: >"$PIDFILE"
echo "[gordy] stopped"
