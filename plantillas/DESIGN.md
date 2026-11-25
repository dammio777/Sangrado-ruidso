# DESIGN.md: Video de propuesta "Así se verían tus redes"

Plantilla de diseño y producción para un video vertical que le presenta a un negocio cómo se verían sus redes sociales manejadas por nosotros. Sigue este documento al pie de la letra. Todo lo que dependa de la marca (colores, tipografías, textos, fotos) se extrae del material que te envíen. No se inventa nada.

---

## 1. Concepto (tenlo presente en cada decisión)

> **"Una experiencia para compartir."**

El video no vende un servicio de redes: hace que el dueño del negocio **se vea a sí mismo** con unas redes cuidadas, vivas, y con gente que comparte lo que él hace. Cada escena debe transmitir:

- **Compartir:** íconos de enviar, corazones, comentarios, "lo envié a mis amigos", dos personas, dos manos, dos tazas…
- **Experiencia:** no producto suelto. Mostrar el momento, el lugar, la sensación.
- **Cercanía:** tono cálido, en segunda persona ("tu marca", "tus clientes"), nada corporativo.

El video termina con una pregunta directa, sola en pantalla: **"¿Te animas?"**

---

## 2. Antes de diseñar: análisis de la marca

1. Pide (o revisa) este material:
   - Captura del perfil de Instagram (biografía, número de seguidores, publicaciones).
   - Logo: la captura de la foto de perfil ampliada sirve.
   - Entre 6 y 12 fotos: productos, lugar, gente, proceso.
   - Videos, si los hay.
2. **Recorta todo tú mismo.** Quita la interfaz de Instagram (barras, botones, contadores, el corazón sobre la foto de perfil, íconos de Reels). Si un botón tapa el logo, reconstruye esa zona con los mismos colores o la misma textura.
3. **Extrae la paleta del logo y de las fotos**, con valores HEX reales medidos sobre los píxeles:
   - `primario`: el color dominante del logo.
   - `secundario`: el segundo color del logo o del empaque.
   - `acento`: un color pequeño pero llamativo (detalles, botones).
   - `claro`: una versión clara del primario o un crema del empaque (para fondos con texto oscuro).
   - `oscuro`: el color más oscuro de la marca (para texto).
4. **Tipografías:** identifica el estilo del logo y del empaque y busca equivalentes en Google Fonts. Usa siempre tres:
   - **Titular:** con el carácter de la marca (serif clásica, slab, pincel, condensada…).
   - **Texto:** sans limpia y legible (tipo Inter).
   - **Etiqueta:** monoespaciada o en versalitas, en mayúsculas con espaciado amplio.
5. **Textos reales:** saca las frases de la biografía, de las publicaciones y de las etiquetas de los productos. Si algo no se lee, pregunta. **Nunca inventes datos** (precios, cifras, ingredientes, nombres).
6. Escribe una guía de marca corta (paleta, tipografías, recursos gráficos y tono) y muéstrala antes de producir.

---

## 3. Formato técnico

| Ítem | Valor |
|---|---|
| Relación | 9:16 vertical |
| Resolución | 1080 × 1920 |
| Cuadros | 60 fps |
| Duración | 30–35 s |
| Zona segura | 150 px arriba, 300 px abajo, 70 px a los lados |
| Video | MP4 H.264, perfil high, CRF 17–18, bt709 |
| Audio | AAC 320 kbps, normalizado a −14 LUFS, pico −1,5 dB |
| Peso | menos de 95 MB |

---

## 4. Fondos (regla obligatoria)

- **Nunca uses un fondo blanco o liso sin intención.** Todas las escenas llevan fondo con los **colores extraídos de la marca**.
- Alterna entre dos tipos de fondo:
  - **Plano de color de marca** (`primario`, `secundario` o `claro`), con un **patrón propio** que salga de su identidad: líneas onduladas, rombos concéntricos, pinceladas de acuarela, montañas de líneas, puntos, hojas… El patrón va en un tono del mismo color, al 8–20 % de opacidad, y se mueve lento (paralaje).
  - **Foto de la marca desenfocada** (unos 40 px de desenfoque), con un velo de su color al 50–65 %.
- Agrega una **palabra gigante en transparencia** (el nombre de la marca o una palabra del concepto: "COMPARTE"), cortada por el borde, en blanco al 12–18 % sobre el color.
- Sobre fondos oscuros, el texto va en `claro`. Sobre fondos claros, en `oscuro`. **El texto pequeño nunca va en un color parecido al del fondo.**

---

## 5. Estructura del video (unos 33 s)

