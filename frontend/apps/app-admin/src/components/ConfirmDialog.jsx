import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from "@mui/material";

function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  confirmColor = "primary",
  onCancel,
  onConfirm,
}) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="xs"
      fullWidth
    >
      <DialogContent sx={{ pt: 3, pb: 1 }}>
        <Box mb={2}>
          <Typography
            variant="body1"
            color="text.primary"
            fontWeight={600}
            gutterBottom
          >
            {title}
          </Typography>
          {description && (
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onCancel} variant="recicashOutlined">
          Cancelar
        </Button>
        <Button
          variant="contained"
          color={confirmColor}
          onClick={onConfirm}
          autoFocus
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmDialog;
