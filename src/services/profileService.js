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
            .select('first_name, last_name, birthdate, gender, salseo_username')
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;

        return { success: true, profile: data || null };
    } catch (error) {
        console.error('Error loading profile:', error);
        return { success: false, error: error.message, profile: null };
    }
};

// Formato permitido para el usuario de Salseo: igual que un handle de
// Instagram (letras, números, puntos y guiones bajos).
const SALSEO_USERNAME_PATTERN = /^[a-zA-Z0-9._]{1,30}$/;

// Fija el usuario público de Salseo (el de Instagram si está vinculado, o
// uno propio). Es único en toda la app sin distinguir mayúsculas/minúsculas.
export const setSalseoUsername = async (userId, username) => {
    const cleanUsername = username.trim().replace(/^@/, '');

    if (!SALSEO_USERNAME_PATTERN.test(cleanUsername)) {
        return { success: false, error: 'Usa solo letras, números, puntos o guiones bajos (máx. 30 caracteres).' };
    }

    try {
        const { error } = await supabase
            .from('profiles')
            .update({ salseo_username: cleanUsername })
            .eq('user_id', userId);

        if (error) {
            if (error.code === '23505') return { success: false, error: 'Ese usuario ya está en uso, elige otro.' };
            throw error;
        }

        return { success: true, username: cleanUsername };
    } catch (error) {
        console.error('Error setting salseo username:', error);
        return { success: false, error: error.message };
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
