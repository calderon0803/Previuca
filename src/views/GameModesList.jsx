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
        name: 'Verdad o Reto',
        description: 'Clásico de preguntas y desafíos',
        icon: '🎭',
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
        id: 5,
        name: 'Medusa',
        description: 'No cruces la mirada',
        icon: '👀',
    },
    {
        id: 6,
        name: 'Ruleta de Shots',
        description: 'Gira y prueba tu suerte',
        icon: '🎰',
    },
    {
        id: 7,
        name: 'Preguntas Picantes',
        description: 'Responde sin filtros',
        icon: '🔥',
    },
    {
        id: 8,
        name: 'Dados de Beber',
        description: 'Tira los dados y bebe',
        icon: '🎲',
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
  background-color: ${({ theme }) => theme.colors.background}; // Match App BG
  border-bottom: 2px solid ${({ theme }) => theme.colors.border};
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
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid ${({ theme }) => theme.colors.border};
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text.primary};
  position: relative;
  transition: background 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
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
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;

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

    const handleGamePress = (game) => {
        let route = '';
        if (game.id === 1) route = '/game/yonunca';
        else if (game.id === 2) route = '/game/verdadereto';
        else if (game.id === 3) route = '/game/reydecopas';

        if (route) navigate(route);
        else alert('Próximamente');
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
                {gameModes.map(game => (
                    <GameModeCard
                        key={game.id}
                        game={game}
                        onClick={() => handleGamePress(game)}
                    />
                ))}
            </ScrollContent>
            <PlayersModal
                visible={showPlayersModal}
                onClose={() => setShowPlayersModal(false)}
            />
        </Container>
    );
}


