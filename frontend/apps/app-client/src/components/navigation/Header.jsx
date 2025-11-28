
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { Box, AppBar, Toolbar } from '@mui/material';
import DesktopToolbar from './DesktopToolbar';
import MobileToolbar from './MobileToolbar';

import Logo from '@shared/atoms/Logo';
import { useAuth } from '@shared/utils/AuthProvider';

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  backgroundColor: 'transparent',
  paddingLeft: theme.spacing(3),  
  	paddingRight: theme.spacing(3), 
}));

const ToolbarContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'baseline',
  justifyContent: 'space-between',
  gap: 40,
  width: '100%',
  paddingLeft: theme.spacing(0),
  paddingRight: theme.spacing(0),
}));

function Header() {
	const { isAuth, signInRedirect, signOutRedirect, signUpRedirect } = useAuth();

  const publicOptions = [];
  const privateOptions = [
    { name: 'Início', path: `/inicio` },
    { name: 'Mapa', path: `/mapa` },
    { name: 'Recompensas', path: `/recompensas` },
    { name: 'Carteira', path: `/carteira` },
    { name: 'Informações', path: `/blog` }
  ];

	const [activeItem, setActiveItem] = useState(null);
	
	const handleLogoClick = () => {
    	setActiveItem(isAuth ? 0 : null);
  	};

	const handleLogin = () => {
		signInRedirect();
		setActiveItem(0);
	};

	const handleRegister = () => {
		signUpRedirect();
		setActiveItem(0);
	};

	const handleLogout = () => {
		signOutRedirect();
		setActiveItem(null);
	};

  return (
    <AppBar sx={{ position: 'static', boxShadow: 0, backgroundColor: 'transparent' }}>
      <StyledToolbar disableGutters>
        <ToolbarContent>

          {/* Logo on the left */}
					  <Box sx={{ display: 'flex', alignItems: 'center'}}>
            <Link to={'/'} style={{ textDecoration: 'none' }} onClick={handleLogoClick}>
              <Logo asLink={false} sx={{mt:0}}/>
            </Link>
          </Box>

					{/* Desktop Navigation */}
					<Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2, mt:'20px', justifyContent: 'flex-end' }}>
						<DesktopToolbar
							options={isAuth ? privateOptions : publicOptions}
							isAuth={isAuth}
							onLogin={handleLogin}
							onLogout={handleLogout}
							onRegister={handleRegister}
							activeItem={activeItem}
							onOptionClick={setActiveItem}
						/>
					</Box>

					{/* Mobile Navigation */}
					<Box sx={{  display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1 }}>
						<MobileToolbar
							options={isAuth ? privateOptions : publicOptions}
							isAuth={isAuth}
							onLogin={handleLogin}
							onLogout={handleLogout}
							onRegister={handleRegister}
							
            />
          </Box>

        </ToolbarContent>
      </StyledToolbar>
    </AppBar>
  );
}

export default Header;