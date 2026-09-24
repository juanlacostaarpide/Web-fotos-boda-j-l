# 📷 Galería de fotos y vídeos — Boda Juan & L.

Web para que los invitados suban fotos y vídeos de la boda y los vean en una galería
compartida, **sin poder descargar los originales**. Solo el admin (los novios) puede
descargar todo el contenido.

Inspirada en [dayafteralbum.com](https://dayafteralbum.com), pero 100% gratuita: sin
backend propio, sin Cloud Functions, corriendo íntegramente en el plan **Spark** (gratis)
de Firebase, repartido en **dos proyectos Firebase** para duplicar la cuota gratuita de
Storage (2 × 5 GB = 10 GB).

## Estado actual del proyecto

Este commit contiene la **estructura base**: scaffold de React + Vite, configuración de
los dos proyectos Firebase, reglas de seguridad de Firestore/Storage y el pipeline de
despliegue en GitHub Actions. Las siguientes piezas se irán añadiendo paso a paso:

- [x] Estructura del proyecto, README y configuración de despliegue
- [ ] Login anónimo de invitados + login email/password del admin
- [ ] Subida de fotos (con generación de thumbnail en `<canvas>`)
- [ ] Subida de vídeos (con validación de duración/tamaño y frame estático)
- [ ] Galería pública (grid de miniaturas, ampliar sin descargar)
- [ ] Panel de admin ("Descargar todo" en ZIP con JSZip)
- [ ] Reglas de seguridad afinadas y probadas

## Arquitectura

```
┌─────────────────────────────┐        ┌──────────────────────────────┐
│  Proyecto Firebase "FOTOS"   │        │  Proyecto Firebase "VÍDEOS"   │
│  ─────────────────────────   │        │  ──────────────────────────  │
│  • Auth (anónimo + email/pw) │        │  • Auth (anónimo + email/pw) │
│  • Firestore (metadata de    │        │  • Storage (5 GB gratis)     │
│    TODAS las fotos y vídeos) │        │    /originals/{uid}/...      │
│  • Storage (5 GB gratis)     │        │    /thumbnails/{uid}/...     │
│    /originals/{uid}/...      │        └──────────────────────────────┘
│    /thumbnails/{uid}/...     │
│  • Firebase Hosting (la web) │
└─────────────────────────────┘
```

Firestore vive solo en el proyecto de fotos y guarda un documento por cada archivo
subido (sea foto o vídeo), con la ruta al original y al thumbnail correspondientes,
estén en el bucket que estén. La web (`firebase.json` de Hosting) también se despliega
desde el proyecto de fotos.

Cada invitado, al entrar, se autentica de forma anónima **en los dos proyectos a la
vez** (dos UIDs distintos, uno por proyecto), lo que le permite subir a ambos Storage
respetando las reglas de seguridad de cada uno.

## Requisitos

- Node.js 20+
- Una cuenta de Google (para crear los proyectos Firebase)
- [Firebase CLI](https://firebase.google.com/docs/cli): `npm install -g firebase-tools`
- Un repositorio en GitHub (para el deploy automático con Actions)

## 1. Crear los dos proyectos en Firebase Console

1. Ve a [console.firebase.google.com](https://console.firebase.google.com) → **Añadir
   proyecto**.
2. Crea el primer proyecto, por ejemplo `boda-jl-fotos`. Puedes desactivar Google
   Analytics (no hace falta).
3. Repite el proceso para crear un segundo proyecto, por ejemplo `boda-jl-videos`.

> No necesitas tarjeta de crédito: todo el proyecto funciona en el plan gratuito
> **Spark**, y no usamos Cloud Functions (que requerirían el plan Blaze).

## 2. Activar Auth, Firestore y Storage en cada proyecto

**En el proyecto de FOTOS** (`boda-jl-fotos`):

1. **Authentication** → pestaña "Sign-in method" → activa:
   - **Anónimo**
   - **Correo electrónico/contraseña**
2. **Firestore Database** → "Crear base de datos" → modo producción → elige la región
   más cercana (p. ej. `eur3`).
3. **Storage** → "Comenzar" → modo producción → misma región.

**En el proyecto de VÍDEOS** (`boda-jl-videos`):

1. **Authentication** → activa igualmente **Anónimo** y **Correo/contraseña**.
2. **Storage** → "Comenzar" → modo producción.
3. Este proyecto **no necesita Firestore** (toda la metadata vive en el proyecto de
   fotos).

## 3. Registrar una app web en cada proyecto y copiar las credenciales

En cada proyecto: ⚙️ **Configuración del proyecto** → sección "Tus apps" → icono
`</>` (Web) → dale un nombre (p. ej. "Galería boda") → **no** marques Hosting aquí
(lo configuramos por CLI) → copia el objeto `firebaseConfig`.

Copia `.env.example` como `.env` en la raíz del proyecto:

```bash
cp .env.example .env
```

Y rellena cada variable con el `firebaseConfig` correspondiente:

```
VITE_FIREBASE_PHOTOS_API_KEY=...
VITE_FIREBASE_PHOTOS_AUTH_DOMAIN=...
VITE_FIREBASE_PHOTOS_PROJECT_ID=...
VITE_FIREBASE_PHOTOS_STORAGE_BUCKET=...
VITE_FIREBASE_PHOTOS_MESSAGING_SENDER_ID=...
VITE_FIREBASE_PHOTOS_APP_ID=...

VITE_FIREBASE_VIDEOS_API_KEY=...
...
```

Estas claves son públicas por diseño (viajan en el bundle del cliente); la seguridad
real la dan las **Security Rules** de Firestore/Storage, configuradas en el siguiente
paso.

## 4. Crear tu cuenta de admin (email/contraseña)

En **cada uno de los dos proyectos**: Authentication → Users → "Añadir usuario" →
introduce tu email y una contraseña. Vas a tener que hacerlo dos veces (una vez por
proyecto), ya que cada proyecto Firebase tiene su propio sistema de Auth y por tanto un
**UID distinto** para la misma persona en cada uno.

## 5. Configurar tu UID de admin en las reglas de seguridad

Tras crear tu usuario admin en el paso anterior, copia su **UID** (columna "User UID" en
la lista de usuarios de Authentication) y pégalo en estos 4 sitios:

| Archivo | Qué reemplazar |
|---|---|
| `firestore.rules` | `REEMPLAZA_CON_TU_UID_PROYECTO_FOTOS` → tu UID admin del proyecto **FOTOS** |
| `storage.photos.rules` | `REEMPLAZA_CON_TU_UID_PROYECTO_FOTOS` → tu UID admin del proyecto **FOTOS** |
| `storage.videos.rules` | `REEMPLAZA_CON_TU_UID_PROYECTO_VIDEOS` → tu UID admin del proyecto **VÍDEOS** |
| `src/firebase/adminConfig.js` | `ADMIN_UID_PHOTOS` y `ADMIN_UID_VIDEOS` (los usa el frontend para mostrar el panel de admin) |

También actualiza `.firebaserc` con los **Project ID** reales (no el nombre bonito, el
ID técnico que ves en Configuración del proyecto) de tus dos proyectos:

```json
{
  "projects": {
    "default": "photos",
    "photos": "boda-jl-fotos",
    "videos": "boda-jl-videos"
  }
}
```

## 6. Instalar dependencias y probar en local

```bash
npm install
npm run dev
```

Abre `http://localhost:5173`.

## 7. Desplegar las reglas y el Hosting manualmente (primera vez)

```bash
firebase login
firebase deploy --only firestore,storage --project photos
firebase deploy --config firebase.videos.json --only storage --project videos

npm run build
firebase deploy --only hosting --project photos
```

## 8. Configurar el repo de GitHub con GitHub Actions

El workflow `.github/workflows/deploy.yml` compila y despliega a Firebase Hosting en
cada push a `main`. Necesita estos **Secrets** del repositorio (Settings → Secrets and
variables → Actions → New repository secret):

**Credenciales del `.env` (una por variable, mismos nombres):**

```
VITE_FIREBASE_PHOTOS_API_KEY
VITE_FIREBASE_PHOTOS_AUTH_DOMAIN
VITE_FIREBASE_PHOTOS_PROJECT_ID
VITE_FIREBASE_PHOTOS_STORAGE_BUCKET
VITE_FIREBASE_PHOTOS_MESSAGING_SENDER_ID
VITE_FIREBASE_PHOTOS_APP_ID
VITE_FIREBASE_VIDEOS_API_KEY
VITE_FIREBASE_VIDEOS_AUTH_DOMAIN
VITE_FIREBASE_VIDEOS_PROJECT_ID
VITE_FIREBASE_VIDEOS_STORAGE_BUCKET
VITE_FIREBASE_VIDEOS_MESSAGING_SENDER_ID
VITE_FIREBASE_VIDEOS_APP_ID
```

**Secrets propios del deploy:**

- `FIREBASE_PROJECT_ID_PHOTOS`: el Project ID de tu proyecto de fotos (p. ej.
  `boda-jl-fotos`).
- `FIREBASE_SERVICE_ACCOUNT_PHOTOS`: JSON de una cuenta de servicio con permiso de
  Firebase Hosting. Puedes generarlo automáticamente ejecutando en tu máquina:

  ```bash
  firebase init hosting:github
  ```

  (elige el proyecto de fotos; el asistente crea el secret y el workflow por ti — si
  ya tienes `.github/workflows/deploy.yml` como en este repo, puedes decir que no lo
  sobrescriba y copiar tú mismo el secret generado).

Tras configurar los secrets, cualquier `git push` a `main` desplegará la web
automáticamente.

## Estructura del proyecto

```
├── src/
│   ├── firebase/
│   │   ├── photosApp.js     # App Firebase del proyecto FOTOS (Auth, Firestore, Storage)
│   │   ├── videosApp.js     # App Firebase del proyecto VÍDEOS (Auth, Storage)
│   │   └── adminConfig.js   # UIDs de admin (placeholders a reemplazar)
│   ├── pages/                # Pantallas (bienvenida, subida, galería, admin) — próximos pasos
│   ├── components/           # Componentes reutilizables — próximos pasos
│   ├── hooks/                # Hooks (auth, subida, galería) — próximos pasos
│   ├── utils/                # Compresión de imágenes, validación de vídeo, ZIP — próximos pasos
│   ├── styles/global.css     # Estética de la web (serif elegante + paleta suave)
│   ├── weddingConfig.js      # Nombres de la pareja y fecha de la boda
│   ├── App.jsx                # Pantalla de bienvenida (placeholder)
│   └── main.jsx
├── firestore.rules
├── firestore.indexes.json
├── storage.photos.rules
├── storage.videos.rules
├── firebase.json              # Config del proyecto FOTOS (hosting + firestore + storage)
├── firebase.videos.json       # Config del proyecto VÍDEOS (solo storage)
├── .firebaserc
├── .env.example
└── .github/workflows/deploy.yml
```

## Próximos pasos

Con esta base ya podemos ir construyendo, en orden:

1. **Auth**: login anónimo automático (en ambos proyectos) + login email/password del
   admin.
2. **Subida de fotos**: compresión de thumbnail en `<canvas>`, subida a Storage +
   Firestore.
3. **Subida de vídeos**: validación de duración/tamaño, captura de frame, subida.
4. **Galería**: grid mobile-first con las miniaturas, modal de vista ampliada.
5. **Panel de admin**: filtros y botón "Descargar todo" (ZIP con JSZip).
6. **QR / link corto** para compartir en las mesas de la boda.
