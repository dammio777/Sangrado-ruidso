"""Tempo, fase del pulso y energía por tramos de una canción (sin librosa).
Uso: python tempo.py cancion.mp3
Devuelve BPM (rejilla fina por peine de pulsos sobre la envolvente de novedad espectral), desfase del primer tiempo
y el volumen (RMS dB) cada 4 s para elegir tramos con energía (estribillos)."""
import sys, subprocess, numpy as np
SR = 22050; HOP = 512; N = 2048
raw = subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-i', sys.argv[1], '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
x = np.frombuffer(raw, np.float32)
win = np.hanning(N); nfr = (len(x) - N) // HOP
fr = np.lib.stride_tricks.sliding_window_view(x, N)[::HOP][:nfr] * win
S = np.abs(np.fft.rfft(fr, axis=1)); f = np.fft.rfftfreq(N, 1 / SR)
band = (f > 40) & (f < 5000)
L = np.log1p(30 * S[:, band]); flux = np.maximum(0, np.diff(L, axis=0)).sum(1); flux = np.r_[0, flux]
flux = flux - np.convolve(flux, np.ones(43) / 43, 'same'); flux = np.maximum(flux, 0)
fps = SR / HOP
def comb(bpm, ph, env):
    per = fps * 60 / bpm; idx = (ph + np.arange(0, (len(env) - ph) / per, 1) * per).astype(int); idx = idx[idx < len(env)]
    return env[idx].mean()
best = (0, 0, 0)
for bpm in np.arange(70, 190, 0.1):
    per = fps * 60 / bpm
    for ph in np.linspace(0, per, 12, endpoint=False):
        s = comb(bpm, ph, flux)
        if s > best[0]: best = (s, bpm, ph)
_, bpm, ph = best
# refinar fase
per = fps * 60 / bpm; phs = np.linspace(0, per, 200, endpoint=False); ph = phs[np.argmax([comb(bpm, p, flux) for p in phs])]
print(f'{sys.argv[1]}: duración {len(x)/SR:.1f} s · BPM ≈ {bpm:.1f} (mitad {bpm/2:.1f} / doble {bpm*2:.1f}) · primer pulso en {ph/fps:.3f} s')
step = int(4 * SR); rms = [20 * np.log10(np.sqrt(np.mean(x[i:i + step] ** 2)) + 1e-9) for i in range(0, len(x) - step, step)]
print('RMS dB cada 4 s:', ' '.join(f'{r:.0f}' for r in rms))
