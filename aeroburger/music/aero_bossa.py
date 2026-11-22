"""Música original de Aero Burger: "Aero Bossa" (bossa nova / lounge instrumental, sintetizada nota por nota).
Sin samples ni material de terceros: todo se genera aquí, así que no tiene problemas de derechos.

Instrumentos: guitarra de nailon (cuerda pulsada Karplus-Strong), piano eléctrico (FM), vibráfono,
bajo redondo, bombo suave, aro (rim) en clave y shaker. Mezcla con reverberación de sala, cinta y un poco de vinilo.

Uso:
  python aero_bossa.py salida.wav --bpm 114 --bar0 2.6 --dur 22 [--breakdown 13.1 16.3] [--seed 3]
  --bar0: segundo en el que empieza el primer compás "lleno" (se alinea con el primer corte del video).
  Antes de bar0 suena una introducción suave (acorde + shaker); --breakdown quita la batería en ese tramo.
"""
import argparse, wave, numpy as np

SR = 44100
ap = argparse.ArgumentParser()
ap.add_argument('out'); ap.add_argument('--bpm', type=float, default=114); ap.add_argument('--bar0', type=float, default=2.0)
ap.add_argument('--dur', type=float, default=20); ap.add_argument('--breakdown', type=float, nargs=2, default=None)
ap.add_argument('--seed', type=int, default=3); ap.add_argument('--energy', action='store_true', help='versión animada: bombo en cada tiempo, palmas, hi-hats, bajo en corcheas y guitarra funky')
ap.add_argument('--seed2', type=int, default=0); ap.add_argument('--fade', type=float, default=1.6)
A = ap.parse_args()
rng = np.random.default_rng(A.seed)
BEAT = 60 / A.bpm; BAR = 4 * BEAT
N = int(SR * (A.dur + 3)); L = np.zeros(N); R = np.zeros(N)
mtof = lambda m: 440 * 2 ** ((m - 69) / 12)

def put(sig, t, g=1.0, pan=0.0):
    i = int(round(t * SR))
    if i >= N or i + len(sig) <= 0: return
    if i < 0: sig = sig[-i:]; i = 0
    s = sig[:N - i] * g
    L[i:i + len(s)] += s * np.sqrt((1 - pan) / 2); R[i:i + len(s)] += s * np.sqrt((1 + pan) / 2)

def env(n, a, d, sus=0.0):
    t = np.arange(n) / SR; return (1 - np.exp(-t / max(a, 1e-4))) * ((1 - sus) * np.exp(-t / d) + sus)

# ---------- instrumentos ----------
def nylon(m, dur=1.6, bright=0.5):
    """Karplus-Strong vectorizado por periodo: cuerda de nailon cálida."""
    f = mtof(m); P = max(2, int(round(SR / f))); n = int(dur * SR)
    buf = rng.uniform(-1, 1, P); buf = np.convolve(buf, np.ones(3) / 3, 'same') * (0.6 + 0.4 * bright)
    out = np.empty(n + P); out[:P] = buf; k = P
    decay = 0.996 - 0.0015 * (m - 40) / 40
    while k < n + P:
        prev = out[k - P:k]
        nxt = decay * 0.5 * (prev + np.roll(prev, 1))
        m_ = min(P, n + P - k); out[k:k + m_] = nxt[:m_]; k += m_
    y = out[P:P + n]; y *= env(n, 0.002, dur * 0.55)
    return y / (np.abs(y).max() + 1e-9)

def epiano(m, dur=2.4):
    f = mtof(m); n = int(dur * SR); t = np.arange(n) / SR
    I = 1.1 * np.exp(-t / 0.35) + 0.15
    y = np.sin(2 * np.pi * f * t + I * np.sin(2 * np.pi * f * t)) + 0.25 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t / 0.4)
    y *= env(n, 0.004, 1.3) * (1 + 0.12 * np.sin(2 * np.pi * 4.6 * t))
    return y

def vibes(m, dur=2.0):
    f = mtof(m); n = int(dur * SR); t = np.arange(n) / SR
    y = np.sin(2 * np.pi * f * t) + 0.18 * np.sin(2 * np.pi * 4.0 * f * t) * np.exp(-t / 0.15) + 0.06 * np.sin(2 * np.pi * 10 * f * t) * np.exp(-t / 0.05)
    return y * env(n, 0.002, 0.9) * (1 + 0.25 * np.sin(2 * np.pi * 5.2 * t))

def bass(m, dur=0.9):
    f = mtof(m); n = int(dur * SR); t = np.arange(n) / SR
    y = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t / 0.25) + 0.1 * np.sin(2 * np.pi * 3 * f * t) * np.exp(-t / 0.1)
    y = np.tanh(1.4 * y) * env(n, 0.006, 0.55, 0.05)
    rel = np.ones(n); rel[-int(0.04 * SR):] = np.linspace(1, 0, int(0.04 * SR)); return y * rel

