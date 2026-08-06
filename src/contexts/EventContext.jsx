import React, { createContext, useState, useEffect, useContext } from 'react';
import { useFlechazo } from './FlechazoContext';
import { redeemEventCode, getUserEvents, createEvent as createEventService } from '../services/eventsService';

const EventContext = createContext();

export const EventProvider = ({ children }) => {
    const { user, loading: flechazoLoading } = useFlechazo();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Esperar a que FlechazoContext resuelva la sesión antes de decidir
        // "sin eventos" — si no, en una carga en frío se evalúa con user=null.
        if (flechazoLoading) return;

        if (user?.id) {
            loadEvents(user.id);
        } else {
            setEvents([]);
            setLoading(false);
        }
    }, [user?.id, flechazoLoading]);

    const loadEvents = async (userId) => {
        setLoading(true);
        const result = await getUserEvents(userId);
        setEvents(result.eventos);
        setLoading(false);
    };

    const redeemCode = async (code) => {
        if (!user) return { success: false, error: 'No has iniciado sesión' };

        const result = await redeemEventCode(user.id, code);
        if (result.success) {
            await loadEvents(user.id);
        }
        return result;
    };

    const createEvent = async ({ name, description, startDate, endDate, colors }) => {
        if (!user) return { success: false, error: 'No has iniciado sesión' };

        const result = await createEventService({ userId: user.id, name, description, startDate, endDate, colors });
        if (result.success) {
            await loadEvents(user.id);
        }
        return result;
    };

    return (
        <EventContext.Provider
            value={{
                events,
                hasEvents: events.length > 0,
                loading,
                redeemCode,
                createEvent,
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
