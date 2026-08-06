import { supabase } from '../config/supabase';

const generateEventCode = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
};

// Buscar un evento por su código y apuntar al usuario (se añade a los que ya tenga)
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
            .upsert([{ user_id: userId, event_id: evento.id }], { onConflict: 'user_id,event_id' });

        if (upsertError) throw upsertError;

        return { success: true, evento };
    } catch (error) {
        console.error('Error redeeming event code:', error);
        return { success: false, error: error.message };
    }
};

// Todos los eventos a los que pertenece el usuario
export const getUserEvents = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('user_eventos')
            .select('event_id, eventos(*)')
            .eq('user_id', userId)
            .order('joined_at', { ascending: true });

        if (error) throw error;

        const eventos = (data || []).map((row) => row.eventos).filter(Boolean);
        return { success: true, eventos };
    } catch (error) {
        console.error('Error getting user events:', error);
        return { success: false, error: error.message, eventos: [] };
    }
};

// Crea un evento nuevo (solo admins, la RLS lo exige) y apunta al creador automáticamente
export const createEvent = async ({ userId, name, description, startDate, endDate, colors }) => {
    try {
        const code = generateEventCode();

        const { data: evento, error } = await supabase
            .from('eventos')
            .insert([{
                name: name.trim(),
                description: description?.trim() || null,
                start_date: startDate || null,
                end_date: endDate || null,
                colors,
                code,
            }])
            .select()
            .single();

        if (error) throw error;

        const { error: joinError } = await supabase
            .from('user_eventos')
            .insert([{ user_id: userId, event_id: evento.id }]);

        if (joinError) throw joinError;

        return { success: true, evento };
    } catch (error) {
        console.error('Error creating event:', error);
        return { success: false, error: error.message };
    }
};
