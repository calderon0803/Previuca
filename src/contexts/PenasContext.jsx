import React, { createContext, useState, useEffect, useContext } from 'react';
import { useCrush } from './CrushContext';
import { useEvent } from './EventContext';
import { createPena as createPenaService, joinPenaByCode, getPenasByEvent, getMyPena } from '../services/penasService';

const PenasContext = createContext();

export const PenasProvider = ({ children }) => {
    const { user } = useCrush();
    const { eventId } = useEvent();
    const [penas, setPenas] = useState([]);
    const [myPena, setMyPena] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.id && eventId) {
            loadPenas();
        } else {
            setPenas([]);
            setMyPena(null);
            setLoading(false);
        }
    }, [user?.id, eventId]);

    const loadPenas = async () => {
        setLoading(true);
        const [penasResult, myPenaResult] = await Promise.all([
            getPenasByEvent(eventId),
            getMyPena(user.id),
        ]);
        setPenas(penasResult.penas);
        setMyPena(myPenaResult.pena);
        setLoading(false);
    };

    const createPena = async ({ name, color, imageFile }) => {
        if (!user || !eventId) return { success: false, error: 'Debes tener un evento activo' };
        if (myPena) return { success: false, error: 'Ya perteneces a una peña' };

        const result = await createPenaService({ eventId, userId: user.id, name, color, imageFile });
        if (result.success) {
            await loadPenas();
        }
        return result;
    };

    const joinPena = async (code) => {
        if (!user || !eventId) return { success: false, error: 'Debes tener un evento activo' };
        if (myPena) return { success: false, error: 'Ya perteneces a una peña' };

        const result = await joinPenaByCode(eventId, user.id, code);
        if (result.success) {
            await loadPenas();
        }
        return result;
    };

    return (
        <PenasContext.Provider
            value={{
                penas,
                myPena,
                loading,
                createPena,
                joinPena,
                refreshPenas: loadPenas,
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
