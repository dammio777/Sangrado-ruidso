"""Aero Burger · música original "cozy" (lo-fi / jazz-hop / acústica), compuesta y producida nota por nota.

Tres temas distintos, cada uno con su tonalidad, instrumentación y tempo, alineados a los cortes de su video:
  menu        "Menú de a bordo"  · Fa mayor · 80 BPM · piano Rhodes + campanita + contrabajo + batería lo-fi con escobillas
  aerosanduche "Aerosanduche"    · Re mayor · 80 BPM · guitarra de nailon fingerpicking + piano de fieltro + percusión suave
  llegar      "Cómo llegar"      · Do mayor · 72 BPM · piano de fieltro + colchón (pad) + latido suave

Producción: humanización (tiempo y velocidad), swing, sidechain del bombo sobre teclas/pad/bajo, EQ por grupo
(filtros de fase cero por FFT), reverberación de sala por convolución con caída dependiente de la frecuencia,
"swell" invertido antes de las entradas, compresión de mezcla y limitador. Sin samples ni material de terceros.

Uso: python cozy.py <menu|aerosanduche|llegar> salida.wav
"""
import sys, wave
import numpy as np

SR = 48000
mtof = lambda m: 440.0 * 2 ** ((m - 69) / 12)


# ============================================================ utilidades de señal
def fft_filter(x, H):
    """Filtro de fase cero: multiplica el espectro por la curva H(f)."""
    n = len(x); nf = 1 << int(np.ceil(np.log2(n + SR)))
    f = np.fft.rfftfreq(nf, 1 / SR)
    return np.fft.irfft(np.fft.rfft(x, nf) * H(f), nf)[:n]

def lp(fc, order=2):  return lambda f: 1 / np.sqrt(1 + (f / fc) ** (2 * order))
def hp(fc, order=2):  return lambda f: (f / fc) ** order / np.sqrt(1 + (f / fc) ** (2 * order))
def peak(fc, db, width_oct=1.0):
    return lambda f: 10 ** (db / 20 * np.exp(-0.5 * (np.log2(np.maximum(f, 1) / fc) / (width_oct / 2.355 * 2)) ** 2))
def low_shelf(fc, db):  return lambda f: 10 ** (db / 20 / (1 + (f / fc) ** 2))
def high_shelf(fc, db): return lambda f: 10 ** (db / 20 * (f / fc) ** 2 / (1 + (f / fc) ** 2))
def chain(*hs):
    def H(f):
        out = np.ones_like(f)
        for h in hs: out = out * h(f)
        return out
    return H

def fade_edges(y, a=0.002, r=0.02):
    na, nr = min(len(y), int(a * SR)), min(len(y), int(r * SR))
    if na: y[:na] *= np.linspace(0, 1, na)
    if nr: y[-nr:] *= np.linspace(1, 0, nr) ** 2
    return y


class Bus:
    """Grupo estéreo con envío a reverberación."""
    def __init__(self, n, name):
        self.L = np.zeros(n); self.R = np.zeros(n); self.name = name; self.n = n
        self.sendL = np.zeros(n); self.sendR = np.zeros(n)
    def add(self, sig, t, gain=1.0, pan=0.0, send=0.0):
        i = int(round(t * SR))
        if i >= self.n: return
        if sig.ndim == 1: l = r = sig
        else: l, r = sig
        if i < 0: l, r, i = l[-i:], r[-i:], 0
        m = min(len(l), self.n - i)
        gl, gr = np.cos((pan + 1) * np.pi / 4) * np.sqrt(2), np.sin((pan + 1) * np.pi / 4) * np.sqrt(2)
        self.L[i:i + m] += l[:m] * gain * gl; self.R[i:i + m] += r[:m] * gain * gr
        if send:
            self.sendL[i:i + m] += l[:m] * gain * gl * send; self.sendR[i:i + m] += r[:m] * gain * gr * send
    def eq(self, H):
        self.L = fft_filter(self.L, H); self.R = fft_filter(self.R, H)
        self.sendL = fft_filter(self.sendL, H); self.sendR = fft_filter(self.sendR, H)
    def gain_curve(self, g):
        self.L *= g; self.R *= g; self.sendL *= g; self.sendR *= g


