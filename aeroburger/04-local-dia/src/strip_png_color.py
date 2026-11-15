"""Quita los chunks de color (cICP, cHRM, gAMA, iCCP, sRGB) que ffmpeg escribe en los PNG.
Chrome los aplica al dibujar en el canvas y oscurece los fotogramas; sin ellos se tratan como sRGB,
que es como se ven los videos en el teléfono."""
import struct, sys, glob
DROP={b'cICP',b'cHRM',b'gAMA',b'iCCP',b'sRGB'}
n=0
for p in sys.argv[1:]:
    for f in glob.glob(p):
        d=open(f,'rb').read(); out=[d[:8]]; i=8; changed=False
        while i<len(d):
            ln=struct.unpack('>I',d[i:i+4])[0]; t=d[i+4:i+8]
            if t in DROP: changed=True
            else: out.append(d[i:i+12+ln])
            i+=12+ln
        if changed: open(f,'wb').write(b''.join(out)); n+=1
print('limpiados',n)
