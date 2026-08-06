import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { signIn, signUp, signOut, onAuthStateChange } from '../services/authService';
import { supabase } from '../config/supabase';

const CrushContext = createContext();

export const CrushProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Ahora será el usuario de Supabase
    const [loading, setLoading] = useState(true);
    const [crushes, setCrushes] = useState([]); // Lista de crushes del usuario (del evento activo)
    const [matches, setMatches] = useState([]); // Crushes con match mutuo
    const [isVerified, setIsVerified] = useState(false);
    const [instagramUsername, setInstagramUsername] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [matchedByCount, setMatchedByCount] = useState(0);
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
                        hasLoadedData.current = true;
                    }
                } else {
                    setUser(null);
                    setCrushes([]);
                    setMatches([]);
                    setIsVerified(false);
                    setInstagramUsername('');
                    setMatchedByCount(0);
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
                    hasLoadedData.current = true;
                }
            }
        } catch (error) {
            console.error('Error checking user:', error);
        } finally {
            setLoading(false);
        }
    };

    // Los crushes están enlazados al evento activo: se cargan explícitamente
    // desde la pantalla (que conoce el eventId via useEvent), no en el login.
    const loadCrushes = async (eventId) => {
        if (!user || !eventId) return [];

        try {
            const { data, error } = await supabase
                .from('users_crushes')
                .select('match_name')
                .eq('user_id', user.id)
                .eq('event_id', eventId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            const crushList = data?.map(d => d.match_name) || [];
            setCrushes(crushList);

            if (instagramUsername) {
                await loadMatchedByCount(instagramUsername, crushList, eventId);
            }

            return crushList;
        } catch (error) {
            console.error('Error loading crushes:', error);
            setCrushes([]);
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

    const loadMatchedByCount = async (username, myCrushes, eventId) => {
        try {
            const { data, error } = await supabase
                .from('users_crushes')
                .select('user_id')
                .eq('match_name', username)
                .eq('event_id', eventId);

            if (error) throw error;

            const count = data?.length || 0;
            setMatchedByCount(count);

            // Si hay gente que me tiene Y yo tengo crushes, verificar matches mutuos
            if (count > 0 && myCrushes && myCrushes.length > 0) {
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

                // Encontrar matches mutuos: crushes míos que también me tienen
                const mutualMatches = myCrushes.filter(crush =>
                    theirUsernames.includes(crush)
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
        console.log('[CrushContext] login called with:', email);
        try {
            console.log('[CrushContext] calling signIn...');
            const result = await signIn(email, password);
            console.log('[CrushContext] signIn returned:', result);

            const { data, error } = result;
            console.log('[CrushContext] extracted data:', data);
            console.log('[CrushContext] extracted error:', error);

            if (error) {
                console.log('[CrushContext] returning error');
                return { success: false, error: error };
            }
            if (data?.session) {
                console.log('[CrushContext] returning success');
                return { success: true, data };
            }
            console.log('[CrushContext] no session, returning error');
            return { success: false, error: 'No se pudo iniciar sesión' };
        } catch (error) {
            console.error('[CrushContext] Login exception:', error);
            return { success: false, error: error.message };
        }
    };

    const register = async (email, password) => {
        try {
            const { data, error } = await signUp(email, password);
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
            setCrushes([]);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const addCrush = async (crushName, eventId) => {
        if (!user) return { success: false, error: 'No user logged in' };
        if (!eventId) return { success: false, error: 'No hay evento activo' };
        if (crushes.length >= 5) return { success: false, error: 'Max 5 crushes allowed' };

        try {
            const formattedName = crushName.replace(/\s+/g, '').toLowerCase();

            const { data, error } = await supabase
                .from('users_crushes')
                .insert([
                    { user_id: user.id, match_name: formattedName, event_id: eventId }
                ])
                .select();

            if (error) throw error;

            setCrushes([...crushes, formattedName]);
            return { success: true, data };
        } catch (error) {
            console.error('Error adding crush:', error);
            return { success: false, error: error.message };
        }
    };

    const removeCrush = async (index, eventId) => {
        if (!user) return { success: false, error: 'No user logged in' };

        try {
            const crushToRemove = crushes[index];

            const { error } = await supabase
                .from('users_crushes')
                .delete()
                .eq('user_id', user.id)
                .eq('match_name', crushToRemove)
                .eq('event_id', eventId);

            if (error) throw error;

            const updatedCrushes = [...crushes];
            updatedCrushes.splice(index, 1);
            setCrushes(updatedCrushes);
            return { success: true };
        } catch (error) {
            console.error('Error removing crush:', error);
            return { success: false, error: error.message };
        }
    };

    const updateCrush = async (index, newName, eventId) => {
        if (!user) return { success: false, error: 'No user logged in' };

        try {
            const formattedName = newName.replace(/\s+/g, '').toLowerCase();
            const oldCrushName = crushes[index];

            const { error } = await supabase
                .from('users_crushes')
                .update({ match_name: formattedName })
                .eq('user_id', user.id)
                .eq('match_name', oldCrushName)
                .eq('event_id', eventId);

            if (error) throw error;

            const updatedCrushes = [...crushes];
            updatedCrushes[index] = formattedName;
            setCrushes(updatedCrushes);
            return { success: true };
        } catch (error) {
            console.error('Error updating crush:', error);
            return { success: false, error: error.message };
        }
    };

    return (
        <CrushContext.Provider
            value={{
                user,
                crushes,
                matches,
                loading,
                isVerified,
                instagramUsername,
                verificationCode,
                matchedByCount,
                login,
                register,
                logout,
                loadCrushes,
                addCrush,
                removeCrush,
                updateCrush,
                refreshInstagramVerification
            }}
        >
            {children}
        </CrushContext.Provider>
    );
};

export const useCrush = () => {
    const context = useContext(CrushContext);
    if (!context) {
        throw new Error('useCrush must be used within a CrushProvider');
    }
    return context;
};
