/* ==========================================================================
   CASA AMIGA — TODO EL CONTENIDO EDITABLE ESTÁ EN ESTE ARCHIVO
   Busca "[PONER]", "[CONFIRMAR]" y "[AJUSTAR]" para encontrar lo pendiente.
   ========================================================================== */

/** [PONER NÚMERO] WhatsApp en formato internacional, solo dígitos (57 + celular). */
export const WHATSAPP = '573000000000'

export const INSTAGRAM = 'galeria.casaamiga'
export const INSTAGRAM_URL = `https://www.instagram.com/${INSTAGRAM}/`

/** [CONFIRMAR dirección o pin exacto de Google Maps] */
export const DIRECCION = {
  linea1: 'Vereda El Placer, sector Amor y Amistad',
  linea2: 'Santa Elena, Medellín — Antioquia',
  referencia: 'A pasos de Restaurante Artesano', // [CONFIRMAR]
  consulta: 'Casa Amiga Galería, Vereda El Placer, Santa Elena, Medellín',
}
export const MAPS_EMBED = `https://www.google.com/maps?q=${encodeURIComponent(DIRECCION.consulta)}&output=embed`
export const MAPS_DIR = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(DIRECCION.consulta)}`

/** [PONER] Horario. Día 0 = domingo … 6 = sábado. null = cerrado. Horas en formato 24 h (hora de Bogotá). */
export const HORARIO = {
  0: [10, 18],
  1: null,
  2: null,
  3: null,
  4: null,
  5: [14, 19],
  6: [10, 19],
}
export const HORARIO_NOTA = 'Festivos: de 10:00 a. m. a 6:00 p. m.' // [PONER]

/** Nombre del perro de la casa. [CONFIRMAR NOMBRE] (si es null se muestra "el anfitrión") */
export const PERRO = null

export const wa = (msg) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`
export const asset = (p) => (p.startsWith("data:") ? p : `${import.meta.env.BASE_URL}${p}`)

/* ---------- El camino (mapa ilustrado) [CONFIRMAR orden] ---------- */
export const PARADAS = [
  { n: '01', nombre: 'El Silletero', nota: 'Punto de partida. Aquí empieza la subida.' },
  { n: '02', nombre: 'Finca silletera Óscar Londoño', nota: 'Flores y tradición silletera.' },
  { n: '03', nombre: 'Panchocha Santa Elena', nota: 'Sigue la vía entre pinos.' },
  { n: '04', nombre: 'La Samaria', nota: 'Ya casi: toma rumbo a El Placer.' },
  { n: '05', nombre: 'Restaurante Artesano', nota: 'A pasos de la casa.' },
  { n: '06', nombre: 'Casa Amiga', nota: 'Vereda El Placer · Amor y Amistad', casa: true },
]

/* ---------- Galería ---------- */
export const CATEGORIAS = [
  { id: 'todo', label: 'Todo' },
  { id: 'pintura', label: 'Pintura' },
  { id: 'ilustracion', label: 'Ilustración' },
  { id: 'diseno', label: 'Diseño y objetos' },
  { id: 'plantas', label: 'Plantas' },
] // [AJUSTAR]

/** [PONER] artista, título, técnica, medidas y precio reales. precio: null => "Precio a consultar".
    Las imágenes actuales son recortes de Instagram: reemplazar por fotos originales en /public/img. */
export const OBRAS = [
  { id: 'o1', n: '01', titulo: 'Floración interior', artistaId: 'a1', categoria: 'pintura', tecnica: 'Acrílico sobre lienzo', medidas: '60 × 90 cm', precio: null, img: 'img/obra-04.jpg', destacada: true, descripcion: 'Color en estado líquido: una flor que se abre hacia adentro. Pieza central de la sala.' },
  { id: 'o2', n: '02', titulo: 'Vórtice I', artistaId: 'a1', categoria: 'pintura', tecnica: 'Acrílico sobre lienzo', medidas: '30 × 45 cm', precio: null, img: 'img/obra-01.jpg', descripcion: 'Serie de pequeños formatos sobre el movimiento del color.' },
  { id: 'o3', n: '03', titulo: 'Vórtice II', artistaId: 'a1', categoria: 'pintura', tecnica: 'Acrílico sobre lienzo', medidas: '30 × 45 cm', precio: null, img: 'img/obra-02.jpg', descripcion: 'Segunda pieza de la serie Vórtice.' },
  { id: 'o4', n: '04', titulo: 'Marea', artistaId: 'a2', categoria: 'ilustracion', tecnica: 'Ilustración digital, impresión giclée', medidas: '30 × 45 cm', precio: null, img: 'img/obra-03.jpg', destacada: true, descripcion: 'Ilustración psicodélica impresa en papel de algodón.' },
  { id: 'o5', n: '05', titulo: 'Sala de colores', artistaId: 'a2', categoria: 'ilustracion', tecnica: 'Serie de ilustraciones', medidas: 'Varias medidas', precio: null, img: 'img/obras-pared.jpg', descripcion: 'Conjunto de piezas colgadas en la pared blanca de la galería.' },
  { id: 'o6', n: '06', titulo: 'Lámpara hongo', artistaId: 'a3', categoria: 'diseno', tecnica: 'Objeto de diseño · cerámica y luz', medidas: '35 cm de alto', precio: null, img: 'img/objeto-lampara-hongo.jpg', destacada: true, descripcion: 'La lámpara roja con puntos blancos que ilumina la repisa de la casa.' },
  { id: 'o7', n: '07', titulo: 'Repisa de la casa', artistaId: 'a3', categoria: 'diseno', tecnica: 'Objetos hechos a mano', medidas: 'Varias medidas', precio: null, img: 'img/interior.jpg', descripcion: 'Objetos, materas y piezas pequeñas de creadores locales.' },
  { id: 'o8', n: '08', titulo: 'Rhipsalis colgante', artistaId: 'a4', categoria: 'plantas', tecnica: 'Planta viva · matera artesanal', medidas: 'Matera de 15 cm', precio: null, img: 'img/plantas.jpg', destacada: true, descripcion: 'Cactus colgante de bosque. Fácil de cuidar, perfecto para interiores con luz suave.' },
]

