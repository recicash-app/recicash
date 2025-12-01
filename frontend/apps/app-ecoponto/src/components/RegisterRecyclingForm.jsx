import { Box, Button } from "@mui/material";
import { ArrowForward } from "@mui/icons-material";
import PillInput from "@shared/ui/PillInput";

function RegisterRecyclingForm({ form, loading, ecopontos, handleChange, handleSubmit }) {
  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>

      {/* Recycling Center Select */}
      <PillInput
        select
        name="recycling_point_id"
        value={form.recycling_point_id}
        onChange={handleChange}
      >
        <option value="">Selecione o Ecoponto</option>
        {!loading && ecopontos.length > 0 ? (
          ecopontos.map((ep) => (
            <option key={ep.recycling_point_id} value={ep.recycling_point_id}>
              {ep.name} - {ep.cnpj}
            </option>
          ))
        ) : (
          <option disabled>Carregando...</option>
        )}
      </PillInput>

      {/* Weight Input */}
      <PillInput
        placeholder="Peso (kg)"
        name="weight"
        type="number"
        step="0.01"
        value={form.weight}
        onChange={handleChange}
      />

      {/* Button */}
      <Button 
        variant="recicashPrimary"
        endIcon={<ArrowForward />}
        sx={{ height: '2.5rem' }}

      >
        Registrar Reciclagem
      </Button>
    </Box>
  );
}

export default RegisterRecyclingForm;
