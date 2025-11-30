import { Box, Typography, Button } from "@mui/material";
import { handleRedirect } from "@shared/utils/auth";

function ForbiddenPage() {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      height="80vh"
    >
      <Typography variant="h3" fontWeight="bold" mb={2}>
        403
      </Typography>

      <Typography variant="h6" color="text.hint" mb={3}>
        Você não tem permissão para acessar esta página.
      </Typography>

      <Button 
        variant="recicashCTA"
        sx={{ boxShadow: 1 }}
        onClick={() => handleRedirect(null)}
      >
        Voltar ao início
      </Button>
    </Box>
  );
}

export default ForbiddenPage;