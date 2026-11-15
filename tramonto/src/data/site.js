/* ==========================================================================
   TRAMONTO DI SANTA ELENA · DATOS CENTRALES
   --------------------------------------------------------------------------
   Todo el contenido editable vive aquí. Para cambiar un placeholder por una
   foto real, pon la ruta en el campo `src` (ej: './fotos/pizza.webp') y el
   diseño la mostrará sin tocar nada más. Los videos van en `video`
   (loop mudo, .mp4/.webm).
   Los textos marcados con `pending` se muestran en pantalla con una etiqueta
   para que nadie olvide confirmarlos. Cuando todo esté confirmado, pon
   SHOW_PENDING = false.
   ========================================================================== */

export const SHOW_PENDING = true;

export const business = {
  name: 'Tramonto di Santa Elena',
  tagline: 'Un pedacito de Italia en Santa Elena',
  instagram: {
    handle: '@tramontosantaelena',
    url: 'https://www.instagram.com/tramontosantaelena/',
    followers: 3150,
    posts: 132,
    following: 365,
  },
  whatsapp: {
    // [PONER] Número real en formato internacional sin "+" ni espacios. Ej: '573001234567'.
    // Mientras esté vacío, los botones abren wa.link y copian el mensaje al portapapeles.
    number: '',
    shortLink: 'https://wa.link/04iqwg', // [CONFIRMAR]
  },
  address: {
    line: '[PONER dirección exacta]',
    area: 'Santa Elena, Medellín, Antioquia',
    pending: true,
  },
  mapsQuery: 'Tramonto di Santa Elena, Santa Elena, Medellín',
  delivery: {
    zones: ['[PONER zonas de cobertura]'],
    pending: true,
  },
};

/* --------------------------------------------------------------------------
   HORARIO  ·  [PONER] horas reales. Días: 0=domingo … 6=sábado.
   Las horas de abajo son DE EJEMPLO para que el indicador en vivo funcione.
   -------------------------------------------------------------------------- */
export const schedule = {
  pending: true,
  timeZone: 'America/Bogota',
  days: {
    4: { open: '12:00', close: '21:00' }, // jueves
    5: { open: '12:00', close: '22:00' }, // viernes
    6: { open: '12:00', close: '22:00' }, // sábado
    0: { open: '12:00', close: '20:00' }, // domingo
  },
  holiday: { open: '12:00', close: '20:00' }, // festivos
};

/* Festivos de Colombia 2026–2027 (Ley Emiliani). Lista editable. */
export const holidays = [
  { date: '2026-01-01', name: 'Año Nuevo' },
  { date: '2026-01-12', name: 'Reyes Magos' },
  { date: '2026-03-23', name: 'San José' },
  { date: '2026-04-02', name: 'Jueves Santo' },
  { date: '2026-04-03', name: 'Viernes Santo' },
  { date: '2026-05-01', name: 'Día del Trabajo' },
  { date: '2026-05-18', name: 'Ascensión del Señor' },
  { date: '2026-06-08', name: 'Corpus Christi' },
  { date: '2026-06-15', name: 'Sagrado Corazón' },
  { date: '2026-06-29', name: 'San Pedro y San Pablo' },
  { date: '2026-07-20', name: 'Independencia' },
  { date: '2026-08-07', name: 'Batalla de Boyacá' },
  { date: '2026-08-17', name: 'Asunción de la Virgen' },
  { date: '2026-10-12', name: 'Día de la Raza' },
  { date: '2026-11-02', name: 'Todos los Santos' },
  { date: '2026-11-16', name: 'Independencia de Cartagena' },
  { date: '2026-12-08', name: 'Inmaculada Concepción' },
  { date: '2026-12-25', name: 'Navidad' },
  { date: '2027-01-01', name: 'Año Nuevo' },
  { date: '2027-01-11', name: 'Reyes Magos' },
  { date: '2027-03-22', name: 'San José' },
  { date: '2027-03-25', name: 'Jueves Santo' },
  { date: '2027-03-26', name: 'Viernes Santo' },
  { date: '2027-05-01', name: 'Día del Trabajo' },
  { date: '2027-05-10', name: 'Ascensión del Señor' },
  { date: '2027-05-31', name: 'Corpus Christi' },
  { date: '2027-06-07', name: 'Sagrado Corazón' },
  { date: '2027-07-05', name: 'San Pedro y San Pablo' },
  { date: '2027-07-20', name: 'Independencia' },
  { date: '2027-08-07', name: 'Batalla de Boyacá' },
  { date: '2027-08-16', name: 'Asunción de la Virgen' },
  { date: '2027-10-18', name: 'Día de la Raza' },
  { date: '2027-11-01', name: 'Todos los Santos' },
  { date: '2027-11-15', name: 'Independencia de Cartagena' },
  { date: '2027-12-08', name: 'Inmaculada Concepción' },
  { date: '2027-12-25', name: 'Navidad' },
];

