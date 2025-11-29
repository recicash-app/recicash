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
import UserFormDialog from "../components/users/UserFormDialog";

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
      if (selectedUser) {
        await updateUser(selectedUser.id ?? selectedUser.user_id, payload);
        // If changed access level as admin, call setPermission separately (UI should be used by admins).
        if (payload.access_level && payload.access_level !== selectedUser.access_level) {
          await setPermission(selectedUser.id ?? selectedUser.user_id, payload.access_level);
        }
      } else {
        // Creating: if access_level is admin/manager call specific endpoints
        if (payload.access_level === 'A') {
          await createAdmin({ ...payload, password: payload.password });
        } else if (payload.access_level === 'M') {
          await createManager({ ...payload, password: payload.password });
        } else {
          await createUser({ ...payload, password: payload.password });
        }
      }

      // Optionally assign recycling point if provided (admin action)
      if (payload.recycling_point_id) {
        const userId = selectedUser ? (selectedUser.id ?? selectedUser.user_id) : payload.username;
        // assignRecyclingPoint expects numeric id; only do when we have numeric user id
        if (typeof userId === "number") {
          await assignRecyclingPoint(userId, payload.recycling_point_id);
        }
      }

      setRefreshKey((k) => k + 1);
      setSnackbar({
        open: true,
        message: selectedUser ? "Usuário atualizado com sucesso!" : "Usuário criado com sucesso!",
        severity: "success",
      });
      setOpenForm(false);
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
        Ações administrativas para <b>criar admin</b>, <b>criar manager</b>, <b>promover</b> M <b>atribuir ecoponto</b>.
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
        onSave={handleSave}
        onClose={() => setOpenForm(false)}
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