# Jazz vintage relajado original + efectos para "Marcas originales de Casa Amiga" (síntesis procedimental, libre de derechos)
# Uso: python3 music_marcas_jazz.py salida.wav
import sys
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve

SR = 44100
DUR = 39.83
N = int(SR * DUR)
BPM = 72
BEAT = 60 / BPM
rng = np.random.default_rng(7)
t_all = np.arange(N) / SR


def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def bp(x, a, b, o=2): return sosfilt(butter(o, [a, b], 'band', fs=SR, output='sos'), x)
def midi(m): return 440 * 2 ** ((m - 69) / 12)


def add(buf, sig, at):
    i = int(at * SR)
    if i >= len(buf): return
    sig = sig[:len(buf) - i]
    buf[i:i + len(sig)] += sig


def env(n, a, d):  # ataque lineal + caída exponencial
    t = np.arange(n) / SR
    e = np.minimum(t / max(a, 1e-4), 1) * np.exp(-t / d)
    return e


# --- instrumentos
def rhodes(f, dur, vel=1.0):
    n = int(dur * SR); t = np.arange(n) / SR
    s = (np.sin(2 * np.pi * f * t) + .45 * np.sin(2 * np.pi * 2.001 * f * t) * np.exp(-t / .5)
         + .18 * np.sin(2 * np.pi * 3.0 * f * t) * np.exp(-t / .25) + .08 * np.sin(2 * np.pi * 7.0 * f * t) * np.exp(-t / .06))
    s *= env(n, .005, 1.6) * (1 + .12 * np.sin(2 * np.pi * 4.2 * t))
    return s * vel


def bass(f, dur):
    n = int(dur * SR); t = np.arange(n) / SR
    s = np.sin(2 * np.pi * f * t) + .3 * np.sin(2 * np.pi * 2 * f * t)
    return lp(s * env(n, .01, .55), 400)


def kick():
    n = int(.45 * SR); t = np.arange(n) / SR
    f = 45 + 85 * np.exp(-t / .045)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t / .16) * 1.0 + .2 * lp(rng.normal(0, 1, n), 2000) * np.exp(-t / .006)


def snare():
    n = int(.35 * SR); t = np.arange(n) / SR
    nz = bp(rng.normal(0, 1, n), 900, 6000) * np.exp(-t / .07)
    tone = np.sin(2 * np.pi * 190 * t) * np.exp(-t / .05)
    return .5 * nz + .25 * tone


def shaker():
    n = int(.09 * SR); t = np.arange(n) / SR
    return hp(rng.normal(0, 1, n), 6000) * env(n, .008, .025)


def whoosh(dur=.7, up=True):
    n = int(dur * SR); t = np.arange(n) / SR
    nz = rng.normal(0, 1, n)
    # barrido de filtro
    out = np.zeros(n); seg = 512
    for i in range(0, n, seg):
        x = i / n; fc = 300 + (6000 if up else 3000) * (x if up else 1 - x) ** 1.5
        out[i:i + seg] = bp(nz[i:i + seg], max(fc * .6, 60), min(fc * 1.4 + 100, 18000), 1)
    shape = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 2
    return out * shape


def riser(dur):
    n = int(dur * SR); t = np.arange(n) / SR
    x = t / dur
    nz = whoosh(dur, True) * x ** 2
    tone = np.sin(2 * np.pi * np.cumsum(200 + 600 * x ** 2) / SR) * .15 * x ** 2
    return nz + tone


def impact():
    n = int(1.6 * SR); t = np.arange(n) / SR
    boom = np.sin(2 * np.pi * np.cumsum(38 + 60 * np.exp(-t / .08)) / SR) * np.exp(-t / .5)
    return boom + .3 * lp(rng.normal(0, 1, n), 1500) * np.exp(-t / .12)


def click():
    n = int(.05 * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * 1800 * t) + .5 * hp(rng.normal(0, 1, n), 3000)) * np.exp(-t / .008)


def tick():
    n = int(.03 * SR); t = np.arange(n) / SR
    return bp(rng.normal(0, 1, n), 2500, 8000) * np.exp(-t / .004)


def chime(f):
    n = int(2.5 * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * t) + .3 * np.sin(2 * np.pi * 2.76 * f * t) * np.exp(-t / .3)) * env(n, .002, .9)



