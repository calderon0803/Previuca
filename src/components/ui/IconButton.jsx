import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const Wrapper = styled(motion.button)`
  width: ${({ $size }) => ($size === 'sm' ? '36px' : '42px')};
  height: ${({ $size }) => ($size === 'sm' ? '36px' : '42px')};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme, $variant }) =>
    $variant === 'ghost' ? 'transparent' : theme.colors.surfaceRaised};
  border: 1px solid ${({ theme, $variant }) =>
    $variant === 'ghost' ? 'transparent' : theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text.primary};
  position: relative;
  flex-shrink: 0;
  transition: background ${({ theme }) => theme.transitions.fast},
    border-color ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
    border-color: ${({ theme }) => theme.colors.borderStrong};
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const CountBadge = styled.span`
  position: absolute;
  top: -6px;
  right: -6px;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.pill};
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  border: 2px solid ${({ theme }) => theme.colors.background};
`;

export default function IconButton({ children, size = 'md', variant = 'default', badge, ...props }) {
  return (
    <Wrapper $size={size} $variant={variant} whileTap={{ scale: 0.92 }} {...props}>
      {children}
      {badge != null && badge > 0 && <CountBadge>{badge}</CountBadge>}
    </Wrapper>
  );
}
