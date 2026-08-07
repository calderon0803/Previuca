import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import styled from 'styled-components';
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

import { FlechazoProvider, useFlechazo } from './contexts/FlechazoContext';
import { EventProvider } from './contexts/EventContext';
import { AdminProvider, useAdmin } from './contexts/AdminContext';
import { PenasProvider } from './contexts/PenasContext';
import FlechazoLogin from './views/FlechazoLogin';
import FlechazoList from './views/FlechazoList';
import FlechazoAdmirers from './views/FlechazoAdmirers';
import InstagramVerification from './views/InstagramVerification';
import Settings from './views/Settings';
import EventsHub from './views/EventsHub';
import PenasList from './views/PenasList';
import CreatePena from './views/CreatePena';
import PenaDetail from './views/PenaDetail';
import CreateEvent from './views/CreateEvent';
import StampAlbum from './views/StampAlbum';
import ScanStamp from './views/ScanStamp';

const LoadingScreenWrap = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text.primary};
`;

const LoadingScreen = () => (
    <LoadingScreenWrap>Cargando...</LoadingScreenWrap>
);

// Protected Route specific for Flechazo
const FlechazoRoute = ({ children }) => {
    const { user, loading } = useFlechazo();

    if (loading) return <LoadingScreen />;

    return user ? children : <Navigate to="/flechazo" replace />;
};

// Protected Route specific for admin-only screens
const AdminRoute = ({ children }) => {
    const { user, loading: userLoading } = useFlechazo();
    const { isAdmin, loading: adminLoading } = useAdmin();

    if (userLoading || adminLoading) return <LoadingScreen />;

    return user && isAdmin ? children : <Navigate to="/" replace />;
};

function App() {
    const [loading, setLoading] = React.useState(true);

    return (
        <ThemeProvider theme={theme}>
            <GlobalStyles />
            {loading && <SplashScreen onFinish={() => setLoading(false)} />}
            <FlechazoProvider>
                <EventProvider>
                <AdminProvider>
                <PenasProvider>
                <PlayersProvider>
                    <BrowserRouter>
                        <Routes>
                            <Route path="/" element={<MainMenu />} />

                            {/* Flechazo Feature Routes — login/verificación son globales (no dependen
                                de un evento), la lista de flechazos sí está enlazada a uno concreto */}
                            <Route path="/flechazo" element={<FlechazoLogin />} />
                            <Route path="/eventos/:eventId/flechazo" element={<FlechazoLogin />} />
                            <Route
                                path="/eventos/:eventId/mis-flechazos"
                                element={
                                    <FlechazoRoute>
                                        <FlechazoList />
                                    </FlechazoRoute>
                                }
                            />
                            <Route
                                path="/eventos/:eventId/flechazo/admiradores"
                                element={
                                    <FlechazoRoute>
                                        <FlechazoAdmirers />
                                    </FlechazoRoute>
                                }
                            />
                            <Route
                                path="/instagram-verification"
                                element={
                                    <FlechazoRoute>
                                        <InstagramVerification />
                                    </FlechazoRoute>
                                }
                            />
                            <Route
                                path="/eventos/:eventId/instagram-verification"
                                element={
                                    <FlechazoRoute>
                                        <InstagramVerification />
                                    </FlechazoRoute>
                                }
                            />

                            {/* Eventos Feature Routes */}
                            <Route
                                path="/eventos/nuevo"
                                element={
                                    <AdminRoute>
                                        <CreateEvent />
                                    </AdminRoute>
                                }
                            />
                            <Route path="/eventos/:eventId" element={<EventsHub />} />
                            <Route path="/eventos/:eventId/penas" element={<PenasList />} />
                            <Route path="/eventos/:eventId/penas/nueva" element={<CreatePena />} />
                            <Route path="/eventos/:eventId/penas/:penaId" element={<PenaDetail />} />
                            <Route
                                path="/eventos/:eventId/album"
                                element={
                                    <FlechazoRoute>
                                        <StampAlbum />
                                    </FlechazoRoute>
                                }
                            />
                            <Route
                                path="/eventos/:eventId/album/escanear"
                                element={
                                    <FlechazoRoute>
                                        <ScanStamp />
                                    </FlechazoRoute>
                                }
                            />

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
                </AdminProvider>
                </EventProvider>
            </FlechazoProvider>
        </ThemeProvider>
    );
}

export default App;
