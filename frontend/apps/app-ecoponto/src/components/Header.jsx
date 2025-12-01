import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Menu, MenuItem } from '@mui/material';
import { ArrowDropDown, PersonOutline } from '@mui/icons-material';

import Logo from '@shared/atoms/Logo';
import { useAuth } from '@shared/utils/AuthProvider';

const buttonSx = {
  fontFamily: 'Alata, sans-serif',
  fontWeight: 400,
  fontSize: '15px',
  color: "#181E4B",
  px: 2,
};

const menuSx = {
  borderRadius: '5px',
  minWidth: 150,
  '&:before': { display: 'none' },
  '&:after': { display: 'none' },
};

function Header() {
  const { signOutRedirect } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleEdit = () => {
    handleMenuClose();
    navigate("/perfil");
  };

  return (
    <Box
      sx={{ display: 'flex', alignItems: 'baseline', width: '100%', justifyContent: 'space-between', py: 1 }}
    >
      {/* Left - Logo */}
      <Logo sx={{ mt: 0 }} />

      {/* Right - Menu Button */}
      <Button
        variant="outlined"
        sx={{
          ...buttonSx,
          borderColor: '#212832',
          borderRadius: '5px',
          height: 35,
          width: 150,
        }}
        startIcon={<PersonOutline />}
        endIcon={<ArrowDropDown />}
        onClick={handleMenuOpen}
      >
        Meu Perfil
      </Button>

      {/* Dropdown Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: menuSx } }}
      >
        <MenuItem onClick={handleEdit} sx={buttonSx}>Editar dados</MenuItem>
        <MenuItem onClick={signOutRedirect} sx={buttonSx}>Sair</MenuItem>
      </Menu>
    </Box>
  );
}

export default Header;
