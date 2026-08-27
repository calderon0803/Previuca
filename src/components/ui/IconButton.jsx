import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

// Botón de icono: 44×44, transparente, sin borde; hover `background: #292b31`.
// Con `variant="outline"` toma un borde de acento (o del color que se le pase).

const Wrapper = styled(motion.button)`
  width: ${({ $size, $wide }) => ($wide ? 'auto' : $size === 'sm' ? '40px' : '44px')};
  min-width: ${({ $size }) => ($size === 'sm' ? '40px' : '44px')};
  padding: ${({ $wide }) => ($wide ? '0 11px' : '0')};
  height: ${({ $size }) => ($size === 'sm' ? '40px' : '44px')};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: transparent;
  border: 1px solid
    ${({ theme, $variant, $color }) =>
        $variant === 'outline' ? $color || theme.colors.accent : 'transparent'};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  color: ${({ theme, $variant }) =>
        $variant === 'outline' ? theme.colors.accentText : theme.colors.text.secondary};
  position: relative;
  flex-shrink: 0;
  transition: background ${({ theme }) => theme.transitions.fast},
    border-color ${({ theme }) => theme.transitions.fast},
    color ${({ theme }) => theme.transitions.fast};

  &:hover:not(:disabled) {
    background: ${({ theme, $variant }) =>
        $variant === 'outline' ? theme.colors.accentTint : theme.colors.border};
    color: ${({ theme }) => theme.colors.text.primary};
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

const Count = styled.span`
  font-size: 12.5px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: inherit;
  line-height: 1;
`;

export default function IconButton({
    children,
    size = 'md',
    variant = 'ghost',
    color,
    badge,
    ...props
}) {
    return (
        <Wrapper
            $size={size}
            $variant={variant}
            $color={color}
            $wide={badge != null}
            whileTap={{ scale: 0.94 }}
            {...props}
        >
            {children}
            {badge != null && <Count>{badge}</Count>}
        </Wrapper>
    );
}
