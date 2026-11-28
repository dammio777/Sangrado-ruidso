<!--
PLANTILLA DE DESIGN.md — SISTEMA VISUAL PARA CUALQUIER NEGOCIO
Cómo usarla:
1. Mide los colores reales del logo y de sus redes (cuentagotas sobre el logo, no "a ojo").
2. Reemplaza todo lo que está entre {{LLAVES}}. Calcula los contrastes con una herramienta (ej: WebAIM Contrast Checker) y escribe los valores reales.
3. Si el negocio tiene un solo modo, borra lo de "modo B". Si no usa serif de acento, borra esa fuente.
4. Borra este bloque de comentario antes de enviarlo.
-->

# {{NOMBRE DEL NEGOCIO}} — Style Reference
> {{Una frase que describa la estética. Ej: "Un cartel de plaza hecho de amarillo sol y azul noche".}}

**Theme:** {{un modo / dos modos (ej: día-noche, claro-oscuro)}}. El {{COLOR PRINCIPAL}} del logo es la superficie dominante {{del modo A}}{{ y el COLOR SECUNDARIO domina el modo B}}. {{El color neutro}} es apoyo, no fondo principal.

Los colores de marca están medidos en los píxeles del logo y las redes del negocio. Los tonos "derivados" son variaciones calculadas para cumplir contraste.

La estética es {{3–5 adjetivos y referencias, ej: "de cartel callejero, juguetona, colores planos, sombras sólidas" / "editorial, sobria, mucho aire, fotos grandes"}}. Su firma visual es {{la forma o recurso del logo que se repite, ej: "el CÍRCULO del logo", "la línea fina", "el sello"}}, que se usa en {{marcos de foto, íconos, botones, cargador}}.

## Tokens — Colors

| Name | Value | Token | Role |
|------|-------|-------|------|
| {{Principal}} | `#{{XXXXXX}}` | `--color-principal` | EL COLOR DE LA MARCA. Superficie dominante: hero, bandas, tarjetas. Texto encima: {{color}}. |
| {{Principal suave}} | `#{{XXXXXX}}` | `--color-principal-suave` | Derivado. Fondos amplios y tarjetas sobre el principal. |
| {{Secundario}} | `#{{XXXXXX}}` | `--color-secundario` | Botones, bloques de color, íconos, títulos grandes. Texto encima: {{color}}. |
| {{Secundario profundo}} | `#{{XXXXXX}}` | `--color-secundario-profundo` | Derivado. Texto pequeño y enlaces sobre fondos claros. |
| {{Oscuro}} | `#{{XXXXXX}}` | `--color-oscuro` | Derivado. Texto principal, bordes y fondo del modo oscuro. |
| {{Claro secundario}} | `#{{XXXXXX}}` | `--color-claro` | Derivado. Texto secundario sobre el oscuro. |
| {{Neutro}} | `#{{XXXXXX}}` | `--color-neutro` | Respiros, tarjetas y zonas de lectura. Nunca blanco puro de fondo. |
| {{Acento}} | `#{{XXXXXX}}` | `--color-acento` | Solo acentos: sellos, etiquetas "HOY", el punto de "abierto". Máximo 6%. |
| Blanco | `#FFFFFF` | `--color-blanco` | Texto sobre colores fuertes. |

Proporción: {{ej: 38% principal, 24% secundario/oscuro, 22% neutro, 10% derivados, 6% acento}}. Si al mirar la página no se siente del color de la marca, corrige subiendo el color.

### Reglas de contraste (AA)
Calcula cada par y escribe el valor real:
- {{Secundario}} sobre {{Principal}}: {{x.x}}:1 → {{uso permitido: solo títulos grandes 24px+ / texto normal}}.
- Texto sobre {{Principal}}: {{color}} ({{x.x}}:1). Nunca {{color prohibido}}.
- Texto sobre {{Secundario}}: {{color}} ({{x.x}}:1).
- Texto sobre {{Oscuro}}: {{colores}} ({{x.x}}:1). {{Color que NO pasa}} da {{x.x}}:1: NUNCA como texto.
- {{Acento}} sobre {{Neutro}}: {{x.x}}:1.
Regla general: 4.5:1 para texto normal, 3:1 para títulos de 24px+ o 19px+ bold.

## Tokens — Typography

