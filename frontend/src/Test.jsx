import { Box, Button, Typography } from '@mui/material';
import { LoremIpsum } from 'react-lorem-ipsum';

import LeafBox from '../libs/ui/LeafBox';
import CardBox from '../libs/ui/CardBox';

function TestBasic() {
  return (
    <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* TÍTULOS */}
      <Box>
        <Typography variant="h2" sx={{ p: 1, maxWidth: '756px' }}>
          Recicash: Descarte consciente que gera benefícios!
        </Typography>
        <Typography variant="h3" sx={{ p: 1, maxWidth: '756px' }}>
          Recicash: Descarte consciente que gera benefícios!
        </Typography>
        <Typography variant="h4" sx={{ p: 1, maxWidth: '756px' }}>
          Recicash: Descarte consciente que gera benefícios!
        </Typography>
        <Typography variant="h5" sx={{ p: 1, maxWidth: '756px' }}>
          Recicash: Descarte consciente que gera benefícios!
        </Typography>
        <Typography variant="h6" sx={{ p: 1, maxWidth: '756px' }}>
          Recicash: Descarte consciente que gera benefícios!
        </Typography>
      </Box>

      {/* TEXTO */}
      <Box>
        <Typography variant="body1" component="div" sx={{ textWrap: 'wrap' }}>
          <LoremIpsum p={1} />
        </Typography>

        <Typography variant="body2" component="div" sx={{ textWrap: 'wrap' }}>
          <LoremIpsum p={1} />
        </Typography>
      </Box>

      {/* BOTÕES */}
      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
        <Button variant="recicashPrimary">Primário</Button>
        <Button variant="recicashSecondary">Secundário</Button>
        <Button variant="recicashCTA" sx={{ boxShadow: 1 }}>
          CTA com sombra
        </Button>
        <Button variant="recicashCTA" sx={{ boxShadow: 2 }}>
          CTA com glow dourado
        </Button>
        <Button variant="recicashOutlined">Oco Escuro</Button>
      </Box>

      {/* CONTAINERS */}
      <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}} >
        <CardBox />
        <LeafBox sx={{ width: '75%' }}>
            <LoremIpsum p={2} />
        </LeafBox>
      </Box>
    </Box>
  );
}

export default TestBasic;
