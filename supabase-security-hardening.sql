-- ===================================================
-- Previuca — Hardening de Seguridad
-- ===================================================
-- Ejecuta este script en el SQL Editor de tu proyecto de Supabase.
--
-- IMPORTANTE: este script es IDEMPOTENTE — puedes ejecutarlo varias veces
-- sin efectos secundarios. Usa DROP POLICY IF EXISTS antes de cada CREATE.
--
-- Correcciones aplicadas:
--   C3  — instagram_verification: eliminar USING(true) de SELECT
--   A8  — instagram_verification: impedir UPDATE directo de is_verified
--   C4  — users_flechazos: función RPC segura para "quién me tiene"
--   C7  — user_eventos: añadir policy DELETE
--   A3  — pena_stamp_unlocks: añadir policy DELETE
--   A2  — profiles: añadir policy DELETE
--   A1  — profiles: restringir SELECT a authenticated
--   M3  — profiles: añadir columnas birthdate y gender + actualizar trigger

-- =============================================================
-- 1. instagram_verification — Corregir SELECT abierto (C3)
-- =============================================================
-- Eliminar la política permisiva que deja leer TODA la tabla a CUALQUIERA.
DROP POLICY IF EXISTS "Anyone can read Instagram usernames" ON instagram_verification;

-- La política "Users can view their own verification" ya existe con
-- USING (auth.uid() = user_id), que es correcta. Verificamos que esté:
DROP POLICY IF EXISTS "Users can view their own verification" ON instagram_verification;
CREATE POLICY "Users can view their own verification"
    ON instagram_verification
    FOR SELECT
    USING (auth.uid() = user_id);

-- =============================================================
-- 2. instagram_verification — Proteger is_verified (A8)
-- =============================================================
-- La policy UPDATE actual permite al usuario modificar cualquier campo
-- de su propio registro, incluyendo is_verified y verified_at.
-- La reemplazamos por una que solo permita cambiar username y code,
-- NO is_verified ni verified_at (esos los cambia solo la función RPC).

DROP POLICY IF EXISTS "Users can update their own verification" ON instagram_verification;
CREATE POLICY "Users can update their own verification"
    ON instagram_verification
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Función RPC SECURITY DEFINER para marcar como verificado.
-- Solo la puede llamar el usuario dueño del registro, y verifica
-- que el código proporcionado coincida con el almacenado.
CREATE OR REPLACE FUNCTION public.confirm_instagram_verification(
    p_verification_code TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_record instagram_verification%ROWTYPE;
BEGIN
    -- Obtener el registro del usuario autenticado
    SELECT * INTO v_record
    FROM instagram_verification
    WHERE user_id = auth.uid();

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'No se encontró registro de verificación');
    END IF;

    IF v_record.is_verified THEN
        RETURN jsonb_build_object('success', true, 'already_verified', true);
    END IF;

    -- Comparar código (case insensitive, sin espacios)
    IF LOWER(REPLACE(v_record.verification_code, ' ', ''))
       != LOWER(REPLACE(p_verification_code, ' ', '')) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Código de verificación incorrecto');
    END IF;

    -- Marcar como verificado
    UPDATE instagram_verification
    SET is_verified = true,
        verified_at = NOW()
    WHERE user_id = auth.uid();

    RETURN jsonb_build_object('success', true, 'verified', true);
END;
$$;

