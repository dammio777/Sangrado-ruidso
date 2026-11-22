# Música original de Aero Burger: "Aero Bossa"

`aero_bossa.py` compone y sintetiza nota por nota una bossa / lounge instrumental: guitarra de nailon (cuerda pulsada), piano eléctrico, vibráfono, bajo, bombo suave, aro en clave, shaker, reverberación de sala y un toque de vinilo. Es original y no usa samples, así que no tiene problemas de derechos en Instagram.

El tempo se elige para que cada compás o tiempo caiga en los cortes del video:
- Menú de a bordo: `--bpm 114.2857 --bar0 2.6 --dur 24.6 --breakdown 15.2 19.4` (un compás = una página; sin batería en la chimenea)
- Aerosanduche en la mesa: `--bpm 120 --bar0 3.0 --dur 17.0`
- Local de día (primer plano): `--bpm 105 --bar0 0 --dur 18.286` (cada toma dura un número entero de tiempos)

Comprobación sin oído: espectrograma, energía por octavas (−2,5 dB/oct aprox. desde 250 Hz) y notas dominantes por compás.

# Música "cozy" v2 (`cozy.py`), una canción distinta por video
| Video | Tema | Tono | Tempo | Instrumentación |
|---|---|---|---|---|
| Menú de a bordo | `menu` | Fa mayor | 80 BPM (compás = 3,0 s = 1 página) | Rhodes, campanita, contrabajo, batería lo-fi con escobillas; en la chimenea se va la batería |
| Aerosanduche | `aerosanduche` | Re mayor | 80 BPM (compás = 3,0 s = 1 paso) | Guitarra de nailon fingerpicking, piano de fieltro, bajo, bombo + aro + shaker |
| Cómo llegar | `llegar` | Do mayor | 72 BPM (compás = 3,33 s) | Piano de fieltro, colchón, Rhodes de apoyo en las tomas, latido suave |

Producción: humanización, swing, sidechain del bombo, EQ por grupo (fase cero), reverberación de sala por convolución, "swells" invertidos en las entradas, EQ de corrección hacia una curva de referencia, compresión suave y limitador. Normalización final con `common/loudnorm.sh` (-14 LUFS, -1,5 dBTP).
Revisión objetiva con `analyze.py` (balance por octavas vs. referencia, volumen por compás, notas por compás, clics audibles, estéreo, loudness).
```
python3 music/cozy.py menu 06-nuevo/out/cozy_menu_raw.wav && bash common/loudnorm.sh 06-nuevo/out/cozy_menu_raw.wav 06-nuevo/out/cozy_menu.wav
```