# ============================================================ instrumentos
class Inst:
    def __init__(self, seed):
        self.rng = np.random.default_rng(seed)

    def rhodes(self, m, dur, vel=0.7):
        """Piano eléctrico (FM): cuerpo 1:1 con índice que decae, 'tine' brillante al ataque, ladrido suave con la velocidad."""
        f = mtof(m); rel = 0.35; n = int((dur + rel) * SR); t = np.arange(n) / SR
        tau = 2.4 * (220 / f) ** 0.35
        I = (0.7 + 0.9 * vel) * np.exp(-t / 0.30) + 0.30 * vel
        ph = 2 * np.pi * f * t + self.rng.uniform(0, 6.28)
        y = np.sin(ph + I * np.sin(ph))
        y += 0.10 * np.sin(2 * ph) * np.exp(-t / 0.5)
        y += (0.08 + 0.14 * vel) * np.sin(2 * np.pi * f * 7.02 * t) * np.exp(-t / 0.04)   # tine
        drive = 1.0 + 1.6 * vel
        y = np.tanh(drive * y) / np.tanh(drive)
        env = (1 - np.exp(-t / 0.0025)) * np.exp(-t / tau)
        off = int(dur * SR)
        if off < n: env[off:] *= np.exp(-(t[off:] - dur) / 0.10)
        return fade_edges(y * env * (0.35 + 0.65 * vel), 0.001, 0.03)

    def felt(self, m, dur, vel=0.6):
        """Piano de fieltro: parciales inarmónicos, dos cuerdas por nota (batido suave), martillo amortiguado."""
        f = mtof(m); rel = 0.28; n = int((dur + rel) * SR); t = np.arange(n) / SR
        B = 0.00028; y = np.zeros(n)
        bright = 900 + 1700 * vel
        tau1 = 3.8 * (130 / f) ** 0.45
        for k in range(1, 14):
            fk = f * k * np.sqrt(1 + B * k * k)
            if fk > 7000: break
            a = (1 / k ** 1.15) * np.exp(-fk / bright)
            tau = tau1 / (1 + 0.55 * (k - 1))
            for det in (-0.9, 0.9):
                y += 0.5 * a * np.sin(2 * np.pi * fk * 2 ** (det / 1200) * t + self.rng.uniform(0, 6.28)) * np.exp(-t / tau)
        hammer = self.rng.normal(0, 1, n) * np.exp(-t / 0.006); hammer = np.convolve(hammer, np.ones(24) / 24, 'same')
        y += 0.025 * vel * hammer
        env = 1 - np.exp(-t / 0.004)
        off = int(dur * SR)
        if off < n: env[off:] *= np.exp(-(t[off:] - dur) / 0.11)
        return fade_edges(y * env * (0.3 + 0.7 * vel), 0.001, 0.03)

    def nylon(self, m, dur, vel=0.6, bright=0.45):
        """Guitarra de nailon (Karplus-Strong afinado exacto: se sintetiza a una tasa con periodo entero y se remuestrea)."""
        f = mtof(m); P = int(SR / f); sr2 = P * f
        n_out = int((dur + 0.15) * SR); n2 = int(n_out * sr2 / SR) + P + 2
        T60 = 3.2 * (110 / f) ** 0.45
        decay = np.exp(-6.91 / (T60 * f))
        exc = self.rng.uniform(-1, 1, P)
        k = 5 + int((1 - vel) * 8 + (1 - bright) * 8)   # nailon: ataque cálido
        exc = np.convolve(exc, np.ones(k) / k, 'same')
        pp = max(1, int(P * 0.14)); exc = exc - 0.5 * np.roll(exc, pp)         # posición de pulsado
        exc -= exc.mean()
        buf = np.empty(n2); buf[:P] = exc; i = P
        a = 0.5 + 0.18 * bright
        while i < n2:
            prev = buf[i - P:i]
            nxt = decay * (a * prev + (1 - a) * np.r_[buf[i - P - 1] if i - P - 1 >= 0 else prev[0], prev[:-1]])
            c = min(P, n2 - i); buf[i:i + c] = nxt[:c]; i += c
        y = np.interp(np.arange(n_out) * sr2 / SR, np.arange(n2), buf)
        t = np.arange(n_out) / SR
        off = int(dur * SR)
        if off < n_out: y[off:] *= np.exp(-(t[off:] - dur) / 0.07)
        y = y / (np.abs(y[:int(0.05 * SR)]).max() + 1e-9)
        return fade_edges(y * (0.3 + 0.7 * vel), 0.0005, 0.03)

    def bass(self, m, dur, vel=0.7):
        """Contrabajo redondo: fundamental + armónicos con caída rápida + golpe de dedo."""
        f = mtof(m); n = int((dur + 0.15) * SR); t = np.arange(n) / SR
        ph = 2 * np.pi * f * t
        y = np.sin(ph) + 0.32 * np.sin(2 * ph) * np.exp(-t / 0.35) + 0.12 * np.sin(3 * ph) * np.exp(-t / 0.12)
        y = np.tanh(1.3 * y) / np.tanh(1.3)
        thump = self.rng.normal(0, 1, n) * np.exp(-t / 0.008); thump = np.convolve(thump, np.ones(40) / 40, 'same')
        env = (1 - np.exp(-t / 0.006)) * np.exp(-t / 1.4)
        off = int(dur * SR)
        if off < n: env[off:] *= np.exp(-(t[off:] - dur) / 0.06)
        return fade_edges((y + 0.25 * thump) * env * (0.4 + 0.6 * vel), 0.001, 0.03)

    def pad(self, m, dur, vel=0.5, cutoff=2200):
        """Colchón cálido: diente de sierra de banda limitada, tres voces desafinadas, ataque y salida lentos (estéreo)."""
        f = mtof(m); n = int((dur + 1.4) * SR); t = np.arange(n) / SR
        L = np.zeros(n); R = np.zeros(n)
        for det, wl, wr in ((-7, 1.0, 0.25), (0, 0.6, 0.6), (7, 0.25, 1.0)):
            fd = f * 2 ** (det / 1200); K = max(1, min(14, int(cutoff / fd)))
            v = np.zeros(n)
            for k in range(1, K + 1):
                v += np.sin(2 * np.pi * k * fd * t + self.rng.uniform(0, 6.28)) / k * np.exp(-(k * fd / cutoff) ** 2)
            L += wl * v; R += wr * v
        env = 1 - np.exp(-t / 0.55)
        off = int(dur * SR)
        if off < n: env[off:] *= np.exp(-(t[off:] - dur) / 0.45)
        return np.stack([fade_edges(L * env * vel, 0.01, 0.2), fade_edges(R * env * vel, 0.01, 0.2)])

    def bell(self, m, dur, vel=0.6):
        """Campanita suave (celesta/vibráfono): parciales 1, 2, 3, 4.07 con caídas distintas."""
        f = mtof(m); n = int((dur + 1.2) * SR); t = np.arange(n) / SR
        y = np.zeros(n)
        for r, a, tau in ((1, 1.0, 1.5), (2, 0.18, 0.5), (3, 0.06, 0.25), (4.07, 0.05, 0.09)):
            y += a * np.sin(2 * np.pi * f * r * t + self.rng.uniform(0, 6.28)) * np.exp(-t / tau)
        env = 1 - np.exp(-t / 0.0015)
        off = int(dur * SR)
        if off < n: env[off:] *= np.exp(-(t[off:] - dur) / 0.35)
        return fade_edges(y * env * vel, 0.0005, 0.05)

    # ---- batería
    def kick(self, vel=0.8):
        n = int(0.5 * SR); t = np.arange(n) / SR
        f = 48 + 68 * np.exp(-t / 0.032)
        y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.26)
        click = self.rng.normal(0, 1, n) * np.exp(-t / 0.0015); click = np.convolve(click, np.ones(18) / 18, 'same')
        return fade_edges((y + 0.08 * click) * vel, 0.0005, 0.05)

    def snare(self, vel=0.6, brush=False):
        n = int(0.45 * SR); t = np.arange(n) / SR
        tone = np.sin(2 * np.pi * 190 * t) * np.exp(-t / 0.045) + 0.5 * np.sin(2 * np.pi * 330 * t) * np.exp(-t / 0.03)
        nz = self.rng.normal(0, 1, n)
        nz = fft_filter(nz, chain(hp(900), lp(6500 if not brush else 4200, 2)))
        tail = np.exp(-t / (0.09 if not brush else 0.16))
        if brush: tail *= (1 - np.exp(-t / 0.006))
        y = (0.35 if brush else 0.8) * tone + nz / (np.abs(nz).max() + 1e-9) * tail
        return fade_edges(y * vel, 0.0005, 0.05)

    def rim(self, vel=0.5):
        n = int(0.12 * SR); t = np.arange(n) / SR
        y = np.sin(2 * np.pi * 1700 * t) * np.exp(-t / 0.010) + 0.7 * np.sin(2 * np.pi * 520 * t) * np.exp(-t / 0.022)
        nz = self.rng.normal(0, 1, n) * np.exp(-t / 0.004)
        return fade_edges((y + 0.3 * nz) * vel * 0.7, 0.0003, 0.03)

    def hat(self, vel=0.4, open_=False):
        n = int((0.32 if open_ else 0.09) * SR); t = np.arange(n) / SR
        nz = fft_filter(self.rng.normal(0, 1, n), chain(hp(6500, 3), lp(10500, 2)))
        y = nz / (np.abs(nz).max() + 1e-9) * np.exp(-t / (0.11 if open_ else 0.022))
        return fade_edges(y * vel, 0.0003, 0.02)

    def shaker(self, vel=0.3):
        n = int(0.11 * SR); t = np.arange(n) / SR
        nz = fft_filter(self.rng.normal(0, 1, n), chain(hp(4500, 2), lp(11000, 2)))
        e = (t / 0.018) ** 2 * np.exp(-t / 0.024); e /= e.max()
        return fade_edges(nz / (np.abs(nz).max() + 1e-9) * e * vel, 0.0003, 0.02)


