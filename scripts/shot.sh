#!/bin/sh
# Render one still of a scene at a given beat, with every animation at its end state.
# usage: shot.sh <page.local.html> <sceneId.beat[.time]> <out.png> [width,height]
#   e.g. shot.sh talk.local.html loop.2 shots/loop2.png        (desktop 1280x720)
#        shot.sh talk.local.html loop.2 shots/loop2p.png 420,860 (phone)
# Shader or scene-build errors are printed on the page in red, so they show up in the image.
PAGE="$(cd "$(dirname "$1")" && pwd)/$(basename "$1")"; OUT="$3"; mkdir -p "$(dirname "$OUT")"
OUT="$(cd "$(dirname "$OUT")" && pwd)/$(basename "$OUT")"
CH="${CHROMIUM_PATH:-}"
[ -z "$CH" ] && CH=$(find "$HOME/Library/Caches/ms-playwright" "$HOME/.cache/ms-playwright" -type f \( -name chrome-headless-shell -o -name headless_shell \) 2>/dev/null | head -1)
[ -z "$CH" ] && [ -x "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" ] && CH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
[ -z "$CH" ] && CH=$(command -v chromium || command -v chromium-browser || command -v google-chrome || true)
[ -z "$CH" ] && { echo "no Chromium found; set CHROMIUM_PATH" >&2; exit 3; }
"$CH" --headless --hide-scrollbars --enable-unsafe-swiftshader --use-angle=swiftshader --ignore-gpu-blocklist \
  --window-size="${4:-1280,720}" --virtual-time-budget=9000 --screenshot="$OUT" "file://$PAGE?shot=$2" >/dev/null 2>&1
[ -s "$OUT" ] && echo "$OUT" || { echo "render failed for $2" >&2; exit 4; }
