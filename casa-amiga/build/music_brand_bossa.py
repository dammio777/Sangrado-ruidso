# Bossa nova vintage original para videos de marca (plantilla brand.html, 29 s). Libre de derechos.
# Uso: python3 music_brand_bossa.py salida.wav [semilla]
import sys, wave, os
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve, lfilter

SR = 44100; DUR = float(os.environ.get('DUR', 29.0)); N = int(SR * DUR)
BPM = 116; BEAT = 60 / BPM; BAR = 4 * BEAT
rng = np.random.default_rng(int(sys.argv[2]) if len(sys.argv) > 2 else 11)
t_all = np.arange(N) / SR
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def bp(x, a, b, o=2): return sosfilt(butter(o, [a, b], 'band', fs=SR, output='sos'), x)
def midi(m): return 440 * 2 ** ((m - 69) / 12)
def add(buf, sig, at):
    i = int(at * SR)
    if i < 0 or i >= len(buf): return
    sig = sig[:len(buf) - i]; buf[i:i + len(sig)] += sig
def env(n, a, d):
    t = np.arange(n) / SR; return np.minimum(t / max(a, 1e-4), 1) * np.exp(-t / d)

def nylon(f, dur=1.6, bright=.5):  # Karplus-Strong
    n = int(dur * SR); L = int(SR / f)
    x = np.zeros(n); burst = lp(rng.normal(0, 1, L), 1500 + 3000 * bright); x[:L] = burst
    a = np.zeros(L + 2); a[0] = 1; a[L] = -.498; a[L + 1] = -.498
    y = lfilter([1], a, x)
    return lp(y, 3500) * env(n, .002, .9)

def bass(f, dur=.7):
    n = int(dur * SR); t = np.arange(n) / SR
    s = np.sin(2 * np.pi * f * t) + .25 * np.sin(4 * np.pi * f * t)
    return lp(s * env(n, .008, .35), 700)

def rim():
    n = int(.05 * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * 1700 * t) * .6 + bp(rng.normal(0, 1, n), 1500, 5000)) * np.exp(-t / .01)

def shaker():
    n = int(.08 * SR); return hp(rng.normal(0, 1, n), 5000) * env(n, .01, .02)

def vibes(f, dur=1.6):
    n = int(dur * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * t) + .2 * np.sin(8 * np.pi * f * t) * np.exp(-t / .1)) * env(n, .003, .8) * (1 + .2 * np.sin(2 * np.pi * 5 * t))

def whoosh(dur=.8):
    n = int(dur * SR); t = np.arange(n) / SR; nz = rng.normal(0, 1, n); out = np.zeros(n)
    for i in range(0, n, 512):
        fc = 300 + 4000 * (i / n) ** 1.5; out[i:i + 512] = bp(nz[i:i + 512], fc * .6, fc * 1.4 + 100, 1)
    return out * np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 2

def chime(f):
    n = int(2.2 * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * t) + .3 * np.sin(2 * np.pi * 2.76 * f * t) * np.exp(-t / .3)) * env(n, .002, .8)

def stamp():
    n = int(.4 * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * np.cumsum(70 + 80 * np.exp(-t / .02)) / SR) * np.exp(-t / .08) + .4 * lp(rng.normal(0, 1, n), 2500) * np.exp(-t / .02)

def tick():
    n = int(.03 * SR); t = np.arange(n) / SR; return bp(rng.normal(0, 1, n), 2500, 8000) * np.exp(-t / .004)

