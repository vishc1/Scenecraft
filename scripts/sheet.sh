#!/bin/sh
# Tile four stills into one 1920x1080 contact sheet, so four scenes cost one image to look at.
# usage: sheet.sh <out.png> <a.png> <b.png> <c.png> <d.png>
OUT="$1"; shift
ffmpeg -loglevel error -y -i "$1" -i "$2" -i "$3" -i "$4" -filter_complex "[0][1][2][3]xstack=inputs=4:layout=0_0|w0_0|0_h0|w0_h0,scale=1920:1080" "$OUT" && echo "$OUT"
