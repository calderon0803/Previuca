import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useCrush } from '../contexts/CrushContext';
import { IoArrowBack, IoAdd, IoClose, IoPerson, IoLogOut, IoLogoInstagram } from 'react-icons/io5';

const Container = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: rgba(15, 1, 9, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 2px solid ${({ theme }) => theme.colors.secondary};
  position: sticky;
  top: 0;
  z-index: 10;
`;

const HeaderTitle = styled.h1`
  font-size: 20px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const IconButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.surface};
  border: 2px solid ${({ theme }) => theme.colors.secondary};
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text.primary};
  
  &:hover {
    background: ${({ theme }) => theme.colors.primary};
  }
`;

const Content = styled.div`
  flex: 1;
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
`;

const UserInfo = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  padding: 15px;
  border-radius: 12px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: ${({ theme }) => theme.colors.text.secondary};
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const MatchedByInfo = styled.div`
  background: linear-gradient(135deg, ${({ theme }) => `${theme.colors.secondary}20`}, ${({ theme }) => `${theme.colors.primary}20`});
  border: 2px solid ${({ theme }) => theme.colors.secondary};
  padding: 15px;
  border-radius: 12px;
  margin-bottom: 20px;
  text-align: center;
  color: ${({ theme }) => theme.colors.text.primary};
  box-shadow: 0 8px 24px rgba(0,0,0,0.3);
  
  span {
    display: block;
    font-size: 14px;
    color: ${({ theme }) => theme.colors.text.secondary};
    margin-bottom: 5px;
  }
  
  strong {
    font-size: 24px;
    color: ${({ theme }) => theme.colors.secondary};
    font-weight: bold;
    text-shadow: 0 0 10px ${({ theme }) => `${theme.colors.secondary}50`};
  }
`;

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const CrushCard = styled.div`
  background: ${({ theme, $isMatch }) =>
    $isMatch
      ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 140, 0, 0.2))'
      : theme.colors.surface};
  border-radius: 16px;
  padding: 20px;
  border: ${({ theme, $isMatch }) =>
    $isMatch
      ? '2px solid rgba(255, 215, 0, 0.6)'
      : `1px solid ${theme.colors.border}`};
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: ${({ $isMatch }) =>
    $isMatch ? '0 4px 12px rgba(255, 215, 0, 0.3)' : 'none'};
`;

const CrushName = styled.span`
  font-size: 18px;
  font-weight: 600;
  color: ${({ $isMatch }) => $isMatch ? '#FFD700' : '#fff'};
`;

const MatchBadge = styled.span`
  font-size: 20px;
  margin-right: 8px;
`;

const EmptySlot = styled.div`
  border: 2px dashed ${({ theme }) => theme.colors.primary};
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text.secondary};
  transition: all 0.3s;

  &:hover {
    background: ${({ theme }) => `${theme.colors.primary}20`};
    border-style: solid;
    color: ${({ theme }) => theme.colors.secondary};
    transform: translateY(-2px);
  }
`;

const InputOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  padding: 20px;
`;

const InputCard = styled.div`
  background: ${({ theme }) => theme.colors.background};
  border: 2px solid ${({ theme }) => theme.colors.border};
  padding: 24px;
  border-radius: 20px;
  width: 100%;
  max-width: 350px;
`;

const ModalTitle = styled.h3`
  color: #fff;
  margin-top: 0;
  margin-bottom: 20px;
  text-align: center;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid #ccc;
  background: #fff;
  color: #000;
  font-size: 16px;
  margin-bottom: 20px;
  box-sizing: border-box;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
`;

const ModalButton = styled.button`
  flex: 1;
  padding: 12px;
  border-radius: 10px;
  border: none;
  font-weight: bold;
  cursor: pointer;
  background: ${props => props.$cancel ? '#444' : props.theme.colors.secondary};
  color: ${props => props.$cancel ? '#fff' : '#000'};
`;

