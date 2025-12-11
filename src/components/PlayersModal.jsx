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
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContainer = styled(motion.div)`
  background-color: #fff;
  border-radius: 24px;
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  padding: 24px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #333;
  
  &:hover {
    opacity: 0.7;
  }
`;

const CounterContainer = styled.div`
  margin-bottom: 16px;
`;

const CounterText = styled.p`
  font-size: 14px;
  color: #666;
  font-weight: 600;
  margin: 0;
`;

const PlayersList = styled.div`
  overflow-y: auto;
  max-height: 300px;
  margin-bottom: 16px;
  padding-right: 8px;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }
  &::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 3px;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 0;
`;

const EmptyIcon = styled.span`
  font-size: 48px;
  margin-bottom: 12px;
`;

const EmptyText = styled.p`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px 0;
`;

const EmptySubtext = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0;
`;

const PlayerItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #f5f5f5;
  padding: 12px;
  border-radius: 12px;
  margin-bottom: 8px;
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
  font-size: 16px;
  color: #333;
  font-weight: 500;
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  color: #ff6b6b;
  display: flex;
  align-items: center;
  
  &:hover {
    opacity: 0.8;
  }
`;

const AddSection = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  gap: 8px;
`;

const Input = styled.input`
  flex: 1;
  background-color: #f5f5f5;
  border: none;
  border-radius: 12px;
  padding: 12px;
  font-size: 16px;
  color: #333;
  outline: none;
  
  &:focus {
    box-shadow: 0 0 0 2px #667eea;
  }
`;

const AddButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: #667eea;
  display: flex;
  align-items: center;
  
  &:hover {
    transform: scale(1.1);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const DoneButton = styled.button`
  width: 100%;
  border: none;
  border-radius: 12px;
  padding: 16px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 0.9;
  }
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
