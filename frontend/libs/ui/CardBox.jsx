import { Box } from '@mui/material';

function CardBox({ sx, children, ...props }) {
  const shadows = [
    '0px 1.85px 3.15px 0px #00000001',
    '0px 8.15px 6.52px 0px #00000002',
    '0px 20px 13px 0px #00000003',
    '0px 38.52px 25.48px 0px #00000003',
    '0px 64.81px 46.85px 0px #00000004',
    '0px 100px 80px 0px #00000005',
  ];

  return (
    <Box
      sx={(theme) => ({
        p: 2,
        width: 267,
        height: 314,
        borderRadius: '36px',
        backgroundColor: theme.palette.background.paper,
        opacity: 1,
        transform: 'rotate(0deg)',
        boxShadow: shadows.join(', '),
        ...sx,
      })}
      {...props}
    >
      {children}
    </Box>
  );
};

export default CardBox;