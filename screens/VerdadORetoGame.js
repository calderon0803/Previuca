import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePlayers } from '../contexts/PlayersContext';
import { verdades as defaultVerdades, retos as defaultRetos } from '../data/verdadORetoQuestions';
import VerdadORetoEditor from '../components/VerdadORetoEditor';

const VERDADES_KEY = '@verdadoreto_verdades';
const RETOS_KEY = '@verdadoreto_retos';

export default function VerdadORetoGame({ navigation }) {
    const { players } = usePlayers();
    const [mode, setMode] = useState('selection'); // 'selection' o 'showing'
    const [currentType, setCurrentType] = useState(null); // 'verdad' o 'reto'
    const [currentText, setCurrentText] = useState('');
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
    const [fadeAnim] = useState(new Animated.Value(1));
    const [verdades, setVerdades] = useState(defaultVerdades);
    const [retos, setRetos] = useState(defaultRetos);
    const [showEditor, setShowEditor] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const savedVerdades = await AsyncStorage.getItem(VERDADES_KEY);
            const savedRetos = await AsyncStorage.getItem(RETOS_KEY);
            if (savedVerdades) setVerdades(JSON.parse(savedVerdades));
            if (savedRetos) setRetos(JSON.parse(savedRetos));
        } catch (error) {
            console.error('Error loading data:', error);
        }
    };

    const handleSelection = (type) => {
        const list = type === 'verdad' ? verdades : retos;
        const randomIndex = Math.floor(Math.random() * list.length);
        const text = list[randomIndex];

        setCurrentType(type);
        setCurrentText(text);
        setMode('showing');

        // Animación fade in
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const handleNext = () => {
        // Animación fade out
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }).start(() => {
            // Avanzar al siguiente jugador si hay jugadores
            if (players.length > 0) {
                setCurrentPlayerIndex((currentPlayerIndex + 1) % players.length);
            }
            setMode('selection');
            setCurrentType(null);
            setCurrentText('');
            // Fade in de los botones
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        });
    };

    const saveData = async (newVerdades, newRetos) => {
        try {
            await AsyncStorage.setItem(VERDADES_KEY, JSON.stringify(newVerdades));
            await AsyncStorage.setItem(RETOS_KEY, JSON.stringify(newRetos));
            setVerdades(newVerdades);
            setRetos(newRetos);
            setShowEditor(false);
        } catch (error) {
            console.error('Error saving data:', error);
        }
    };

    const currentPlayer = players.length > 0 ? players[currentPlayerIndex] : null;

    return (
        <LinearGradient
            colors={['#f093fb', '#f5576c']}
            style={styles.container}
        >
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowEditor(true)} style={styles.iconButton}>
                    <Ionicons name="settings-outline" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            <VerdadORetoEditor
                visible={showEditor}
                verdades={verdades}
                retos={retos}
                onSave={saveData}
                onCancel={() => setShowEditor(false)}
            />

            {mode === 'selection' ? (
                <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                    {currentPlayer && (
                        <View style={styles.playerIndicator}>
                            <Text style={styles.playerLabel}>Turno de:</Text>
                            <Text style={styles.playerName}>{currentPlayer.name}</Text>
                        </View>
                    )}
                    <Text style={styles.title}>Elige tu destino</Text>

                    <View style={styles.buttonsContainer}>
                        <TouchableOpacity
                            style={styles.choiceButton}
                            onPress={() => handleSelection('verdad')}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={['#4facfe', '#00f2fe']}
                                style={styles.choiceButtonGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <Text style={styles.choiceIcon}>💭</Text>
                                <Text style={styles.choiceText}>VERDAD</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.choiceButton}
                            onPress={() => handleSelection('reto')}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={['#fa709a', '#fee140']}
                                style={styles.choiceButtonGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <Text style={styles.choiceIcon}>🎯</Text>
                                <Text style={styles.choiceText}>RETO</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            ) : (
                <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                    <View style={styles.typeIndicator}>
                        <Text style={styles.typeText}>
                            {currentType === 'verdad' ? '💭 VERDAD' : '🎯 RETO'}
                        </Text>
                    </View>

                    <View style={styles.questionCard}>
                        <Text style={styles.questionText}>{currentText}</Text>
                    </View>

                    <TouchableOpacity
                        style={styles.nextButton}
                        onPress={handleNext}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={['#667eea', '#764ba2']}
                            style={styles.nextButtonGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <Text style={styles.nextButtonText}>Siguiente</Text>
                            <Ionicons name="arrow-forward" size={20} color="#fff" style={styles.nextButtonIcon} />
                        </LinearGradient>
                    </TouchableOpacity>
                </Animated.View>
            )}
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 40,
        textAlign: 'center',
    },
    buttonsContainer: {
        width: '100%',
        gap: 20,
    },
    choiceButton: {
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 12,
    },
    choiceButtonGradient: {
        paddingVertical: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    choiceIcon: {
        fontSize: 48,
        marginBottom: 12,
    },
    choiceText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
    },
    typeIndicator: {
        marginBottom: 24,
    },
    typeText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    questionCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 32,
        width: '100%',
        minHeight: 280,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 12,
        marginBottom: 32,
    },
    questionText: {
        fontSize: 22,
        color: '#333',
        textAlign: 'center',
        lineHeight: 32,
    },
    nextButton: {
        width: '100%',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    nextButtonGradient: {
        paddingVertical: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    nextButtonIcon: {
        marginLeft: 4,
    },
    nextButtonText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
});
