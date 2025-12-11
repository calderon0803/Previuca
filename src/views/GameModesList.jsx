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
        color: ['#667eea', '#764ba2'],
    },
    {
        id: 2,
        name: 'Verdad o Reto',
        description: 'Clásico de preguntas y desafíos',
        icon: '🎭',
        color: ['#f093fb', '#f5576c'],
    },
    {
        id: 3,
        name: 'Rey de Copas',
        description: 'Juego de cartas legendario',
        icon: '👑',
        color: ['#4facfe', '#00f2fe'],
    },
    {
        id: 4,
        name: 'Pico Palo',
        description: 'Adivina la carta correcta',
        icon: '🃏',
        color: ['#43e97b', '#38f9d7'],
    },
    {
        id: 5,
        name: 'Medusa',
        description: 'No cruces la mirada',
        icon: '👀',
        color: ['#fa709a', '#fee140'],
    },
    {
        id: 6,
        name: 'Ruleta de Shots',
        description: 'Gira y prueba tu suerte',
        icon: '🎰',
        color: ['#30cfd0', '#330867'],
    },
    {
        id: 7,
        name: 'Preguntas Picantes',
        description: 'Responde sin filtros',
        icon: '🔥',
        color: ['#ff6b6b', '#ee5a6f'],
    },
    {
        id: 8,
        name: 'Dados de Beber',
        description: 'Tira los dados y bebe',
        icon: '🎲',
        color: ['#a8edea', '#fed6e3'],
    },
];

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const HeaderTitle = styled.h1`
  font-size: 20px;
  font-weight: bold;
  color: #fff;
  margin: 0;
`;

const IconButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(255,255,255,0.2);
  border: none;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  color: #fff;
  position: relative;
  
  &:hover {
    background: rgba(255,255,255,0.3);
  }
`;

const Badge = styled.div`
  position: absolute;
  top: -4px;
  right: -4px;
  background: #ff6b6b;
  border-radius: 10px;
  min-width: 20px;
  height: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 4px;
`;

const BadgeText = styled.span`
  color: #fff;
  font-size: 12px;
  font-weight: bold;
`;

const ScrollContent = styled.div`
  flex: 1;
  padding: 0 24px 24px 24px;
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

