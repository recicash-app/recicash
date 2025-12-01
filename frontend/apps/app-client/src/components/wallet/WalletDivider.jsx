import { Box } from "@mui/material";

function WalletDivider() {
  return (
    <Box
      sx={{
        position: "absolute",
        left: "45%",
        transform: "translateX(-50%)",
        top: "20%",
        bottom: "20%",
        width: "2px",
        backgroundColor: "rgba(255, 255, 255, 0.3)",
        display: { xs: "none", md: "block" },
      }}
    />
  );
}

export default WalletDivider;