import { supabase } from '../config/supabase';
import { deleteInstagramVerification } from './instagramService';
import { uploadPenaImage } from './penasService';

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

// ---------------------------------------------------
// Usuarios
// ---------------------------------------------------

export const getAllProfiles = async () => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('user_id, first_name, last_name, birthdate, gender')
            .order('first_name', { ascending: true });

        if (error) throw error;

        const { data: blocked } = await supabase.from('blocked_users').select('user_id');
        const blockedIds = new Set((blocked || []).map((b) => b.user_id));

        const profiles = (data || []).map((p) => ({ ...p, isBlocked: blockedIds.has(p.user_id) }));

        return { success: true, profiles };
    } catch (error) {
        console.error('Error loading all profiles:', error);
        return { success: false, error: error.message, profiles: [] };
    }
};

export const updateProfileAdmin = async (userId, { firstName, lastName, birthdate, gender }) => {
    try {
        const { error } = await supabase
            .from('profiles')
            .update({
                first_name: firstName.trim(),
                last_name: lastName.trim(),
                birthdate: birthdate || null,
                gender: gender || null,
            })
            .eq('user_id', userId);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Error updating profile (admin):', error);
        return { success: false, error: error.message };
    }
};

// Sustituto de un ban real de Supabase Auth: mientras exista fila en
// blocked_users, la app le muestra la pantalla de bloqueado (ver App.jsx).
export const setUserBlocked = async (userId, blocked, blockedByUserId) => {
    try {
        if (blocked) {
            const { error } = await supabase
                .from('blocked_users')
                .insert([{ user_id: userId, blocked_by: blockedByUserId }]);
            if (error && error.code !== '23505') throw error; // ya estaba bloqueado
        } else {
            const { error } = await supabase.from('blocked_users').delete().eq('user_id', userId);
            if (error) throw error;
        }
        return { success: true };
    } catch (error) {
        console.error('Error setting user blocked state:', error);
        return { success: false, error: error.message };
    }
};

// Borra todos los datos de la app asociados al usuario (mismo alcance que
// handleDeleteAccount de Settings.jsx, más el contenido de Salseos y las
// peñas que haya creado) y lo bloquea para que no pueda seguir usándola.
// No borra su cuenta de login de Supabase Auth: eso requeriría la
// service-role key, no disponible en este proyecto.
export const deleteUserAccount = async (userId, adminUserId) => {
    try {
        await Promise.all([
            supabase.from('users_flechazos').delete().eq('user_id', userId),
            supabase.from('pena_members').delete().eq('user_id', userId),
            supabase.from('pena_stamp_unlocks').delete().eq('user_id', userId),
            supabase.from('user_eventos').delete().eq('user_id', userId),
            deleteInstagramVerification(userId),
            supabase.from('penas').delete().eq('created_by', userId),
            supabase.from('salseos_posts').delete().eq('author_id', userId),
            supabase.from('salseos_replies').delete().eq('author_id', userId),
            supabase.from('salseos_likes').delete().eq('user_id', userId),
            supabase.from('salseos_reports').delete().eq('reporter_id', userId),
            supabase.from('profiles').delete().eq('user_id', userId),
        ]);

        await setUserBlocked(userId, true, adminUserId);

        return { success: true };
    } catch (error) {
        console.error('Error deleting user account (admin):', error);
        return { success: false, error: error.message };
    }
};

// ---------------------------------------------------
// Eventos
// ---------------------------------------------------

export const getAllEvents = async () => {
    try {
        const { data, error } = await supabase
            .from('eventos')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return { success: true, eventos: data || [] };
    } catch (error) {
        console.error('Error loading all eventos:', error);
        return { success: false, error: error.message, eventos: [] };
    }
};

export const updateEvent = async (eventId, { name, description, startDate, endDate, colors }) => {
    try {
        const { error } = await supabase
            .from('eventos')
            .update({
                name: name.trim(),
                description: description?.trim() || null,
                start_date: startDate || null,
                end_date: endDate || null,
                colors,
            })
            .eq('id', eventId);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Error updating evento (admin):', error);
        return { success: false, error: error.message };
    }
};

// Borra el evento; peñas, pena_members, sellos, flechazos y salseos de ese
// evento se limpian solos vía ON DELETE CASCADE.
export const deleteEvent = async (eventId) => {
    try {
        const { error } = await supabase.from('eventos').delete().eq('id', eventId);
        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Error deleting evento (admin):', error);
        return { success: false, error: error.message };
    }
};

// ---------------------------------------------------
// Peñas
// ---------------------------------------------------

