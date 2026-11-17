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

/** [PONER] Horario (hoy es un EJEMPLO, no se muestra hasta confirmar). Día 0 = domingo … 6 = sábado. null = cerrado. Horas en formato 24 h (hora de Bogotá). */
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
/** Cambia a true cuando el horario de arriba sea el real: activa el indicador "Abierto ahora". */
export const HORARIO_CONFIRMADO = false

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

/* ---------- Galería (fotos reales de la feria y del montaje) ---------- */
export const CATEGORIAS = [
  { id: 'todo', label: 'Todo' },
  { id: 'arte', label: 'Ilustración y arte' },
  { id: 'diseno', label: 'Diseño y objetos' },
  { id: 'moda', label: 'Moda y textil' },
  { id: 'bienestar', label: 'Sabores y bienestar' },
]

/** Las marcas y descripciones salen de las ecards de la Feria Casa Amiga.
    [PONER] técnica exacta, medidas y precio de cada pieza (precio: null => "Precio a consultar"). */
export const OBRAS = [
  { id: 'o1', n: '01', titulo: 'Lámpara hongo', artistaId: 'a1', categoria: 'diseno', tecnica: 'Objeto de diseño', medidas: null, precio: null, img: 'img/lampara-hongo.jpg', destacada: true, descripcion: 'La lámpara roja de puntos blancos que ilumina la repisa de la casa: un objeto funcional con mirada experimental.' },
  { id: 'o2', n: '02', titulo: 'Luna con habitante', artistaId: 'a0', categoria: 'diseno', tecnica: 'Objeto decorativo', medidas: null, precio: null, img: 'img/luna.jpg', descripcion: 'Una luna blanca con una pequeña figura sentada. Vive en la madera de la casa, junto a la luz cálida.' },
  { id: 'o3', n: '03', titulo: 'Ilustraciones enmarcadas', artistaId: 'a0', categoria: 'arte', tecnica: 'Dibujo enmarcado', medidas: null, precio: null, img: 'img/ilustraciones.jpg', destacada: true, descripcion: 'Dibujos de animales en marcos de madera, colgados en la pared blanca de la sala.' },
  { id: 'o6', n: '04', titulo: 'Camiseta estampada', artistaId: 'a2', categoria: 'moda', destacada: true, tecnica: 'Estampado intervenido', medidas: null, precio: null, img: 'img/ec-rhipsalis.jpg', descripcion: 'Arte que se transforma en materia para habitar el cuerpo: color, textura y movimiento.' },
  { id: 'o7', n: '05', titulo: 'Cosmética natural de montaña', artistaId: 'a5', categoria: 'bienestar', tecnica: 'Cosmética natural', medidas: null, precio: null, img: 'img/cosmetica.jpg', destacada: true, descripcion: 'Alquimia de montaña: productos de cuidado natural de ALIMA, en la repisa de la sala.' },
  { id: 'o8', n: '06', titulo: 'Viche del Pacífico', artistaId: 'a6', categoria: 'bienestar', tecnica: 'Bebida tradicional del Pacífico', medidas: null, precio: null, img: 'img/viche.jpg', descripcion: 'De Puerto Saija, Timbiquí: sabor y espíritu del territorio llevados a nuevos lugares.' },
]

/** Marcas y artistas de la feria (datos de las ecards). [PONER] Instagram de cada uno y confirmar permiso de uso de imagen. */
export const ARTISTAS = [
  { id: 'a1', nombre: 'Artilugio', disciplina: 'Diseño y objetos', bio: 'Estudio-laboratorio de diseño y fabricación de objetos funcionales con una mirada experimental.', instagram: null, foto: 'img/ec-artilugio.jpg' },
  { id: 'a2', nombre: 'Rhipsalis', disciplina: 'Arte, diseño y ropa', bio: 'Marca donde el arte se transforma en materia para habitar el cuerpo: objetos, pinturas e imágenes intervenidas.', instagram: null, foto: 'img/ec-rhipsalis.jpg' },
  { id: 'a5', nombre: 'ALIMA', disciplina: 'Cosmética natural', bio: 'Alquimia de montaña: cuidado natural para el cuerpo, hecho desde el territorio.', instagram: null, foto: 'img/ec-alima.jpg' },
  { id: 'a6', nombre: 'Pargo Viche', disciplina: 'Sabores del Pacífico', bio: 'Nace en Puerto Saija, Timbiquí. Lleva el sabor y el espíritu del territorio a nuevos lugares.', instagram: null, foto: 'img/ec-pargo-viche.jpg' },
  { id: 'a7', nombre: 'Diego Pérez Osorno', disciplina: 'Sensopia · audiovisual y arte', bio: 'Comunicador audiovisual, artista y docente. Creador de Sensopia, experiencias inmersivas mediadas por la tecnología.', instagram: null, foto: 'img/ec-sensopia.jpg' },
  { id: 'a8', nombre: 'Marae Pineda', disciplina: 'Música en vivo', bio: 'Cantautora colombiana que interpreta la sensibilidad femenina y las experiencias de las mujeres.', instagram: null, foto: 'img/ec-marae-pineda.jpg' },
  { id: 'a0', nombre: 'Casa Amiga', disciplina: 'Obras de la casa', oculto: true, instagram: INSTAGRAM, foto: null },
]

