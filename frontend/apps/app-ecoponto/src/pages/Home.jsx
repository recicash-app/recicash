import { useEffect, useState } from 'react';
import { Box, Typography, Grid } from '@mui/material';

import LeafBox from '@shared/ui/LeafBox';
import { useAuth } from '@shared/utils/AuthProvider';
import { fetchEcopontos, createDisposalRecord } from '../utils/recyclingApi';

import RegisterRecyclingForm from '../components/RegisterRecyclingForm';
import AppSnackbar from '@shared/ui/AppSnackbar';

function Home() {
  const { user } = useAuth();

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

      setSnackbar({ open: true, message: `Registro criado! Hash: ${res.validation_hash}`, severity: "success" });
      setForm({ recycling_point_id: "", weight: "" });
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "Erro ao registrar reciclagem.", severity: "error" });
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
          </Grid>
        </Grid>
      </LeafBox>

      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleSnackbarClose}
      />
    </Box>
  );
}

export default Home;
