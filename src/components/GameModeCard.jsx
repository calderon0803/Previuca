import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { IoLockClosed } from 'react-icons/io5';

const CardContainer = styled(motion.div)`
  cursor: pointer;
  width: 100%;
  height: 100%;
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacing(4)};
  height: 128px;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  transition: background ${({ theme }) => theme.transitions.base},
    border-color ${({ theme }) => theme.transitions.base};
  opacity: ${({ $isLocked }) => ($isLocked ? 0.55 : 1)};

  &:hover {
    background: ${({ theme, $isLocked }) => ($isLocked ? theme.colors.surface : theme.colors.surfaceHover)};
    border-color: ${({ theme, $isLocked }) => ($isLocked ? theme.colors.border : theme.colors.borderStrong)};
  }
`;

const Icon = styled.span`
  display: flex;
  position: absolute;
  top: -10px;
  right: -10px;
  opacity: ${({ $isLocked }) => ($isLocked ? 0.04 : 0.14)};
  filter: ${({ $isLocked }) => ($isLocked ? 'grayscale(100%)' : 'none')};
  transform: rotate(-10deg);
  pointer-events: none;
`;

const Name = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme, $isLocked }) => ($isLocked ? theme.colors.text.disabled : theme.colors.text.primary)};
  margin: 0;
  text-align: left;
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.snug};
  line-height: 1.2;
  z-index: 2;
`;

const LockIndicator = styled.div`
  position: absolute;
  top: ${({ theme }) => theme.spacing(2.5)};
  right: ${({ theme }) => theme.spacing(2.5)};
  color: ${({ theme }) => theme.colors.text.disabled};
  z-index: 3;
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
            <IoLockClosed size={14} />
          </LockIndicator>
        )}
        <Name $isLocked={isLocked}>{game.name}</Name>
        <Icon $isLocked={isLocked} aria-hidden="true">
          <game.icon size={52} />
        </Icon>
      </Card>
    </CardContainer>
  );
}
