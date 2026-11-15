"""Convierte los pesos de Real-ESRGAN (SRVGGNetCompact, realesr-general-x4v3) a ONNX sin PyTorch.
- Lee el .pth (zip de pickle) con un unpickler restringido: solo permite reconstruir tensores.
- Mezcla opcional con el modelo "wdn" (menos eliminación de ruido) como en Real-ESRGAN (dni).
Uso: python sr_build_onnx.py general.pth wdn.pth mezcla salida.onnx
"""
import sys, zipfile, pickle, io, collections
import numpy as np
import onnx
from onnx import helper, TensorProto, numpy_helper

DT = {'FloatStorage': np.float32, 'HalfStorage': np.float16, 'DoubleStorage': np.float64, 'LongStorage': np.int64}

def load_pth(path):
    z = zipfile.ZipFile(path)
    pkl = [n for n in z.namelist() if n.endswith('data.pkl')][0]
    root = pkl[:-len('data.pkl')]
    class StorageRef:
        def __init__(self, dtype, key): self.dtype, self.key = dtype, key
    def rebuild(storage, offset, size, stride, *a):
        buf = np.frombuffer(z.read(f'{root}data/{storage.key}'), dtype=storage.dtype)
        n = int(np.prod(size)) if len(size) else 1
        if not len(size): return buf[offset].copy()
        return np.lib.stride_tricks.as_strided(buf[offset:], shape=tuple(size),
                                               strides=tuple(s * buf.itemsize for s in stride)).copy()
    class U(pickle.Unpickler):
        def find_class(self, mod, name):
            if mod == 'torch._utils' and name == '_rebuild_tensor_v2': return rebuild
            if mod == 'collections' and name == 'OrderedDict': return collections.OrderedDict
            if mod == 'torch' and name in DT: return name
            raise pickle.UnpicklingError(f'no permitido: {mod}.{name}')
        def persistent_load(self, pid):
            _, stype, key, _loc, _n = pid
            return StorageRef(DT[stype], key)
    obj = U(io.BytesIO(z.read(pkl))).load()
    return obj.get('params', obj)

a = load_pth(sys.argv[1]); b = load_pth(sys.argv[2]); mix = float(sys.argv[3])   # mix=1 -> solo general
sd = {k: (mix * a[k] + (1 - mix) * b[k]).astype(np.float32) for k in a}
idx = sorted({int(k.split('.')[1]) for k in sd})
nodes, inits = [], []
x = 'input'
for i in idx:
    w = sd[f'body.{i}.weight']
    if w.ndim == 4:
        inits += [numpy_helper.from_array(w, f'w{i}'), numpy_helper.from_array(sd[f'body.{i}.bias'], f'b{i}')]
        nodes.append(helper.make_node('Conv', [x, f'w{i}', f'b{i}'], [f'c{i}'], pads=[1, 1, 1, 1], kernel_shape=[3, 3])); x = f'c{i}'
    else:  # PReLU por canal
        inits.append(numpy_helper.from_array(w.reshape(-1, 1, 1), f'p{i}'))
        nodes.append(helper.make_node('PRelu', [x, f'p{i}'], [f'a{i}'])); x = f'a{i}'
nodes.append(helper.make_node('DepthToSpace', [x], ['ps'], blocksize=4, mode='CRD'))
inits.append(numpy_helper.from_array(np.array([1, 1, 4, 4], np.float32), 'scales'))
nodes.append(helper.make_node('Resize', ['input', '', 'scales'], ['base'], mode='nearest'))
nodes.append(helper.make_node('Add', ['ps', 'base'], ['output']))
g = helper.make_graph(nodes, 'srvgg',
                      [helper.make_tensor_value_info('input', TensorProto.FLOAT, [1, 3, None, None])],
                      [helper.make_tensor_value_info('output', TensorProto.FLOAT, [1, 3, None, None])], inits)
m = helper.make_model(g, opset_imports=[helper.make_opsetid('', 17)]); m.ir_version = 8
onnx.checker.check_model(m); onnx.save(m, sys.argv[4]); print('ok', len(idx), 'capas')
