# Ukelele alegre "de cocina" (ukelele, glockenspiel, chasquidos, madera) para videos de marca (plantilla brand.html, 29 s). Libre de derechos.
# Uso: python3 music_brand_ukelele.py salida.wav [semilla]
import sys, wave, os
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve, lfilter

SR = 44100; DUR = float(os.environ.get('DUR', 29.0)); N = int(SR * DUR)
BPM = 104; BEAT = 60 / BPM; BAR = 4 * BEAT
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

def uke(f, dur=1.0, v=1.0):  # ukelele (Karplus-Strong, más brillante y corto)
    n = int(dur * SR); L = int(SR / f)
    x = np.zeros(n); x[:L] = lp(rng.normal(0, 1, L), 5000)
    a = np.zeros(L + 2); a[0] = 1; a[L] = -.493; a[L + 1] = -.493
    return lp(lfilter([1], a, x), 6000) * env(n, .001, .5) * v

def glock(f, dur=1.6):
    n = int(dur * SR); t = np.arange(n) / SR
    return (np.sin(2*np.pi*f*t) + .4*np.sin(2*np.pi*2.76*f*t)*np.exp(-t/.15) + .2*np.sin(2*np.pi*5.4*f*t)*np.exp(-t/.05)) * env(n, .001, .6)

def snap():
    n = int(.08 * SR); t = np.arange(n) / SR
    return bp(rng.normal(0, 1, n), 1800, 7000) * np.exp(-t / .012)

def wood(v=1.0):  # cuchara de palo / bloque de madera
    n = int(.12 * SR); t = np.arange(n) / SR
    return (np.sin(2*np.pi*820*t) + .5*np.sin(2*np.pi*1390*t)) * np.exp(-t / .025) * v

def kick2():
    n = int(.3 * SR); t = np.arange(n) / SR
    return np.sin(2*np.pi*np.cumsum(50 + 60*np.exp(-t/.03))/SR) * np.exp(-t/.12)

# Do mayor alegre: C – Am – F – G  (voicings de ukelele G-C-E-A)
V = [[67, 60, 64, 72], [69, 60, 64, 69], [69, 60, 65, 69], [67, 62, 67, 71]]
R = [36, 33, 41, 43]
STR = [(0, 'd'), (1, 'd'), (1.5, 'u'), (2.5, 'u'), (3, 'd'), (3.5, 'u')]
MEL = [[76, 79, 81, 79], [76, 72, 74, 76], [77, 76, 72, 69], [71, 74, 79, 74]]
nb = int(np.ceil(DUR / BAR))
for b in range(nb):
    t0 = b * BAR; last = b >= nb - 1; i = 0 if last else b % 4; vo = V[i]
    if last:
        for j, m in enumerate(vo + [76, 79]): add(gtr, uke(midi(m), 3.0, .5), t0 + j * .035)
        add(bs, bass(midi(36), 2.0) * .8, t0); add(lead, glock(midi(84), 2.5) * .12, t0 + .3); continue
    for (bt, d) in STR:
        order = vo if d == 'd' else vo[::-1]
        for j, m in enumerate(order): add(gtr, uke(midi(m), .8, .42 if bt in (0, 3) else .3), t0 + bt * BEAT + j * .011)
    if b >= 1:
        add(bs, bass(midi(R[i])) * .85, t0); add(bs, bass(midi(R[i] + 7)) * .7, t0 + 2 * BEAT)
        add(perc, kick2() * .5, t0); add(perc, kick2() * .4, t0 + 2 * BEAT)
        add(perc, snap() * .3, t0 + BEAT); add(perc, snap() * .3, t0 + 3 * BEAT)
        for s in range(8): add(perc, shaker() * (.03 if s % 2 else .02), t0 + s * BEAT / 2)
        add(perc, wood(.18), t0 + 1.5 * BEAT); add(perc, wood(.14), t0 + 3.5 * BEAT)
    if 2 <= b < nb - 1:
        for k, m in enumerate(MEL[i]): add(lead, glock(midi(m)) * .1, t0 + (k * 1.0 + (.5 if k % 2 else 0)) * BEAT)

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
mix = bp(warp(music) + perc * .55, 70, 7500, 2) + bp(sfx, 120, 7000, 1) * .5 + vinyl
mix *= np.clip(t_all / 1.2, 0, 1) * np.clip((DUR - t_all) / 2.5, 0, 1)
mix = np.tanh(mix / (np.abs(mix).max() + 1e-9) * 1.8) / np.tanh(1.8); mix = mix / np.abs(mix).max() * .89
st = np.stack([mix, np.roll(mix, int(.006 * SR)) * .6 + mix * .4], 1)
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype('<i2').tobytes())
print('ok', sys.argv[1])
