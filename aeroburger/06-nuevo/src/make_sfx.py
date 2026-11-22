# Sonido: pop de entrada, pase de página por plato, crepitar de chimenea, campanita al final.
import numpy as np, wave, sys
SR=48000; DUR=24.6; N=int(SR*DUR); L=np.zeros(N); R=np.zeros(N); rng=np.random.default_rng(11)
def add(sig,t,g=1.0,pan=0.0):
    i=int(t*SR); s=sig[:max(0,N-i)]*g; L[i:i+len(s)]+=s*np.sqrt((1-pan)/2); R[i:i+len(s)]+=s*np.sqrt((1+pan)/2)
def env(n,a,d): t=np.arange(n)/SR; return (1-np.exp(-t/a))*np.exp(-t/d)
def onepole(x,fc):
    y=np.zeros_like(x); a=1-np.exp(-2*np.pi*fc/SR); s=0.0
    for i in range(len(x)): s+=a*(x[i]-s); y[i]=s
    return y
def pop():
    n=int(.25*SR); t=np.arange(n)/SR; f=520*np.exp(-t*18)+180; return np.sin(2*np.pi*np.cumsum(f)/SR)*env(n,.002,.06)
def page():   # roce de papel: ruido filtrado con envolvente rápida
    n=int(.42*SR); x=rng.normal(0,1,n); y=x-onepole(x,900); y=onepole(y,6000); t=np.linspace(0,1,n)
    e=np.sin(np.pi*t**0.7)**2*(1+0.6*np.sin(2*np.pi*t*9)*np.exp(-t*3)); y=y*e; return y/np.abs(y).max()
def crackle(d):
    n=int(d*SR); out=onepole(rng.normal(0,1,n),500)*0.25
    k=0
    while k<n:
        m=int(.004*SR); 
        if k+m<n: out[k:k+m]+=rng.normal(0,1,m)*env(m,.0001,.0012)*rng.uniform(.3,1.2)
        k+=int(SR*rng.exponential(.045))
    t=np.linspace(0,1,n); return out/np.abs(out).max()*np.minimum(1,np.minimum(t*6,(1-t)*5))
def chime():
    n=int(2.2*SR); t=np.arange(n)/SR; y=0
    for f,a in [(659.25,1),(987.77,.5),(1318.5,.25)]: y=y+a*np.sin(2*np.pi*f*t)*env(n,.004,.6)
    return y
add(pop(),0.08,0.5)
I0,ID=2.6,2.1
for i in range(6): add(page(),I0+i*ID-0.48,0.35,0.3 if i%2 else -0.3)
F0=I0+6*ID; M0=F0+2*ID
add(crackle(4.4),F0-0.1,0.55)
add(page(),M0-0.1,0.25)
add(chime(),M0+1.1,0.30)
st=np.stack([L,R],1); st*=0.5/np.abs(st).max()
with wave.open(sys.argv[1],'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st*32767).astype('<i2').tobytes())
print('ok')
