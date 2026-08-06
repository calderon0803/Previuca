import { supabase } from '../config/supabase';

// IDs de peña que el usuario ya ha desbloqueado dentro de un evento
export const getUnlockedStamps = async (userId, eventId) => {
    try {
        const { data, error } = await supabase
            .from('pena_stamp_unlocks')
            .select('pena_id')
            .eq('user_id', userId)
            .eq('event_id', eventId);

        if (error) throw error;

        return { success: true, penaIds: (data || []).map((row) => row.pena_id) };
    } catch (error) {
        console.error('Error loading unlocked stamps:', error);
        return { success: false, error: error.message, penaIds: [] };
    }
};

// Desbloquea el sello de una peña para el usuario. Idempotente: repetir el
// escaneo (o el auto-desbloqueo al crear/unirse) nunca lanza error.
export const unlockStamp = async (userId, penaId, eventId) => {
    try {
        const { error } = await supabase
            .from('pena_stamp_unlocks')
            .upsert([{ user_id: userId, pena_id: penaId, event_id: eventId }], {
                onConflict: 'user_id,pena_id',
                ignoreDuplicates: true,
            });

        if (error) throw error;

        return { success: true };
    } catch (error) {
        console.error('Error unlocking stamp:', error);
        return { success: false, error: error.message };
    }
};
