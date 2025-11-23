import { Box, TextField, Typography } from "@mui/material";
import { styled } from "@mui/system";

const DataField = styled(TextField)({
  width: "404px", 
  height: "32px",
  borderRadius: "10px",
  border: "1px solid #D9D9D9",
  '& .MuiInputBase-root': {
        height: '32px',
        borderRadius: '10px',
  },

  '& .MuiOutlinedInput-notchedOutline': {
      border: 'none',
  },
});

const FieldLabel = styled(Typography)({
  fontSize: "14px",
  fontWeight: "bold",
  fontFamily: "Poppins"
});

function InputField({ label, name, type, value, onChange, error, errorText, ...props }) {
  return (
    <Box display="flex" flexDirection="column" gap={"4px"}>
      <FieldLabel>{label}</FieldLabel>
      <DataField
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        error={error}
        helperText={error ? errorText : ''}
        {...props}
      />
    </Box>
  );
}

export default InputField;

