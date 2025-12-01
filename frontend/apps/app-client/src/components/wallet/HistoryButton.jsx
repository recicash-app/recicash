import { ButtonBase, Box, Typography } from "@mui/material";
import ManageSearchIcon from "@mui/icons-material/ManageSearch";

function HistoryButton({ onClick }) {
  return (
    <ButtonBase
      onClick={onClick}
      sx={{
        mt: 4,
        width: "100%",
        textAlign: "left",
        bgcolor: "rgba(255, 255, 255, 0.15)",
        backdropFilter: "blur(10px)",
        borderRadius: "16px",
        p: 2,
        display: "flex",
        alignItems: "center",
        gap: 2,
        transition: "transform 0.2s",
        "&:hover": {
          transform: "scale(1.02)",
          bgcolor: "rgba(255, 255, 255, 0.25)",
        },
      }}
    >
      <Box sx={{ bgcolor: "#FFF", p: 1, borderRadius: "50%" }}>
        <ManageSearchIcon sx={{ color: "#3A5B22" }} />
      </Box>

      <Box>
        <Typography sx={{ color: "#FFF", fontWeight: "bold" }}>
          Histórico de reciclagens
        </Typography>
        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.8)" }}>
          Visualize os detalhes das suas reciclagens.
        </Typography>
      </Box>
    </ButtonBase>
  );
}

export default HistoryButton;