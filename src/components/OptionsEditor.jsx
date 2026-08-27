import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { X, Plus, CircleMinus } from 'lucide-react';
import BottomSheet, { SheetTitle } from './ui/BottomSheet';
import Button from './ui/Button';
import Input from './ui/Input';

// Editor de listas (frases de Yo Nunca, casillas de la Ruleta) como hoja
// inferior, con el mismo lenguaje que la hoja de jugadores.

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(3)};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

const CloseButton = styled.button`
  width: 40px;
  height: 40px;
  margin: -6px -8px 0 0;
  flex-shrink: 0;
  border-radius: ${({ theme }) => theme.radii.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text.muted};

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  max-height: 42vh;
  overflow-y: auto;
  margin-bottom: ${({ theme }) => theme.spacing(3.5)};

  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  flex-shrink: 0;
  background: ${({ theme }) => theme.colors.surfaceRaised};
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: 0 ${({ theme }) => theme.spacing(2)} 0 ${({ theme }) => theme.spacing(3.5)};
`;

const RowInput = styled.input`
  flex: 1;
  min-width: 0;
  height: 50px;
  background: transparent;
  border: none;
  outline: none;
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: inherit;
  font-size: 15px;
`;

const RowAction = styled.button`
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: ${({ theme }) => theme.radii.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text.muted};
  transition: background ${({ theme }) => theme.transitions.fast},
    color ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.border};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const Empty = styled.p`
  margin: ${({ theme }) => theme.spacing(3.5)} 0 ${({ theme }) => theme.spacing(4.5)};
  text-align: center;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.faint};
`;

const AddRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2.5)};
  margin-bottom: ${({ theme }) => theme.spacing(3.5)};
`;

const AddButton = styled.button`
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.accentText};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background ${({ theme }) => theme.transitions.fast};

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.accentTint};
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

const Actions = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2.5)};
`;

const ActionRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing(2.5)};
`;

export default function OptionsEditor({
    visible,
    items,
    onSave,
    onCancel,
    onReset,
    allowAdd = true,
    allowDelete = true,
    title = 'Editar opciones',
    placeholder = 'Añadir nuevo...',
}) {
    const [editedItems, setEditedItems] = useState([...items]);
    const [newItem, setNewItem] = useState('');

    useEffect(() => {
        if (visible) {
            setEditedItems([...items]);
            setNewItem('');
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
        if (e.key === 'Enter') handleAddItem();
    };

    return (
        <BottomSheet visible={visible} onClose={onCancel}>
            <Header>
                <SheetTitle>{title}</SheetTitle>
                <CloseButton onClick={onCancel} aria-label="Cerrar">
                    <X size={20} />
                </CloseButton>
            </Header>

            <List>
                {editedItems.length === 0 ? (
                    <Empty>No hay nada en la lista.</Empty>
                ) : (
                    editedItems.map((item, index) => (
                        <Row key={index}>
                            <RowInput
                                value={item}
                                onChange={(e) => handleItemChange(index, e.target.value)}
                            />
                            {allowDelete && (
                                <RowAction
                                    onClick={() => setEditedItems(editedItems.filter((_, i) => i !== index))}
                                    aria-label="Quitar"
                                >
                                    <CircleMinus size={18} />
                                </RowAction>
                            )}
                        </Row>
                    ))
                )}
            </List>

            {allowAdd && (
                <AddRow>
                    <Input
                        placeholder={placeholder}
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <AddButton onClick={handleAddItem} disabled={!newItem.trim()} aria-label="Añadir">
                        <Plus size={20} />
                    </AddButton>
                </AddRow>
            )}

            <Actions>
                {onReset && (
                    <Button variant="ghost" size="md" onClick={onReset}>
                        Restablecer valores por defecto
                    </Button>
                )}
                <ActionRow>
                    <Button variant="secondary" size="lg" onClick={onCancel}>
                        Cancelar
                    </Button>
                    <Button size="lg" onClick={() => onSave(editedItems)}>
                        Guardar
                    </Button>
                </ActionRow>
            </Actions>
        </BottomSheet>
    );
}
