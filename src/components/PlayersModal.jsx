import React, { useState } from 'react';
import styled from 'styled-components';
import { X, Plus, CircleMinus } from 'lucide-react';
import { usePlayers } from '../contexts/PlayersContext';
import BottomSheet, { SheetTitle } from './ui/BottomSheet';
import Button from './ui/Button';
import Input from './ui/Input';

// Hoja de jugadores. Es el único sitio donde se editan: se abre desde el chip
// de la cabecera, y ninguna pantalla de partida repite la lista al pie.
//
// Cuando se abre porque a un juego le faltan jugadores, `message` explica el
// motivo y se resalta en el color de acento.

const DEFAULT_MESSAGE =
    'Se guardan en el móvil: los juegos por turnos los usan para saber a quién le toca.';

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(3)};
  margin-bottom: 4px;
`;

const CloseButton = styled.button`
  width: 40px;
  height: 40px;
  margin: -6px -8px 0 0;
  flex-shrink: 0;
  border-radius: ${({ theme }) => theme.radii.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text.muted};

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const Message = styled.p`
  margin: 0 0 ${({ theme }) => theme.spacing(4)};
  font-size: 13.5px;
  line-height: 1.5;
  color: ${({ theme, $highlight }) =>
        $highlight ? theme.colors.accentText : theme.colors.text.muted};
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  max-height: 230px;
  overflow-y: auto;
  margin-bottom: ${({ theme }) => theme.spacing(3.5)};

  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(3)};
  height: 50px;
  flex-shrink: 0;
  padding: 0 ${({ theme }) => theme.spacing(2)} 0 ${({ theme }) => theme.spacing(3.5)};
  background: ${({ theme }) => theme.colors.surfaceRaised};
  border-radius: ${({ theme }) => theme.radii.sm};
`;

const Name = styled.span`
  flex: 1;
  min-width: 0;
  font-size: 15.5px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const RowAction = styled.button`
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: ${({ theme }) => theme.radii.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text.muted};
  transition: background ${({ theme }) => theme.transitions.fast},
    color ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.border};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const Empty = styled.p`
  margin: ${({ theme }) => theme.spacing(3.5)} 0 ${({ theme }) => theme.spacing(4.5)};
  text-align: center;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.faint};
`;

const AddRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2.5)};
  margin-bottom: ${({ theme }) => theme.spacing(3.5)};
`;

const AddButton = styled.button`
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.accentText};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background ${({ theme }) => theme.transitions.fast};

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.accentTint};
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

export default function PlayersModal({
    visible,
    onClose,
    message,
    primaryLabel = 'Listo',
    onPrimary,
}) {
    const { players, addPlayer, removePlayer } = usePlayers();
    const [newPlayerName, setNewPlayerName] = useState('');

    const handleAddPlayer = () => {
        if (newPlayerName.trim()) {
            addPlayer(newPlayerName);
            setNewPlayerName('');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleAddPlayer();
    };

    const handleClose = () => {
        setNewPlayerName('');
        onClose();
    };

    const handlePrimary = () => {
        setNewPlayerName('');
        if (onPrimary) onPrimary();
        else onClose();
    };

    return (
        <BottomSheet visible={visible} onClose={handleClose}>
            <Header>
                <SheetTitle>Jugadores</SheetTitle>
                <CloseButton onClick={handleClose} aria-label="Cerrar">
                    <X size={20} />
                </CloseButton>
            </Header>

            <Message $highlight={!!message}>{message || DEFAULT_MESSAGE}</Message>

            <List>
                {players.length === 0 ? (
                    <Empty>Todavía no hay nadie. Añade a quien esté en la mesa.</Empty>
                ) : (
                    players.map((player) => (
                        <Row key={player.id}>
                            <Name>{player.name}</Name>
                            <RowAction
                                onClick={() => removePlayer(player.id)}
                                aria-label={`Quitar a ${player.name}`}
                            >
                                <CircleMinus size={18} />
                            </RowAction>
                        </Row>
                    ))
                )}
            </List>

            <AddRow>
                <Input
                    placeholder="Nombre"
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <AddButton
                    onClick={handleAddPlayer}
                    disabled={!newPlayerName.trim()}
                    aria-label="Añadir jugador"
                >
                    <Plus size={20} />
                </AddButton>
            </AddRow>

            <Button size="lg" fullWidth onClick={handlePrimary}>
                {primaryLabel}
            </Button>
        </BottomSheet>
    );
}
