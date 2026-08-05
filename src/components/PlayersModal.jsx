import React, { useState } from 'react';
import styled from 'styled-components';
import { IoClose, IoTrashOutline, IoAddCircle } from 'react-icons/io5';
import { usePlayers } from '../contexts/PlayersContext';
import Modal from './ui/Modal';
import IconButton from './ui/IconButton';
import Button from './ui/Button';
import Input from './ui/Input';

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing(5)};
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const CounterContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(5)};
  padding: ${({ theme }) => theme.spacing(3)};
  background: ${({ theme }) => theme.colors.surfaceRaised};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  text-align: center;
`;

const CounterText = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  margin: 0;
`;

const PlayersList = styled.div`
  overflow-y: auto;
  max-height: 300px;
  margin-bottom: ${({ theme }) => theme.spacing(5)};
  padding-right: ${({ theme }) => theme.spacing(2)};
`;

const PlayerItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacing(4)};
  border-radius: ${({ theme }) => theme.radii.md};
  margin-bottom: ${({ theme }) => theme.spacing(3)};
`;

const PlayerInfo = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
`;

const PlayerIcon = styled.span`
  font-size: 18px;
  margin-right: ${({ theme }) => theme.spacing(3)};
`;

const PlayerName = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

const DeleteButton = styled.button`
  background: rgba(229, 72, 77, 0.1);
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: pointer;
  width: 34px;
  height: 34px;
  color: ${({ theme }) => theme.colors.error};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background ${({ theme }) => theme.transitions.fast},
    color ${({ theme }) => theme.transitions.fast};
  flex-shrink: 0;

  &:hover {
    background: ${({ theme }) => theme.colors.error};
    color: #fff;
  }
`;

const AddSection = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing(5)};
  gap: ${({ theme }) => theme.spacing(3)};
`;

const AddButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
  width: 46px;
  height: 46px;
  flex-shrink: 0;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(8)} ${({ theme }) => theme.spacing(5)};
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 40px;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

const EmptyText = styled.h3`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  margin: 0 0 ${({ theme }) => theme.spacing(2)} 0;
`;

const EmptySubtext = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  margin: 0;
`;

export default function PlayersModal({ visible, onClose }) {
  const { players, addPlayer, removePlayer } = usePlayers();
  const [newPlayerName, setNewPlayerName] = useState('');

  const handleAddPlayer = () => {
    if (newPlayerName.trim()) {
      addPlayer(newPlayerName);
      setNewPlayerName('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleAddPlayer();
    }
  };

  const handleClose = () => {
    setNewPlayerName('');
    onClose();
  };

  return (
    <Modal visible={visible} onClose={handleClose}>
      <Header>
        <Title>Jugadores</Title>
        <IconButton variant="ghost" onClick={handleClose} aria-label="Cerrar">
          <IoClose size={22} />
        </IconButton>
      </Header>

      <CounterContainer>
        <CounterText>
          {players.length} {players.length === 1 ? 'jugador' : 'jugadores'}
        </CounterText>
      </CounterContainer>

      <PlayersList>
        {players.length === 0 ? (
          <EmptyState>
            <EmptyIcon>👥</EmptyIcon>
            <EmptyText>No hay jugadores</EmptyText>
            <EmptySubtext>Agrega jugadores para comenzar</EmptySubtext>
          </EmptyState>
        ) : (
          players.map((player) => (
            <PlayerItem key={player.id}>
              <PlayerInfo>
                <PlayerIcon>👤</PlayerIcon>
                <PlayerName>{player.name}</PlayerName>
              </PlayerInfo>
              <DeleteButton onClick={() => removePlayer(player.id)}>
                <IoTrashOutline size={18} />
              </DeleteButton>
            </PlayerItem>
          ))
        )}
      </PlayersList>

      <AddSection>
        <Input
          placeholder="Nombre del jugador"
          value={newPlayerName}
          onChange={(e) => setNewPlayerName(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />
        <AddButton onClick={handleAddPlayer} disabled={!newPlayerName.trim()}>
          <IoAddCircle size={26} />
        </AddButton>
      </AddSection>

      <Button size="lg" fullWidth onClick={handleClose}>
        Listo
      </Button>
    </Modal>
  );
}
