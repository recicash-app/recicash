import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
} from "@mui/material";
import { AddRounded } from "@mui/icons-material";

import AppSnackbar from "@/components/AppSnackbar";
import DataGridTable from "@/components/DataGridTable";
import ConfirmDialog from "@/components/ConfirmDialog";
import PostFormOverlay from "@/components/posts/PostFormOverlay";

import { postsColumns, postsActions } from "../data/postsTableConfig";
import { fetchPosts, createPost, updatePost, deletePost, deletePostImage } from "../utils/postApi";

function PostManagementPage() {
  const [openModal, setOpenModal] = useState(false);
  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedPost, setSelectedPost] = useState(null);

  const handleOpenCreate = () => {
    setSelectedPost(null);
    setOpenModal(true);
  };

  const handleOpenEdit = (post) => {
    setSelectedPost(post);
    setOpenModal(true);
  };

  const handleOpenDelete = (post) => {
    setSelectedPost(post);
    setOpenConfirmDelete(true);
  };

  const handleSave = async (formData) => {
    const { title, text, image } = formData;
    const payload = { title, text, imageFile: image?.file };
    const isEdit = Boolean(selectedPost?.id);

    if (!title || !text ) {
      setSnackbar({
        open: true,
        message: "É obrigatório preencher os campos de título e conteúdo.",
        severity: "warning",
      });
      return;
    }
    try {
      if (isEdit) {
        await updatePost(selectedPost.id, payload);
        if (!image && selectedPost?.images.length > 0) await deletePostImage(selectedPost.id);
      } else {
        await createPost(payload);
      }

      setRefreshKey((k) => k + 1);
      setSnackbar({
        open: true,
        message: isEdit ? "Alterações salvas com sucesso!" : "Post criado com sucesso!",
        severity: "success",
      });
    } catch (error) {
      // console.error("Failed to save post:", error);
      setSnackbar({
        open: true,
        message: "Falha ao criar ou editar post.",
        severity: "error",
      });
    } finally {
      setOpenModal(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPost) {
      setOpenConfirmDelete(false);
      return;
    }

    try {
      await deletePost(selectedPost.id);
      setRefreshKey((k) => k + 1);
      setSnackbar({
        open: true,
        message: "Post excluído com sucesso!",
        severity: "success",
      });
    } catch (error) {
      // console.error("Failed to delete post:", error);
      setSnackbar({
        open: true,
        message: "Falha ao excluir post.",
        severity: "error",
      });
    } finally {
      setOpenConfirmDelete(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Typography variant="body1" color="text.primary" fontWeight={600} mb={1}>
        Gerenciar Posts
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Crie, edite ou remova publicações que aparecerão na área pública do site.  
        Cada post contém um <strong>título</strong>, <strong>conteúdo</strong> e <strong>imagem</strong>.
      </Typography>

      {/* New Post Button */}
      <Stack direction="row" justifyContent="flex-end" mb={2}>
        <Button
          variant="recicashOutlined"
          startIcon={<AddRounded />}
          onClick={handleOpenCreate}
        >
          Novo Post
        </Button>
      </Stack>

      {/* Posts Table */}
      <DataGridTable
        refreshKey={refreshKey}
        columns={postsColumns}
        fetchCallback={fetchPosts}
        actionsColumn={postsActions(handleOpenEdit, handleOpenDelete)}
      />

      {/* Create / Update Modal */}
      <PostFormOverlay
        open={openModal}
        post={selectedPost}
        onSave={handleSave}
        onClose={() => setOpenModal(false)}
        setLog={setSnackbar}
      />
      
      {/* Confirm Delete Popup */}
      <ConfirmDialog
        open={openConfirmDelete}
        title="Confirmar Remoção"
        description={`Tem certeza que deseja remover o post "${selectedPost?.title}"?`}
        confirmLabel="Remover"
        confirmColor="error"
        onCancel={() => setOpenConfirmDelete(false)}
        onConfirm={() => {
          handleDelete();
          setOpenConfirmDelete(false);
        }}
      />

      {/* Snackbar */}
      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      />
    </Box>
  );
}

export default PostManagementPage;