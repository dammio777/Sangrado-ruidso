# Cumbia lenta vintage (acordeón, guacharaca, tambora, congas) para videos de marca (plantilla brand.html, 29 s). Libre de derechos.
# Uso: python3 music_brand_cumbia.py salida.wav [semilla]
import sys, wave
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve, lfilter

SR = 44100; DUR = 29.0; N = int(SR * DUR)
BPM = 92; BEAT = 60 / BPM; BAR = 4 * BEAT
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

def guacharaca(long=True):
    n = int((.16 if long else .07) * SR); t = np.arange(n) / SR
    nz = bp(rng.normal(0, 1, n), 2500, 9000) * (1 + .6 * np.sign(np.sin(2*np.pi*90*t)))
    return nz * (np.minimum(t/.04, 1) * np.exp(-t/.06) if long else np.exp(-t/.02))

def conga(f=210, v=1.0, slap=False):
    n = int(.3 * SR); t = np.arange(n) / SR
    s = np.sin(2*np.pi*np.cumsum(f*(1+.25*np.exp(-t/.02)))/SR) * np.exp(-t/(.06 if slap else .14))
    return (s + (.4*bp(rng.normal(0,1,n),1500,5000)*np.exp(-t/.01) if slap else 0)) * v

def tambora():
    n = int(.4 * SR); t = np.arange(n) / SR
    return np.sin(2*np.pi*np.cumsum(55 + 50*np.exp(-t/.03))/SR) * np.exp(-t/.16)

def acordeon(f, dur, v=1.0):  # lengüetas: onda rica con vibrato, dos voces desafinadas
    n = int(dur * SR); t = np.arange(n) / SR; s = np.zeros(n)
    for dt in (-.0025, .0025):
        ph = 2*np.pi*f*(1+dt)*t + .004*np.sin(2*np.pi*5.5*t)*30
        s += np.sign(np.sin(ph)) * .35 + np.sin(ph) * .5 + .25*np.sin(2*ph)
    a = np.minimum(t/.03, 1) * np.minimum((dur - t)/.05, 1).clip(0, 1)
    return lp(s * a, 2800) * v

# La menor, cumbia lenta: Am – Dm – E7 – Am | Am – G – C – E7
CH = [[57, 60, 64], [57, 62, 65], [56, 59, 64], [57, 60, 64], [57, 60, 64], [55, 59, 62], [55, 60, 64], [56, 59, 62]]
RT = [33, 38, 40, 33, 33, 43, 36, 40]
MEL = [[76, 74, 72, 69], [74, 77, 76, 74], [71, 72, 74, 76], [72, 69, 0, 0], [76, 79, 77, 76], [74, 71, 74, 79], [76, 72, 76, 79], [80, 76, 74, 71]]
nb = int(np.ceil(DUR / BAR))
for b in range(nb):
    t0 = b * BAR; last = b >= nb - 1; i = 0 if last else b % 8
    if last:
        for m in CH[0] + [69]: add(gtr, acordeon(midi(m), 2.6, .18), t0)
        add(bs, bass(midi(33), 2.0) * .9, t0); add(perc, tambora() * .7, t0); continue
    # bajo cumbia: 1 y 3 (tónica - quinta)
    add(bs, bass(midi(RT[i]), .55) * .9, t0); add(bs, bass(midi(RT[i] + 7), .55) * .8, t0 + 2 * BEAT)
    # acordeón en contratiempo (el "chuc" de la cumbia)
    for e in (1, 3, 5, 7):
        for m in CH[i]: add(gtr, acordeon(midi(m), BEAT * .38, .09), t0 + e * BEAT / 2)
    if b >= 1:
        # guacharaca: larga-corta-corta
        for q in range(4):
            add(perc, guacharaca(True) * .07, t0 + q * BEAT); add(perc, guacharaca(False) * .05, t0 + q * BEAT + BEAT / 2); add(perc, guacharaca(False) * .045, t0 + q * BEAT + 3 * BEAT / 4)
        add(perc, tambora() * .55, t0); add(perc, tambora() * .4, t0 + 2 * BEAT)
        add(perc, conga(200, .3), t0 + BEAT); add(perc, conga(280, .25, True), t0 + 1.5 * BEAT); add(perc, conga(200, .3), t0 + 3 * BEAT); add(perc, conga(280, .25, True), t0 + 3.5 * BEAT)
    if 1 <= b < nb - 1:
        for k, m in enumerate(MEL[i]):
            if m: add(lead, acordeon(midi(m), BEAT * .9, .16), t0 + k * BEAT)

# efectos sincronizados con brand.html
add(sfx, whoosh(.9) * .3, 3.0); add(sfx, chime(midi(81)) * .12, 3.9); add(sfx, chime(midi(86)) * .09, 4.1)
add(sfx, whoosh(.9) * .25, 8.8)
add(sfx, whoosh(.7) * .2, 10.0); add(sfx, whoosh(.7) * .2, 11.5)
add(sfx, stamp() * .5, 11.35); add(sfx, stamp() * .5, 12.85)
add(sfx, whoosh(.9) * .25, 15.2); add(sfx, whoosh(.6) * .18, 16.7)
for k in range(3): add(sfx, tick() * .3, 17.2 + k * .3)
add(sfx, chime(midi(79)) * .12, 21.3); add(sfx, chime(midi(84)) * .1, 22.1); add(sfx, chime(midi(88)) * .08, 22.5)
for i in range(27): add(sfx, tick() * .07, 24.2 + i * (1.4 / 27))

ir_n = int(1.8 * SR); ir = rng.normal(0, 1, ir_n) * np.exp(-np.arange(ir_n) / SR / .45); ir = lp(ir, 4500); ir /= np.sqrt((ir ** 2).sum())
music = gtr * 1.0 + bs * .8 + lead
music = music * .85 + fftconvolve(music, ir)[:N] * .3
def warp(x):
    tt = t_all + .002 * np.sin(2 * np.pi * .45 * t_all) + .0003 * np.sin(2 * np.pi * 6 * t_all)
    return np.interp(tt * SR, np.arange(len(x)), x)
vinyl = lp(hp(rng.normal(0, 1, N), 800), 5000) * .003 + lp((rng.random(N) > .99965) * rng.normal(0, .3, N), 3500)
mix = bp(warp(music) + perc * .6, 80, 5000, 2) + bp(sfx, 120, 7000, 1) * .5 + vinyl
mix *= np.clip(t_all / 1.2, 0, 1) * np.clip((DUR - t_all) / 2.5, 0, 1)
mix = np.tanh(mix / (np.abs(mix).max() + 1e-9) * 1.8) / np.tanh(1.8); mix = mix / np.abs(mix).max() * .89
st = np.stack([mix, np.roll(mix, int(.006 * SR)) * .6 + mix * .4], 1)
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype('<i2').tobytes())
print('ok', sys.argv[1])
