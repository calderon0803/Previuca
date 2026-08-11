import { supabase } from '../config/supabase';
import { unlockStamp } from './stampService';

const generatePenaCode = () => {
    const array = new Uint8Array(4);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(36)).join('').substring(0, 6).toUpperCase();
};

// Crea una peña nueva (genera código único, crea la membership del creador)
export const createPena = async ({ eventId, userId, name, color }) => {
    try {
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

        // Nadie tiene que escanear su propia peña para tener su sello.
        unlockStamp(userId, pena.id, eventId);

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
            .maybeSingle();

        if (penaError || !pena) {
            return { success: false, error: 'Código de peña no válido' };
        }

        const { error: memberError } = await supabase
            .from('pena_members')
            .insert([{ user_id: userId, pena_id: pena.id, event_id: eventId }]);

        if (memberError) throw memberError;

        // Nadie tiene que escanear su propia peña para tener su sello.
        unlockStamp(userId, pena.id, eventId);

        return { success: true, pena };
    } catch (error) {
        console.error('Error joining pena:', error);
        return { success: false, error: error.message };
    }
};

// Abandona la peña actual dentro de un evento (el sello ya coleccionado se
// conserva; solo se borra la membresía, para poder crear o unirse a otra).
export const leavePena = async (userId, eventId) => {
    try {
        const { error } = await supabase
            .from('pena_members')
            .delete()
            .eq('user_id', userId)
            .eq('event_id', eventId);

        if (error) throw error;

        return { success: true };
    } catch (error) {
        console.error('Error leaving pena:', error);
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
            .maybeSingle();

        if (error) throw error;

        return { success: true, pena: data?.penas || null };
    } catch (error) {
        console.error('Error loading my pena:', error);
        return { success: false, error: error.message, pena: null };
    }
};

// Peña (color/nombre) de una lista de usuarios dentro de un evento concreto —
// para revelar progresivamente la afiliación de quienes te tienen en su lista.
export const getPenaAffiliationsByUserIds = async (userIds, eventId) => {
    if (!userIds || userIds.length === 0) return { success: true, affiliations: {} };

    try {
        const { data, error } = await supabase
            .from('pena_members')
            .select('user_id, penas!inner(name, color)')
            .eq('event_id', eventId)
            .in('user_id', userIds);

        if (error) throw error;

        const affiliations = {};
        (data || []).forEach((row) => {
            affiliations[row.user_id] = { name: row.penas.name, color: row.penas.color };
        });

        return { success: true, affiliations };
    } catch (error) {
        console.error('Error loading pena affiliations:', error);
        return { success: false, error: error.message, affiliations: {} };
    }
};

// Miembros de una peña concreta, con su nombre y apellido
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
            .from('profiles')
            .select('user_id, first_name, last_name')
            .in('user_id', userIds);

        const nameByUserId = new Map(
            (profiles || []).map((p) => [p.user_id, `${p.first_name} ${p.last_name}`.trim()])
        );

        const enrichedMembers = members.map((m) => ({
            ...m,
            displayName: nameByUserId.get(m.user_id) || 'Miembro',
        }));

        return { success: true, members: enrichedMembers };
    } catch (error) {
        console.error('Error loading pena members:', error);
        return { success: false, error: error.message, members: [] };
    }
};
