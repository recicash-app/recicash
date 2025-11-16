import React from 'react';
import { useState } from "react";
import { Box, Typography, Button, Container, Grid } from '@mui/material';
import CardBox from '@shared/ui/CardBox';
import LeafBox from '@shared/ui/LeafBox';
import shapeTopLeft from '@shared/assets/shape-top-left.svg';
import shapeTopRight from '@shared/assets/shape-top-right.svg';
import shapePattern from '@shared/assets/pattern-plus-green-white.svg';

import iconPlastic from '@shared/assets/icon-plastic.png';
import iconPaper from '@shared/assets/icon-paper.png';
import iconGlass from '@shared/assets/icon-glass.png';
import iconMetal from '@shared/assets/icon-metal.png';
import peoples from '@shared/assets/peoples.png';
import FullScreenOverlay from "@shared/ui/FullScreenOverlay";


function Home() {
  const [overlayOpen, setOverlayOpen] = useState(false);

  return (
    <Box sx={{ width: '100%', overflowX: 'hidden'}}>
      {/* Decorative shapes */}
      <img src={shapeTopLeft} alt="" style={{ position: 'absolute', top: '0', left: '-332px', width: '39%', height: '525px', transform: 'rotate(0deg)', zIndex: '-1' }} />
      <img
        src={shapeTopRight}
        alt=""
        style={{ position: 'absolute', top: '0', left:'680px', right: '0', width: '620px', height: '650px', transform: 'rotate(0.1deg)', opacity: '1', zIndex: '-1' }}
      />
      
      <Container maxWidth="lg" sx={{ padding: 0 }}>
        
        {/* Hero Section */}
        <Grid container spacing={2} alignItems="center" sx={{ mt: 3, flexWrap: 'nowrap' }}>
          <Grid item xs={6} >
            <Typography variant="h1" sx={{ mb: 5 }}>
               ♻️ Recicash: descarte consciente que gera benefícios!
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              O Recicash é uma iniciativa que une sustentabilidade e benefícios reais para o cidadão. A ideia é simples: quanto mais você recicla, mais você ganha.
            </Typography>
            <Typography variant="body1" sx={{ mb: 2}}>
              Ao levar materiais recicláveis — como plástico, vidro, papel e metal — até um ecoponto parceiro, o participante acumula pontos no Recicash. Esses pontos podem ser trocados por cupons de desconto, benefícios locais ou até mesmo produtos sustentáveis.
            </Typography>
          </Grid>
          <Grid item xs={6} sx={{mt: 0}}>
            <img
              src={peoples}
              alt="Recicash People"
              style={{ width: '100%', height: '100%', borderRadius: '8px' }}
            />
          </Grid>
        </Grid>

        <FullScreenOverlay open={overlayOpen} onClose={() => setOverlayOpen(false)} />
          
        {/* Materials Section */}
        <Box sx={{ position: 'relative', mt: 5, pt: 5, pb: 5 }}>
          <img src={shapePattern} alt="" style={{ position: 'absolute', top: '0', right: '0', width: '200px', zIndex: '-1' }} />
          <Typography variant="h2" sx={{ mb: 3, textAlign: 'center', color: '#14183E' }}>
            Materiais Recicláveis
          </Typography>
          <Grid container spacing={7} justifyContent="center">
            <CardBox onClick={() => setOverlayOpen(true)} sx={{ width: '200px', height: '250px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <img
                src={iconPlastic}
                alt="Plástico"
                style={{ width: '60px', height: 'auto', marginBottom: '16px' }}
              />
              <Typography variant="body2" sx={{ textAlign: 'center' }}>
                O Plástico que Ganhou Novo Valor
              </Typography>
            </CardBox>
            <CardBox focused onClick={() => setOverlayOpen(true)} sx={{ width: '200px', height: '250px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <img
                src={iconPaper}
                alt="Papel"
                style={{ width: '60px', height: 'auto', marginBottom: '16px' }}
              />
              <Typography variant="body2" sx={{ textAlign: 'center' }}>
                Caixas, jornais e revistas podem virar novos produtos.
              </Typography>
            </CardBox>
            <CardBox onClick={() => setOverlayOpen(true)} sx={{ width: '200px', height: '250px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <img
                src={iconGlass}
                alt="Vidro"
                style={{ width: '60px', height: 'auto', marginBottom: '16px' }}
              />
              <Typography variant="body2" sx={{ textAlign: 'center' }}>
                O Vidro que se Reinventa Sem Perder o Brilho
              </Typography>
            </CardBox>
            <CardBox onClick={() => setOverlayOpen(true)} sx={{ width: '200px', height: '250px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <img
                src={iconMetal}
                alt="Metal"
                style={{ width: '60px', height: 'auto', marginBottom: '16px' }}
              />
              <Typography variant="body2" sx={{ textAlign: 'center' }}>
                Latas de alumínio e aço com alto valor reciclável.
              </Typography>
            </CardBox>
          </Grid>
        </Box>

        {/* Call to Action */}
        <Box sx={{ textAlign: 'center', mt: 5 }}>
          <Button variant="recicashCTA">Saiba mais</Button>
        </Box>
      </Container>
    </Box>
  );
}

export default Home;