-- ===================================================
-- Previuca — Schema Completo y Hardening de Seguridad
-- ===================================================
-- Este script es el ESQUEMA UNIFICADO Y SEGURO de Previuca para Supabase.
-- Ejecútalo en el SQL Editor de Supabase para instalaciones desde cero o
-- para asegurar la base de datos completa.
--
-- Es IDEMPOTENTE: puede ejecutarse múltiples veces sin error.

-- -------------------------------------------------
-- 1. Tabla: eventos
-- -------------------------------------------------
CREATE TABLE IF NOT EXISTS eventos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    start_date DATE,
    end_date DATE,
    colors TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can look up eventos" ON eventos;
CREATE POLICY "Authenticated users can look up eventos"
    ON eventos FOR SELECT
    USING (auth.role() = 'authenticated');

-- -------------------------------------------------
-- 2. Tabla: admins
-- -------------------------------------------------
CREATE TABLE IF NOT EXISTS admins (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can check their own admin status" ON admins;
CREATE POLICY "Users can check their own admin status"
    ON admins FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can create eventos" ON eventos;
CREATE POLICY "Admins can create eventos"
    ON eventos FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));

-- Los eventos no tienen un "propietario" individual más allá del admin que
-- los crea, así que editarlos/borrarlos es solo cosa de admins.
DROP POLICY IF EXISTS "Admins can update eventos" ON eventos;
CREATE POLICY "Admins can update eventos"
    ON eventos FOR UPDATE
    USING (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Admins can delete eventos" ON eventos;
CREATE POLICY "Admins can delete eventos"
    ON eventos FOR DELETE
    USING (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));

-- -------------------------------------------------
-- 2b. Tabla: blocked_users
-- -------------------------------------------------
-- Sustituto de un ban real de Supabase Auth (que requeriría la service-role
-- key, no disponible en este proyecto): mientras un usuario tenga fila aquí,
-- la app le muestra una pantalla de bloqueado y no puede publicar en Salseos.
CREATE TABLE IF NOT EXISTS blocked_users (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    blocked_by UUID REFERENCES auth.users(id),
    blocked_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can check their own block status" ON blocked_users;
CREATE POLICY "Users can check their own block status"
    ON blocked_users FOR SELECT
    USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Admins can block users" ON blocked_users;
CREATE POLICY "Admins can block users"
    ON blocked_users FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Admins can unblock users" ON blocked_users;
CREATE POLICY "Admins can unblock users"
    ON blocked_users FOR DELETE
    USING (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));

-- -------------------------------------------------
-- 3. Tabla: profiles
-- -------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    first_name TEXT NOT NULL DEFAULT '',
    last_name TEXT NOT NULL DEFAULT '',
    birthdate DATE,
    gender TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view profiles" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON profiles;
CREATE POLICY "Authenticated users can view profiles"
    ON profiles FOR SELECT
    USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can delete their own profile" ON profiles;
CREATE POLICY "Users can delete their own profile"
    ON profiles FOR DELETE
    USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));

-- Identidad pública en Salseo: el usuario de Instagram vinculado, o uno
-- propio elegido si no tiene Instagram — único en toda la app (case-insensitive).
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS salseo_username TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_salseo_username_unique
    ON profiles (LOWER(salseo_username));

-- Trigger de alta automática de perfil
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

DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();

-- -------------------------------------------------
-- 4. Tabla: user_eventos
-- -------------------------------------------------
CREATE TABLE IF NOT EXISTS user_eventos (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    event_id UUID REFERENCES eventos(id) ON DELETE CASCADE NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    PRIMARY KEY (user_id, event_id)
);

CREATE INDEX IF NOT EXISTS idx_user_eventos_event_id ON user_eventos(event_id);

ALTER TABLE user_eventos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own evento" ON user_eventos;
CREATE POLICY "Users can view their own evento"
    ON user_eventos FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can join an evento" ON user_eventos;
CREATE POLICY "Users can join an evento"
    ON user_eventos FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can leave an evento" ON user_eventos;
CREATE POLICY "Users can leave an evento"
    ON user_eventos FOR DELETE
    USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));

-- -------------------------------------------------
-- 5. Tabla: penas
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
    ON penas FOR SELECT
    USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can create their own pena" ON penas;
CREATE POLICY "Users can create their own pena"
    ON penas FOR INSERT
    WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can update their own pena" ON penas;
