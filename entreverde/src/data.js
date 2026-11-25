/* ============================================================================
   ENTREVERDE · ARCHIVO ÚNICO DE DATOS
   Todo lo editable vive aquí: WhatsApp, horario, festivos, carta, precios,
   desgranados, domicilios, reservas y textos. Cambia valores sin tocar el diseño.
   Lo marcado con [CONFIRMAR] / [PONER] es un dato de ejemplo pendiente.
   ========================================================================== */

/* ---------- Fotos: un solo arreglo central. Cambia `src` para reemplazar. ---
   `src` es la ruta base sin ancho; el sitio arma el srcset con `widths`.
   Si `src` es null, se muestra el marco "Foto próximamente". */
export const FOTOS = {
  /* Fotos reales del lugar (material del local) */
  'lugar-letrero': { src: 'fotos/lugar-letrero', widths: [640, 1079], w: 1079, h: 1439, alt: 'El contenedor de Entreverde con el letrero oxidado, la terraza en el segundo piso, luces de bombillo y monsteras bajo el cielo azul' },
  'lugar-frente': { src: 'fotos/lugar-frente', widths: [640, 1280, 1920], w: 1920, h: 1080, alt: 'Fachada del contenedor con techo oxidado, terraza en el segundo piso, sillas altas de madera y monsteras' },
  'lugar-angulo': { src: 'fotos/lugar-angulo', widths: [640, 1080, 1600], w: 1600, h: 1200, alt: 'El contenedor de Entreverde visto en diagonal, con la palmera y las jardineras de monsteras en una tarde de sol' },
  'lugar-fachada': { src: 'fotos/lugar-fachada', widths: [640, 1079], w: 1079, h: 810, alt: 'El bar en contenedor con la barra de sillas altas y las jardineras al frente' },
  'lugar-entrada': { src: 'fotos/lugar-entrada', widths: [640, 1079], w: 1079, h: 810, alt: 'La entrada desde la vía: reja de madera oscura, aviso redondo de entreverde y el techo del contenedor al fondo' },
  'lugar-barra': { src: 'fotos/lugar-barra', widths: [640, 1078], w: 1078, h: 812, alt: 'La barra del contenedor con sillas altas de madera y la ventana de la cocina abierta' },
  'lugar-patio': { src: 'fotos/lugar-patio', widths: [640, 1079], w: 1079, h: 811, alt: 'El patio de gravilla con el contenedor, las luces y los pendones de la carta' },
  'pendones-dia': { src: 'fotos/pendones-dia', widths: [640, 1080, 1600], w: 1600, h: 900, alt: 'Pendones de la carta: hamburguesa, perro caliente, desgranados, platos a la plancha, bebidas calientes, cocteles y cerveza, junto a la fogata metálica' },
  'pendones-noche': { src: 'fotos/pendones-noche', widths: [640, 1080, 1600], w: 1600, h: 1200, alt: 'De noche: luces de bombillo encendidas sobre los pendones de la carta' },
  'terraza-cubierta': { src: 'fotos/terraza-cubierta', widths: [480, 900, 1200], w: 1200, h: 1600, alt: 'Terraza cubierta con piso de madera, mesas y calentadores' },
  /* Desgranados: imagen de la propuesta del local (la única de IA, por ahora) */
  'desgranados-trio': { src: 'fotos/desgranados-trio', widths: [640, 1210], w: 1210, h: 380, alt: 'Tres desgranados en bowls negros con el monograma de entreverde' },
  'desgranado-clasico': { src: 'fotos/desgranado-clasico', widths: [440, 880], w: 880, h: 760, alt: 'Desgranado con maíz, tomate, pollo, alioli y papa cabuya encima' },
  'desgranado-bbq': { src: 'fotos/desgranado-bbq', widths: [410, 820], w: 820, h: 740, alt: 'Desgranado con cerdo BBQ, cebolla encurtida, cilantro y alioli' },
  'desgranado-verde': { src: 'fotos/desgranado-verde', widths: [430, 860], w: 860, h: 720, alt: 'Desgranado con pollo, aguacate en cubos, maíz y papa cabuya' },
  /* Pendientes: se muestra el marco "Foto próximamente" con el ícono de su pendón */
  'hamburguesa': { src: null, icono: 'hamburguesa', alt: 'Hamburguesa' },
  'perro': { src: null, icono: 'perro', alt: 'Perro caliente' },
  'ceviche': { src: null, icono: 'bowl', alt: 'Ceviche de chicharrón' },
  'papas': { src: null, icono: 'papas', alt: 'Papas para el centro' },
  'sandwich': { src: null, icono: 'plancha', alt: 'Sándwich tostado' },
  'plancha': { src: null, icono: 'plancha', alt: 'Plato a la plancha' },
  'pasta': { src: null, icono: 'plancha', alt: 'Pasta de la casa' },
  'cerveza': { src: null, icono: 'cerveza', alt: 'Cerveza' },
  'coctel': { src: null, icono: 'coctel', alt: 'Cóctel de la casa' },
  'jarra': { src: null, icono: 'coctel', alt: 'Jarra para compartir' },
  'vino': { src: null, icono: 'vino', alt: 'Vino para la mesa' },
  'bebida-caliente': { src: null, icono: 'taza', alt: 'Bebida caliente' },
  'gente': { src: null, icono: 'gente', alt: 'El parche brindando' },
};

