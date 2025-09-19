
if [ -z "${HEARTBEAT_URL:-}" ]; then echo "ERROR: HEARTBEAT_URL is not set. Export it first: export HEARTBEAT_URL='https://...'" exit 2 fi

echo "== Diagnostics: environment variables ==" echo "HEARTBEAT_URL=$HEARTBEAT_URL"

echo "---- DNS resolution ----" nslookup_host() { if command -v dig >/dev/null 2>&1; then dig +short "$1"; fi if command -v nslookup >/dev/null 2>&1; then nslookup "$1" || true; fi } HOST=$(echo "$HEARTBEAT_URL" | sed -E 's#^[a-z]+://##' | sed -E 's#/.*$##' || true) echo "Host: $HOST" nslookup_host "$HOST" || true

echo "---- curl verbose ----" curl --fail --show-error --location --max-time 15 --connect-timeout 10 -v --retry 2 --retry-delay 2
-H "Accept: application/json"
-o /tmp/heartbeat_response.json
-w "\nHTTP_CODE:%{http_code}\nCURL_EXIT:%{exitcode}\n"
"$HEARTBEAT_URL" || true

if [ -f /tmp/heartbeat_response.json ]; then echo "Response body:" sed -n '1,200p' /tmp/heartbeat_response.json || true else echo "/tmp/heartbeat_response.json not found" fi

echo "---- network interfaces ----" if command -v ip >/dev/null 2>&1; then ip addr || true; else ifconfig || true; fi

echo "---- traceroute (may be unavailable) ----" if command -v traceroute >/dev/null 2>&1; then traceroute -m 30 "$HOST" || true; fi EOF
