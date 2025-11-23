import React, {useState} from 'react';
import { Link } from 'react-router-dom';

import { styled } from '@mui/material/styles';
import { Box, Button, Drawer, IconButton, MenuItem, useTheme } from '@mui/material';

import ListIcon from '@mui/icons-material/List';
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';

import Logo from '../../../../../shared/atoms/Logo';

const StyledMenuItem = styled(MenuItem)(({
	padding: '6px 3px',
}));

function MobileToolbar({ options, isAuth, onLogin, onLogout }) {

	const [open, setOpen] = useState(false);

	const theme = useTheme();

	function toggleDrawer(open) {
		return (event) => {
    		if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      			return;
    		}
    		setOpen(open);
		};
	}

	return (
		<React.Fragment>
			<IconButton aria-label="Menu button" onClick={toggleDrawer(true)}>
				<ListIcon fontSize="medium" sx={{ color: 'neutral.main' }} />
			</IconButton>
			<Drawer anchor="top" open={open} onClose={toggleDrawer(false)} PaperProps={{ sx: { borderRadius: '0px 0px 10px 10px' } }}>
				<Box sx={{ p: 2, backgroundColor: theme.palette.background.default, height: '100%' }}>
					<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
						<Link to="/" style={{ textDecoration: 'none' }}>
							<Logo variant="icon" size="sm"/>
						</Link>
						<Box sx={{ display: 'flex', alignItems: 'center' }}> 
							<IconButton aria-label="Menu button" onClick={toggleDrawer(false)}>
								<CloseIcon fontSize="medium" sx={{ color: theme.palette.text.hint }} />
							</IconButton>
						</Box>
					</Box>
					
					{!isAuth && (
						<React.Fragment>
							<StyledMenuItem onClick={onLogin}> Login </StyledMenuItem>
							<StyledMenuItem onClick={onLogin}> Cadastro </StyledMenuItem>
						</React.Fragment>
					)}
					
					{options.map((option, index) => (
						<React.Fragment key={option.name}>
							<StyledMenuItem component={Link} to={option.path} onClick={toggleDrawer(false)}>
								{option.icon && <option.icon fontSize="small" />}
								{option.name}
							</StyledMenuItem>
						</React.Fragment>
					))}

					{isAuth && (
						<Button 
							color="#181E4B" size="small" variant="contained" fullWidth
							sx={{ display: 'flex', justifyContent: 'center', gap: 0.5, color: '#181E4B' }}
							startIcon={<LogoutIcon fontSize="small" />}
							onClick={() => {
								onLogout();
								toggleDrawer(false)();
							}}
						>
							Sair
						</Button>
					)}

				</Box>
			</Drawer>
		</React.Fragment>
	);
}

export default MobileToolbar;