### {{Fuente display}} — Titulares. {{carácter, ej: condensada y pesada de afiche}} · `--font-display`
- **Weights:** {{700, 800, 900}}
- **Sizes:** 40px, 56px, 72px, hasta clamp(64px, 12vw, 200px) en el hero
- **Line height:** 0.88–0.95
- **Letter spacing:** 0 a -0.01em{{, en MAYÚSCULAS}}
- **Role:** H1, H2, números gigantes, fechas, el nombre del negocio. Debe recordar {{la tipografía de sus publicaciones}}.

### {{Fuente de acento}} — Acento (OPCIONAL) · `--font-acento`
- **Weights:** {{400, 600, italic 400}}
- **Sizes:** 20px a 40px
- **Role:** Nombres de productos, citas y notas. Máximo 1–2 por pantalla.

### {{Fuente de texto}} — Texto y UI · `--font-texto`
- **Weights:** 400, 500, 700, 800
- **Sizes:** 12px, 14px, 16px, 18px, 20px
- **Line height:** 1.6
- **Role:** Cuerpo, botones, navegación, formularios, precios (con `font-variant-numeric: tabular-nums`).

### Type Scale

| Role | Family | Weight | Size | Line Height | Letter Spacing | Token |
|------|--------|--------|------|-------------|----------------|-------|
| caption | Texto | 700 | 12px | 1.4 | 0.08em (mayúsculas) | `--text-caption` |
| body-sm | Texto | 400 | 14px | 1.6 | 0 | `--text-body-sm` |
| body | Texto | 400 | 16px | 1.6 | 0 | `--text-body` |
| lead | Texto | 500 | 20px | 1.5 | 0 | `--text-lead` |
| accent | Acento | 400 italic | 28px | 1.2 | 0 | `--text-accent` |
| subheading | Display | 800 | 40px | 0.95 | 0 | `--text-subheading` |
| heading | Display | 900 | 72px | 0.9 | 0 | `--text-heading` |
| display | Display | 900 | clamp(64px, 12vw, 200px) | 0.88 | -0.01em | `--text-display` |

## Tokens — Spacing & Shapes

**Base unit:** 4px
**Density:** {{cómoda / compacta / aireada}}.

### Spacing Scale
4, 8, 12, 16, 24, 32, 48, 64, 96, 128 (px). Tokens `--spacing-4` … `--spacing-128`.

### Border Radius

| Element | Value |
|---------|-------|
| buttons | {{9999px (píldora) / 12px / 0px}} |
| cards | {{20–28px}} |
| inputs | {{14px}} |
| photo frames | {{9999px (círculo) o 28px}} |
| tags | {{8px}} |

{{Forma firma}} sale del logo y se usa en marcos de foto, íconos y elementos decorativos.

### Shadows

| Name | Value | Token |
|------|-------|-------|
| base | `{{ej: 4px 4px 0 #OSCURO (sólida) / 0 8px 24px rgba(...) (suave)}}` | `--shadow-base` |
| lg | `{{ej: 8px 8px 0 #OSCURO}}` | `--shadow-lg` |
| modo B | `{{ej: 4px 4px 0 #PRINCIPAL}}` | `--shadow-modo-b` |
| soft | `0 12px 28px -8px rgba({{oscuro en rgb}}, 0.28)` | `--shadow-soft` |

{{Ej: "Las tarjetas, botones y fichas llevan borde de 2px en Oscuro más la sombra sólida. El hover levanta el elemento: la sombra pasa de 4px a 8px."}}

### Layout
- **Page max-width:** 1280px
- **Section gap:** 96–128px
- **Card padding:** 24–32px
- **Element gap:** 8–16px

## Components

### Botón principal
**Role:** CTA principal ("{{Reservar / Comprar / Cotizar}}", "Escribir por WhatsApp").
Sobre fondo claro: píldora {{Secundario}} con texto {{color}}, borde {{grosor y color}} y `shadow-base`. Sobre fondo oscuro: píldora {{Principal}} con texto {{Oscuro}}. Efecto magnético. Hover: sube y la sombra crece.

### Botón secundario
Transparente con borde {{color}} y texto {{color}} (en oscuro: {{color}}). Hover: se rellena con {{Principal suave}}.

### {{Componente de comunicación, ej: Burbuja de chat / Tarjeta de reseña}}
Recibida: {{fondo}} con texto {{color}}. Enviada: {{fondo}} con texto {{color}}. Radio {{20px}} con la esquina de la cola a {{6px}}. Aparecen con "pop" (scale 0.8 → 1) una tras otra.