# ============================================================ reverberación
def room_ir(seed=5, length=2.8, t60_low=2.0, t60_high=0.7, predelay=0.018):
    rng = np.random.default_rng(seed); n = int(length * SR); t = np.arange(n) / SR
    edges = [0, 200, 400, 800, 1600, 3200, 6400, 12000, SR / 2]
    out = []
    for ch in range(2):
        X = np.fft.rfft(rng.normal(0, 1, n)); f = np.fft.rfftfreq(n, 1 / SR); ir = np.zeros(n)
        for lo, hi in zip(edges, edges[1:]):
            fc = np.sqrt(max(lo, 50) * hi)
            T = np.interp(np.log2(fc), [np.log2(250), np.log2(8000)], [t60_low, t60_high])
            band = np.fft.irfft(X * ((f >= lo) & (f < hi)), n)
            ir += band * np.exp(-6.91 * t / T)
        ir *= 1 - np.exp(-t / 0.012)                       # densidad que crece suave
        for d, g in ((0.011, 0.5), (0.017, 0.35), (0.023, 0.3), (0.031, 0.22), (0.043, 0.15)):   # reflexiones tempranas
            k = int((d + 0.002 * ch) * SR); ir[k] += g * (1 if (k + ch) % 2 else -1) * 3
        pd = int(predelay * SR); ir = np.r_[np.zeros(pd), ir][:n]
        out.append(ir / np.sqrt(np.sum(ir ** 2)))
    return out

def convolve(x, h):
    n = len(x) + len(h); nf = 1 << int(np.ceil(np.log2(n)))
    return np.fft.irfft(np.fft.rfft(x, nf) * np.fft.rfft(h, nf), nf)[:len(x)]


# ============================================================ dinámica de mezcla
def env_follow(x, attack, release, block=0.005):
    b = int(block * SR); nb = len(x) // b
    lvl = np.sqrt(np.mean(x[:nb * b].reshape(nb, b) ** 2, axis=1) + 1e-12)
    out = np.empty(nb); s = lvl[0]
    aa, ar = np.exp(-block / attack), np.exp(-block / release)
    for i, v in enumerate(lvl):
        s = aa * s + (1 - aa) * v if v > s else ar * s + (1 - ar) * v
        out[i] = s
    return np.interp(np.arange(len(x)), np.arange(nb) * b + b / 2, out)

def compress(L, R, thr_db, ratio, attack=0.015, release=0.18, makeup_db=0.0):
    e = env_follow((L + R) / 2, attack, release)
    lvl = 20 * np.log10(e + 1e-9)
    gr = np.where(lvl > thr_db, (lvl - thr_db) * (1 - 1 / ratio), 0.0)
    g = 10 ** ((makeup_db - gr) / 20)
    return L * g, R * g

def limiter(L, R, ceiling=0.89, look=0.004, release=0.08):
    b = int(0.001 * SR); n = len(L); nb = n // b + 1
    pk = np.zeros(nb)
    a = np.maximum(np.abs(L), np.abs(R)); a = np.r_[a, np.zeros(nb * b - n)]
    pk = a.reshape(nb, b).max(axis=1)
    need = np.minimum(1, ceiling / (pk + 1e-12))
    w = int(look / 0.001) + 1
    need = np.array([need[max(0, i - 0):i + w].min() for i in range(nb)])   # anticipación
    g = np.empty(nb); s = 1.0; ar = np.exp(-0.001 / release)
    for i, v in enumerate(need):
        s = v if v < s else ar * s + (1 - ar) * v
        g[i] = s
    gs = np.interp(np.arange(n), np.arange(nb) * b, g)
    return np.tanh(L * gs / ceiling * 0.98) * ceiling, np.tanh(R * gs / ceiling * 0.98) * ceiling