export const getAllPenas = async () => {
    try {
        const { data, error } = await supabase
            .from('penas')
            .select('*, pena_members(count), eventos(name)')
            .order('created_at', { ascending: false });

        if (error) throw error;

        const penas = (data || []).map((pena) => ({
            ...pena,
            memberCount: pena.pena_members?.[0]?.count || 0,
            eventName: pena.eventos?.name || 'Evento desconocido',
        }));

        return { success: true, penas };
    } catch (error) {
        console.error('Error loading all penas:', error);
        return { success: false, error: error.message, penas: [] };
    }
};

export const updatePena = async (penaId, { name, color, imageFile, adminUserId }) => {
    try {
        const updates = { name: name.trim(), color };

        if (imageFile) {
            updates.image_url = await uploadPenaImage(adminUserId, imageFile);
        }

        const { error } = await supabase.from('penas').update(updates).eq('id', penaId);
        if (error) throw error;

        return { success: true };
    } catch (error) {
        console.error('Error updating pena (admin):', error);
        return { success: false, error: error.message };
    }
};

// Borra la peña; pena_members y pena_stamp_unlocks de esa peña se limpian
// solos vía ON DELETE CASCADE.
export const deletePena = async (penaId) => {
    try {
        const { error } = await supabase.from('penas').delete().eq('id', penaId);
        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Error deleting pena (admin):', error);
        return { success: false, error: error.message };
    }
};

// ---------------------------------------------------
// Reportes de Salseos
// ---------------------------------------------------

export const getReports = async () => {
    try {
        const { data: reports, error } = await supabase
            .from('salseos_reports')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        if (!reports || reports.length === 0) return { success: true, reports: [] };

        const postIds = reports.filter((r) => r.post_id).map((r) => r.post_id);
        const replyIds = reports.filter((r) => r.reply_id).map((r) => r.reply_id);

        const [{ data: posts }, { data: replies }] = await Promise.all([
            postIds.length
                ? supabase.from('salseos_posts').select('id, body, author_id').in('id', postIds)
                : Promise.resolve({ data: [] }),
            replyIds.length
                ? supabase.from('salseos_replies').select('id, body, author_id').in('id', replyIds)
                : Promise.resolve({ data: [] }),
        ]);

        const postById = new Map((posts || []).map((p) => [p.id, p]));
        const replyById = new Map((replies || []).map((r) => [r.id, r]));

        const userIds = new Set();
        reports.forEach((r) => {
            userIds.add(r.reporter_id);
            const content = r.post_id ? postById.get(r.post_id) : replyById.get(r.reply_id);
            if (content) userIds.add(content.author_id);
        });

        const { data: profiles } = await supabase
            .from('profiles')
            .select('user_id, first_name, last_name, salseo_username')
            .in('user_id', [...userIds]);

        // Para moderación se muestran ambos: el usuario público de Salseo
        // (lo que ve el resto) y el nombre real entre paréntesis.
        const nameByUserId = new Map(
            (profiles || []).map((p) => {
                const realName = `${p.first_name} ${p.last_name}`.trim() || 'Alguien';
                const displayName = p.salseo_username ? `@${p.salseo_username} (${realName})` : realName;
                return [p.user_id, displayName];
            })
        );

        const reportsWithContent = reports.map((r) => {
            const content = r.post_id ? postById.get(r.post_id) : replyById.get(r.reply_id);
            return {
                ...r,
                contentType: r.post_id ? 'post' : 'reply',
                body: content?.body || '(contenido ya borrado)',
                authorId: content?.author_id || null,
                authorName: content ? nameByUserId.get(content.author_id) || 'Alguien' : 'Desconocido',
                reporterName: nameByUserId.get(r.reporter_id) || 'Alguien',
            };
        });

        return { success: true, reports: reportsWithContent };
    } catch (error) {
        console.error('Error loading reports:', error);
        return { success: false, error: error.message, reports: [] };
    }
};

// ---------------------------------------------------
// Avisos a usuarios
// ---------------------------------------------------

export const sendNotice = async (userId, message, reportId) => {
    try {
        const { error } = await supabase
            .from('user_notices')
            .insert([{ user_id: userId, message: message.trim(), report_id: reportId || null }]);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Error sending notice:', error);
        return { success: false, error: error.message };
    }
};

export const getUnreadNotices = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('user_notices')
            .select('id, message, created_at')
            .eq('user_id', userId)
            .is('read_at', null)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return { success: true, notices: data || [] };
    } catch (error) {
        console.error('Error loading unread notices:', error);
        return { success: false, error: error.message, notices: [] };
    }
};

export const markNoticeRead = async (noticeId) => {
    try {
        const { error } = await supabase
            .from('user_notices')
            .update({ read_at: new Date().toISOString() })
            .eq('id', noticeId);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Error marking notice read:', error);
        return { success: false, error: error.message };
    }
};