const VerifyButton = styled.button`
  width: 100%;
  padding: 16px;
  border-radius: 10px;
  border: 2px solid ${({ theme }) => theme.colors.secondary};
  background: transparent;
  color: ${({ theme }) => theme.colors.secondary};
  font-weight: bold;
  font-size: 16px;
  cursor: pointer;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  
  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
    color: #000;
  }
`;

export default function CrushList() {
  const navigate = useNavigate();
  const {
    user,
    crushes,
    matches,
    logout,
    addCrush,
    removeCrush,
    loading,
    isVerified,
    instagramUsername,
    matchedByCount
  } = useCrush();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCrushName, setNewCrushName] = useState('');

  const handleBack = () => {
    navigate('/');
  };

  const handleAddClick = () => {
    if (!isVerified) {
      navigate('/instagram-verification');
      return;
    }

    if (crushes.length >= 5) {
      alert('Has alcanzado el límite de 5 crushes.');
      return;
    }

    setNewCrushName('');
    setIsModalOpen(true);
  };

  const handleConfirmAdd = () => {
    if (newCrushName.trim()) {
      addCrush(newCrushName);
      setIsModalOpen(false);
    }
  };

  const handleLogout = () => {
    if (confirm("¿Estás seguro de que quieres cerrar sesión?")) {
      logout();
      navigate('/crush');
    }
  }

  // Generate 5 slots
  const slots = Array(5).fill(null).map((_, i) => crushes?.[i] || null);

  return (
    <Container>
      <Header>
        <IconButton onClick={handleBack}>
          <IoArrowBack size={24} />
        </IconButton>
        <HeaderTitle>Mis Crushes</HeaderTitle>
        <div style={{ width: 40 }} />
      </Header>
      <Content>
        {!isVerified && (
          <VerifyButton onClick={() => navigate('/instagram-verification')}>
            Verificar Instagram
          </VerifyButton>
        )}

        {isVerified && (
          <>
            <UserInfo>
              <span>@{instagramUsername}</span>
              <IoPerson />
            </UserInfo>

            <MatchedByInfo>
              <span>Personas que te tienen en su lista</span>
              <strong>{matchedByCount}</strong>
            </MatchedByInfo>
          </>
        )}

        <ListContainer>
          {slots.map((crush, index) => {
            const isMatch = crush && matches.includes(crush);
            return (
              <React.Fragment key={index}>
                {crush ? (
                  <CrushCard $isMatch={isMatch}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {isMatch && <MatchBadge>❤️</MatchBadge>}
                      <CrushName $isMatch={isMatch}>@{crush}</CrushName>
                    </div>
                    <IconButton
                      style={{ width: 30, height: 30, background: 'rgba(255,50,50,0.2)', border: 'none' }}
                      onClick={() => removeCrush(index)}
                    >
                      <IoClose color="#ff5555" />
                    </IconButton>
                  </CrushCard>
                ) : (
                  <EmptySlot onClick={handleAddClick}>
                    <IoAdd size={24} />
                    <span style={{ marginLeft: 8 }}>Añadir Crush</span>
                  </EmptySlot>
                )}
              </React.Fragment>
            );
          })}
        </ListContainer>
      </Content>

      {isModalOpen && (
        <InputOverlay onClick={() => setIsModalOpen(false)}>
          <InputCard onClick={e => e.stopPropagation()}>
            <ModalTitle>Nuevo Crush</ModalTitle>
            <Input
              placeholder="Usuario (sin espacios)"
              value={newCrushName}
              onChange={e => setNewCrushName(e.target.value.replace(/\s/g, ''))}
              autoFocus
            />
            <ButtonGroup>
              <ModalButton $cancel onClick={() => setIsModalOpen(false)}>Cancelar</ModalButton>
              <ModalButton onClick={handleConfirmAdd}>Añadir</ModalButton>
            </ButtonGroup>
          </InputCard>
        </InputOverlay>
      )}
    </Container>
  );
}