K = 1.35  # el video corre a 1.35x más lento que su línea de tiempo base
SW = 2 / 3  # swing


def upright(f, dur=.9):
    n = int(dur * SR); t = np.arange(n) / SR
    fr = f * (1 + .012 * np.exp(-t / .03))
    ph = 2 * np.pi * np.cumsum(fr) / SR
    s = np.sin(ph) + .35 * np.sin(2 * ph) + .12 * np.sin(3 * ph)
    thump = lp(rng.normal(0, 1, n), 300) * np.exp(-t / .015) * .3
    return lp(s * env(n, .006, .45) + thump, 900)


def vibes(f, dur=1.6):
    n = int(dur * SR); t = np.arange(n) / SR
    s = np.sin(2 * np.pi * f * t) + .25 * np.sin(2 * np.pi * 4 * f * t) * np.exp(-t / .12)
    return s * env(n, .003, .9) * (1 + .22 * np.sin(2 * np.pi * 5.2 * t))


def ride(v=1.0):
    n = int(.9 * SR); t = np.arange(n) / SR
    nz = bp(rng.normal(0, 1, n), 4500, 11000)
    metal = sum(np.sin(2 * np.pi * f * t) for f in (3150, 4270, 5530, 6810)) * .015
    return (nz * .5 + metal) * env(n, .001, .32) * v


def brush(v=1.0):
    n = int(.25 * SR); t = np.arange(n) / SR
    return bp(rng.normal(0, 1, n), 1500, 7000) * env(n, .012, .07) * v


def chick():
    n = int(.06 * SR); t = np.arange(n) / SR
    return hp(rng.normal(0, 1, n), 4000) * np.exp(-t / .012)


mus = np.zeros(N); drums = np.zeros(N); sfx = np.zeros(N); lead = np.zeros(N)
BAR = 4 * BEAT
# progresión jazz en Fa: Gm9 C13 Fmaj9 Dm9 | Bbmaj9 Bbm6 Am7 D7b9
V = [[58, 62, 65, 69], [58, 64, 69, 74], [57, 60, 64, 67], [53, 57, 60, 64],
     [57, 60, 62, 65], [58, 61, 65, 67], [55, 60, 64, 67], [60, 63, 66, 69]]
R = [43, 36, 41, 38, 34, 34, 33, 38]
THIRD = [3, 4, 4, 3, 4, 3, 3, 4]
nb = int(np.ceil(DUR / BAR))
for b in range(nb):
    t0 = b * BAR
    last = b >= nb - 2
    i = 2 if last else b % 8
    nxt = 2 if b + 1 >= nb - 2 else (b + 1) % 8
    vo = V[i]
    # piano eléctrico: ritmo "Charleston" suave
    if last:
        for j, m in enumerate(vo + [72]):
            add(mus, rhodes(midi(m), 5.0, .2), t0 + j * .05)
    else:
        for j, m in enumerate(vo):
            add(mus, rhodes(midi(m), BAR * .6, .17), t0 + j * .012)
        for j, m in enumerate(vo):
            add(mus, rhodes(midi(m), BAR * .5, .1), t0 + (1 + SW) * BEAT + j * .012)
    # contrabajo caminando
    r = R[i]; nr = R[nxt]
    if t0 >= .1:
        if last:
            add(mus, upright(midi(r), 3.0) * .9, t0)
        else:
            app = nr + (1 if nr < r + 7 else -1)
            walk = [r, r + THIRD[i], r + 7, app]
            for k, m in enumerate(walk):
                add(mus, upright(midi(m)) * (.85 if k == 0 else .7), t0 + k * BEAT)
    # vibráfono: frases cortas desde el compás 2
    if 1 <= b < nb - 2:
        top = sorted(vo)
        pats = [[(0, 3), (1 + SW, 2), (3, 1)], [(.0 + SW, 2), (1, 3), (2 + SW, 3), (3.5, 2)], [(0, 1), (2, 2), (2 + SW, 3)], [(1, 3), (1 + SW, 2), (3, 0)]]
        for (bt, idx) in pats[b % 4]:
            add(lead, vibes(midi(top[idx] + 12), 1.4) * .11, t0 + bt * BEAT)
    if last and b == nb - 1:
        add(lead, vibes(midi(77), 3.0) * .12, t0 + .4); add(lead, vibes(midi(81), 3.0) * .08, t0 + .9)

