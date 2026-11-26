#!/usr/bin/env bash
# H2 «Mándale esto al que siempre dice que no tiene hambre» (Gavilán). Parte de los 3 tramos ya escalados con IA
# (out/sr_A.mp4, sr_B.mp4, sr_C.mp4; ver el README) y arma el video base: cortes en el compás (128,2 BPM), color natural
# más cálido y un cierre de 1,2 s con un lento acercamiento al plato terminado.
set -euo pipefail; cd "$(dirname "$0")/.."
BPM=128.2; BAR=$(python3 -c "print(240/$BPM)")       # 1,872 s
GRADE="eq=gamma=1.3:contrast=1.08:saturation=1.2:brightness=0.01,colorbalance=rs=.02:rm=.05:rh=.02:bs=-.02:bm=-.06:bh=-.03,unsharp=5:5:0.5:5:5:0,vignette=PI/6"
ffmpeg -nostdin -v error -y -i out/sr_C.mp4 -t "$(python3 -c "print(1*$BAR)")" -vf "$GRADE" -c:v libx264 -crf 12 -preset slow -pix_fmt yuv420p -r 30 out/h2_C.mp4
ffmpeg -nostdin -v error -y -sseof -0.05 -i out/h2_C.mp4 -frames:v 1 out/h2_last.png
ffmpeg -nostdin -v error -y -loop 1 -framerate 30 -t 1.2 -i out/h2_last.png -vf "zoompan=z='1+0.0016*on':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1080x1920:fps=30,format=yuv420p" -c:v libx264 -crf 12 -preset slow -r 30 out/h2_hold.mp4
for s in A B; do ffmpeg -nostdin -v error -y -i out/sr_$s.mp4 -t "$(python3 -c "print(2*$BAR)")" -vf "$GRADE" -c:v libx264 -crf 12 -preset slow -pix_fmt yuv420p -r 30 out/h2_$s.mp4; done
printf "file 'h2_A.mp4'\nfile 'h2_B.mp4'\nfile 'h2_C.mp4'\nfile 'h2_hold.mp4'\n" > out/h2_list.txt
ffmpeg -nostdin -v error -y -f concat -safe 0 -i out/h2_list.txt -c:v libx264 -crf 12 -preset slow -pix_fmt yuv420p -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv -r 30 -an out/base_gavilan.mp4
ffprobe -v error -show_entries format=duration -of csv=p=0 out/base_gavilan.mp4
