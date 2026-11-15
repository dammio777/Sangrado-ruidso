# Genera la portada pop-art (homenaje) con fotogramas del local y la versión duotono del cuadrante TL.
import sys, numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
P = sys.argv[1]
S = 1200; STRIP = 168; QW = (S - STRIP)//2; QH = S//2          # 516 x 600 -> aspecto 0.86
REVEAL_Y = 120                                                     # region del frame 1080x1920 que mapea al cuadrante TL
def hexc(h): return np.array([int(h[i:i+2],16) for i in (1,3,5)], float)
def duotone(im, dark, light, mid=None):
    a = np.asarray(im.convert('L'), float)
    lo, hi = np.percentile(a, 3), np.percentile(a, 97)
    x = np.clip((a-lo)/(hi-lo+1e-6), 0, 1)
    x = x*x*(3-2*x)                                               # contraste en S
    x = np.round(x*5)/5*0.55 + x*0.45                             # algo de posterizado
    d, l = hexc(dark), hexc(light)
    out = d[None,None,:]*(1-x[...,None]) + l[None,None,:]*x[...,None]
    if mid is not None:                                           # toque de tercer color en medios tonos
        w = np.exp(-((x-0.5)/0.16)**2)[...,None]*0.45
        out = out*(1-w) + hexc(mid)[None,None,:]*w
    n = np.random.default_rng(7).normal(0, 6, out.shape)          # grano de impresión
    return Image.fromarray(np.clip(out+n,0,255).astype(np.uint8))
def gradmap(im, stops, lo_p=2, hi_p=99.8, gamma=0.85):
    # mapa de degradado multi-tono que conserva detalle en las luces (logo del letrero legible)
    im = im.filter(ImageFilter.UnsharpMask(radius=2, percent=60, threshold=2))
    a = np.asarray(im.convert('L'), float)
    lo, hi = np.percentile(a, lo_p), np.percentile(a, hi_p)
    x = np.clip((a-lo)/(hi-lo+1e-6), 0, 1)**gamma
    pos = np.array([p for p,_ in stops]); cols = np.array([hexc(c) for _,c in stops])
    out = np.stack([np.interp(x, pos, cols[:,k]) for k in range(3)], -1)
    n = np.random.default_rng(7).normal(0, 4, out.shape)
    return Image.fromarray(np.clip(out+n,0,255).astype(np.uint8))
def crop_aspect(im, asp, cy=None):
    w, h = im.size; ch = int(w/asp)
    y0 = (h-ch)//2 if cy is None else cy
    return im.crop((0, y0, w, y0+ch))
f = lambda c,n: Image.open(f'{P}/frames/{c}/{n:04d}.jpg').convert('RGB')
asp = QW/QH
q = {
 'TL': gradmap(crop_aspect(f('c1',1), asp, REVEAL_Y), [(0,'#161a6b'),(0.18,'#23288f'),(0.42,'#c2306a'),(0.62,'#ff9f2e'),(0.80,'#ffd23f'),(1.0,'#fff6dc')]),
 'TR': duotone(crop_aspect(f('c3',30), asp), '#7a0f3c', '#ffd6e0', '#e8407a'),
 'BL': duotone(crop_aspect(f('c4',90), asp), '#141e6e', '#9ccaff', '#f28cb1'),
 'BR': duotone(crop_aspect(f('c6',40), asp), '#2a1460', '#ffb8cc', '#6aa8ff'),
}
q['TL'].save(f'{P}/assets/reveal_tl.png')                      # tamaño completo para el match-cut
cov = Image.new('RGB', (S,S), '#ffffff')
for k,(x,y) in {'TL':(0,0),'TR':(QW,0),'BL':(0,QH),'BR':(QW,QH)}.items():
    cov.paste(q[k].resize((QW,QH), Image.LANCZOS), (x,y))
d = ImageDraw.Draw(cov)
d.rectangle((2*QW,0,S,S//2), fill='#9ccaff'); d.rectangle((2*QW,S//2,S,S), fill='#ffd23f')
# texto vertical
txt = Image.new('RGBA', (S, STRIP), (0,0,0,0)); td = ImageDraw.Draw(txt)
fb = ImageFont.truetype('/usr/share/fonts/opentype/inter/InterDisplay-Black.otf', 124)
fs = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf', 24)
t1 = 'AERO BURGER'; bb = td.textbbox((0,0), t1, font=fb)
td.text(((S-(bb[2]-bb[0]))//2 - bb[0], 46 - bb[1]), t1, font=fb, fill='#e3262f')
small = '  '.join('sin documentos'); sb = td.textbbox((0,0), small, font=fs)
td.text(((S-(sb[2]-sb[0]))//2, 8), small, font=fs, fill='#1c1f78')
cov.paste(txt.rotate(-90, expand=True), (2*QW, 0), txt.rotate(-90, expand=True))
cov.save(f'{P}/assets/cover.png')
print('ok', q['TL'].size)
