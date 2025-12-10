import React from 'react';
import { StyleSheet, Text, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function GameModeCard({ game, onPress }) {
    const scaleAnim = new Animated.Value(1);

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.95,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
        }).start();
    };

    return (
        <Animated.View style={[styles.cardWrapper, { transform: [{ scale: scaleAnim }] }]}>
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
            >
                <LinearGradient
                    colors={game.color}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.card}
                >
                    <Text style={styles.icon}>{game.icon}</Text>
                    <Text style={styles.name}>{game.name}</Text>
                    <Text style={styles.description}>{game.description}</Text>
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    cardWrapper: {
        marginBottom: 16,
    },
    card: {
        borderRadius: 20,
        padding: 24,
        minHeight: 140,
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    icon: {
        fontSize: 48,
        marginBottom: 12,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        color: '#fff',
        opacity: 0.9,
    },
});
