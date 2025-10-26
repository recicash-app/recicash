import { Box, Divider, Drawer, List, Typography } from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';

import { menuItems } from '../../data/menuConfig';
import SidebarItem from './SidebarItem';

const GradientDivider = styled(Divider)(({ theme }) => ({
  height: '1px',
  border: 0,
  backgroundColor: 'transparent',
  backgroundImage: `linear-gradient(to right, ${alpha(theme.palette.secondary.main, 0)}, ${theme.palette.secondary.main}, ${alpha(
    theme.palette.secondary.main,
    0
  )})`,
}));

function Sidebar({ drawerWidth, ...props }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = (item) => {
    navigate(item.path);
  };

  return (
    <Drawer
      open
      anchor="left"
      variant="persistent"
      PaperProps={{
        sx: { 
          borderRight: (theme) => `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
          width: drawerWidth,
        },
      }}
      {...props}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="h5" color="text.hint" sx={{ userSelect: 'none' }}>
            Recicash
          </Typography>
        </Box>

        <GradientDivider />

        {/* Navigation Links */}
        <List sx={{ mt: 2, mx: 1 }}>
          {menuItems.map((item) => (
            <SidebarItem
              key={item.name}
              icon={item.icon}
              name={item.name}
              active={location.pathname === item.path}
              onClick={() => handleClick(item)}
            />
          ))}
        </List>

        {/* Footer */}
        <Box sx={{ mt: 'auto', p: 2 }}>
          <GradientDivider />
          <Typography
            variant="body2"
            sx={{ display: 'block', textAlign: 'center', mt: 1, fontSize: '0.75rem' }}
          >
            v1.0.0
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
}

export default Sidebar;