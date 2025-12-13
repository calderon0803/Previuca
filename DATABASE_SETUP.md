# Configuración de Base de Datos - PatronaLeague

## Base de Datos con Supabase

La aplicación ahora usa **Supabase** como backend para autenticación y base de datos.

### 1. Crear Proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com) y crea una cuenta gratuita
2. Crea un nuevo proyecto
3. Espera a que el proyecto se inicialice (toma ~2 minutos)
4. Copia tus credenciales:
   - `Project URL` (SUPABASE_URL)
   - `anon/public` key (SUPABASE_ANON_KEY)

### 2. Configurar Variables de Entorno

1. Crea un archivo `.env` en la raíz del proyecto
2. Copia el contenido de `.env.example` 
3. Reemplaza con tus credenciales reales:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

### 3. Crear Tabla en Supabase

En el panel de Supabase, ve a **SQL Editor** y ejecuta:

```sql
-- Crear tabla para las dates de los usuarios
CREATE TABLE user_dates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar Row Level Security
ALTER TABLE user_dates ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver sus propios matches
CREATE POLICY "Users can view own matches" 
  ON user_matches FOR SELECT 
  USING (auth.uid() = user_id);

-- Política: Los usuarios solo pueden insertar sus propios matches
CREATE POLICY "Users can insert own matches" 
  ON user_matches FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios solo pueden actualizar sus propios matches
CREATE POLICY "Users can update own matches" 
  ON user_matches FOR UPDATE 
  USING (auth.uid() = user_id);

-- Política: Los usuarios solo pueden eliminar sus propios matches
CREATE POLICY "Users can delete own matches" 
  ON user_matches FOR DELETE 
  USING (auth.uid() = user_id);

-- Crear índice para mejor performance
CREATE INDEX user_matches_user_id_idx ON user_matches(user_id);
```

### 4. Configurar Email en Supabase (Opcional)

1. Ve a **Authentication > Settings**
2. Configura tu proveedor de email (por defecto usa Supabase email)
3. Para desarrollo, puedes deshabilitar la confirmación de email:
   - Ve a **Authentication > Providers > Email**
   - Desactiva "Confirm email"

### 5. Probar la Aplicación

1. Inicia el servidor de desarrollo: `npm run dev`
2. Ve a la página de login
3. Crea una cuenta nueva con email y contraseña
4. Inicia sesión

## Estructura de la Base de Datos

### Tabla: `user_matches`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | ID único del match |
| `user_id` | UUID | ID del usuario (referencia a auth.users) |
| `match_name` | TEXT | Nombre del match (sin espacios, lowercase) |
| `created_at` | TIMESTAMP | Fecha de creación |

### Autenticación

Supabase maneja automáticamente:
- Hash seguro de contraseñas
- Sesiones con JWT
- Refresh tokens
- Verificación de email
- Reset de contraseña

## Archivos Creados/Modificados

- ✅ `src/config/supabase.js` - Configuración de cliente Supabase
- ✅ `src/services/authService.js` - Servicios de autenticación
- ✅ `src/contexts/MatchContext.jsx` - Context actualizado con Supabase
- ✅ `src/views/MatchLogin.jsx` - Login actualizado con botón de registro
- ✅ `.env.example` - Template de variables de entorno

## Próximos Pasos

1. Configurar reset de contraseña
2. Agregar validación de email
3. Implementar perfiles de usuario
4. Agregar almacenamiento de imágenes (Supabase Storage)
5. Implementar sistema de invitaciones entre matches
