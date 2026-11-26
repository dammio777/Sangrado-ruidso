"""Super-resolución x4 (Real-ESRGAN compacto vía ONNX Runtime) de un recorte de una imagen.
Uso: python sr_still.py modelo.onnx entrada.png salida.png cx cy cw ch"""
import sys, numpy as np, onnxruntime as ort
from PIL import Image
model, src, out, cx, cy, cw, ch = sys.argv[1], sys.argv[2], sys.argv[3], *map(int, sys.argv[4:8])
so = ort.SessionOptions(); so.intra_op_num_threads = 4
sess = ort.InferenceSession(model, so, providers=['CPUExecutionProvider'])
im = Image.open(src).convert('RGB').crop((cx, cy, cx + cw, cy + ch))
x = np.asarray(im, np.float32).transpose(2, 0, 1)[None] / 255
y = sess.run(None, {'input': x})[0][0].transpose(1, 2, 0)
Image.fromarray((np.clip(y, 0, 1) * 255 + .5).astype(np.uint8)).save(out)
print('listo', out, y.shape[1], 'x', y.shape[0])
