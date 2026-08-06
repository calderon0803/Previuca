import { supabase } from '../config/supabase';

// Nombre y apellido del usuario (o null si todavía no rellenó su perfil)
export const getProfile = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;

        return { success: true, profile: data || null };
    } catch (error) {
        console.error('Error loading profile:', error);
        return { success: false, error: error.message, profile: null };
    }
};

export const upsertProfile = async (userId, firstName, lastName) => {
    try {
        const { error } = await supabase
            .from('profiles')
            .upsert([{ user_id: userId, first_name: firstName.trim(), last_name: lastName.trim() }], { onConflict: 'user_id' });

        if (error) throw error;

        return { success: true };
    } catch (error) {
        console.error('Error saving profile:', error);
        return { success: false, error: error.message };
    }
};
