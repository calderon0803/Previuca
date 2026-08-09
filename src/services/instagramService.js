import { supabase } from '../config/supabase';

// Generar código de verificación único
const generateVerificationCode = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
};

// Crear registro de verificación de Instagram
export const createInstagramVerification = async (userId, instagramUsername) => {
    try {
        const verificationCode = generateVerificationCode();
        
        const { data, error } = await supabase
            .from('instagram_verification')
            .insert([{
                user_id: userId,
                instagram_username: instagramUsername,
                verification_code: verificationCode,
                is_verified: false
            }])
            .select()
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Error creating instagram verification:', error);
        return { success: false, error: error.message };
    }
};

// Obtener verificación de Instagram del usuario
export const getInstagramVerification = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('instagram_verification')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no encontrado
        return { success: true, data };
    } catch (error) {
        console.error('Error getting instagram verification:', error);
        return { success: false, error: error.message };
    }
};

// Verificar código en biografía de Instagram usando backend serverless
export const verifyInstagramCode = async (userId, instagramUsername, expectedCode) => {
    try {
        const cleanUsername = instagramUsername.replace('@', '').trim();

        // Determinar la URL de la función según el entorno
        const functionUrl = import.meta.env.PROD 
            ? '/.netlify/functions/verify-instagram'  // Producción en Netlify
            : 'http://localhost:8889/.netlify/functions/verify-instagram';  // Desarrollo local

        // Llamar a la función serverless que hace el scraping
        const response = await fetch(functionUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: cleanUsername })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al verificar Instagram');
        }

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || 'No se pudo obtener la biografía');
        }

        // Verificar si el código está en la biografía (case insensitive y sin espacios)
        const normalizedBio = result.biography.replace(/\s/g, '').toLowerCase();
        const normalizedCode = expectedCode.replace(/\s/g, '').toLowerCase();
        const codeFound = normalizedBio.includes(normalizedCode);

        if (codeFound) {
            // Actualizar en la base de datos a través del procedimiento almacenado seguro (RPC)
            const { data, error } = await supabase.rpc('confirm_instagram_verification', {
                p_verification_code: expectedCode
            });

            if (error) throw error;
            if (!data?.success) throw new Error(data?.error || 'Error al confirmar la verificación');

            return { 
                success: true, 
                verified: true, 
                data,
                message: '¡Verificación exitosa! Tu cuenta de Instagram está confirmada.' 
            };
        } else {
            return { 
                success: false, 
                verified: false, 
                error: `Código "${expectedCode}" no encontrado en tu biografía. Asegúrate de agregarlo y que tu perfil sea público.`,
                biography: result.biography
            };
        }

    } catch (error) {
        console.error('Error verifying instagram code:', error);
        return { 
            success: false, 
            verified: false,
            error: error.message || 'Error al verificar Instagram'
        };
    }
};

// Actualizar nombre de usuario de Instagram
export const updateInstagramUsername = async (userId, newUsername) => {
    try {
        const newCode = generateVerificationCode();
        
        const { data, error } = await supabase
            .from('instagram_verification')
            .update({
                instagram_username: newUsername,
                verification_code: newCode,
                is_verified: false,
                verified_at: null
            })
            .eq('user_id', userId)
            .select()
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Error updating instagram username:', error);
        return { success: false, error: error.message };
    }
};

// Eliminar verificación de Instagram
export const deleteInstagramVerification = async (userId) => {
    try {
        const { error } = await supabase
            .from('instagram_verification')
            .delete()
            .eq('user_id', userId);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Error deleting instagram verification:', error);
        return { success: false, error: error.message };
    }
};
