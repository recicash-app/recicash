import React from 'react';
import { alpha, styled } from '@mui/material/styles';
import { Icon, ListItem, ListItemIcon, ListItemText } from '@mui/material';

const StyledListItem = styled(ListItem)(({ theme, active }) => ({
  maxWidth: '100%',
  boxSizing: 'border-box',
  padding: theme.spacing(1, 2),
  borderRadius: "8px",
  marginBottom: theme.spacing(1),
  cursor: "pointer",
  backgroundColor: active
    ? alpha(theme.palette.primary.main, 0.15)
    : "transparent",
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    color: theme.palette.primary.main,
  },
  transition: "all 0.2s ease",
}));

function SidebarItem({ icon, name, active, onClick }) {
  return (
    <StyledListItem active={active} onClick={onClick} component="li">
      <ListItemIcon sx={{ color: "primary.main", width: '1rem', minWidth: '40px' }}>
        {typeof icon === "string" ? <Icon>{icon}</Icon> : React.createElement(icon)}
      </ListItemIcon>

      <ListItemText
        primary={name}
        primaryTypographyProps={{
          variant: "body2",
          color: '#212832',
          fontWeight: active ? 600 : 400,
        }}
        sx={{ userSelect: 'none' }}
      />
    </StyledListItem>
  );
};

export default SidebarItem;