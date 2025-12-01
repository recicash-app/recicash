import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Grid, Stack, CircularProgress, Snackbar, Alert } from '@mui/material';
import { useNavigate } from "react-router-dom";
import { useAuth } from '@shared/utils/AuthProvider';

import LocationOnIcon from '@mui/icons-material/LocationOn';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';
import CompostIcon from '@mui/icons-material/Compost';

import shapeTopLeft from '@shared/assets/shape-top-left.svg';
import shapeTopRight from '@shared/assets/shape-top-right.svg';
import RegisterNoteForm from "../components/wallet/RegisterNoteForm";

import api from "@shared/utils/api";

function UserHome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loadingData, setLoadingData] = useState(true);
  const [totalPoints, setTotalPoints] = useState(0);
  const [totalRecyclings, setTotalRecyclings] = useState(0);
  const [noteCode, setNoteCode] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const handleCloseSnackbar = () => setSnackbar((prev) => ({ ...prev, open: false }));

  const fetchUserData = async () => {

    if (!user || !user.user_id) return;

    try {
        const response = await api.get(`/recyclings/?user_id=${user.user_id}&status=REDEEMED`);
        const dataList = Array.isArray(response.data) ? response.data : (response.data.results || []);
        
        const points = dataList.reduce((acc, item) => acc + (item.points_value || 0), 0);
        const count = dataList.length;
        
        setTotalPoints(points);
        setTotalRecyclings(count);

    } 
    catch (error) {
        console.error("Erro ao carregar dados da home:", error);
    } 
    finally {
        setLoadingData(false);
    }
  };

  useEffect(() => {
    if (user) {
        fetchUserData();
    }
  }, [user]);

  const handleRegisterNote = async () => {

    if (!noteCode) return;
    if (!user || !user.user_id) return; 

    try {
      const response = await api.post('/recyclings/record_wallet_history/', {
        validation_hash: noteCode, 
        user_id: user.user_id
      });

      setSnackbar({
        open: true,
        message: `Sucesso! Você ganhou ${response.data.points_added} pontos.`,
        severity: "success"
      });
      
      fetchUserData(); 

    } 
    catch (error) {
      console.error("Erro ao cadastrar nota:", error);
      setSnackbar({
        open: true,
        message: "Erro ao cadastrar nota.",
        severity: "error"
      });

    }
     setNoteCode(""); 
  };

  const StatBox = ({ icon, value, label }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ 
            bgcolor: 'rgba(58, 91, 34, 0.1)', 
            p: 1.5, 
            borderRadius: '12px',
            color: '#93B17D',
            justifyContent: 'center'
        }}>
            {icon}
        </Box>
        <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', lineHeight: 1, color: '#93B17D' }}>
                {loadingData ? <CircularProgress size={20} color="inherit"/> : value}
            </Typography>
            <Typography variant="body2" sx={{ color: '#5E6282' }}>
                {label}
            </Typography>
        </Box>
    </Box>
  );

  return (
    <React.Fragment>
      <Box sx={{ width: '100%', overflowX: 'hidden', pb: 10 }}>
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
        
        <Box sx={{ position: 'relative', zIndex: 2, maxWidth: '1200px', margin: '0 auto', px: 2 }}>
          
          {/* SECTION TEXT, INFOS AND ICON */}
          <Grid container spacing={0} alignItems="center" sx={{ justifyContent: 'space-between', flexWrap: 'nowrap' }}>
            <Grid item sx={{ textAlign: 'left', width: '55%' }}>
              <Typography variant="h1" sx={{ color: '#5E6282',mb: 3 }}>
                Olá, {user?.first_name}. <br/> Vamos reciclar hoje?
              </Typography>
              <Typography variant="body1" sx={{ mb: 4, maxWidth: '500px' }}>
                Bora começar o dia fazendo o bem? Separe seus recicláveis e veja como é fácil transformar lixo em desconto!
              </Typography>
              
              {/* POINTS AND RECYCLINGS */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={5}>
                  <StatBox 
                    icon={<PaymentsOutlinedIcon fontSize="large"/>} 
                    value={totalPoints} 
                    label="Pontos Acumulados"
                  />
                  <StatBox 
                    icon={<RestoreFromTrashIcon fontSize="large"/>} 
                    value={totalRecyclings} 
                    label="Reciclagens Feitas"
                  />
              </Stack>

            </Grid>

            {/* ICON */}
            <Grid item sx={{ width: '40%', pl: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Box
                component="img"
                src="/icon-recycle-border.svg"
                alt="recycle icon"
                sx={{ width: "30vw", userSelect: "none", pointerEvents: "none", zIndex: 2 }}
                />
            </Grid>
          </Grid>


          {/* SECTION REGISTER NOTE AND MAP */}
          <Box 
            sx={{ 
                borderRadius: '30px', 
                p: { xs: 3, md: 6 },
                position: 'relative'
            }}
          >
            <Grid container spacing={6} alignItems="stretch">
                
            <Box 
              sx={{ 
                  borderRadius: '30px', 
                  p: { xs: 3, md: 6 },
                  position: 'relative',
                  mt: 4
              }}
            >
            <Grid container spacing={4} alignItems="stretch">
              {/* CARD REGISTER NOTE */}
              <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      justifyContent: 'center',
                      p: 4,
                      borderRadius: '15px',
                      background: 'linear-gradient(135deg, #93B17D 0%, #93B17D 100%)', 
                      color: '#FFF',
                      boxShadow: '0px 10px 25px rgba(58, 91, 34, 0.25)',
                      position: 'relative',
                      overflow: 'hidden'
                  }}>
                    
                    {/* Decorative Circle */}
                    <Box sx={{ 
                        position: 'absolute', top: -20, right: -20, width: 150, height: 150, 
                        bgcolor: 'rgba(255,255,255,0.1)', borderRadius: '50%' 
                    }} />

                    <Box sx={{ position: 'relative', zIndex: 1, width: '100%' }}>
                        
                        {/* COMPONENT REGISTER NOTE */}
                        <RegisterNoteForm
                            noteCode={noteCode}
                            setNoteCode={setNoteCode}
                            onSubmit={handleRegisterNote}
                        />
                        
                    </Box>
                  </Box>
                </Grid>


              {/* CARD MAP */}
              <Grid size={{ xs: 12, md: 6 }} >
                <Box sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    gap: 3,
                    p: 4,
                    borderRadius: '15px',
                    border: '1px solid #E8F5E9',
                    bgcolor: '#F9FBF8',
                    transition: 'all 0.3s ease',
                    
                }}>
                  
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Box sx={{ p: 0.1, borderRadius: '50%',}}>
                          <CompostIcon fontSize="large" sx={{ color: '#181E4B' }} />
                      </Box>
                        <Typography variant="h2" sx={{ color: '#181E4B', fontWeight: 'bold' }}>
                            Ecopontos
                        </Typography>
                    </Box>
                            
                    <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                        Não sabe onde descartar? Encontre o ponto de coleta mais perto de você agora mesmo.
                    </Typography>
                  </Box>
                        
                  <Button 
                      variant="contained" 
                      fullWidth
                      onClick={() => navigate('/mapa')}
                      sx={{ 
                          bgcolor: '#FFF', 
                          color: '#181E4B',
                          fontWeight: 'bold',
                          borderRadius: '50px',
                          py: 1.5,
                          textTransform: 'none',
                          width: 'auto',
                          fontSize: '1rem',
                          border: '1px solid #E8F5E9',
                          
                          '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: '0px 15px 30px rgba(58, 91, 34, 0.1)',
                          }
                      }}>
                  
                      <LocationOnIcon fontSize="large" />
                      Ver no mapa
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>

        </Grid>
        </Box>
        </Box>
      </Box>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity}
            sx={{ width: '100%', borderRadius: 2, boxShadow: 3 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      
    </React.Fragment>
  );
}

export default UserHome;