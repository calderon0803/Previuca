import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FEEDBACK_TYPES } from '../services/feedbackService';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Textarea from './ui/Textarea';

const ModalTitle = styled.h3`
  color: ${({ theme }) => theme.colors.text.primary};
  margin-top: 0;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  text-align: center;
`;

const TypeList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

const TypeOption = styled.button`
  text-align: left;
  padding: ${({ theme }) => theme.spacing(3)} ${({ theme }) => theme.spacing(4)};
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid ${({ theme, $active }) => ($active ? theme.colors.primary : theme.colors.border)};
  background: ${({ theme, $active }) => ($active ? theme.colors.primaryMuted : theme.colors.surfaceRaised)};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  cursor: pointer;
`;

const ErrorText = styled.p`
  color: ${({ theme }) => theme.colors.error};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  text-align: center;
  margin: ${({ theme }) => theme.spacing(3)} 0 0 0;
`;

const SuccessText = styled.p`
  color: ${({ theme }) => theme.colors.success};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  text-align: center;
  padding: ${({ theme }) => theme.spacing(4)} 0;
  margin: 0;
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
        <Modal visible={visible} onClose={onClose}>
            {sent ? (
                <>
                    <SuccessText>¡Gracias! Hemos recibido tu mensaje.</SuccessText>
                    <Button fullWidth onClick={onClose}>Cerrar</Button>
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
                    <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                        <Button variant="secondary" fullWidth onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button
                            fullWidth
                            disabled={!type || !message.trim() || submitting}
                            onClick={handleSubmit}
                        >
                            {submitting ? 'Enviando...' : 'Enviar'}
                        </Button>
                    </div>
                </>
            )}
        </Modal>
    );
}
