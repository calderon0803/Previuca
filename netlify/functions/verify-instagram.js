// Netlify Function para verificar Instagram sin CORS
// Node.js 18+ tiene fetch built-in, no necesita imports

export const handler = async (event, context) => {
    // Configurar CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Manejar preflight OPTIONS
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    // Solo permitir POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { username } = JSON.parse(event.body);

        if (!username) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Username is required' })
            };
        }

        const cleanUsername = username.replace('@', '').trim();
        const instagramUrl = `https://www.instagram.com/${cleanUsername}/`;

        console.log('Fetching Instagram profile via API:', cleanUsername);

        // Usar Instagram JSON API pública (no requiere autenticación)
        // Esta API existe para compartir perfiles y es pública
        const apiUrl = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${cleanUsername}`;
        
        const response = await fetch(apiUrl, {
            headers: {
                'User-Agent': 'Instagram 76.0.0.15.395 Android (24/7.0; 640dpi; 1440x2560; samsung; SM-G930F; herolte; samsungexynos8890; en_US; 138226743)',
                'Accept': '*/*',
                'Accept-Language': 'en-US,en;q=0.9',
                'X-IG-App-ID': '936619743392459',
                'X-ASBD-ID': '198387',
                'X-IG-WWW-Claim': '0',
                'Origin': 'https://www.instagram.com',
                'Referer': `https://www.instagram.com/${cleanUsername}/`,
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'same-origin'
            }
        });

        if (!response.ok) {
            console.error('Instagram API response not OK:', response.status);
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ 
                    error: 'No se pudo acceder al perfil de Instagram. Verifica que el usuario existe y es público.',
                    status: response.status
                })
            };
        }

        const data = await response.json();
        const userData = data?.data?.user;

        if (!userData) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ 
                    error: 'Usuario no encontrado o perfil privado.',
                })
            };
        }

        const biography = userData.biography || '';
        const isPrivate = userData.is_private;

        console.log('Biography found:', biography);
        console.log('Biography length:', biography.length);
        console.log('Is private:', isPrivate);

        if (isPrivate) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ 
                    error: 'El perfil es privado. Debes hacerlo público para verificar.',
                })
            };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
                success: true,
                username: cleanUsername,
                biography: biography,
                isPrivate: isPrivate,
                message: 'Biografía obtenida exitosamente'
            })
        };

    } catch (error) {
        console.error('Error in verify-instagram function:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Error al verificar el perfil de Instagram',
                message: error.message
            })
        };
    }
};
