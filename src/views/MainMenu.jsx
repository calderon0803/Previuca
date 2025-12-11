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
        color: 'linear-gradient(135deg, #f093fb, #f5576c)',
        route: '/citas',
    },
    {
        id: 2,
        name: 'Juegos',
        description: 'Diversión sin límites',
        icon: '🎮',
        iconName: 'game-controller',
        color: 'linear-gradient(135deg, #667eea, #764ba2)',
        route: '/games',
    },
    {
        id: 3,
        name: 'Ajustes',
        description: 'Personaliza tu experiencia',
        icon: '⚙️',
        iconName: 'settings',
        color: 'linear-gradient(135deg, #4facfe, #00f2fe)',
        route: '/ajustes',
    },
];

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(180deg, #f5f7fa 0%, #c3cfe2 100%);
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
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: bold;
  color: #2d3436;
  margin: 0;
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  font-size: 18px;
  color: #636e72;
  margin: 0;
  margin-bottom: 32px;
`;

const MenuContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Card = styled.div`
  background: ${props => props.background};
  border-radius: 20px;
  padding: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transition: transform 0.2s;

  &:active {
    transform: scale(0.98);
  }
`;

const IconContainer = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 30px;
  background: rgba(255,255,255,0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 16px;
  font-size: 32px;
`;

const TextContainer = styled.div`
  flex: 1;
`;

const CardTitle = styled.h2`
  font-size: 24px;
  font-weight: bold;
  color: white;
  margin: 0;
  margin-bottom: 4px;
`;

const CardDescription = styled.p`
  font-size: 14px;
  color: rgba(255,255,255,0.9);
  margin: 0;
`;

export default function MainMenu() {
    const navigate = useNavigate();

    return (
        <Container>
            <Content>
                <Header>
                    <Logo src="/assets/logo.png" alt="PatronaLeague" />
                </Header>
                <div>
                    <Title>Bienvenido</Title>
                    <Subtitle>¿Qué quieres hacer hoy?</Subtitle>
                </div>
                <MenuContainer>
                    {menuOptions.map((option) => (
                        <Card
                            key={option.id}
                            background={option.color}
                            onClick={() => navigate(option.route)}
                        >
                            <IconContainer>
                                {option.icon}
                            </IconContainer>
                            <TextContainer>
                                <CardTitle>{option.name}</CardTitle>
                                <CardDescription>{option.description}</CardDescription>
                            </TextContainer>
                            <IoChevronForward size={28} color="rgba(255,255,255,0.8)" />
                        </Card>
                    ))}
                </MenuContainer>
            </Content>
        </Container>
    );
}