def match_eq(L, R, strength=0.85, limit=7.0):
    """EQ de corrección suave: acerca el balance por octavas al de una mezcla lo-fi/jazz pulida de referencia."""
    Mx = (L + R) / 2
    X = np.abs(np.fft.rfft(Mx * np.hanning(len(Mx)))) ** 2; f = np.fft.rfftfreq(len(Mx), 1 / SR)
    edges = [31, 63, 125, 250, 500, 1000, 2000, 4000, 8000, 16000]
    E = np.array([10 * np.log10(X[(f >= a) & (f < b)].sum() + 1e-12) for a, b in zip(edges, edges[1:])])
    target = np.array([-6, -1, 0, -2.5, -5, -7.5, -10, -13.5, -18.0])
    diff = target - (E - E.max()); diff -= diff[1:8].mean()
    corr = np.clip(strength * diff, -limit, limit); corr[0] = min(corr[0], 0)
    centers = np.log2([np.sqrt(a * b) for a, b in zip(edges, edges[1:])])
    H = lambda fr: 10 ** (np.interp(np.log2(np.maximum(fr, 20)), centers, corr) / 20)
    return fft_filter(L, H), fft_filter(R, H)


# ============================================================ canciones
class Song:
    def __init__(self, bpm, bar0, duration, seed, swing=0.16):
        self.bpm = bpm; self.beat = 60 / bpm; self.bar0 = bar0; self.dur = duration; self.swing = swing
        self.N = int(duration * SR) + 1
        self.I = Inst(seed); self.rng = np.random.default_rng(seed + 100)
        self.b = {k: Bus(self.N, k) for k in ('keys', 'lead', 'bass', 'pad', 'drums', 'fx')}
        self.kicks = []
    def T(self, bar, beat, swing=False, hum=0.006):
        """Tiempo (s) de un compás y tiempo; con swing de semicorcheas y humanización."""
        if swing:
            k = round(beat * 4)
            if abs(beat * 4 - k) < 1e-6 and k % 2 == 1: beat += 0.25 * self.swing
        return self.bar0 + (bar * 4 + beat) * self.beat + (self.rng.normal(0, hum) if hum else 0)
    def v(self, base, sd=0.07):
        return float(np.clip(base * (1 + self.rng.normal(0, sd)), 0.05, 1.0))

    # ---- piezas reutilizables
    def chord(self, inst, notes, t, dur, vel, bus='keys', roll=0.018, pan_spread=0.85, send=0.3, gain=1.0):
        for j, m in enumerate(notes):
            sig = getattr(self.I, inst)(m, dur, self.v(vel))
            pan = (j / max(1, len(notes) - 1) - 0.5) * pan_spread
            self.b[bus].add(sig, t + j * roll, gain, pan, send)
    def swell(self, notes, t_end, length=1.6, gain=0.5):
        """Acorde invertido con reverberación que crece hasta t_end (entrada producida)."""
        n = int(length * SR); acc = np.zeros(n)
        for m in notes:
            s = self.I.rhodes(m, 1.2, 0.6)[:n]; acc[:len(s)] += s
        wet = convolve(acc, self.ir[0])[:n]
        rev = wet[::-1] * np.linspace(0, 1, n) ** 2
        rev = fade_edges(rev / (np.abs(rev).max() + 1e-9), 0.05, 0.015)
        self.b['fx'].add(rev, t_end - length, gain, 0.0, 0.2)
    def drum_hit(self, kind, t, vel, pan=0.0, send=0.08, **kw):
        sig = getattr(self.I, kind)(self.v(vel), **kw)
        self.b['drums'].add(sig, t, 1.0, pan, send)
        if kind == 'kick': self.kicks.append(t)

    # ---- mezcla final
    def mixdown(self, out, master_fade=(None, None), duck=(0.32, 0.35, 0.18), lead_gain=1.0, keys_gain=1.0):
        B = self.b
        # sidechain del bombo
        t = np.arange(self.N) / SR; env = np.zeros(self.N)
        for k in self.kicks:
            i = int(k * SR); m = min(self.N - i, int(0.5 * SR))
            if m > 0: env[i:i + m] = np.maximum(env[i:i + m], np.exp(-np.arange(m) / SR / 0.16) * (1 - np.exp(-np.arange(m) / SR / 0.004)))
        for bus, d in zip(('keys', 'pad', 'bass'), duck): B[bus].gain_curve(1 - d * env)
        # EQ por grupo
        B['keys'].eq(chain(hp(170, 2), peak(300, -3.0, 1.2), peak(2200, 2.5, 1.5), lp(12000, 2)))
        B['lead'].eq(chain(hp(300, 2), peak(3000, 2.0, 1.5), lp(12000, 2)))
        B['bass'].eq(chain(hp(40, 3), lp(700, 2), peak(100, 1.0, 1.0)))
        B['pad'].eq(chain(hp(240, 2), lp(3200, 2)))
        B['drums'].eq(chain(hp(35, 3), peak(220, -2.0, 1.0), peak(5000, 2.0, 1.5), lp(15000, 2)))
        B['fx'].eq(chain(hp(200, 2), lp(7000, 2)))
        gains = {'keys': 0.42 * keys_gain, 'lead': 0.32 * lead_gain, 'bass': 0.32, 'pad': 0.10, 'drums': 0.42, 'fx': 0.22}
        import os
        for k in os.environ.get('MUTE', '').split(','):
            if k in gains: gains[k] = 0.0
        L = np.zeros(self.N); R = np.zeros(self.N); sL = np.zeros(self.N); sR = np.zeros(self.N)
        for k, bus in B.items():
            g = gains[k]; L += bus.L * g; R += bus.R * g; sL += bus.sendL * g; sR += bus.sendR * g
        wl, wr = convolve(sL, self.ir[0]), convolve(sR, self.ir[1])
        L += 0.65 * wl; R += 0.65 * wr
        # tremolo estéreo sutil del Rhodes ya va en la mezcla; master: limpieza y calidez
        H = chain(hp(28, 3), peak(280, -1.0, 1.5))
        L, R = fft_filter(L, H), fft_filter(R, H)
        L, R = match_eq(L, R)
        pk = np.abs(np.r_[L, R]).max() + 1e-9
        L, R = L / pk * 0.6, R / pk * 0.6
        L, R = compress(L, R, -18, 1.5, 0.02, 0.25, makeup_db=2.0)
        L, R = limiter(L, R, 0.89)
        fi, fo = master_fade
        if fo:
            st, ln = fo; i0 = int(st * SR); m = self.N - i0
            g = np.ones(self.N); g[i0:] = np.linspace(1, 0, m) ** 1.6; L *= g; R *= g
        n5 = int(0.004 * SR); L[:n5] *= np.linspace(0, 1, n5); R[:n5] *= np.linspace(0, 1, n5)
        st = np.stack([L, R], 1)
        with wave.open(out, 'wb') as w:
            w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
            w.writeframes((np.clip(st, -1, 1) * 32767).astype('<i2').tobytes())


