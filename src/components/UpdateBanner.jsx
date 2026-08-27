import React from 'react';
import styled from 'styled-components';
import { RefreshCw } from 'lucide-react';
import { useAppUpdate } from '../hooks/useAppUpdate';

const Wrap = styled.div`
  position: fixed;
  left: ${({ theme }) => theme.spacing(4)};
  right: ${({ theme }) => theme.spacing(4)};
  bottom: ${({ theme }) => theme.spacing(4)};
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => theme.spacing(4)};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text.primary};
  box-shadow: ${({ theme }) => theme.shadows.sheet};
`;

const Text = styled.span`
  font-size: 14px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

const ReloadButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1.5)};
  flex-shrink: 0;
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.accent};
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(3)};
  color: ${({ theme }) => theme.colors.accentText};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  font-size: 13.5px;
  cursor: pointer;
  transition: background ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.accentTint};
  }
`;

export default function UpdateBanner() {
    const { updateAvailable, reloadApp } = useAppUpdate();

    if (!updateAvailable) return null;

    return (
        <Wrap>
            <Text>Hay una nueva versión de Previuca</Text>
            <ReloadButton onClick={reloadApp}>
                <RefreshCw size={14} />
                Actualizar
            </ReloadButton>
        </Wrap>
    );
}
