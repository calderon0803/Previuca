import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { IoHeart, IoGameController, IoSettings, IoChevronForward } from 'react-icons/io5';

const menuOptions = [
  {
    id: 1,
    name: 'Citas',
    description: 'Encuentra tu match perfecto',
    icon: '🌹',
    iconName: 'heart',
    route: '/citas',
  },
  {
    id: 2,
    name: 'Juegos',
    description: 'Diversión sin límites',
    icon: '🎮',
    iconName: 'game-controller',
    route: '/games',
  },
  {
    id: 3,
    name: 'Ajustes',
    description: 'Personaliza tu experiencia',
    icon: '⚙️',
    iconName: 'settings',
    route: '/ajustes',
  },
];

const Container = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
  display: flex;
  flex-direction: column;
`;

const Content = styled.div`
  flex: 1;
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
`;

const Header = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 0;
`;

const Logo = styled.img`
  width: 150px;
  height: auto;
  margin-bottom: 20px;
  border-radius: 24px;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  font-size: 18px;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;
  margin-bottom: 32px;
`;

const MenuContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  border: 2px solid ${({ theme }) => theme.colors.border};
  transition: transform 0.2s, box-shadow 0.2s, background 0.2s;

  &:hover {
    transform: translateY(-2px);
    background: rgba(255, 255, 255, 0.2);
    box-shadow: 0 8px 12px rgba(0,0,0,0.2);
  }

  &:active {
    transform: scale(0.99);
  }
`;

const IconContainer = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: ${({ theme }) => `${theme.colors.primary}15`}; // 15% opacity primary
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 16px;
  font-size: 24px;
  color: ${({ theme }) => theme.colors.primary};
`;

const TextContainer = styled.div`
  flex: 1;
`;

const CardTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
  margin-bottom: 4px;
`;

const CardDescription = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;
`;

export default function MainMenu() {
  const navigate = useNavigate();

  return (
    <Container>
      <Content>
        <Header>
          <Logo src="/logo.png" alt="Previuca" />
        </Header>
        <div>
          <Title>Bienvenido</Title>
          <Subtitle>¿Qué quieres hacer hoy?</Subtitle>
        </div>
        <MenuContainer>
          {menuOptions.map((option) => (
            <Card
              key={option.id}
              onClick={() => navigate(option.route)}
            >
              <IconContainer>
                {option.icon}
              </IconContainer>
              <TextContainer>
                <CardTitle>{option.name}</CardTitle>
                <CardDescription>{option.description}</CardDescription>
              </TextContainer>
              <IoChevronForward size={24} color="#ccc" />
            </Card>
          ))}
        </MenuContainer>
      </Content>
    </Container>
  );
}