export const CONFIG = {
  marca: {
    nombre: 'Entreverde',
    eslogan: 'Tragos y comida que se comparten',
    instagram: '@entrevrde',
    instagramUrl: 'https://www.instagram.com/entrevrde/',
    seguidores: 1799,
    publicaciones: 17,
    seguidos: 22,
    bio: ['“Tragos y comida que se comparten”', 'Santa Elena', 'Fines de semana: 4 pm a media noche', 'Domicilios: (322) 697 5160'],
    destacados: ['Ubicación', 'Menú'], // el destacado "Menú" tiene el código QR de la carta
    eventos: [{ nombre: 'Festival del sancocho trifásico en leña', cuando: 'Domingo 26 de julio · desde las 12:00 m.', detalle: '10% de descuento presentando la publicación' }],
    frase: 'Las ilusiones se sirven en cada plato y se brindan bajo el cielo.', // [PEDIR texto completo]
  },
  whatsapp: '573226975160',
  telefonoVisible: '(322) 697 5160',
  urlSitio: 'https://entreverde.co/', // [PONER dominio real] — se usa en los enlaces que se comparten
  direccion: {
    linea: '[PONER dirección exacta]',
    zona: 'Santa Elena, Medellín',
    camino: 'de camino al parque', // [CONFIRMAR: ¿Parque Arví o el parque principal de Santa Elena?]
    mapsQuery: 'Entreverde, Santa Elena, Medellín',
    referencia: 'Busca la reja de madera oscura y el aviso redondo de entreverde.',
  },
  /* Horario por día (0 = domingo … 6 = sábado). null = cerrado.
     [CONFIRMAR: la bio dice "fines de semana" y la publicación dice "jueves a domingo"]. */
  horario: {
    0: { abre: '16:00', cierra: '24:00' },
    1: null,
    2: null,
    3: null,
    4: { abre: '16:00', cierra: '24:00' },
    5: { abre: '16:00', cierra: '24:00' },
    6: { abre: '16:00', cierra: '24:00' },
  },
  /* Festivos de Colombia (lunes festivo incluido). Si `abre` es true, ese día se abre con `horario`. [CONFIRMAR] */
  festivos: {
    abre: true,
    horario: { abre: '16:00', cierra: '24:00' },
    fechas: [
      '2026-01-01', '2026-01-12', '2026-03-23', '2026-04-02', '2026-04-03', '2026-05-01', '2026-05-18',
      '2026-06-08', '2026-06-15', '2026-06-29', '2026-07-20', '2026-08-07', '2026-08-17', '2026-10-12',
      '2026-11-02', '2026-11-16', '2026-12-08', '2026-12-25',
      '2027-01-01', '2027-01-11', '2027-03-22', '2027-03-25', '2027-03-26', '2027-05-01', '2027-05-10',
      '2027-05-31', '2027-06-07', '2027-07-05', '2027-07-20', '2027-08-07', '2027-08-16', '2027-10-18',
      '2027-11-01', '2027-11-15', '2027-12-08', '2027-12-25',
    ],
  },
  reservas: {
    desde: '16:00',
    hasta: '22:30',
    cadaMin: 30,
    diasAdelante: 30,
    zonas: ['Terraza segundo piso', 'Abajo junto a la fogata', 'Barra', 'Terraza cubierta', 'Me da igual'], // [CONFIRMAR]
    ocasiones: ['Parche', 'Cumpleaños', 'Cita', 'Celebración de empresa'],
  },
  domicilio: {
    tiempo: '35–50 min', // [CONFIRMAR]
    zonas: [ // [CONFIRMAR veredas, sectores y costos]
      { id: 'centro', nombre: 'Santa Elena centro', costo: 4000 },
      { id: 'el-placer', nombre: 'El Placer', costo: 5000 },
      { id: 'el-plan', nombre: 'El Plan', costo: 5000 },
      { id: 'media-luna', nombre: 'Media Luna', costo: 6000 },
      { id: 'barro-blanco', nombre: 'Barro Blanco', costo: 7000 },
      { id: 'mazo', nombre: 'Mazo', costo: 8000 },
      { id: 'piedras-blancas', nombre: 'Piedras Blancas', costo: 8000 },
      { id: 'las-palmas', nombre: 'Las Palmas', costo: 9000 },
    ],
  },
  recoger: true, // [CONFIRMAR si ofrecen recoger en el local]
  pagos: ['Efectivo', 'Transferencia', 'Nequi'], // [CONFIRMAR]
  /* Regla de recomendación: cuántas personas cubre cada porción. */
  reglas: { cubre: { '1': 1, '2-3': 2.5, 'grupo': 4 }, personasPorJarra: 6 },
  /* Muestra en pantalla las marcas de "dato de ejemplo". Ponlo en false cuando lleguen los datos reales. */
  marcasEjemplo: true,
};

