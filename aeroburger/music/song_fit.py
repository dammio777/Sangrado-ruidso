"""Pone una canción real debajo de un video ya montado, alineando el pulso de la canción con los cortes del video.

El video se conserva intacto: es el AUDIO el que se estira (rubberband, mantiene el tono) para que el compás de la
canción dure lo mismo que el compás del video, y el arranque se elige para que un primer tiempo de la canción caiga
justo en el primer corte del video (`bar0`).

Uso:
  python song_fit.py video.mp4 salida.mp4 cancion.mp3 BPM_VIDEO BAR0_S [--desde SEG] [--fade-out SEG] [--sin-estirar]
    BPM_VIDEO : tempo de la rejilla del video (el de la música cozy original con que se montó)
    BAR0_S    : segundo del video donde cae el primer corte / primer tiempo fuerte
    --desde   : zona de la canción (s, tiempo original) a partir de la cual buscar el primer tiempo fuerte (por defecto el mejor tramo)
    --sin-estirar : no estirar el audio (para videos sin rejilla, p. ej. enganches de 1 toma)
"""
import sys, subprocess, json, os, argparse, numpy as np

SR = 22050; HOP = 512; N = 2048
FPS = SR / HOP

def load_mono(path):
    raw = subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-i', path, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
    return np.frombuffer(raw, np.float32)

def analyze(path):
    cache = path + '.beat.json'
    if os.path.exists(cache): return json.load(open(cache))
    x = load_mono(path); win = np.hanning(N); nfr = (len(x) - N) // HOP
    S = np.abs(np.fft.rfft(np.lib.stride_tricks.sliding_window_view(x, N)[::HOP][:nfr] * win, axis=1)); f = np.fft.rfftfreq(N, 1 / SR)
    def flux(lo, hi):
        L = np.log1p(30 * S[:, (f > lo) & (f < hi)]); fl = np.r_[0, np.maximum(0, np.diff(L, axis=0)).sum(1)]
        fl = fl - np.convolve(fl, np.ones(43) / 43, 'same'); return np.maximum(fl, 0)
    fl, low = flux(40, 5000), flux(40, 180)
    def comb(bpm, ph, env):
        per = FPS * 60 / bpm; idx = (ph + np.arange(0, (len(env) - ph) / per) * per).astype(int); return env[idx[idx < len(env)]].mean()
    best = (0, 0, 0)
    for bpm in np.arange(70, 190, 0.1):
        per = FPS * 60 / bpm
        for ph in np.linspace(0, per, 12, endpoint=False):
            s = comb(bpm, ph, fl)
            if s > best[0]: best = (s, bpm, ph)
    _, bpm, ph = best; per = FPS * 60 / bpm
    phs = np.linspace(0, per, 200, endpoint=False); ph = phs[np.argmax([comb(bpm, p, fl) for p in phs])]
    # primer tiempo fuerte: de los 4 pulsos del compás, el que lleva más energía de bombo/bajo
    beats = (ph + np.arange(0, (len(low) - ph) / per) * per).astype(int); beats = beats[beats < len(low)]
    grp = [low[beats[k::4]].mean() for k in range(4)]; down = int(np.argmax(grp))
    step = int(2 * SR); rms = [float(20 * np.log10(np.sqrt(np.mean(x[i:i + step] ** 2)) + 1e-9)) for i in range(0, len(x) - step, step)]
    d = dict(bpm=float(bpm), phase=float(ph / FPS), down=down, dur=len(x) / SR, rms2s=rms, grp=[float(g) for g in grp])
    json.dump(d, open(cache, 'w')); return d

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('video'); ap.add_argument('out'); ap.add_argument('song')
    ap.add_argument('bpm_video', type=float); ap.add_argument('bar0', type=float)
    ap.add_argument('--desde', type=float, default=None); ap.add_argument('--fade-out', type=float, default=1.6)
    ap.add_argument('--sin-estirar', action='store_true'); ap.add_argument('--aire', type=float, default=0.25, help='fundido de entrada')
    a = ap.parse_args()
    d = analyze(a.song); vdur = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', a.video]))
    tempo = 1.0 if a.sin_estirar else a.bpm_video / d['bpm']            # factor de velocidad del audio (<1 = más lento)
    beat = 60 / d['bpm']; bar = 4 * beat
    # tiempos fuertes (compás) de la canción en tiempo original
    first = d['phase'] + d['down'] * beat
    need = vdur * tempo + 0.3                                          # segundos de canción que hacen falta
    # zona: si no se indica, el tramo de mayor volumen medio (con margen para el principio y el final)
    if a.desde is None:
        win = int(need / 2) + 1; r = np.array(d['rms2s']); best, lo = -99, 0
        for i in range(8, max(9, len(r) - win - 8)):
            s = r[i:i + win].mean()
            if s > best: best, lo = s, i * 2.0
        want = lo
    else: want = a.desde
    k = max(0, int(round((want + a.bar0 * tempo - first) / bar)))
    down_t = first + k * bar
    a_start = max(0.0, down_t - a.bar0 * tempo)
    if a_start + need > d['dur']: a_start = max(0.0, d['dur'] - need)
    stretch = [f'rubberband=tempo={tempo:.5f}:pitch=1:transients=crisp:formant=preserved'] if abs(tempo - 1) > 1e-3 else []
    fades = [f'afade=t=in:st=0:d={a.aire}', f'afade=t=out:st={vdur - a.fade_out:.3f}:d={a.fade_out}']
    tmp = a.out + '.tmp.wav'
    subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-ss', f'{a_start:.3f}', '-t', f'{need + 0.5:.3f}', '-i', a.song,
                    '-af', ','.join(stretch) or 'anull', '-ar', '48000', '-ac', '2', tmp + '.raw.wav'], check=True)
    # los fundidos se aplican después de estirar (en tiempo del video)
    subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', tmp + '.raw.wav', '-t', f'{vdur:.3f}', '-af', ','.join(fades), tmp], check=True)
    loud = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'common', 'loudnorm.sh'); norm = a.out + '.norm.wav'
    subprocess.run(['bash', loud, tmp, norm], check=True)
    subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', a.video, '-i', norm, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k',
                    '-ar', '48000', '-shortest', '-movflags', '+faststart', a.out], check=True)
    for f in (tmp, tmp + '.raw.wav', norm): os.path.exists(f) and os.remove(f)
    print(f'{os.path.basename(a.out)}: {os.path.basename(a.song)} {d["bpm"]:.1f}→{a.bpm_video:.1f} BPM (audio x{tempo:.3f}) · '
          f'canción desde {a_start:.1f} s · primer tiempo fuerte en el video a {a.bar0:.2f} s')

if __name__ == '__main__': main()
