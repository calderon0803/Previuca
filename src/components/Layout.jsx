import styled from 'styled-components';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { FaHome, FaGamepad, FaUsers, FaCog } from 'react-icons/fa';

const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Main = styled.main`
  flex: 1;
  padding: ${({ theme }) => theme.spacing(4)};
  padding-bottom: 80px; // Space for bottom nav
  max-width: ${({ theme }) => theme.breakpoints.mobile};
  margin: 0 auto;
  width: 100%;
`;

const BottomNav = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: ${({ theme }) => theme.colors.surface};
  display: flex;
  justify-content: space-around;
  padding: ${({ theme }) => theme.spacing(2)};
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 1000;
`;

const NavItem = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  color: ${({ theme, $active }) => $active ? theme.colors.primary : theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.small};
  
  svg {
    font-size: 1.5rem;
    margin-bottom: 4px;
  }

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const Layout = () => {
    const location = useLocation();

    const isActive = (path) => {
        if (path === '/' && location.pathname === '/') return true;
        if (path !== '/' && location.pathname.startsWith(path)) return true;
        return false;
    };

    return (
        <LayoutContainer>
            <Main>
                <Outlet />
            </Main>
            <BottomNav>
                <NavItem to="/" $active={isActive('/')}>
                    <FaHome />
                    Inicio
                </NavItem>
                <NavItem to="/games" $active={isActive('/games')}>
                    <FaGamepad />
                    Juegos
                </NavItem>
                <NavItem to="/players" $active={isActive('/players')}>
                    <FaUsers />
                    Jugadores
                </NavItem>
                <NavItem to="/settings" $active={isActive('/settings')}>
                    <FaCog />
                    Ajustes
                </NavItem>
            </BottomNav>
        </LayoutContainer>
    );
};

export default Layout;
