
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { Box, AppBar, Toolbar } from '@mui/material';
import Logo from '../../atoms/Logo';
import DesktopToolbar from './DesktopToolbar';
import MobileToolbar from './MobileToolbar';

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
  px: theme.spacing(3),
}));

function Header() {

	const [isAuth, setIsAuth] = useState(true);
	const user = { username: 'usuario' };

	const publicOptions = [];
	const privateOptions = [
		{ name: 'Início', path: `/${user.username}/inicio` },
		{ name: 'Mapa', path: `/${user.username}/mapa` },
		{ name: 'Recompensas', path: `/${user.username}/recompensas` },
		{ name: 'Carteira', path: `/${user.username}/carteira` },
		{ name: 'Informações', path: `/blog` }
	];

	const [activeItem, setActiveItem] = useState(null);
	const handleLogin = () => {
		setIsAuth(true);
		setActiveItem(0);
	}
	const handleLogout = () => {
		setIsAuth(false);
		setActiveItem(null);
	};
	const handleLogoClick = () => {
		setActiveItem(isAuth ? 0 : null);
	};
	const logoPath = isAuth ? privateOptions[0].path : '/';

	return (
		<AppBar sx={{ position: 'static', boxShadow: 0, backgroundColor: 'transparent' }}>
			<StyledToolbar disableGutters>
				<ToolbarContent>

					{/* Logo on the left */}
					  <Box sx={{ display: 'flex', alignItems: 'center'}}>
						<Link to={logoPath} style={{ textDecoration: 'none' }} onClick={handleLogoClick}>
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
							
						/>
					</Box>

				</ToolbarContent>
			</StyledToolbar>
		</AppBar>
	);
}

export default Header;