<!--
PLANTILLA DE PROMPT — SITIO WEB PREMIUM PARA CUALQUIER NEGOCIO
Cómo usarla:
1. Reemplaza todo lo que está entre {{LLAVES}} con los datos del negocio.
2. Borra las secciones que no apliquen (están marcadas como OPCIONAL) y renumera.
3. Deja [PONER], [CONFIRMAR] o [AJUSTAR] donde falte un dato: el sitio lo mostrará como placeholder.
4. Adjunta junto a este archivo: DESIGN.md (ya llenado) y el logo del negocio.
5. Borra este bloque de comentario antes de enviarlo.
-->

Crea un sitio web premium, de nivel agencia (calidad de un proyecto de USD $1.000+), para {{NOMBRE DEL NEGOCIO}}, {{QUÉ ES EN UNA FRASE, ej: "un restaurante y bar de cocina para compartir", "un estudio de tatuajes", "una tienda de café de especialidad"}} en {{CIUDAD / BARRIO / PAÍS}}.

REGLA DE ORO: el sitio sigue los colores del logo. {{Describe qué color domina y cuándo. Ej: "El COLOR PRINCIPAL `#XXXXXX` domina toda la página y el COLOR SECUNDARIO `#XXXXXX` se usa en bloques de contraste" o, si hay dos modos: "En el MODO A domina `#XXXXXX` y en el MODO B domina `#XXXXXX`"}}. Si al mirar cada pantalla no se siente de esos colores, corrígelo.

IMÁGENES: usa SOLO las imágenes que yo te entregue (el logo y las fotos adjuntas). No uses fotografías de stock, ni de internet, ni generadas con IA, ni copiadas de redes sociales salvo que yo lo pida de forma explícita. Lo que falte se resuelve con ilustraciones SVG hechas por ti ({{lista de objetos que representan el negocio, ej: "platos, copas, herramientas, productos, el local, el paisaje"}}) y con marcos de color sólido con el texto "FOTO PRÓXIMAMENTE". Cada lugar donde irá una foto debe leer su imagen de un arreglo central de datos (campo `src`), para cambiarla por la foto real sin tocar el diseño. Donde este prompt menciona fotos o videos, entiende "marco placeholder" hasta que lleguen.

IMPORTANTE: toda la parte visual (colores, tipografía, espaciado, formas, sombras, componentes, imágenes y reglas de qué hacer y qué no) está en el archivo DESIGN.md adjunto. Léelo completo ANTES de escribir código y úsalo como única fuente de verdad del diseño. Este prompt define el negocio, el contenido, la estructura y el comportamiento.

## Información del negocio

- **Nombre:** {{NOMBRE}}.
- **Qué es:** {{TIPO DE NEGOCIO}}. Slogan o bio: "{{SLOGAN}}".
- **Ubicación:** {{ZONA}}. Dirección exacta: [PONER].
- **Redes:** {{@usuario}} ({{seguidores}} seguidores) · {{otras redes}}.
- **Enlace actual:** {{linktree / biolink / web anterior}} ("{{qué contiene}}").
- **Contacto:** WhatsApp y teléfono [PONER]. Email [PONER].
- **Horario:** [PONER].
- **Oferta principal:** {{carta / catálogo / servicios / planes}} [PASAR LISTA CON PRECIOS].
- **Momentos o líneas del negocio:** {{ej: "Día y Noche", "Hombres y Mujeres", "Tienda y Taller". Si no hay, borra esta línea}}.
- **Tono de marca:** {{ej: divertido y de confianza / elegante y sobrio / técnico y directo}}. Ejemplo real de cómo hablan: "{{frase o publicación típica}}".
- **Aliados o vecinos:** {{negocios relacionados}} [CONFIRMAR si quieren enlazarse].

### Lo que muestra su contenido (referencia para ilustraciones y textos)
- **{{Tema 1, ej: Eventos}}:** {{descripción}} [CONFIRMAR datos].
- **{{Tema 2, ej: Producto estrella}}:** {{nombre y descripción}}.
- **{{Tema 3, ej: El espacio}}:** {{cómo es el local, la vista, la decoración}}.
- **{{Tema 4, ej: Estilo de sus publicaciones}}:** {{tipografía, colores, formato}}.
- **Su logo:** {{descripción del logo: forma, colores, textos}}.

