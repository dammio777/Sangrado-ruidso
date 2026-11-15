# Efectos sutiles sintetizados para el video de la Airbus (sin música).
import numpy as np, wave, sys
SR=48000; DUR=19.5; N=int(SR*DUR)
L=np.zeros(N); R=np.zeros(N); rng=np.random.default_rng(3)
def add(sig,t,g=1.0,pan=0.0):
    i=int(t*SR); s=sig[:max(0,N-i)]*g
    L[i:i+len(s)]+=s*np.sqrt((1-pan)/2); R[i:i+len(s)]+=s*np.sqrt((1+pan)/2)
def env(n,a,d):  # ataque/decay exponenciales
    t=np.arange(n)/SR; return (1-np.exp(-t/a))*np.exp(-t/d)
def lp(x,fc):    # paso bajo de 1 polo, fc puede variar
    fc=np.broadcast_to(fc,x.shape); y=np.zeros_like(x); a=1-np.exp(-2*np.pi*fc/SR); s=0.0
    for i in range(len(x)): s+=a[i]*(x[i]-s); y[i]=s
    return y
def hp(x,fc): return x-lp(x,fc)
def pop():
    n=int(.25*SR); t=np.arange(n)/SR; f=520*np.exp(-t*18)+180
    return np.sin(2*np.pi*np.cumsum(f)/SR)*env(n,.002,.06)*0.9
def swoosh(d,f0,f1,g=1):
    n=int(d*SR); x=rng.normal(0,1,n); t=np.linspace(0,1,n)
    fc=f0*(f1/f0)**t; y=lp(hp(x,300),fc); e=np.sin(np.pi*t)**2
    return y*e*g/ (np.abs(y).max()+1e-9)
def key():
    n=int(.05*SR); x=hp(rng.normal(0,1,n),2500)*env(n,.0005,.008)
    return x/np.abs(x).max()*0.5 + np.sin(2*np.pi*1800*np.arange(n)/SR)*env(n,.0003,.004)*0.2
def tap():
    n=int(.09*SR); t=np.arange(n)/SR
    return (np.sin(2*np.pi*900*t)*env(n,.0005,.012)*0.6 + hp(rng.normal(0,1,n),1500)*env(n,.0003,.004)*0.25)
def click_deep():
    n=int(.18*SR); t=np.arange(n)/SR; f=220*np.exp(-t*25)+90
    return np.sin(2*np.pi*np.cumsum(f)/SR)*env(n,.001,.05) + hp(rng.normal(0,1,n),2000)*env(n,.0003,.005)*0.3
def riser(d):
    n=int(d*SR); x=rng.normal(0,1,n); t=np.linspace(0,1,n)
    y=lp(hp(x,200),300*(30**t)); y/=np.abs(y).max(); e=t**2.2*(1-np.exp(-(1-t)*60))
    sub=np.sin(2*np.pi*np.cumsum(40+50*t)/SR)*t**2*0.5
    return y*e*0.8+sub
def impact():
    n=int(1.2*SR); t=np.arange(n)/SR; f=70*np.exp(-t*3)+38
    return np.sin(2*np.pi*np.cumsum(f)/SR)*env(n,.003,.35)*0.9 + lp(rng.normal(0,1,n),1200)*env(n,.001,.12)*0.25
def chime():
    n=int(2.4*SR); t=np.arange(n)/SR; y=0
    for f,a in [(659.25,1),(987.77,.6),(1318.5,.35),(1975.5,.12)]:
        y=y+a*np.sin(2*np.pi*f*t)*env(n,.004,.55+0.3/a*0.3)
    return y*0.35
add(impact(),0.45,0.22)
add(swoosh(.5,500,3800),0.40,0.12)
import math
for i in range(14):                      # ticks del contador 0→400 (se desaceleran)
    u=i/13; add(key(),3.05+0.9*(1-(1-u)**(1/3)) ,0.22)
add(swoosh(.6,3500,500),4.78,0.14)
for i in range(4): add(tap(),5.30+i*0.14,0.30,(i-1.5)*0.15)
add(swoosh(.5,400,3500),7.85,0.13)
add(swoosh(.6,3500,500),13.65,0.12)
add(impact(),14.75,0.20)
add(pop(),15.30,0.30)
st=np.stack([L,R],1); st*=0.5/ max(1e-9,np.abs(st).max())   # pico a -6 dBFS: quedan bajo la música
with wave.open(sys.argv[1],'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st*32767).astype('<i2').tobytes())
print('ok')
