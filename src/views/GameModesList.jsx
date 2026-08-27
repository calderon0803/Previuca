import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { UsersRound } from 'lucide-react';
import { usePlayers } from '../contexts/PlayersContext';
import { games } from '../data/games';
import GameModeCard from '../components/GameModeCard';
import PlayersModal from '../components/PlayersModal';
import PageHeader from '../components/ui/PageHeader';
import Screen, { Content } from '../components/ui/Screen';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing(2.5)};
`;

const PlayersChip = styled.button`
  display: flex;
  align-items: center;
  gap: 7px;
  height: 38px;
  padding: 0 ${({ theme }) => theme.spacing(3)};
  border-radius: ${({ theme }) => theme.radii.pill};
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  color: ${({ theme }) => theme.colors.accentText};
  flex-shrink: 0;
  transition: border-color ${({ theme }) => theme.transitions.fast};

  &:hover {
    border-color: #5d5294;
  }
`;

const ChipCount = styled.span`
  font-size: 13px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ListContent = styled(Content)`
  padding: 2px ${({ theme }) => theme.spacing(4)} ${({ theme }) => theme.spacing(7.5)};
`;

export default function GameModesList() {
    const navigate = useNavigate();
    const { players } = usePlayers();

    const [playersOpen, setPlayersOpen] = React.useState(false);
    // Cuando la hoja se abre porque a un juego le faltan jugadores, guarda el
    // motivo y el juego al que volver en cuanto haya suficientes.
    const [pending, setPending] = React.useState(null);

    const openPlayers = () => {
        setPending(null);
        setPlayersOpen(true);
    };

    const handleGamePress = (game) => {
        const missing = game.min - players.length;
        if (missing > 0) {
            setPending({
                game,
                message:
                    `${game.name} se juega con ${game.min} o más. ` +
                    (missing === 1 ? 'Falta 1 persona.' : `Faltan ${missing} personas.`),
            });
            setPlayersOpen(true);
            return;
        }
        navigate(game.route);
    };

    const handlePrimary = () => {
        const game = pending?.game;
        setPlayersOpen(false);
        setPending(null);
        if (game && players.length >= game.min) navigate(game.route);
    };

    return (
        <Screen>
            <PageHeader
                title="Juegos"
                onBack={() => navigate(-1)}
                rightAction={
                    <PlayersChip onClick={openPlayers} aria-label="Jugadores">
                        <UsersRound size={16} />
                        <ChipCount>{players.length}</ChipCount>
                    </PlayersChip>
                }
            />
            <ListContent>
                <Grid>
                    {games.map((game) => (
                        <GameModeCard
                            key={game.id}
                            game={game}
                            missing={Math.max(0, game.min - players.length)}
                            onClick={() => handleGamePress(game)}
                        />
                    ))}
                </Grid>
            </ListContent>
            <PlayersModal
                visible={playersOpen}
                onClose={() => {
                    setPlayersOpen(false);
                    setPending(null);
                }}
                message={pending?.message}
                primaryLabel={pending ? 'Empezar partida' : 'Listo'}
                onPrimary={handlePrimary}
            />
        </Screen>
    );
}
