import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { signIn, signUp, signOut, onAuthStateChange } from '../services/authService';
import { getProfile, upsertProfile } from '../services/profileService';
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
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
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
                        hasLoadedData.current = true;
                    }
                } else {
                    setUser(null);
                    setFlechazos([]);
                    setMatches([]);
                    setIsVerified(false);
                    setInstagramUsername('');
                    setMatchedByCount(0);
                    setFirstName('');
                    setLastName('');
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
    const loadFlechazos = async (eventId) => {
        if (!user || !eventId) return [];

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
                .single();

            if (error && error.code !== 'PGRST116') throw error;

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
    };

    const saveProfile = async (newFirstName, newLastName) => {
        if (!user) return { success: false, error: 'No user logged in' };
        if (!newFirstName?.trim() || !newLastName?.trim()) {
            return { success: false, error: 'Nombre y apellido son obligatorios' };
        }

        const result = await upsertProfile(user.id, newFirstName, newLastName);
        if (result.success) {
            setFirstName(newFirstName.trim());
            setLastName(newLastName.trim());
        }
        return result;
    };

    const loadMatchedByCount = async (username, myFlechazos, eventId) => {
        try {
            const { data, error } = await supabase
                .from('users_flechazos')
                .select('user_id')
                .eq('match_name', username)
                .eq('event_id', eventId);

            if (error) throw error;

            const count = data?.length || 0;
            setMatchedByCount(count);

            // Si hay gente que me tiene Y yo tengo flechazos, verificar matches mutuos
            if (count > 0 && myFlechazos && myFlechazos.length > 0) {
                const userIds = data.map(d => d.user_id);
                console.log('UserIds que me tienen:', userIds);

                if (userIds.length === 0) {
                    setMatches([]);
                    return;
                }

                // Obtener los usernames de Instagram de quienes me tienen
                const { data: igData, error: igError } = await supabase
                    .from('instagram_verification')
                    .select('instagram_username')
                    .in('user_id', userIds);

                console.log('Instagram data:', igData);
                console.log('Instagram error:', igError);

                if (igError) throw igError;

                const theirUsernames = igData?.map(u => u.instagram_username) || [];

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
            setMatches([]);
        }
    };

    const login = async (email, password) => {
        console.log('[FlechazoContext] login called with:', email);
        try {
            console.log('[FlechazoContext] calling signIn...');
            const result = await signIn(email, password);
            console.log('[FlechazoContext] signIn returned:', result);

            const { data, error } = result;
            console.log('[FlechazoContext] extracted data:', data);
            console.log('[FlechazoContext] extracted error:', error);

            if (error) {
                console.log('[FlechazoContext] returning error');
                return { success: false, error: error };
            }
            if (data?.session) {
                console.log('[FlechazoContext] returning success');
                return { success: true, data };
            }
            console.log('[FlechazoContext] no session, returning error');
            return { success: false, error: 'No se pudo iniciar sesión' };
        } catch (error) {
            console.error('[FlechazoContext] Login exception:', error);
            return { success: false, error: error.message };
        }
    };

    const register = async (email, password, firstName, lastName) => {
        if (!firstName?.trim() || !lastName?.trim()) {
            return { success: false, error: 'Nombre y apellido son obligatorios' };
        }

        try {
            const { data, error } = await signUp(email, password, {
                first_name: firstName.trim(),
                last_name: lastName.trim(),
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
                firstName,
                lastName,
                fullName: `${firstName} ${lastName}`.trim(),
                hasProfile: Boolean(firstName && lastName),
                login,
                register,
                logout,
                loadFlechazos,
                addFlechazo,
                removeFlechazo,
                updateFlechazo,
                refreshInstagramVerification,
                saveProfile
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
