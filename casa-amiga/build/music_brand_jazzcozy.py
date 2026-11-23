# Jazz cozy artesanal, moderno y limpio, para videos de marca (29 s). Libre de derechos.
# Uso: python3 music_brand_jazzcozy.py salida.wav [pargo|hizca]
import sys, wave, os
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve, lfilter

SR = 44100; DUR = float(os.environ.get('DUR', 29.0)); N = int(SR * DUR)
VAR = sys.argv[2] if len(sys.argv) > 2 else 'pargo'
BPM = {'pargo': 78, 'hizca': 70, 'arcoiris': 74, 'rhipsalis': 82, 'suculenta': 72}.get(VAR, 74); BEAT = 60 / BPM; BAR = 4 * BEAT
VAR = sys.argv[2] if len(sys.argv) > 2 else 'pargo'
rng = np.random.default_rng({'pargo': 5, 'hizca': 9, 'rhipsalis': 21, 'suculenta': 33}.get(VAR, 13))
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


def rhodes(f, dur, vel=1.0):
    n = int(dur * SR); t = np.arange(n) / SR
    s = (np.sin(2*np.pi*f*t) + .4*np.sin(2*np.pi*2.001*f*t)*np.exp(-t/.5) + .12*np.sin(2*np.pi*3*f*t)*np.exp(-t/.2)
         + .05*np.sin(2*np.pi*7*f*t)*np.exp(-t/.05))
    return s * env(n, .006, 1.8) * (1 + .1*np.sin(2*np.pi*3.8*t)) * vel

def upright(f, dur=.9):
    n = int(dur * SR); t = np.arange(n) / SR
    ph = 2*np.pi*np.cumsum(f*(1 + .01*np.exp(-t/.03)))/SR
    return lp((np.sin(ph) + .3*np.sin(2*ph) + .1*np.sin(3*ph)) * env(n, .008, .5) + lp(rng.normal(0,1,n),300)*np.exp(-t/.015)*.25, 1000)

def brush(v=1.0):
    n = int(.3 * SR); t = np.arange(n) / SR
    return bp(rng.normal(0, 1, n), 1800, 9000) * env(n, .02, .09) * v

def ridebell(v=1.0):
    n = int(.8 * SR); t = np.arange(n) / SR
    return (bp(rng.normal(0,1,n),5000,12000)*.4 + sum(np.sin(2*np.pi*f*t) for f in (3300,4510,5870))*.02) * env(n,.001,.25) * v

mus = np.zeros(N); bs = np.zeros(N); perc = np.zeros(N); lead = np.zeros(N); sfx = np.zeros(N)
SW = 2/3
if VAR == 'pargo':   # Fa mayor cálido: Fmaj9 – Dm9 – Gm9 – C13sus
    V = [[57, 60, 64, 67], [57, 60, 64, 65], [58, 62, 65, 69], [58, 62, 64, 69]]
    R = [41, 38, 43, 36]
    MEL = [[(0,72),(1.5,74),(2.5,76)], [(0+SW,72),(2,69)], [(0,74),(1,77),(2.5,76),(3.5,74)], [(1,72),(2+SW,70)]]
elif VAR == 'arcoiris':  # La menor nocturno: Am9 – Fmaj7#11 – Dm9 – E7(b9)
    V = [[55, 59, 60, 64], [52, 57, 59, 64], [53, 57, 60, 64], [56, 59, 62, 65]]
    R = [33, 41, 38, 40]
    MEL = [[(0,72),(1.5,71),(3,69)], [(1,71),(2+SW,72)], [(0,74),(1.5,72),(3,69)], [(1,68),(2.5,71)]]
elif VAR == 'rhipsalis':  # Mi bemol mayor soñador: Ebmaj9 – Cm11 – Abmaj7#11 – Bb13sus
    V = [[55, 58, 62, 65], [55, 58, 63, 65], [55, 60, 62, 67], [56, 60, 63, 67]]
    R = [39, 36, 44, 34]
    MEL = [[(0,74),(1.5,77),(3,75)], [(0+SW,72),(2,70)], [(0,72),(1,74),(2.5,79)], [(1,77),(2+SW,74)]]
elif VAR == 'suculenta':  # Do mayor luminoso: Cmaj9 – Am9 – Fmaj9 – G13sus
    V = [[52, 55, 59, 62], [52, 55, 60, 64], [52, 55, 57, 60], [53, 57, 60, 64]]
    R = [36, 33, 41, 43]
    MEL = [[(0,76),(1.5,79),(3,74)], [(1,72),(2+SW,76)], [(0,77),(1.5,76),(3,72)], [(1,74),(2.5,79)]]
else:                # Re mayor sereno: Dmaj9 – Bm11 – Gmaj9 – Em9/A
    V = [[54, 57, 61, 64], [54, 57, 61, 64], [54, 57, 59, 62], [55, 59, 62, 66]]
    R = [38, 35, 43, 33]
    MEL = [[(0,73),(2,76)], [(1,74),(2.5,71)], [(0,74),(1.5,78),(3,76)], [(1,73),(2.5,69)]]
