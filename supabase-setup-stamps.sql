-- ===================================================
-- Previuca — Álbum de sellos (desbloqueos por peña)
-- ===================================================
-- Ejecuta este script en el SQL Editor de tu proyecto de Supabase.
-- El sello en sí (el dibujo) no se guarda en BD: se genera siempre a partir
-- de penas.id/name/color (ver src/components/PenaStamp.jsx). Esta tabla solo
-- registra qué peñas ha desbloqueado cada usuario dentro de cada evento.

CREATE TABLE IF NOT EXISTS pena_stamp_unlocks (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    pena_id UUID REFERENCES penas(id) ON DELETE CASCADE NOT NULL,
    event_id UUID REFERENCES eventos(id) ON DELETE CASCADE NOT NULL,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    PRIMARY KEY (user_id, pena_id)
);

CREATE INDEX IF NOT EXISTS idx_pena_stamp_unlocks_event_id ON pena_stamp_unlocks(event_id);

ALTER TABLE pena_stamp_unlocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own unlocked stamps" ON pena_stamp_unlocks;
CREATE POLICY "Users can view their own unlocked stamps"
    ON pena_stamp_unlocks
    FOR SELECT
    USING (auth.uid() = user_id);

-- El event_id debe coincidir con el evento real de la peña que se desbloquea,
-- para que un insert manipulado no pueda colgar el sello del evento equivocado.
DROP POLICY IF EXISTS "Users can unlock a stamp for themselves" ON pena_stamp_unlocks;
CREATE POLICY "Users can unlock a stamp for themselves"
    ON pena_stamp_unlocks
    FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND event_id = (SELECT p.event_id FROM penas p WHERE p.id = pena_id)
    );

DO $$
BEGIN
    RAISE NOTICE 'pena_stamp_unlocks creada. El sello se sigue generando en el cliente a partir de penas.id/name/color.';
END $$;
