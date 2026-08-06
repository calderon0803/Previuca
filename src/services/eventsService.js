import { supabase } from '../config/supabase';

// Buscar un evento por su código y apuntar al usuario (sustituye el evento activo si ya tenía uno)
export const redeemEventCode = async (userId, code) => {
    try {
        const cleanCode = code.trim().toUpperCase();

        const { data: evento, error: eventoError } = await supabase
            .from('eventos')
            .select('*')
            .eq('code', cleanCode)
            .single();

        if (eventoError || !evento) {
            return { success: false, error: 'Código de evento no válido' };
        }

        const { error: upsertError } = await supabase
            .from('user_eventos')
            .upsert([{ user_id: userId, event_id: evento.id }], { onConflict: 'user_id' });

        if (upsertError) throw upsertError;

        return { success: true, evento };
    } catch (error) {
        console.error('Error redeeming event code:', error);
        return { success: false, error: error.message };
    }
};

// Obtener el evento activo del usuario (o null si no tiene ninguno)
export const getUserEvent = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('user_eventos')
            .select('event_id, eventos(id, name, code)')
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;

        return { success: true, evento: data?.eventos || null };
    } catch (error) {
        console.error('Error getting user event:', error);
        return { success: false, error: error.message, evento: null };
    }
};
