# Gestión de Clases (Domingos IA)

App web con layout tipo ChatGPT para crear, editar y exportar clases.

## Stack
- Next.js 14 (App Router)
- React 18
- TipTap (editor WYSIWYG)
- Persistencia local en `localStorage`

## Funcionalidades
- Sidebar izquierda con clases ordenadas por fecha DESC (`YYYY-MM-DD · Título`).
- Botón `+ Nueva clase`.
- Editor derecha con:
  - Fecha
  - Título
  - Editor WYSIWYG con toolbar completa (negrita, cursiva, subrayado, tachado, H1/H2/H3, listas, cita, enlace, código inline, bloque de código, deshacer/rehacer).
  - Recursos (nombre + URL), añadir y borrar.
  - Acciones: Guardar, Copiar email, Descargar HTML.
- `Copiar email` genera asunto y cuerpo HTML y los copia al portapapeles.
- `Descargar HTML` crea un archivo autosuficiente con estilos inline mínimos.

## Desarrollo local
```bash
npm install
npm run dev
```

## Previews con Vercel (iteración continua)
1. Sube este repo a GitHub.
2. En Vercel: **Add New Project** y conecta el repo.
3. Framework detectado: Next.js (sin configuración extra).
4. Cada push a una rama crea **Preview Deployment** automática.
5. Comparte URL de preview para revisar y seguir iterando.

## Producción en VPS OVH
Opción recomendada: Docker + Nginx reverse proxy.

### 1) Build de producción
```bash
npm ci
npm run build
npm run start
```
(La app escucha en `3000` por defecto.)

### 2) Deploy en OVH (sin Docker)
- Instala Node 20+
- Clona repo en VPS
- Ejecuta:
  ```bash
  npm ci
  npm run build
  pm2 start npm --name clases-ia -- start
  pm2 save
  ```
- Configura Nginx para proxy a `127.0.0.1:3000`.

### 3) Nginx ejemplo
```nginx
server {
  listen 80;
  server_name tu-dominio.com;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```

Después habilita HTTPS con Let's Encrypt (`certbot`).