gtr = np.zeros(N); bs = np.zeros(N); perc = np.zeros(N); lead = np.zeros(N); sfx = np.zeros(N)
# Dm9 – G13 – Cmaj9 – A7(b13)
V = [[53, 57, 60, 64], [53, 59, 64, 69], [52, 55, 59, 62], [55, 61, 65, 67]]
R = [38, 43, 36, 33]
STRUM = [0, 1.5, 3, 4.5, 6]  # en corcheas dentro de un compás de 8
nb = int(np.ceil(DUR / BAR))
for b in range(nb):
    t0 = b * BAR; last = b >= nb - 1; i = 2 if last else b % 4; vo = V[i]; r = R[i]
    if last:
        for j, m in enumerate([r + 12] + vo): add(gtr, nylon(midi(m), 4.0, .4) * .5, t0 + j * .045)
        add(bs, bass(midi(r), 2.5) * .9, t0); continue
    for k, e in enumerate(STRUM):
        at = t0 + e * BEAT / 2
        for j, m in enumerate(vo): add(gtr, nylon(midi(m), 1.0, .35 + .1 * (k % 2)) * (.32 if k else .38), at + j * .012)
    # bajo: tónica en 1, quinta en 3 (con anticipación)
    add(bs, bass(midi(r)) * .9, t0); add(bs, bass(midi(r + 7)) * .8, t0 + 2 * BEAT - BEAT / 2 + BEAT / 2)
    add(bs, bass(midi(r + 7), .4) * .5, t0 + 3.5 * BEAT)
    # percusión suave
    if b >= 1:
        for s in range(16): add(perc, shaker() * (.05 if s % 4 == 0 else .03), t0 + s * BEAT / 4)
        for e in (0, 3, 6): add(perc, rim() * .16, t0 + e * BEAT / 2 + (BAR if False else 0))
    # vibráfono: motivo en compases alternos
    if 2 <= b < nb - 1 and b % 2 == 0:
        mot = sorted(vo)
        for (bt, idx) in [(0, 3), (1, 2), (1.5, 3), (3, 1)]: add(lead, vibes(midi(mot[idx] + 12), 1.4) * .1, t0 + bt * BEAT)

# efectos sincronizados con brand.html
add(sfx, whoosh(.9) * .3, 3.0); add(sfx, chime(midi(81)) * .12, 3.9); add(sfx, chime(midi(86)) * .09, 4.1)
add(sfx, whoosh(.9) * .25, 8.8)
add(sfx, whoosh(.7) * .2, 10.0); add(sfx, whoosh(.7) * .2, 11.5)
add(sfx, stamp() * .5, 11.35); add(sfx, stamp() * .5, 12.85)
add(sfx, whoosh(.9) * .25, 15.2); add(sfx, whoosh(.6) * .18, 16.7)
for k in range(3): add(sfx, tick() * .3, 17.2 + k * .3)
add(sfx, chime(midi(79)) * .12, 21.3); add(sfx, chime(midi(84)) * .1, 22.1); add(sfx, chime(midi(88)) * .08, 22.5)
for i in range(27): add(sfx, tick() * .07, 24.2 + i * (1.4 / 27))

# pista de la próxima marca (escena final, solo si el video dura más de 30 s)
if DUR > 30:
    add(sfx, whoosh(.9) * .12, 26.7)
    for k, tt in enumerate((27.9, 28.15, 28.4)): add(sfx, chime(midi(84 + k * 4)) * .07, tt)
    add(sfx, chime(midi(91)) * .06, 29.4)

ir_n = int(1.8 * SR); ir = rng.normal(0, 1, ir_n) * np.exp(-np.arange(ir_n) / SR / .45); ir = lp(ir, 4500); ir /= np.sqrt((ir ** 2).sum())
music = gtr * 1.0 + bs * .8 + lead
music = music * .85 + fftconvolve(music, ir)[:N] * .3
def warp(x):
    tt = t_all + .002 * np.sin(2 * np.pi * .45 * t_all) + .0003 * np.sin(2 * np.pi * 6 * t_all)
    return np.interp(tt * SR, np.arange(len(x)), x)
vinyl = lp(hp(rng.normal(0, 1, N), 800), 5000) * .003 + lp((rng.random(N) > .99965) * rng.normal(0, .3, N), 3500)
mix = bp(warp(music) + perc * .5, 100, 4500, 2) + bp(sfx, 120, 7000, 1) * .5 + vinyl
mix *= np.clip(t_all / 1.2, 0, 1) * np.clip((DUR - t_all) / 2.5, 0, 1)
mix = np.tanh(mix / (np.abs(mix).max() + 1e-9) * 1.8) / np.tanh(1.8); mix = mix / np.abs(mix).max() * .89
st = np.stack([mix, np.roll(mix, int(.006 * SR)) * .6 + mix * .4], 1)
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype('<i2').tobytes())
print('ok', sys.argv[1])
