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

import { DatesProvider, useDates } from './contexts/DatesContext';
import DatesLogin from './views/DatesLogin';
import DatesList from './views/DatesList';

// Protected Route specific for Dates
const DatesRoute = ({ children }) => {
    const { user } = useDates();
    return user ? children : <Navigate to="/citas" replace />;
};

function App() {
    const [loading, setLoading] = React.useState(true);

    return (
        <ThemeProvider theme={theme}>
            <GlobalStyles />
            {loading && <SplashScreen onFinish={() => setLoading(false)} />}
            <DatesProvider>
                <PlayersProvider>
                    <BrowserRouter>
                        <Routes>
                            <Route path="/" element={<MainMenu />} />

                            {/* Dates Feature Routes */}
                            <Route path="/citas" element={<DatesLogin />} />
                            <Route
                                path="/my-dates"
                                element={
                                    <DatesRoute>
                                        <DatesList />
                                    </DatesRoute>
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
            </DatesProvider>
        </ThemeProvider>
    );
}

export default App;
