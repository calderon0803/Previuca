# Verificación de Instagram - Configuración Backend

## Desarrollo Local

### Opción 1: Usar Netlify CLI (Recomendado para testing real)

1. Instalar Netlify CLI globalmente:
```bash
npm install -g netlify-cli
```

2. Iniciar el servidor de desarrollo con funciones serverless:
```bash
netlify dev
```

Esto iniciará:
- Frontend en `http://localhost:8888`
- Funciones en `http://localhost:8888/.netlify/functions/verify-instagram`

### Opción 2: Desarrollo solo frontend (sin verificación real)

```bash
npm run dev
```

La verificación de Instagram no funcionará en este modo, solo el frontend.

## Producción en Netlify

### 1. Desplegar en Netlify

1. Crea una cuenta en [netlify.com](https://netlify.com)
2. Conecta tu repositorio de GitHub
3. Configuración de build:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`

### 2. Variables de Entorno

En Netlify Dashboard > Site settings > Environment variables, agrega:

```
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_key
```

### 3. Deploy

Netlify desplegará automáticamente:
- El frontend React
- La función serverless `verify-instagram`

## Cómo Funciona

1. **Usuario ingresa username de Instagram**
2. **Frontend llama** a `/.netlify/functions/verify-instagram`
3. **Función serverless**:
   - Hace fetch a `instagram.com/{username}` (sin problemas de CORS)
   - Extrae la biografía del HTML
   - Devuelve la biografía al frontend
4. **Frontend verifica** si el código está en la biografía
5. **Si coincide**, actualiza Supabase con verificación exitosa

## Estructura de Archivos

```
netlify/
  functions/
    verify-instagram.js    # Función serverless para scraping de IG
netlify.toml              # Configuración de Netlify
src/
  services/
    instagramService.js   # Cliente que llama a la función
```

## Alternativas

Si Netlify no funciona, puedes usar:

1. **Vercel Functions** - Similar a Netlify
2. **AWS Lambda** - Más complejo pero más control
3. **Backend Node.js propio** - Express + CORS habilitado
4. **RapidAPI Instagram endpoints** - Servicio de terceros pagado

## Troubleshooting

### Error: "Cannot find module 'node-fetch'"
No es necesario `node-fetch` en Node.js 18+. La función usa `fetch` nativo.

### Error: "403 Forbidden" o "429 Too Many Requests"
Instagram puede bloquear temporalmente. Espera unos minutos y reintenta.

### Error de CORS en desarrollo local
Asegúrate de usar `netlify dev` en lugar de `npm run dev` para que las funciones funcionen.

### La biografía no se encuentra
- Verifica que el perfil sea público
- Asegúrate de que el username sea correcto
- Instagram puede cambiar su HTML, revisa la función
