import { supabase } from '../config/supabase';

// Comprueba si el usuario tiene el rol de administrador (tabla admins gestionada a mano)
export const checkIsAdmin = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('admins')
            .select('user_id')
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;

        return { success: true, isAdmin: !!data };
    } catch (error) {
        console.error('Error checking admin status:', error);
        return { success: false, error: error.message, isAdmin: false };
    }
};
