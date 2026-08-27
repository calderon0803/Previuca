import styled from 'styled-components';

const Textarea = styled.textarea`
  width: 100%;
  min-height: 108px;
  padding: ${({ theme }) => theme.spacing(3)} ${({ theme }) => theme.spacing(3.5)};
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  background: ${({ theme }) => theme.colors.surfaceInput};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 15px;
  line-height: 1.5;
  font-family: inherit;
  outline: none;
  box-sizing: border-box;
  resize: none;
  transition: border-color ${({ theme }) => theme.transitions.fast};

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.faint};
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.accent};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export default Textarea;
