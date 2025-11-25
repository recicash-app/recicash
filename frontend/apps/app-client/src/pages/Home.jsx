import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button, Grid } from '@mui/material';

import CardBox from '@shared/ui/CardBox';
import shapeTopLeft from '@shared/assets/shape-top-left.svg';
import shapeTopRight from '@shared/assets/shape-top-right.svg';
import shapePattern from '@shared/assets/pattern-plus-green-white.svg';

import iconPlastic from '/icon-plastic.png';
import iconPaper from '/icon-paper.png';
import iconGlass from '/icon-glass.png';
import iconMetal from '/icon-metal.png';
import FullScreenOverlay from "@shared/ui/FullScreenOverlay";

const CardBoxStyle = { 
  width: '200px', 
  height: '250px', 
  display: 'flex', 
  flexDirection: 'column', 
  alignItems: 'center', 
  justifyContent: 'center' 
};

const IconImgStyle = { 
  width: '60px', 
  height: 'auto', 
  marginBottom: '16px' 
};

const MATERIALS = [
  {
    id: 'plastic',
    img: iconPlastic,
    alt: 'Plástico',
    description: 'O Plástico que Ganhou Novo Valor',
    focused: false,
  },
  {
    id: 'paper',
    img: iconPaper,
    alt: 'Papel',
    description: 'Caixas, jornais e revistas podem virar novos produtos.',
    focused: true, 
  },
  {
    id: 'glass',
    img: iconGlass,
    alt: 'Vidro',
    description: 'O Vidro que se Reinventa Sem Perder o Brilho',
    focused: false,
  },
  {
    id: 'metal',
    img: iconMetal,
    alt: 'Metal',
    description: 'Latas de alumínio e aço com alto valor reciclável.',
    focused: false,
  },
];

function MaterialCard({ img, alt, description, focused, onClick }) {
  return (
    <CardBox focused={focused} onClick={onClick} sx={CardBoxStyle}>
      <img src={img} alt={alt} style={IconImgStyle} />
      <Typography variant="body2" sx={{ textAlign: 'center' }}>
        {description}
      </Typography>
    </CardBox>
  );
}

function Home() {
  const [overlayOpen, setOverlayOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <Box sx={{ width: '100%', overflowX: 'hidden' }}>
      {/* Decorative shapes */}
      <img 
        src={shapeTopLeft} 
        alt="" 
        style={{ position: 'fixed', top: 0, left: 0, width: '40vw', zIndex: -1, pointerEvents: 'none' }} 
      />

      <img
        src={shapeTopRight}
        alt=""
        style={{ position: 'fixed', top: 0, right: 0, width: '50vw', zIndex: -1, pointerEvents: 'none', objectFit: 'scale-down', objectPosition: 'top right' }}
      />
      
      <Box sx={{ position: 'relative', zIndex: 2 }}>
        
        {/* Info Section */}
        <Grid container spacing={0} alignItems="center" sx={{ justifyContent: 'space-between', flexWrap: 'nowrap' }}>
          <Grid item sx={{ textAlign: 'left', width: '55%' }}>
            <Typography variant="h1" sx={{ mb: 5 }}>
              Recicash: descarte consciente que gera benefícios!
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              O Recicash é uma iniciativa que une sustentabilidade e benefícios reais para o cidadão. A ideia é simples: quanto mais você recicla, mais você ganha.
            </Typography>
            <Typography variant="body1" sx={{ mb: 2}}>
              Ao levar materiais recicláveis — como plástico, vidro, papel e metal — até um ecoponto parceiro, o participante acumula pontos no Recicash. Esses pontos podem ser trocados por cupons de desconto, benefícios locais ou até mesmo produtos sustentáveis.
            </Typography>
          </Grid>

          <Grid item sx={{ width: '40%', pl: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Box
              component="img"
              src="/icon-recycle-border.svg"
              alt="recycle icon"
              sx={{ width: "30vw", userSelect: "none", pointerEvents: "none", zIndex: 2 }}
            />
          </Grid>
        </Grid>

        <FullScreenOverlay open={overlayOpen} onClose={() => setOverlayOpen(false)} />

        {/* Materials Section */}
        <Box sx={{ position: 'relative', mt: 5, pt: 5, pb: 5, justifyContent: 'center' }}>
          <img src={shapePattern} alt="" style={{ position: 'absolute', top: 0, right: 0, width: '200px', zIndex: 0 }} />

          <Typography variant="h2" sx={{ mb: 3, textAlign: 'center', color: '#14183E', position: 'relative', zIndex: 1 }}>
            Materiais Recicláveis
          </Typography>

          <Grid container spacing={7} justifyContent="center" sx={{ boxShadow: 'none' }}>
            
            {MATERIALS.map(material => (
              <MaterialCard
                key={material.id}
                img={material.img}
                alt={material.alt}
                description={material.description}
                focused={material.focused}
                onClick={() => setOverlayOpen(true)}
              />
            ))}

          </Grid>
        </Box>

        {/* Sign Up Button */}
        <Box sx={{ textAlign: 'center', mt: 5 }}>
          <Button variant="recicashCTA" onClick={() => navigate('/cadastro')}>
            Saiba mais
          </Button>
        </Box>

      </Box>
    </Box>
  );
}

export default Home;