import React, { useState, useEffect, useRef } from 'react';
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

const CountHint = styled.p`
  margin: 0 0 ${({ theme }) => theme.spacing(4)};
  font-size: 13px;
  color: ${({ theme, $warn }) => ($warn ? theme.colors.danger : theme.colors.text.faint)};
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
  /* overflow-y:auto recorta el contenido justo en el borde de esta caja —
     por los cuatro lados, no solo arriba/abajo — y el anillo de foco
     (box-shadow, 2px hacia fuera) se cortaba: por los lados en cualquier
     fila, y arriba/abajo en la primera y la última. Margen negativo +
     padding igual en los cuatro lados le da sitio al anillo sin mover ni un
     píxel dónde caen las filas ni el hueco hasta el campo de añadir.  */
  margin: -2px -2px calc(${({ theme }) => theme.spacing(3.5)} - 2px);
  padding: 2px;

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

  /* El campo de dentro no tiene esquinas propias — el redondeado es el de
     esta fila, así que el anillo de foco va aquí, no en el input, o saldría
     cuadrado sobre una fila redonda. */
  &:focus-within {
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.accent};
  }
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

  &:focus-visible {
    box-shadow: none;
  }
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

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.border};
    color: ${({ theme }) => theme.colors.text.primary};
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
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
    minItems = 0,
    maxItems = Infinity,
    requireEven = false,
    title = 'Editar opciones',
    placeholder = 'Añadir nuevo...',
}) {
    const [editedItems, setEditedItems] = useState([...items]);
    const [newItem, setNewItem] = useState('');
    const addInputRef = useRef(null);

    useEffect(() => {
        if (visible) {
            setEditedItems([...items]);
            setNewItem('');
            // La hoja anima su entrada; sin esperar a que termine, el foco
            // llega antes de que el campo esté listo y el teclado no sube.
            const focusTimer = setTimeout(() => addInputRef.current?.focus(), 250);
            return () => clearTimeout(focusTimer);
        }
    }, [visible, items]);

    const count = editedItems.length;
    const atMin = count <= minItems;
    const atMax = count >= maxItems;
    const isOdd = requireEven && count % 2 !== 0;
    const hasBounds = minItems > 0 || Number.isFinite(maxItems);
    const canSave = count >= minItems && !isOdd;

    const handleItemChange = (index, value) => {
        const newItems = [...editedItems];
        newItems[index] = value;
        setEditedItems(newItems);
    };

    const handleAddItem = () => {
        if (!newItem.trim() || atMax) return;
        setEditedItems([...editedItems, newItem.trim()]);
        setNewItem('');
        // Vuelve al campo para poder seguir añadiendo sin tener que tocarlo
        // otra vez cada vez.
        addInputRef.current?.focus();
    };

    const handleDeleteItem = (index) => {
        if (atMin) return;
        setEditedItems(editedItems.filter((_, i) => i !== index));
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleAddItem();
    };

    // La hoja va sobre un layout con position:fixed, así que el navegador no
    // desplaza nada solo porque un campo reciba el foco: si no lo forzamos,
    // el teclado en pantalla tapa el campo que se está editando. El retraso
    // deja que el teclado termine de aparecer antes de calcular dónde hay
    // que desplazarse.
    const scrollFieldIntoView = (e) => {
        const target = e.target;
        setTimeout(() => target.scrollIntoView({ block: 'center', behavior: 'smooth' }), 300);
    };

    const countHint = !hasBounds
        ? null
        : isOdd
            ? `Tiene que ser un número par — añade o quita una más (llevas ${count}).`
            : Number.isFinite(maxItems)
                ? `${count} de ${maxItems}${minItems > 0 ? ` · mínimo ${minItems}` : ''}`
                : `Mínimo ${minItems}`;

    return (
        <BottomSheet visible={visible} onClose={onCancel}>
            <Header>
                <SheetTitle>{title}</SheetTitle>
                <CloseButton onClick={onCancel} aria-label="Cerrar">
                    <X size={20} />
                </CloseButton>
            </Header>

            {countHint && <CountHint $warn={isOdd}>{countHint}</CountHint>}

            <List>
                {editedItems.length === 0 ? (
                    <Empty>No hay nada en la lista.</Empty>
                ) : (
                    editedItems.map((item, index) => (
                        <Row key={index}>
                            <RowInput
                                value={item}
                                onChange={(e) => handleItemChange(index, e.target.value)}
                                onFocus={scrollFieldIntoView}
                            />
                            {allowDelete && (
                                <RowAction
                                    onClick={() => handleDeleteItem(index)}
                                    disabled={atMin}
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
                        ref={addInputRef}
                        placeholder={placeholder}
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={scrollFieldIntoView}
                        disabled={atMax}
                    />
                    <AddButton
                        onClick={handleAddItem}
                        disabled={!newItem.trim() || atMax}
                        aria-label="Añadir"
                    >
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
                    <Button size="lg" disabled={!canSave} onClick={() => onSave(editedItems)}>
                        Guardar
                    </Button>
                </ActionRow>
            </Actions>
        </BottomSheet>
    );
}
