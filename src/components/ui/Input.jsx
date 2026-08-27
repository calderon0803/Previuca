import styled from 'styled-components';

const Input = styled.input`
  width: 100%;
  height: ${({ $size }) => ($size === 'sm' ? '44px' : '48px')};
  padding: 0 ${({ theme }) => theme.spacing(3.5)};
  padding-left: ${({ theme, $hasIcon }) => ($hasIcon ? theme.spacing(10) : theme.spacing(3.5))};
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  background: ${({ theme }) => theme.colors.surfaceInput};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 15px;
  font-family: inherit;
  outline: none;
  box-sizing: border-box;
  transition: border-color ${({ theme }) => theme.transitions.fast};

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.faint};
  }

  &:hover:not(:disabled):not(:focus) {
    border-color: ${({ theme }) => theme.colors.borderHover};
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.accent};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export default Input;
