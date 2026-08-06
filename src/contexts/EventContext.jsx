import React, { createContext, useState, useEffect, useContext } from 'react';
import { useCrush } from './CrushContext';
import { redeemEventCode, getUserEvent } from '../services/eventsService';

const EventContext = createContext();

export const EventProvider = ({ children }) => {
    const { user } = useCrush();
    const [evento, setEvento] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.id) {
            loadEvent(user.id);
        } else {
            setEvento(null);
            setLoading(false);
        }
    }, [user?.id]);

    const loadEvent = async (userId) => {
        setLoading(true);
        const result = await getUserEvent(userId);
        setEvento(result.evento || null);
        setLoading(false);
    };

    const redeemCode = async (code) => {
        if (!user) return { success: false, error: 'No has iniciado sesión' };

        const result = await redeemEventCode(user.id, code);
        if (result.success) {
            setEvento(result.evento);
        }
        return result;
    };

    return (
        <EventContext.Provider
            value={{
                evento,
                hasEvent: !!evento,
                eventId: evento?.id || null,
                eventName: evento?.name || '',
                loading,
                redeemCode,
            }}
        >
            {children}
        </EventContext.Provider>
    );
};

export const useEvent = () => {
    const context = useContext(EventContext);
    if (!context) {
        throw new Error('useEvent must be used within an EventProvider');
    }
    return context;
};
