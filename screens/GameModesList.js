import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, StatusBar, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { usePlayers } from '../contexts/PlayersContext';
import GameModeCard from '../components/GameModeCard';
import PlayersModal from '../components/PlayersModal';

const gameModes = [
    {
        id: 1,
        name: 'Yo Nunca',
        description: 'Confiesa lo que nunca has hecho',
        icon: '🤫',
        color: ['#667eea', '#764ba2'],
    },
    {
        id: 2,
        name: 'Verdad o Reto',
        description: 'Clásico de preguntas y desafíos',
        icon: '🎭',
        color: ['#f093fb', '#f5576c'],
    },
    {
        id: 3,
        name: 'Rey de Copas',
        description: 'Juego de cartas legendario',
        icon: '👑',
        color: ['#4facfe', '#00f2fe'],
    },
    {
        id: 4,
        name: 'Pico Palo',
        description: 'Adivina la carta correcta',
        icon: '🃏',
        color: ['#43e97b', '#38f9d7'],
    },
    {
        id: 5,
        name: 'Medusa',
        description: 'No cruces la mirada',
        icon: '👀',
        color: ['#fa709a', '#fee140'],
    },
    {
        id: 6,
        name: 'Ruleta de Shots',
        description: 'Gira y prueba tu suerte',
        icon: '🎰',
        color: ['#30cfd0', '#330867'],
    },
    {
        id: 7,
        name: 'Preguntas Picantes',
        description: 'Responde sin filtros',
        icon: '🔥',
        color: ['#ff6b6b', '#ee5a6f'],
    },
    {
        id: 8,
        name: 'Dados de Beber',
        description: 'Tira los dados y bebe',
        icon: '🎲',
        color: ['#a8edea', '#fed6e3'],
    },
];

export default function GameModesList({ navigation }) {
    const { players } = usePlayers();
    const [showPlayersModal, setShowPlayersModal] = useState(false);

    const handleGamePress = (game) => {
        // Navegar a la pantalla del juego según el ID
        if (game.id === 1) {
            navigation.navigate('YoNunca');
        } else if (game.id === 2) {
            navigation.navigate('VerdadOReto');
        } else if (game.id === 3) {
            navigation.navigate('ReyDeCopas');
        }
        // TODO: Agregar navegación para otros juegos
    };

    return (
        <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.container}
        >
            <SafeAreaView style={styles.safeArea}>
                <StatusBar barStyle="light-content" />

                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Juegos</Text>
                    <TouchableOpacity
                        style={styles.playersButton}
                        onPress={() => setShowPlayersModal(true)}
                    >
                        <Ionicons name="people" size={24} color="#fff" />
                        {players.length > 0 && (
                            <View style={styles.playersBadge}>
                                <Text style={styles.playersBadgeText}>{players.length}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                <PlayersModal
                    visible={showPlayersModal}
                    onClose={() => setShowPlayersModal(false)}
                />

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {gameModes.map((game) => (
                        <GameModeCard
                            key={game.id}
                            game={game}
                            onPress={() => handleGamePress(game)}
                        />
                    ))}
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    playersButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    playersBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#ff6b6b',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    playersBadgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 24,
    },
});
