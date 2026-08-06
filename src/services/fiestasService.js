import { supabase } from '../config/supabase';

// Buscar una fiesta por su código y apuntar al usuario (sustituye la fiesta activa si ya tenía una)
export const redeemFiestaCode = async (userId, code) => {
    try {
        const cleanCode = code.trim().toUpperCase();

        const { data: fiesta, error: fiestaError } = await supabase
            .from('fiestas')
            .select('*')
            .eq('code', cleanCode)
            .single();

        if (fiestaError || !fiesta) {
            return { success: false, error: 'Código de fiesta no válido' };
        }

        const { error: upsertError } = await supabase
            .from('user_fiestas')
            .upsert([{ user_id: userId, fiesta_id: fiesta.id }], { onConflict: 'user_id' });

        if (upsertError) throw upsertError;

        return { success: true, fiesta };
    } catch (error) {
        console.error('Error redeeming fiesta code:', error);
        return { success: false, error: error.message };
    }
};

// Obtener la fiesta activa del usuario (o null si no tiene ninguna)
export const getUserFiesta = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('user_fiestas')
            .select('fiesta_id, fiestas(id, name, code)')
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;

        return { success: true, fiesta: data?.fiestas || null };
    } catch (error) {
        console.error('Error getting user fiesta:', error);
        return { success: false, error: error.message, fiesta: null };
    }
};
