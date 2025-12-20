import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { IoClose, IoTrashOutline, IoAddCircle } from 'react-icons/io5';
import { motion, AnimatePresence } from 'framer-motion';

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
  backdrop-filter: blur(8px);
`;

const ModalContainer = styled(motion.div)`
  background-color: #1a0210;
  border-radius: 24px;
  width: 100%;
  max-width: 500px;
  max-height: 85vh;
  padding: 24px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 50px rgba(0,0,0,0.6);
  border: 2px solid ${({ theme }) => theme.colors.secondary};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
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
  transition: all 0.2s;
  
  &:hover {
    background: ${({ theme }) => theme.colors.primary};
  }
`;

const ItemsList = styled.div`
  overflow-y: auto;
  flex: 1;
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

const ItemRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: ${({ theme }) => theme.colors.surface};
  padding: 14px;
  border-radius: 16px;
  margin-bottom: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const ItemText = styled.p`
  flex: 1;
  font-size: 15px;
  color: #fff;
  margin: 0;
  margin-right: 12px;
  line-height: 1.4;
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
  }
`;

const Footer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 18px;
  border-radius: 16px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  
  ${props => props.$primary ? `
    background: ${props.theme.colors.primary};
    color: white;
    border: 2px solid ${props.theme.colors.secondary};
    
    &:hover {
      filter: brightness(1.2);
      transform: translateY(-2px);
    }
  ` : `
    background: ${props.theme.colors.surface};
    color: #fff;
    border: 1px solid rgba(255, 255, 255, 0.1);
    
    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }
  `}
`;

export default function OptionsEditor({
  visible,
  items,
  onSave,
  onCancel,
  onReset,
  allowAdd = true,
  allowDelete = true,
  title = "Editar Opciones",
  placeholder = "Añadir nuevo..."
}) {
  const [editedItems, setEditedItems] = useState([...items]);
  const [newItem, setNewItem] = useState('');

  useEffect(() => {
    if (visible) {
      setEditedItems([...items]);
    }
  }, [visible, items]);

  const handleItemChange = (index, value) => {
    const newItems = [...editedItems];
    newItems[index] = value;
    setEditedItems(newItems);
  };

  const handleAddItem = () => {
    if (newItem.trim()) {
      setEditedItems([...editedItems, newItem.trim()]);
      setNewItem('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleAddItem();
    }
  };

  const handleDeleteItem = (index) => {
    setEditedItems(editedItems.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave(editedItems);
  };

  const handleLocalReset = () => {
    if (onReset && window.confirm('¿Restablecer todas las opciones por defecto?')) {
      onReset();
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <Overlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
        >
          <ModalContainer
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Header>
              <Title>{title}</Title>
              <CloseButton onClick={onCancel}>
                <IoClose size={28} />
              </CloseButton>
            </Header>

            <ItemsList>
              {editedItems.map((item, index) => (
                <ItemRow key={index}>
                  <Input
                    value={item}
                    onChange={(e) => handleItemChange(index, e.target.value)}
                    style={{ background: 'transparent', border: 'none', padding: 0 }}
                  />
                  {allowDelete && (
                    <DeleteButton onClick={() => handleDeleteItem(index)}>
                      <IoTrashOutline size={20} />
                    </DeleteButton>
                  )}
                </ItemRow>
              ))}
              {editedItems.length === 0 && (
                <p style={{ textAlign: 'center', color: '#666', marginTop: '40px' }}>
                  No hay elementos en la lista
                </p>
              )}
            </ItemsList>

            {allowAdd && (
              <AddSection>
                <Input
                  placeholder={placeholder}
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                />
                <AddButton onClick={handleAddItem} disabled={!newItem.trim()}>
                  <IoAddCircle size={32} />
                </AddButton>
              </AddSection>
            )}

            <Footer>
              {onReset && (
                <ActionButton
                  onClick={handleLocalReset}
                  style={{ border: 'none', color: '#ff6b6b', fontSize: '14px', padding: '10px' }}
                >
                  Restablecer valores por defecto
                </ActionButton>
              )}
              <ButtonGroup>
                <ActionButton onClick={onCancel}>Cancelar</ActionButton>
                <ActionButton $primary onClick={handleSave}>
                  Guardar
                </ActionButton>
              </ButtonGroup>
            </Footer>
          </ModalContainer>
        </Overlay>
      )}
    </AnimatePresence>
  );
}
