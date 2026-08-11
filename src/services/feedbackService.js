import { supabase } from '../config/supabase';

export const FEEDBACK_TYPES = [
    { value: 'fallo', label: 'He encontrado un fallo' },
    { value: 'sugerencia', label: 'Tengo una sugerencia' },
    { value: 'otro', label: 'Otra cosa' },
];

export const submitFeedback = async ({ userId, type, message }) => {
    try {
        const { error } = await supabase
            .from('app_feedback')
            .insert([{ user_id: userId, type, message: message.trim() }]);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Error submitting feedback:', error);
        return { success: false, error: error.message };
    }
};

// Todos los reportes de la app, con el nombre de quien los envió — solo para admins (RLS).
export const getAllFeedback = async () => {
    try {
        const { data: feedback, error } = await supabase
            .from('app_feedback')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        if (!feedback || feedback.length === 0) return { success: true, feedback: [] };

        const userIds = [...new Set(feedback.map((f) => f.user_id))];
        const { data: profiles } = await supabase
            .from('profiles')
            .select('user_id, first_name, last_name')
            .in('user_id', userIds);

        const nameByUserId = new Map(
            (profiles || []).map((p) => [p.user_id, `${p.first_name} ${p.last_name}`.trim() || 'Alguien'])
        );

        const enriched = feedback.map((f) => ({
            ...f,
            authorName: nameByUserId.get(f.user_id) || 'Alguien',
        }));

        return { success: true, feedback: enriched };
    } catch (error) {
        console.error('Error loading feedback:', error);
        return { success: false, error: error.message, feedback: [] };
    }
};

export const deleteFeedback = async (feedbackId) => {
    try {
        const { error } = await supabase.from('app_feedback').delete().eq('id', feedbackId);
        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Error deleting feedback:', error);
        return { success: false, error: error.message };
    }
};
