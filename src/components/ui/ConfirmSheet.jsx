import React from 'react';
import styled from 'styled-components';
import BottomSheet from './BottomSheet';
import Button from './Button';

// Confirmación destructiva: una sola hoja reutilizable en toda la app.
// Se le pasa `{ title, text, cta, run, tone }`; `tone: 'danger'` para lo que
// borra datos, `'game'` (por defecto) para acciones de juego.

const Title = styled.h2`
  font-size: 22px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  letter-spacing: -0.02em;
  margin: 0 0 ${({ theme }) => theme.spacing(2)};
`;

const Text = styled.p`
  font-size: 14px;
  line-height: 1.55;
  color: ${({ theme }) => theme.colors.text.muted};
  margin: 0 0 ${({ theme }) => theme.spacing(5)};
`;

const Actions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing(2.5)};
`;

export default function ConfirmSheet({ confirm, onClose }) {
    const handleRun = () => {
        confirm?.run?.();
        onClose();
    };

    return (
        <BottomSheet visible={!!confirm} onClose={onClose}>
            {confirm && (
                <>
                    <Title>{confirm.title}</Title>
                    {confirm.text && <Text>{confirm.text}</Text>}
                    <Actions>
                        <Button variant="secondary" size="md" onClick={onClose}>
                            Cancelar
                        </Button>
                        {confirm.tone === 'danger' ? (
                            <Button variant="danger" size="md" onClick={handleRun}>
                                {confirm.cta}
                            </Button>
                        ) : (
                            <Button variant="primary" size="md" color="#6E56CF" onClick={handleRun}>
                                {confirm.cta}
                            </Button>
                        )}
                    </Actions>
                </>
            )}
        </BottomSheet>
    );
}
