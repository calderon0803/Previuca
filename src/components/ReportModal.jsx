import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { REPORT_REASONS } from '../services/salseosService';
import Modal from './ui/Modal';
import Button from './ui/Button';

const ModalTitle = styled.h3`
  color: ${({ theme }) => theme.colors.text.primary};
  margin-top: 0;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  text-align: center;
`;

const ReasonList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const ReasonOption = styled.button`
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

export default function ReportModal({ visible, onClose, onSubmit, submitting, error }) {
    const [reason, setReason] = useState(null);

    useEffect(() => {
        if (!visible) setReason(null);
    }, [visible]);

    return (
        <Modal visible={visible} onClose={onClose}>
            <ModalTitle>¿Por qué reportas este mensaje?</ModalTitle>
            <ReasonList>
                {REPORT_REASONS.map((option) => (
                    <ReasonOption
                        key={option.value}
                        type="button"
                        $active={reason === option.value}
                        onClick={() => setReason(option.value)}
                    >
                        {option.label}
                    </ReasonOption>
                ))}
            </ReasonList>
            {error && <ErrorText>{error}</ErrorText>}
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <Button variant="secondary" fullWidth onClick={onClose}>
                    Cancelar
                </Button>
                <Button fullWidth disabled={!reason || submitting} onClick={() => onSubmit(reason)}>
                    {submitting ? 'Enviando...' : 'Reportar'}
                </Button>
            </div>
        </Modal>
    );
}
