import { supabase } from '../config/supabase';

export const MIN_AGE = 18;

// Años completos entre una fecha de nacimiento y hoy.
export const calculateAge = (birthdate) => {
    if (!birthdate) return null;
    const birth = new Date(birthdate);
    if (Number.isNaN(birth.getTime())) return null;

    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const hasHadBirthdayThisYear =
        today.getMonth() > birth.getMonth() ||
        (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());
    if (!hasHadBirthdayThisYear) age -= 1;

    return age;
};

export const isAtLeastMinAge = (birthdate) => {
    const age = calculateAge(birthdate);
    return age !== null && age >= MIN_AGE;
};

// Nombre, apellido y fecha de nacimiento del usuario (o null si todavía no rellenó su perfil)
export const getProfile = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('first_name, last_name, birthdate')
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;

        return { success: true, profile: data || null };
    } catch (error) {
        console.error('Error loading profile:', error);
        return { success: false, error: error.message, profile: null };
    }
};

export const upsertProfile = async (userId, firstName, lastName, birthdate) => {
    if (!isAtLeastMinAge(birthdate)) {
        return { success: false, error: `Debes ser mayor de ${MIN_AGE} años para usar Previuca` };
    }

    try {
        const { error } = await supabase
            .from('profiles')
            .upsert(
                [{ user_id: userId, first_name: firstName.trim(), last_name: lastName.trim(), birthdate }],
                { onConflict: 'user_id' }
            );

        if (error) throw error;

        return { success: true };
    } catch (error) {
        console.error('Error saving profile:', error);
        return { success: false, error: error.message };
    }
};

// Perfiles públicos (edad y peña) de varios usuarios, para la vista de
// admiradores — sin nombre ni instagram, solo lo necesario para las
// revelaciones progresivas.
export const getProfilesByUserIds = async (userIds) => {
    if (!userIds || userIds.length === 0) return { success: true, profiles: [] };

    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('user_id, birthdate')
            .in('user_id', userIds);

        if (error) throw error;

        return { success: true, profiles: data || [] };
    } catch (error) {
        console.error('Error loading profiles by user ids:', error);
        return { success: false, error: error.message, profiles: [] };
    }
};
