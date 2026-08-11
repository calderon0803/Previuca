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
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  box-shadow: ${({ theme }) => theme.shadows.lg};
`;

const Text = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

const ReloadButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1.5)};
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(3)};
  color: #fff;
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  cursor: pointer;
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
