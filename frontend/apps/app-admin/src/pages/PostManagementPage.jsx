import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
} from "@mui/material";
import { AddRounded } from "@mui/icons-material";

import DataTable from "../components/DataTable";
import ConfirmDialog from "../components/ConfirmDialog";
import PostFormOverlay from "../components/posts/PostFormOverlay";
import { postsColumns, postsActions } from "../data/postsTableConfig";

function PostManagementPage() {
  const [posts, setPosts] = useState([
    {
      id: 1,
      title: "Primeiro Post",
      text: "Descrição do primeiro post",
      images: "https://via.placeholder.com/150",
    },
    {
      id: 2,
      title: "Notícia Ambiental",
      text: "Um texto sobre sustentabilidade.",
      images: "https://via.placeholder.com/150",
    },
  ]);

  const [openModal, setOpenModal] = useState(false);
  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  // --- Handlers ---
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

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleCloseConfirm = () => {
    setOpenConfirmDelete(false);
  };

  const handleSave = (formData) => {
    if (selectedPost) {
      // Update
      setPosts((prev) =>
        prev.map((p) => (p.id === selectedPost.id ? { ...formData, id: p.id } : p))
      );
    } else {
      // Create
      const newPost = { ...formData, id: Date.now() };
      setPosts((prev) => [...prev, newPost]);
    }
    setOpenModal(false);
  };

  const handleDelete = () => {
    setPosts((prev) => prev.filter((p) => p.id !== selectedPost.id));
    setOpenConfirmDelete(false);
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
      <DataTable
        columns={postsColumns}
        rows={posts}
        renderActions={postsActions(handleOpenEdit, handleOpenDelete)}
      />

      {/* Create / Update Modal */}
      <PostFormOverlay
        open={openModal}
        post={selectedPost}
        onClose={handleCloseModal}
        onSave={handleSave}
      />
      
      {/* Confirm Delete Popup */}
      <ConfirmDialog
        open={openConfirmDelete}
        title="Confirmar Remoção"
        description={`Tem certeza que deseja remover o post "${selectedPost?.title}"?`}
        confirmLabel="Remover"
        confirmColor="error"
        onCancel={handleCloseConfirm}
        onConfirm={handleDelete}
      />
    </Box>
  );
}

export default PostManagementPage;
