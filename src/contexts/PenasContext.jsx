import React, { createContext, useState, useContext } from 'react';
import { useFlechazo } from './FlechazoContext';
import { createPena as createPenaService, joinPenaByCode, getPenasByEvent, getMyPena } from '../services/penasService';

const PenasContext = createContext();

export const PenasProvider = ({ children }) => {
    const { user } = useFlechazo();
    const [penas, setPenas] = useState([]);
    const [myPena, setMyPena] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadPenas = async (eventId) => {
        if (!user?.id || !eventId) {
            setPenas([]);
            setMyPena(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        const [penasResult, myPenaResult] = await Promise.all([
            getPenasByEvent(eventId),
            getMyPena(user.id, eventId),
        ]);
        setPenas(penasResult.penas);
        setMyPena(myPenaResult.pena);
        setLoading(false);
    };

    const createPena = async ({ eventId, name, color, imageFile }) => {
        if (!user || !eventId) return { success: false, error: 'Debes tener un evento activo' };
        if (myPena) return { success: false, error: 'Ya perteneces a una peña' };

        const result = await createPenaService({ eventId, userId: user.id, name, color, imageFile });
        if (result.success) {
            await loadPenas(eventId);
        }
        return result;
    };

    const joinPena = async (eventId, code) => {
        if (!user || !eventId) return { success: false, error: 'Debes tener un evento activo' };
        if (myPena) return { success: false, error: 'Ya perteneces a una peña' };

        const result = await joinPenaByCode(eventId, user.id, code);
        if (result.success) {
            await loadPenas(eventId);
        }
        return result;
    };

    return (
        <PenasContext.Provider
            value={{
                penas,
                myPena,
                loading,
                loadPenas,
                createPena,
                joinPena,
            }}
        >
            {children}
        </PenasContext.Provider>
    );
};

export const usePenas = () => {
    const context = useContext(PenasContext);
    if (!context) {
        throw new Error('usePenas must be used within a PenasProvider');
    }
    return context;
};
