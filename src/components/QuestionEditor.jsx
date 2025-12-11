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
  max-height: 80vh;
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
  justify-content: center;
  color: #333;
  
  &:hover {
    opacity: 0.7;
  }
`;

const QuestionsList = styled.div`
  overflow-y: auto;
  max-height: 300px;
  margin-bottom: 16px;
  padding-right: 8px;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }
  &::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 3px;
  }
`;

const QuestionItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #f5f5f5;
  padding: 12px;
  border-radius: 12px;
  margin-bottom: 8px;
`;

const QuestionText = styled.p`
  flex: 1;
  font-size: 14px;
  color: #333;
  margin: 0;
  margin-right: 8px;
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  color: #ff6b6b;
  display: flex;
  align-items: center;
  
  &:hover {
    opacity: 0.8;
  }
`;

const AddSection = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  gap: 8px;
`;

const Input = styled.input`
  flex: 1;
  background-color: #f5f5f5;
  border: none;
  border-radius: 12px;
  padding: 12px;
  font-size: 16px;
  color: #333;
  outline: none;
  
  &:focus {
    box-shadow: 0 0 0 2px #667eea;
  }
`;

const AddButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: #667eea;
  display: flex;
  align-items: center;
  
  &:hover {
    transform: scale(1.1);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 12px;
`;

const CancelButton = styled.button`
  flex: 1;
  padding: 16px;
  border-radius: 12px;
  background-color: #f5f5f5;
  border: none;
  color: #666;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  
  &:hover {
    background-color: #e0e0e0;
  }
`;

const SaveButton = styled.button`
  flex: 1;
  border: none;
  border-radius: 12px;
  padding: 16px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 0.9;
  }
`;

export default function QuestionEditor({ visible, questions, onSave, onCancel }) {
    const [editedQuestions, setEditedQuestions] = useState([...questions]);
    const [newQuestion, setNewQuestion] = useState('');

    // Reset local state when opening
    React.useEffect(() => {
        if (visible) {
            setEditedQuestions([...questions]);
        }
    }, [visible, questions]);

    const handleAddQuestion = () => {
        if (newQuestion.trim()) {
            setEditedQuestions([...editedQuestions, newQuestion.trim()]);
            setNewQuestion('');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleAddQuestion();
        }
    };

    const handleDeleteQuestion = (index) => {
        const updated = editedQuestions.filter((_, i) => i !== index);
        setEditedQuestions(updated);
    };

    const handleSave = () => {
        onSave(editedQuestions);
    };

    const handleCancel = () => {
        setNewQuestion('');
        onCancel();
    };

    return (
        <AnimatePresence>
            {visible && (
                <Overlay
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleCancel}
                >
                    <ModalContainer
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Header>
                            <Title>Editar Preguntas</Title>
                            <CloseButton onClick={handleCancel}>
                                <IoClose size={28} />
                            </CloseButton>
                        </Header>

                        <QuestionsList>
                            {editedQuestions.map((question, index) => (
                                <QuestionItem key={index}>
                                    <QuestionText>
                                        {index + 1}. {question}
                                    </QuestionText>
                                    <DeleteButton onClick={() => handleDeleteQuestion(index)}>
                                        <IoTrashOutline size={20} />
                                    </DeleteButton>
                                </QuestionItem>
                            ))}
                        </QuestionsList>

                        <AddSection>
                            <Input
                                placeholder="Yo nunca..."
                                value={newQuestion}
                                onChange={(e) => setNewQuestion(e.target.value)}
                                onKeyDown={handleKeyDown}
                                autoFocus
                            />
                            <AddButton onClick={handleAddQuestion} disabled={!newQuestion.trim()}>
                                <IoAddCircle size={32} />
                            </AddButton>
                        </AddSection>

                        <Actions>
                            <CancelButton onClick={handleCancel}>Cancelar</CancelButton>
                            <SaveButton onClick={handleSave}>
                                Guardar ({editedQuestions.length})
                            </SaveButton>
                        </Actions>
                    </ModalContainer>
                </Overlay>
            )}
        </AnimatePresence>
    );
}