/* --------------------------------------------------------------------------
   MEDIOS  ·  cada lugar donde irá una foto lee de aquí.
   tone: color del marco placeholder (mandarina · durazno · ladrillo · naranja · dorado)
   art:  ilustración SVG que se muestra mientras no hay foto (o null)
   -------------------------------------------------------------------------- */
export const media = {
  heroCabin: { src: '', alt: 'La cabaña de madera de Tramonto al atardecer', tone: 'ladrillo', art: 'mountain' },
  goldenSubes: { src: '', alt: 'La montaña de Santa Elena con neblina al atardecer', tone: 'dorado', art: 'mountain' },
  goldenBrindas: { src: '', alt: 'Martini cítrico con borde escarchado y cóctel rojo en copa', tone: 'durazno', art: 'cocktail' },
  goldenCenas: { src: '', alt: 'Pizza servida en plato de cerámica pintada a mano', tone: 'mandarina', art: 'pizza' },
  goldenDolce: { src: '', alt: 'Galleta gigante en sartén de hierro con helado, chocolate y canela', tone: 'cacao', art: 'cookie' },
  petDog: { src: '', alt: 'Un perro sentado junto a la mesa en Tramonto', tone: 'durazno', art: 'dog', pending: 'PEDIR FOTO REAL MÁS ADELANTE' },
};

/* --------------------------------------------------------------------------
   IL MENÙ  ·  [PASAR desde el highlight "Menú" de Instagram]
   Todos los platos y precios son DE EJEMPLO.
   -------------------------------------------------------------------------- */
export const menuPending = 'CARTA DE EJEMPLO · PASAR DESDE EL HIGHLIGHT "MENÚ"';

