import { Grid, Typography, Box } from "@mui/material";
import LeafBox from "@shared/ui/LeafBox";

export default function HistoryHeader() {
  return (
    <Grid
      item
      xs={12}
      sm={4}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        width: '30%',
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <LeafBox sx={{ borderRadius: "150px 0px" }}>
          <Box
            component="img"
            src="/icon-recycle.svg"
            alt="recycle icon"
            sx={{ userSelect: "none", pointerEvents: "none" }}
          />
        </LeafBox>
      </Box>

      <Typography
        variant="h4"
        sx={{
          fontWeight: "bold",
          color: "#5E6282",
          fontFamily: "Poppins",
          textAlign: "center",
        }}
      >
        Histórico de Reciclagens
      </Typography>
    </Grid>
  );
}