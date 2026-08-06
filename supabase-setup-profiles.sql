-- ===================================================
-- Previuca — Perfiles (nombre y apellido)
-- ===================================================
-- Ejecuta este script en el SQL Editor de tu proyecto de Supabase.
-- Hasta ahora el único "nombre público" de un usuario era su Instagram;
-- esto añade nombre y apellido reales, visibles para el resto (p. ej.
-- en la lista de miembros de una peña).

-- -------------------------------------------------
-- Table: profiles
-- -------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    first_name TEXT NOT NULL DEFAULT '',
    last_name TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view profiles" ON profiles;
CREATE POLICY "Anyone can view profiles"
    ON profiles
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile"
    ON profiles
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile"
    ON profiles
    FOR UPDATE
    USING (auth.uid() = user_id);

-- -------------------------------------------------
-- Trigger: crea el perfil automáticamente al registrarse, a partir de
-- los metadatos (first_name/last_name) que manda el formulario de registro.
-- Corre con permisos del propietario (SECURITY DEFINER) porque en ese
-- instante el usuario nuevo todavía no tiene sesión para pasar la RLS.
-- -------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, first_name, last_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', '')
    )
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();

-- -------------------------------------------------
-- Backfill: usuarios que ya existían antes de este script no tienen fila.
-- Se crean vacías; cada uno puede rellenarlas luego desde Ajustes.
-- -------------------------------------------------
INSERT INTO public.profiles (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

DO $$
BEGIN
    RAISE NOTICE 'profiles creada, con trigger de alta automatica y backfill de usuarios existentes.';
END $$;