export const menu = [
  {
    id: 'antipasti',
    label: 'Antipasti',
    note: 'Para abrir la mesa',
    items: [
      { name: 'Bruschetta al pomodoro', price: '$00.000', ingredients: 'Pan del horno, tomate, ajo, albahaca, aceite de oliva', veg: true, media: { src: '', tone: 'durazno', art: 'bruschetta' } },
      { name: 'Burrata Tramonto', price: '$00.000', ingredients: 'Burrata, tomates asados, pesto, pan tostado', veg: true, media: { src: '', tone: 'mandarina', art: 'burrata' } },
      { name: 'Focaccia del horno', price: '$00.000', ingredients: 'Romero, sal marina, aceite de oliva', veg: true, media: { src: '', tone: 'ladrillo', art: 'focaccia' } },
      { name: 'Tagliere della casa', price: '$00.000', ingredients: 'Jamón, salami, quesos, aceitunas, mermelada', media: { src: '', tone: 'ladrillo', art: 'board' } },
    ],
  },
  {
    id: 'pizze',
    label: 'Pizze',
    note: 'Masa madre, horno encendido',
    items: [
      { name: 'Margherita', price: '$00.000', ingredients: 'Tomate San Marzano, mozzarella, albahaca', veg: true, media: { src: '', tone: 'mandarina', art: 'pizza' } },
      { name: 'Diavola', price: '$00.000', ingredients: 'Tomate, mozzarella, salami picante, miel', media: { src: '', tone: 'ladrillo', art: 'pizza' } },
      { name: 'Prosciutto e rucola', price: '$00.000', ingredients: 'Mozzarella, jamón serrano, rúgula, parmesano', media: { src: '', tone: 'durazno', art: 'pizza' } },
      { name: 'Quattro formaggi', price: '$00.000', ingredients: 'Mozzarella, gorgonzola, parmesano, provolone', veg: true, media: { src: '', tone: 'dorado', art: 'pizza' } },
      { name: 'La Tramonto', price: '$00.000', ingredients: 'La de la casa: pregúntale al mesero', media: { src: '', tone: 'naranja', art: 'pizza' } },
    ],
  },
  {
    id: 'pasta',
    label: 'Pasta',
    note: 'Hecha con calma',
    items: [
      { name: 'Rigatoni alla carbonara', price: '$00.000', ingredients: 'Guanciale, yema, pecorino, pimienta negra', media: { src: '', tone: 'durazno', art: 'pasta' } },
      { name: 'Penne al pomodoro', price: '$00.000', ingredients: 'Salsa de tomate de la casa, albahaca, parmesano', veg: true, media: { src: '', tone: 'mandarina', art: 'pasta' } },
      { name: 'Fettuccine alla bolognese', price: '$00.000', ingredients: 'Ragú de res cocinado lento, parmesano', media: { src: '', tone: 'ladrillo', art: 'pasta' } },
      { name: 'Funghi e tartufo', price: '$00.000', ingredients: 'Champiñones, crema, aceite de trufa', veg: true, media: { src: '', tone: 'dorado', art: 'pasta' } },
    ],
  },
  {
    id: 'dolci',
    label: 'Dolci',
    note: 'La sobremesa',
    items: [
      { name: 'La galleta en sartén', price: '$00.000', ingredients: 'Galleta gigante en sartén de hierro, helado, chocolate y canela', veg: true, media: { src: '', tone: 'cacao', art: 'cookie' } },
      { name: 'Tiramisù', price: '$00.000', ingredients: 'Mascarpone, café, cacao', veg: true, media: { src: '', tone: 'durazno', art: 'tiramisu' } },
      { name: 'Panna cotta', price: '$00.000', ingredients: 'Vainilla y frutos rojos', veg: true, media: { src: '', tone: 'mandarina', art: 'tiramisu' } },
    ],
  },
  {
    id: 'cocktails',
    label: 'Cocktails',
    note: 'De autor, para brindar',
    items: [
      { name: 'Martini cítrico', price: '$00.000', ingredients: 'Borde escarchado, cítricos, vodka', media: { src: '', tone: 'durazno', art: 'martini' } },
      { name: 'Rosso Tramonto', price: '$00.000', ingredients: 'El rojo en copa de la casa', media: { src: '', tone: 'ladrillo', art: 'coupe' } },
      { name: 'Spritz della sera', price: '$00.000', ingredients: 'Aperitivo, prosecco, naranja', media: { src: '', tone: 'mandarina', art: 'coupe' } },
      { name: 'Limonada de la montaña', price: '$00.000', ingredients: 'Sin alcohol: limón, hierbabuena, panela', veg: true, media: { src: '', tone: 'durazno', art: 'martini' } },
    ],
  },
];

/* --------------------------------------------------------------------------
   GALERÍA  ·  `featured: true` = la que aparece en "Todo" (1 por categoría).
   -------------------------------------------------------------------------- */
export const galleryFilters = [
  { id: 'todo', label: 'Todo' },
  { id: 'pizzas', label: 'Pizzas' },
  { id: 'pasta', label: 'Pasta' },
  { id: 'dolci', label: 'Dolci' },
  { id: 'cocktails', label: 'Cocktails' },
  { id: 'casa', label: 'La casa' },
  { id: 'clientes', label: 'Clientes' },
  { id: 'mascotas', label: 'Mascotas' },
];

