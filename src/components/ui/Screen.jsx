import styled from 'styled-components';

// Plantilla de pantalla del rediseño:
//
//   <Screen>
//     <PageHeader ... />
//     <Stage> o <Content>   ← contenido
//     <Footer>              ← acción primaria, siempre visible
//   </Screen>

export const Screen = styled.div`
  min-height: 100dvh;
  height: 100dvh;
  background: ${({ theme }) => theme.colors.background};
  display: flex;
  flex-direction: column;
  animation: pv-in 0.22s ease;
`;

/** Zona de contenido con scroll y padding lateral de 20px. */
export const Content = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: ${({ theme, $padding }) => $padding || `${theme.spacing(1)} ${theme.spacing(5)} ${theme.spacing(6)}`};
  width: 100%;
  max-width: 560px;
  margin: 0 auto;
  box-sizing: border-box;

  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

/** Zona de juego: centrada, sin scroll salvo que el contenido lo pida. */
export const Stage = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme, $gap }) => theme.spacing($gap ?? 5)};
  padding: ${({ theme }) => theme.spacing(5)} ${({ theme }) => theme.spacing(5)};
  width: 100%;
  max-width: 560px;
  margin: 0 auto;
  box-sizing: border-box;
  overflow-y: auto;

  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

/** Pie fijo con la acción primaria a ancho completo. */
export const Footer = styled.div`
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2.5)};
  padding: ${({ theme }) => theme.spacing(3)} ${({ theme }) => theme.spacing(5)}
    calc(${({ theme }) => theme.spacing(6.5)} + env(safe-area-inset-bottom, 0px));
  width: 100%;
  max-width: 560px;
  margin: 0 auto;
  box-sizing: border-box;
  border-top: ${({ theme, $divided }) => ($divided ? `1px solid ${theme.colors.border}` : 'none')};
`;

export const FooterRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2.5)};

  > * {
    flex: 1;
  }
`;

export default Screen;
