import { IconButton } from "@mui/material";
import { EditRounded, DeleteRounded } from "@mui/icons-material";

export const postsColumns = [
  { 
    key: "title", 
    label: "Título",
    render: (value) =>
      <b> {value} </b>,
  },
  {
    key: "text",
    label: "Conteúdo",
    render: (value) =>
      value?.length > 80 ? value.substring(0, 80) + "..." : value,
  },
  {
    key: "images",
    label: "Imagem",
    render: (value) => (
      <img
        src={value?.length > 0 && value[0].image_url}
        style={{ width: 80, height: 60, objectFit: "scale-down" }}
      />
    ),
  },
];

export const postsActions = (onEdit, onDelete) => (row) => (
  <>
    <IconButton onClick={() => onEdit(row)}>
      <EditRounded />
    </IconButton>

    <IconButton onClick={() => onDelete(row)}>
      <DeleteRounded />
    </IconButton>
  </>
);