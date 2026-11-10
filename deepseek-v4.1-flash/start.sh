#!/bin/sh
# 秋园行 — 在浏览器中打开游戏（macOS 优先使用 Chrome）。
cd "$(dirname "$0")" || exit 1
if [ -d "/Applications/Google Chrome.app" ]; then
  open -a "Google Chrome" "index.html"
elif command -v open >/dev/null 2>&1; then
  open "index.html"
elif command -v xdg-open >/dev/null 2>&1; then
  xdg-open "index.html"
else
  python3 -m http.server 8000
fi
