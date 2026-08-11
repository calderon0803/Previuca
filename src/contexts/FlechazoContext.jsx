import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { signIn, signUp, signOut, onAuthStateChange } from '../services/authService';
import { getProfile, setSalseoUsername as setSalseoUsernameService, calculateAge, isAtLeastMinAge, MIN_AGE, GENDER_OPTIONS } from '../services/profileService';
import { supabase } from '../config/supabase';

const FlechazoContext = createContext();

export const FlechazoProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Ahora será el usuario de Supabase
    const [loading, setLoading] = useState(true);
    const [flechazos, setFlechazos] = useState([]); // Lista de flechazos del usuario (del evento activo)
    const [matches, setMatches] = useState([]); // Flechazos con match mutuo
    const [isVerified, setIsVerified] = useState(false);
    const [instagramUsername, setInstagramUsername] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [matchedByCount, setMatchedByCount] = useState(0);
    const [matchedByUserIds, setMatchedByUserIds] = useState([]);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [birthdate, setBirthdate] = useState('');
    const [gender, setGender] = useState('');
    const [salseoUsername, setSalseoUsername] = useState('');
    const [isBlocked, setIsBlocked] = useState(false);
    const [flechazosLoadedEventId, setFlechazosLoadedEventId] = useState(null);
    const hasLoadedData = useRef(false); // Track si ya cargamos la verificación de Instagram

    useEffect(() => {
        // Verificar sesión actual
        checkUser();

        // Escuchar cambios de autenticación
        let subscription;
        try {
            const result = onAuthStateChange((event, session) => {
                console.log('Auth state changed:', event);

                if (session?.user) {
                    setUser(session.user);
                    // Solo cargar datos si el usuario cambió (login/registro nuevo)
                    if (!hasLoadedData.current) {
                        loadInstagramVerification(session.user);
                        loadProfile(session.user.id);
                        loadBlockedStatus(session.user.id);
                        hasLoadedData.current = true;
                    }
                } else {
                    setUser(null);
                    setFlechazos([]);
                    setMatches([]);
                    setIsVerified(false);
                    setInstagramUsername('');
                    setMatchedByCount(0);
                    setMatchedByUserIds([]);
                    setFirstName('');
                    setLastName('');
                    setBirthdate('');
                    setGender('');
                    setSalseoUsername('');
                    setIsBlocked(false);
                    setFlechazosLoadedEventId(null);
                    hasLoadedData.current = false;
                }
                setLoading(false);
            });
            subscription = result?.data?.subscription;
        } catch (error) {
            console.error('Error setting up auth listener:', error);
            setLoading(false);
        }

        return () => {
            subscription?.unsubscribe();
        };
    }, []);

    const checkUser = async () => {
        try {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (session?.user) {
                setUser(session.user);
                // Solo cargar si no se ha cargado antes
                if (!hasLoadedData.current) {
                    await loadInstagramVerification(session.user);
                    await loadProfile(session.user.id);
                    await loadBlockedStatus(session.user.id);
                    hasLoadedData.current = true;
                }
            }
        } catch (error) {
            console.error('Error checking user:', error);
        } finally {
            setLoading(false);
        }
    };

    // Los flechazos están enlazados al evento activo: se cargan explícitamente
    // desde la pantalla (que conoce el eventId via useEvent), no en el login.
    const loadFlechazos = async (eventId, { force = false } = {}) => {
        if (!user || !eventId) return [];
        if (!force && flechazosLoadedEventId === eventId) return flechazos;

        try {
            const { data, error } = await supabase
                .from('users_flechazos')
                .select('match_name')
                .eq('user_id', user.id)
                .eq('event_id', eventId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            const flechazoList = data?.map(d => d.match_name) || [];
            setFlechazos(flechazoList);

            if (instagramUsername) {
                await loadMatchedByCount(instagramUsername, flechazoList, eventId);
            }

            setFlechazosLoadedEventId(eventId);
            return flechazoList;
        } catch (error) {
            console.error('Error loading flechazos:', error);
            setFlechazos([]);
            return [];
        }
    };

    const loadInstagramVerification = async (userObj) => {
        try {
            const { data, error } = await supabase
                .from('instagram_verification')
                .select('*')
                .eq('user_id', userObj.id)
                .maybeSingle();

            if (error) throw error;

            const verified = data?.is_verified || false;
            const username = data?.instagram_username || userObj?.email?.split('@')[0] || 'Usuario';
            const code = data?.verification_code || '';

            setIsVerified(verified);
            setInstagramUsername(username);
            setVerificationCode(code);

            return username;
        } catch (error) {
            console.error('Error loading instagram verification:', error);
            const fallbackUsername = userObj?.email?.split('@')[0] || 'Usuario';
            setIsVerified(false);
            setInstagramUsername(fallbackUsername);
            setVerificationCode('');
            return fallbackUsername;
        }
    };

    const refreshInstagramVerification = async () => {
        if (user?.id) {
            await loadInstagramVerification(user);
        }
    };

    const loadProfile = async (userId) => {
        const result = await getProfile(userId);
        setFirstName(result.profile?.first_name || '');
        setLastName(result.profile?.last_name || '');
        setBirthdate(result.profile?.birthdate || '');
        setGender(result.profile?.gender || '');
        setSalseoUsername(result.profile?.salseo_username || '');
    };

    // Fija el usuario público de Salseo (Instagram vinculado, o uno propio).
    const updateSalseoUsername = async (username) => {
        if (!user) return { success: false, error: 'No has iniciado sesión' };

        const result = await setSalseoUsernameService(user.id, username);
        if (result.success) {
            setSalseoUsername(result.username);
        }
        return result;
    };

    // Sustituto de un ban real de Supabase Auth (no hay service-role key en
    // este proyecto): mientras exista fila en blocked_users, App.jsx muestra
    // una pantalla de bloqueado en vez de las rutas normales.
    const loadBlockedStatus = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('blocked_users')
                .select('user_id')
                .eq('user_id', userId)
                .maybeSingle();

            if (error) throw error;
            setIsBlocked(!!data);
        } catch (error) {
            console.error('Error checking blocked status:', error);
            setIsBlocked(false);
        }
    };

    const loadMatchedByCount = async (username, myFlechazos, eventId) => {
        try {
            // Usa la función RPC de BD segura 'get_my_admirers'
            const { data: admirerIds, error } = await supabase
                .rpc('get_my_admirers', {
                    p_event_id: eventId,
                    p_my_instagram: username
                });

            if (error) throw error;

            const userIds = (admirerIds || []).map(row => row.admirer_user_id || row);
            const count = userIds.length;
            setMatchedByCount(count);
            setMatchedByUserIds(userIds);

            // Si hay gente que me tiene Y yo tengo flechazos, verificar matches mutuos
            if (count > 0 && myFlechazos && myFlechazos.length > 0) {
                if (userIds.length === 0) {
                    setMatches([]);
                    return;
                }

                // Obtener usernames de admiradores vía RPC segura
                const { data: igData, error: igError } = await supabase
                    .rpc('get_admirer_instagrams', {
                        p_event_id: eventId,
                        p_admirer_ids: userIds
                    });

                if (igError) throw igError;

                const theirUsernames = (igData || []).map(u => u.instagram_username);

                // Encontrar matches mutuos: flechazos míos que también me tienen
                const mutualMatches = myFlechazos.filter(flechazo =>
                    theirUsernames.includes(flechazo)
                );

                setMatches(mutualMatches);
            } else {
                setMatches([]);
            }
        } catch (error) {
            console.error('Error loading matched by count:', error);
            setMatchedByCount(0);
            setMatchedByUserIds([]);
            setMatches([]);
        }
    };

    const login = async (email, password) => {
        try {
            const result = await signIn(email, password);
            const { data, error } = result;

            if (error) {
                return { success: false, error: error };
            }
            if (data?.session) {
                return { success: true, data };
            }
            return { success: false, error: 'No se pudo iniciar sesión' };
        } catch (error) {
            console.error('[FlechazoContext] Login exception:', error);
            return { success: false, error: error.message };
        }
    };

    const register = async (email, password, firstName, lastName, birthdateValue, genderValue) => {
        if (!firstName?.trim() || !lastName?.trim()) {
            return { success: false, error: 'Nombre y apellido son obligatorios' };
        }
        if (!isAtLeastMinAge(birthdateValue)) {
            return { success: false, error: `Debes ser mayor de ${MIN_AGE} años para registrarte` };
        }
        if (!genderValue) {
            return { success: false, error: 'Selecciona un género' };
        }
        if (!GENDER_OPTIONS.includes(genderValue)) {
            return { success: false, error: 'Género no válido' };
        }

        try {
            const { data, error } = await signUp(email, password, {
                first_name: firstName.trim(),
                last_name: lastName.trim(),
                birthdate: birthdateValue,
                gender: genderValue,
            });
            if (error) {
                return { success: false, error };
            }
            return { success: true, data };
        } catch (error) {
            console.error('Register error:', error);
            return { success: false, error: error.message };
        }
    };

    const logout = async () => {
        try {
            await signOut();
            setUser(null);
            setFlechazos([]);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const addFlechazo = async (flechazoName, eventId) => {
        if (!user) return { success: false, error: 'No user logged in' };
        if (!eventId) return { success: false, error: 'No hay evento activo' };
        if (flechazos.length >= 5) return { success: false, error: 'Max 5 flechazos allowed' };

        try {
            const formattedName = flechazoName.replace(/\s+/g, '').toLowerCase();

            const { data, error } = await supabase
                .from('users_flechazos')
                .insert([
                    { user_id: user.id, match_name: formattedName, event_id: eventId }
                ])
                .select();

            if (error) throw error;

            setFlechazos([...flechazos, formattedName]);
            return { success: true, data };
        } catch (error) {
            console.error('Error adding flechazo:', error);
            return { success: false, error: error.message };
        }
    };

    const removeFlechazo = async (index, eventId) => {
        if (!user) return { success: false, error: 'No user logged in' };

        try {
            const flechazoToRemove = flechazos[index];

            const { error } = await supabase
                .from('users_flechazos')
                .delete()
                .eq('user_id', user.id)
                .eq('match_name', flechazoToRemove)
                .eq('event_id', eventId);

            if (error) throw error;

            const updatedFlechazos = [...flechazos];
            updatedFlechazos.splice(index, 1);
            setFlechazos(updatedFlechazos);
            return { success: true };
        } catch (error) {
            console.error('Error removing flechazo:', error);
            return { success: false, error: error.message };
        }
    };

    const updateFlechazo = async (index, newName, eventId) => {
        if (!user) return { success: false, error: 'No user logged in' };

        try {
            const formattedName = newName.replace(/\s+/g, '').toLowerCase();
            const oldFlechazoName = flechazos[index];

            const { error } = await supabase
                .from('users_flechazos')
                .update({ match_name: formattedName })
                .eq('user_id', user.id)
                .eq('match_name', oldFlechazoName)
                .eq('event_id', eventId);

            if (error) throw error;

            const updatedFlechazos = [...flechazos];
            updatedFlechazos[index] = formattedName;
            setFlechazos(updatedFlechazos);
            return { success: true };
        } catch (error) {
            console.error('Error updating flechazo:', error);
            return { success: false, error: error.message };
        }
    };

    return (
        <FlechazoContext.Provider
            value={{
                user,
                flechazos,
                matches,
                loading,
                isVerified,
                instagramUsername,
                verificationCode,
                matchedByCount,
                matchedByUserIds,
                firstName,
                lastName,
                birthdate,
                gender,
                salseoUsername,
                updateSalseoUsername,
                isBlocked,
                age: calculateAge(birthdate),
                fullName: `${firstName} ${lastName}`.trim(),
                hasProfile: Boolean(firstName && lastName && birthdate && gender),
                login,
                register,
                logout,
                loadFlechazos,
                addFlechazo,
                removeFlechazo,
                updateFlechazo,
                refreshInstagramVerification
            }}
        >
            {children}
        </FlechazoContext.Provider>
    );
};

export const useFlechazo = () => {
    const context = useContext(FlechazoContext);
    if (!context) {
        throw new Error('useFlechazo must be used within a FlechazoProvider');
    }
    return context;
};
