import { supabase } from '../config/supabase';

// Motivos de reporte disponibles — el value debe coincidir con el CHECK
// constraint de la columna reason en salseos_reports.
export const REPORT_REASONS = [
    { value: 'acoso', label: 'Acoso o amenazas' },
    { value: 'ofensivo', label: 'Contenido ofensivo o discriminatorio' },
    { value: 'suplantacion', label: 'Suplantación de identidad' },
    { value: 'spam', label: 'Spam o publicidad' },
    { value: 'otro', label: 'Otro' },
];

// Añade el nombre del autor a una lista de filas con author_id, con una
// única query extra a profiles (mismo patrón que getPenaMembers).
const withAuthorNames = async (rows) => {
    if (!rows || rows.length === 0) return [];

    const authorIds = [...new Set(rows.map((r) => r.author_id))];
    const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, salseo_username')
        .in('user_id', authorIds);

    // En Salseo se muestra el usuario elegido (Instagram o propio) en vez
    // del nombre real — el nombre solo queda como último recurso.
    const nameByUserId = new Map(
        (profiles || []).map((p) => [
            p.user_id,
            p.salseo_username ? `@${p.salseo_username}` : `${p.first_name} ${p.last_name}`.trim(),
        ])
    );

    return rows.map((row) => ({
        ...row,
        authorName: nameByUserId.get(row.author_id) || 'Alguien',
    }));
};

// Todos los posts de un evento, con contadores de respuestas/likes y si el
// usuario actual ya ha dado like a cada uno.
export const getPostsByEvent = async (eventId, userId) => {
    try {
        const { data, error } = await supabase
            .from('salseos_posts')
            .select('*, salseos_replies(count), salseos_likes(count)')
            .eq('event_id', eventId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        const { data: myLikes } = await supabase
            .from('salseos_likes')
            .select('post_id')
            .eq('event_id', eventId)
            .eq('user_id', userId);

        const likedPostIds = new Set((myLikes || []).map((like) => like.post_id));

        const { data: myReports } = await supabase
            .from('salseos_reports')
            .select('post_id')
            .eq('event_id', eventId)
            .eq('reporter_id', userId)
            .not('post_id', 'is', null);

        const reportedPostIds = new Set((myReports || []).map((report) => report.post_id));

        const posts = (await withAuthorNames(data || [])).map((post) => ({
            ...post,
            replyCount: post.salseos_replies?.[0]?.count || 0,
            likeCount: post.salseos_likes?.[0]?.count || 0,
            likedByMe: likedPostIds.has(post.id),
            reportedByMe: reportedPostIds.has(post.id),
        }));

        return { success: true, posts };
    } catch (error) {
        console.error('Error loading salseos posts:', error);
        return { success: false, error: error.message, posts: [] };
    }
};

export const createPost = async ({ eventId, authorId, body }) => {
    try {
        const { data, error } = await supabase
            .from('salseos_posts')
            .insert([{ event_id: eventId, author_id: authorId, body: body.trim() }])
            .select()
            .single();

        if (error) throw error;

        return { success: true, post: data };
    } catch (error) {
        console.error('Error creating salseos post:', error);
        return { success: false, error: error.message };
    }
};

export const deletePost = async (postId) => {
    try {
        const { error } = await supabase.from('salseos_posts').delete().eq('id', postId);
        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Error deleting salseos post:', error);
        return { success: false, error: error.message };
    }
};

export const getRepliesByPost = async (postId, userId) => {
    try {
        const { data, error } = await supabase
            .from('salseos_replies')
            .select('*')
            .eq('post_id', postId)
            .order('created_at', { ascending: true });

        if (error) throw error;

        const { data: myReports } = await supabase
            .from('salseos_reports')
            .select('reply_id')
            .eq('reporter_id', userId)
            .not('reply_id', 'is', null);

        const reportedReplyIds = new Set((myReports || []).map((report) => report.reply_id));

        const replies = (await withAuthorNames(data || [])).map((reply) => ({
            ...reply,
            reportedByMe: reportedReplyIds.has(reply.id),
        }));

        return { success: true, replies };
    } catch (error) {
        console.error('Error loading salseos replies:', error);
        return { success: false, error: error.message, replies: [] };
    }
};

export const createReply = async ({ postId, eventId, authorId, body }) => {
    try {
        const { data, error } = await supabase
            .from('salseos_replies')
            .insert([{ post_id: postId, event_id: eventId, author_id: authorId, body: body.trim() }])
            .select()
            .single();

        if (error) throw error;

        return { success: true, reply: data };
    } catch (error) {
        console.error('Error creating salseos reply:', error);
        return { success: false, error: error.message };
    }
};

export const deleteReply = async (replyId) => {
    try {
        const { error } = await supabase.from('salseos_replies').delete().eq('id', replyId);
        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Error deleting salseos reply:', error);
        return { success: false, error: error.message };
    }
};

export const toggleLike = async ({ userId, postId, eventId, currentlyLiked }) => {
    try {
        if (currentlyLiked) {
            const { error } = await supabase
                .from('salseos_likes')
                .delete()
                .eq('user_id', userId)
                .eq('post_id', postId);
            if (error) throw error;
        } else {
            const { error } = await supabase
                .from('salseos_likes')
                .insert([{ user_id: userId, post_id: postId, event_id: eventId }]);
            if (error) throw error;
        }
        return { success: true, likedByMe: !currentlyLiked };
    } catch (error) {
        console.error('Error toggling salseos like:', error);
        return { success: false, error: error.message };
    }
};

export const reportPost = async ({ eventId, postId, reporterId, reason }) => {
    try {
        const { error } = await supabase
            .from('salseos_reports')
            .insert([{ event_id: eventId, post_id: postId, reporter_id: reporterId, reason }]);

        if (error) {
            if (error.code === '23505') return { success: false, error: 'Ya has reportado este mensaje' };
            throw error;
        }

        return { success: true };
    } catch (error) {
        console.error('Error reporting salseos post:', error);
        return { success: false, error: error.message };
    }
};

export const reportReply = async ({ eventId, replyId, reporterId, reason }) => {
    try {
        const { error } = await supabase
            .from('salseos_reports')
            .insert([{ event_id: eventId, reply_id: replyId, reporter_id: reporterId, reason }]);

        if (error) {
            if (error.code === '23505') return { success: false, error: 'Ya has reportado esta respuesta' };
            throw error;
        }

        return { success: true };
    } catch (error) {
        console.error('Error reporting salseos reply:', error);
        return { success: false, error: error.message };
    }
};
