#!/bin/sh
# Render a scene in motion as a GIF: sweeps every beat from start to finish while time runs.
# usage: gif.sh <page.local.html> <sceneId> <beats> <out.gif> [framesPerBeat=10] [width,height=640,360]
# Frames render in parallel on a software renderer; allow a few seconds per frame.
HERE="$(cd "$(dirname "$0")" && pwd)"; PAGE="$1"; ID="$2"; NB="$3"; OUT="$4"; FPB="${5:-10}"; SIZE="${6:-640,360}"
[ -n "$OUT" ] || { echo 'usage: gif.sh <page.local.html> <sceneId> <beats> <out.gif> [framesPerBeat] [w,h]' >&2; exit 2; }
D="$(mktemp -d)"; mkdir -p "$(dirname "$OUT")"
awk -v id="$ID" -v nb="$NB" -v fpb="$FPB" -v d="$D" 'BEGIN{ n=0; for(b=0;b<nb;b++) for(k=(b?1:0);k<=fpb;k++){ printf "%s:%d:%.2f:%.3f %s/f%03d.png\n", id, b, 9+n*0.12, k/fpb, d, n; n++ } }' > "$D/list"
xargs -P 4 -L 1 sh -c '"$0/shot.sh" "$1" "$3" "$4" "$2" >/dev/null' "$HERE" "$PAGE" "$SIZE" < "$D/list"
ffmpeg -loglevel error -y -framerate 10 -i "$D/f%03d.png" -vf "tpad=stop_mode=clone:stop_duration=1.4,split[a][b];[a]palettegen=max_colors=160[p];[b][p]paletteuse=dither=bayer:bayer_scale=4" -loop 0 "$OUT" && echo "$OUT ($(wc -c < "$OUT" | tr -d ' ') bytes, $(wc -l < "$D/list" | tr -d ' ') frames)"
rm -rf "$D"
