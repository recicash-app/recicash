import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
} from "@mui/material";
import { AddRounded } from "@mui/icons-material";

import AppSnackbar from "@shared/ui/AppSnackbar";
import DataGridTable from "@/components/DataGridTable";
import ConfirmDialog from "@/components/ConfirmDialog";
import UserFormDialog from "@/components/users/UserFormDialog";

import { usersColumns, usersActions } from "../data/usersTableConfig";

import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  createAdmin,
  createManager,
  setPermission,
  assignRecyclingPoint,
} from "../utils/userApi";

function UsersManagementPage() {
  const [openForm, setOpenForm] = useState(false);
  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleOpenCreate = () => {
    setSelectedUser(null);
    setOpenForm(true);
  };

  const handleOpenEdit = (user) => {
    setSelectedUser(user);
    setOpenForm(true);
  };

  const handleOpenDelete = (user) => {
    setSelectedUser(user);
    setOpenConfirmDelete(true);
  };

  const handleSave = async (payload) => {
    try {
      let response = null;

      if (selectedUser) {
        await updateUser(selectedUser.id ?? selectedUser.user_id, payload);

        if (payload.access_level && payload.access_level !== selectedUser.access_level) {
          await setPermission(selectedUser.id ?? selectedUser.user_id, payload.access_level);
        }

      } else {
        if (payload.access_level === 'A') {
          response = await createAdmin({ ...payload });
        } else if (payload.access_level === 'M') {
          response = await createManager({ ...payload });
        }
      }

      const userId = selectedUser
        ? selectedUser.user_id
        : response.user.user_id;

      if (payload.recycling_point_id && userId) {
        await assignRecyclingPoint(userId, payload.recycling_point_id);
      }

      setRefreshKey((k) => k + 1);

      setSnackbar({
        open: true,
        message: selectedUser
          ? "Usuário atualizado com sucesso!"
          : "Usuário criado com sucesso!",
        severity: "success",
      });

    } catch (err) {
      setSnackbar({
        open: true,
        message: err?.response?.data?.detail || "Falha ao salvar usuário.",
        severity: "error",
      });
    }
  };


  const handleDelete = async () => {
    try {
      await deleteUser(selectedUser.id ?? selectedUser.user_id);
      setRefreshKey((k) => k + 1);
      setSnackbar({ open: true, message: "Usuário excluído com sucesso!", severity: "success" });
    } catch (err) {
      setSnackbar({ open: true, message: "Falha ao excluir usuário.", severity: "error" });
    } finally {
      setOpenConfirmDelete(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="body1" color="text.primary" fontWeight={600} mb={1}>
        Gerenciar Usuários
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Ações administrativas para <b>criar admin</b>, <b>criar manager</b>, <b>promover usuários</b> e <b>atribuir ecoponto</b>.
      </Typography>

      <Stack direction="row" justifyContent="flex-end" mb={2}>
        <Button variant="recicashOutlined" startIcon={<AddRounded />} onClick={handleOpenCreate} sx={{ width: 'auto' }}>
          Novo Usuário
        </Button>
      </Stack>

      <DataGridTable 
        refreshKey={refreshKey} 
        columns={usersColumns} 
        fetchCallback={fetchUsers} 
        actionsColumn={usersActions(handleOpenEdit, handleOpenDelete )}
      />

      {/* User Form Dialog */}
      <UserFormDialog
        open={openForm}
        user={selectedUser}
        onClose={() => setOpenForm(false)}
        onSave={async (payload) => {
          await handleSave(payload);
          setOpenForm(false);
        }}
      />

      {/* Confirm Delete */}
      <ConfirmDialog
        open={openConfirmDelete}
        title="Confirmar Remoção"
        description={`Tem certeza que deseja remover o usuário "${selectedUser?.username}"?`}
        confirmLabel="Remover"
        confirmColor="error"
        onCancel={() => setOpenConfirmDelete(false)}
        onConfirm={() => {
          handleDelete();
          setOpenConfirmDelete(false);
        }}
      />

      <AppSnackbar open={snackbar.open} message={snackbar.message} severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} />
    </Box>
  );
}

export default UsersManagementPage;