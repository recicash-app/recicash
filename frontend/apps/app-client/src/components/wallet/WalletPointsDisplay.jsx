import { Box, Typography, CircularProgress } from "@mui/material";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";

function WalletPointsDisplay({ loading, totalPoints }) {
  return (
    <Box sx={{ textAlign: { xs: "center", md: "left" }, mb: 5 }}>
      <Typography variant="h3" sx={{ color: "#FFF", mb: 2 }}>
        Meus Pontos
      </Typography>

      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 2,
          padding: "12px 24px",
          borderRadius: "16px",
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
        }}
      >
        <PaymentsOutlinedIcon sx={{ color: "#FFF", fontSize: 25 }} />

        {loading ? (
          <CircularProgress sx={{ color: "white" }} size={30} />
        ) : (
          <Typography
            variant="body1"
            sx={{ color: "#FFF", fontSize: "1.5rem" }}
          >
            {totalPoints}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default WalletPointsDisplay;