## Concepto creativo: "{{NOMBRE DEL CONCEPTO EN MAYÚSCULAS}}"

{{2–4 frases. Qué historia cuenta la página de arriba abajo, qué forma o metáfora se repite (ej: "el círculo del logo", "una línea de tinta", "una receta paso a paso"), qué interacción es la firma (ej: "un interruptor día/noche", "un dado", "un selector de estilos") y cuál es el hilo de las animaciones (ej: "de la primera conversación a la mesa llena").}}

## Stack y comportamiento

React + Tailwind (Vite) con gsap + ScrollTrigger (pin, scrub), lenis (scroll con inercia), framer-motion (drag, layout, modales) y SplitType. Si el entorno no permite instalar paquetes, hazlo en un solo HTML autocontenido: GSAP, ScrollTrigger y Lenis embebidos en el archivo (o por CDN con versiones fijas), fuentes embebidas y logo en base64, para que funcione con doble clic y sin internet (salvo el mapa).
- Respeta prefers-reduced-motion: sin pin, sin parallax, sin transiciones grandes; todo visible y estático.
- Anima solo transform y opacity para mantener 60 fps.
- Todo el contenido en {{IDIOMA}}, con el tono de la marca.
- Ningún elemento decorativo puede tapar titulares, logo ni botones.

## Estructura y animaciones, sección por sección

**00 — PRELOADER (máx 2.2 s).** Fondo {{color}}. {{La forma firma del logo}} aparece desde el centro y el nombre "{{NOMBRE}}" se estampa letra por letra con un pequeño rebote (debe caber completo dentro de la forma). Un contador de {{elemento temático, ej: dado, gota, aguja}} sube de 0 a 100 (o 1 a 6). La forma se expande y revela el hero.

**01 — NAVBAR.** Transparente sobre el hero; al bajar se vuelve una píldora flotante con borde y sombra. Logo a la izquierda (completo, sin recortar). Links: {{Link 1}}, {{Link 2}}, {{Link 3}}, {{Link 4}}. {{Interruptor de modo si aplica}} y botón "{{CTA PRINCIPAL, ej: Reservar / Cotizar / Comprar}}". Se oculta al bajar y reaparece al subir. Menú móvil a pantalla completa con links gigantes que entran escalonados.

**02 — HERO.** Titular revelado palabra por palabra con máscara: "{{TITULAR / EN DOS LÍNEAS.}}" con la palabra clave en el color de acento. Subtítulo: "{{Dónde, qué ofrecen y una invitación, en 1–2 frases.}}" Botones: "{{CTA 1}}" (magnético) y "{{CTA 2}}". A la derecha, {{elemento animado que cuente la propuesta, ej: un chat entre amigos, una tarjeta de producto que gira, un antes/después}}; si es un chat: mensajes que aparecen uno a uno con "pop" y puntos de "escribiendo…", y el último muestra el estado abierto/cerrado en vivo. Elementos decorativos temáticos alrededor que se mueven con el cursor (parallax), sin tapar el texto. Indicador: "{{TEXTO DE DESLIZA ↓}}".

**03 — CINTA (marquee).** Banda {{color}} con texto {{color}} infinito: "{{PALABRA ✺ PALABRA ✺ PALABRA ✺ ZONA ✺}}" con {{icono del negocio}} como separador. Acelera y se inclina (skew) con la velocidad del scroll.

**04 — MANIFIESTO.** Párrafo grande que se "pinta" palabra por palabra con el scroll: "{{Manifiesto de 3–5 frases en primera persona del negocio.}}" [AJUSTAR CON EL DUEÑO]. Al lado, un número gigante "{{DATO, ej: 8.4K}}" con la etiqueta "{{QUÉ MIDE}}" (contador animado).

