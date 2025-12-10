import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { yoNuncaQuestions as defaultQuestions } from '../data/yoNuncaQuestions';
import QuestionEditor from '../components/QuestionEditor';

const QUESTIONS_KEY = '@yonunca_questions';

export default function YoNuncaGame({ navigation }) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [fadeAnim] = useState(new Animated.Value(1));
    const [questions, setQuestions] = useState(defaultQuestions);
    const [showEditor, setShowEditor] = useState(false);

    // Cargar preguntas guardadas al iniciar
    useEffect(() => {
        loadQuestions();
    }, []);

    const loadQuestions = async () => {
        try {
            const saved = await AsyncStorage.getItem(QUESTIONS_KEY);
            if (saved) {
                setQuestions(JSON.parse(saved));
            }
        } catch (error) {
            console.error('Error loading questions:', error);
        }
    };

    const saveQuestions = async (newQuestions) => {
        try {
            await AsyncStorage.setItem(QUESTIONS_KEY, JSON.stringify(newQuestions));
            setQuestions(newQuestions);
            setShowEditor(false);
            // Resetear índice si es necesario
            if (currentQuestionIndex >= newQuestions.length) {
                setCurrentQuestionIndex(0);
            }
        } catch (error) {
            console.error('Error saving questions:', error);
        }
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            // Animación de fade out
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start(() => {
                setCurrentQuestionIndex(currentQuestionIndex + 1);
                // Animación de fade in
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }).start();
            });
        } else {
            // Juego terminado, volver al menú
            navigation.goBack();
        }
    };

    const currentQuestion = questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === questions.length - 1;

    return (
        <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.container}
        >
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <View style={styles.counterContainer}>
                    <Text style={styles.counter}>
                        {currentQuestionIndex + 1}/{questions.length}
                    </Text>
                    <TouchableOpacity onPress={() => setShowEditor(true)} style={styles.iconButton}>
                        <Ionicons name="settings-outline" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            <QuestionEditor
                visible={showEditor}
                questions={questions}
                onSave={saveQuestions}
                onCancel={() => setShowEditor(false)}
            />

            <View style={styles.content}>
                <Animated.View style={[styles.questionCard, { opacity: fadeAnim }]}>
                    <Text style={styles.yoNunca}>Yo nunca...</Text>
                    <Text style={styles.question}>{currentQuestion}</Text>
                </Animated.View>

                <Text style={styles.instruction}>
                    {isLastQuestion ? '¡Última pregunta!' : 'Si lo has hecho, ¡bebe! 🍺'}
                </Text>
            </View>

            <TouchableOpacity
                style={styles.nextButton}
                onPress={handleNext}
                activeOpacity={0.8}
            >
                <LinearGradient
                    colors={['#f093fb', '#f5576c']}
                    style={styles.nextButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <View style={styles.nextButtonContent}>
                        <Text style={styles.nextButtonText}>
                            {isLastQuestion ? 'Finalizar' : 'Siguiente'}
                        </Text>
                    </View>
                </LinearGradient>
            </TouchableOpacity>
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
    counter: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    counterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
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
    },
    yoNunca: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#667eea',
        marginBottom: 16,
    },
    question: {
        fontSize: 24,
        color: '#333',
        textAlign: 'center',
        lineHeight: 32,
    },
    instruction: {
        marginTop: 32,
        fontSize: 18,
        color: '#fff',
        textAlign: 'center',
        opacity: 0.9,
    },
    nextButton: {
        marginHorizontal: 24,
        marginBottom: 40,
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
        alignItems: 'center',
    },
    nextButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
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
