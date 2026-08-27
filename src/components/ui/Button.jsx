import React from 'react';
import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';
import { withAlpha } from '../../utils/color';

// Botones outline: borde de 1px sobre transparente, con hover tintado del
// propio color. Nunca rellenos.

const sizeStyles = {
    sm: css`
    height: 40px;
    padding: 0 ${({ theme }) => theme.spacing(3)};
    font-size: 14px;
  `,
    md: css`
    height: 48px;
    padding: 0 ${({ theme }) => theme.spacing(4)};
    font-size: 15px;
  `,
    lg: css`
    height: 50px;
    padding: 0 ${({ theme }) => theme.spacing(5)};
    font-size: 16px;
  `,
};

const variantStyles = {
    // El color lo pone el juego o la actividad; por defecto, el acento.
    primary: css`
    background: transparent;
    color: ${({ theme }) => theme.colors.text.primary};
    border: 1px solid ${({ theme, $color }) => $color || theme.colors.accent};

    &:hover:not(:disabled) {
      background: ${({ theme, $color }) => withAlpha($color || theme.colors.accent, 0.14)};
    }

    &:active:not(:disabled) {
      background: ${({ theme, $color }) => withAlpha($color || theme.colors.accent, 0.22)};
    }
  `,
    secondary: css`
    background: transparent;
    color: ${({ theme }) => theme.colors.text.primary};
    border: 1px solid ${({ theme }) => theme.colors.borderStrong};

    &:hover:not(:disabled) {
      border-color: ${({ theme }) => theme.colors.borderHover};
    }
  `,
    ghost: css`
    background: transparent;
    color: ${({ theme }) => theme.colors.text.muted};
    border: 1px solid transparent;

    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors.border};
      color: ${({ theme }) => theme.colors.text.primary};
    }
  `,
    danger: css`
    background: transparent;
    color: ${({ theme }) => theme.colors.danger};
    border: 1px solid ${({ theme }) => theme.colors.dangerBorder};

    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors.dangerTint};
    }
  `,
};

const StyledButton = styled(motion.button)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(2)};
  border-radius: ${({ theme }) => theme.radii.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  white-space: nowrap;
  transition: background ${({ theme }) => theme.transitions.fast},
    border-color ${({ theme }) => theme.transitions.fast},
    color ${({ theme }) => theme.transitions.fast};
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  ${({ $size }) => sizeStyles[$size]}
  ${({ $variant }) => variantStyles[$variant]}
`;

export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    color,
    fullWidth = false,
    disabled = false,
    ...props
}) {
    return (
        <StyledButton
            $variant={variant}
            $size={size}
            $color={color}
            $fullWidth={fullWidth}
            disabled={disabled}
            whileTap={disabled ? undefined : { scale: 0.985 }}
            {...props}
        >
            {children}
        </StyledButton>
    );
}
