import { Box, TextField, Typography, FormControl, Select } from "@mui/material";
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

function InputField({
  label,
  name,
  type,
  value,
  onChange,
  error,
  errorText,
  select,
  children,
  ...props
}) {
  return (
    <Box display="flex" flexDirection="column" gap={"4px"}>
      <FieldLabel>{label}</FieldLabel>

      {select ? (
        <FormControl fullWidth size="small">
          <Select
            value={value}
            onChange={onChange}
            error={error}
            displayEmpty
            {...props}
          >
            {children}
          </Select>
        </FormControl>
      ) : (
        <DataField
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          error={error}
          helperText={error ? errorText : ''}
          slotProps={{ formHelperText: { sx: { ml: '12px' } }}}
          {...props}
        />
      )}
    </Box>
  );
}

export default InputField;

