# Sonido de la promo: aviso "ding-dong" de aeropuerto + traqueteo de las letras del tablero + pasos de avión.
import numpy as np, wave, sys
SR=48000; DUR=18.5; N=int(SR*DUR); L=np.zeros(N); R=np.zeros(N); rng=np.random.default_rng(5)
def add(sig,t,g=1.0,pan=0.0):
    i=int(t*SR); s=sig[:max(0,N-i)]*g; L[i:i+len(s)]+=s*np.sqrt((1-pan)/2); R[i:i+len(s)]+=s*np.sqrt((1+pan)/2)
def env(n,a,d): t=np.arange(n)/SR; return (1-np.exp(-t/a))*np.exp(-t/d)
def lp(x,fc):
    y=np.zeros_like(x); a=1-np.exp(-2*np.pi*fc/SR); s=0.0
    for i in range(len(x)): s+=a*(x[i]-s); y[i]=s
    return y
def flap():   # golpecito plástico corto
    n=int(.025*SR); x=rng.normal(0,1,n)*env(n,.0003,.004); t=np.arange(n)/SR
    return x*0.5+np.sin(2*np.pi*(1400+rng.uniform(-200,200))*t)*env(n,.0002,.003)*0.5
def chime(f,d=1.1):
    n=int(d*SR); t=np.arange(n)/SR; y=0
    for k,a in [(1,1),(2,.35),(3,.12),(4.2,.05)]: y=y+a*np.sin(2*np.pi*f*k*t)*env(n,.005,.45/k**0.3)
    return y
def swoosh(d,g=1):
    n=int(d*SR); x=rng.normal(0,1,n); t=np.linspace(0,1,n); y=lp(x,1800)-lp(x,300); return y/np.abs(y).max()*np.sin(np.pi*t)**2*g
def rattle(t0,nch,step,spread):
    end=t0+0.25+nch*step+spread; t=t0
    while t<end:
        u=(t-t0)/(end-t0); add(flap(),t,0.32*(1-0.7*u),rng.uniform(-0.5,0.5)); t+=1/38*(1+rng.uniform(-.3,.3))*(1+u*1.5)
# aviso de aeropuerto
add(chime(659.25),0.02,0.28); add(chime(523.25,1.4),0.42,0.28)
rattle(0.3,14,0.028,0.5); rattle(0.75,14,0.028,0.5)
B0=3.1
for t0,n in [(B0+.35,5),(B0+.45,15),(B0+.85,5),(B0+.95,18)]: rattle(t0,n,0.028,0.3 if n==5 else 0.5)
add(swoosh(1.4,0.10),B0+3.0)
for i in range(4): rattle(8.3+i*1.5-0.02,14,0.02,0.25)
D0=14.3
add(chime(659.25),D0+0.02,0.22); add(chime(523.25,1.4),D0+0.42,0.22)
rattle(D0+0.2,11,0.028,0.5); add(swoosh(1.6,0.09),D0+0.7)
st=np.stack([L,R],1); st*=0.5/np.abs(st).max()
with wave.open(sys.argv[1],'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st*32767).astype('<i2').tobytes())
print('ok')
