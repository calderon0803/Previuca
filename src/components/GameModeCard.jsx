import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const CardContainer = styled(motion.div)`
  margin-bottom: 16px;
  cursor: pointer;
  width: 100%;
`;

const Card = styled.div`
  background: ${props => `linear-gradient(135deg, ${props.colors[0]}, ${props.colors[1]})`};
  border-radius: 20px;
  padding: 24px;
  min-height: 140px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  position: relative;
  overflow: hidden;
`;

const Icon = styled.span`
  font-size: 48px;
  margin-bottom: 12px;
  display: block;
`;

const Name = styled.h3`
  font-size: 24px;
  font-weight: bold;
  color: #fff;
  margin: 0 0 8px 0;
`;

const Description = styled.p`
  font-size: 14px;
  color: rgba(255,255,255,0.9);
  margin: 0;
`;

export default function GameModeCard({ game, onClick }) {
    return (
        <CardContainer
            whileHover={{ scale: 0.98 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
        >
            <Card colors={game.color}>
                <Icon role="img" aria-label={game.name}>{game.icon}</Icon>
                <Name>{game.name}</Name>
                <Description>{game.description}</Description>
            </Card>
        </CardContainer>
    );
}