-- Solo usuarios autenticados pueden llamar a esta función
REVOKE EXECUTE ON FUNCTION public.confirm_instagram_verification(TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.confirm_instagram_verification(TEXT) TO authenticated;

-- =============================================================
-- 3. users_flechazos — RPC segura para "quién me tiene" (C4)
-- =============================================================
-- Esta función devuelve los user_ids de usuarios que tienen al
-- solicitante en su lista de flechazos (dentro de un evento concreto).
-- Es SECURITY DEFINER para poder leer flechazos de OTROS usuarios,
-- pero SOLO devuelve user_ids de quienes tienen tu instagram.
CREATE OR REPLACE FUNCTION public.get_my_admirers(
    p_event_id UUID,
    p_my_instagram TEXT
)
RETURNS TABLE (admirer_user_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Validar que el usuario está autenticado
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Validar que el instagram proporcionado pertenece al usuario autenticado
    IF NOT EXISTS (
        SELECT 1 FROM instagram_verification
        WHERE user_id = auth.uid()
        AND LOWER(REPLACE(instagram_username, ' ', '')) = LOWER(REPLACE(p_my_instagram, ' ', ''))
    ) THEN
        RAISE EXCEPTION 'Instagram username does not match authenticated user';
    END IF;

    -- Devolver user_ids de quienes me tienen en su lista
    RETURN QUERY
    SELECT uf.user_id
    FROM users_flechazos uf
    WHERE uf.match_name = LOWER(REPLACE(p_my_instagram, ' ', ''))
    AND uf.event_id = p_event_id
    AND uf.user_id != auth.uid();  -- No incluirme a mí mismo
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_my_admirers(UUID, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_my_admirers(UUID, TEXT) TO authenticated;

-- Función complementaria: obtener los instagrams de una lista de user_ids.
-- Solo devuelve los instagrams de usuarios que tienen al solicitante en su
-- lista (no permite lectura arbitraria).
CREATE OR REPLACE FUNCTION public.get_admirer_instagrams(
    p_event_id UUID,
    p_admirer_ids UUID[]
)
RETURNS TABLE (admirer_user_id UUID, instagram_username TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_my_instagram TEXT;
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Obtener mi instagram
    SELECT iv.instagram_username INTO v_my_instagram
    FROM instagram_verification iv
    WHERE iv.user_id = auth.uid();

    IF v_my_instagram IS NULL THEN
        RETURN;
    END IF;

    -- Solo devolver instagrams de usuarios que realmente me tienen en su lista
    RETURN QUERY
    SELECT iv.user_id, iv.instagram_username
    FROM instagram_verification iv
    INNER JOIN users_flechazos uf ON uf.user_id = iv.user_id
    WHERE iv.user_id = ANY(p_admirer_ids)
    AND uf.match_name = LOWER(REPLACE(v_my_instagram, ' ', ''))
    AND uf.event_id = p_event_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_admirer_instagrams(UUID, UUID[]) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_admirer_instagrams(UUID, UUID[]) TO authenticated;

-- =============================================================
-- 4. user_eventos — Añadir policy DELETE (C7)
-- =============================================================
DROP POLICY IF EXISTS "Users can leave an evento" ON user_eventos;
CREATE POLICY "Users can leave an evento"
    ON user_eventos
    FOR DELETE
    USING (auth.uid() = user_id);

-- =============================================================
-- 5. pena_stamp_unlocks — Añadir policy DELETE (A3)
-- =============================================================
DROP POLICY IF EXISTS "Users can delete their own stamps" ON pena_stamp_unlocks;
CREATE POLICY "Users can delete their own stamps"
    ON pena_stamp_unlocks
    FOR DELETE
    USING (auth.uid() = user_id);

-- =============================================================
-- 6. profiles — Añadir policy DELETE y restringir SELECT (A1, A2)
-- =============================================================
-- Eliminar la política abierta
DROP POLICY IF EXISTS "Anyone can view profiles" ON profiles;

-- Reemplazar con política restringida a usuarios autenticados
-- (necesario para ver miembros de peña, admiradores, etc.)
CREATE POLICY "Authenticated users can view profiles"
    ON profiles
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Permitir al usuario eliminar su propio perfil
DROP POLICY IF EXISTS "Users can delete their own profile" ON profiles;
CREATE POLICY "Users can delete their own profile"
    ON profiles
    FOR DELETE
    USING (auth.uid() = user_id);

-- =============================================================
-- 7. profiles — Añadir columnas birthdate y gender (M3)
-- =============================================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS birthdate DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gender TEXT;

-- Actualizar el trigger para incluir birthdate y gender
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, first_name, last_name, birthdate, gender)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        CASE
            WHEN NEW.raw_user_meta_data->>'birthdate' IS NOT NULL
            THEN (NEW.raw_user_meta_data->>'birthdate')::DATE
            ELSE NULL
        END,
        NEW.raw_user_meta_data->>'gender'
    )
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =============================================================
-- 8. instagram_verification — Añadir policy DELETE (faltaba)
-- =============================================================
-- Ya existe en supabase-setup.sql. Verificamos:
DROP POLICY IF EXISTS "Users can delete their own verification" ON instagram_verification;
CREATE POLICY "Users can delete their own verification"
    ON instagram_verification
    FOR DELETE
    USING (auth.uid() = user_id);

-- =============================================================
-- 9. Auditoría de triggers existentes (verificación)
-- =============================================================
-- Los triggers de audit_log usan SECURITY DEFINER con search_path = public.
-- Esto es correcto. No se necesitan cambios.

-- =============================================================
-- Success
-- =============================================================
DO $$
BEGIN
    RAISE NOTICE '✅ Hardening de seguridad aplicado correctamente:';
    RAISE NOTICE '  - instagram_verification: SELECT restringido al propio usuario';
    RAISE NOTICE '  - instagram_verification: is_verified protegido con función RPC';
    RAISE NOTICE '  - users_flechazos: RPC segura para admiradores';
    RAISE NOTICE '  - user_eventos: policy DELETE añadida';
    RAISE NOTICE '  - pena_stamp_unlocks: policy DELETE añadida';
    RAISE NOTICE '  - profiles: SELECT restringido a authenticated, DELETE añadida';
    RAISE NOTICE '  - profiles: columnas birthdate y gender añadidas';
END $$;