# ------------------------------------------------------------ 1) Menú de a bordo (Fa mayor, 80 BPM)
def song_menu(out):
    S = Song(80, 3.0, 33.0, seed=11); S.ir = room_ir(5, 2.8, 2.2, 0.75)
    V = {'Fmaj9': (41, [57, 60, 64, 67]), 'Am9': (45, [55, 59, 60, 64]), 'Dm9': (38, [53, 57, 60, 64]),
         'Bbmaj9': (46, [57, 60, 62, 65]), 'C9sus': (36, [58, 62, 65, 67]), 'Gm9': (43, [53, 57, 58, 62])}
    # compás -> acordes (acorde, tiempo de inicio, duración en tiempos)
    P = {-1: [('C9sus', 0, 4)], 0: [('Fmaj9', 0, 4)], 1: [('Am9', 0, 4)], 2: [('Dm9', 0, 4)], 3: [('Bbmaj9', 0, 4)],
         4: [('Fmaj9', 0, 4)], 5: [('Am9', 0, 2), ('C9sus', 2, 2)], 6: [('Dm9', 0, 4)], 7: [('Gm9', 0, 4)],
         8: [('Bbmaj9', 0, 2), ('C9sus', 2, 2)], 9: [('Fmaj9', 0, 4)]}
    groove = set(range(0, 6)) | {8}
    for bar, chords in P.items():
        for name, b0, ln in chords:
            root, notes = V[name]
            t0 = S.T(bar, b0)
            if bar == -1:
                S.chord('rhodes', notes, S.T(bar, 0.0), 3.2 * S.beat, 0.45, roll=0.03, send=0.35)
            elif bar in (6, 7) or bar == 9:
                S.chord('rhodes', notes, t0, (ln - 0.1) * S.beat if bar != 9 else 5.0, 0.55, roll=0.045, send=0.4)
            else:
                S.chord('rhodes', notes, t0, min(ln, 2.6) * S.beat, 0.62, roll=0.012)
                if ln == 4: S.chord('rhodes', notes[1:], S.T(bar, 2.5, swing=True), 1.2 * S.beat, 0.42, roll=0.01)
            # colchón
            for m in notes[:3]: S.b['pad'].add(S.I.pad(m - 12 + 12, ln * S.beat * 0.98, 0.5), t0, 1.0, 0, 0.4)
            # bajo
            if bar == -1: continue
            if bar in (6, 7, 9):
                S.b['bass'].add(S.I.bass(root, (ln - 0.2) * S.beat if bar != 9 else 4.0, 0.55), t0)
            else:
                S.b['bass'].add(S.I.bass(root, 1.4 * S.beat, S.v(0.75)), t0)
                if ln == 4:
                    S.b['bass'].add(S.I.bass(root + 7, 0.8 * S.beat, S.v(0.55)), S.T(bar, 1.5, True))
                    S.b['bass'].add(S.I.bass(root + 12, 0.45 * S.beat, S.v(0.45)), S.T(bar, 2.5, True))
                    nxt = P.get(bar + 1, [('Fmaj9', 0, 4)])[0][0]; nr = V[nxt][0]
                    S.b['bass'].add(S.I.bass(nr - 1 if nr - 1 > 33 else nr + 1, 0.4 * S.beat, S.v(0.45)), S.T(bar, 3.5, True))
                else:
                    S.b['bass'].add(S.I.bass(root + 7, 0.45 * S.beat, S.v(0.5)), S.T(bar, b0 + 1.5, True))
    # batería lo-fi
    for bar in range(0, 10):
        if bar == 9:
            S.drum_hit('kick', S.T(9, 0, hum=0.002), 0.7); continue
        if bar not in groove:
            for k in range(8): S.drum_hit('shaker', S.T(bar, k * 0.5, True), 0.16 + 0.08 * (k % 2), 0.3)
            continue
        S.drum_hit('kick', S.T(bar, 0, hum=0.002), 0.75)
        S.drum_hit('kick', S.T(bar, 2.5, True, 0.002), 0.6)
        if bar % 2: S.drum_hit('kick', S.T(bar, 1.75, True, 0.002), 0.35)
        for b in (1, 3): S.drum_hit('snare', S.T(bar, b, hum=0.004), 0.55, 0.05, 0.12, brush=True)
        if bar % 2: S.drum_hit('snare', S.T(bar, 3.75, True), 0.16, 0.05, 0.1, brush=True)
        for k in range(16):
            b = k * 0.25; acc = (0.42, 0.14, 0.26, 0.14)[k % 4]
            if bar % 4 == 3 and k == 14: S.drum_hit('hat', S.T(bar, b, True), 0.32, -0.25, 0.06, open_=True); continue
            S.drum_hit('hat', S.T(bar, b, True), acc, -0.25, 0.05)
    # melodía (campanita)
    MEL = {0: [(0.5, 69, 1.0), (1.5, 72, 1.0), (3.0, 74, 0.75)], 1: [(0.0, 76, 2.0), (2.5, 74, 0.5), (3.0, 72, 1.0)],
           2: [(0.5, 69, 1.5), (2.5, 72, 0.5), (3.0, 74, 1.0)], 3: [(0.0, 72, 3.0)],
           4: [(0.5, 77, 1.0), (1.5, 76, 0.5), (2.0, 72, 1.5)], 5: [(0.5, 69, 1.5), (2.5, 67, 1.5)],
           6: [(0.0, 77, 2.0), (2.0, 76, 1.0), (3.0, 74, 1.0)], 7: [(0.0, 74, 2.0), (2.5, 72, 1.5)],
           8: [(0.5, 69, 1.0), (2.0, 67, 2.0)], 9: [(0.0, 72, 3.5)]}
    for bar, notes in MEL.items():
        for b, m, d in notes:
            vel = 0.55 if bar in (6, 7) else 0.45
            S.b['lead'].add(S.I.bell(m, d * S.beat, S.v(vel)), S.T(bar, b, True), 1.0, 0.15, 0.45)
            S.b['lead'].add(S.I.bell(m + 12, d * S.beat, S.v(vel * 0.25)), S.T(bar, b, True) + 0.004, 1.0, -0.2, 0.5)
    # entradas producidas
    S.swell(V['Fmaj9'][1], S.T(0, 0, hum=0), 1.6, 0.55)
    S.swell(V['Bbmaj9'][1], S.T(8, 0, hum=0), 1.4, 0.45)
    S.mixdown(out, (None, (31.4, 1.6)))


