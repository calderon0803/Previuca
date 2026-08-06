-- ===================================================
-- Previuca — Sección "Eventos" (Peñas + Crush enlazado)
-- ===================================================
-- Ejecuta este script en el SQL Editor de tu proyecto de Supabase
-- (o vía `supabase db query --db-url ... -f supabase-setup-eventos.sql`).
-- Requiere que supabase-setup.sql ya se haya ejecutado antes
-- (usa la tabla users_crushes existente).
--
-- Este script sustituye a un intento anterior que usaba una tabla
-- "penas" con una columna "event_id" suelta y sin relación a nada.
-- Primero limpia esa estructura antigua y luego crea la nueva completa.

-- -------------------------------------------------
-- Limpieza de la estructura antigua/incompleta
-- -------------------------------------------------
DROP TABLE IF EXISTS penas CASCADE;
ALTER TABLE users_crushes DROP COLUMN IF EXISTS event_id;

-- -------------------------------------------------
-- Table: eventos
-- Eventos/fiestas patronales de los municipios. Se dan de alta
-- a mano aquí (no hay flujo de creación en la app todavía).
-- -------------------------------------------------
CREATE TABLE IF NOT EXISTS eventos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can look up eventos" ON eventos;
CREATE POLICY "Authenticated users can look up eventos"
    ON eventos
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Ejemplo para dar de alta un evento de prueba (ajusta nombre/código):
-- INSERT INTO eventos (name, code) VALUES ('Fiestas de Prueba', 'PRUEBA2026');

-- -------------------------------------------------
-- Table: user_eventos
-- Evento activo de cada usuario (uno a la vez).
-- -------------------------------------------------
CREATE TABLE IF NOT EXISTS user_eventos (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    event_id UUID REFERENCES eventos(id) ON DELETE CASCADE NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_user_eventos_event_id ON user_eventos(event_id);

ALTER TABLE user_eventos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own evento" ON user_eventos;
CREATE POLICY "Users can view their own evento"
    ON user_eventos
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can join an evento" ON user_eventos;
CREATE POLICY "Users can join an evento"
    ON user_eventos
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can switch their evento" ON user_eventos;
CREATE POLICY "Users can switch their evento"
    ON user_eventos
    FOR UPDATE
    USING (auth.uid() = user_id);

-- -------------------------------------------------
-- Table: penas
-- Peñas apuntadas a un evento concreto.
-- -------------------------------------------------
CREATE TABLE IF NOT EXISTS penas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES eventos(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    image_url TEXT,
    code TEXT NOT NULL UNIQUE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_penas_event_id ON penas(event_id);

ALTER TABLE penas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view penas" ON penas;
CREATE POLICY "Authenticated users can view penas"
    ON penas
    FOR SELECT
    USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can create their own pena" ON penas;
CREATE POLICY "Users can create their own pena"
    ON penas
    FOR INSERT
    WITH CHECK (auth.uid() = created_by);

-- -------------------------------------------------
-- Table: pena_members
-- Un usuario pertenece como mucho a una peña (user_id como PK).
-- -------------------------------------------------
CREATE TABLE IF NOT EXISTS pena_members (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    pena_id UUID REFERENCES penas(id) ON DELETE CASCADE NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_pena_members_pena_id ON pena_members(pena_id);

ALTER TABLE pena_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view pena members" ON pena_members;
CREATE POLICY "Authenticated users can view pena members"
    ON pena_members
    FOR SELECT
    USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can join a pena" ON pena_members;
CREATE POLICY "Users can join a pena"
    ON pena_members
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can leave their pena" ON pena_members;
CREATE POLICY "Users can leave their pena"
    ON pena_members
    FOR DELETE
    USING (auth.uid() = user_id);

-- -------------------------------------------------
-- users_crushes: enlazar cada crush al evento activo
-- -------------------------------------------------
ALTER TABLE users_crushes ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES eventos(id);
CREATE INDEX IF NOT EXISTS idx_users_crushes_event_id ON users_crushes(event_id);

-- -------------------------------------------------
-- Storage: bucket para las fotos de las peñas
-- -------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('pena-images', 'pena-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Anyone can view pena images" ON storage.objects;
CREATE POLICY "Anyone can view pena images"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'pena-images');

DROP POLICY IF EXISTS "Authenticated users can upload their pena image" ON storage.objects;
CREATE POLICY "Authenticated users can upload their pena image"
    ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'pena-images'
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- -------------------------------------------------
-- Success message
-- -------------------------------------------------
DO $$
BEGIN
    RAISE NOTICE 'Tablas de Eventos creadas correctamente!';
    RAISE NOTICE '1. eventos - da de alta al menos una fila para poder canjear un codigo';
    RAISE NOTICE '2. user_eventos, penas, pena_members - listas';
    RAISE NOTICE '3. users_crushes.event_id - columna añadida';
    RAISE NOTICE '4. bucket pena-images - creado (publico en lectura)';
END $$;
