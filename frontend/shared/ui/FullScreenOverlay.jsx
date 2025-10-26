import { Box, IconButton, Modal } from "@mui/material";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";

function FullScreenOverlay({ open, onClose, actions, children }) {
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
      {/* Centering wrapper */}
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
        {/* Content container */}
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
          <Box
            sx={{
              display: "flex",
              justifyContent: 'space-between'
            }}
          >
            {/* Close Button */}
            <IconButton onClick={onClose}>
              <CancelOutlinedIcon fontSize="medium" />
            </IconButton>
            
            {/* Optional Actions */}
            {actions && (
              <Box>
                {actions}
              </Box>
            )}
          </Box>

          {/* Overlay content */}
          {children}
        </Box>
      </Box>
    </Modal>
  );
}

export default FullScreenOverlay;
