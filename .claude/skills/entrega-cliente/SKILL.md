---
name: entrega-cliente
description: Úsala cuando un sitio web esté listo para entregarse o publicarse a un cliente. Corre el checklist de calidad (Lighthouse, meta tags, favicon, links, 404, velocidad móvil, dominio) y redacta el mensaje de entrega en español.
---

# Checklist de entrega

Revisa cada punto, marca ✅/❌ y corrige los ❌ antes de entregar.

## Rendimiento
- [ ] `npm run build` sin errores ni warnings importantes.
- [ ] Lighthouse móvil sobre el build (`npm run preview` o la URL de Vercel):
  `npx lighthouse <url> --form-factor=mobile --only-categories=performance,accessibility,best-practices,seo --view`
  Meta: Performance ≥ 90, resto ≥ 95.
- [ ] LCP < 2.5 s, CLS < 0.1 en móvil (throttling 4G).
- [ ] Imágenes en WebP con tamaños correctos; ninguna > 300 KB salvo el hero.

## Meta y marca
- [ ] `<title>` y `meta description` únicos, en español.
- [ ] Open Graph + Twitter card con imagen 1200×630 (probar pegando el link en WhatsApp).
- [ ] Favicon (32, 192, 512) + `apple-touch-icon`.
- [ ] JSON-LD `Restaurant` válido (Rich Results Test).

## Links y contenido
- [ ] WhatsApp: `https://wa.me/57XXXXXXXXXX?text=...` abre bien en celular.
- [ ] Instagram y demás redes apuntan a la cuenta correcta.
- [ ] Google Maps, carta, reservas y domicilios funcionan.
- [ ] Horarios, dirección y precios coinciden con lo que dio el cliente.
- [ ] Cero `TODO-CLIENTE`, lorem ipsum o textos en inglés.

## Robustez
- [ ] Página 404 propia (en SPA de Vercel: `vercel.json` con rewrites o `404.html`).
- [ ] `prefers-reduced-motion` probado.
- [ ] Probado en iPhone Safari y Android Chrome reales (o Playwright con dispositivos).
- [ ] Sin errores en consola.

## Dominio
- [ ] Dominio conectado en Vercel (`vercel domains add <dominio>`), HTTPS activo, redirección `www` ↔ raíz.

## Mensaje de entrega (plantilla)
```
¡Hola, [Nombre]! 🙌
El sitio de [Restaurante] ya está en línea: [URL]
Qué incluye: [secciones clave].
Funciona perfecto en celular y carga rápido.
Para cambios de horarios, precios o fotos, escríbeme por aquí.
¡Gracias por la confianza!
```
