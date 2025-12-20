import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { IoLockClosed } from 'react-icons/io5';

const CardContainer = styled(motion.div)`
  cursor: pointer;
  width: 100%;
`;

const Card = styled.div`
  background: ${({ theme, $isLocked }) => $isLocked ? 'rgba(255, 255, 255, 0.02)' : theme.colors.surface};
  border-radius: 20px;
  padding: 24px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  border: 2px solid ${({ theme, $isLocked }) => $isLocked ? 'rgba(255, 255, 255, 0.1)' : theme.colors.secondary};
  position: relative;
  overflow: hidden;
  transition: all 0.2s;
  opacity: ${({ $isLocked }) => $isLocked ? 0.6 : 1};

  &:hover {
    box-shadow: ${({ $isLocked }) => $isLocked ? '0 4px 12px rgba(0,0,0,0.2)' : '0 12px 24px rgba(0,0,0,0.4)'};
    background: ${({ theme, $isLocked }) => $isLocked ? 'rgba(255, 255, 255, 0.04)' : `${theme.colors.primary}20`};
    transform: ${({ $isLocked }) => $isLocked ? 'none' : 'translateY(-2px)'};
  }
`;

const Icon = styled.span`
  font-size: 64px;
  position: absolute;
  bottom: -10px;
  right: -10px;
  opacity: ${({ $isLocked }) => $isLocked ? 0.05 : 0.15};
  filter: ${({ $isLocked }) => $isLocked ? 'grayscale(100%)' : 'none'};
  transform: rotate(-15deg);
  pointer-events: none;
`;

const Name = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme, $isLocked }) => $isLocked ? 'rgba(255, 255, 255, 0.4)' : theme.colors.text.primary};
  margin: 0;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 1px;
  z-index: 2;
`;

const LockIndicator = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  color: rgba(255, 255, 255, 0.3);
  z-index: 3;
`;

const Description = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;
  line-height: 1.4;
`;

export default function GameModeCard({ game, onClick, isLocked }) {
  return (
    <CardContainer
      whileHover={{ scale: isLocked ? 1 : 0.99 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
    >
      <Card $isLocked={isLocked}>
        {isLocked && (
          <LockIndicator>
            <IoLockClosed size={16} />
          </LockIndicator>
        )}
        <Name $isLocked={isLocked}>{game.name}</Name>
        <Icon $isLocked={isLocked} role="img" aria-label={game.name}>{game.icon}</Icon>
      </Card>
    </CardContainer>
  );
}
