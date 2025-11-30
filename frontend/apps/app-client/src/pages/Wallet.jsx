import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Grid, Snackbar, Alert } from "@mui/material";

import LeafBox from "@shared/ui/LeafBox";
import { useAuth } from "@shared/utils/AuthProvider";

import WalletDivider from "../components/wallet/WalletDivider";
import WalletPointsDisplay from "../components/wallet/WalletPointsDisplay";
import RegisterNoteForm from "../components/wallet/RegisterNoteForm";
import HistoryButton from "../components/wallet/HistoryButton";

import { getPoints, postNote} from "../services/wallet.js"

const walletContainer = {
  width: "100%",
  maxWidth: "1200px",
  margin: "0 auto",
  p: 2,
  
};

function Wallet() {

  // Initialization of states
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [noteCode, setNoteCode] = useState("");
  const [totalPoints, setTotalPoints] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // handle total points 
  const handleGetPoints = async () => {

    if (!user || !user.user_id) {
        setLoading(false);
        return;
    }

    try {
        const response = await getPoints({ userId: user.user_id });
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

  // Handle register note
  const handleRegisterNote = async () => {

    if (!noteCode) return;
    
    const userId = parseInt(localStorage.getItem('user_id'), 10);

    try {
      const response = await postNote({ noteCode, userId });

      setSnackbar({
        open: true,
        message: `Parabéns! Você ganhou ${response.data.points_added} pontos.`,
        severity: "success"
      });

      handleGetPoints();
      
    } 
    catch (error) {

      console.error("Erro ao cadastrar nota:", error);
      console.log(error.response);
      console.log("Detalhes:", error.response.data);

      setSnackbar({
        open: true,
        message: "Erro ao cadastrar nota.",
        severity: "error"
      });
      
    }
    setNoteCode("");
  };

  useEffect(() => {
      handleGetPoints();
  }, []);

  return (
    <Box sx={walletContainer}>
      <LeafBox sx={{  gridRow: "2", gridColumn: "1",borderRadius: "195px 0px" }}>

        <WalletDivider /> 

        <Grid container spacing={25} alignItems="center">

          <Grid item xs={12} md={6} sx={{ textAlign: { xs: "center"} }}>
            <WalletPointsDisplay
              loading={loading}
              totalPoints={totalPoints}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <RegisterNoteForm
              noteCode={noteCode}
              setNoteCode={setNoteCode}
              onSubmit={handleRegisterNote}
            />

            <HistoryButton onClick={() => navigate("/historico")} />
          </Grid>
      
        </Grid>
      </LeafBox>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>

    </Box>
  );
}

export default Wallet;