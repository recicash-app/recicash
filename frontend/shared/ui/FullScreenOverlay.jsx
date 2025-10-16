import { Box, IconButton, Modal } from "@mui/material";
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';

function FullScreenOverlay({ open, onClose, children }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      BackdropProps={{
        sx: {
          bgcolor: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(4px)",
        },
      }}
    >
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          outline: "none",
        }}
      >
        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: "100%",
            bgcolor: "background.paper",
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
            p: { xs: 3, md: 6 },
          }}
        >
          <IconButton
            onClick={onClose}
            sx={{
              position: "absolute",
              top: 32,
              left: 32,
              p: 0,
              color: "text.primary",
              zIndex: 10,
            }}
          >
            <CancelOutlinedIcon fontSize="medium" />
          </IconButton>

          {children}
        </Box>
      </Box>
    </Modal>
  );
}

export default FullScreenOverlay;
