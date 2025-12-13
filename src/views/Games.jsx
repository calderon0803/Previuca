import styled from 'styled-components';
import { Link } from 'react-router-dom';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: ${({ theme }) => theme.spacing(3)};
`;

const GameCard = styled(Link)`
  background: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing(3)};
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  height: 150px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: transform 0.2s, background-color 0.2s;

  &:hover {
    transform: translateY(-5px);
    background: ${({ theme }) => theme.colors.surface}dd;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const GameTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.medium};
  margin: 0;
`;

const games = [
    { id: 'yo-nunca', title: 'Yo Nunca', path: '/games/yo-nunca' },
    { id: 'verdad-o-reto', title: 'Verdad o Reto', path: '/games/verdad-o-reto' },
    { id: 'rey-de-copas', title: 'Rey de Copas', path: '/games/rey-de-copas' },
];

const Games = () => {
    return (
        <div style={{ width: '100%' }}>
            <h1>Juegos</h1>
            <Grid>
                {games.map((game) => (
                    <GameCard key={game.id} to={game.path}>
                        <GameTitle>{game.title}</GameTitle>
                    </GameCard>
                ))}
            </Grid>
        </div>
    );
};

export default Games;