# ------------------------------------------------------------ 2) Aerosanduche (Re mayor, 80 BPM, guitarra)
def song_aerosanduche(out):
    S = Song(80, 1.5, 22.5, seed=23, swing=0.12); S.ir = room_ir(9, 2.4, 1.8, 0.65)
    V = {'Dmaj9': (50, [57, 61, 64, 66]), 'F#m7': (42, [57, 61, 64, 66]), 'Bm9': (47, [54, 57, 61, 62]),
         'Gmaj9': (43, [54, 57, 59, 62]), 'A7sus': (45, [55, 59, 62, 64])}
    P = {-1: [('A7sus', 2, 2)], 0: [('Dmaj9', 0, 4)], 1: [('F#m7', 0, 4)], 2: [('Bm9', 0, 4)], 3: [('Gmaj9', 0, 4)],
         4: [('Dmaj9', 0, 4)], 5: [('Gmaj9', 0, 2), ('A7sus', 2, 2)], 6: [('Dmaj9', 0, 4)]}
    BASSR = {'Dmaj9': 38, 'F#m7': 42, 'Bm9': 35, 'Gmaj9': 43, 'A7sus': 45}
    for bar, chords in P.items():
        for name, b0, ln in chords:
            gb, up = V[name]
            final = bar == 6
            # fingerpicking en corcheas: pulgar en 1 y 3, dedos arpegiando
            pat = [('b', 0), ('u', 1), ('u', 2), ('u', 3), ('b2', 0), ('u', 2), ('u', 1), ('u', 2)]
            steps = range(int(b0 * 2), int((b0 + ln) * 2))
            for e in steps:
                kind, idx = pat[e % 8]
                if final and e > 0: break
                t = S.T(bar, e * 0.5, True, 0.008)
                ring = (2.2 if kind != 'u' else 1.6) * S.beat
                vel = 0.5 if bar == -1 else 0.62
                if kind == 'b':
                    S.b['keys'].add(S.I.nylon(gb, ring, S.v(vel + 0.08), 0.4), t, 1.0, -0.15, 0.22)
                    S.b['keys'].add(S.I.nylon(up[0], ring, S.v(vel), 0.5), t + 0.006, 1.0, 0.1, 0.22)
                elif kind == 'b2':
                    S.b['keys'].add(S.I.nylon(gb + 7 if gb + 7 <= 52 else gb, ring, S.v(vel), 0.4), t, 1.0, -0.15, 0.22)
                else:
                    S.b['keys'].add(S.I.nylon(up[idx], ring, S.v(vel - 0.08), 0.55), t, 1.0, -0.3 + 0.2 * idx, 0.24)
            if final:   # rasgueo final que queda sonando
                for j, m in enumerate([gb] + up): S.b['keys'].add(S.I.nylon(m, 3.8, S.v(0.55), 0.5), S.T(6, 0, hum=0) + j * 0.03, 1.0, -0.3 + 0.12 * j, 0.35)
            # colchón muy suave
            for m in up[1:]: S.b['pad'].add(S.I.pad(m, ln * S.beat * 0.98, 0.4, 1800), S.T(bar, b0, hum=0), 1.0, 0, 0.4)
            # bajo desde el compás 1
            if bar >= 1:
                r = BASSR[name]
                S.b['bass'].add(S.I.bass(r, (1.6 if not final else 4.0) * S.beat, S.v(0.7)), S.T(bar, b0, hum=0.003))
                if ln == 4 and not final: S.b['bass'].add(S.I.bass(r + 7, 1.4 * S.beat, S.v(0.5)), S.T(bar, 2, hum=0.003))
    # percusión suave desde el compás 1 (primer paso)
    for bar in range(1, 7):
        if bar == 6: S.drum_hit('kick', S.T(6, 0, hum=0.002), 0.6); continue
        S.drum_hit('kick', S.T(bar, 0, hum=0.002), 0.75); S.drum_hit('kick', S.T(bar, 2.5, True, 0.002), 0.5)
        for b in (1, 3): S.drum_hit('rim', S.T(bar, b, hum=0.004), 0.5, 0.15, 0.1)
        for k in range(8): S.drum_hit('shaker', S.T(bar, k * 0.5, True), (0.3, 0.18)[k % 2], 0.35, 0.05)
    # melodía en piano de fieltro (desde el compás 2)
    MEL = {2: [(0.5, 78, 1.0), (1.5, 76, 0.5), (2.0, 74, 2.0)], 3: [(0.5, 71, 1.0), (1.5, 74, 1.0), (3.0, 69, 1.0)],
           4: [(0.0, 78, 2.0), (2.5, 76, 1.5)], 5: [(0.5, 74, 1.5), (2.0, 76, 2.0)], 6: [(0.0, 78, 4.0)]}
    for bar, notes in MEL.items():
        for b, m, d in notes:
            S.b['lead'].add(S.I.felt(m, d * S.beat, S.v(0.5)), S.T(bar, b, True), 1.0, 0.12, 0.4)
    S.swell([62, 66, 69, 73], S.T(1, 0, hum=0), 1.4, 0.4)
    S.mixdown(out, (None, (20.9, 1.6)), duck=(0.12, 0.3, 0.15), lead_gain=1.25, keys_gain=0.95)