export const gallery = [
  { id: 'g-pizza-1', cat: 'pizzas', featured: true, title: 'Pizza vista desde arriba', ingredients: 'En cerámica pintada a mano', description: 'Masa delgada, horno bien caliente y un plato pintado a mano en azul, rojo y amarillo.', src: '', video: '', tone: 'mandarina', shape: 'arch', dish: 'Pizza Margherita' },
  { id: 'g-pizza-2', cat: 'pizzas', title: 'Diavola', ingredients: 'Salami picante y miel', description: 'Para los que quieren un poquito de fuego al atardecer.', src: '', video: '', tone: 'ladrillo', shape: 'tall', dish: 'Pizza Diavola' },
  { id: 'g-pizza-3', cat: 'pizzas', title: 'Prosciutto e rucola', ingredients: 'Jamón, rúgula, parmesano', description: 'Fresca, salada y con mucho verde encima.', src: '', video: '', tone: 'durazno', shape: 'square', dish: 'Pizza Prosciutto e rucola' },
  { id: 'g-pasta-1', cat: 'pasta', featured: true, title: 'Rigatoni alla carbonara', ingredients: 'Guanciale, yema, pecorino', description: 'Cremosa sin crema, como se hace en Roma.', src: '', video: '', tone: 'durazno', shape: 'tall', dish: 'Rigatoni alla carbonara' },
  { id: 'g-pasta-2', cat: 'pasta', title: 'Penne al pomodoro', ingredients: 'Tomate, albahaca, parmesano', description: 'Lo simple, bien hecho.', src: '', video: '', tone: 'mandarina', shape: 'arch', dish: 'Penne al pomodoro' },
  { id: 'g-dolci-1', cat: 'dolci', featured: true, title: 'La galleta en sartén', ingredients: 'Helado, chocolate y canela', description: 'Una galleta gigante servida en sartén de hierro, todavía caliente, con helado que se derrite encima.', src: '', video: '', tone: 'ladrillo', shape: 'arch', dish: 'La galleta en sartén' },
  { id: 'g-dolci-2', cat: 'dolci', title: 'Tiramisù', ingredients: 'Mascarpone, café, cacao', description: 'El clásico para la sobremesa larga.', src: '', video: '', tone: 'durazno', shape: 'square', dish: 'Tiramisù' },
  { id: 'g-cock-1', cat: 'cocktails', featured: true, title: 'Martini cítrico', ingredients: 'Borde escarchado', description: 'El cóctel de la hora dorada: cítrico, frío y con el borde escarchado.', src: '', video: '', tone: 'dorado', shape: 'tall', dish: 'Martini cítrico' },
  { id: 'g-cock-2', cat: 'cocktails', title: 'Rosso Tramonto', ingredients: 'El rojo en copa', description: 'Del color del cielo cuando el sol toca la montaña.', src: '', video: '', tone: 'ladrillo', shape: 'arch', dish: 'Rosso Tramonto' },
  { id: 'g-casa-1', cat: 'casa', featured: true, title: 'La cabaña de noche', ingredients: 'Madera, luces cálidas, vino', description: 'Interior de madera tipo cabaña, luces cálidas y botellas de vino en la barra.', src: '', video: '', tone: 'ladrillo', shape: 'square', dish: '' },
  { id: 'g-casa-2', cat: 'casa', title: 'La fachada al atardecer', ingredients: 'Santa Elena', description: 'Así se ve Tramonto cuando el sol baja detrás de la montaña.', src: '', video: '', tone: 'mandarina', shape: 'arch', dish: '' },
  { id: 'g-cli-1', cat: 'clientes', featured: true, title: 'Reels en la mesa', ingredients: 'Amici de Tramonto', description: 'Clientes e influencers grabando sus reels en la mesa, de tarde y de noche.', src: '', video: '', tone: 'durazno', shape: 'arch', dish: '' },
  { id: 'g-cli-2', cat: 'clientes', title: 'Una cena romántica', ingredients: 'Mesa para dos', description: 'El atardecer como excusa.', src: '', video: '', tone: 'mandarina', shape: 'tall', dish: '' },
  { id: 'g-pet-1', cat: 'mascotas', featured: true, title: 'Amici de cuatro patas', ingredients: 'Pet friendly', description: 'Los perros también son bienvenidos en el salón.', src: '', video: '', tone: 'mandarina', shape: 'tall', dish: '' },
  { id: 'g-pet-2', cat: 'mascotas', title: 'A los pies de la mesa', ingredients: 'Con su agua', description: 'Pídele agua al mesero para tu perro.', src: '', video: '', tone: 'durazno', shape: 'square', dish: '' },
];

/* --------------------------------------------------------------------------
   TESTIMONIOS  ·  PLACEHOLDER: reemplazar por los del highlight "Clientes"
   -------------------------------------------------------------------------- */
