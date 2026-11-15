---
name: guion-reel
description: Úsala para escribir guiones de reels/videos verticales 9:16 (Instagram Reels, TikTok, YouTube Shorts) para restaurantes o clientes. Entrega gancho de 3 segundos, estructura por segundos, subtítulos, CTA, duración por red y prompts para generar clips en Higgsfield.
---

# Guion de reel 9:16

## Entrada mínima
Cliente, objetivo (visitas, reservas, domicilios, lanzamiento), producto/plato protagonista, tono, material disponible (clips reales vs. generados).

## Duración ideal
| Red | Ideal | Máx. recomendado |
|---|---|---|
| TikTok | 15–25 s | 45 s |
| Instagram Reels | 12–20 s | 30 s |
| YouTube Shorts | 20–40 s | 60 s |
Si no se especifica, apunta a 15 s.

## Formato de salida
1. **Gancho (0–3 s):** una imagen fuerte + texto en pantalla de ≤ 6 palabras. Fórmulas: pregunta, contraste, secreto, "POV:", primer plano extremo de comida con sonido.
2. **Tabla por segundos:**
| Seg | Plano / acción | Texto en pantalla | Audio / VO |
|---|---|---|---|
| 0–3 | ... | ... | ... |
3. **Subtítulos:** líneas de ≤ 32 caracteres, 2 líneas máx., en español, zona segura (evita el 15% superior y el 25% inferior). Exportables como `.srt`.
4. **CTA (últimos 2–3 s):** concreto: "Reserva por WhatsApp", "Pide a domicilio", "Ven este finde a Santa Elena". Repite en caption.
5. **Caption** (≤ 150 caracteres) + 3–5 hashtags locales (#SantaElena #Medellín ...).
6. **Música/ritmo:** BPM sugerido y cortes en el beat.

## Prompts para Higgsfield
Por cada plano generado, un prompt en inglés (mejor resultado del modelo) con:
`[subject], [action], [setting], [lighting], [camera movement], [lens/style], vertical 9:16, [duration]s`
Ejemplo:
`Close-up of a sizzling arepa on a wood-fired clay grill, smoke rising, rustic mountain restaurant at dawn, warm golden backlight, slow push-in, 35mm shallow depth of field, cinematic food commercial, vertical 9:16, 4s`
Si el MCP de Higgsfield está conectado, ofrece generar los clips directamente.

## Edición (ffmpeg)
- Recorte a 9:16: `ffmpeg -i in.mp4 -vf "crop=ih*9/16:ih,scale=1080:1920" -c:a copy out.mp4`
- Quemar subtítulos: `ffmpeg -i in.mp4 -vf subtitles=subs.srt out.mp4`
- Export: 1080×1920, H.264, 30 fps, ~10 Mbps, AAC 128k.
