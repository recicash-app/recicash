import { useEffect, useState, useMemo } from "react";
import {
  Box,
  Stack,
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  MenuItem,
  Alert,
  Divider,
  Typography
} from "@mui/material";

import { validateUserForm } from '@shared/utils/userValidators';
import ConfirmDialog from "@/components/ConfirmDialog";
import InputField from "@shared/ui/InputField";

function UserFormDialog({ open, user = {}, onClose, onSave }) {
  const isEditing = Boolean(user && (user.user_id || user.id));

  const initial = {
    username: user?.username || "",
    email: user?.email || "",
    cpf: user?.cpf || "",
    access_level: user?.access_level || 'A',
    recycling_point_id: user?.fav_recycling_point_id || "",
    zip_code: user?.zip_code || "", 
    // password fields
    password: "",
    confirm_password: "",
  };

  const [formData, setFormData] = useState(initial);
  const [confirmClose, setConfirmClose] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setFormData({
      ...initial,
      password: "",
      confirm_password: "",
    });
    setServerError(null);
    setDirty(false);
  }, [open, user]);

  const errors = useMemo(() => {
    return validateUserForm(formData, { isEditing });
  }, [formData, isEditing]);

  const hasErrors = Object.keys(errors).length > 0;

  function setField(key, value) {
    setFormData((s) => ({ ...s, [key]: value }));
    setDirty(true);
    setServerError(null);
  }

  const handleClose = () => {
    if (dirty) {
      setConfirmClose(true);
      return;
    }
    onClose?.();
  };

  const confirmCloseDialog = () => {
    setConfirmClose(false);
    onClose?.();
  };

  const handleSave = async () => {
    setServerError(null);
    if (hasErrors) return;

    const payload = {
      username: formData.username.trim(),
      email: formData.email.trim(),
      cpf: formData.cpf.trim(),
      zip_code: formData.zip_code.trim(),
      access_level: formData.access_level,
    };

    if (formData.recycling_point_id) payload.recycling_point_id = formData.recycling_point_id;

    if (!isEditing) {
      payload.password = formData.password;
    }

    setSubmitting(true);
    try {
      await onSave(payload);
      setDirty(false);
      onClose?.();
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        (err?.response?.data ? JSON.stringify(err.response.data) : err?.message) ||
        "Erro ao salvar usuário";
      setServerError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={open} fullWidth maxWidth="sm" onClose={handleClose}>
        <DialogContent sx={{ pt: 3, pb: 1 }}>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" component="div">
              {isEditing ? "Editar Usuário" : "Criar Usuário"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {isEditing ? "Atualize os dados do usuário" : "Preencha os dados para criar um novo usuário"}
            </Typography>
          </Stack>

          <Divider />

          <Box sx={{ mt: 2 }}>
            {serverError && (
              <Box sx={{ mb: 2 }}>
                <Alert severity="error">{serverError}</Alert>
              </Box>
            )}
            <Stack direction="row" spacing={3} width="100%" >
              <Stack direction="column" spacing={2} flex={2}>
                <InputField 
                  required 
                  label="Usuário" 
                  value={formData.username}
                  sx={{ width: 'inherit', mb: 2 }} 
                  onChange={(e) => setField("username", e.target.value)}
                  error={!!errors.username} 
                  errorText={errors.username}
                />

                <InputField 
                  required 
                  label="Email" 
                  value={formData.email} 
                  sx={{ width: 'inherit', mb: 2 }} 
                  onChange={(e) => setField("email", e.target.value)}
                  error={!!errors.email} 
                  errorText={errors.email}
                />

                <InputField 
                  required 
                  label="CPF" 
                  value={formData.cpf} 
                  sx={{ width: 'inherit', mb: 2 }} 
                  onChange={(e) => setField("cpf", e.target.value)}
                  error={!!errors.cpf} 
                  errorText={errors.cpf}
                />

                {!isEditing && (
                  <>
                    <InputField 
                      required 
                      label="Senha"
                      type="password"
                      value={formData.password} 
                      sx={{ width: 'inherit', mb: 2 }} 
                      onChange={(e) => setField("password", e.target.value)}
                      error={!!errors.password} 
                      errorText={errors.password}
                    />

                    <InputField 
                      required 
                      label="Confirmar senha"
                      type="password"
                      value={formData.confirm_password} 
                      sx={{ width: 'inherit', mb: 2 }} 
                      onChange={(e) => setField("confirm_password", e.target.value)}
                      error={!!errors.confirm_password} 
                      errorText={errors.confirm_password}
                    />
                  </>
                )}
              </Stack>

              <Stack direction="column" spacing={2} flex={1}>
                <InputField 
                  required
                  label="CEP"
                  value={formData.zip_code}
                  sx={{ width: 'inherit', mb: 2 }}
                  onChange={(e) => setField("zip_code", e.target.value)}
                  error={!!errors.zip_code}
                  errorText={errors.zip_code}
                />

                <InputField
                  label="Nível"
                  select
                  value={formData.access_level}
                  sx={{ width: 'inherit', mb: 1 }}
                  onChange={(e) => setField("access_level", e.target.value)}
                >
                  <MenuItem value="M">Gerente (M)</MenuItem>
                  <MenuItem value="A">Admin (A)</MenuItem>
                </InputField>

                {formData.access_level === 'M' && (
                  <InputField
                    label="ID do Ecoponto"
                    sx={{ width: 'inherit' }}
                    type="number"
                    value={formData.recycling_point_id}
                    onChange={(e) => setField("recycling_point_id", e.target.value)}
                  />
                )}
              </Stack>
            </Stack>

          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button variant="recicashSoftOutlined" onClick={handleClose} disabled={submitting}>
            Cancelar
          </Button>

          <Button 
            variant={submitting || hasErrors ? "recicashSoftOutlined" : "recicashOutlined"} 
            onClick={handleSave} disabled={submitting || hasErrors} sx={{ width: 120 }}
          >
            {submitting ? "Salvando..." : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirmClose}
        title="Descartar alterações?"
        description="As alterações não salvas serão perdidas."
        confirmLabel="Fechar"
        confirmColor="error"
        onCancel={() => setConfirmClose(false)}
        onConfirm={confirmCloseDialog}
      />
    </>
  );
}

export default UserFormDialog;