/** [PONER ARTISTAS] Los retratos actuales vienen de los afiches de eventos: confirmar nombres y permisos. */
export const ARTISTAS = [
  { id: 'a1', nombre: 'Artista 01', disciplina: 'Pintura', instagram: null, foto: 'img/artista-1.jpg' },
  { id: 'a2', nombre: 'Artista 02', disciplina: 'Ilustración', instagram: null, foto: 'img/artista-2.jpg' },
  { id: 'a3', nombre: 'Artista 03', disciplina: 'Diseño y objetos', instagram: null, foto: null },
  { id: 'a4', nombre: 'Casa Amiga', disciplina: 'Plantas y jardín', instagram: INSTAGRAM, foto: null },
]

/* ---------- Talleres y eventos [CONFIRMAR FECHAS, PRECIOS Y CUPOS] ----------
   inicio: fecha ISO con zona horaria de Bogotá (-05:00). */
export const EVENTOS = [
  { id: 'e1', titulo: 'Taller cartográfico sensorial', tipo: 'Taller', inicio: '2026-11-22T11:00:00-05:00', hora: '11:00 a. m. – 12:00 m.', cupos: 12, precio: null, guia: '[PONER]' },
  { id: 'e2', titulo: 'Taller de ilustración infantil', tipo: 'Niños', inicio: '2026-11-22T14:00:00-05:00', hora: '2:00 – 2:30 p. m.', cupos: 10, precio: null, guia: '[PONER]' },
  { id: 'e3', titulo: 'Música en vivo', tipo: 'Concierto', inicio: '2026-11-29T15:00:00-05:00', hora: '3:00 – 4:00 p. m.', cupos: 30, precio: 0, guia: '[PONER]' },
  { id: 'e4', titulo: 'Taller de germinados', tipo: 'Taller', inicio: '2026-12-06T15:30:00-05:00', hora: '3:30 – 4:30 p. m.', cupos: 12, precio: null, guia: '[PONER]' },
  { id: 'e5', titulo: 'Diagnóstico express para emprendimientos', tipo: 'Asesoría', inicio: '2026-12-13T15:00:00-05:00', hora: '3:00 – 5:00 p. m.', cupos: 8, precio: null, guia: '[PONER]' },
]

/* ---------- Cifras [PONER CIFRAS REALES]. value: null => no se muestra. ---------- */
export const CIFRAS = [
  { value: null, label: 'artistas locales' },
  { value: null, label: 'obras en sala' },
  { value: null, label: 'talleres al año' },
  { value: 6, label: 'paradas desde El Silletero hasta la puerta' },
  { value: 1, label: 'casa en la Vereda El Placer' },
]

/* ---------- Libro de visitas — PLACEHOLDER: reemplazar por reseñas reales ---------- */
export const VISITAS = [
  { cita: 'Subimos por un café y nos quedamos toda la tarde mirando obras. Se siente como visitar a una amiga.', nombre: 'Nombre Apellido', origen: 'Medellín', placeholder: true },
  { cita: 'El taller fue hermoso, mis hijos salieron dibujando mapas de todo el camino.', nombre: 'Nombre Apellido', origen: 'Envigado', placeholder: true },
  { cita: 'Compré una ilustración y me la enviaron bien empacada. La casa es preciosa de noche.', nombre: 'Nombre Apellido', origen: 'Bogotá', placeholder: true },
  { cita: 'Arte local, plantas, y un perro que te recibe en la puerta. Volveremos.', nombre: 'Nombre Apellido', origen: 'Rionegro', placeholder: true },
]

/* ---------- FAQ [AJUSTAR] ---------- */
export const FAQ = [
  { q: '¿Cómo llego?', a: 'Sube a Santa Elena por la vía Medellín – Santa Elena hasta El Silletero y sigue las indicaciones hacia la Vereda El Placer, sector Amor y Amistad. Más arriba en esta página tienes el camino paso a paso y el botón para abrir Google Maps.' },
  { q: '¿Hay parqueadero?', a: 'Hay espacio para parquear cerca de la casa. Si vienes en grupo grande, escríbenos antes para organizarnos.' },
  { q: '¿La entrada tiene costo?', a: 'La entrada a la galería es libre. Los talleres tienen su propio valor, que encuentras en la agenda.' },
  { q: '¿Puedo comprar las obras y las envían?', a: 'Sí. Todas las obras están a la venta. Escríbenos por WhatsApp con el título y te contamos precio, disponibilidad y opciones de envío dentro de Colombia.' },
  { q: '¿Soy artista, cómo expongo aquí?', a: 'Cuéntanos de tu trabajo en el formulario de esta página (opción "Soy artista y quiero exponer") con un enlace a tu portafolio. Revisamos cada propuesta con calma.' },
  { q: '¿Aceptan mascotas?', a: 'Sí, con correa y buena energía. En la casa vive un perro que recibe a todos en la puerta.' },
  { q: '¿Cuál es el horario?', a: 'Consulta el horario actualizado en la sección "Visítanos". Si vienes en otro momento, escríbenos y te contamos.' },
]