def onepole(x, fc):
    a = np.exp(-2 * np.pi * fc / SR)
    # filtro de un polo vectorizado por bloques (aproximación vía FFT): suficiente para ruido
    H = np.fft.rfft(np.r_[1.0, np.zeros(len(x) - 1)])
    w = np.fft.rfftfreq(len(x), 1 / SR); resp = (1 - a) / np.sqrt(1 + a * a - 2 * a * np.cos(2 * np.pi * w / SR))
    return np.fft.irfft(np.fft.rfft(x) * resp, len(x))

def kick():
    n = int(0.35 * SR); t = np.arange(n) / SR; f = 60 + 70 * np.exp(-t * 32)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.002, 0.14)

def rim():
    n = int(0.08 * SR); t = np.arange(n) / SR
    tone = np.sin(2 * np.pi * 1750 * t) * np.exp(-t / 0.012) + 0.6 * np.sin(2 * np.pi * 820 * t) * np.exp(-t / 0.02)
    nz = rng.normal(0, 1, n); nz = nz - onepole(nz, 1200); return (tone + 0.35 * nz * np.exp(-t / 0.006)) * 0.6

def shaker(accent=1.0):
    n = int(0.09 * SR); nz = rng.normal(0, 1, n); nz = nz - onepole(nz, 5000)
    t = np.arange(n) / SR; e = (t / 0.012) ** 2 * np.exp(-t / 0.02); e /= e.max(); return nz * e * 0.35 * accent

def clap():
    n = int(0.16 * SR); t = np.arange(n) / SR
    nz = rng.normal(0, 1, n); nz = onepole(nz, 3800) - onepole(nz, 700)
    e = np.exp(-t / 0.05) * (1 + 0.8 * (np.sin(2 * np.pi * 90 * t) > 0.3))
    return nz * e / (np.abs(nz * e).max() + 1e-9) * 0.7

def hat(open_=False):
    n = int(0.12 * SR if open_ else 0.05 * SR); t = np.arange(n) / SR
    nz = rng.normal(0, 1, n); nz = nz - onepole(nz, 6500)
    return nz * np.exp(-t / (0.05 if open_ else 0.012)) * 0.5

def chop(m, dur=0.16):
    return nylon(m, dur, 0.95) * np.exp(-np.arange(int(dur * SR)) / (0.05 * SR))

def crackle(dur):
    n = int(dur * SR); x = onepole(rng.normal(0, 1, n), 2500) * 0.02
    k = 0
    while k < n:
        m = 60
        if k + m < n: x[k:k + m] += rng.normal(0, 1, m) * np.exp(-np.arange(m) / 8) * rng.uniform(.05, .25)
        k += int(SR * rng.exponential(0.07))
    return x

# ---------- armonía (Re mayor, colores de jazz) ----------
#            bajo  voces de guitarra / piano           nombre
PROG = [(38, [54, 57, 61, 64], 'Dmaj9'),
        (35, [50, 54, 57, 61], 'Bm9'),
        (40, [55, 59, 62, 66], 'Em9'),
        (33, [55, 59, 61, 66], 'A13')]
# motivo de vibráfono por ciclo de 4 compases: (compás, tiempo, nota, duración en tiempos)
MEL = [(0, 0.5, 69, 1.5), (0, 2.0, 66, 1.0), (0, 3.0, 64, 1.0),
       (1, 0.5, 66, 1.0), (1, 1.5, 69, 1.0), (1, 2.5, 71, 1.5),
       (2, 0.0, 74, 1.5), (2, 1.5, 71, 1.0), (2, 2.5, 69, 1.0),
       (3, 0.5, 67, 1.0), (3, 1.5, 66, 1.0), (3, 2.5, 64, 1.5)]
CLAVE = [[0.0, 1.5, 3.0], [1.0, 2.0]]   # 3-2 son clave, en tiempos

end_t = A.dur
first_bar = A.bar0 - BAR * np.ceil(A.bar0 / BAR)   # compás "fantasma" para la intro
in_break = lambda t: A.breakdown is not None and A.breakdown[0] <= t < A.breakdown[1]

# introducción: acorde de piano que crece + shaker suave antes del primer compás
intro_chord = PROG[0]
for k, m in enumerate(intro_chord[1]): put(epiano(m + 12, 3.2), 0.15 + k * 0.06, 0.12, -0.3 + 0.2 * k)
put(epiano(intro_chord[0] + 12, 3.0), 0.15, 0.10)
s = 0.0
while s < A.bar0 - 1e-6:
    if s > A.bar0 - BAR: put(shaker(0.6 + 0.4 * ((s / (BEAT / 4)) % 2)), s, 0.5, 0.35)
    s += BEAT / 4

