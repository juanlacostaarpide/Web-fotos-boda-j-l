# 📷 Galería de fotos y vídeos — Boda Juan & L.

Web para que los invitados suban fotos y vídeos de la boda y los vean en una galería
compartida. Cualquiera puede ver y descargar un archivo individual desde la galería;
solo el admin (los novios) puede descargar **todo** de golpe en un ZIP, y solo el admin
puede borrar archivos.

**Arquitectura: 100% autoalojada (self-hosted), sin servicios de terceros ni tarjeta de
crédito.** Un backend propio (Node/Express) guarda los archivos en disco y la metadata en
un fichero JSON; todo corre en un único contenedor Docker.

## Estado actual del proyecto

- [x] Backend propio (Express + Docker): subida, thumbnails, login admin, ZIP, borrado
- [x] Frontend (React + Vite): bienvenida, subir foto/vídeo, galería, panel admin, QR
- [ ] Desplegar en un servidor real (previsto para más adelante — ver "Despliegue")

## Cómo funciona

```
┌───────────────────────────── Contenedor Docker ─────────────────────────────┐
│                                                                              │
│   Express (Node)                                                           │
│   ├── sirve el frontend (React ya compilado)                              │
│   ├── /api/media        → listar / subir / borrar fotos y vídeos          │
│   ├── /api/admin/*       → login admin, "descargar todo" en ZIP           │
│   └── /uploads/*         → sirve los archivos (originales y miniaturas)   │
│                                                                              │
│   Al subir:                                                                │
│   - Foto  → sharp genera una miniatura comprimida (800px, JPEG)            │
│   - Vídeo → ffmpeg extrae un frame como miniatura (sin límite de           │
│             duración/tamaño; solo un tope técnico de 5GB por archivo)      │
│                                                                              │
│   data/ (carpeta persistente, montada como volumen)                        │
│   ├── media.json              ← metadata (quién subió qué, cuándo...)      │
│   └── uploads/originals|thumbnails/                                        │
└──────────────────────────────────────────────────────────────────────────┘
```

No hay Firebase, no hay Cloudinary, no hay cuenta de ningún proveedor externo. Es tu
propio servidor.

## Requisitos

- [Docker](https://docs.docker.com/get-docker/) y Docker Compose (v2, ya viene con
  Docker Desktop / Docker Engine moderno)
- Node.js 20+ (opcional, solo si quieres desarrollar el frontend con recarga en caliente
  fuera de Docker)

## 1. Configurar las variables de entorno

Copia `.env.example` como `.env`:

```bash
cp .env.example .env
```

Genera una contraseña de admin (hash bcrypt — nunca se guarda en texto plano):

```bash
node server/src/hashPassword.js "tu-contraseña-secreta"
```

Copia el resultado en `ADMIN_PASSWORD_HASH` dentro de `.env`.

**⚠️ Importante**: el hash contiene signos `$` (p.ej. `$2a$10$...`). Docker Compose lee
`$` como inicio de variable en los ficheros `.env`, así que tienes que **escapar cada
`$` duplicándolo por `$$`** al pegarlo. Ejemplo:

```
# lo que te da hashPassword.js:
$2a$10$abc123.../XYZ

# lo que pegas en .env:
ADMIN_PASSWORD_HASH=$$2a$$10$$abc123.../XYZ
```

Genera también una cadena aleatoria para firmar la sesión:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

y pégala en `SESSION_SECRET` (esta no lleva `$`, no hace falta escapar nada).

Pon tu email de admin en `ADMIN_EMAIL`.

## 2. Levantar todo con Docker

```bash
docker compose up --build
```

Abre `http://localhost:8080`. Los archivos y la base de datos se guardan en `./data/`
(en tu disco, fuera del contenedor), así que sobreviven a reinicios y reconstrucciones.

Para pararlo: `Ctrl+C`, o `docker compose down` en otra terminal.

## 3. Desarrollo con recarga en caliente (opcional)

Si vas a tocar el frontend y quieres ver los cambios al instante sin reconstruir la
imagen:

```bash
# Terminal 1: solo el backend
docker compose up --build

# Terminal 2: el frontend con Vite, que hace proxy de /api y /uploads al backend
npm install
npm run dev
```

Abre `http://localhost:5173` (Vite). Los cambios en `src/` se recargan al instante; los
cambios en `server/` requieren volver a `docker compose up --build`.

## Cómo probar el flujo completo

1. Abre `http://localhost:8080` → "Subir foto" o "Subir vídeo" → elige un archivo de tu
   ordenador/móvil.
2. Ve a "Ver la galería" → deberías ver la miniatura. Haz click para ampliarla; hay un
   botón "Descargar".
3. Ve a "Acceso admin" → entra con el email y la contraseña (sin escapar, la de verdad)
   que configuraste en `.env`.
4. En el panel de admin: filtra por tipo/fecha y prueba "Descargar todo" (te da un ZIP
   con todos los originales).

## Estructura del proyecto

```
├── src/                        # Frontend (React)
│   ├── pages/                  # Bienvenida, subir foto/vídeo, galería, admin, QR
│   ├── components/             # Grid de la galería, modal, etc.
│   ├── context/AdminContext.jsx  # Sesión de admin (login/logout)
│   ├── hooks/                  # useGuestName, useMediaList
│   └── utils/api.js            # Llamadas a la API (subir, borrar)
├── server/                     # Backend (Node/Express)
│   ├── src/index.js            # Servidor: sirve la API y el frontend compilado
│   ├── src/routes/media.js     # Subir, listar, borrar (con sharp/ffmpeg)
│   ├── src/routes/admin.js     # Login admin, "descargar todo" en ZIP
│   ├── src/auth.js             # Sesión de admin (cookie + JWT)
│   ├── src/db.js               # "Base de datos" en un fichero JSON
│   └── src/hashPassword.js     # Genera el hash bcrypt de tu contraseña
├── data/                       # (no versionado) archivos subidos + metadata
├── Dockerfile                  # Build multi-etapa: frontend + backend en una imagen
├── docker-compose.yml
└── .env.example
```

## Despliegue (más adelante)

Todo esto corre igual en tu portátil que en un servidor real — es el mismo
`docker compose up --build`. Cuando os acerquéis a la fecha de la boda, hay que decidir
dónde alojarlo (un VPS barato es la opción más fiable para el día del evento, ya que un
servidor casero depende de tu luz/router/ISP funcionando justo ese día). Cuando lo
tengáis decidido, hay que:

1. Elegir el proveedor y crear un servidor pequeño (2GB RAM es más que suficiente).
2. Instalar Docker en él.
3. Copiar el repo (o hacer `git clone`) y el `.env` con credenciales de producción.
4. `docker compose up -d --build` (el `-d` lo deja corriendo en segundo plano).
5. Poner un dominio/HTTPS delante (necesario para que el móvil permita usar la cámara) —
   normalmente con Caddy o Nginx + Let's Encrypt.
6. Configurar backups periódicos de la carpeta `data/` (son las únicas fotos/vídeos que
   existen — conviene copiarlas a otro sitio de vez en cuando).

Lo vemos con calma cuando llegue el momento.
