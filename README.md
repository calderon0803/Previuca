<h1 align="center">🍻 Previuca</h1>

<p align="center">
  <em>La mejor app de juegos de beber</em>
</p>

<p align="center">
  <img alt="React, Vite, Supabase, Netlify" src="https://skillicons.dev/icons?i=react,vite,supabase,netlify" />
</p>

<p align="center">
  <a href="https://previuca.netlify.app"><strong>👉 Abrir la app</strong></a>
</p>

<p align="center">
  <img alt="Aplicación web progresiva" src="https://img.shields.io/badge/PWA-instalable-5A0FC8?style=flat-square" />
  <img alt="Contenido para mayores de 18 años" src="https://img.shields.io/badge/contenido-+18-e63946?style=flat-square" />
</p>

---

## Qué es

**Previuca** es una aplicación web progresiva para animar eventos y fiestas. Nace para la
previa: un grupo entra desde el móvil, se apunta a un evento, se organiza en peñas y tiene a
mano una decena de juegos de grupo sin instalar nada.

Alrededor de los juegos hay una capa social propia de cada evento —muro de mensajes, álbum de
sellos por QR y un sistema de "flechazos"— con su panel de administración y sus herramientas
de moderación.

> Contenido orientado a público adulto: los juegos giran en torno al consumo de alcohol.

---

## Funcionalidades

### Juegos

Diez modos de juego, cada uno con sus propias reglas y mazos de contenido:

| | | |
|---|---|---|
| Yo Nunca | Medusa | Rey de Copas |
| Pico Palo | Impostor | Illuminati |
| Ruleta | Dados de Beber | Asesino |
| Trazo & Trago | | |

### Eventos y peñas

- Creación de eventos, con inscripción de asistentes
- Peñas dentro de cada evento: creación, miembros y detalle
- Cada evento mantiene su propio espacio aislado de contenido

### Capa social

- **Salseos** — muro de publicaciones del evento, con respuestas, "me gusta" y reportes
- **Flechazo** — sistema de admiradores: se revela la coincidencia solo cuando es mutua
- **Álbum de sellos** — colección desbloqueable escaneando códigos QR desde la cámara
- **Verificación de Instagram** — comprobación del perfil declarado por el usuario

### Administración

Panel propio (`/admin`) para gestionar eventos, peñas, usuarios y feedback, con cola de
reportes, bloqueo de usuarios y registro de auditoría de las acciones administrativas.

---

## Stack

| Área | Tecnología |
| --- | --- |
| **Frontend** | React 18 · React Router 7 · Vite |
| **Estilos** | styled-components · Framer Motion |
| **Backend** | Supabase (PostgreSQL + Auth + Row Level Security) |
| **Serverless** | Netlify Functions |
| **PWA** | `vite-plugin-pwa` — instalable y con actualización guiada |
| **Utilidades** | `qrcode` y `jsqr` para generar y leer QR |

El estado se organiza por dominio en *contexts* de React (`EventContext`, `PenasContext`,
`SalseosContext`, `FlechazoContext`, `PlayersContext`, `AdminContext`), y todo el acceso a
datos se concentra en `src/services/`, una función por área.

---

## Estructura

```
src/
├─ components/    Componentes reutilizables (ui/ para los primitivos)
├─ contexts/      Estado global por dominio
├─ services/      Único punto de acceso a Supabase
├─ views/         Una vista por ruta
├─ hooks/         useAppUpdate, usePwaInstall
├─ data/          Mazos y contenido de los juegos
└─ styles/        Estilos base y tema

netlify/functions/   verify-instagram.cjs
supabase-setup.sql               Esquema completo y políticas RLS
supabase-security-hardening.sql  Endurecimiento adicional
```

---

## Desarrollo local

### Requisitos

- Node.js 18 o superior
- Un proyecto de Supabase

### 1. Instalar dependencias

```bash
npm install
```

### 2. Preparar la base de datos

En el editor SQL de tu proyecto de Supabase, ejecuta en este orden:

```
supabase-setup.sql              → tablas, índices y políticas RLS
supabase-security-hardening.sql → restricciones adicionales
```

### 3. Configurar el entorno

Crea un fichero `.env` en la raíz:

```bash
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anonima
```

> La clave anónima viaja al navegador por diseño; lo que protege los datos son las políticas
> RLS del paso anterior. **Nunca** pongas aquí la clave `service_role`.

### 4. Arrancar

```bash
npm run dev          # solo frontend (la verificación de Instagram no funcionará)
npm run dev:netlify  # frontend + funciones serverless
```

Para la verificación de Instagram hace falta el segundo modo. Los detalles están en
[INSTAGRAM_SETUP.md](INSTAGRAM_SETUP.md).

---

## Despliegue

Desplegado en **Netlify** — [previuca.netlify.app](https://previuca.netlify.app).
`netlify.toml` ya define el build, el directorio de funciones y
la redirección de SPA. Solo hay que declarar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`
en las variables de entorno del sitio.

El service worker, `registerSW.js` y el manifest se sirven con `Cache-Control: no-cache`
a propósito: no llevan hash en el nombre, y sin eso el CDN podría servir una versión vieja
y dejar sin actualizar a quien ya tenga la PWA instalada.

```bash
npm run build    # genera dist/
npm run preview  # sirve el build en local
```

---

## Scripts

| Script | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo de Vite |
| `npm run dev:netlify` | Desarrollo con funciones serverless |
| `npm run build` | Build de producción |
| `npm run preview` | Sirve el build generado |

Además, `scripts/generate-pwa-icons.cjs` regenera los iconos de la PWA.