export const PORCIONES = { '1': 'para 1', '2-3': 'para 2–3', 'grupo': 'para el grupo' };

export const CATEGORIAS = [
  { id: 'todo', nombre: 'Todo' },
  { id: 'desgranados', nombre: 'Desgranados' },
  { id: 'combos', nombre: 'Combos' },
  { id: 'hamburguesas', nombre: 'Hamburguesas y perros' },
  { id: 'picar', nombre: 'Para picar' },
  { id: 'plancha', nombre: 'Plancha y fuertes' },
  { id: 'tragos', nombre: 'Cocteles y cerveza' },
  { id: 'calientes', nombre: 'Bebidas calientes' },
];

/* ---------- Carta. Precios de ejemplo en pesos colombianos [PONER precios reales]. ---------- */
export const CARTA = [
  { id: 'desgranado-casa', nombre: 'Desgranado de la casa', desc: 'Maíz tierno, pollo desmechado, tomate, queso, alioli de hierbas y papa cabuya por encima.', cat: 'desgranados', precio: 34000, porcion: '2-3', foto: 'desgranado-clasico', tam: 'grande', destacado: true, ingredientes: ['Maíz tierno', 'Pollo desmechado', 'Tomate', 'Queso', 'Alioli de hierbas', 'Papa cabuya'], disponible: true, ejemplo: true },
  { id: 'arma-desgranado', especial: 'builder', nombre: 'Arma tu desgranado', desc: 'Escoge proteína, vegetales, queso, extras y salsa. Ponle nombre y compártelo.', cat: 'desgranados', tam: 'alta', destacado: true },
  { id: 'combo-parche', nombre: 'Combo El Parche', desc: 'Tres desgranados a elección, papas para el centro, tres cervezas y tres salsas de la casa.', cat: 'combos', precio: 129000, porcion: 'grupo', foto: 'desgranados-trio', tam: 'ancha', destacado: true, nuevo: true, ingredientes: ['3 desgranados a elección', 'Papas para el centro', '3 cervezas', '3 salsas de la casa'], disponible: true, ejemplo: true },
  { id: 'desgranado-bbq', nombre: 'Desgranado BBQ', desc: 'Cerdo en BBQ artesanal, cebolla encurtida, cilantro y alioli.', cat: 'desgranados', precio: 36000, porcion: '2-3', foto: 'desgranado-bbq', destacado: true, ingredientes: ['Maíz tierno', 'Cerdo BBQ', 'Cebolla encurtida', 'Cilantro', 'Alioli de hierbas'], disponible: true, ejemplo: true },
  { id: 'desgranado-verde', nombre: 'Desgranado Verde', desc: 'Pollo, aguacate en cubos, maíz, hierbas y papa cabuya.', cat: 'desgranados', precio: 35000, porcion: '2-3', foto: 'desgranado-verde', destacado: true, ingredientes: ['Maíz tierno', 'Pollo desmechado', 'Aguacate', 'Hierbas frescas', 'Papa cabuya'], disponible: true, ejemplo: true },
  { id: 'combo-dos', nombre: 'Combo Para Dos', desc: 'Dos desgranados personales, papas para el centro y dos cervezas.', cat: 'combos', precio: 72000, porcion: '2-3', foto: 'desgranado-bbq', disponible: true, ejemplo: true, ingredientes: ['2 desgranados personales', 'Papas para el centro', '2 cervezas'] },
  { id: 'hamburguesa', nombre: 'Hamburguesa Entreverde', desc: 'Carne jugosa, queso, vegetales frescos y papas en casco.', cat: 'hamburguesas', precio: 32000, porcion: '1', foto: 'hamburguesa', destacado: true, ingredientes: ['Pan', 'Carne de res', 'Queso', 'Lechuga', 'Papas en casco'], disponible: true, ejemplo: true },
  { id: 'perro', nombre: 'Perro caliente de la casa', desc: 'Salchicha, papa cabuya, maíz y salsas de la casa.', cat: 'hamburguesas', precio: 22000, porcion: '1', foto: 'perro', disponible: true, ejemplo: true, ingredientes: ['Pan', 'Salchicha', 'Papa cabuya', 'Maíz', 'Salsas'] },
  { id: 'ceviche', nombre: 'Ceviche de chicharrón', desc: 'Frescura cítrica y textura que cruje en cada bocado.', cat: 'picar', precio: 30000, porcion: '2-3', foto: 'ceviche', destacado: true, ingredientes: ['Chicharrón', 'Cebolla morada', 'Maíz', 'Limón', 'Cilantro'], disponible: true, ejemplo: true },
  { id: 'papas', nombre: 'Papas para el centro', desc: 'Papas con las tres salsas de la casa.', cat: 'picar', precio: 18000, porcion: 'grupo', foto: 'papas', disponible: true, ejemplo: true, ingredientes: ['Papas', 'Alioli', 'Salsa roja', 'Ranch'] },
  { id: 'sandwich', nombre: 'Sándwich tostado', desc: 'Pan tostado a la plancha, bien relleno y crocante.', cat: 'plancha', precio: 24000, porcion: '1', foto: 'sandwich', disponible: true, ejemplo: true, nombrePendiente: true },
  { id: 'plancha', nombre: 'Plato a la plancha', desc: 'Proteína a la plancha con acompañantes de la casa.', cat: 'plancha', precio: 38000, porcion: '1', foto: 'plancha', disponible: true, ejemplo: true, nombrePendiente: true },
  { id: 'pasta', nombre: 'Tagliatelle de la casa', desc: 'Pasta larga con salsa de la casa.', cat: 'plancha', precio: 34000, porcion: '1', foto: 'pasta', disponible: true, ejemplo: true, nombrePendiente: true },
  { id: 'cerveza', nombre: 'Cerveza bien fría', desc: 'Para chocar con todos los de la mesa.', cat: 'tragos', precio: 10000, porcion: '1', foto: 'cerveza', disponible: true, ejemplo: true },
  { id: 'vino', nombre: 'Botella de vino para la mesa', desc: 'Vino tinto para servir entre todos cuando cae la noche.', cat: 'tragos', precio: 85000, porcion: 'grupo', foto: 'vino', disponible: true, ejemplo: true, jarra: true },
  { id: 'jarra', nombre: 'Jarra de la casa', desc: 'Cóctel en jarra para servir entre todos.', cat: 'tragos', precio: 62000, porcion: 'grupo', foto: 'jarra', jarra: true, disponible: true, ejemplo: true },
  { id: 'coctel', nombre: 'Cóctel de la casa', desc: 'El trago de la noche, pregúntale al barman.', cat: 'tragos', precio: 26000, porcion: '1', foto: 'coctel', disponible: true, ejemplo: true },
  { id: 'limonada', nombre: 'Limonada de hierbabuena', desc: 'Sin alcohol, fresca y para cualquiera.', cat: 'tragos', precio: 10000, porcion: '1', foto: 'coctel', disponible: true, ejemplo: true },
  { id: 'canelazo', nombre: 'Canelazo para el frío', desc: 'Caliente, con canela y panela, para la noche en Santa Elena.', cat: 'calientes', precio: 14000, porcion: '1', foto: 'bebida-caliente', disponible: true, ejemplo: true },
  { id: 'chocolate', nombre: 'Chocolate con queso', desc: 'El clásico de la montaña.', cat: 'calientes', precio: 9000, porcion: '1', foto: 'bebida-caliente', disponible: false, ejemplo: true },
  { id: 'cafe', nombre: 'Café de la montaña', desc: 'Tinto o con leche, para calentar las manos.', cat: 'calientes', precio: 6000, porcion: '1', foto: 'bebida-caliente', disponible: true, ejemplo: true },
];

