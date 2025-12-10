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

export default function VerdadORetoEditor({ visible, verdades, retos, onSave, onCancel }) {
    const [editedVerdades, setEditedVerdades] = useState([...verdades]);
    const [editedRetos, setEditedRetos] = useState([...retos]);
    const [newVerdad, setNewVerdad] = useState('');
    const [newReto, setNewReto] = useState('');
    const [activeTab, setActiveTab] = useState('verdades'); // 'verdades' o 'retos'

    const handleAddVerdad = () => {
        if (newVerdad.trim()) {
            setEditedVerdades([...editedVerdades, newVerdad.trim()]);
            setNewVerdad('');
        }
    };

    const handleAddReto = () => {
        if (newReto.trim()) {
            setEditedRetos([...editedRetos, newReto.trim()]);
            setNewReto('');
        }
    };

    const handleDeleteVerdad = (index) => {
        const updated = editedVerdades.filter((_, i) => i !== index);
        setEditedVerdades(updated);
    };

    const handleDeleteReto = (index) => {
        const updated = editedRetos.filter((_, i) => i !== index);
        setEditedRetos(updated);
    };

    const handleSave = () => {
        onSave(editedVerdades, editedRetos);
    };

    const handleCancel = () => {
        setEditedVerdades([...verdades]);
        setEditedRetos([...retos]);
        setNewVerdad('');
        setNewReto('');
        onCancel();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={handleCancel}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalOverlay}
            >
                <View style={styles.modalContainer}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Editar Preguntas y Retos</Text>
                        <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
                            <Ionicons name="close" size={28} color="#333" />
                        </TouchableOpacity>
                    </View>

                    {/* Tabs */}
                    <View style={styles.tabs}>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'verdades' && styles.tabActive]}
                            onPress={() => setActiveTab('verdades')}
                        >
                            <Text style={[styles.tabText, activeTab === 'verdades' && styles.tabTextActive]}>
                                💭 Verdades ({editedVerdades.length})
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'retos' && styles.tabActive]}
                            onPress={() => setActiveTab('retos')}
                        >
                            <Text style={[styles.tabText, activeTab === 'retos' && styles.tabTextActive]}>
                                🎯 Retos ({editedRetos.length})
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Lista de items */}
                    <ScrollView style={styles.itemsList} showsVerticalScrollIndicator={false}>
                        {activeTab === 'verdades' ? (
                            editedVerdades.map((verdad, index) => (
                                <View key={index} style={styles.item}>
                                    <Text style={styles.itemText} numberOfLines={2}>
                                        {index + 1}. {verdad}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => handleDeleteVerdad(index)}
                                        style={styles.deleteButton}
                                    >
                                        <Ionicons name="trash-outline" size={20} color="#ff6b6b" />
                                    </TouchableOpacity>
                                </View>
                            ))
                        ) : (
                            editedRetos.map((reto, index) => (
                                <View key={index} style={styles.item}>
                                    <Text style={styles.itemText} numberOfLines={2}>
                                        {index + 1}. {reto}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => handleDeleteReto(index)}
                                        style={styles.deleteButton}
                                    >
                                        <Ionicons name="trash-outline" size={20} color="#ff6b6b" />
                                    </TouchableOpacity>
                                </View>
                            ))
                        )}
                    </ScrollView>

                    {/* Input para nuevo item */}
                    <View style={styles.addSection}>
                        <TextInput
                            style={styles.input}
                            placeholder={activeTab === 'verdades' ? 'Nueva verdad...' : 'Nuevo reto...'}
                            value={activeTab === 'verdades' ? newVerdad : newReto}
                            onChangeText={activeTab === 'verdades' ? setNewVerdad : setNewReto}
                            onSubmitEditing={activeTab === 'verdades' ? handleAddVerdad : handleAddReto}
                            returnKeyType="done"
                        />
                        <TouchableOpacity
                            onPress={activeTab === 'verdades' ? handleAddVerdad : handleAddReto}
                            style={styles.addButton}
                        >
                            <Ionicons name="add-circle" size={32} color="#667eea" />
                        </TouchableOpacity>
                    </View>

                    {/* Botones de acción */}
                    <View style={styles.actions}>
                        <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
                            <Text style={styles.cancelButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                            <LinearGradient
                                colors={['#f093fb', '#f5576c']}
                                style={styles.saveButtonGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <Text style={styles.saveButtonText}>Guardar</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
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
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    closeButton: {
        padding: 4,
    },
    tabs: {
        flexDirection: 'row',
        marginBottom: 16,
        gap: 8,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
    },
    tabActive: {
        backgroundColor: '#667eea',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    tabTextActive: {
        color: '#fff',
    },
    itemsList: {
        maxHeight: 250,
        marginBottom: 16,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#f5f5f5',
        padding: 12,
        borderRadius: 12,
        marginBottom: 8,
    },
    itemText: {
        flex: 1,
        fontSize: 14,
        color: '#333',
        marginRight: 8,
    },
    deleteButton: {
        padding: 8,
    },
    addSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
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
    actions: {
        flexDirection: 'row',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
    saveButton: {
        flex: 1,
        borderRadius: 12,
        overflow: 'hidden',
    },
    saveButtonGradient: {
        padding: 16,
        alignItems: 'center',
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
});