/* ---------- Talleres y eventos: programa real de la Feria Casa Amiga (20 de septiembre) ----------
   Hoy no hay una fecha futura confirmada: se muestra la edición pasada. Cuando haya eventos nuevos,
   agrégalos aquí con pasado: false (y cupos / precio) y el más cercano mostrará "PRÓXIMO" y la cuenta regresiva. */
export const EDICION = {
  nombre: 'Feria Casa Amiga',
  fecha: '20 de septiembre de 2026', // [CONFIRMAR año]
  horario: '10:00 a. m. a 7:00 p. m.',
  lugar: 'Sector Amor y Amistad · Vereda El Placer, Santa Elena',
  apoyo: 'Proyecto beneficiario de recursos del programa de Planeación del Desarrollo Local y Presupuesto Participativo — Cultura, Alcaldía de Medellín.',
}
export const EVENTOS = [
  { id: 'e1', titulo: 'DJ set · Mr. Lino', tipo: 'DJ set', inicio: '2026-09-20T10:00:00-05:00', hora: '10:00 a. m. – 12:00 m.', cupos: null, precio: 0, pasado: true },
  { id: 'e2', titulo: 'Taller cartográfico sensorial', tipo: 'Taller', inicio: '2026-09-20T11:00:00-05:00', hora: '11:00 a. m. – 12:00 m.', cupos: null, precio: 0, pasado: true },
  { id: 'e3', titulo: 'DJ set · Cristian Calle Busta', tipo: 'DJ set', inicio: '2026-09-20T13:00:00-05:00', hora: '1:00 – 2:00 p. m.', cupos: null, precio: 0, pasado: true },
  { id: 'e4', titulo: 'Ilustración infantil: Espíritus del bosque', tipo: 'Niños', inicio: '2026-09-20T14:00:00-05:00', hora: '2:00 – 3:00 p. m.', cupos: null, precio: 0, pasado: true }, // [CONFIRMAR: la agenda dice 2:00–2:30]
  { id: 'e5', titulo: 'Música en vivo · Marae Pineda', tipo: 'Concierto', inicio: '2026-09-20T15:00:00-05:00', hora: '3:00 – 4:00 p. m.', cupos: null, precio: 0, pasado: true },
  { id: 'e6', titulo: 'Diagnóstico Express para emprendimientos', tipo: 'Asesoría', inicio: '2026-09-20T15:00:00-05:00', hora: '3:00 – 5:00 p. m.', cupos: null, precio: 0, pasado: true },
  { id: 'e7', titulo: 'Taller de germinados', tipo: 'Taller', inicio: '2026-09-20T15:30:00-05:00', hora: '3:30 – 4:30 p. m.', cupos: null, precio: 0, pasado: true },
  { id: 'e8', titulo: 'Música tradicional · Aleli + Sara Chacón', tipo: 'Concierto', inicio: '2026-09-20T17:00:00-05:00', hora: '5:00 – 7:00 p. m.', cupos: null, precio: 0, pasado: true },
]

/** Fotos reales de la feria (carrusel "Así fue la feria"). */
export const FERIA_FOTOS = [
  { img: 'img/feria-024.jpg', alt: 'El letrero de Casa Amiga en la entrada de la feria' },
  { img: 'img/feria-015.jpg', alt: 'Dos DJ en su mesa de sonido entre los pinos' },
  { img: 'img/feria-025.jpg', alt: 'Música en vivo en el jardín, entre pinos' },
  { img: 'img/feria-020.jpg', alt: 'Taller dentro de la cabaña, en la cocina de madera' },
  { img: 'img/feria-021.jpg', alt: 'Carpa con textiles de colores' },
  { img: 'img/feria-044.jpg', alt: 'Mesa de postres y mermeladas artesanales' },
  { img: 'img/feria-083.jpg', alt: 'El jardín de la casa lleno de gente durante la feria' },
  { img: 'img/feria-080.jpg', alt: 'La casa iluminada de noche durante la feria' },
  { img: 'img/feria-092.jpg', alt: 'Público escuchando una charla bajo el techo' },
  { img: 'img/feria-066.jpg', alt: 'Música al atardecer en el jardín' },
  { img: 'img/feria-028.jpg', alt: 'Sales y condimentos artesanales' },
  { img: 'img/feria-029.jpg', alt: 'Taller de cocina en la mesa de madera' },
]

/* ---------- Cifras (derivadas del programa de la feria) ---------- */
export const CIFRAS = [
  { value: 8, label: 'actividades en un solo día' },
  { value: 9, label: 'horas de feria, de 10 a. m. a 7 p. m.' },
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
  { q: '¿La entrada tiene costo?', a: 'La entrada a la galería y a la Feria Casa Amiga fue gratuita. Si un taller futuro tiene valor, lo verás en la agenda.' },
  { q: '¿Puedo comprar las obras y las envían?', a: 'Sí. Todas las obras están a la venta. Escríbenos por WhatsApp con el título y te contamos precio, disponibilidad y opciones de envío dentro de Colombia.' },
  { q: '¿Soy artista, cómo expongo aquí?', a: 'Cuéntanos de tu trabajo en el formulario de esta página (opción "Soy artista y quiero exponer") con un enlace a tu portafolio. Revisamos cada propuesta con calma.' },
  { q: '¿Aceptan mascotas?', a: 'Sí, con correa y buena energía. En la casa vive un perro que recibe a todos en la puerta.' },
  { q: '¿Cuál es el horario?', a: 'Consulta el horario actualizado en la sección "Visítanos". Si vienes en otro momento, escríbenos y te contamos.' },
]
