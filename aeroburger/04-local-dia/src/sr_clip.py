"""Super-resolución con IA (Real-ESRGAN compacto vía ONNX Runtime) de un tramo de video.
Lee fotogramas con ffmpeg, recorta la región útil, escala x4 con la red, reduce a 990x1386 (lanczos)
y escribe un intermedio casi sin pérdida listo para la estabilización.
Uso: python sr_clip.py modelo.onnx video.mp4 inicio n_frames cx cy cw ch salida.mp4
"""
import sys, subprocess, numpy as np, onnxruntime as ort, time
from PIL import Image
model, src, ss, n, cx, cy, cw, ch, out = sys.argv[1:10]
n, cx, cy, cw, ch = int(n), int(cx), int(cy), int(cw), int(ch)
so = ort.SessionOptions(); so.intra_op_num_threads = 4
sess = ort.InferenceSession(model, so, providers=['CPUExecutionProvider'])
dec = subprocess.Popen(['ffmpeg', '-nostdin', '-v', 'error', '-ss', ss, '-i', src, '-vf', f'fps=60,crop={cw}:{ch}:{cx}:{cy}',
                        '-frames:v', str(n), '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
enc = subprocess.Popen(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', '990x1386', '-r', '60', '-i', '-',
                        '-c:v', 'libx264', '-crf', '4', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', out], stdin=subprocess.PIPE)
fs = cw * ch * 3; t0 = time.time(); k = 0
while True:
    b = dec.stdout.read(fs)
    if len(b) < fs: break
    x = np.frombuffer(b, np.uint8).reshape(ch, cw, 3).astype(np.float32).transpose(2, 0, 1)[None] / 255
    y = sess.run(None, {'input': x})[0][0].transpose(1, 2, 0)
    im = Image.fromarray((np.clip(y, 0, 1) * 255 + .5).astype(np.uint8)).resize((990, 1386), Image.LANCZOS)
    enc.stdin.write(im.tobytes()); k += 1
    if k % 20 == 0: print(f'{out}: {k}/{n}  {time.time()-t0:.0f}s', flush=True)
enc.stdin.close(); enc.wait(); print('listo', out, k)