# escobillas: ride con swing, chick en 2 y 4, golpes suaves
beat_t = BEAT * 4 * 1  # entra en el compás 2
endd = (nb - 2) * BAR
while beat_t < endd:
    bi = int(round(beat_t / BEAT)) % 4
    add(drums, ride(.55 if bi in (0, 2) else .45), beat_t)
    if bi in (1, 3):
        add(drums, ride(.3), beat_t + SW * BEAT)
        add(drums, chick() * .25, beat_t)
        add(drums, brush(.35), beat_t)
    beat_t += BEAT
add(drums, ride(.5), endd)

# efectos sincronizados (línea base x K), más suaves para el ambiente jazz
def S(t): return t * K
add(sfx, chime(midi(74)) * .14, S(0.2)); add(sfx, chime(midi(81)) * .1, S(0.35))
for i,tt in enumerate((.5,.66,.82)): add(sfx, whoosh(.55) * .12, S(tt))
for i,tt in enumerate((1.9,2.1,2.3)): add(sfx, chime(midi(86+i*2)) * .08, S(tt))
add(sfx, whoosh(1.0) * .25, S(3.2))
for k,tt in enumerate((4.6,4.85,5.1)): add(sfx, chime(midi(86+k*2)) * .07, S(tt))
add(sfx, whoosh(1.0) * .25, S(7.7))
for k,tt in enumerate((9.0,9.15,9.3,9.45)): add(sfx, tick() * .3, S(tt))
add(sfx, whoosh(1.0) * .25, S(12.2))
for k,tt in enumerate((13.6,13.85,14.1)): add(sfx, chime(midi(84+k*3)) * .07, S(tt))
add(sfx, whoosh(1.0) * .25, S(16.7))
for k,tt in enumerate((18.7,18.95,19.2)): add(sfx, chime(midi(83+k*4)) * .07, S(tt))
add(sfx, whoosh(1.0) * .25, S(21.2))
for i in range(28): add(sfx, tick() * .07, S(21.5 + 1.7 + i * (1.2 / 28)))
add(sfx, click() * .5, S(25.0))
add(sfx, chime(midi(86)) * .14, S(25.05)); add(sfx, chime(midi(90)) * .1, S(25.2))

# mezcla
ir_n = int(2.2 * SR); ir = rng.normal(0, 1, ir_n) * np.exp(-np.arange(ir_n) / SR / .55); ir = lp(ir, 4500)
ir /= np.sqrt((ir ** 2).sum())
mus = lp(mus, 4800); lead = lp(lead, 6000)
dry = mus + lead
wet = fftconvolve(dry, ir)[:N]
music = dry * .8 + wet * .42
dr = lp(drums, 10000); dr = dr * .8 + fftconvolve(dr, ir)[:N] * .2
vinyl = lp(hp(rng.normal(0, 1, N), 800), 5000) * .004 + lp((rng.random(N) > .99955) * rng.normal(0, .35, N), 3500) + lp((rng.random(N) > .99997) * rng.normal(0, 1.2, N), 2500)
def warp(x):  # ondulación de cinta (wow & flutter)
    tt = t_all + .0024 * np.sin(2 * np.pi * .5 * t_all) + .0004 * np.sin(2 * np.pi * 6.1 * t_all)
    return np.interp(tt * SR, np.arange(len(x)), x)
mix = bp(warp(music) * 1.4 + dr * .2, 110, 4200, 2) + bp(sfx, 150, 6000, 1) * .45 + vinyl
fi = np.clip(t_all / 1.5, 0, 1); fo = np.clip((DUR - t_all) / 2.8, 0, 1)
mix *= fi * fo
mix = np.tanh(mix / (np.abs(mix).max() + 1e-9) * 2.0) / np.tanh(2.0)
mix = mix / np.abs(mix).max() * .89
st = np.stack([mix, np.roll(mix, int(.005 * SR)) * .5 + mix * .5], 1)
import wave
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((st * 32767).astype('<i2').tobytes())
print('ok', sys.argv[1])
