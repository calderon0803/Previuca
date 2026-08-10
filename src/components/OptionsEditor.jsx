import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { IoClose, IoTrashOutline, IoAddCircle } from 'react-icons/io5';
import Modal from './ui/Modal';
import IconButton from './ui/IconButton';
import Button from './ui/Button';
import Input from './ui/Input';

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing(5)};
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const ItemsList = styled.div`
  overflow-y: auto;
  flex: 1;
  margin-bottom: ${({ theme }) => theme.spacing(5)};
  padding-right: ${({ theme }) => theme.spacing(2)};
`;

const ItemRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacing(2)};
  border-radius: ${({ theme }) => theme.radii.md};
  margin-bottom: ${({ theme }) => theme.spacing(2.5)};
  gap: ${({ theme }) => theme.spacing(2)};
`;

const DeleteButton = styled.button`
  background: rgba(229, 72, 77, 0.1);
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: pointer;
  width: 34px;
  height: 34px;
  color: ${({ theme }) => theme.colors.error};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background ${({ theme }) => theme.transitions.fast},
    color ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.error};
    color: #fff;
  }
`;

const AddSection = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing(5)};
  gap: ${({ theme }) => theme.spacing(3)};
`;

const AddButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
  width: 46px;
  height: 46px;
  flex-shrink: 0;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Footer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};
`;

const EmptyText = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: ${({ theme }) => theme.spacing(9)};
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
    <Modal visible={visible} onClose={onCancel}>
      <Header>
        <Title>{title}</Title>
        <IconButton variant="ghost" onClick={onCancel} aria-label="Cerrar">
          <IoClose size={22} />
        </IconButton>
      </Header>

      <ItemsList>
        {editedItems.map((item, index) => (
          <ItemRow key={index}>
            <Input
              value={item}
              onChange={(e) => handleItemChange(index, e.target.value)}
              style={{ background: 'transparent', border: 'none', height: 'auto', padding: 0 }}
            />
            {allowDelete && (
              <DeleteButton onClick={() => handleDeleteItem(index)}>
                <IoTrashOutline size={18} />
              </DeleteButton>
            )}
          </ItemRow>
        ))}
        {editedItems.length === 0 && (
          <EmptyText>No hay elementos en la lista</EmptyText>
        )}
      </ItemsList>

      {allowAdd && (
        <AddSection>
          <Input
            placeholder={placeholder}
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <AddButton onClick={handleAddItem} disabled={!newItem.trim()}>
            <IoAddCircle size={26} />
          </AddButton>
        </AddSection>
      )}

      <Footer>
        {onReset && (
          <Button variant="ghost" onClick={handleLocalReset} style={{ color: '#E5484D' }}>
            Restablecer valores por defecto
          </Button>
        )}
        <ButtonGroup>
          <Button variant="secondary" fullWidth onClick={onCancel}>Cancelar</Button>
          <Button fullWidth onClick={handleSave}>Guardar</Button>
        </ButtonGroup>
      </Footer>
    </Modal>
  );
}
