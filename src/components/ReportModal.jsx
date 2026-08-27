import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { REPORT_REASONS } from '../services/salseosService';
import BottomSheet, { SheetTitle } from './ui/BottomSheet';
import Button from './ui/Button';

// El rediseño pide una hoja de confirmación para reportar. Se mantiene la
// elección de motivo que ya existía (el equipo organizador la necesita) con el
// lenguaje de la hoja: título, texto explicativo y dos acciones al 50%.

const Text = styled.p`
  margin: ${({ theme }) => theme.spacing(2)} 0 ${({ theme }) => theme.spacing(4)};
  font-size: 14px;
  line-height: 1.55;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const Reasons = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(5)};
`;

const Reason = styled.button`
  text-align: left;
  min-height: 48px;
  padding: ${({ theme }) => theme.spacing(3)} ${({ theme }) => theme.spacing(3.5)};
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid
    ${({ theme, $active }) => ($active ? theme.colors.accent : theme.colors.borderStrong)};
  background: ${({ theme, $active }) => ($active ? theme.colors.accentTint : 'transparent')};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 15px;
  transition: border-color ${({ theme }) => theme.transitions.fast},
    background ${({ theme }) => theme.transitions.fast};

  &:hover {
    border-color: ${({ theme, $active }) =>
        $active ? theme.colors.accent : theme.colors.borderHover};
  }
`;

const ErrorText = styled.p`
  margin: 0 0 ${({ theme }) => theme.spacing(3)};
  font-size: 13.5px;
  color: ${({ theme }) => theme.colors.error};
`;

const Actions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing(2.5)};
`;

export default function ReportModal({ visible, onClose, onSubmit, submitting, error }) {
    const [reason, setReason] = useState(null);

    useEffect(() => {
        if (!visible) setReason(null);
    }, [visible]);

    return (
        <BottomSheet visible={visible} onClose={onClose}>
            <SheetTitle>¿Reportar este mensaje?</SheetTitle>
            <Text>
                El equipo organizador lo revisará. No se avisa a quien lo escribió.
            </Text>
            <Reasons>
                {REPORT_REASONS.map((option) => (
                    <Reason
                        key={option.value}
                        type="button"
                        $active={reason === option.value}
                        onClick={() => setReason(option.value)}
                    >
                        {option.label}
                    </Reason>
                ))}
            </Reasons>
            {error && <ErrorText>{error}</ErrorText>}
            <Actions>
                <Button variant="secondary" size="md" onClick={onClose}>
                    Cancelar
                </Button>
                <Button
                    variant="danger"
                    size="md"
                    disabled={!reason || submitting}
                    onClick={() => onSubmit(reason)}
                >
                    {submitting ? 'Enviando...' : 'Reportar'}
                </Button>
            </Actions>
        </BottomSheet>
    );
}