CREATE POLICY "Users can update their own pena"
    ON penas FOR UPDATE
    USING (auth.uid() = created_by OR EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can delete their own pena" ON penas;
CREATE POLICY "Users can delete their own pena"
    ON penas FOR DELETE
    USING (auth.uid() = created_by OR EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));

-- -------------------------------------------------
-- 6. Tabla: pena_members
-- -------------------------------------------------
CREATE TABLE IF NOT EXISTS pena_members (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    event_id UUID REFERENCES eventos(id) ON DELETE CASCADE NOT NULL,
    pena_id UUID REFERENCES penas(id) ON DELETE CASCADE NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    PRIMARY KEY (user_id, event_id)
);

CREATE INDEX IF NOT EXISTS idx_pena_members_event_id ON pena_members(event_id);
CREATE INDEX IF NOT EXISTS idx_pena_members_pena_id ON pena_members(pena_id);

ALTER TABLE pena_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view pena members" ON pena_members;
CREATE POLICY "Authenticated users can view pena members"
    ON pena_members FOR SELECT
    USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can join a pena" ON pena_members;
CREATE POLICY "Users can join a pena"
    ON pena_members FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can leave their pena" ON pena_members;
CREATE POLICY "Users can leave their pena"
    ON pena_members FOR DELETE
    USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));

-- -------------------------------------------------
-- 7. Tabla: users_flechazos
-- -------------------------------------------------
CREATE TABLE IF NOT EXISTS users_flechazos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    event_id UUID REFERENCES eventos(id) ON DELETE CASCADE,
    match_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_flechazos_user_id ON users_flechazos(user_id);
CREATE INDEX IF NOT EXISTS idx_users_flechazos_event_id ON users_flechazos(event_id);

ALTER TABLE users_flechazos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own matches" ON users_flechazos;
CREATE POLICY "Users can view their own matches"
    ON users_flechazos FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own matches" ON users_flechazos;
CREATE POLICY "Users can insert their own matches"
    ON users_flechazos FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own matches" ON users_flechazos;
CREATE POLICY "Users can update their own matches"
    ON users_flechazos FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own matches" ON users_flechazos;
CREATE POLICY "Users can delete their own matches"
    ON users_flechazos FOR DELETE
    USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));

-- -------------------------------------------------
-- 8. Tabla: instagram_verification
-- -------------------------------------------------
CREATE TABLE IF NOT EXISTS instagram_verification (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    instagram_username TEXT NOT NULL,
    verification_code TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    verified_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_instagram_verification_user_id ON instagram_verification(user_id);
CREATE INDEX IF NOT EXISTS idx_instagram_verification_username ON instagram_verification(instagram_username);

ALTER TABLE instagram_verification ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read Instagram usernames" ON instagram_verification;
DROP POLICY IF EXISTS "Users can view their own verification" ON instagram_verification;
CREATE POLICY "Users can view their own verification"
    ON instagram_verification FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own verification" ON instagram_verification;
CREATE POLICY "Users can insert their own verification"
    ON instagram_verification FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own verification" ON instagram_verification;
CREATE POLICY "Users can update their own verification"
    ON instagram_verification FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own verification" ON instagram_verification;
CREATE POLICY "Users can delete their own verification"
    ON instagram_verification FOR DELETE
    USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));

-- -------------------------------------------------
-- 9. Tabla: pena_stamp_unlocks
-- -------------------------------------------------
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
    ON pena_stamp_unlocks FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unlock a stamp for themselves" ON pena_stamp_unlocks;
CREATE POLICY "Users can unlock a stamp for themselves"
    ON pena_stamp_unlocks FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND event_id = (SELECT p.event_id FROM penas p WHERE p.id = pena_id)
    );

DROP POLICY IF EXISTS "Users can delete their own stamps" ON pena_stamp_unlocks;
CREATE POLICY "Users can delete their own stamps"
    ON pena_stamp_unlocks FOR DELETE
    USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));

-- -------------------------------------------------
-- 10. Funciones RPC Seguras
-- -------------------------------------------------

