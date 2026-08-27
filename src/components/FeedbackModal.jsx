import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FEEDBACK_TYPES } from '../services/feedbackService';
import BottomSheet, { SheetTitle } from './ui/BottomSheet';
import Button from './ui/Button';
import Textarea from './ui/Textarea';

const ModalTitle = styled(SheetTitle)`
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

const TypeList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

const TypeOption = styled.button`
  text-align: left;
  min-height: 48px;
  padding: ${({ theme }) => theme.spacing(3)} ${({ theme }) => theme.spacing(3.5)};
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid
    ${({ theme, $active }) => ($active ? theme.colors.accent : theme.colors.borderStrong)};
  background: ${({ theme, $active }) => ($active ? theme.colors.accentTint : 'transparent')};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 15px;
  cursor: pointer;
  transition: border-color ${({ theme }) => theme.transitions.fast},
    background ${({ theme }) => theme.transitions.fast};

  &:hover {
    border-color: ${({ theme, $active }) =>
        $active ? theme.colors.accent : theme.colors.borderHover};
  }
`;

const ErrorText = styled.p`
  color: ${({ theme }) => theme.colors.error};
  font-size: 13.5px;
  margin: ${({ theme }) => theme.spacing(3)} 0 0;
`;

const SuccessText = styled.p`
  color: ${({ theme }) => theme.colors.success};
  font-size: 16px;
  padding: ${({ theme }) => theme.spacing(2)} 0 ${({ theme }) => theme.spacing(5)};
  margin: 0;
`;

const Actions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing(2.5)};
  margin-top: ${({ theme }) => theme.spacing(5)};
`;

export default function FeedbackModal({ visible, onClose, onSubmit, submitting, error }) {
    const [type, setType] = useState(null);
    const [message, setMessage] = useState('');
    const [sent, setSent] = useState(false);

    useEffect(() => {
        if (visible) {
            setType(null);
            setMessage('');
            setSent(false);
        }
    }, [visible]);

    const handleSubmit = async () => {
        const result = await onSubmit(type, message);
        if (result?.success) setSent(true);
    };

    return (
        <BottomSheet visible={visible} onClose={onClose}>
            {sent ? (
                <>
                    <SuccessText>¡Gracias! Hemos recibido tu mensaje.</SuccessText>
                    <Button size="lg" fullWidth onClick={onClose}>Cerrar</Button>
                </>
            ) : (
                <>
                    <ModalTitle>Reportar un problema o sugerencia</ModalTitle>
                    <TypeList>
                        {FEEDBACK_TYPES.map((option) => (
                            <TypeOption
                                key={option.value}
                                type="button"
                                $active={type === option.value}
                                onClick={() => setType(option.value)}
                            >
                                {option.label}
                            </TypeOption>
                        ))}
                    </TypeList>
                    <Textarea
                        placeholder="Cuéntanos qué ha pasado, o qué añadirías..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        disabled={submitting}
                    />
                    {error && <ErrorText>{error}</ErrorText>}
                    <Actions>
                        <Button variant="secondary" size="md" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button
                            size="md"
                            disabled={!type || !message.trim() || submitting}
                            onClick={handleSubmit}
                        >
                            {submitting ? 'Enviando...' : 'Enviar'}
                        </Button>
                    </Actions>
                </>
            )}
        </BottomSheet>
    );
}
