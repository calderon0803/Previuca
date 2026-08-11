import React from 'react';
import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';

const sizeStyles = {
  sm: css`
    height: 36px;
    padding: 0 ${({ theme }) => theme.spacing(3)};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
  `,
  md: css`
    height: 44px;
    padding: 0 ${({ theme }) => theme.spacing(4)};
    font-size: ${({ theme }) => theme.typography.fontSize.md};
  `,
  lg: css`
    height: 50px;
    padding: 0 ${({ theme }) => theme.spacing(5)};
    font-size: ${({ theme }) => theme.typography.fontSize.md};
  `,
};

const variantStyles = {
  primary: css`
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.surface};

    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors.primaryHover};
    }

    &:active:not(:disabled) {
      background: ${({ theme }) => theme.colors.primaryActive};
    }
  `,
  secondary: css`
    background: ${({ theme }) => theme.colors.surfaceRaised};
    color: ${({ theme }) => theme.colors.text.primary};
    border: 1px solid ${({ theme }) => theme.colors.border};

    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors.surfaceHover};
      border-color: ${({ theme }) => theme.colors.borderStrong};
    }
  `,
  ghost: css`
    background: transparent;
    color: ${({ theme }) => theme.colors.text.secondary};

    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors.surfaceHover};
      color: ${({ theme }) => theme.colors.text.primary};
    }
  `,
  danger: css`
    background: transparent;
    color: ${({ theme }) => theme.colors.error};
    border: 1px solid ${({ theme }) => theme.colors.error};

    &:hover:not(:disabled) {
      background: rgba(229, 72, 77, 0.1);
    }
  `,
};

const StyledButton = styled(motion.button)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(2)};
  border-radius: ${({ theme }) => theme.radii.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  white-space: nowrap;
  transition: background ${({ theme }) => theme.transitions.fast},
    border-color ${({ theme }) => theme.transitions.fast},
    color ${({ theme }) => theme.transitions.fast};
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  ${({ $size }) => sizeStyles[$size]}
  ${({ $variant }) => variantStyles[$variant]}
`;

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  ...props
}) {
  return (
    <StyledButton
      $variant={variant}
      $size={size}
      $fullWidth={fullWidth}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      {...props}
    >
      {children}
    </StyledButton>
  );
}
