import React, { useState } from 'react';
import styled from 'styled-components';
import { IoClose, IoTrashOutline, IoAddCircle } from 'react-icons/io5';
import { usePlayers } from '../contexts/PlayersContext';
import { motion, AnimatePresence } from 'framer-motion';

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.85); // Darker overlay for better focus
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
  backdrop-filter: blur(8px);
`;

const ModalContainer = styled(motion.div)`
  background-color: #1a0210; // Dark purple matching the theme
  border-radius: 24px;
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  padding: 24px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 50px rgba(0,0,0,0.6);
  border: 2px solid ${({ theme }) => theme.colors.secondary}; // Gold border
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: bold;
  color: #fff;
  margin: 0;
`;

const CloseButton = styled.button`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  cursor: pointer;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  transition: background 0.2s;
  
  &:hover {
    background: ${({ theme }) => theme.colors.primary};
  }
`;

const CounterContainer = styled.div`
  margin-bottom: 24px;
  padding: 12px;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 12px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const CounterText = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: 600;
  margin: 0;
`;

const PlayersList = styled.div`
  overflow-y: auto;
  max-height: 300px;
  margin-bottom: 24px;
  padding-right: 8px;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.primary};
    border-radius: 3px;
  }
`;

const PlayerItem = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: ${({ theme }) => theme.colors.surface};
  padding: 16px;
  border-radius: 16px;
  margin-bottom: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const PlayerInfo = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
`;

const PlayerIcon = styled.span`
  font-size: 20px;
  margin-right: 12px;
`;

const PlayerName = styled.span`
  font-size: 18px;
  color: #fff;
  font-weight: 500;
`;

const DeleteButton = styled.button`
  background: rgba(255, 59, 48, 0.1);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  width: 36px;
  height: 36px;
  color: #ff3b30;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover {
    background: #ff3b30;
    color: #fff;
  }
`;

const AddSection = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  gap: 12px;
`;

const Input = styled.input`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 14px;
  font-size: 16px;
  color: #fff;
  outline: none;
  transition: border-color 0.2s;
  
  &:focus {
    border-color: ${({ theme }) => theme.colors.secondary};
  }
`;

const AddButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  border: none;
  border-radius: 12px;
  cursor: pointer;
  width: 48px;
  height: 48px;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
  
  &:hover {
    transform: scale(1.05);
    filter: brightness(1.2);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const DoneButton = styled.button`
  width: 100%;
  border: 2px solid ${({ theme }) => theme.colors.secondary};
  border-radius: 16px;
  padding: 18px;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    filter: brightness(1.2);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const EmptyText = styled.h3`
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  margin: 0 0 8px 0;
`;

const EmptySubtext = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 14px;
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
    <AnimatePresence>
      {visible && (
        <Overlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <ModalContainer
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Header>
              <Title>Jugadores</Title>
              <CloseButton onClick={handleClose}>
                <IoClose size={28} />
              </CloseButton>
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
                      <IoTrashOutline size={20} />
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
                <IoAddCircle size={32} />
              </AddButton>
            </AddSection>

            <DoneButton onClick={handleClose}>
              Listo
            </DoneButton>
          </ModalContainer>
        </Overlay>
      )}
    </AnimatePresence>
  );
}
