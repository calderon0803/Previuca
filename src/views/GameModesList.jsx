import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { IoPeople } from 'react-icons/io5';
import {
    EyeOff, Eye, Crown, Spade, Disc3, UserSearch,
    Dice5, Triangle, Skull, Palette,
} from 'lucide-react';
import { usePlayers } from '../contexts/PlayersContext';
import GameModeCard from '../components/GameModeCard';
import PlayersModal from '../components/PlayersModal';
import PageHeader from '../components/ui/PageHeader';
import IconButton from '../components/ui/IconButton';

const gameModes = [
    {
        id: 1,
        name: 'Yo Nunca',
        description: 'Confiesa lo que nunca has hecho',
        icon: EyeOff,
    },
    {
        id: 2,
        name: 'Medusa',
        description: 'No cruces la mirada',
        icon: Eye,
    },
    {
        id: 3,
        name: 'Rey de Copas',
        description: 'Juego de cartas legendario',
        icon: Crown,
    },
    {
        id: 4,
        name: 'Pico Palo',
        description: 'Adivina la carta correcta',
        icon: Spade,
    },
    {
        id: 6,
        name: 'Ruleta',
        description: 'Gira y prueba tu suerte',
        icon: Disc3,
    },
    {
        id: 7,
        name: 'Impostor',
        description: '¿Quién es el infiltrado?',
        icon: UserSearch,
    },
    {
        id: 8,
        name: 'Dados de Beber',
        description: 'Tira los dados y bebe',
        icon: Dice5,
    },
    {
        id: 9,
        name: 'Illuminati',
        description: 'Escala la pirámide de cartas',
        icon: Triangle,
    },
    {
        id: 10,
        name: 'Asesino',
        description: 'Descubre quién es el asesino',
        icon: Skull,
    },
    {
        id: 11,
        name: 'Trazo & Trago',
        description: 'Dibuja y adivina. El que pierda, bebe.',
        icon: Palette,
    },
];

const Container = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
  display: flex;
  flex-direction: column;
`;

const ScrollContent = styled.div`
  flex: 1;
  padding: ${({ theme }) => theme.spacing(5)};
  overflow-y: auto;
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
  box-sizing: border-box;

  @media (min-width: ${({ theme }) => theme.breakpoints.tablet}) {
    padding: ${({ theme }) => theme.spacing(6)};
  }

  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

const SectionLabel = styled.div`
  display: flex;
  align-items: baseline;
  gap: ${({ theme }) => theme.spacing(3)};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

const SectionEyebrow = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  text-transform: uppercase;
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.wide};

  &::before {
    content: '';
    display: inline-block;
    width: 12px;
    height: 2px;
    margin-right: ${({ theme }) => theme.spacing(2)};
    background: ${({ theme }) => theme.colors.primary};
    vertical-align: middle;
  }
`;

const SectionCount = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing(3)};

  @media (min-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: repeat(3, 1fr);
    gap: ${({ theme }) => theme.spacing(4)};
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.desktop}) {
    grid-template-columns: repeat(4, 1fr);
  }
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
        else if (game.id === 11) route = '/game/trazotrago';

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
            <PageHeader
                title="Juegos"
                onBack={() => navigate('/')}
                rightAction={
                    <IconButton
                        variant="ghost"
                        badge={players.length}
                        onClick={() => setShowPlayersModal(true)}
                        aria-label="Jugadores"
                    >
                        <IoPeople size={20} />
                    </IconButton>
                }
            />
            <ScrollContent>
                <SectionLabel>
                    <SectionEyebrow>Modos de juego</SectionEyebrow>
                    <SectionCount>{gameModes.length} disponibles</SectionCount>
                </SectionLabel>
                <Grid>
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
                </Grid>
            </ScrollContent>
            <PlayersModal
                visible={showPlayersModal}
                onClose={() => setShowPlayersModal(false)}
            />
        </Container>
    );
}
