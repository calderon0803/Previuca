// Netlify Function para verificar Instagram sin CORS
// Node.js 18+ tiene fetch built-in, no necesita imports

exports.handler = async (event, context) => {
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

        console.log('Fetching Instagram profile:', cleanUsername);

        // Hacer la petición desde el servidor (sin problemas de CORS)
        const response = await fetch(instagramUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Cache-Control': 'max-age=0'
            },
            timeout: 15000
        });

        if (!response.ok) {
            console.error('Instagram response not OK:', response.status);
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ 
                    error: 'No se pudo acceder al perfil de Instagram. Verifica que el usuario existe y es público.',
                    status: response.status
                })
            };
        }

        const html = await response.text();

        // Extraer la biografía del HTML
        // Instagram almacena los datos en varios formatos
        let biography = '';
        
        // Método 1: Buscar en meta tags og:description (más confiable)
        const metaBioMatch = html.match(/<meta\s+property="og:description"\s+content="([^"]*?)"/i);
        if (metaBioMatch && metaBioMatch[1]) {
            biography = metaBioMatch[1];
            // Limpiar el formato "X Followers, Y Following, Z Posts - ..."
            const bioStart = biography.indexOf(' - ');
            if (bioStart !== -1) {
                biography = biography.substring(bioStart + 3).trim();
            }
        }
        
        // Método 2: Buscar en el JSON embebido en scripts
        if (!biography) {
            // Instagram usa window._sharedData o scripts con application/json
            const scriptMatches = html.matchAll(/<script[^>]*>([^<]*window\._sharedData[^<]+)<\/script>/g);
            for (const match of scriptMatches) {
                try {
                    const scriptContent = match[1];
                    const jsonMatch = scriptContent.match(/window\._sharedData\s*=\s*({.+});/);
                    if (jsonMatch) {
                        const data = JSON.parse(jsonMatch[1]);
                        const profileData = data?.entry_data?.ProfilePage?.[0]?.graphql?.user;
                        if (profileData?.biography) {
                            biography = profileData.biography;
                            break;
                        }
                    }
                } catch (e) {
                    console.log('Error parsing _sharedData:', e.message);
                }
            }
        }
        
        // Método 3: Buscar "biography" directamente en el HTML (más amplio)
        if (!biography) {
            const bioMatches = html.match(/"biography"\s*:\s*"([^"]*?)"/g);
            if (bioMatches && bioMatches.length > 0) {
                const firstMatch = bioMatches[0].match(/"biography"\s*:\s*"([^"]*?)"/);
                if (firstMatch && firstMatch[1]) {
                    biography = firstMatch[1]
                        .replace(/\\n/g, '\n')
                        .replace(/\\u([0-9a-fA-F]{4})/g, (match, hex) => 
                            String.fromCharCode(parseInt(hex, 16))
                        )
                        .replace(/\\\\/g, '\\')
                        .replace(/\\"/g, '"');
                }
            }
        }

        console.log('Biography found:', biography);
        console.log('Biography length:', biography?.length || 0);

        if (!biography) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ 
                    error: 'No se pudo leer la biografía. Asegúrate de que tu perfil sea público.',
                    html_length: html.length
                })
            };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
                success: true,
                username: cleanUsername,
                biography: biography
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