nb = int(np.ceil(DUR / BAR))
for b in range(nb):
    t0 = b * BAR; last = b >= nb - 1; i = 0 if last else b % 4; vo = V[i]
    if last:
        for j, m in enumerate(vo + [vo[-1] + 5]): add(mus, rhodes(midi(m), 4.5, .2), t0 + j * .06)
        add(bs, upright(midi(R[0]), 3.0) * .9, t0)
        add(lead, nylon(midi(MEL[0][0][1]), 4.0, .25) * .45, t0 + .5); continue
    # piano: acorde largo + un toque sincopado
    for j, m in enumerate(vo): add(mus, rhodes(midi(m), BAR * .9, .16), t0 + j * .015)
    for j, m in enumerate(vo[1:]): add(mus, rhodes(midi(m + 12), 1.2, .05), t0 + (2 + SW) * BEAT + j * .015)
    # contrabajo: 1, 3 y una nota de paso
    if b >= 1 or VAR == 'hizca':
        nr = R[(b + 1) % 4]
        add(bs, upright(midi(R[i])) * .85, t0); add(bs, upright(midi(R[i] + 7)) * .7, t0 + 2 * BEAT)
        add(bs, upright(midi(nr + (1 if nr < R[i] else -1)), .5) * .5, t0 + 3.5 * BEAT)
    # escobillas muy suaves
    if b >= 1:
        for q in range(4):
            add(perc, ridebell(.35 if q % 2 == 0 else .28), t0 + q * BEAT)
            if q % 2: add(perc, ridebell(.18), t0 + (q + SW) * BEAT); add(perc, brush(.22), t0 + q * BEAT)
    # melodía de guitarra de nylon (artesanal)
    if 1 <= b < nb - 1:
        for bt, m in MEL[i]: add(lead, nylon(midi(m), 2.2, .3) * .38, t0 + bt * BEAT)

# efectos sincronizados con brand.html
add(sfx, whoosh(.9) * .18, 3.0); add(sfx, chime(midi(81)) * .12, 3.9); add(sfx, chime(midi(86)) * .09, 4.1)
add(sfx, whoosh(.9) * .14, 8.8)
add(sfx, whoosh(.7) * .1, 10.0); add(sfx, whoosh(.7) * .1, 11.5)
add(sfx, stamp() * .2, 11.35); add(sfx, stamp() * .2, 12.85)
add(sfx, whoosh(.9) * .14, 15.2); add(sfx, whoosh(.6) * .1, 16.7)
for k in range(3): add(sfx, tick() * .15, 17.2 + k * .3)
add(sfx, chime(midi(79)) * .12, 21.3); add(sfx, chime(midi(84)) * .1, 22.1); add(sfx, chime(midi(88)) * .08, 22.5)
for i in range(27): add(sfx, tick() * .05, 24.2 + i * (1.4 / 27))

# pista de la próxima marca (escena final, solo si el video dura más de 30 s)
if DUR > 30:
    add(sfx, whoosh(.9) * .12, 26.7)
    for k, tt in enumerate((27.9, 28.15, 28.4)): add(sfx, chime(midi(84 + k * 4)) * .07, tt)
    add(sfx, chime(midi(91)) * .06, 29.4)

# mezcla limpia y moderna (sin vinilo ni cinta), estéreo amplio
ir_n = int(2.4 * SR); irL = lp(rng.normal(0,1,ir_n)*np.exp(-np.arange(ir_n)/SR/.6), 6000); irR = lp(rng.normal(0,1,ir_n)*np.exp(-np.arange(ir_n)/SR/.6), 6000)
irL /= np.sqrt((irL**2).sum()); irR /= np.sqrt((irR**2).sum())
keys = lp(mus, 7000); gtr = lead; bass_ = bs; dr = lp(hp(perc, 200), 7000)
dryL = keys * .9 + gtr * .75 + bass_ * .9 + dr * .12 + sfx * .4
dryR = keys * .75 + gtr * .95 + bass_ * .9 + dr * .15 + sfx * .4
wetsrc = keys + gtr * .8 + dr * .06
L = dryL + fftconvolve(wetsrc, irL)[:N] * .32
R_ = dryR + fftconvolve(wetsrc, irR)[:N] * .32
for ch in (L, R_): ch *= np.clip(t_all / 1.5, 0, 1) * np.clip((DUR - t_all) / 3.0, 0, 1)
pk = max(np.abs(L).max(), np.abs(R_).max()) + 1e-9
L = np.tanh(L / pk * 1.2) / np.tanh(1.2); R_ = np.tanh(R_ / pk * 1.2) / np.tanh(1.2)
pk = max(np.abs(L).max(), np.abs(R_).max()); st = np.stack([L, R_], 1) / pk * .89
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype('<i2').tobytes())
print('ok', sys.argv[1])
