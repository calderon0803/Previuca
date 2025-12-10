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

export default function QuestionEditor({ visible, questions, onSave, onCancel }) {
    const [editedQuestions, setEditedQuestions] = useState([...questions]);
    const [newQuestion, setNewQuestion] = useState('');

    const handleAddQuestion = () => {
        if (newQuestion.trim()) {
            setEditedQuestions([...editedQuestions, newQuestion.trim()]);
            setNewQuestion('');
        }
    };

    const handleDeleteQuestion = (index) => {
        const updated = editedQuestions.filter((_, i) => i !== index);
        setEditedQuestions(updated);
    };

    const handleSave = () => {
        onSave(editedQuestions);
    };

    const handleCancel = () => {
        setEditedQuestions([...questions]);
        setNewQuestion('');
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
                        <Text style={styles.title}>Editar Preguntas</Text>
                        <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
                            <Ionicons name="close" size={28} color="#333" />
                        </TouchableOpacity>
                    </View>

                    {/* Lista de preguntas */}
                    <ScrollView style={styles.questionsList} showsVerticalScrollIndicator={false}>
                        {editedQuestions.map((question, index) => (
                            <View key={index} style={styles.questionItem}>
                                <Text style={styles.questionText} numberOfLines={2}>
                                    {index + 1}. {question}
                                </Text>
                                <TouchableOpacity
                                    onPress={() => handleDeleteQuestion(index)}
                                    style={styles.deleteButton}
                                >
                                    <Ionicons name="trash-outline" size={20} color="#ff6b6b" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>

                    {/* Input para nueva pregunta */}
                    <View style={styles.addSection}>
                        <TextInput
                            style={styles.input}
                            placeholder="Yo nunca..."
                            value={newQuestion}
                            onChangeText={setNewQuestion}
                            onSubmitEditing={handleAddQuestion}
                            returnKeyType="done"
                        />
                        <TouchableOpacity onPress={handleAddQuestion} style={styles.addButton}>
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
                                colors={['#667eea', '#764ba2']}
                                style={styles.saveButtonGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <Text style={styles.saveButtonText}>
                                    Guardar ({editedQuestions.length})
                                </Text>
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
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    closeButton: {
        padding: 4,
    },
    questionsList: {
        maxHeight: 300,
        marginBottom: 16,
    },
    questionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#f5f5f5',
        padding: 12,
        borderRadius: 12,
        marginBottom: 8,
    },
    questionText: {
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