bar = 0; tb = A.bar0
while tb < end_t + BAR:
    bass_m, voices, _ = PROG[bar % 4]
    last = tb + BAR > end_t
    # guitarra: pulgar (bajo) en 1 y 3, acordes en la clave
    for b in (0.0, 2.0):
        put(nylon(bass_m + 12, 1.2, 0.35), tb + b * BEAT, 0.50, -0.15)
    for b in CLAVE[bar % 2]:
        for j, m in enumerate(voices):
            put(nylon(m, 1.4, 0.6), tb + b * BEAT + j * 0.008, 0.24, -0.35 + 0.18 * j)
    # piano eléctrico: acorde largo en el 1 (y en el "y" del 2 en compases pares)
    for j, m in enumerate(voices): put(epiano(m + 12, BAR + 0.5), tb + 0.02 * j, 0.085, 0.4 - 0.15 * j)
    # bajo
    for b, mm, d in ((0.0, bass_m, 1.4), (1.5, bass_m + 7, 0.45), (2.0, bass_m + 7 if bar % 2 else bass_m, 1.2), (3.5, bass_m + 12, 0.4)):
        put(bass(mm, d * BEAT + 0.1), tb + b * BEAT, 0.40)
    # batería (se quita en el breakdown)
    if not in_break(tb + 0.1):
        for b in (0.0, 2.0): put(kick(), tb + b * BEAT, 0.40)
        for b in CLAVE[bar % 2]: put(rim(), tb + b * BEAT, 0.30, 0.25)
        for k in range(16):
            sw = (BEAT / 4) * (0.12 if k % 2 else 0)   # ligero swing
            put(shaker(1.0 if k % 4 == 2 else 0.6), tb + k * BEAT / 4 + sw, 0.42, 0.35)
    if A.energy and not in_break(tb + 0.1):
        for b in (1.0, 3.0): put(kick(), tb + b * BEAT, 0.40)                 # bombo en cada tiempo
        for b in (1.0, 3.0): put(clap(), tb + b * BEAT, 0.34, 0.15)           # palmas en 2 y 4
        for k in range(8):                                                      # hi-hat en corcheas, abierto en el "y" del 4
            put(hat(open_=(k == 7)), tb + (k + 0.5 * 0) * BEAT / 2 + (BEAT / 2) * 0.0 + (BEAT / 2) * (0.5 if k % 2 else 0) * 0.0, 0.18 if k % 2 == 0 else 0.30, -0.25)
        for b in (0.5, 1.5, 2.5, 3.5): put(bass(bass_m + (12 if b % 1 else 7), 0.35), tb + b * BEAT, 0.30)   # bajo que salta
        for b in (0.5, 1.5, 2.25, 3.0, 3.5):                                    # guitarra funky a contratiempo
            for j, m in enumerate(voices[:3]): put(chop(m + 12), tb + b * BEAT + j * 0.006, 0.20, -0.2 + 0.2 * j)
    # vibráfono (melodía) a partir del segundo compás, y siempre en el breakdown
    for (mb, b, m, d) in MEL:
        if mb == bar % 4 and (bar >= 1 or in_break(tb) or A.energy):
            put(vibes(m + (12 if (A.energy and bar % 8 >= 4) else 0), d * BEAT + 1.0), tb + b * BEAT, 0.17 if not in_break(tb) else 0.22, 0.15)
    if last:   # final: acorde que queda sonando
        for j, m in enumerate(PROG[0][1]): put(epiano(m + 12, 3.5), tb + BAR, 0.08, 0.3 - 0.2 * j)
        break
    bar += 1; tb += BAR

# ---------- mezcla ----------
mix = np.stack([L, R], 1)
# reverberación de sala: respuesta al impulso de ruido con caída exponencial (estéreo), convolución por FFT
ir_len = int(1.8 * SR); t = np.arange(ir_len) / SR
irL = rng.normal(0, 1, ir_len) * np.exp(-t / 0.45); irR = rng.normal(0, 1, ir_len) * np.exp(-t / 0.45)
irL[:int(0.01 * SR)] = 0; irR[:int(0.012 * SR)] = 0
def conv(x, h):
    n = 1 << int(np.ceil(np.log2(len(x) + len(h)))); return np.fft.irfft(np.fft.rfft(x, n) * np.fft.rfft(h, n), n)[:len(x)]
wetL = conv(onepole(mix[:, 0], 6000), irL); wetR = conv(onepole(mix[:, 1], 6000), irR)
wet = np.stack([wetL, wetR], 1); wet *= 0.22 * np.abs(mix).max() / (np.abs(wet).max() + 1e-9)
mix = mix + wet
# color de cinta: filtro suave de agudos + saturación leve + vinilo
mix = np.stack([onepole(mix[:, 0], 9500), onepole(mix[:, 1], 9500)], 1)
mix = mix - np.stack([onepole(onepole(mix[:, 0], 45), 45), onepole(onepole(mix[:, 1], 45), 45)], 1)   # paso alto 45 Hz
mix = np.tanh(1.2 * mix / (np.abs(mix).max() + 1e-9)) / np.tanh(1.2)
cr = crackle(N / SR); mix[:, 0] += cr * 0.6; mix[:, 1] += np.roll(cr, 997) * 0.6
# recorte a la duración con fundido final
n_out = int(A.dur * SR); mix = mix[:n_out]
fo = int(A.fade * SR); mix[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 1.5
fi = int(0.05 * SR); mix[:fi] *= np.linspace(0, 1, fi)[:, None]
mix *= 0.89 / np.abs(mix).max()   # pico a -1 dBFS
with wave.open(A.out, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype('<i2').tobytes())
print('ok', A.out, f'{A.dur:.1f}s', f'{A.bpm} BPM', 'compás =', f'{BAR:.3f}s')