/* ---------- Arma tu desgranado (idea del local). Todos los ingredientes de la propuesta. ----------
   arte: cómo se dibuja cada ingrediente en el bowl (forma + colores + cantidad). */
export const DESGRANADO = {
  base: 'Maíz tierno desgranado',
  tamanos: [ // [CONFIRMAR precios]
    { id: 'personal', nombre: 'Personal', porcion: '1', precio: 26000 },
    { id: 'compartir', nombre: 'Para compartir', porcion: '2-3', precio: 39000 },
  ],
  pasos: [
    { id: 'proteina', nombre: 'Proteína', regla: 'Elige 1 o 2', min: 1, max: 2, items: [
      { id: 'pollo', nombre: 'Pollo desmechado', arte: { forma: 'shred', c: ['#E8D2A6', '#C9A774'], n: 26 } },
      { id: 'res-bbq', nombre: 'Carne de res BBQ', arte: { forma: 'chunk', c: ['#5E3020', '#8A4A2C'], n: 16 } },
      { id: 'cerdo', nombre: 'Cerdo ahumado', arte: { forma: 'chunk', c: ['#9A5A3A', '#C47E57'], n: 15 } },
      { id: 'tocineta', nombre: 'Tocineta crocante', arte: { forma: 'bacon', c: ['#9E3B26', '#E4A57E'], n: 9 } },
    ] },
    { id: 'vegetales', nombre: 'Vegetales', regla: 'Elige hasta 3', min: 0, max: 3, items: [
      { id: 'aguacate', nombre: 'Aguacate en cubos', arte: { forma: 'cube', c: ['#7EA34B', '#C2D883'], n: 12 } },
      { id: 'tomate', nombre: 'Tomate cherry', arte: { forma: 'tomato', c: ['#D53A26', '#F58A68'], n: 9 } },
      { id: 'cebolla', nombre: 'Cebolla encurtida', arte: { forma: 'ring', c: ['#D2448C', '#F3B6D3'], n: 9 } },
      { id: 'champinones', nombre: 'Champiñones salteados', arte: { forma: 'mushroom', c: ['#B48A62', '#E3C9A6'], n: 9 } },
      { id: 'zucchini', nombre: 'Zucchini asado', arte: { forma: 'zucchini', c: ['#4F7B33', '#DCE6B0'], n: 9 } },
      { id: 'pimenton', nombre: 'Pimentón asado', arte: { forma: 'strip', c: ['#C4321D', '#E8623F'], n: 11 } },
    ] },
    { id: 'quesos', nombre: 'Quesos', regla: 'Elige 1', min: 1, max: 1, items: [
      { id: 'mozzarella', nombre: 'Queso mozzarella', arte: { forma: 'grate', c: ['#FBF6E6', '#EFE4C4'], n: 34 } },
      { id: 'feta', nombre: 'Queso feta', arte: { forma: 'cube', c: ['#FAF8F0', '#E9E3D0'], n: 12 } },
      { id: 'cabra', nombre: 'Queso de cabra', arte: { forma: 'blob', c: ['#F6F2E8', '#E2DBCB'], n: 11 } },
      { id: 'campesino', nombre: 'Queso campesino', arte: { forma: 'crumble', c: ['#FFF8E2', '#EDE0B8'], n: 22 } },
    ] },
    { id: 'extras', nombre: 'Extras', regla: 'Elige hasta 2', min: 0, max: 2, items: [
      { id: 'papa-cabuya', nombre: 'Papa cabuya', arte: { forma: 'string', c: ['#E7B341', '#F6D27A'], n: 46 } },
      { id: 'almendra', nombre: 'Almendra tostada', arte: { forma: 'sliver', c: ['#D7B486', '#A8794A'], n: 16 } },
      { id: 'hierbas', nombre: 'Hierbas frescas', arte: { forma: 'leaf', c: ['#3F7D35', '#79B25E'], n: 16 } },
      { id: 'pico', nombre: 'Pico de gallo', arte: { forma: 'dice', c: ['#D8432E', '#6DA544', '#F4F0E6'], n: 24 } },
      { id: 'codorniz', nombre: 'Huevo de codorniz', arte: { forma: 'egg', c: ['#FBF7EE', '#E9DFC9'], n: 5 } },
      { id: 'pina', nombre: 'Piña asada', arte: { forma: 'pineapple', c: ['#F0C143', '#9A6A22'], n: 9 } },
    ] },
    { id: 'salsas', nombre: 'Salsas', regla: 'Elige 1', min: 1, max: 1, items: [
      { id: 'alioli', nombre: 'Alioli de hierbas', arte: { forma: 'drizzle', c: ['#EEF1D6', '#7FA35A'] } },
      { id: 'bbq', nombre: 'BBQ artesanal', arte: { forma: 'drizzle', c: ['#5B2415', '#8C3B22'] } },
      { id: 'mostaza', nombre: 'Mostaza miel', arte: { forma: 'drizzle', c: ['#E4A62C', '#F5CB6A'] } },
      { id: 'ranch', nombre: 'Ranch de la casa', arte: { forma: 'drizzle', c: ['#F7F2E6', '#9FB98A'] } },
      { id: 'picante', nombre: 'Picante suave', arte: { forma: 'drizzle', c: ['#D2452B', '#F07D4F'] } },
    ] },
  ],
  nombres: ['El Silletero', 'El de la Fogata', 'El Parchado', 'El Cielo Abierto', 'El Neblina', 'El Montañero', 'El de Camino al Parque', 'El Arriero', 'El Brisa', 'El Bombillo', 'El Estiba', 'El Monstera'],
  presets: [
    { nombre: 'El de la casa', sel: { proteina: ['res-bbq', 'pollo'], vegetales: ['cebolla', 'aguacate'], quesos: ['campesino'], extras: ['papa-cabuya', 'codorniz'], salsas: ['ranch'] } },
    { nombre: 'El Ahumado', sel: { proteina: ['cerdo', 'tocineta'], vegetales: ['pimenton', 'champinones'], quesos: ['mozzarella'], extras: ['papa-cabuya'], salsas: ['bbq'] } },
    { nombre: 'El Verde', sel: { proteina: ['pollo'], vegetales: ['aguacate', 'zucchini', 'tomate'], quesos: ['feta'], extras: ['hierbas', 'almendra'], salsas: ['alioli'] } },
  ],
};

