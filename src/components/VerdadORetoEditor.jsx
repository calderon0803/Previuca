import React, { useState } from 'react';
import styled from 'styled-components';
import { IoClose, IoTrashOutline, IoAddCircle } from 'react-icons/io5';
import { motion, AnimatePresence } from 'framer-motion';

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContainer = styled(motion.div)`
  background-color: #fff;
  border-radius: 24px;
  width: 100%;
  max-width: 500px;
  height: 80vh;
  padding: 24px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  color: #333;
`;

const Tabs = styled.div`
  display: flex;
  margin-bottom: 16px;
  background: #f0f0f0;
  border-radius: 12px;
  padding: 4px;
`;

const Tab = styled.button`
  flex: 1;
  border: none;
  background: ${props => props.active ? '#fff' : 'transparent'};
  padding: 10px;
  border-radius: 10px;
  font-weight: 600;
  color: ${props => props.active ? '#333' : '#666'};
  cursor: pointer;
  box-shadow: ${props => props.active ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'};
  transition: all 0.2s;
`;

const List = styled.div`
  flex: 1;
  overflow-y: auto;
  margin-bottom: 16px;
  padding-right: 8px;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 3px;
  }
`;

const Item = styled.div`
  display: flex;
  align-items: center;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 12px;
  margin-bottom: 8px;
`;

const ItemText = styled.p`
  flex: 1;
  margin: 0;
  margin-right: 8px;
  font-size: 14px;
  color: #333;
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: #ff6b6b;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
`;

const AddSection = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
`;

const Input = styled.input`
  flex: 1;
  border: none;
  background: #f0f0f0;
  padding: 12px;
  border-radius: 12px;
  outline: none;
  
  &:focus {
    box-shadow: 0 0 0 2px #667eea;
  }
`;

const AddButton = styled.button`
  background: none;
  border: none;
  color: #667eea;
  cursor: pointer;
  padding: 4px;
  
  &:disabled {
    opacity: 0.5;
  }
`;

const Footer = styled.div`
  display: flex;
  gap: 12px;
`;

const Button = styled.button`
  flex: 1;
  padding: 14px;
  border-radius: 12px;
  border: none;
  font-weight: bold;
  cursor: pointer;
`;

const CancelButton = styled(Button)`
  background: #f0f0f0;
  color: #666;
`;

const SaveButton = styled(Button)`
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
`;

export default function VerdadORetoEditor({ visible, verdades, retos, onSave, onCancel }) {
    const [activeTab, setActiveTab] = useState('verdades'); // 'verdades' | 'retos'
    const [editedVerdades, setEditedVerdades] = useState([]);
    const [editedRetos, setEditedRetos] = useState([]);
    const [newItem, setNewItem] = useState('');

    React.useEffect(() => {
        if (visible) {
            setEditedVerdades([...verdades]);
            setEditedRetos([...retos]);
            setNewItem('');
        }
    }, [visible, verdades, retos]);

    const currentList = activeTab === 'verdades' ? editedVerdades : editedRetos;

    const handleAdd = () => {
        if (newItem.trim()) {
            if (activeTab === 'verdades') {
                setEditedVerdades([...editedVerdades, newItem.trim()]);
            } else {
                setEditedRetos([...editedRetos, newItem.trim()]);
            }
            setNewItem('');
        }
    };

    const handleDelete = (index) => {
        if (activeTab === 'verdades') {
            setEditedVerdades(editedVerdades.filter((_, i) => i !== index));
        } else {
            setEditedRetos(editedRetos.filter((_, i) => i !== index));
        }
    };

    const handleSave = () => {
        onSave(editedVerdades, editedRetos);
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
                        onClick={e => e.stopPropagation()}
                    >
                        <Header>
                            <Title>Editar Contenido</Title>
                            <CloseButton onClick={onCancel}><IoClose size={24} /></CloseButton>
                        </Header>

                        <Tabs>
                            <Tab
                                active={activeTab === 'verdades'}
                                onClick={() => setActiveTab('verdades')}
                            >
                                Verdades
                            </Tab>
                            <Tab
                                active={activeTab === 'retos'}
                                onClick={() => setActiveTab('retos')}
                            >
                                Retos
                            </Tab>
                        </Tabs>

                        <List>
                            {currentList.map((item, index) => (
                                <Item key={index}>
                                    <ItemText>{index + 1}. {item}</ItemText>
                                    <DeleteButton onClick={() => handleDelete(index)}>
                                        <IoTrashOutline size={20} />
                                    </DeleteButton>
                                </Item>
                            ))}
                        </List>

                        <AddSection>
                            <Input
                                placeholder={`Añadir ${activeTab === 'verdades' ? 'verdad' : 'reto'}...`}
                                value={newItem}
                                onChange={e => setNewItem(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                            />
                            <AddButton onClick={handleAdd} disabled={!newItem.trim()}>
                                <IoAddCircle size={32} />
                            </AddButton>
                        </AddSection>

                        <Footer>
                            <CancelButton onClick={onCancel}>Cancelar</CancelButton>
                            <SaveButton onClick={handleSave}>Guardar Todo</SaveButton>
                        </Footer>
                    </ModalContainer>
                </Overlay>
            )}
        </AnimatePresence>
    );
}
