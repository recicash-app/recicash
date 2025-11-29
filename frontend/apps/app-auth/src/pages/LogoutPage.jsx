import { useEffect, useState, useRef } from "react";
import { CircularProgress, Box, Typography, Button } from "@mui/material";
import { logout } from "@shared/utils/auth";

const LANDING_URL = "http://web.docker.localhost"

function LogoutPage() {
  const [status, setStatus] = useState("loading"); // loading | success | error
  const hasRun = useRef(false);

  useEffect(() => {
    // Prevent this effect from running twice in React Strict Mode (dev environment only)
    if (hasRun.current) return;
    hasRun.current = true;

    async function doLogout() {
      try {
        await logout();
        setStatus("success");
        setTimeout(() => {
          window.location.href = LANDING_URL;
        }, 1500);
      } catch (err) {
        setStatus("error");
      }
    }

    doLogout();
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        width: "100%",
      }}
    >
      {status === "loading" && (
        <>
          <CircularProgress color="secondary" />
          <Typography mt={2} color="text.hint">
            Encerrando sessão...
          </Typography>
        </>
      )}

      {status === "success" && (
        <Typography color="secondary.main">Logout realizado com sucesso!</Typography>
      )}

      {status === "error" && (
        <>
          <Typography color="text.primary" mb={2}>
            Falha ao encerrar a sessão...
          </Typography>
          <Button
            variant="recicashOutlined"
            sx={{ width: "auto" }}
            onClick={() => (window.location.href = LANDING_URL)}
          >
            Voltar ao início
          </Button>
        </>
      )}
    </Box>
  );
}

export default LogoutPage;