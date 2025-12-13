import { createClient } from '@supabase/supabase-js';

// Estas credenciales las obtendrás de tu proyecto en https://supabase.com
// Por ahora dejaré las variables de entorno que deberás configurar
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true, // Habilitar persistencia de sesión
        storageKey: 'patronaleague-auth', // Clave personalizada para localStorage
        storage: window.localStorage, // Usar localStorage del navegador
        autoRefreshToken: true, // Refrescar token automáticamente
        detectSessionInUrl: true, // Detectar sesión en URL (útil para OAuth)
        flowType: 'pkce' // Usar PKCE flow para mejor seguridad
    },
    global: {
        headers: {
            'x-client-info': 'patronaleague-app'
        }
    },
    db: {
        schema: 'public'
    },
    realtime: {
        params: {
            eventsPerSecond: 2 // Limitar eventos de realtime
        }
    }
});