### {{Elemento temático, ej: Ficha y dado / Sello / Etiqueta}}
{{Tamaño, forma, colores, borde y sombra. Dónde se usa: separadores, cargador, decoración.}}

### Cartel de evento / promoción
Tarjeta tipo afiche: fecha enorme en la fuente display, nombre en mayúsculas, lista con viñetas temáticas y un sello {{Acento}} ("PRÓXIMO"). Borde y `shadow-lg`.

### Fila de oferta (carta / catálogo)
Nombre en {{fuente}} a la izquierda, línea punteada, precio en {{fuente}} 800 tabular a la derecha, descripción en 14px debajo. Etiquetas pequeñas: "{{NUEVO}}", "{{MÁS PEDIDO}}".

### {{Interruptor de modo (OPCIONAL)}}
Píldora con dos íconos y una perilla que se desliza. Al activarlo, un círculo se expande desde el interruptor (clip-path / View Transitions) y cambia toda la página de modo.

### Tabs y chips
Píldoras con borde {{color}}. Activo: fondo {{Secundario}} con texto {{color}} (en oscuro: {{Principal}} con texto {{Oscuro}}). Foco visible: anillo de 3px en {{color}}.

## Do's and Don'ts

### Do
- Deja que el {{COLOR PRINCIPAL}} domine{{ y el SECUNDARIO domine el modo B}}, con {{Neutro}} de respiro.
- Usa la fuente display para todo lo que sea titular, fecha o número.
- Repite {{la forma firma}} en marcos, íconos y decoración.
- {{Regla de bordes y sombras}}.
- Escribe con el tono de la marca: {{ejemplo de frase}}.
- Muestra siempre el horario y el estado "abierto ahora" a la vista.

### Don't
- No pongas {{color}} sobre {{color}} (no pasa contraste).
- No mezcles degradados entre {{color A}} y {{color B}} si se ven sucios: cambia de color con cortes.
- No hagas el diseño {{lo opuesto a la marca, ej: "elegante y minimalista" o "infantil"}}.
- No uses {{sombras / esquinas / recursos que rompen el estilo}}.
- No metas más de un acento {{Acento}} por pantalla.
- No dejes que elementos decorativos tapen el logo, titulares o botones.
- No llenes la página de emojis; los íconos y formas hacen ese trabajo.

## Elevation
- **Tarjetas, botones:** {{borde + shadow-base}}
- **Carteles y modal:** {{borde + shadow-lg}}
- **Modo B:** {{bordes y sombras cambian a …}}
- **Navbar flotante:** {{borde + soft}}

## Imagery
Usa SOLO las imágenes entregadas por el negocio (logo y fotos propias). Nada de stock, internet, IA ni contenido copiado de redes sin permiso explícito. Mientras faltan fotos:
- {{La forma firma}} recreada en SVG como elemento repetido.
- Ilustraciones SVG planas de: {{lista de objetos del negocio}}.
- Carteles tipográficos con la fuente display como "imágenes" de las secciones.
- Donde irá una foto: MARCO {{forma}} de color sólido ({{colores}}), con borde, sombra y el texto "FOTO PRÓXIMAMENTE". Cada marco lee su imagen de un arreglo central de datos (campo `src`).

Cuando lleguen las fotos reales serán {{estilo fotográfico: cálidas/espontáneas, frías/de estudio…}}: {{qué mostrar}}. Irán en marcos {{forma}} con entrada por clip-path.

## Layout
{{Describe el ritmo: ej: "Hero a pantalla completa en el color principal. Debajo, un contenedor centrado de 1280px con bloques planos grandes que alternan entre principal, oscuro y neutro. El scroll horizontal fijado se reserva para una sola sección en desktop; en móvil todo es vertical. Composición asimétrica pero con alineación clara para leer."}}

## Agent Prompt Guide

### Quick Color Reference
- **Fondo principal:** {{Principal}} `#{{XXXXXX}}` (texto {{color}} encima)
- **Fondo suave:** {{Principal suave}} y {{Neutro}}
- **Marca / botones:** {{Secundario}} `#{{XXXXXX}}` (texto {{color}})
- **Texto pequeño de acento sobre claro:** {{Secundario profundo}}
- **Fondo oscuro:** {{Oscuro}} (texto {{colores}})
- **Acento puntual:** {{Acento}}