**05 — {{NOMBRE DE LA SECCIÓN NARRATIVA}} (scroll horizontal fijado).** 4 paneles a pantalla completa ({{describe el recorrido, ej: "de día a noche", "del grano a la taza", "del boceto al tatuaje"}}):
- {{PANEL 1 / TÍTULO}}: "{{texto corto}}" [AJUSTAR]
- {{PANEL 2 / TÍTULO}}: "{{texto corto}}" [AJUSTAR]
- {{PANEL 3 / TÍTULO}}: "{{texto corto}}" [AJUSTAR]
- {{PANEL 4 / TÍTULO}}: "{{texto corto}}" [AJUSTAR]
Arriba, en vez de barra de progreso, {{un ícono temático}} que recorre una línea y se transforma. Número de panel gigante de fondo con parallax. Cada panel lleva una ilustración SVG o foto en un marco. En móvil: pasos verticales, sin pin.

**06 — {{CARTA / CATÁLOGO / SERVICIOS}} (interactiva).** Tabs: {{Categoría 1}} · {{Categoría 2}} · {{Categoría 3}} · {{Categoría 4}} [AJUSTAR SEGÚN LA OFERTA REAL]. Cada ítem como fila: nombre, línea punteada y precio [ÍTEM ··· $00.000], descripción debajo y etiquetas ({{ej: "NUEVO", "MÁS PEDIDO"}}). Ítem destacado: {{producto estrella}} [CONFIRMAR precio]. Al pasar el cursor por un ítem aparece flotando un marco con su ilustración que sigue el cursor con inercia. Botón "{{Pedir / Cotizar}} esto" que abre WhatsApp con el nombre prellenado.

**07 — {{ELEMENTO LÚDICO, ej: ¿QUÉ PIDO? / ENCUENTRA TU ESTILO}} (OPCIONAL).** {{Un dado, una ruleta, un quiz de 3 preguntas…}} con un botón "{{acción}}". Al pulsarlo, anima y cae en un resultado que muestra una recomendación de la oferta [AJUSTAR]. Botón que abre WhatsApp con la recomendación. Se puede repetir, con sonido opcional.

**08 — {{EVENTOS / NOVEDADES / PROMOCIONES}} (OPCIONAL).** Título: "{{TÍTULO CORTO}}". Tarjetas tipo cartel con fecha enorme, nombre, lista de lo que incluye y sello "PRÓXIMO" en el más cercano, con cuenta regresiva. Si el negocio entregó el cartel original, muéstralo dentro de la tarjeta. Botón "{{Apuntarme}}" que abre WhatsApp con el nombre del evento. Carrusel arrastrable con inercia. Lista editable en un arreglo de datos; los eventos pasados se ocultan solos.

**09 — {{EL ESPACIO / EL LOCAL}}.** Ilustración SVG grande del lugar ({{qué se ve}}) {{que cambia con el modo, si aplica}}. Debajo, 3–4 datos cortos: "{{dato 1}}", "{{dato 2}}", "{{dato 3}}" [AJUSTAR].

**10 — GALERÍA.** Título: "{{TÍTULO}}". Filtros píldora: Todo · {{Cat 1}} · {{Cat 2}} · {{Cat 3}} · {{Cat 4}}. En "Todo" muestra solo 1 ítem destacado por categoría para que el scroll sea rápido; al tocar una categoría se ven todos los de esa categoría. Tarjetas con foto o marco placeholder "FOTO PRÓXIMAMENTE"; videos como loops mudos. Hover: el marco se levanta y aparece el nombre. Clic: modal con transición de imagen compartida, descripción y botón "{{Lo quiero}}" que abre WhatsApp. Cursor en la sección: círculo con "VER".

**11 — CIFRAS.** Contadores al entrar en pantalla: "{{n}} {{qué}}" · "{{n}} {{qué}}" · "{{n}} {{qué}}" · "{{n}} {{qué}}". Separadores que se dibujan de arriba abajo.

**12 — CLIENTES (testimonios).** Carrusel arrastrable con inercia de {{tarjetas / chats}} con la reseña de cada cliente. 4 testimonios marcados claramente como PLACEHOLDER, para reemplazar por reseñas reales.

**13 — PREGUNTAS FRECUENTES.** Acordeón con altura animada y un "+" que rota a "×". Preguntas: {{¿Qué horario tienen? ¿Necesito reservar/cita? ¿Cómo llego? ¿Hay parqueadero? ¿Medios de pago? ¿Hacen domicilios/eventos privados? …}} Respuestas marcadas [AJUSTAR].

