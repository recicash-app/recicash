import { IconButton } from "@mui/material";
import { EditRounded, DeleteRounded } from "@mui/icons-material";

export const usersColumns = [
  { 
    key: "username", 
    label: "Usuário",
  },
  {
    key: "email",
    label: "Email",
  },
  {
    key: "cpf",
    label: "CPF",
  },
  {
    key: "access_level",
    label: "Permissão",
  }
];

export const usersActions = (onEdit, onDelete) => (row) => {
    const buttons = [];
    const isUserRow = row.access_level === "U";
    
    if (isUserRow) return buttons;

    // Edit button 
    buttons.push(
      <IconButton key="edit" color="primary" onClick={() => onEdit(row)}>
        <EditRounded />
      </IconButton>
    );

    // Delete button
    buttons.push(
      <IconButton
        key="delete"
        color="error"
        onClick={() => onDelete(row)}
        title={"Remover"}
      >
        <DeleteRounded />
      </IconButton>
    );
    
    return buttons;
};