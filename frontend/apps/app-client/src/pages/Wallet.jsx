import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  InputBase,
  IconButton,
  Stack,
  ButtonBase,
  CircularProgress,
  Snackbar, 
  Alert    
} from "@mui/material";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';

import api from "../utils/api"; 
import LeafBox from "@shared/ui/LeafBox";

function Wallet() {

  // Initialization of states and hooks
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [noteCode, setNoteCode] = useState("");
  const [totalPoints, setTotalPoints] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // fetch total points and register note 
  const fetchGetPoints = async () => {

          const userId = localStorage.getItem('user_id');

          if (!userId) {
              setLoading(false);
              return;
          }

          try {
              const response = await api.get(`/recyclings/?user_id=${userId}&status=REDEEMED`);
              const dataList = Array.isArray(response.data) ? response.data : (response.data.results || []);
            
              const points = dataList.reduce((acc, item) => acc + (item.points_value || 0), 0);
              
              setTotalPoints(points);
          } 
          catch (error) {
              console.error("Erro ao carregar dados da carteira:", error);
          } 
          finally {
              setLoading(false);
          }
    };

    const fetchPostNote = (noteCode, userId) => {

      return api.post('/recyclings/record_wallet_history/', {
        validation_hash: noteCode, 
        user_id: userId
      });

    };

    // Handle register note action
    const handleRegisterNote = async () => {

      if (!noteCode) return;
      
      const userId = parseInt(localStorage.getItem('user_id'), 10);

      try {
        const response = await fetchPostNote(noteCode, userId);


        setSnackbar({
          open: true,
          message: `Parabéns! Você ganhou ${response.data.points_added} pontos.`,
          severity: "success"
        });

        //setNoteCode("");
        fetchGetPoints();
        
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

    // Initial data fetch
    useEffect(() => {
        fetchGetPoints();
    }, []);

  return (
    <Box sx={{ width: "100%", maxWidth: "1200px", margin: "0 auto", p: 2 }}>
      
      <LeafBox 
        sx={{ gridRow: "2", gridColumn: "1",borderRadius: "195px 0px", }}
        
      >
        {/* Divider */}
        <Box
          sx={{
            position: 'absolute',
            left: '45%',               
            transform: 'translateX(-50%)', 
            top: '20%',                
            bottom: '20%',             
            width: '2px',              
            backgroundColor: 'rgba(255, 255, 255, 0.3)', 
            display: { xs: 'none', md: 'block' } 
          }}
        />

        <Grid container spacing={25} alignItems="center">
          
          {/* LEFT SIDE: Number of Recyclings */}
          <Grid item xs={12} md={6} sx={{ textAlign: { xs: "center"} }}>
              <Typography variant="h3" sx={{ color: "#FFF", mb: 2 }}>
                Meus Pontos
              </Typography>
              
              {/* TRANSPARENT BOX */}
              <Box
                sx={{
                  display: "inline-flex", 
                  alignItems: "center",
                  gap: 2,
                  padding: "12px 24px",
                  borderRadius: "16px", 
                  backgroundColor: "rgba(255, 255, 255, 0.1)", 
                  backdropFilter: "blur(10px)" 
                }}
              >
                {/* COINS ICON */}
                <PaymentsOutlinedIcon sx={{ color: "#FFF", fontSize: 25 }} />
                
                {loading ? (
                    <CircularProgress sx={{ color: 'white' }} size={30} />
                ) : (
                    <Typography variant="body1" sx={{ color: "#FFF", lineHeight: 1, fontSize: "1.5rem", }}>
                      {totalPoints}
                    </Typography>
                )}
              </Box>
            </Grid>

          {/* RIGHT SIDE: Register Note */}
          <Grid item xs={12} md={6}>
            <Box sx={{ maxWidth: "400px", margin: { xs: "0 auto", md: "0 0 0 auto" } }}>
              <Typography variant="h3" sx={{ color: "#FFF", mb: 2, textAlign: { xs: "center", md: "left" } }}>
                Cadastrar nota
              </Typography>

              <Box sx={{ bgcolor: "#FFF", borderRadius: "30px", p: "4px 8px 4px 24px", display: "flex", alignItems: "center", boxShadow: "0px 4px 20px rgba(0,0,0,0.1)" }}>
                <InputBase
                  placeholder="Digite o código da sua nota"
                  value={noteCode}
                  onChange={(e) => setNoteCode(e.target.value)}
                  sx={{ flex: 1, fontFamily: 'Poppins', color: '#5E6282' }}
                />
                <IconButton onClick={handleRegisterNote} sx={{ bgcolor: "#3A5B22", color: "#FFF", "&:hover": { bgcolor: "#2E471B" } }}>
                  <ArrowForwardIcon />
                </IconButton>
              </Box>

              <ButtonBase
                onClick={() => navigate('/historico')}
                sx={{ mt: 4, width: "100%", textAlign: "left", bgcolor: "rgba(255, 255, 255, 0.15)", backdropFilter: "blur(10px)", borderRadius: "16px", p: 2, display: "flex", alignItems: "center", gap: 2, transition: "transform 0.2s", "&:hover": { transform: "scale(1.02)", bgcolor: "rgba(255, 255, 255, 0.25)" } }}
              >
                <Box sx={{ bgcolor: "#FFF", p: 1, borderRadius: "50%" }}>
                  <ManageSearchIcon sx={{ color: "#3A5B22" }} />
                </Box>
                <Box>
                  <Typography sx={{ color: "#FFF", fontWeight: "bold", fontFamily: "Poppins" }}>
                    Histórico de reciclagens
                  </Typography>
                  <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.8)", fontFamily: "Poppins" }}>
                    Visualize os detalhes das suas reciclagens.
                  </Typography>
                </Box>
              </ButtonBase>

            </Box>
          </Grid>
        </Grid>
      </LeafBox>


      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Wallet;