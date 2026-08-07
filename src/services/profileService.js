import { supabase } from '../config/supabase';

export const MIN_AGE = 18;
export const GENDER_OPTIONS = ['Hombre', 'Mujer', 'No binario', 'Otro', 'Prefiero no decirlo'];

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

// Nombre, apellido, fecha de nacimiento y género del usuario (o null si
// todavía no rellenó su perfil)
export const getProfile = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('first_name, last_name, birthdate, gender')
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;

        return { success: true, profile: data || null };
    } catch (error) {
        console.error('Error loading profile:', error);
        return { success: false, error: error.message, profile: null };
    }
};

// Perfiles públicos (género, edad y peña) de varios usuarios, para la vista
// de admiradores — sin nombre ni instagram, solo lo necesario para las
// revelaciones progresivas.
export const getProfilesByUserIds = async (userIds) => {
    if (!userIds || userIds.length === 0) return { success: true, profiles: [] };

    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('user_id, birthdate, gender')
            .in('user_id', userIds);

        if (error) throw error;

        return { success: true, profiles: data || [] };
    } catch (error) {
        console.error('Error loading profiles by user ids:', error);
        return { success: false, error: error.message, profiles: [] };
    }
};
