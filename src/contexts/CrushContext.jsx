import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { signIn, signUp, signOut, onAuthStateChange } from '../services/authService';
import { supabase } from '../config/supabase';

const CRUSHES_KEY = 'patronaleague_crushes_user';

const CrushContext = createContext();

export const CrushProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Ahora será el usuario de Supabase
    const [loading, setLoading] = useState(true);
    const [crushes, setCrushes] = useState([]); // Lista de crushes del usuario
    const hasLoadedCrushes = useRef(false); // Track si ya cargamos los crushes

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
                    // Solo cargar crushes si nunca los hemos cargado
                    if (!hasLoadedCrushes.current) {
                        loadCrushesFromDB(session.user.id);
                        hasLoadedCrushes.current = true;
                    }
                } else {
                    setUser(null);
                    setCrushes([]);
                    hasLoadedCrushes.current = false;
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
                await loadCrushesFromDB(session.user.id);
            }
        } catch (error) {
            console.error('Error checking user:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadCrushesFromDB = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('users_crushes')
                .select('match_name')
                .eq('user_id', userId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            setCrushes(data?.map(d => d.match_name) || []);
        } catch (error) {
            console.error('Error loading crushes:', error);
            setCrushes([]);
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

    const addCrush = async (crushName) => {
        if (!user) return { success: false, error: 'No user logged in' };
        if (crushes.length >= 5) return { success: false, error: 'Max 5 crushes allowed' };

        try {
            const formattedName = crushName.replace(/\s+/g, '').toLowerCase();
            
            const { data, error } = await supabase
                .from('users_crushes')
                .insert([
                    { user_id: user.id, match_name: formattedName }
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

    const removeCrush = async (index) => {
        if (!user) return { success: false, error: 'No user logged in' };

        try {
            const crushToRemove = crushes[index];
            
            const { error } = await supabase
                .from('users_crushes')
                .delete()
                .eq('user_id', user.id)
                .eq('match_name', crushToRemove);

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

    const updateCrush = async (index, newName) => {
        if (!user) return { success: false, error: 'No user logged in' };

        try {
            const formattedName = newName.replace(/\s+/g, '').toLowerCase();
            const oldCrushName = crushes[index];

            const { error } = await supabase
                .from('users_crushes')
                .update({ match_name: formattedName })
                .eq('user_id', user.id)
                .eq('match_name', oldCrushName);

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
                loading,
                login,
                register,
                logout,
                addCrush,
                removeCrush,
                updateCrush
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
