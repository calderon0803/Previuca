-- ===================================================
-- Previuca — Eventos v3: una peña por usuario POR EVENTO
-- ===================================================
-- pena_members no distinguía evento, así que con multi-evento la
-- "peña del usuario" se colaba en todos los eventos a la vez.

ALTER TABLE pena_members ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES eventos(id);

UPDATE pena_members pm
SET event_id = p.event_id
FROM penas p
WHERE pm.pena_id = p.id AND pm.event_id IS NULL;

ALTER TABLE pena_members ALTER COLUMN event_id SET NOT NULL;

ALTER TABLE pena_members DROP CONSTRAINT IF EXISTS pena_members_pkey;
ALTER TABLE pena_members ADD PRIMARY KEY (user_id, event_id);

CREATE INDEX IF NOT EXISTS idx_pena_members_event_id ON pena_members(event_id);

DO $$
BEGIN
    RAISE NOTICE 'pena_members ahora exige una peña distinta por evento, no global.';
END $$;
