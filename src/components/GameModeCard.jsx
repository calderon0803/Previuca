import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const CardContainer = styled(motion.div)`
  margin-bottom: 16px;
  cursor: pointer;
  width: 100%;
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 16px;
  padding: 20px;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border: 2px solid ${({ theme }) => theme.colors.border};
  position: relative;
  overflow: hidden;
  transition: box-shadow 0.2s, background 0.2s;

  &:hover {
    box-shadow: 0 6px 16px rgba(0,0,0,0.2);
    background: rgba(255, 255, 255, 0.15);
  }
`;

const Icon = styled.span`
  font-size: 40px;
  margin-bottom: 12px;
  display: block;
`;

const Name = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 4px 0;
`;

const Description = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;
  line-height: 1.4;
`;

export default function GameModeCard({ game, onClick }) {
  return (
    <CardContainer
      whileHover={{ scale: 0.99 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
    >
      <Card>
        <Icon role="img" aria-label={game.name}>{game.icon}</Icon>
        <Name>{game.name}</Name>
        <Description>{game.description}</Description>
      </Card>
    </CardContainer>
  );
}
