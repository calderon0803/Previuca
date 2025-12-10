import React, { useState, useEffect } from 'react';
import { Animated } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PlayersProvider } from './contexts/PlayersContext';
import SplashScreen from './SplashScreen';
import MainMenu from './screens/MainMenu';
import GameModesList from './screens/GameModesList';
import CitasScreen from './screens/CitasScreen';
import AjustesScreen from './screens/AjustesScreen';
import YoNuncaGame from './screens/YoNuncaGame';
import VerdadORetoGame from './screens/VerdadORetoGame';
import ReyDeCopasGame from './screens/ReyDeCopasGame';

const Stack = createNativeStackNavigator();

function MainNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Home" component={MainMenu} />
      <Stack.Screen name="GamesList" component={GameModesList} />
      <Stack.Screen name="Citas" component={CitasScreen} />
      <Stack.Screen name="Ajustes" component={AjustesScreen} />
      <Stack.Screen name="YoNunca" component={YoNuncaGame} />
      <Stack.Screen name="VerdadOReto" component={VerdadORetoGame} />
      <Stack.Screen name="ReyDeCopas" component={ReyDeCopasGame} />
    </Stack.Navigator>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    if (!showSplash) {
      // Animación de fade in cuando aparece la pantalla principal
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }
  }, [showSplash]);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <PlayersProvider>
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <NavigationContainer>
          <MainNavigator />
        </NavigationContainer>
      </Animated.View>
    </PlayersProvider>
  );
}
