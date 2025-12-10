import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { usePlayers } from '../contexts/PlayersContext';
import { cardRules, generateDeck, shuffleDeck } from '../data/reyDeCopasRules';

export default function ReyDeCopasGame({ navigation }) {
    const { players } = usePlayers();
    const [deck, setDeck] = useState([]);
    const [currentCard, setCurrentCard] = useState(null);
    const [cardsDrawn, setCardsDrawn] = useState(0);
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
    const [kingsDrawn, setKingsDrawn] = useState(0);
    const [fadeAnim] = useState(new Animated.Value(0));

    useEffect(() => {
        // Inicializar baraja mezclada
        const newDeck = shuffleDeck(generateDeck());
        setDeck(newDeck);
    }, []);

    const drawCard = (cardIndex) => {
        if (deck.length === 0) return;

        const card = deck[cardIndex];
        const remainingDeck = deck.filter((_, index) => index !== cardIndex);

        setCurrentCard(card);
        setDeck(remainingDeck);
        setCardsDrawn(cardsDrawn + 1);

        // Contar reyes
        if (card.value === 'K') {
            setKingsDrawn(kingsDrawn + 1);
        }

        // Avanzar al siguiente jugador
        if (players.length > 0) {
            setCurrentPlayerIndex((currentPlayerIndex + 1) % players.length);
        }

        // Animación
        Animated.sequence([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const resetGame = () => {
        const newDeck = shuffleDeck(generateDeck());
        setDeck(newDeck);
        setCurrentCard(null);
        setCardsDrawn(0);
        setCurrentPlayerIndex(0);
        setKingsDrawn(0);
    };

    const currentPlayer = players.length > 0 ? players[currentPlayerIndex] : null;
    const rule = currentCard ? cardRules[currentCard.value] : null;

    return (
        <LinearGradient
            colors={['#4facfe', '#00f2fe']}
            style={styles.container}
        >
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity onPress={resetGame} style={styles.iconButton}>
                    <Ionicons name="refresh" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                {/* Indicador de jugador */}
                {currentPlayer && !currentCard && (
                    <View style={styles.playerIndicator}>
                        <Text style={styles.playerLabel}>Turno de:</Text>
                        <Text style={styles.playerName}>{currentPlayer.name}</Text>
                    </View>
                )}

                {/* Contador de cartas */}
                <View style={styles.counter}>
                    <Text style={styles.counterText}>
                        {deck.length} cartas restantes
                    </Text>
                    {kingsDrawn > 0 && (
                        <Text style={styles.kingsText}>
                            👑 Reyes: {kingsDrawn}/4
                        </Text>
                    )}
                </View>

                {/* Carta actual o botón robar */}
                {currentCard ? (
                    <Animated.View style={[styles.cardContainer, { opacity: fadeAnim }]}>
                        <View style={styles.card}>
                            <Text style={styles.cardValue}>{currentCard.value}</Text>
                            <Text style={styles.cardSuit}>{currentCard.suit}</Text>
                        </View>

                        {rule && (
                            <View style={styles.ruleContainer}>
                                <Text style={styles.ruleName}>{rule.rule}</Text>
                                <Text style={styles.ruleDescription}>{rule.description}</Text>
                            </View>
                        )}

                        <TouchableOpacity
                            style={styles.nextButton}
                            onPress={() => setCurrentCard(null)}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={['#667eea', '#764ba2']}
                                style={styles.nextButtonGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <Text style={styles.nextButtonText}>Continuar</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </Animated.View>
                ) : (
                    <View style={styles.drawContainer}>
                        {deck.length > 0 ? (
                            <>
                                <Text style={styles.selectText}>Elige una carta</Text>
                                <View style={styles.cardsRow}>
                                    {deck.slice(0, Math.min(5, deck.length)).map((_, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            style={styles.cardBack}
                                            onPress={() => drawCard(index)}
                                            activeOpacity={0.8}
                                        >
                                            <Text style={styles.cardBackText}>🃏</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </>
                        ) : (
                            <View style={styles.gameOver}>
                                <Text style={styles.gameOverTitle}>¡Juego Terminado!</Text>
                                <Text style={styles.gameOverText}>
                                    Se robaron todas las cartas
                                </Text>
                                <TouchableOpacity
                                    style={styles.restartButton}
                                    onPress={resetGame}
                                    activeOpacity={0.8}
                                >
                                    <LinearGradient
                                        colors={['#667eea', '#764ba2']}
                                        style={styles.restartButtonGradient}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                    >
                                        <Ionicons name="refresh" size={24} color="#fff" style={{ marginRight: 8 }} />
                                        <Text style={styles.restartButtonText}>Jugar de Nuevo</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                )}
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    playerIndicator: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 16,
        marginBottom: 20,
        alignItems: 'center',
    },
    playerLabel: {
        fontSize: 14,
        color: '#fff',
        opacity: 0.9,
        marginBottom: 4,
    },
    playerName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    counter: {
        marginBottom: 20,
        alignItems: 'center',
    },
    counterText: {
        fontSize: 18,
        color: '#fff',
        fontWeight: '600',
    },
    kingsText: {
        fontSize: 16,
        color: '#fff',
        marginTop: 4,
    },
    cardContainer: {
        width: '100%',
        alignItems: 'center',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        width: 200,
        height: 280,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 12,
        marginBottom: 24,
    },
    cardValue: {
        fontSize: 72,
        fontWeight: 'bold',
        color: '#333',
    },
    cardSuit: {
        fontSize: 48,
        marginTop: 8,
    },
    ruleContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 16,
        padding: 20,
        width: '100%',
        marginBottom: 24,
    },
    ruleName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
        textAlign: 'center',
    },
    ruleDescription: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 24,
    },
    nextButton: {
        width: '100%',
        borderRadius: 16,
        overflow: 'hidden',
    },
    nextButtonGradient: {
        paddingVertical: 18,
        alignItems: 'center',
    },
    nextButtonText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    drawContainer: {
        alignItems: 'center',
        width: '100%',
    },
    selectText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 24,
    },
    cardsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 16,
        maxWidth: '100%',
    },
    cardBack: {
        backgroundColor: '#fff',
        borderRadius: 16,
        width: 100,
        height: 140,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    cardBackText: {
        fontSize: 50,
    },
    gameOver: {
        alignItems: 'center',
    },
    gameOverTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 12,
    },
    gameOverText: {
        fontSize: 18,
        color: '#fff',
        marginBottom: 32,
    },
    restartButton: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    restartButtonGradient: {
        paddingVertical: 18,
        paddingHorizontal: 32,
        flexDirection: 'row',
        alignItems: 'center',
    },
    restartButtonText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
});