export const testimonials = [
  { quote: 'Subimos por la tarde y nos quedamos hasta que se hizo de noche. La pizza en ese plato pintado es otra cosa.', name: 'Nombre del cliente', place: 'Medellín', greeting: 'Cara Tramonto,' },
  { quote: 'Fuimos con Lola, nuestra perrita, y le trajeron agua antes que a nosotros el menú. Volvemos seguro.', name: 'Nombre del cliente', place: 'Envigado', greeting: 'Ciao amici,' },
  { quote: 'La galleta en sartén con helado vale el viaje a la montaña. Y el martini cítrico, también.', name: 'Nombre del cliente', place: 'Santa Elena', greeting: 'Grazie mille,' },
  { quote: 'Cabaña de madera, neblina afuera, horno encendido adentro. El sitio más romántico de Santa Elena.', name: 'Nombre del cliente', place: 'Rionegro', greeting: 'Buonasera,' },
];

/* --------------------------------------------------------------------------
   FAQ  ·  respuestas [AJUSTAR]
   -------------------------------------------------------------------------- */
export const faq = [
  { q: '¿Qué días abren?', a: 'Abrimos de jueves a domingo y también los festivos. Lunes, martes y miércoles descansamos (excepto si es festivo).', pending: false },
  { q: '¿Necesito reservar?', a: 'Para fines de semana y festivos te recomendamos reservar por WhatsApp, sobre todo si vienes al atardecer o en grupo. Entre semana suele haber mesa sin reserva.', pending: true },
  { q: '¿Puedo ir con mi perro?', a: '¡Sí! Somos pet friendly. Tu perro es bienvenido en el salón con correa, y si le pides agua al mesero se la llevamos.', pending: false },
  { q: '¿Hacen domicilios y a qué zonas?', a: 'Sí, hacemos domicilios. Zonas de cobertura: [PONER zonas]. Escríbenos por WhatsApp con tu barrio y te confirmamos.', pending: true },
  { q: '¿Tienen opciones vegetarianas?', a: 'Sí. En la carta las marcamos con una hojita de albahaca: pizzas, pastas, antipasti y postres.', pending: true },
  { q: '¿Hay parqueadero?', a: '[PONER] Información de parqueadero.', pending: true },
  { q: '¿Cómo llego?', a: 'Estamos en el corazón de Santa Elena, Medellín: [PONER indicaciones]. Toca "Cómo llegar" más abajo y Google Maps te lleva hasta la puerta.', pending: true },
];

/* --------------------------------------------------------------------------
   LA HORA DORADA
   -------------------------------------------------------------------------- */
export const goldenHour = [
  { hour: '16:00', verb: 'Subes', text: 'La montaña, la neblina y el olor a horno de leña.', bg: 'dorado', media: 'goldenSubes' },
  { hour: '17:00', verb: 'Brindas', text: 'Cócteles de autor para empezar la tarde.', bg: 'mandarina', media: 'goldenBrindas' },
  { hour: '18:00', verb: 'Cenas', text: 'Pizza y pasta como en Italia, servidas en cerámica pintada a mano.', bg: 'naranja', media: 'goldenCenas' },
  { hour: '19:00', verb: 'Il dolce', text: 'La galleta en sartén con helado, para cerrar con calma.', bg: 'ladrillo', media: 'goldenDolce', night: true },
];

export const navLinks = [
  { label: 'Il Menù', href: '#menu' },
  { label: 'La casa', href: '#la-casa' },
  { label: 'Galería', href: '#galeria' },
  { label: 'Visítanos', href: '#visitanos' },
];

export const tones = {
  mandarina: { bg: '#F8A85B', fg: '#2A1410' },
  durazno: { bg: '#FFDDB8', fg: '#2A1410' },
  ladrillo: { bg: '#8A2F0C', fg: '#FFF8EE' },
  naranja: { bg: '#EB7126', fg: '#2A1410' },
  dorado: { bg: '#F6B547', fg: '#2A1410' },
  cacao: { bg: '#3B1D17', fg: '#FFF8EE' },
  crema: { bg: '#FFF8EE', fg: '#2A1410' },
};
