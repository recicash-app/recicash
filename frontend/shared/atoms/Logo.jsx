import React from 'react';
import { Typography, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';

export default function Logo({ asLink = false, sx = {} }) {
  const theme = useTheme();
  const logo = (
    <Box
      sx={{
        width: 'auto',
        height: 68,
        display: 'flex',
        alignItems: 'center',
        alignItems: 'flex-start',
        opacity: 1,
        ...sx,
      }}
    >
      <Typography
        sx={{
          fontFamily: 'Volkhov, serif',
          fontWeight: 700,
          fontSize: '32px',
          lineHeight: '32px',
          letterSpacing: '-0.04em',
          color: theme.palette.text.hint,
          background: 'none',
          textDecoration: 'none',
          width: '100%',
          height: '100%',
          opacity: 1,
          display: 'inline-block',
        }}
      >
        Recicash
      </Typography>
    </Box>
  );
  if (asLink) {
    return (
      <RouterLink to="/" style={{ textDecoration: 'none', display: 'inline-block' }}>
        {logo}
      </RouterLink>
    );
  }
  return logo;
}