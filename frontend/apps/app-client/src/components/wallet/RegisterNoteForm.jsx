import { Box, Typography, InputBase, IconButton } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

function RegisterNoteForm({ noteCode, setNoteCode, onSubmit }) {
  return (
    <Box sx={{ maxWidth: "400px", margin: { xs: "0 auto", md: "0 0 0 auto" } }}>
      <Typography
        variant="h3"
        sx={{ color: "#FFF", mb: 2, textAlign: { xs: "center", md: "left" } }}
      >
        Cadastrar nota
      </Typography>

      <Box
        sx={{
          bgcolor: "#FFF",
          borderRadius: "30px",
          p: "4px 8px 4px 24px",
          display: "flex",
          alignItems: "center",
          boxShadow: "0px 4px 20px rgba(0,0,0,0.1)",
        }}
      >
        <InputBase
          placeholder="Digite o código da sua nota"
          value={noteCode}
          onChange={(e) => setNoteCode(e.target.value)}
          sx={{ flex: 1, color: "#5E6282" }}
        />

        <IconButton
          onClick={onSubmit}
          sx={{
            bgcolor: "#3A5B22",
            color: "#FFF",
            "&:hover": { bgcolor: "#2E471B" },
          }}
        >
          <ArrowForwardIcon />
        </IconButton>
      </Box>
    </Box>
  );
}

export default RegisterNoteForm;