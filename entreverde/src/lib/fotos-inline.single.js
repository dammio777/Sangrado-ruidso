// Versión de un solo archivo (index.html autocontenido): una foto por nombre, incrustada en base64.
const archivos = import.meta.glob([
  '../../public/fotos/desgranado-bbq-820.webp',
  '../../public/fotos/desgranado-clasico-880.webp',
  '../../public/fotos/desgranado-verde-860.webp',
  '../../public/fotos/desgranados-trio-1210.webp',
  '../../public/fotos/lugar-letrero-1079.webp',
  '../../public/fotos/lugar-frente-1280.webp',
  '../../public/fotos/lugar-angulo-1080.webp',
  '../../public/fotos/pendones-noche-1080.webp',
  '../../public/fotos/pendones-dia-1080.webp',
  '../../public/fotos/terraza-cubierta-900.webp',
  '../../public/fotos/lugar-entrada-640.webp',
  '../../public/fotos/lugar-barra-640.webp',
  '../../public/fotos/lugar-fachada-640.webp',
  '../../public/fotos/lugar-patio-640.webp',
], { query: '?inline', import: 'default', eager: true });
const porNombre = {};
for (const [ruta, data] of Object.entries(archivos)) {
  const nombre = ruta.split('/').pop().replace(/-\d+\.webp$/, '');
  porNombre[nombre] = data;
}
export default porNombre;
