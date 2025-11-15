import { useEffect, useState } from "react";
import { Box, Tooltip, IconButton } from "@mui/material";
import { Edit, Save, Preview } from "@mui/icons-material";

import TextBlock from "@shared/ui/TextBlock";
import TitleBlock from "@shared/ui/TitleBlock";
import ImageBlock from "@shared/ui/ImageBlock";
import FullScreenOverlay from "@shared/ui/FullScreenOverlay";
import ConfirmDialog from "@/components/ConfirmDialog";

function PostFormOverlay({ open, post = {}, onClose, onSave }) {
  const [formData, setFormData] = useState({ title: "", text: "", image: null });
  const [editingMode, setEditingMode] = useState(true);
  const [confirmClose, setConfirmClose] = useState(false);

  // Initialize form state when post or open changes
  useEffect(() => {
    setFormData({
      title: post?.title || "",
      text: post?.text || "",
      image: post?.images?.length > 0 ? post.images[0].image_url : null, // existing URL
    });
    setEditingMode(open);
  }, [post, open]);

  const confirmCloseDialog = () => {
    setConfirmClose(false);
    onClose?.();
  };

  // Image change handler
  const handleImageChange = (val) => {
    setFormData((prev) => ({
      ...prev,
      image: val, // null | URL string | { file, preview }
    }));
  };

  return (
    <>
      <FullScreenOverlay
        open={open}
        onClose={() => setConfirmClose(true)}
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
              <IconButton size="small" onClick={() => onSave && onSave(formData)}>
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
            gap: "32px",
            p: 3,
            minHeight: "60vh",
            width: "100%",
            alignItems: "start",
          }}
        >
          {/* Left Column */}
          <Box sx={{ gridColumn: "1", display: "flex", flexDirection: "column", gap: 2, width: "2fr" }}>
            <TitleBlock
              sx={{ minHeight: "4rem" }}
              isEditing={editingMode}
              content={formData.title}
              onChange={(val) => setFormData((prev) => ({ ...prev, title: val }))}
            />
            <TextBlock
              sx={{ flex: 1, minHeight: "25rem", mb: { sx: 3, md: 6 } }}
              isEditing={editingMode}
              content={formData.text}
              onChange={(val) => setFormData((prev) => ({ ...prev, text: val }))}
            />
          </Box>

          {/* Right Column */}
          <ImageBlock
            key={post?.id || "new"}
            isEditing={editingMode}
            content={formData.image}
            sx={{ gridColumn: "2", maxHeight: "300px", width: "1fr" }}
            onChange={handleImageChange}
          />
        </Box>
      </FullScreenOverlay>

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
    </>
  );
}

export default PostFormOverlay;
