import { supabase } from '../config/supabase';

const generatePenaCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Sube la imagen de la peña al bucket público y devuelve su URL
const uploadPenaImage = async (userId, imageFile) => {
    const extension = imageFile.name.split('.').pop();
    const path = `${userId}/${Date.now()}.${extension}`;

    const { error } = await supabase.storage
        .from('pena-images')
        .upload(path, imageFile);

    if (error) throw error;

    const { data } = supabase.storage.from('pena-images').getPublicUrl(path);
    return data.publicUrl;
};

// Crea una peña nueva (sube imagen, genera código único, crea la membership del creador)
export const createPena = async ({ eventId, userId, name, color, imageFile }) => {
    try {
        const imageUrl = imageFile ? await uploadPenaImage(userId, imageFile) : null;

        let attempts = 0;
        let pena = null;
        let lastError = null;

        while (attempts < 5 && !pena) {
            attempts += 1;
            const code = generatePenaCode();

            const { data, error } = await supabase
                .from('penas')
                .insert([{
                    event_id: eventId,
                    name: name.trim(),
                    color,
                    image_url: imageUrl,
                    code,
                    created_by: userId,
                }])
                .select()
                .single();

            if (error) {
                lastError = error;
                if (error.code !== '23505') break; // error distinto a "código duplicado"
                continue;
            }

            pena = data;
        }

        if (!pena) throw lastError || new Error('No se pudo generar un código único');

        const { error: memberError } = await supabase
            .from('pena_members')
            .insert([{ user_id: userId, pena_id: pena.id, event_id: eventId }]);

        if (memberError) throw memberError;

        return { success: true, pena };
    } catch (error) {
        console.error('Error creating pena:', error);
        return { success: false, error: error.message };
    }
};

// Une al usuario a una peña existente usando su código
export const joinPenaByCode = async (eventId, userId, code) => {
    try {
        const cleanCode = code.trim().toUpperCase();

        const { data: pena, error: penaError } = await supabase
            .from('penas')
            .select('*')
            .eq('event_id', eventId)
            .eq('code', cleanCode)
            .single();

        if (penaError || !pena) {
            return { success: false, error: 'Código de peña no válido' };
        }

        const { error: memberError } = await supabase
            .from('pena_members')
            .insert([{ user_id: userId, pena_id: pena.id, event_id: eventId }]);

        if (memberError) throw memberError;

        return { success: true, pena };
    } catch (error) {
        console.error('Error joining pena:', error);
        return { success: false, error: error.message };
    }
};

// Todas las peñas apuntadas a un evento, con su número de miembros
export const getPenasByEvent = async (eventId) => {
    try {
        const { data, error } = await supabase
            .from('penas')
            .select('*, pena_members(count)')
            .eq('event_id', eventId)
            .order('created_at', { ascending: true });

        if (error) throw error;

        const penas = (data || []).map((pena) => ({
            ...pena,
            memberCount: pena.pena_members?.[0]?.count || 0,
        }));

        return { success: true, penas };
    } catch (error) {
        console.error('Error loading penas:', error);
        return { success: false, error: error.message, penas: [] };
    }
};

// Peña a la que pertenece el usuario dentro de un evento concreto (o null)
export const getMyPena = async (userId, eventId) => {
    try {
        const { data, error } = await supabase
            .from('pena_members')
            .select('pena_id, penas(*)')
            .eq('user_id', userId)
            .eq('event_id', eventId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;

        return { success: true, pena: data?.penas || null };
    } catch (error) {
        console.error('Error loading my pena:', error);
        return { success: false, error: error.message, pena: null };
    }
};

// Miembros de una peña concreta, con su nombre de Instagram si lo tienen (no hay
// tabla de perfiles en la app; es el único nombre "público" que existe hoy)
export const getPenaMembers = async (penaId) => {
    try {
        const { data: members, error } = await supabase
            .from('pena_members')
            .select('user_id, joined_at')
            .eq('pena_id', penaId)
            .order('joined_at', { ascending: true });

        if (error) throw error;
        if (!members || members.length === 0) return { success: true, members: [] };

        const userIds = members.map((m) => m.user_id);
        const { data: profiles } = await supabase
            .from('instagram_verification')
            .select('user_id, instagram_username')
            .in('user_id', userIds);

        const usernameByUserId = new Map((profiles || []).map((p) => [p.user_id, p.instagram_username]));

        const enrichedMembers = members.map((m) => ({
            ...m,
            displayName: usernameByUserId.get(m.user_id) || 'Miembro',
        }));

        return { success: true, members: enrichedMembers };
    } catch (error) {
        console.error('Error loading pena members:', error);
        return { success: false, error: error.message, members: [] };
    }
};