### Escena 1 · Gancho (0–3,5 s)
- Fondo: `primario`, con su patrón.
- El logo de la marca entra con un rebote suave (escala de 0,6 a 1 y giro de −10° a 0°).
- Etiqueta monoespaciada: **"IMAGINA TUS REDES ASÍ"**.
- Transición: un círculo de color `secundario` crece desde el logo y llena la pantalla.

### Escena 2 · "Así se verían tus redes" (3,5–15 s), la escena principal
Un **teléfono** centrado (marco redondeado, unos 760 × 1560 px, con sombra suave), que entra desde abajo con una leve inclinación 3D y se endereza.

Dentro del teléfono, una **maqueta del perfil de Instagram de la marca**, construida con su material real:
1. Encabezado con la foto de perfil (el logo), el @usuario y la biografía real.
2. **Cuadrícula de 9 publicaciones** armada con sus fotos. Cada una tiene un tratamiento coherente: mismo filtro cálido, marcos o franjas del color de la marca, y 2 o 3 publicaciones con titular grande en su tipografía. Las publicaciones aparecen una por una, en cascada.
3. El perfil **se desplaza hacia arriba** suavemente, como si alguien lo navegara.
4. Se abre un **Reel** a pantalla de teléfono, con una foto o video de la marca y zoom lento.
5. **Interacciones que dejen ver el concepto de compartir:**
   - Corazones que suben flotando desde la esquina.
   - Burbujas de comentarios que entran escalonadas, con frases cortas y genéricas como "¡Quiero ir!", "Etiqueto a mi parcero 👇" o "¿Vamos el sábado?". **No uses nombres de personas reales.**
   - El ícono de **enviar ✈️** se presiona, y aparece una tarjeta: **"Enviado a 3 amigos"** con tres círculos de avatar abstractos (colores de la marca, sin caras).
   - Notificaciones tipo iPhone que bajan desde arriba: "A 12 personas les gustó tu publicación", "Tu Reel se compartió 8 veces". Las cifras se presentan como ejemplo, nunca como resultado prometido.
- Fuera del teléfono, a un lado, una etiqueta de cristal: **"Contenido que se comparte"**.

### Escena 3 · Carrusel de productos (15–23 s)
- Fondo: `claro`, con el patrón y la palabra gigante.
- Título: **"Lo que hace especial a [marca]"** o una frase real de su biografía.
- **Carrusel 3D sencillo** de 3 a 5 productos:
  - Tarjetas redondeadas de 760 × 1000 px.
  - La tarjeta activa va al centro y a escala 1. Las laterales van giradas unos 24°, a escala 0,8 y con un 20 % menos de brillo.
  - Cada tarjeta tiene su etiqueta de cristal: tipo de producto (monoespaciada) y nombre real o frase corta.
  - Avanza una tarjeta cada 1,4 s, con una curva de ida y vuelta suave.
  - Contador "01/05" arriba a la derecha.

### Escena 4 · "Una experiencia para compartir" (23–29 s)
- Fondo: foto del lugar o del producto en uso, desenfocada, con velo `primario`.
- Dos fotos tipo polaroid **que se juntan desde los lados** hasta tocarse: la idea de "tú y alguien más".
- Titular grande, una línea por vez:
  **"No es solo un producto."**
  **"Es una experiencia"**
  **"para compartir."** (en `acento`, con un óvalo dibujado a mano alrededor de "compartir").
- Pequeños íconos de enviar, corazón y comentario orbitando lento alrededor de las fotos.

### Escena 5 · Cierre "¿Te animas?" (29–33 s)
- Fondo: `primario` pleno, con la palabra gigante.
- Todo se retira y queda la pregunta sola, enorme, centrada: **"¿Te animas?"**, en la tipografía titular y en `claro`. Entra letra por letra desde una máscara y luego "respira" (escala 1 a 1,02 en seno lento).
- Debajo, pequeño, en etiqueta monoespaciada: el logo de la marca **×** nuestro logo, y una línea de contacto: **[NUESTRO CONTACTO / @NUESTRA CUENTA]**.
- Un último corazón sube y se desvanece.

---

## 6. Sistema visual

- **Tarjetas de cristal:** blanco al 45–70 % (o `oscuro` al 40 % sobre fondos claros), borde de 1,5 px blanco al 80 %, esquinas de 28–56 px y sombra cálida (`0 20px 60px` en `oscuro` al 25 %).
- **Fotos:** con algo más de luz y calidez (brillo +10 %, saturación +8 %). Nada frío ni oscuro.
- **Logos:** siempre en círculo, con un aro claro de 8–12 px para que no se pierdan sobre fondos de color parecido.
- **Textura:** grano de película sutil y viñeta leve en los bordes.
- **Jerarquía:** un titular grande por escena como máximo, una etiqueta y una línea de apoyo. Nada de párrafos.
- **Ortografía:** revisada, con tildes y signos de apertura (¿¡).

