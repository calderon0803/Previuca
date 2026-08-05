import styled from 'styled-components';

const Input = styled.input`
  width: 100%;
  height: 46px;
  padding: 0 ${({ theme }) => theme.spacing(4)};
  padding-left: ${({ theme, $hasIcon }) => ($hasIcon ? theme.spacing(10) : theme.spacing(4))};
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceRaised};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  font-family: inherit;
  outline: none;
  box-sizing: border-box;
  transition: border-color ${({ theme }) => theme.transitions.fast};

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.disabled};
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.primaryHover};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export default Input;
