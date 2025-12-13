import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useDates } from '../contexts/DatesContext';
import { IoArrowBack, IoAdd, IoClose, IoPerson, IoLogOut } from 'react-icons/io5';

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
  border-bottom: 2px solid ${({ theme }) => theme.colors.border};
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
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid ${({ theme }) => theme.colors.border};
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text.primary};
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
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
  background: rgba(0, 0, 0, 0.2);
  padding: 15px;
  border-radius: 12px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const DateCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 16px;
  padding: 20px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const DateName = styled.span`
  font-size: 18px;
  font-weight: 600;
  color: #fff;
`;

const EmptySlot = styled.div`
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.5);
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: ${({ theme }) => theme.colors.secondary};
    color: ${({ theme }) => theme.colors.secondary};
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
  background: ${props => props.cancel ? '#444' : props.theme.colors.secondary};
  color: ${props => props.cancel ? '#fff' : '#000'};
`;

export default function DatesList() {
    const navigate = useNavigate();
    const { user, logout, addDate, removeDate } = useDates();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newDateName, setNewDateName] = useState('');

    const handleBack = () => {
        navigate('/');
    };

    const handleAddClick = () => {
        setNewDateName('');
        setIsModalOpen(true);
    };

    const handleConfirmAdd = () => {
        if (newDateName.trim()) {
            addDate(newDateName);
            setIsModalOpen(false);
        }
    };

    const handleLogout = () => {
        if (confirm("¿Estás seguro de que quieres cerrar sesión?")) {
            logout();
            navigate('/citas');
        }
    }

    // Generate 5 slots
    const slots = Array(5).fill(null).map((_, i) => user?.dates[i] || null);

    return (
        <Container>
            <Header>
                <IconButton onClick={handleBack}>
                    <IoArrowBack size={24} />
                </IconButton>
                <HeaderTitle>Mis Citas</HeaderTitle>
                <IconButton onClick={handleLogout}>
                    <IoLogOut size={24} />
                </IconButton>
            </Header>
            <Content>
                <UserInfo>
                    <span>@{user?.username}</span>
                    <IoPerson />
                </UserInfo>

                <ListContainer>
                    {slots.map((date, index) => (
                        <React.Fragment key={index}>
                            {date ? (
                                <DateCard>
                                    <DateName>@{date}</DateName>
                                    <IconButton
                                        style={{ width: 30, height: 30, background: 'rgba(255,50,50,0.2)', border: 'none' }}
                                        onClick={() => removeDate(index)}
                                    >
                                        <IoClose color="#ff5555" />
                                    </IconButton>
                                </DateCard>
                            ) : (
                                <EmptySlot onClick={handleAddClick}>
                                    <IoAdd size={24} />
                                    <span style={{ marginLeft: 8 }}>Añadir Cita</span>
                                </EmptySlot>
                            )}
                        </React.Fragment>
                    ))}
                </ListContainer>
            </Content>

            {isModalOpen && (
                <InputOverlay onClick={() => setIsModalOpen(false)}>
                    <InputCard onClick={e => e.stopPropagation()}>
                        <ModalTitle>Nueva Cita</ModalTitle>
                        <Input
                            placeholder="Usuario (sin espacios)"
                            value={newDateName}
                            onChange={e => setNewDateName(e.target.value.replace(/\s/g, ''))}
                            autoFocus
                        />
                        <ButtonGroup>
                            <ModalButton cancel onClick={() => setIsModalOpen(false)}>Cancelar</ModalButton>
                            <ModalButton onClick={handleConfirmAdd}>Añadir</ModalButton>
                        </ButtonGroup>
                    </InputCard>
                </InputOverlay>
            )}
        </Container>
    );
}
