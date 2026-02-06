import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { IoArrowBack, IoPeople } from 'react-icons/io5';
import { usePlayers } from '../contexts/PlayersContext';
import GameModeCard from '../components/GameModeCard';
import PlayersModal from '../components/PlayersModal';

const gameModes = [
    {
        id: 1,
        name: 'Yo Nunca',
        description: 'Confiesa lo que nunca has hecho',
        icon: '🤫',
    },
    {
        id: 2,
        name: 'Medusa',
        description: 'No cruces la mirada',
        icon: '👀',
    },
    {
        id: 3,
        name: 'Rey de Copas',
        description: 'Juego de cartas legendario',
        icon: '👑',
    },
    {
        id: 4,
        name: 'Pico Palo',
        description: 'Adivina la carta correcta',
        icon: '🃏',
    },
    {
        id: 6,
        name: 'Ruleta',
        description: 'Gira y prueba tu suerte',
        icon: '🎰',
    },
    {
        id: 7,
        name: 'Impostor',
        description: '¿Quién es el infiltrado?',
        icon: '🕵️‍♂️',
    },
    {
        id: 8,
        name: 'Dados de Beber',
        description: 'Tira los dados y bebe',
        icon: '🎲',
    },
    {
        id: 9,
        name: 'Illuminati',
        description: 'Escala la pirámide de cartas',
        icon: '🔺',
    },
    {
        id: 10,
        name: 'Asesino',
        description: 'Descubre quién es el asesino',
        icon: '🔪',
    },
];

const Container = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: rgba(15, 1, 9, 0.8); // Theme background with opacity
  backdrop-filter: blur(10px);
  border-bottom: 2px solid ${({ theme }) => theme.colors.secondary};
  position: sticky;
  top: 0;
  z-index: 10;
`;

const HeaderTitle = styled.h1`
  font-size: 20px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const IconButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.surface};
  border: 2px solid ${({ theme }) => theme.colors.secondary};
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text.primary};
  position: relative;
  transition: background 0.2s, border-color 0.2s;
  
  &:hover {
    background: ${({ theme }) => theme.colors.primary};
  }
`;

const Badge = styled.div`
  position: absolute;
  top: -8px;
  right: -8px;
  background: ${({ theme }) => theme.colors.secondary};
  border-radius: 10px;
  min-width: 20px;
  height: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 4px;
`;

const BadgeText = styled.span`
  color: #000;
  font-size: 12px;
  font-weight: bold;
`;

const ScrollContent = styled.div`
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  width: 100%;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  align-content: start;

  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

export default function GameModesList() {
    const navigate = useNavigate();
    const { players } = usePlayers();

    const [showPlayersModal, setShowPlayersModal] = React.useState(false);

    const handleGamePress = (game, isLocked) => {
        if (isLocked) {
            setShowPlayersModal(true);
            return;
        }

        let route = '';
        if (game.id === 1) route = '/game/yonunca';
        else if (game.id === 2) route = '/game/medusa';
        else if (game.id === 3) route = '/game/reydecopas';
        else if (game.id === 4) route = '/game/picopalo';
        else if (game.id === 6) route = '/game/ruleta';
        else if (game.id === 7) route = '/game/impostor';
        else if (game.id === 8) route = '/game/dados';
        else if (game.id === 9) route = '/game/illuminati';
        else if (game.id === 10) route = '/game/asesino';

        if (route) navigate(route);
        else alert('Próximamente');
    };

    const isGameLocked = (id) => {
        // Yo Nunca (1) and Medusa (2) are always allowed
        if (id === 1 || id === 2) return false;
        // Other games are locked if no players
        return players.length === 0;
    };

    return (
        <Container>
            <Header>
                <IconButton onClick={() => navigate('/')}>
                    <IoArrowBack size={24} />
                </IconButton>
                <HeaderTitle>Juegos</HeaderTitle>
                <IconButton onClick={() => setShowPlayersModal(true)}>
                    <IoPeople size={24} />
                    {players.length > 0 && (
                        <Badge>
                            <BadgeText>{players.length}</BadgeText>
                        </Badge>
                    )}
                </IconButton>
            </Header>
            <ScrollContent>
                {gameModes.map(game => {
                    const locked = isGameLocked(game.id);
                    return (
                        <GameModeCard
                            key={game.id}
                            game={game}
                            isLocked={locked}
                            onClick={() => handleGamePress(game, locked)}
                        />
                    );
                })}
            </ScrollContent>
            <PlayersModal
                visible={showPlayersModal}
                onClose={() => setShowPlayersModal(false)}
            />
        </Container>
    );
}


