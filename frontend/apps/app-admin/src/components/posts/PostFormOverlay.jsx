import { useEffect, useState } from "react";
import {
  Box,
  Tooltip,
  IconButton,
} from "@mui/material";
import { Edit, Save, Preview } from "@mui/icons-material";

import AppSnackbar from "../AppSnackbar";
import ConfirmDialog from "../ConfirmDialog";
import TextBlock from "@shared/ui/TextBlock";
import TitleBlock from "@shared/ui/TitleBlock";
import ImageBlock from "@shared/ui/ImageBlock";
import FullscreenOverlay from "@shared/ui/FullscreenOverlay";

function PostFormOverlay({ open, post = {}, onClose, onSave }) {
  const [formData, setFormData] = useState({ title: "", text: "", images: "" });
  const [editingMode, setEditingMode] = useState(true);
  const [confirmClose, setConfirmClose] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    setFormData({
        title: post?.title || "",
        text: post?.text || "",
        images: post?.images || "",
      });
    setEditingMode(open);
  }, [post, open]);

  const handleSave = () => {
    if (onSave) onSave(formData);

    setSnackbar({
      open: true,
      message: post?.id
        ? "Alterações salvas com sucesso!"
        : "Post criado com sucesso!",
      severity: "success",
    });
  };

  const handleCloseRequest = () => {
    setConfirmClose(true);
  };

  const confirmCloseDialog = () => {
    setConfirmClose(false);
    onClose?.();
  };

  return (
    <>
      <FullscreenOverlay
        open={open}
        onClose={handleCloseRequest}
        actions={
          <Box>
            <Tooltip title={editingMode ? "Pré-visualizar" : "Editar"}>
              <IconButton
                size="small"
                onClick={() => setEditingMode((prev) => !prev)}
              >
                {editingMode ? <Preview fontSize="small" /> : <Edit fontSize="small" />}
              </IconButton>
            </Tooltip>
            <Tooltip title={post?.id ? "Salvar Alterações" : "Criar"}>
              <IconButton size="small" onClick={handleSave}>
                <Save fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        }
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
            gap: 3, mt: 2, p: 3,
            minHeight: "60vh",
            width: "100%",
            alignItems: "start",
          }}
        >
          {/* Left Column */}
          <Box
            sx={{
              gridColumn: "1",
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <TitleBlock
              sx={{ minHeight: "4rem" }}
              isEditing={editingMode}
              content={formData.title}
              onChange={(val) => setFormData((prev) => ({ ...prev, title: val }))}
            />
            <TextBlock
              sx={{ flex: 1, minHeight: "25rem" }}
              isEditing={editingMode}
              content={formData.text}
              onChange={(val) => setFormData((prev) => ({ ...prev, text: val }))}
            />
          </Box>

          {/* Right Column */}
          <ImageBlock
            isEditing={editingMode}
            content={formData.images}
            sx={{ gridColumn: "2", maxHeight: "300px" }}
            onChange={(val) => setFormData((prev) => ({ ...prev, images: val }))}
          />
        </Box>
      </FullscreenOverlay>

      {/* Confirm Close Popup */}
      <ConfirmDialog
        open={confirmClose}
        title="Descartar alterações?"
        description="Tem certeza de que deseja fechar? As alterações não salvas serão perdidas."
        confirmLabel="Fechar"
        confirmColor="error"
        onCancel={() => setConfirmClose(false)}
        onConfirm={confirmCloseDialog}
      />

      {/* Success Snackbar */}
      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      />
    </>
  );
}

export default PostFormOverlay;
