-- ===================================================
-- Previuca — Sección "Fiestas" (Peñas + Crush enlazado)
-- ===================================================
-- Ejecuta este script en el SQL Editor de tu proyecto de Supabase.
-- Requiere que supabase-setup.sql ya se haya ejecutado antes
-- (usa la tabla users_crushes existente).

-- -------------------------------------------------
-- Table: fiestas
-- Fiestas patronales de los municipios. Se dan de alta
-- a mano aquí (no hay flujo de creación en la app todavía).
-- -------------------------------------------------
CREATE TABLE IF NOT EXISTS fiestas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE fiestas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can look up fiestas"
    ON fiestas
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Ejemplo para dar de alta una fiesta de prueba (ajusta nombre/código):
-- INSERT INTO fiestas (name, code) VALUES ('Fiestas de Prueba', 'PRUEBA2026');

-- -------------------------------------------------
-- Table: user_fiestas
-- Fiesta activa de cada usuario (una a la vez).
-- -------------------------------------------------
CREATE TABLE IF NOT EXISTS user_fiestas (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    fiesta_id UUID REFERENCES fiestas(id) ON DELETE CASCADE NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_user_fiestas_fiesta_id ON user_fiestas(fiesta_id);

ALTER TABLE user_fiestas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own fiesta"
    ON user_fiestas
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can join a fiesta"
    ON user_fiestas
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can switch their fiesta"
    ON user_fiestas
    FOR UPDATE
    USING (auth.uid() = user_id);

-- -------------------------------------------------
-- Table: penas
-- Peñas apuntadas a una fiesta concreta.
-- -------------------------------------------------
CREATE TABLE IF NOT EXISTS penas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    fiesta_id UUID REFERENCES fiestas(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    image_url TEXT,
    code TEXT NOT NULL UNIQUE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_penas_fiesta_id ON penas(fiesta_id);

ALTER TABLE penas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view penas"
    ON penas
    FOR SELECT
    USING (auth.role() = 'authenticated');

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

CREATE POLICY "Authenticated users can view pena members"
    ON pena_members
    FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Users can join a pena"
    ON pena_members
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave their pena"
    ON pena_members
    FOR DELETE
    USING (auth.uid() = user_id);

-- -------------------------------------------------
-- users_crushes: enlazar cada crush a la fiesta activa
-- -------------------------------------------------
ALTER TABLE users_crushes ADD COLUMN IF NOT EXISTS fiesta_id UUID REFERENCES fiestas(id);
CREATE INDEX IF NOT EXISTS idx_users_crushes_fiesta_id ON users_crushes(fiesta_id);

-- -------------------------------------------------
-- Storage: bucket para las fotos de las peñas
-- -------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('pena-images', 'pena-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view pena images"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'pena-images');

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
    RAISE NOTICE 'Tablas de Fiestas creadas correctamente!';
    RAISE NOTICE '1. fiestas - da de alta al menos una fila para poder canjear un codigo';
    RAISE NOTICE '2. user_fiestas, penas, pena_members - listas';
    RAISE NOTICE '3. users_crushes.fiesta_id - columna añadida';
    RAISE NOTICE '4. bucket pena-images - creado (publico en lectura)';
END $$;
