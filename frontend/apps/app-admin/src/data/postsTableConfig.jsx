import { IconButton } from "@mui/material";
import { EditRounded, DeleteRounded } from "@mui/icons-material";

export const postsColumns = [
  { key: "title", label: "Título" },
  {
    key: "text",
    label: "Conteúdo",
    render: (value) =>
      value.length > 80 ? value.substring(0, 80) + "..." : value,
  },
  {
    key: "images",
    label: "Imagem",
    render: (value, row) => (
      <img src={value} alt={row.title} style={{ width: 80 }} />
    ),
  },
];

export const postsActions = (handleOpenEdit, handleOpenDelete) => (post) => (
  <>
    <IconButton onClick={() => handleOpenEdit(post)}>
      <EditRounded />
    </IconButton>
    <IconButton onClick={() => handleOpenDelete(post)}>
      <DeleteRounded />
    </IconButton>
  </>
);
