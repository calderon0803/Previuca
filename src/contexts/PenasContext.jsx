import React, { createContext, useState, useEffect, useContext } from 'react';
import { useCrush } from './CrushContext';
import { useFiesta } from './FiestaContext';
import { createPena as createPenaService, joinPenaByCode, getPenasByFiesta, getMyPena } from '../services/penasService';

const PenasContext = createContext();

export const PenasProvider = ({ children }) => {
    const { user } = useCrush();
    const { fiestaId } = useFiesta();
    const [penas, setPenas] = useState([]);
    const [myPena, setMyPena] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.id && fiestaId) {
            loadPenas();
        } else {
            setPenas([]);
            setMyPena(null);
            setLoading(false);
        }
    }, [user?.id, fiestaId]);

    const loadPenas = async () => {
        setLoading(true);
        const [penasResult, myPenaResult] = await Promise.all([
            getPenasByFiesta(fiestaId),
            getMyPena(user.id),
        ]);
        setPenas(penasResult.penas);
        setMyPena(myPenaResult.pena);
        setLoading(false);
    };

    const createPena = async ({ name, color, imageFile }) => {
        if (!user || !fiestaId) return { success: false, error: 'Debes tener una fiesta activa' };
        if (myPena) return { success: false, error: 'Ya perteneces a una peña' };

        const result = await createPenaService({ fiestaId, userId: user.id, name, color, imageFile });
        if (result.success) {
            await loadPenas();
        }
        return result;
    };

    const joinPena = async (code) => {
        if (!user || !fiestaId) return { success: false, error: 'Debes tener una fiesta activa' };
        if (myPena) return { success: false, error: 'Ya perteneces a una peña' };

        const result = await joinPenaByCode(fiestaId, user.id, code);
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
