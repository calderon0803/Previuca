import React, { createContext, useState, useEffect, useContext } from 'react';

const DATES_KEY = 'patronaleague_dates_user';

const DatesContext = createContext();

export const DatesProvider = ({ children }) => {
    const [user, setUser] = useState(null); // { username, dates: [] }

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = () => {
        try {
            const saved = localStorage.getItem(DATES_KEY);
            if (saved) {
                setUser(JSON.parse(saved));
            }
        } catch (error) {
            console.error('Error loading dates user:', error);
        }
    };

    const login = (email, password) => {
        const newUser = {
            email,
            password, // In a real app, never store passwords like this!
            dates: [] // Initial empty list
        };
        // Check if previous data exists for this user (simple persistence)
        // For this local version, we'll just overwrite/load if key matches, 
        // but since we single-user per device typically for this scope:
        setUser(newUser);
        localStorage.setItem(DATES_KEY, JSON.stringify(newUser));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem(DATES_KEY);
    };

    const addDate = (dateName) => {
        if (!user) return;
        if (user.dates.length >= 5) return;

        // Remove spaces for "username" style
        const formattedName = dateName.replace(/\s+/g, '').toLowerCase();

        const updatedDates = [...user.dates, formattedName];
        const updatedUser = { ...user, dates: updatedDates };

        setUser(updatedUser);
        localStorage.setItem(DATES_KEY, JSON.stringify(updatedUser));
    };

    const removeDate = (index) => {
        if (!user) return;

        const updatedDates = [...user.dates];
        updatedDates.splice(index, 1);

        const updatedUser = { ...user, dates: updatedDates };

        setUser(updatedUser);
        localStorage.setItem(DATES_KEY, JSON.stringify(updatedUser));
    };

    const updateDate = (index, newName) => {
        if (!user) return;

        const formattedName = newName.replace(/\s+/g, '').toLowerCase();
        const updatedDates = [...user.dates];
        updatedDates[index] = formattedName;

        const updatedUser = { ...user, dates: updatedDates };
        setUser(updatedUser);
        localStorage.setItem(DATES_KEY, JSON.stringify(updatedUser));
    }

    return (
        <DatesContext.Provider
            value={{
                user,
                login,
                logout,
                addDate,
                removeDate,
                updateDate
            }}
        >
            {children}
        </DatesContext.Provider>
    );
};

export const useDates = () => {
    const context = useContext(DatesContext);
    if (!context) {
        throw new Error('useDates must be used within a DatesProvider');
    }
    return context;
};
