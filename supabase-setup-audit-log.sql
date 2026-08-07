-- Registro de auditoría: guarda toda acción de escritura (INSERT/UPDATE/DELETE)
-- sobre las tablas de datos de usuario, para conservar un historial aunque el
-- usuario abandone un evento/peña o, en el futuro, se borre su cuenta.
--
-- No es accesible desde el cliente (RLS activo sin políticas: solo lectura
-- vía la API de gestión de Supabase). Se rellena exclusivamente mediante
-- triggers SECURITY DEFINER, así que ninguna acción del cliente puede
-- omitirlo ni falsificarlo.

CREATE TABLE audit_log (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_email TEXT,
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    event_id UUID,
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
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

CREATE TRIGGER audit_user_eventos
    AFTER INSERT OR UPDATE OR DELETE ON user_eventos
    FOR EACH ROW EXECUTE FUNCTION audit_log_trigger('user_id');

CREATE TRIGGER audit_pena_members
    AFTER INSERT OR UPDATE OR DELETE ON pena_members
    FOR EACH ROW EXECUTE FUNCTION audit_log_trigger('user_id');

CREATE TRIGGER audit_users_flechazos
    AFTER INSERT OR UPDATE OR DELETE ON users_flechazos
    FOR EACH ROW EXECUTE FUNCTION audit_log_trigger('user_id');

CREATE TRIGGER audit_pena_stamp_unlocks
    AFTER INSERT OR UPDATE OR DELETE ON pena_stamp_unlocks
    FOR EACH ROW EXECUTE FUNCTION audit_log_trigger('user_id');

CREATE TRIGGER audit_profiles
    AFTER INSERT OR UPDATE OR DELETE ON profiles
    FOR EACH ROW EXECUTE FUNCTION audit_log_trigger('user_id');

CREATE TRIGGER audit_penas
    AFTER INSERT OR UPDATE OR DELETE ON penas
    FOR EACH ROW EXECUTE FUNCTION audit_log_trigger('created_by');
