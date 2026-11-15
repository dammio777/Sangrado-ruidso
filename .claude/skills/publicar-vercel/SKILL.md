---
name: publicar-vercel
description: Úsala para publicar un proyecto web (Vite/React u otro) por primera vez o redeployarlo: git init, repo en GitHub con gh, push, conectar a Vercel, deploy a producción y verificar el build.
---

# Publicar en GitHub + Vercel

## 1. Verificar build local
```bash
npm ci || npm install
npm run build        # debe terminar sin errores; si falla, corrígelo antes de seguir
```

## 2. Git
```bash
git init -b main               # si no existe .git
# .gitignore mínimo: node_modules, dist, .env*, .vercel
git add -A && git commit -m "Primer commit"
```

## 3. Repo en GitHub
```bash
gh auth status || gh auth login
gh repo create <nombre-cliente> --private --source=. --remote=origin --push
```
Si el repo ya existe: `git remote add origin <url> && git push -u origin main`.

## 4. Vercel
```bash
vercel whoami || vercel login
vercel link --yes                # crea/enlaza el proyecto
vercel git connect               # deploys automáticos en cada push a main
vercel --prod                    # deploy a producción
```
Vite: Framework "Vite", build `npm run build`, output `dist` (Vercel lo detecta solo).
SPA con rutas: agrega `vercel.json` → `{"rewrites":[{"source":"/(.*)","destination":"/"}]}`.

## 5. Verificar
- `vercel inspect <url> --logs` o revisa que el estado sea **Ready**.
- Abre la URL, revisa consola y móvil.
- Variables de entorno: `vercel env add <NOMBRE> production`.
- Dominio: `vercel domains add <dominio>` y configura DNS según indique.

Reporta al final: URL de producción, URL del repo y estado del build.