/* ---------- Chat del hero. La respuesta 5 se calcula en vivo con el horario de Bogotá. ---------- */
export const CHAT_HERO = [
  { de: 'juli', texto: 'Oye, ¿vamos a Entreverde? 🍃' },
  { de: 'tu', texto: '¿Dónde queda?' },
  { de: 'juli', texto: 'En Santa Elena, de camino al parque' },
  { de: 'tu', texto: '¿Y hoy abren?' },
  { de: 'juli', texto: '__HORARIO__' },
  { de: 'tu', texto: 'Listo, pidamos para compartir' },
  { de: 'sistema', texto: 'Juli creó la mesa · 2 personas', accion: 'mesa' },
];

/* ---------- Testimonios: PLACEHOLDER, reemplazar por reseñas reales. ---------- */
export const TESTIMONIOS = [
  { titulo: 'Cumple de Vale', msgs: [
    { de: 'juli', quien: 'Vale', texto: 'Gracias por venir a mi cumple en Entreverde 🥹' },
    { de: 'tu', texto: 'El desgranado para compartir no duró nada' },
    { de: 'juli', quien: 'Vale', texto: 'Y la fogata a las 9 fue lo mejor' },
  ] },
  { titulo: 'Los del domingo', msgs: [
    { de: 'juli', quien: 'Santi', texto: '¿Repetimos el domingo?' },
    { de: 'tu', texto: 'Sí, pero esta vez yo armo el desgranado' },
    { de: 'juli', quien: 'Santi', texto: 'Le pusimos «El Neblina» y quedó brutal' },
  ] },
  { titulo: 'Plan de pareja', msgs: [
    { de: 'juli', quien: 'Caro', texto: 'Llegamos con sol y nos fuimos con las luces prendidas' },
    { de: 'tu', texto: 'Se siente uno en la montaña de verdad' },
  ] },
  { titulo: 'Domicilio en El Placer', msgs: [
    { de: 'juli', quien: 'Pipe', texto: 'Pedimos domicilio y llegó calientico' },
    { de: 'tu', texto: '¿Qué pidieron?' },
    { de: 'juli', quien: 'Pipe', texto: 'El combo del parche. Alcanzó para los 4' },
  ] },
];

