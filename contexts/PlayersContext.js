import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PLAYERS_KEY = '@patronaleague_players';

const PlayersContext = createContext();

export const PlayersProvider = ({ children }) => {
    const [players, setPlayers] = useState([]);

    useEffect(() => {
        loadPlayers();
    }, []);

    const loadPlayers = async () => {
        try {
            const saved = await AsyncStorage.getItem(PLAYERS_KEY);
            if (saved) {
                setPlayers(JSON.parse(saved));
            }
        } catch (error) {
            console.error('Error loading players:', error);
        }
    };

    const savePlayers = async (newPlayers) => {
        try {
            await AsyncStorage.setItem(PLAYERS_KEY, JSON.stringify(newPlayers));
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
