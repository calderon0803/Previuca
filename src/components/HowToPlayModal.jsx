import React from 'react';
import styled from 'styled-components';
import BottomSheet, { SheetTitle } from './ui/BottomSheet';
import Button from './ui/Button';
import { gameById } from '../data/games';

// Reglas del juego, en 2–3 párrafos. El botón `question` de cada partida la abre.

const Title = styled(SheetTitle)`
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3.5)};
  margin-bottom: ${({ theme }) => theme.spacing(5)};

  p {
    font-size: 15px;
    line-height: 1.6;
    color: ${({ theme }) => theme.colors.text.secondary};
    margin: 0;
  }

  strong {
    color: ${({ theme }) => theme.colors.text.primary};
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  }

  ul {
    margin: 0;
    padding-left: ${({ theme }) => theme.spacing(5)};
    font-size: 15px;
    line-height: 1.6;
    color: ${({ theme }) => theme.colors.text.secondary};
  }
`;

export default function HowToPlayModal({ visible, onClose, gameId, title, children }) {
    const game = gameId ? gameById[gameId] : null;

    return (
        <BottomSheet visible={visible} onClose={onClose}>
            <Title>{game?.help ? title || game.name : title}</Title>
            <Body>
                {game?.help
                    ? game.help.map((para, i) => <p key={i}>{para}</p>)
                    : children}
            </Body>
            <Button
                variant="secondary"
                size="lg"
                fullWidth
                onClick={onClose}
            >
                Entendido
            </Button>
        </BottomSheet>
    );
}
