-- ===================================================
-- Previuca — Renombrar "Crush" a "Flechazo"
-- ===================================================
-- Ejecuta este script en el SQL Editor de tu proyecto de Supabase
-- para renombrar la tabla ya existente `users_crushes` (con datos)
-- a `users_flechazos`, sin perder ninguna fila.
-- Los scripts base (supabase-setup.sql, supabase-setup-eventos.sql)
-- ya usan el nombre nuevo para instalaciones desde cero.

ALTER TABLE IF EXISTS users_crushes RENAME TO users_flechazos;

ALTER INDEX IF EXISTS idx_users_crushes_user_id RENAME TO idx_users_flechazos_user_id;
ALTER INDEX IF EXISTS idx_users_crushes_event_id RENAME TO idx_users_flechazos_event_id;

DO $$
BEGIN
    RAISE NOTICE 'users_crushes renombrada a users_flechazos (datos e índices conservados).';
END $$;
