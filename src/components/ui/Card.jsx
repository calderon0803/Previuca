import styled from 'styled-components';

const Card = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme, $padding }) => theme.spacing($padding ?? 5)};
  transition: background ${({ theme }) => theme.transitions.base},
    border-color ${({ theme }) => theme.transitions.base},
    transform ${({ theme }) => theme.transitions.base};

  ${({ $interactive, theme }) =>
    $interactive &&
    `
      cursor: pointer;
      &:hover {
        background: ${theme.colors.surfaceHover};
        border-color: ${theme.colors.borderStrong};
      }
      &:active {
        transform: scale(0.99);
      }
    `}
`;

export default Card;
