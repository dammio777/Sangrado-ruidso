# Música original + efectos para el video "Bienvenido a Casa Amiga" (síntesis procedimental, libre de derechos)
# Uso: python3 music.py salida.wav
import sys
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve

SR = 44100
DUR = 48.5
N = int(SR * DUR)
BPM = 100
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


# --- arreglo
mus = np.zeros(N); drums = np.zeros(N); sfx = np.zeros(N)
# progresión cálida: Dmaj9 – Bm9 – Gmaj7 – A6/9 (una por compás de 4 tiempos)
chords = [[50, 57, 61, 64, 66], [47, 54, 57, 61, 62], [43, 50, 54, 57, 59], [45, 52, 57, 59, 61]]
roots = [38, 35, 31, 33]
BAR = 4 * BEAT
nb = int(DUR / BAR) + 1
for b in range(nb):
    t0 = b * BAR
    ch = chords[b % 4]
    # acorde con leve "strum"
    for j, m in enumerate(ch):
        add(mus, rhodes(midi(m), BAR + .8, .22) * (1 if t0 >= 1.2 else .7), t0 + j * .018)
    # re-ataque sincopado
    for j, m in enumerate(ch[1:]):
        add(mus, rhodes(midi(m + 12), 1.2, .07), t0 + 2.5 * BEAT + j * .02)
    # melodía simple de campanitas en la segunda mitad
    if t0 >= 11.5 and t0 < 38.5:
        mel = [ch[-1] + 12, ch[-2] + 12, ch[-1] + 12 + 2]
        for k, m in enumerate(mel):
            add(mus, chime(midi(m)) * .05, t0 + (1 + k * 1.5) * BEAT)
    if t0 >= 3.2:
        add(mus, bass(midi(roots[b % 4]), 1.6) * .55, t0)
        add(mus, bass(midi(roots[b % 4]), .8) * .4, t0 + 2.5 * BEAT)
        add(mus, bass(midi(roots[b % 4] + 7), .7) * .3, t0 + 3.5 * BEAT)

# batería desde el logo (3.25s) con pausa en "Y mucho más" (30.0–32.1) y final suave
DROP0, BRK0, BRK1, END = 3.25, 38.5, 40.6, 47.1
beat_t = DROP0
while beat_t < END:
    in_break = BRK0 <= beat_t < BRK1
    bi = int(round((beat_t - DROP0) / BEAT)) % 4
    if not in_break:
        if bi in (0, 2): add(drums, kick() * .9, beat_t)
        if bi == 2 and int((beat_t - DROP0) / BAR) % 2 == 1: add(drums, kick() * .5, beat_t + .75 * BEAT)
        if bi in (1, 3): add(drums, snare() * .14, beat_t)
        for s in range(2):
            sw = .58 if s else 0
            add(drums, shaker() * (.035 if s else .022), beat_t + sw * BEAT)
    beat_t += BEAT

# efectos sincronizados con el video
add(sfx, riser(2.0) * .35, 1.3)            # subida hacia el logo
add(sfx, impact() * .9, 3.3)               # aparición del logo
add(sfx, chime(midi(74)) * .18, 3.4); add(sfx, chime(midi(81)) * .12, 3.55)
add(sfx, whoosh(.8) * .45, 5.6)            # zoom naranja -> video
for i, tt in enumerate([9.55, 9.63, 9.73, 9.79, 9.9]):  # parpadeo de luces
    add(sfx, click() * (.5 if i % 2 == 0 else .25), tt)
add(sfx, impact() * .35, 9.9)
add(sfx, whoosh(.7) * .35, 11.4)           # entrada carrusel
for k in range(6):                          # cada tarjeta
    add(sfx, whoosh(.45, False) * .18, 11.6 + .7 + k * 1.18 + .62 * 1.18 - .1)
add(sfx, whoosh(.8) * .4, 19.1)            # bento
for i in range(7): add(sfx, tick() * .35, 19.45 + .25 + i * .11)
add(sfx, whoosh(.8) * .4, 24.2)            # macetas 3D
for k,tt in enumerate((25.3,25.55,25.8)): add(sfx, chime(midi(86+k*2)) * .12, tt)
add(sfx, whoosh(.5) * .3, 25.1)
add(sfx, whoosh(.8) * .4, 28.6)            # camisetas
for k,tt in enumerate((29.9,30.15,30.4,30.65)): add(sfx, tick() * .5, tt)
add(sfx, chime(midi(88)) * .1, 30.0)
add(sfx, whoosh(.7) * .4, 32.7)            # video experiencia
for cc in (34.85, 36.6): add(sfx, whoosh(.45) * .3, cc - .2)
for i in range(9): add(sfx, whoosh(.25, False) * .25, 38.55 + i * .17)  # pila de fotos
add(sfx, riser(1.2) * .25, 39.5)
add(sfx, impact() * .7, 40.65)             # CTA
n_chars = 28
for i in range(n_chars):                    # tecleo URL
    add(sfx, tick() * .1, 40.6 + 1.7 + i * (1.2 / n_chars))
add(sfx, click() * .7, 44.1)                # toque en el enlace
add(sfx, chime(midi(86)) * .2, 44.15); add(sfx, chime(midi(90)) * .14, 44.3)

# reverb sencilla para la parte musical
ir_n = int(1.8 * SR); ir = rng.normal(0, 1, ir_n) * np.exp(-np.arange(ir_n) / SR / .45); ir = lp(ir, 5000)
ir /= np.sqrt((ir ** 2).sum())
mus = lp(mus, 5200)
wet = fftconvolve(mus, ir)[:N]
music = mus * .8 + wet * .35
vinyl = hp(rng.normal(0, 1, N), 2000) * .0015 + (rng.random(N) > .99985) * rng.normal(0, .08, N)
mix = music * 1.5 + lp(drums, 9000) * .75 + sfx * .6 + lp(vinyl, 8000)
# fades
fi = np.clip(t_all / 1.2, 0, 1); fo = np.clip((DUR - t_all) / 2.2, 0, 1)
mix *= fi * fo
# compresión suave + normalización
mix = np.tanh(mix / (np.abs(mix).max() + 1e-9) * 1.6) / np.tanh(1.6)
mix = mix / np.abs(mix).max() * .89
st = np.stack([mix, np.roll(mix, int(.012 * SR)) * .97 + mix * .03], 1)  # ensanche estéreo
import wave
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((st * 32767).astype('<i2').tobytes())
print('ok', sys.argv[1])