**14 — UBICACIÓN Y HORARIOS.** Dos columnas. Izquierda: "{{Te esperamos en …}}". Dirección y horario en una tarjeta con tabla por día [HORAS] e indicador en vivo "ABIERTO AHORA / CERRADO" según la hora local ({{ZONA HORARIA IANA, ej: America/Bogota}}), con detección de festivos de {{PAÍS}} (lista editable de festivos de los próximos 2 años). Botón "Cómo llegar" que abre Google Maps. Derecha: mapa embebido (iframe `?q={{Nombre, zona, ciudad}}&output=embed`; sin coordenadas inventadas) con bordes redondeados grandes.

**15 — CTA FINAL.** Pantalla completa en {{color de contraste}} con texto gigante: "{{PREGUNTA O INVITACIÓN FINAL}}". Dos botones: "{{CTA por WhatsApp}}" y "{{Compartir con amigos}}", que abre el selector de WhatsApp con el mensaje prellenado "{{mensaje para compartir}} [enlace del sitio]". De fondo, {{elementos temáticos}} que caen y rebotan.

**16 — FORMULARIO DE {{RESERVA / COTIZACIÓN / PEDIDO}} (multi-step).** Progreso con 4 indicadores que se llenan. Pasos: (1) {{¿Qué necesitas? opciones}}. (2) {{¿Qué te interesa? opciones}}. (3) {{¿Cuántos, qué día y a qué hora? / detalles}}. (4) Nombre y contacto. Validación amable en cada paso. Al enviar arma un mensaje ordenado ("¡Hola {{NOMBRE}}! Quiero…") y abre WhatsApp prellenado. Transiciones laterales entre pasos.

**17 — FOOTER.** Fondo {{color oscuro}}. Logo, slogan, links, redes, enlace a {{carta/catálogo externo}}, dirección, horario y botón de WhatsApp. Abajo: "© {{AÑO}} {{NOMBRE}}. {{Ciudad}}." El nombre "{{NOMBRE}}" a todo el ancho, con {{elementos temáticos}} que caen sobre las letras al llegar al final.

## Detalles globales
- {{Interruptor de modo, si aplica: cambia entre modos con un círculo que se expande desde el botón y recuerda la elección del visitante.}}
- Botón flotante de WhatsApp abajo a la derecha, con pulso suave cada 6 s y tooltip "{{texto}}". Todos los enlaces wa.me con mensaje prellenado. Número: [PONER].
- Cursor personalizado en desktop (se agranda sobre links y dice "VER" sobre fotos); desactivado en touch.
- Fotos con lazy loading y WebP.
- Totalmente responsive: en móvil sin pin horizontal ni cursor, pero con las animaciones de texto, contadores e interacciones.
- Accesibilidad: contraste AA según DESIGN.md, alt en todas las imágenes, foco visible, navegación por teclado en tabs, filtros, acordeón, elementos interactivos y formulario.
- SEO: title "{{NOMBRE}} | {{Qué es}} en {{Zona}}"; meta description; Open Graph con el logo; schema.org {{tipo: Restaurant, BarOrPub, Store, LocalBusiness, BeautySalon…}} (address, openingHours, sameAs redes, event para los eventos).
- Favicon: la forma firma del logo.
- Todos los datos editables (oferta, eventos, galería, horarios, festivos, testimonios, FAQ, número) viven en arreglos al inicio del código.

## Material que falta (marcar en pantalla como placeholder)
{{Lista de lo que aún no entrega el negocio. Ej: número de WhatsApp, dirección exacta, horarios, oferta con precios, datos de eventos, logo en SVG o PNG transparente, fotos en alta (local, productos, equipo, clientes), 2–3 videos cortos y reseñas reales.}} Hasta que lleguen, el sitio funciona completo con ilustraciones y marcos placeholder.

El resultado debe sentirse como {{la sensación final en una frase, ej: "el cartel de un buen plan entre amigos hecho por un estudio de diseño"}}: {{3 adjetivos}}, con {{el protagonista del negocio}} en el centro. Prioriza la calidad de las animaciones y la tipografía sobre la cantidad de elementos.