---

## 7. Animación

- **Curvas:** ease-out cúbica para las entradas, ease-in-out para los movimientos y un rebote leve para logos y pastillas (exceso máximo del 5 %). Nada brusco.
- **Titulares:** suben desde una máscara, letra por letra o línea por línea, con 0,12–0,16 s entre línea y línea.
- **Escalonado:** los elementos de un grupo entran con 0,1–0,3 s de diferencia.
- **Fotos:** zoom lento continuo (1,15 a 1,03) mientras están en pantalla.
- **Flotación:** las tarjetas y fotos se mecen ±6 px en seno.
- **Transiciones:** barrido circular de color, fundido corto (0,3–0,5 s) o desenfoque breve. Nunca un corte seco entre escenas.
- **Ritmo:** cada escena respira. Si algo pasa muy rápido para leerse, alárgalo.

---

## 8. Música y sonido

- Pista **original, sin derechos de autor**, calmada, cozy y con sonido limpio y actual (no "radio antigua"): jazz cozy con piano eléctrico, contrabajo y guitarra de nylon, con escobillas muy al fondo. Una alternativa es acústica cálida o bossa suave.
- Tempo de 70 a 85 BPM, en tonalidad mayor y luminosa.
- **Efectos sincronizados y suaves:** whoosh en las transiciones, campanita en notificaciones y corazones, un "pop" leve al presionar enviar, tecleo suave si se escribe algo, y un acorde final sostenido en "¿Te animas?".
- Mezcla: la melodía manda; batería y efectos siempre por debajo. Fundido de entrada de 1,5 s y de salida de 3 s.

---

## 9. Producción (base técnica recomendada)

- **Escenas en HTML, CSS y JS** con una función `render(t)` que dibuja cualquier instante exacto. Una sola página de plantilla, y un archivo de configuración por marca (`brand.js`) con colores, tipografías, logo, fotos y textos.
- **Render cuadro por cuadro** con Playwright (Chromium) a 1080 × 1920, enviando los cuadros por tubería a ffmpeg.
- **Optimizaciones de velocidad** (unas 5 veces más rápido):
  - Captura por CDP: `Page.captureScreenshot` con `optimizeForSpeed: true` y JPEG al 95.
  - Sin `backdrop-filter` ni grano en vivo. El grano se agrega al final con ffmpeg (`noise=c0s=7:c0f=t+u`), y el desenfoque del fondo se pre-renderiza como imagen.
  - Imágenes de fondo desenfocadas, pregeneradas a baja resolución.
  - Maestro casi sin pérdida (x264 `veryfast`, CRF 8) y codificación final aparte (x264 `medium`, CRF 18, `unsharp` leve, `loudnorm`).
  - Varios videos en paralelo, uno por núcleo.
- **Antes del render completo:** muestra cuadros de prueba de cada escena y corrige textos cortados, superposiciones o poco contraste.
- **Después del render:** verifica la duración, los 60 fps y que el archivo abra completo antes de entregar. Nunca entregues un archivo a medio escribir.
- Avisa cuánto va a tardar el render y avisa cuando termine.

---

## 10. Entregables

1. El video final en MP4 (sección 3).
2. Una portada en JPG (el cuadro de la escena 2 con el teléfono, o el de "¿Te animas?").
3. Un texto corto para enviarle al negocio junto con el video, listo para copiar. Tono cálido, 3 o 4 líneas, que cierre con "¿Te animas?".
4. La guía de marca extraída (paleta en HEX y tipografías), para reutilizar.

---

## 11. Lista de control final

- [ ] Los colores salieron del logo y de las fotos de la marca, no son genéricos.
- [ ] Ninguna escena tiene un fondo blanco liso.
- [ ] Ningún resto de la interfaz de Instagram en las imágenes.
- [ ] Ningún dato inventado. Las cifras de ejemplo se ven como ejemplo.
- [ ] El concepto "una experiencia para compartir" se ve en al menos tres escenas.
- [ ] El video termina con "¿Te animas?" solo y protagonista.
- [ ] Textos dentro de la zona segura, legibles y con buen contraste.
- [ ] 1080 × 1920, 60 fps, 30–35 s, −14 LUFS, menos de 95 MB.
