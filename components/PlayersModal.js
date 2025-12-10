import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { usePlayers } from '../contexts/PlayersContext';

export default function PlayersModal({ visible, onClose }) {
    const { players, addPlayer, removePlayer } = usePlayers();
    const [newPlayerName, setNewPlayerName] = useState('');

    const handleAddPlayer = () => {
        if (newPlayerName.trim()) {
            addPlayer(newPlayerName);
            setNewPlayerName('');
        }
    };

    const handleClose = () => {
        setNewPlayerName('');
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={handleClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalOverlay}
            >
                <View style={styles.modalContainer}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Jugadores</Text>
                        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                            <Ionicons name="close" size={28} color="#333" />
                        </TouchableOpacity>
                    </View>

                    {/* Contador */}
                    <View style={styles.counterContainer}>
                        <Text style={styles.counterText}>
                            {players.length} {players.length === 1 ? 'jugador' : 'jugadores'}
                        </Text>
                    </View>

                    {/* Lista de jugadores */}
                    <ScrollView style={styles.playersList} showsVerticalScrollIndicator={false}>
                        {players.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyIcon}>👥</Text>
                                <Text style={styles.emptyText}>No hay jugadores</Text>
                                <Text style={styles.emptySubtext}>Agrega jugadores para comenzar</Text>
                            </View>
                        ) : (
                            players.map((player) => (
                                <View key={player.id} style={styles.playerItem}>
                                    <View style={styles.playerInfo}>
                                        <Text style={styles.playerIcon}>👤</Text>
                                        <Text style={styles.playerName}>{player.name}</Text>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => removePlayer(player.id)}
                                        style={styles.deleteButton}
                                    >
                                        <Ionicons name="trash-outline" size={20} color="#ff6b6b" />
                                    </TouchableOpacity>
                                </View>
                            ))
                        )}
                    </ScrollView>

                    {/* Input para nuevo jugador */}
                    <View style={styles.addSection}>
                        <TextInput
                            style={styles.input}
                            placeholder="Nombre del jugador"
                            value={newPlayerName}
                            onChangeText={setNewPlayerName}
                            onSubmitEditing={handleAddPlayer}
                            returnKeyType="done"
                        />
                        <TouchableOpacity onPress={handleAddPlayer} style={styles.addButton}>
                            <Ionicons name="add-circle" size={32} color="#667eea" />
                        </TouchableOpacity>
                    </View>

                    {/* Botón cerrar */}
                    <TouchableOpacity onPress={handleClose} style={styles.doneButton}>
                        <LinearGradient
                            colors={['#667eea', '#764ba2']}
                            style={styles.doneButtonGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <Text style={styles.doneButtonText}>Listo</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderRadius: 24,
        width: '90%',
        maxWidth: 500,
        maxHeight: '80%',
        padding: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    closeButton: {
        padding: 4,
    },
    counterContainer: {
        marginBottom: 16,
    },
    counterText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '600',
    },
    playersList: {
        maxHeight: 300,
        marginBottom: 16,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 12,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#666',
    },
    playerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#f5f5f5',
        padding: 12,
        borderRadius: 12,
        marginBottom: 8,
    },
    playerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    playerIcon: {
        fontSize: 20,
        marginRight: 12,
    },
    playerName: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    deleteButton: {
        padding: 8,
    },
    addSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 8,
    },
    input: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
        color: '#333',
    },
    addButton: {
        padding: 4,
    },
    doneButton: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    doneButtonGradient: {
        padding: 16,
        alignItems: 'center',
    },
    doneButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
});