export const FAQ = [
  { q: '¿Qué días y a qué hora abren?', a: 'De jueves a domingo, de 4:00 p. m. a 12:00 a. m. Algunos lunes festivos también abrimos.', ajustar: true, horario: true },
  { q: '¿Cómo llego?', a: 'Estamos en Santa Elena, de camino al parque, sobre la vía. Busca la reja de madera oscura y el aviso redondo de entreverde. Si vienes en carro, entras directo a la gravilla.', ajustar: true, foto: 'lugar-entrada' },
  { q: '¿Queda de camino al parque?', a: 'Sí. Es la parada perfecta antes o después del parque: llegas, pides algo para el centro y sigues.', ajustar: true },
  { q: '¿Hay parqueadero?', a: 'Hay espacio para parquear adentro, sobre la gravilla. Los fines de semana se llena temprano.', ajustar: true },
  { q: '¿Necesito reservar?', a: 'No es obligatorio. Para grupos de 6 o más, o si quieren la terraza del segundo piso, mejor separen la mesa.', ajustar: false },
  { q: '¿Hacen domicilios y a qué zonas?', a: 'Sí, en todo Santa Elena. El costo depende de la vereda o el sector; lo ves al armar el pedido.', ajustar: true },
  { q: '¿Puedo ir con mi perro?', a: 'Estamos al aire libre y los perros bien portados son bienvenidos.', ajustar: true },
  { q: '¿Hacen celebraciones o reservan para grupos grandes?', a: 'Sí: cumpleaños, despedidas y planes de empresa. Escríbenos con la fecha y cuántos son, y les armamos la mesa.', ajustar: false },
  { q: '¿Hacen eventos o festivales?', a: 'Sí. Ya hicimos el Festival del sancocho trifásico en leña, un domingo desde el mediodía y con descuento para quienes llegaron con la publicación. Los próximos planes los anunciamos en Instagram.', ajustar: false, eventos: true },
  { q: '¿Qué pasa si llueve?', a: 'Tenemos terraza cubierta y calentadores. La fogata se prende cuando el clima deja.', ajustar: true, foto: 'terraza-cubierta' },
];

/* ---------- Galería ---------- */
export const GALERIA = [
  { foto: 'desgranado-clasico', cat: 'comida', plato: 'desgranado-casa' },
  { foto: 'desgranado-bbq', cat: 'comida', plato: 'desgranado-bbq' },
  { foto: 'desgranado-verde', cat: 'comida', plato: 'desgranado-verde' },
  { foto: 'hamburguesa', cat: 'comida', plato: 'hamburguesa' },
  { foto: 'cerveza', cat: 'tragos', plato: 'cerveza' },
  { foto: 'coctel', cat: 'tragos' },
  { foto: 'lugar-angulo', cat: 'lugar' },
  { foto: 'pendones-noche', cat: 'lugar' },
  { foto: 'terraza-cubierta', cat: 'lugar' },
  { foto: 'lugar-letrero', cat: 'lugar' },
  { foto: 'pendones-dia', cat: 'lugar' },
  { foto: 'lugar-barra', cat: 'lugar' },
  { foto: 'lugar-patio', cat: 'lugar' },
  { foto: 'lugar-fachada', cat: 'lugar' },
  { foto: 'gente', cat: 'gente' },
];
