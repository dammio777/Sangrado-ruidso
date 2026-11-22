"""Análisis objetivo de una mezcla (para revisarla sin poder escucharla).
Uso: python analyze.py pista.wav bpm bar0 [salida_espectrograma.png]
"""
import sys, wave, subprocess
import numpy as np
from PIL import Image

path, bpm, bar0 = sys.argv[1], float(sys.argv[2]), float(sys.argv[3])
w = wave.open(path); sr = w.getframerate()
x = np.frombuffer(w.readframes(w.getnframes()), '<i2').reshape(-1, 2).astype(float) / 32768
L, R = x[:, 0], x[:, 1]; M = (L + R) / 2; S = (L - R) / 2
beat = 60 / bpm; bar = 4 * beat
names = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']

def bands(sig):
    X = np.abs(np.fft.rfft(sig * np.hanning(len(sig)))) ** 2; f = np.fft.rfftfreq(len(sig), 1 / sr)
    edges = [31, 63, 125, 250, 500, 1000, 2000, 4000, 8000, 16000]
    return [10 * np.log10(X[(f >= a) & (f < b)].sum() + 1e-12) for a, b in zip(edges, edges[1:])]

# 1) balance tonal (octavas), relativo a la banda más fuerte, vs. referencia lo-fi/jazz pulida (~-2.5 dB/oct desde 125 Hz)
E = bands(M); ref = max(E)
target = [-6, -1, 0, -2.5, -5, -7.5, -10, -13.5, -18]
print('BALANCE (dB rel.)  31  63 125 250 500  1k  2k  4k  8k')
print('  mezcla        ', ' '.join(f'{e - ref:4.0f}' for e in E))
print('  referencia    ', ' '.join(f'{t:4.0f}' for t in target))
# 2) volumen por compás
print('VOLUMEN por compás (dBFS RMS):')
k = -1; row = []
while bar0 + k * bar < len(M) / sr:
    a, b = int(max(0, bar0 + k * bar) * sr), int(min(len(M) / sr, bar0 + (k + 1) * bar) * sr)
    if b > a: row.append(f'{k}:{20 * np.log10(np.sqrt(np.mean(M[a:b] ** 2)) + 1e-9):.0f}')
    k += 1
print('  ' + '  '.join(row))
# 3) notas dominantes por compás (cromagrama 80 Hz – 2 kHz)
print('NOTAS dominantes por compás:')
k = 0
while bar0 + (k + 1) * bar <= len(M) / sr + 0.01:
    a = int((bar0 + k * bar + 0.05) * sr); seg = M[a:a + int(bar * 0.45 * sr)]
    X = np.abs(np.fft.rfft(seg * np.hanning(len(seg)))); f = np.fft.rfftfreq(len(seg), 1 / sr)
    m = (f > 80) & (f < 2000); pc = np.round(69 + 12 * np.log2(f[m] / 440)).astype(int) % 12
    ch = np.bincount(pc, weights=X[m] ** 2, minlength=12); top = np.argsort(ch)[::-1][:5]
    print(f'  compás {k}: ' + ' '.join(names[i] for i in top)); k += 1
# 4) clics: energía > 12 kHz por ventanas de 2 ms comparada con su entorno
hp = np.fft.irfft(np.fft.rfft(M) * (np.fft.rfftfreq(len(M), 1 / sr) > 12000), len(M))
b = int(0.002 * sr); nb = len(hp) // b
e = 10 * np.log10(np.mean(hp[:nb * b].reshape(nb, b) ** 2, axis=1) + 1e-14)
med = np.array([np.median(e[max(0, i - 50):i + 50]) for i in range(0, nb, 1)])
clicks = np.where((e - med > 24) & (e > -66))[0]   # solo si además es audible (> -66 dBFS en >12 kHz)
print(f'CLICS audibles (>24 dB sobre el entorno y > -66 dBFS en >12 kHz): {len(clicks)}', ['%.2fs %.0fdB' % (c * b / sr, e[c]) for c in clicks[:8]], ' · máx. energía >12 kHz %.0f dBFS' % e.max())
# 5) estéreo y graves en mono
corr = np.corrcoef(L, R)[0, 1]
lowL = np.fft.irfft(np.fft.rfft(L) * (np.fft.rfftfreq(len(L), 1 / sr) < 150), len(L))
lowR = np.fft.irfft(np.fft.rfft(R) * (np.fft.rfftfreq(len(R), 1 / sr) < 150), len(R))
print(f'ESTÉREO: correlación L/R {corr:.2f} · graves <150 Hz {np.corrcoef(lowL, lowR)[0, 1]:.2f} · ancho S/M {20 * np.log10(np.std(S) / np.std(M)):.1f} dB')
print(f'PICO {20 * np.log10(np.abs(x).max()):.1f} dBFS · factor de cresta {20 * np.log10(np.abs(M).max() / np.std(M)):.1f} dB · DC {M.mean():.5f}')
r = subprocess.run(['ffmpeg', '-nostdin', '-i', path, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
lines = [l.strip() for l in r.splitlines() if l.strip().startswith(('I:', 'LRA:', 'Peak:'))]
print('LOUDNESS', ' · '.join(lines[-3:]))
# 6) espectrograma (eje log 40 Hz – 16 kHz)
if len(sys.argv) > 4:
    n = 4096; hopn = 1024
    fr = np.lib.stride_tricks.sliding_window_view(M, n)[::hopn] * np.hanning(n)
    Sx = 20 * np.log10(np.abs(np.fft.rfft(fr, axis=1)) + 1e-7).T
    f = np.fft.rfftfreq(n, 1 / sr); ys = np.geomspace(40, 16000, 360); idx = np.searchsorted(f, ys)
    img = Sx[idx][::-1]; img = np.clip((img - img.max() + 90) / 90, 0, 1)
    rgb = (np.stack([img ** 0.8, img ** 1.3, img ** 2.2], -1) * 255).astype(np.uint8)
    im = Image.fromarray(rgb).resize((1600, 360))
    # marcas de compás
    from PIL import ImageDraw
    d = ImageDraw.Draw(im); T = len(M) / sr
    k = 0
    while bar0 + k * bar < T:
        xx = int((bar0 + k * bar) / T * 1600); d.line([(xx, 0), (xx, 360)], fill=(80, 160, 255), width=1); k += 1
    im.save(sys.argv[4])
