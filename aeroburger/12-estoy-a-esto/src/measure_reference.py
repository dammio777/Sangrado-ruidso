"""Mide la FORMA de la referencia (captura de la lámina 1) y exporta, por pieza (mano verde, puño blanco, manga roja),
mapas para el render: máscara, normales (de la máscara suavizada), flujo del pelo (a lo largo de los dedos), espesor y borde difuso.
Solo se usa la silueta; el pelo, la luz y los colores los pinta hand3.html.   Uso: python measure_reference.py captura.jpg"""
import sys, numpy as np
from PIL import Image, ImageFilter
Y0, Y1 = 285, 1605
a = np.asarray(Image.open(sys.argv[1]).convert('RGB')).astype(np.float32)[Y0:Y1]; H, W, _ = a.shape
r, g, b = a[..., 0], a[..., 1], a[..., 2]; mx = a.max(2); sat = (mx - a.min(2)) / (mx + 1e-6)
def blur(arr, s):
    im = Image.fromarray((np.clip(arr, 0, 1) * 255).astype(np.uint8)); return np.asarray(im.filter(ImageFilter.GaussianBlur(s))).astype(np.float32) / 255
def largest(mask):
    lab = np.zeros(mask.shape, np.int32); n = 0; sizes = {}
    for y0 in range(H):
        for x0 in range(W):
            if mask[y0, x0] and lab[y0, x0] == 0:
                n += 1; st = [(y0, x0)]; lab[y0, x0] = n; c = 0
                while st:
                    y, x = st.pop(); c += 1
                    for dy, dx in ((1,0),(-1,0),(0,1),(0,-1)):
                        yy, xx = y + dy, x + dx
                        if 0 <= yy < H and 0 <= xx < W and mask[yy, xx] and lab[yy, xx] == 0: lab[yy, xx] = n; st.append((yy, xx))
                sizes[n] = c
    return lab == max(sizes, key=sizes.get)
def close(m, s=4): return blur((blur(m.astype(np.float32), s) > 0.3).astype(np.float32), s) > 0.5
green = (g > r * 0.92) & (g > b * 1.5) & (sat > 0.38) & (mx > 55)
hand = close(largest(green), 5)
red = (r > 95) & (g < 90) & (b < 90) & (r > g * 1.8); sleeve = largest(close(red, 6))
bgc = np.array([241, 227, 219.]); d = np.sqrt(((a - bgc) ** 2).sum(2))
box = np.zeros((H, W), bool); box[520:1320, 0:530] = True
cuff = close(((d > 12) & box & ~(blur(green.astype(np.float32), 5) > 0.05)).astype(np.float32), 10) & ~sleeve
cuff = largest(cuff)
def export(name, m, default_dir, use_tangent):
    m = blur(m.astype(np.float32), 2.0); m = np.clip((m - 0.5) * 6 + 0.5, 0, 1)
    Image.fromarray((m * 255).astype(np.uint8)).save(f'assets/{name}_mask.png')
    Image.fromarray((blur(m, 6) * 255).astype(np.uint8)).save(f'assets/{name}_fuzz.png')
    Image.fromarray((blur(m, 9) * 255).astype(np.uint8)).save(f'assets/{name}_thick.png')
    h = blur(m, 13); gy, gx = np.gradient(h); k = 55.0
    nx, ny = -gx * k, -gy * k; nz = np.sqrt(np.clip(1 - nx**2 - ny**2, 0.05, 1)); L = np.sqrt(nx**2 + ny**2 + nz**2)
    Image.fromarray((np.stack([nx / L, ny / L, nz / L], -1) * .5 + .5).clip(0, 1).__mul__(255).astype(np.uint8)).save(f'assets/{name}_nrm.png')
    h2 = blur(m, 5); gy2, gx2 = np.gradient(h2); mag = np.hypot(gx2, gy2); tx, ty = -gy2, gx2; l = np.hypot(tx, ty) + 1e-9; tx, ty = tx / l, ty / l
    flip = (tx * 0.8 + ty * -0.6) < 0; tx = np.where(flip, -tx, tx); ty = np.where(flip, -ty, ty)
    conf = np.clip((mag - 0.004) / 0.014, 0, 1) * m * (1 if use_tangent else 0)
    fx = tx * conf + default_dir[0] * (1 - conf); fy = ty * conf + default_dir[1] * (1 - conf)
    for _ in range(3): fx = blur(fx * .5 + .5, 6) * 2 - 1; fy = blur(fy * .5 + .5, 6) * 2 - 1
    l = np.hypot(fx, fy) + 1e-9; fx, fy = fx / l, fy / l
    Image.fromarray((np.stack([fx * .5 + .5, fy * .5 + .5, conf], -1) * 255).astype(np.uint8)).save(f'assets/{name}_flow.png')
    ys, xs = np.where(m > .5); print(name, 'caja', xs.min(), ys.min(), xs.max(), ys.max(), 'área', int((m > .5).sum()))
export('hand', hand | (blur(cuff.astype(np.float32), 8) > .5) & (blur(hand.astype(np.float32), 14) > .35), (0.35, -0.94), True)
export('cuff', blur(cuff.astype(np.float32), 5) > .4, (0.62, -0.78), False)
export('sleeve', sleeve, (0.7, -0.7), False)
vis = np.zeros((H, W, 3), np.uint8); vis[...] = (246, 234, 223); vis[sleeve] = (190, 15, 25); vis[cuff] = (235, 235, 235); vis[hand] = (110, 160, 30)
Image.fromarray(vis).resize((W // 2, H // 2)).save('out/mask_check.png')
