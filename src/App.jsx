import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { theme } from './styles/theme';
import { GlobalStyles } from './styles/GlobalStyles';
import { PlayersProvider } from './contexts/PlayersContext';

// Views
import MainMenu from './views/MainMenu';
import GameModesList from './views/GameModesList';
import YoNuncaGame from './views/YoNuncaGame';
import VerdadORetoGame from './views/VerdadORetoGame';
import ReyDeCopasGame from './views/ReyDeCopasGame';

// Placeholder for missing views if any
const Placeholder = ({ title }) => (
    <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>{title}</h1>
        <p>Próximamente</p>
    </div>
);

import SplashScreen from './components/SplashScreen';

import { CrushProvider, useCrush } from './contexts/CrushContext';
import CrushLogin from './views/CrushLogin';
import CrushList from './views/CrushList';
import InstagramVerification from './views/InstagramVerification';

// Protected Route specific for Crush
const CrushRoute = ({ children }) => {
    const { user, loading } = useCrush();
    
    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '100vh',
                color: '#fff'
            }}>
                Cargando...
            </div>
        );
    }
    
    return user ? children : <Navigate to="/match" replace />;
};

function App() {
    const [loading, setLoading] = React.useState(true);

    return (
        <ThemeProvider theme={theme}>
            <GlobalStyles />
            {loading && <SplashScreen onFinish={() => setLoading(false)} />}
            <CrushProvider>
                <PlayersProvider>
                    <BrowserRouter>
                        <Routes>
                            <Route path="/" element={<MainMenu />} />

                            {/* Crush Feature Routes */}
                            <Route path="/crush" element={<CrushLogin />} />
                            <Route
                                path="/my-crushes"
                                element={
                                    <CrushRoute>
                                        <CrushList />
                                    </CrushRoute>
                                }
                            />
                            <Route
                                path="/instagram-verification"
                                element={
                                    <CrushRoute>
                                        <InstagramVerification />
                                    </CrushRoute>
                                }
                            />

                            <Route path="/games" element={<GameModesList />} />
                            <Route path="/ajustes" element={<Placeholder title="Ajustes" />} />

                            {/* Game Routes */}
                            <Route path="/game/yonunca" element={<YoNuncaGame />} />
                            <Route path="/game/verdadereto" element={<VerdadORetoGame />} />
                            <Route path="/game/reydecopas" element={<ReyDeCopasGame />} />
                            <Route path="/games/yo-nunca" element={<YoNuncaGame />} />
                            <Route path="/games/verdad-o-reto" element={<VerdadORetoGame />} />
                            <Route path="/games/rey-de-copas" element={<ReyDeCopasGame />} />

                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </BrowserRouter>
                </PlayersProvider>
            </CrushProvider>
        </ThemeProvider>
    );
}

export default App;
