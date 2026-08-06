import React, { createContext, useState, useEffect, useContext } from 'react';
import { useCrush } from './CrushContext';
import { redeemFiestaCode, getUserFiesta } from '../services/fiestasService';

const FiestaContext = createContext();

export const FiestaProvider = ({ children }) => {
    const { user } = useCrush();
    const [fiesta, setFiesta] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.id) {
            loadFiesta(user.id);
        } else {
            setFiesta(null);
            setLoading(false);
        }
    }, [user?.id]);

    const loadFiesta = async (userId) => {
        setLoading(true);
        const result = await getUserFiesta(userId);
        setFiesta(result.fiesta || null);
        setLoading(false);
    };

    const redeemCode = async (code) => {
        if (!user) return { success: false, error: 'No has iniciado sesión' };

        const result = await redeemFiestaCode(user.id, code);
        if (result.success) {
            setFiesta(result.fiesta);
        }
        return result;
    };

    return (
        <FiestaContext.Provider
            value={{
                fiesta,
                hasFiesta: !!fiesta,
                fiestaId: fiesta?.id || null,
                fiestaName: fiesta?.name || '',
                loading,
                redeemCode,
            }}
        >
            {children}
        </FiestaContext.Provider>
    );
};

export const useFiesta = () => {
    const context = useContext(FiestaContext);
    if (!context) {
        throw new Error('useFiesta must be used within a FiestaProvider');
    }
    return context;
};
