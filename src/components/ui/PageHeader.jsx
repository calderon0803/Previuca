import React from 'react';
import styled from 'styled-components';
import { IoArrowBack } from 'react-icons/io5';
import IconButton from './IconButton';

const Bar = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(4)};
  padding: ${({ theme }) => theme.spacing(4)} ${({ theme }) => theme.spacing(5)};
  background: ${({ theme }) => theme.colors.background};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  position: sticky;
  top: 0;
  z-index: 10;
`;

const LeftGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(3)};
  min-width: 0;
  flex: 1;
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.snug};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export default function PageHeader({ title, onBack, rightAction }) {
  return (
    <Bar>
      <LeftGroup>
        {onBack && (
          <IconButton variant="ghost" onClick={onBack} aria-label="Volver">
            <IoArrowBack size={20} />
          </IconButton>
        )}
        <Title>{title}</Title>
      </LeftGroup>
      {rightAction}
    </Bar>
  );
}
