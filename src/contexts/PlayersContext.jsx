import React, { createContext, useState, useEffect, useContext } from 'react';

const PLAYERS_KEY = 'patronaleague_players';

const PlayersContext = createContext();

export const PlayersProvider = ({ children }) => {
    const [players, setPlayers] = useState([]);

    useEffect(() => {
        loadPlayers();
    }, []);

    const loadPlayers = () => {
        try {
            const saved = localStorage.getItem(PLAYERS_KEY);
            if (saved) {
                setPlayers(JSON.parse(saved));
            }
        } catch (error) {
            console.error('Error loading players:', error);
        }
    };

    const savePlayers = (newPlayers) => {
        try {
            localStorage.setItem(PLAYERS_KEY, JSON.stringify(newPlayers));
            setPlayers(newPlayers);
        } catch (error) {
            console.error('Error saving players:', error);
        }
    };

    const addPlayer = (name) => {
        if (name.trim()) {
            const newPlayer = {
                id: Date.now().toString(),
                name: name.trim(),
            };
            const updatedPlayers = [...players, newPlayer];
            savePlayers(updatedPlayers);
        }
    };

    const removePlayer = (id) => {
        const updatedPlayers = players.filter((player) => player.id !== id);
        savePlayers(updatedPlayers);
    };

    const clearPlayers = () => {
        savePlayers([]);
    };

    return (
        <PlayersContext.Provider
            value={{
                players,
                addPlayer,
                removePlayer,
                clearPlayers,
            }}
        >
            {children}
        </PlayersContext.Provider>
    );
};

export const usePlayers = () => {
    const context = useContext(PlayersContext);
    if (!context) {
        throw new Error('usePlayers must be used within a PlayersProvider');
    }
    return context;
};
