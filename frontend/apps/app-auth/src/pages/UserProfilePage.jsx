import { useState, useEffect } from "react";
import {
  Box,
  IconButton,
  Tooltip,
  Button,
  Typography,
  Dialog,
  Snackbar,
  Alert
} from "@mui/material";

import {
  Edit,
  Preview,
  Save,
  Logout,
  ArrowBack,
  Password as PasswordIcon,
} from "@mui/icons-material";

import { validateUserForm } from "@shared/utils/userValidators";
import { useNavigate } from "react-router-dom";
import InputField from "@shared/ui/InputField";
import TextBlock from "@shared/ui/TextBlock";

import api from "@shared/utils/api";
import { useAuth } from "@shared/utils/AuthProvider";

async function updateUserPartial(id, payload) {
  const res = await api.patch(`/users/${id}/`, payload);
  return res.data;
}

async function changePassword(id, payload) {
  const res = await api.post(`/users/${id}/change_password/`, payload);
  return res.data;
}

function InfoBlock({ label, value, editing, onChange, error }) {
  return (
    <Box>
      <Typography
        color="text.hint"
        sx={{ fontSize: "16px", fontWeight: 600, mb: 0.8 }}
      >
        {label}
      </Typography>

      <TextBlock
        isEditing={editing}
        content={value ?? ""}
        onChange={onChange}
        sx={{
          "& .MuiInputBase-root": {
            borderRadius: 2,
          },
        }}
      />

      {error && (
        <Typography
          variant="caption"
          color="error"
          sx={{ ml: 0.6, mt: 0.5, display: "block" }}
        >
          {error}
        </Typography>
      )}
    </Box>
  );
}

function UserProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState(null);

  const [editingMode, setEditingMode] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showSnack = (message, severity = "success") => {
    setSnack({ open: true, message, severity });
  };

  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  useEffect(() => {
    setFormData(user);
  }, [user]);


  const handleSave = async () => {
    const errors = validateUserForm(formData, { isEditing: true });
    setFormErrors(errors);
  
    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      await updateUserPartial(user.user_id, formData);
      setEditingMode(false);
      showSnack("Dados atualizados com sucesso!", "success");
    } catch (err) {
      showSnack(err.response?.data?.error || "Erro ao salvar.", "error");
    }
  };


  const handlePasswordChange = async () => {
    try {
      await changePassword(user.user_id, passwordForm);
      showSnack("Senha alterada com sucesso!", "success");

      setPasswordForm({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });

      setOpenPasswordDialog(false);
    } catch (err) {
      showSnack(err.response?.data?.error || "Erro ao alterar senha.", "error");
    }
  };

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Box sx={{ width: "100%", p: 4 }}>
      {/* TOP */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Button
          startIcon={<ArrowBack />}
          variant="recicashOutlined"
          onClick={() => navigate(-2)}
          sx={{ borderRadius: 2, textTransform: "none", px: 2.5 }}
        >
          Voltar
        </Button>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Alterar senha">
            <IconButton size="small" onClick={() => setOpenPasswordDialog(true)}>
              <PasswordIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title={editingMode ? "Pré-visualizar" : "Editar"}>
            <IconButton size="small" onClick={() => setEditingMode(!editingMode)}>
              {editingMode ? <Preview /> : <Edit />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Salvar">
            <IconButton size="small" onClick={handleSave}>
              <Save />
            </IconButton>
          </Tooltip>

          <Tooltip title="Sair">
            <IconButton
              size="small"
              color="error"
              onClick={() => navigate("/logout")}
            >
              <Logout />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 4,
          padding: 2,
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <Typography variant="h4"> Informações Gerais </Typography>

          <InfoBlock
            label="Nome"
            value={`${formData?.first_name || ""} ${formData?.last_name || ""}`}
          />

          <InfoBlock
            label="Usuário"
            value={formData?.username}
            editing={editingMode}
            onChange={(v) => updateField("username", v)}
            error={formErrors?.username}
          />

          <InfoBlock
            label="Email"
            value={formData?.email}
            editing={editingMode}
            onChange={(v) => updateField("email", v)}
            error={formErrors?.email}
          />
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography variant="h4"> Outras Informações </Typography>

          <InfoBlock
            label="CPF"
            value={formData?.cpf}
            editing={editingMode}
            onChange={(v) => updateField("cpf", v)}
            error={formErrors?.cpf}
          />

          <InfoBlock
            label="CEP"
            value={formData?.zip_code}
            editing={editingMode}
            onChange={(v) => updateField("zip_code", v)}
            error={formErrors?.zip_code}
          />

          <InfoBlock
            label="Nível de Acesso"
            value={formData?.access_level}
          />
        </Box>
      </Box>

      <Dialog
        open={openPasswordDialog}
        onClose={() => setOpenPasswordDialog(false)}
      >
        <Box
          sx={{
            p: 3,
            minWidth: 380,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Typography variant="h6" fontWeight={700}>
            Alterar Senha
          </Typography>

          <InputField
            required
            type="password"
            label="Senha Atual"
            value={passwordForm.current_password}
            onChange={(e) =>
              setPasswordForm({
                ...passwordForm,
                current_password: e.target.value,
              })
            }
          />

          <InputField
            required
            type="password"
            label="Nova Senha"
            value={passwordForm.new_password}
            onChange={(e) =>
              setPasswordForm({
                ...passwordForm,
                new_password: e.target.value,
              })
            }
          />

          <InputField
            required
            type="password"
            label="Confirmar Nova Senha"
            value={passwordForm.confirm_password}
            onChange={(e) =>
              setPasswordForm({
                ...passwordForm,
                confirm_password: e.target.value,
              })
            }
          />

          <Box sx={{ display: "flex", justifyContent: "end", gap: 1, mt: 1 }}>
            <Button
              variant="recicashSoftOutlined"
              onClick={() => setOpenPasswordDialog(false)}
            >
              Cancelar
            </Button>
            <Button variant="recicashOutlined" onClick={handlePasswordChange}>
              Confirmar
            </Button>
          </Box>
        </Box>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnack({ ...snack, open: false })}
          severity={snack.severity}
          sx={{ width: '100%' }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default UserProfilePage;
