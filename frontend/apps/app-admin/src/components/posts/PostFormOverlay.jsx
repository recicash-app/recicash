import { useEffect, useState } from "react";
import { Box, Tooltip, IconButton } from "@mui/material";
import { Edit, Save, Preview } from "@mui/icons-material";

import PostLayout from "@shared/ui/PostLayout";
import ConfirmDialog from "@/components/ConfirmDialog";
import FullScreenOverlay from "@shared/ui/FullScreenOverlay";

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
        <PostLayout
          data={formData}
          isEditing={editingMode}
          onChange={setFormData}
        />
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
