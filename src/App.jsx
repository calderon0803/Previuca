import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import MainMenu from './views/MainMenu'
import GameModesList from './views/GameModesList'
import YoNuncaGame from './views/YoNuncaGame'
import VerdadORetoGame from './views/VerdadORetoGame'
import ReyDeCopasGame from './views/ReyDeCopasGame'
import { PlayersProvider } from './contexts/PlayersContext'

// Placeholder for game views
const Placeholder = ({ title }) => (
    <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>{title}</h1>
        <p>Próximamente</p>
    </div>
)

function App() {
    return (
        <PlayersProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<MainMenu />} />
                    <Route path="/games" element={<GameModesList />} />
                    <Route path="/citas" element={<Placeholder title="Citas" />} />
                    <Route path="/ajustes" element={<Placeholder title="Ajustes" />} />
                    <Route path="/game/yonunca" element={<YoNuncaGame />} />
                    <Route path="/game/verdadereto" element={<VerdadORetoGame />} />
                    <Route path="/game/reydecopas" element={<ReyDeCopasGame />} />
                </Routes>
            </Router>
        </PlayersProvider>
    )
}

export default App
