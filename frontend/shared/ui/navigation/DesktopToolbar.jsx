import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Menu, MenuItem, Box, useTheme } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';

const buttonSx = {
	fontFamily: 'Alata, sans-serif',
	fontWeight: 400,
	fontSize: '15px',
	lineHeight: 1,
	letterSpacing: 0,
	color: "#181E4B",
	px: 2,
};

const menuSx = {
	borderRadius: '5px',
	minWidth: 150,
	boxShadow: "#FFFFFF",
	'&:before': { display: 'none' },
	'&:after': { display: 'none' },
};


function DesktopToolbar({ options, isAuth, onLogin, onLogout, activeItem, onOptionClick }) {

	const navigate = useNavigate();
	const [anchorEl, setAnchorEl] = useState(null);

	const handleMenuOpen = (event) => {
		setAnchorEl(event.currentTarget);
	};
	const handleMenuClose = () => {
		setAnchorEl(null);
	};

	const handleEdit = () => {
		handleMenuClose();
		navigate('/settings');
	};

	const handleLogout = () => {
		handleMenuClose();
		onLogout();
		navigate('/');
	};

	if (!isAuth) {
		return (
			<Box sx={{ display: 'flex', gap: 5, alignItems: 'center', justifyContent: 'flex-end', minHeight: 35 }}>
				<Button variant="recicashSelectHeader" sx={buttonSx} onClick={onLogin}>
					Login
				</Button>
				<Button variant="recicashSelectHeader" sx={buttonSx} onClick={onLogin}>
					Cadastro
				</Button>
			</Box>
		);
	}

	return (
		<Box sx={{ display: 'flex', gap: 5, alignItems: 'center', justifyContent: 'flex-end', width: 'auto' }}>
			{options.map((option, item) => (
				<Button
					key={option.name}
					sx={buttonSx}
					variant="recicashSelectHeader" 
          			state={{ active: activeItem === item }}
					onClick={() => {
						onOptionClick(item);
						navigate(option.path);
					}}
				>
					{option.name}
				</Button>
			))}
			<Button
				variant="outlined"
				sx={{ ...buttonSx, borderColor: '#212832', borderRadius: '5px', height: 35, width: 150 }}
				startIcon={<PersonOutlineIcon />}
				endIcon={<ArrowDropDownIcon />}
				onClick={handleMenuOpen}
			>
				Meu Perfil
			</Button>

			<Menu
				anchorEl={anchorEl}
				open={Boolean(anchorEl)}
				onClose={handleMenuClose}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
				transformOrigin={{ vertical: 'top', horizontal: 'right' }}
				slotProps={{ paper: { sx: menuSx } }}
			>
				<MenuItem onClick={handleEdit} sx={buttonSx}>Editar dados</MenuItem>
				<MenuItem onClick={handleLogout} sx={buttonSx}>Sair</MenuItem>
			</Menu>
		</Box>
	);
}

export default DesktopToolbar;