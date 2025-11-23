import React from 'react';
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button, Container, Grid } from '@mui/material';

import CardBox from '@shared/ui/CardBox';
import shapeTopLeft from '@shared/assets/shape-top-left.svg';
import shapeTopRight from '@shared/assets/shape-top-right.svg';
import shapePattern from '@shared/assets/pattern-plus-green-white.svg';

import iconPlastic from '../../public/icon-plastic.png';
import iconPaper from '../../public/icon-paper.png';
import iconGlass from '../../public/icon-glass.png';
import iconMetal from '../../public/icon-metal.png';
import FullScreenOverlay from "@shared/ui/FullScreenOverlay";


function Home() {

  const [overlayOpen, setOverlayOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <Box sx={{ width: '100%', overflowX: 'hidden'}}>

      {/* Decorative shapes */}
      <img 
        src={shapeTopLeft} 
        alt="" 
        style={{ position: 'fixed', top: '0', left: '0', width: '40vw', zIndex: -1, pointerEvents: 'none', }} />
        
      <img
        src={shapeTopRight}
        alt=""
        style={{ position: 'fixed', top: '0', right: '0', width: '50vw', zIndex: -1, pointerEvents: 'none', objectFit: 'scale-dow', objectPosition: 'top right' }}
      />
      
      <Box sx={{ position: 'relative', zIndex: 2 }}>
        {/*<Container maxWidth="lg" sx={{ padding: 0, position: 'relative', zIndex: 1 }}>*/}
        <Box sx={{ position: 'relative', zIndex: 1, width: '100%' }}>
        
        {/* Info Section   */}
        <Grid container spacing={0} alignItems="center" sx={{ justifyContent: 'space-between', flexWrap: 'nowrap'}}>
          <Grid item  sx={{ textAlign: 'left', width: '55%' }} >
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
          <Grid item 
            sx={{ 
              width: '40%',
              pl: 2,
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center'     
            }}>
            <Box
            component="img"
            src="/icon-recycle-border.svg"
            alt="recycle icon"
            sx={{ width: "30vw", userSelect: "none", pointerEvent: "none", zIndex: 2 }}
          />
          </Grid>
          
        </Grid>

        <FullScreenOverlay open={overlayOpen} onClose={() => setOverlayOpen(false)} />
          
        {/* Materials Section */}
        <Box sx={{ position: 'relative', mt: 5, pt: 5, pb: 5, justifyContent: 'center' }}>
          <img src={shapePattern} alt="" style={{ position: 'absolute', top: '0', right: '0', width: '200px', zIndex: 0 }} />
          <Typography variant="h2" sx={{ mb: 3, textAlign: 'center', color: '#14183E',zIndex: 1, position: 'relative' }}>
            Materiais Recicláveis
          </Typography>
          <Grid container spacing={7} justifyContent="center" sx={{ boxShadow: 'none' }}>
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

        {/* Sing Up Button */}
        <Box sx={{ textAlign: 'center', mt: 5 }}>
          <Button variant="recicashCTA" onClick={() => navigate('/cadastro')} >Saiba mais</Button>
        </Box>
      </Box>

      </Box>
      
    </Box>
  );
}

export default Home;