# ------------------------------------------------------------ 3) Cómo llegar (Do mayor, 72 BPM, piano de fieltro)
def song_llegar(out):
    BAR = 60 / 72 * 4
    S = Song(72, 0.0, 10 * BAR, seed=37, swing=0.14); S.ir = room_ir(13, 3.0, 2.4, 0.8)
    V = {'Cmaj9': ([36, 43], [59, 62, 64, 67]), 'Em7': ([40, 47], [59, 62, 64, 67]), 'Am9': ([45, 52], [55, 59, 60, 64]),
         'Fmaj7': ([41, 48], [57, 60, 64, 67]), 'Dm9': ([38, 45], [53, 57, 60, 64]), 'G13sus': ([43, 50], [53, 57, 60, 64]),
         'G9sus': ([43, 50], [53, 57, 60, 62]), 'Fmaj9': ([41, 48], [57, 60, 64, 67])}
    P = {0: [('Cmaj9', 0, 4)], 1: [('Em7', 0, 4)], 2: [('Am9', 0, 4)], 3: [('Fmaj7', 0, 4)], 4: [('Cmaj9', 0, 4)],
         5: [('Em7', 0, 4)], 6: [('Am9', 0, 4)], 7: [('Dm9', 0, 2), ('G13sus', 2, 2)], 8: [('Fmaj9', 0, 2), ('G9sus', 2, 2)],
         9: [('Cmaj9', 0, 4)]}
    for bar, chords in P.items():
        for name, b0, ln in chords:
            lh, rh = V[name]; t0 = S.T(bar, b0, hum=0.004)
            final = bar == 9
            # mano izquierda: bajo + quinta; mano derecha: acorde arpegiado suave
            for j, m in enumerate(lh): S.b['keys'].add(S.I.felt(m, (ln - 0.1) * S.beat if not final else 5.0, S.v(0.5)), t0 + j * 0.025, 1.0, -0.2, 0.3)
            for j, m in enumerate(rh): S.b['keys'].add(S.I.felt(m, min(ln, 3) * S.beat if not final else 5.0, S.v(0.38)), t0 + 0.05 + j * 0.045, 1.0, -0.1 + 0.12 * j, 0.35)
            if ln == 4 and not final:
                for j, m in enumerate(rh[1:3]): S.b['keys'].add(S.I.felt(m, 1.3 * S.beat, S.v(0.3)), S.T(bar, 2.5, True) + j * 0.03, 1.0, 0.1, 0.35)
            # colchón (más presente en la intro y en el cierre)
            pv = 0.55 if bar in (0, 8, 9) else 0.4
            for m in rh[:3]: S.b['pad'].add(S.I.pad(m, ln * S.beat * 0.98 if not final else 4.0, pv, 1600), t0, 1.0, 0, 0.45)
            # Rhodes de apoyo en las tomas (compases 5–8)
            if 5 <= bar <= 8: S.chord('rhodes', rh, S.T(bar, b0 + 0.02, hum=0), (ln - 0.2) * S.beat, 0.4, roll=0.02, send=0.35, gain=0.6)
            # bajo desde el compás 1
            if bar >= 1:
                S.b['bass'].add(S.I.bass(lh[0], (1.8 if not final else 4.5) * S.beat, S.v(0.62)), t0)
                if ln == 4 and not final: S.b['bass'].add(S.I.bass(lh[0] + 7, 1.2 * S.beat, S.v(0.45)), S.T(bar, 2.5, True))
    # latido suave desde el compás 1
    for bar in range(1, 10):
        if bar == 9: S.drum_hit('kick', S.T(9, 0, hum=0.002), 0.55); continue
        S.drum_hit('kick', S.T(bar, 0, hum=0.002), 0.7); S.drum_hit('kick', S.T(bar, 2.5, True, 0.002), 0.45)
        for b in (1, 3): S.drum_hit('snare', S.T(bar, b, hum=0.004), 0.38, 0.05, 0.14, brush=True)
        for k in range(16):
            S.drum_hit('shaker' if bar < 5 else 'hat', S.T(bar, k * 0.25, True), (0.26, 0.1, 0.18, 0.1)[k % 4], 0.3, 0.05)
    MEL = {1: [(1.0, 76, 1.0), (2.0, 79, 1.0), (3.0, 74, 1.0)], 2: [(0.0, 76, 2.0), (2.5, 72, 0.5), (3.0, 74, 1.0)],
           3: [(0.5, 69, 1.5), (2.0, 72, 2.0)], 4: [(0.0, 74, 2.0), (2.5, 76, 1.5)], 5: [(1.0, 79, 1.0), (2.0, 76, 2.0)],
           6: [(0.5, 81, 1.0), (1.5, 79, 1.0), (2.5, 76, 1.5)], 7: [(0.0, 77, 2.0), (2.0, 76, 1.0), (3.0, 74, 1.0)],
           8: [(0.0, 72, 2.0), (2.0, 74, 2.0)], 9: [(0.0, 76, 4.0)]}
    for bar, notes in MEL.items():
        for b, m, d in notes:
            S.b['lead'].add(S.I.felt(m, d * S.beat, S.v(0.55)), S.T(bar, b, True), 1.0, 0.1, 0.4)
    S.swell([59, 64, 67, 71], S.T(1, 0, hum=0), 1.6, 0.45)
    S.swell([57, 60, 64, 69], S.T(5, 0, hum=0), 1.4, 0.35)
    S.mixdown(out, (None, (31.6, 1.7)), duck=(0.15, 0.3, 0.15), lead_gain=1.3, keys_gain=0.95)


