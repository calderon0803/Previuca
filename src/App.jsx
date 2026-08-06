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
import ReyDeCopasGame from './views/ReyDeCopasGame';
import PicoPaloGame from './views/PicoPaloGame';
import MedusaGame from './views/MedusaGame';
import RouletteGame from './views/RouletteGame';
import DiceGame from './views/DiceGame';
import ImpostorGame from './views/ImpostorGame';
import IlluminatiGame from './views/IlluminatiGame';
import AsesinoGame from './views/AsesinoGame';
import TrazoTragoGame from './views/TrazoTragoGame';

// Placeholder for missing views if any
const Placeholder = ({ title }) => (
    <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>{title}</h1>
        <p>Próximamente</p>
    </div>
);

import SplashScreen from './components/SplashScreen';

import { CrushProvider, useCrush } from './contexts/CrushContext';
import { EventProvider } from './contexts/EventContext';
import { PenasProvider } from './contexts/PenasContext';
import CrushLogin from './views/CrushLogin';
import CrushList from './views/CrushList';
import InstagramVerification from './views/InstagramVerification';
import Settings from './views/Settings';
import EventsHub from './views/EventsHub';
import PenasList from './views/PenasList';
import CreatePena from './views/CreatePena';
import PenaDetail from './views/PenaDetail';

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

    return user ? children : <Navigate to="/crush" replace />;
};

function App() {
    const [loading, setLoading] = React.useState(true);

    return (
        <ThemeProvider theme={theme}>
            <GlobalStyles />
            {loading && <SplashScreen onFinish={() => setLoading(false)} />}
            <CrushProvider>
                <EventProvider>
                <PenasProvider>
                <PlayersProvider>
                    <BrowserRouter>
                        <Routes>
                            <Route path="/" element={<MainMenu />} />

                            {/* Crush Feature Routes (nested under Eventos) */}
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

                            {/* Eventos Feature Routes */}
                            <Route path="/eventos" element={<EventsHub />} />
                            <Route path="/eventos/penas" element={<PenasList />} />
                            <Route path="/eventos/penas/nueva" element={<CreatePena />} />
                            <Route path="/eventos/penas/:id" element={<PenaDetail />} />

                            <Route path="/games" element={<GameModesList />} />
                            <Route path="/ajustes" element={<Settings />} />

                            {/* Game Routes */}
                            <Route path="/game/yonunca" element={<YoNuncaGame />} />
                            <Route path="/game/reydecopas" element={<ReyDeCopasGame />} />
                            <Route path="/game/picopalo" element={<PicoPaloGame />} />
                            <Route path="/game/medusa" element={<MedusaGame />} />
                            <Route path="/game/ruleta" element={<RouletteGame />} />
                            <Route path="/game/dados" element={<DiceGame />} />
                            <Route path="/game/impostor" element={<ImpostorGame />} />
                            <Route path="/game/illuminati" element={<IlluminatiGame />} />
                            <Route path="/game/asesino" element={<AsesinoGame />} />
                            <Route path="/game/trazotrago" element={<TrazoTragoGame />} />
                            <Route path="/footer-demo" element={<Placeholder title="Footer Demo" />} />
                            <Route path="/games/yo-nunca" element={<YoNuncaGame />} />
                            <Route path="/games/rey-de-copas" element={<ReyDeCopasGame />} />
                            <Route path="/games/medusa" element={<MedusaGame />} />
                            <Route path="/games/ruleta" element={<RouletteGame />} />
                            <Route path="/games/dados" element={<DiceGame />} />
                            <Route path="/games/impostor" element={<ImpostorGame />} />
                            <Route path="/games/illuminati" element={<IlluminatiGame />} />
                            <Route path="/games/asesino" element={<AsesinoGame />} />
                            <Route path="/games/trazotrago" element={<TrazoTragoGame />} />

                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </BrowserRouter>
                </PlayersProvider>
                </PenasProvider>
                </EventProvider>
            </CrushProvider>
        </ThemeProvider>
    );
}

export default App;
