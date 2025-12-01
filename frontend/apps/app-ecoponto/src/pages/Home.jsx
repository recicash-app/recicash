import { useEffect, useState } from 'react';
import { Box, Typography, Grid } from '@mui/material';

import LeafBox from '@shared/ui/LeafBox';
import { useAuth } from '@shared/utils/AuthProvider';
import { fetchEcopontos, createDisposalRecord, fetchLastDisposalRecord } from '../utils/disposalApi';

import RegisterRecyclingForm from '../components/RegisterRecyclingForm';
import ValidationHashModal from '../components/ValidationHashModal';
import AppSnackbar from '@shared/ui/AppSnackbar';

function Home() {
  const { user } = useAuth();

  const [validationHash, setValidationHash] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [ecopontos, setEcopontos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    recycling_point_id: "",
    weight: "",
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    async function load() {
      try {
        const list = await fetchEcopontos(user?.user_id);
        setEcopontos(list);
      } catch (e) {
        console.error(e);
        setSnackbar({ open: true, message: "Erro ao carregar ecopontos.", severity: "error" });
      } finally {
        setLoading(false);
      }
    }
    if (user) load();
  }, [user]);

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.recycling_point_id || !form.weight) {
      setSnackbar({ open: true, message: "Preencha todos os campos.", severity: "warning" });
      return;
    }

    try {
      const payload = {
        recycling_point_id: Number(form.recycling_point_id),
        weight: parseFloat(form.weight),
      };

      const res = await createDisposalRecord(payload);
      setValidationHash(res.validation_hash);
      setModalOpen(true);
      setSnackbar({ open: true, message: `Registro criado!`, severity: "success" });
      setForm({ recycling_point_id: "", weight: "" });
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "Erro ao registrar reciclagem.", severity: "error" });
    }
  }

  async function handleShowLastHash() {
    try {
      const res = await fetchLastDisposalRecord(user?.user_id);
      if (res?.validation_hash) {
        setValidationHash(res.validation_hash);
        setModalOpen(true);
        setSnackbar({ open: true, message: "Último hash carregado.", severity: "info" });
      } else {
        setSnackbar({ open: true, message: "Nenhum registro encontrado.", severity: "warning" });
      }
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "Erro ao buscar último registro.", severity: "error" });
    }
  }

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
      <LeafBox sx={{ mt: 4 }}>
        <Grid container spacing={4} alignItems="center" px={2}>

          <Grid item xs={12} md={6}>
            <Typography variant="h5" fontWeight={600} color="white" gutterBottom>
              Bem vindo, {user?.username}!
            </Typography>

            <Typography variant="body1" lineHeight={1.6} color="white">
              Aqui você pode registrar as reciclagens de seus clientes. <br />
              Escolha o ecoponto, preencha o peso e pronto! <br />
              O hash de validação aparecerá na tela. <br />
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" fontWeight={600} color="white" gutterBottom>
              Cadastro de Reciclagem
            </Typography>

            <RegisterRecyclingForm
              form={form}
              loading={loading}
              ecopontos={ecopontos}
              handleChange={handleChange}
              handleSubmit={handleSubmit}
            />

            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
              <Typography
                variant="body2"
                color="text.primary"
                sx={{
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  display: 'inline-block',
                }}
                onClick={handleShowLastHash}
              >
                Mostrar último registro
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </LeafBox>

      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleSnackbarClose}
      />

      <ValidationHashModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        hash={validationHash}
      />
    </Box>
  );
}

export default Home;