# ------------------------------------------------------------ 4) Gavilán (Sol mayor, 88,9 BPM: compás = 2,7 s = 1 paso)
def song_gavilan(out):
    S = Song(88.889, 1.62, 25.92, seed=51, swing=0.15); S.ir = room_ir(21, 2.5, 2.0, 0.7)
    V = {'Gmaj9': (43, [59, 62, 66, 69]), 'Em9': (40, [55, 59, 62, 66]), 'Cmaj9': (36, [55, 59, 62, 64]),
         'D9sus': (38, [57, 60, 64, 67]), 'Bm7': (47, [57, 62, 66, 69])}
    P = {0: [('Gmaj9', 0, 4)], 1: [('Gmaj9', 0, 4)], 2: [('Em9', 0, 4)], 3: [('Cmaj9', 0, 4)],
         4: [('D9sus', 0, 2), ('Bm7', 2, 2)], 5: [('Em9', 0, 2), ('D9sus', 2, 2)], 6: [('Gmaj9', 0, 4)],
         7: [('Cmaj9', 0, 4)], 8: [('Gmaj9', 0, 4)]}
    for bar, chords in P.items():
        for name, b0, ln in chords:
            root, notes = V[name]; t0 = S.T(bar, b0); final = bar == 8
            if final:
                S.chord('rhodes', notes, t0, 5.0, 0.5, roll=0.05, send=0.4)
                S.b['bass'].add(S.I.bass(root, 4.5, 0.55), t0)
            else:
                S.chord('rhodes', notes, t0, min(ln, 2.8) * S.beat, 0.6, roll=0.012)
                if ln == 4: S.chord('rhodes', notes[1:], S.T(bar, 2.5, swing=True), 1.1 * S.beat, 0.4, roll=0.01)
                if bar >= 1:
                    S.b['bass'].add(S.I.bass(root, 1.4 * S.beat, S.v(0.75)), t0)
                    if ln == 4:
                        S.b['bass'].add(S.I.bass(root + 7, 0.8 * S.beat, S.v(0.5)), S.T(bar, 1.5, True))
                        S.b['bass'].add(S.I.bass(root + 12, 0.45 * S.beat, S.v(0.45)), S.T(bar, 2.5, True))
                    else:
                        S.b['bass'].add(S.I.bass(root + 7, 0.45 * S.beat, S.v(0.5)), S.T(bar, b0 + 1.5, True))
            for m in notes[:3]: S.b['pad'].add(S.I.pad(m, ln * S.beat * 0.98 if not final else 4.5, 0.45, 2000), t0, 1.0, 0, 0.4)
            # guitarra apagada (chops) a contratiempo en los pasos y el resultado
            if 2 <= bar <= 6:
                for b in (0.5, 1.5, 2.25, 3.0):
                    if b0 <= b < b0 + ln:
                        for j, m in enumerate(notes[1:4]): S.b['keys'].add(S.I.nylon(m + 12, 0.16, S.v(0.5), 0.9), S.T(bar, b, True) + j * 0.007, 0.8, -0.3 + 0.3 * j, 0.15)
    for bar in range(0, 9):
        if bar == 8: S.drum_hit('kick', S.T(8, 0, hum=0.002), 0.6); continue
        if bar == 0 or bar == 7:
            for k in range(8): S.drum_hit('shaker', S.T(bar, k * 0.5, True), 0.14 + 0.08 * (k % 2), 0.3)
            continue
        S.drum_hit('kick', S.T(bar, 0, hum=0.002), 0.78); S.drum_hit('kick', S.T(bar, 2.5, True, 0.002), 0.55)
        if bar % 2: S.drum_hit('kick', S.T(bar, 1.75, True, 0.002), 0.3)
        for b in (1, 3): S.drum_hit('snare', S.T(bar, b, hum=0.004), 0.5, 0.05, 0.12, brush=True)
        for k in range(16):
            S.drum_hit('hat', S.T(bar, k * 0.25, True), (0.4, 0.13, 0.25, 0.13)[k % 4], -0.25, 0.05)
    MEL = {2: [(0.5, 74, 1.0), (1.5, 71, 1.0), (3.0, 79, 1.0)], 3: [(0.0, 76, 2.0), (2.5, 74, 1.5)],
           4: [(0.5, 72, 1.0), (2.0, 76, 1.5)], 5: [(0.5, 79, 1.0), (2.0, 76, 2.0)],
           6: [(0.0, 79, 2.0), (2.0, 76, 1.0), (3.0, 74, 1.0)], 7: [(0.5, 72, 1.5), (2.5, 74, 1.5)], 8: [(0.0, 71, 3.5)]}
    for bar, notes in MEL.items():
        for b, m, d in notes:
            S.b['lead'].add(S.I.bell(m, d * S.beat, S.v(0.5)), S.T(bar, b, True), 1.0, 0.15, 0.45)
            S.b['lead'].add(S.I.bell(m + 12, d * S.beat, S.v(0.12)), S.T(bar, b, True) + 0.004, 1.0, -0.2, 0.5)
    S.swell(V['Gmaj9'][1], S.T(0, 0, hum=0), 1.6, 0.5)
    S.mixdown(out, (None, (24.3, 1.6)), duck=(0.3, 0.33, 0.17))


if __name__ == '__main__':
    {'menu': song_menu, 'aerosanduche': song_aerosanduche, 'llegar': song_llegar, 'gavilan': song_gavilan}[sys.argv[1]](sys.argv[2])
    print('ok', sys.argv[1], sys.argv[2])