-- Confirmación segura de verificación de Instagram
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
    SELECT * INTO v_record
    FROM instagram_verification
    WHERE user_id = auth.uid();

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'No se encontró registro de verificación');
    END IF;

    IF v_record.is_verified THEN
        RETURN jsonb_build_object('success', true, 'already_verified', true);
    END IF;

    IF LOWER(REPLACE(v_record.verification_code, ' ', ''))
       != LOWER(REPLACE(p_verification_code, ' ', '')) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Código de verificación incorrecto');
    END IF;

    UPDATE instagram_verification
    SET is_verified = true,
        verified_at = NOW()
    WHERE user_id = auth.uid();

    RETURN jsonb_build_object('success', true, 'verified', true);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.confirm_instagram_verification(TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.confirm_instagram_verification(TEXT) TO authenticated;

-- Obtener admiradores de forma segura (sin exponer lecturas de flechazos ajenos)
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
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM instagram_verification
        WHERE user_id = auth.uid()
        AND LOWER(REPLACE(instagram_username, ' ', '')) = LOWER(REPLACE(p_my_instagram, ' ', ''))
    ) THEN
        RAISE EXCEPTION 'Instagram username does not match authenticated user';
    END IF;

    RETURN QUERY
    SELECT uf.user_id
    FROM users_flechazos uf
    WHERE uf.match_name = LOWER(REPLACE(p_my_instagram, ' ', ''))
    AND uf.event_id = p_event_id
    AND uf.user_id != auth.uid();
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_my_admirers(UUID, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_my_admirers(UUID, TEXT) TO authenticated;

-- Obtener instagrams de admiradores verificados
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

    SELECT iv.instagram_username INTO v_my_instagram
    FROM instagram_verification iv
    WHERE iv.user_id = auth.uid();

    IF v_my_instagram IS NULL THEN
        RETURN;
    END IF;

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

-- -------------------------------------------------
-- 11. Storage Bucket: pena-images
-- -------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('pena-images', 'pena-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Anyone can view pena images" ON storage.objects;
CREATE POLICY "Anyone can view pena images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'pena-images');

DROP POLICY IF EXISTS "Authenticated users can upload their pena image" ON storage.objects;
CREATE POLICY "Authenticated users can upload their pena image"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'pena-images'
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

DROP POLICY IF EXISTS "Users can delete their pena image" ON storage.objects;
CREATE POLICY "Users can delete their pena image"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'pena-images'
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- -------------------------------------------------
-- 12. Audit Log (Historial de Auditoría)
-- -------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_log (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_email TEXT,
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    event_id UUID,
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION audit_log_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
    v_user_id UUID;
    v_event_id UUID;
    v_email TEXT;
    v_user_col TEXT := COALESCE(TG_ARGV[0], 'user_id');
BEGIN
    IF TG_OP = 'DELETE' THEN
        v_user_id := (to_jsonb(OLD) ->> v_user_col)::uuid;
        v_event_id := (to_jsonb(OLD) ->> 'event_id')::uuid;
    ELSE
        v_user_id := (to_jsonb(NEW) ->> v_user_col)::uuid;
        v_event_id := (to_jsonb(NEW) ->> 'event_id')::uuid;
    END IF;

    SELECT email INTO v_email FROM auth.users WHERE id = v_user_id;

    INSERT INTO audit_log (user_id, user_email, action, table_name, event_id, old_data, new_data)
    VALUES (
        v_user_id,
        v_email,
        TG_OP,
        TG_TABLE_NAME,
        v_event_id,
        CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('UPDATE', 'INSERT') THEN to_jsonb(NEW) ELSE NULL END
    );

    RETURN COALESCE(NEW, OLD);
END;
$fn$;

DROP TRIGGER IF EXISTS audit_user_eventos ON user_eventos;
CREATE TRIGGER audit_user_eventos
    AFTER INSERT OR UPDATE OR DELETE ON user_eventos
    FOR EACH ROW EXECUTE FUNCTION audit_log_trigger('user_id');

DROP TRIGGER IF EXISTS audit_pena_members ON pena_members;
CREATE TRIGGER audit_pena_members
    AFTER INSERT OR UPDATE OR DELETE ON pena_members
    FOR EACH ROW EXECUTE FUNCTION audit_log_trigger('user_id');

DROP TRIGGER IF EXISTS audit_users_flechazos ON users_flechazos;
CREATE TRIGGER audit_users_flechazos
    AFTER INSERT OR UPDATE OR DELETE ON users_flechazos
    FOR EACH ROW EXECUTE FUNCTION audit_log_trigger('user_id');

DROP TRIGGER IF EXISTS audit_pena_stamp_unlocks ON pena_stamp_unlocks;
CREATE TRIGGER audit_pena_stamp_unlocks
    AFTER INSERT OR UPDATE OR DELETE ON pena_stamp_unlocks
    FOR EACH ROW EXECUTE FUNCTION audit_log_trigger('user_id');

DROP TRIGGER IF EXISTS audit_profiles ON profiles;
CREATE TRIGGER audit_profiles
    AFTER INSERT OR UPDATE OR DELETE ON profiles
    FOR EACH ROW EXECUTE FUNCTION audit_log_trigger('user_id');

DROP TRIGGER IF EXISTS audit_penas ON penas;
CREATE TRIGGER audit_penas
    AFTER INSERT OR UPDATE OR DELETE ON penas
    FOR EACH ROW EXECUTE FUNCTION audit_log_trigger('created_by');

-- -------------------------------------------------
-- 13. Tablas: salseos_posts, salseos_replies, salseos_likes
-- -------------------------------------------------
CREATE TABLE IF NOT EXISTS salseos_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES eventos(id) ON DELETE CASCADE NOT NULL,
    author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_salseos_posts_event_id ON salseos_posts(event_id);

CREATE TABLE IF NOT EXISTS salseos_replies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES salseos_posts(id) ON DELETE CASCADE NOT NULL,
    event_id UUID REFERENCES eventos(id) ON DELETE CASCADE NOT NULL,
    author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_salseos_replies_post_id ON salseos_replies(post_id);

CREATE TABLE IF NOT EXISTS salseos_likes (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    post_id UUID REFERENCES salseos_posts(id) ON DELETE CASCADE NOT NULL,
    event_id UUID REFERENCES eventos(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    PRIMARY KEY (user_id, post_id)
);

CREATE INDEX IF NOT EXISTS idx_salseos_likes_post_id ON salseos_likes(post_id);

ALTER TABLE salseos_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE salseos_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE salseos_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view salseos posts" ON salseos_posts;
CREATE POLICY "Authenticated users can view salseos posts"
    ON salseos_posts FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can create their own salseos posts" ON salseos_posts;
CREATE POLICY "Users can create their own salseos posts"
    ON salseos_posts FOR INSERT
    WITH CHECK (
        auth.uid() = author_id
        AND NOT EXISTS (SELECT 1 FROM blocked_users WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Author or admin can delete salseos posts" ON salseos_posts;
CREATE POLICY "Author or admin can delete salseos posts"
    ON salseos_posts FOR DELETE
    USING (
        auth.uid() = author_id
        OR EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Authenticated users can view salseos replies" ON salseos_replies;
CREATE POLICY "Authenticated users can view salseos replies"
    ON salseos_replies FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can create their own salseos replies" ON salseos_replies;
CREATE POLICY "Users can create their own salseos replies"
    ON salseos_replies FOR INSERT
    WITH CHECK (
        auth.uid() = author_id
        AND event_id = (SELECT p.event_id FROM salseos_posts p WHERE p.id = post_id)
        AND NOT EXISTS (SELECT 1 FROM blocked_users WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Author or admin can delete salseos replies" ON salseos_replies;
CREATE POLICY "Author or admin can delete salseos replies"
    ON salseos_replies FOR DELETE
    USING (
        auth.uid() = author_id
        OR EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Authenticated users can view salseos likes" ON salseos_likes;
CREATE POLICY "Authenticated users can view salseos likes"
    ON salseos_likes FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can like posts" ON salseos_likes;
CREATE POLICY "Users can like posts"
    ON salseos_likes FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND event_id = (SELECT p.event_id FROM salseos_posts p WHERE p.id = post_id)
    );

DROP POLICY IF EXISTS "Users can unlike their own like" ON salseos_likes;
CREATE POLICY "Users can unlike their own like"
    ON salseos_likes FOR DELETE
    USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));

DROP TRIGGER IF EXISTS audit_salseos_posts ON salseos_posts;
CREATE TRIGGER audit_salseos_posts
    AFTER INSERT OR UPDATE OR DELETE ON salseos_posts
    FOR EACH ROW EXECUTE FUNCTION audit_log_trigger('author_id');

DROP TRIGGER IF EXISTS audit_salseos_replies ON salseos_replies;
CREATE TRIGGER audit_salseos_replies
    AFTER INSERT OR UPDATE OR DELETE ON salseos_replies
    FOR EACH ROW EXECUTE FUNCTION audit_log_trigger('author_id');

-- -------------------------------------------------
-- 14. Tabla: salseos_reports
-- -------------------------------------------------
CREATE TABLE IF NOT EXISTS salseos_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES eventos(id) ON DELETE CASCADE NOT NULL,
    post_id UUID REFERENCES salseos_posts(id) ON DELETE CASCADE,
    reply_id UUID REFERENCES salseos_replies(id) ON DELETE CASCADE,
    reporter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    reason TEXT NOT NULL CHECK (reason IN ('acoso', 'ofensivo', 'suplantacion', 'spam', 'otro')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT salseos_reports_target_check CHECK (
        (post_id IS NOT NULL AND reply_id IS NULL) OR (post_id IS NULL AND reply_id IS NOT NULL)
    )
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_salseos_reports_unique_post
    ON salseos_reports(reporter_id, post_id) WHERE post_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_salseos_reports_unique_reply
    ON salseos_reports(reporter_id, reply_id) WHERE reply_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_salseos_reports_post_id ON salseos_reports(post_id);
CREATE INDEX IF NOT EXISTS idx_salseos_reports_reply_id ON salseos_reports(reply_id);

ALTER TABLE salseos_reports ENABLE ROW LEVEL SECURITY;

-- Solo quien reportó (para saber que ya lo hizo) o un admin (para moderar)
-- pueden ver los reportes; nunca la persona autora del contenido reportado.
DROP POLICY IF EXISTS "Reporter or admin can view salseos reports" ON salseos_reports;
CREATE POLICY "Reporter or admin can view salseos reports"
    ON salseos_reports FOR SELECT
    USING (
        auth.uid() = reporter_id
        OR EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Users can report salseos content" ON salseos_reports;
CREATE POLICY "Users can report salseos content"
    ON salseos_reports FOR INSERT
    WITH CHECK (
        auth.uid() = reporter_id
        AND (
            (post_id IS NOT NULL AND event_id = (SELECT p.event_id FROM salseos_posts p WHERE p.id = post_id))
            OR
            (reply_id IS NOT NULL AND event_id = (SELECT r.event_id FROM salseos_replies r WHERE r.id = reply_id))
        )
    );

-- Solo un admin puede borrar un reporte (limpieza al eliminar la cuenta del
-- reportante); el propio reportante no puede borrarlo para ocultar evidencia.
DROP POLICY IF EXISTS "Admins can delete salseos reports" ON salseos_reports;
CREATE POLICY "Admins can delete salseos reports"
    ON salseos_reports FOR DELETE
    USING (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));

DROP TRIGGER IF EXISTS audit_salseos_reports ON salseos_reports;
CREATE TRIGGER audit_salseos_reports
    AFTER INSERT OR UPDATE OR DELETE ON salseos_reports
    FOR EACH ROW EXECUTE FUNCTION audit_log_trigger('reporter_id');

-- -------------------------------------------------
-- 15. Tabla: user_notices
-- -------------------------------------------------
-- Avisos que un admin envía a un usuario (p.ej. tras moderar un reporte).
CREATE TABLE IF NOT EXISTS user_notices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    message TEXT NOT NULL,
    report_id UUID REFERENCES salseos_reports(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    read_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_user_notices_user_id ON user_notices(user_id);

ALTER TABLE user_notices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own notices" ON user_notices;
CREATE POLICY "Users can view their own notices"
    ON user_notices FOR SELECT
    USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Admins can send notices" ON user_notices;
CREATE POLICY "Admins can send notices"
    ON user_notices FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can mark their own notices as read" ON user_notices;
CREATE POLICY "Users can mark their own notices as read"
    ON user_notices FOR UPDATE
    USING (auth.uid() = user_id);

-- -------------------------------------------------
-- 16. Tabla: app_feedback
-- -------------------------------------------------
-- Reportes de fallos/sugerencias sobre la propia app (no sobre otros
-- usuarios ni contenido), enviados desde Ajustes y revisados en el panel
-- de administración.
CREATE TABLE IF NOT EXISTS app_feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('fallo', 'sugerencia', 'otro')),
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_app_feedback_user_id ON app_feedback(user_id);

ALTER TABLE app_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can send app feedback" ON app_feedback;
CREATE POLICY "Users can send app feedback"
    ON app_feedback FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view app feedback" ON app_feedback;
CREATE POLICY "Admins can view app feedback"
    ON app_feedback FOR SELECT
    USING (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Admins can delete app feedback" ON app_feedback;
CREATE POLICY "Admins can delete app feedback"
    ON app_feedback FOR DELETE
    USING (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));

-- -------------------------------------------------
-- Success Notification
-- -------------------------------------------------
DO $$
BEGIN
    RAISE NOTICE '✅ Esquema completo y endurecimiento de seguridad de Previuca listo.';
END $$;
