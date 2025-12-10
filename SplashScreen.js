import React, { useEffect } from 'react';
import { StyleSheet, View, Image, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function SplashScreen({ onFinish }) {
    const fadeAnim = new Animated.Value(0);

    useEffect(() => {
        // Animación de fade in del logo
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();

        // Temporizador: espera 2.5s, luego fade out de 500ms
        const timer = setTimeout(() => {
            // Animación de fade out antes de terminar
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }).start(() => {
                // Llamar a onFinish después de que termine el fade out
                onFinish();
            });
        }, 2500);

        return () => clearTimeout(timer);
    }, []);

    return (
        <LinearGradient
            colors={['#667eea', '#764ba2', '#f093fb']}
            style={styles.container}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <Animated.View style={[styles.logoContainer, { opacity: fadeAnim }]}>
                <Image
                    source={require('./assets/logo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </Animated.View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: 250,
        height: 250,
    },
});
