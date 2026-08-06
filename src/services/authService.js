import { supabase } from '../config/supabase';

// Registro de nuevo usuario. metadata (first_name/last_name) queda en
// auth.users.raw_user_meta_data y un trigger en BD crea el perfil a partir
// de ella, sin depender de que ya haya sesión activa (email sin confirmar).
export const signUp = async (email, password, metadata = {}) => {
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: metadata },
        });

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error en registro:', error.message);
        return { data: null, error: error.message };
    }
};

// Inicio de sesión
export const signIn = async (email, password) => {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error en login:', error.message);
        return { data: null, error: error.message };
    }
};

// Cerrar sesión
export const signOut = async () => {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        return { error: null };
    } catch (error) {
        console.error('Error en logout:', error.message);
        return { error: error.message };
    }
};

// Obtener usuario actual
export const getCurrentUser = async () => {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        return { user, error: null };
    } catch (error) {
        console.error('Error obteniendo usuario:', error.message);
        return { user: null, error: error.message };
    }
};

// Obtener sesión actual
export const getSession = async () => {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        return { session, error: null };
    } catch (error) {
        console.error('Error obteniendo sesión:', error.message);
        return { session: null, error: error.message };
    }
};

// Listener para cambios de autenticación
export const onAuthStateChange = (callback) => {
    return supabase.auth.onAuthStateChange(callback);
};
