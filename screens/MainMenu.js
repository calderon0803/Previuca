import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, StatusBar, Image, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';


const menuOptions = [
    {
        id: 1,
        name: 'Citas',
        description: 'Encuentra tu match perfecto',
        icon: '🌹',
        iconName: 'heart',
        color: ['#f093fb', '#f5576c'],
        route: 'Citas',
    },
    {
        id: 2,
        name: 'Juegos',
        description: 'Diversión sin límites',
        icon: '🎮',
        iconName: 'game-controller',
        color: ['#667eea', '#764ba2'],
        route: 'GamesList',
    },
    {
        id: 3,
        name: 'Ajustes',
        description: 'Personaliza tu experiencia',
        icon: '⚙️',
        iconName: 'settings',
        color: ['#4facfe', '#00f2fe'],
        route: 'Ajustes',
    },
];

function MenuCard({ option, onPress }) {
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
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
        >
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <LinearGradient
                    colors={option.color}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.card}
                >
                    <View style={styles.cardContent}>
                        <View style={styles.iconContainer}>
                            <Text style={styles.emoji}>{option.icon}</Text>
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.cardTitle}>{option.name}</Text>
                            <Text style={styles.cardDescription}>{option.description}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={28} color="rgba(255,255,255,0.8)" />
                    </View>
                </LinearGradient>
            </Animated.View>
        </TouchableOpacity>
    );
}

export default function MainMenu({ navigation }) {
    const handleMenuPress = (option) => {
        navigation.navigate(option.route);
    };

    return (
        <LinearGradient
            colors={['#f5f7fa', '#c3cfe2']}
            style={styles.container}
        >
            <SafeAreaView style={styles.safeArea}>
                <StatusBar barStyle="dark-content" />

                <View style={styles.header}>
                    <Image
                        source={require('../assets/logo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>

                <View style={styles.content}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>Bienvenido</Text>
                        <Text style={styles.subtitle}>¿Qué quieres hacer hoy?</Text>
                    </View>

                    <View style={styles.menuContainer}>
                        {menuOptions.map((option) => (
                            <MenuCard
                                key={option.id}
                                option={option}
                                onPress={() => handleMenuPress(option)}
                            />
                        ))}
                    </View>
                </View>
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
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 16,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center', // Centered logo
    },
    logo: {
        width: 120,
        height: 60,
        marginBottom: 8,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
    },
    titleContainer: {
        marginBottom: 32,
    },
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#2d3436',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 18,
        color: '#636e72',
    },
    menuContainer: {
        gap: 20,
    },
    card: {
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 24,
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    emoji: {
        fontSize: 32,
    },
    textContainer: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    cardDescription: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
    },
});
