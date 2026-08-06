-- ===================================================
-- Previuca — Eventos v2: multi-evento por usuario + rol admin
-- ===================================================
-- Sigue a supabase-setup-eventos.sql. Cambia user_eventos de
-- "un evento por usuario" a "varios eventos por usuario", añade
-- el rol admin y los campos de detalle de un evento (descripción,
-- fechas, colores).

-- -------------------------------------------------
-- user_eventos: permitir varias filas por usuario
-- -------------------------------------------------
ALTER TABLE user_eventos DROP CONSTRAINT IF EXISTS user_eventos_pkey;
ALTER TABLE user_eventos ADD PRIMARY KEY (user_id, event_id);

-- Ya no se "cambia" de evento, se añaden más — esta policy sobra.
DROP POLICY IF EXISTS "Users can switch their evento" ON user_eventos;

-- -------------------------------------------------
-- Table: admins
-- Pertenecer a esta tabla es tener el rol de administrador.
-- -------------------------------------------------
CREATE TABLE IF NOT EXISTS admins (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can check their own admin status" ON admins;
CREATE POLICY "Users can check their own admin status"
    ON admins
    FOR SELECT
    USING (auth.uid() = user_id);

-- -------------------------------------------------
-- eventos: detalle (descripción, fechas, colores) + quién puede crear
-- -------------------------------------------------
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS colors TEXT[] NOT NULL DEFAULT '{}';

DROP POLICY IF EXISTS "Admins can create eventos" ON eventos;
CREATE POLICY "Admins can create eventos"
    ON eventos
    FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));

-- -------------------------------------------------
-- Success message
-- -------------------------------------------------
DO $$
BEGIN
    RAISE NOTICE 'Eventos v2 aplicado!';
    RAISE NOTICE '1. user_eventos ahora admite varios eventos por usuario';
    RAISE NOTICE '2. admins - lista vacía, hay que insertar manualmente';
    RAISE NOTICE '3. eventos.description/start_date/end_date/colors - añadidas';
END $$;
