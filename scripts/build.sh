#!/bin/sh
# Assemble one publishable HTML file from the engine and your scene files.
# usage: build.sh <out.html> "<Talk Title>" <scenes1.js> [scenes2.js ...]
# Also writes <out>.local.html (same page wrapped in a document skeleton) for local testing with shot.sh.
set -e
E="$(cd "$(dirname "$0")/../assets/engine" && pwd)"
OUT="$1"; TITLE="$2"; shift 2
[ -n "$OUT" ] && [ -n "$TITLE" ] && [ $# -ge 1 ] || { echo 'usage: build.sh <out.html> "<Talk Title>" <scenes.js>...' >&2; exit 2; }
mkdir -p "$(dirname "$OUT")"
{ python3 -I -c 'import sys;print(open(sys.argv[1]).read().replace("{{TITLE}}",sys.argv[2]),end="")' "$E/head.html" "$TITLE"
  printf '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>\n<script>\n'
  cat "$E/kit.js" "$E/env.js" "$@"
  printf '</script>\n<script>\n'; cat "$E/engine.js"; printf '</script>\n'; } > "$OUT"
LOCAL="${OUT%.html}.local.html"
{ printf '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0}[hidden]{display:none!important}</style></head><body>'; cat "$OUT"; } > "$LOCAL"
for f in "$@"; do node --check "$f" 2>/dev/null || echo "note: node --check failed or node missing for $f" >&2; done
echo "built $OUT ($(wc -c < "$OUT" | tr -d ' ') bytes) and $LOCAL"