### Example Component Prompts
1. **Hero:** Fondo {{Principal}}. Titular en {{fuente display}} 900, `clamp(64px, 12vw, 200px)`, {{color}}, interlineado 0.88: "{{TITULAR}}" con "{{PALABRA CLAVE}}" en {{Secundario}}. A la derecha, {{elemento animado}}. Botón principal {{Secundario}} y secundario con borde.
2. **Cartel de evento:** Tarjeta {{Principal suave}} con borde y `shadow-lg`. "{{DD MES}}" en display 900 a 120px en {{Secundario}}, "{{NOMBRE DEL EVENTO}}" en display 800, lista con viñetas, sello {{Acento}} "PRÓXIMO" girado 6°.
3. **Fila de oferta:** "{{Producto estrella}}" en {{fuente acento}} 28px, línea punteada, precio en texto 800, y debajo "{{descripción}}" en 14px.
4. **Modo oscuro:** Fondo {{Oscuro}}, titulares en {{Principal}}, texto en {{Neutro}}, bordes y sombras en {{Principal}}.

## Quick Start

### CSS Custom Properties

```css
:root {
  /* Colors */
  --color-principal: #{{XXXXXX}};
  --color-principal-suave: #{{XXXXXX}};
  --color-secundario: #{{XXXXXX}};
  --color-secundario-profundo: #{{XXXXXX}};
  --color-oscuro: #{{XXXXXX}};
  --color-claro: #{{XXXXXX}};
  --color-neutro: #{{XXXXXX}};
  --color-acento: #{{XXXXXX}};
  --color-blanco: #FFFFFF;

  /* Typography — Families */
  --font-display: '{{Fuente display}}', Impact, 'Arial Narrow', sans-serif;
  --font-acento: '{{Fuente acento}}', Georgia, serif;
  --font-texto: '{{Fuente texto}}', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;

  /* Typography — Scale */
  --text-caption: 12px;
  --text-body-sm: 14px;
  --text-body: 16px;
  --text-lead: 20px;
  --text-accent: 28px;
  --text-subheading: 40px;
  --text-heading: 72px;
  --text-display: clamp(64px, 12vw, 200px);

  /* Spacing */
  --spacing-4: 4px; --spacing-8: 8px; --spacing-12: 12px; --spacing-16: 16px;
  --spacing-24: 24px; --spacing-32: 32px; --spacing-48: 48px; --spacing-64: 64px;
  --spacing-96: 96px; --spacing-128: 128px;

  /* Layout */
  --page-max-width: 1280px;

  /* Radius */
  --radius-tag: {{8px}};
  --radius-input: {{14px}};
  --radius-card: {{24px}};
  --radius-pill: 9999px;

  /* Shadows */
  --shadow-base: {{4px 4px 0 #OSCURO}};
  --shadow-lg: {{8px 8px 0 #OSCURO}};
  --shadow-modo-b: {{4px 4px 0 #PRINCIPAL}};
  --shadow-soft: 0 12px 28px -8px rgba({{r, g, b}}, 0.28);
}
```

### Tailwind v4

```css
@theme {
  --color-principal: #{{XXXXXX}};
  --color-principal-suave: #{{XXXXXX}};
  --color-secundario: #{{XXXXXX}};
  --color-secundario-profundo: #{{XXXXXX}};
  --color-oscuro: #{{XXXXXX}};
  --color-claro: #{{XXXXXX}};
  --color-neutro: #{{XXXXXX}};
  --color-acento: #{{XXXXXX}};

  --font-display: '{{Fuente display}}', Impact, sans-serif;
  --font-acento: '{{Fuente acento}}', Georgia, serif;
  --font-texto: '{{Fuente texto}}', ui-sans-serif, system-ui, sans-serif;

  --radius-card: {{24px}};
  --radius-input: {{14px}};

  --shadow-base: {{4px 4px 0 #OSCURO}};
  --shadow-lg: {{8px 8px 0 #OSCURO}};
  --shadow-soft: 0 12px 28px -8px rgba({{r, g, b}}, 0.28);
}
```

### Google Fonts

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family={{Fuente+Display}}:wght@700;800;900&family={{Fuente+Acento}}:ital,wght@0,400;0,600;1,400&family={{Fuente+Texto}}:wght@400;500;700;800&display=swap">
```
