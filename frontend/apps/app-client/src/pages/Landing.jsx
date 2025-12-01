import React, { useState, useMemo, useCallback } from 'react';
import { Box, Typography, Button, Grid } from '@mui/material';
import { useNavigate } from "react-router-dom";

import CardBox from '@shared/ui/CardBox';
import shapeTopLeft from '@shared/assets/shape-top-left.svg';
import shapeTopRight from '@shared/assets/shape-top-right.svg';
import shapePattern from '@shared/assets/pattern-plus-green-white.svg';

import iconPlastic from '/icon-plastic.png';
import iconPaper from '/icon-paper.png';
import iconGlass from '/icon-glass.png';
import iconMetal from '/icon-metal.png';
import PostOverlay from '../components/PostOverlay';

import { useAuth } from '@shared/utils/AuthProvider';

import { 
  glassInstructions, 
  paperInstructions, 
  plasticInstructions, 
  metalInstructions
} from '../data/recyclingInstructions';

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
    decorated: false,
  },
  {
    id: 'paper',
    img: iconPaper,
    alt: 'Papel',
    description: 'Caixas, jornais e revistas podem virar novos produtos.',
    decorated: true, 
  },
  {
    id: 'glass',
    img: iconGlass,
    alt: 'Vidro',
    description: 'O Vidro que se Reinventa Sem Perder o Brilho',
    decorated: false,
  },
  {
    id: 'metal',
    img: iconMetal,
    alt: 'Metal',
    description: 'Latas de alumínio e aço com alto valor reciclável.',
    decorated: false,
  },
];

function MaterialCard({ img, alt, description, decorated, onClick }) {
  return (
    <CardBox focused={decorated} onClick={onClick} sx={CardBoxStyle}>
      <img src={img} alt={alt} style={IconImgStyle} />
      <Typography variant="body2" sx={{ textAlign: 'center' }}>
        {description}
      </Typography>
    </CardBox>
  );
}

function Landing() {

  const navigate = useNavigate();
  const { isAuth, signUpRedirect } = useAuth();
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  const instructions = useMemo(
    () => ({
      paper: paperInstructions,
      glass: glassInstructions,
      metal: metalInstructions,
      plastic: plasticInstructions,
    }),
    []
  );

  const handleInstructionRequest = useCallback((materialId) => {
    setSelectedMaterial(materialId);
    setOverlayOpen(true);
  }, []);

  const handleCloseOverlay = useCallback(() => {
    setOverlayOpen(false);
    setSelectedMaterial(null);
  }, []);

  const handleSaibaMais = () => {
    if (!isAuth) {
      signUpRedirect();
    }
    navigate('/blog');
  }


  return (
    <React.Fragment>
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
          style={{ position: 'absolute', top: 0, right: 0, width: '50vw', zIndex: -1, pointerEvents: 'none', objectFit: 'scale-down', objectPosition: 'top right' }}
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
                  decorated={material.decorated}
                  onClick={() => handleInstructionRequest(material.id)}
                />
              ))}

            </Grid>
          </Box>

          {/* Sign Up Button */}
          <Box sx={{ textAlign: 'center', mt: 5 }}>
            <Button variant="recicashCTA" onClick={handleSaibaMais}>
              Saiba mais
            </Button>
          </Box>

        </Box>
      </Box>
      
      <PostOverlay
        open={overlayOpen} onClose={handleCloseOverlay}
        data={selectedMaterial ? instructions[selectedMaterial] : null}
      />
    </React.Fragment>
  );
}

export default Landing;