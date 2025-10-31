import { useState } from "react";
import { Box, TextField, Typography } from "@mui/material";

function InputField({
  label = "Título",
  placeholder = "Digite aqui...",
  type = "text",
  required = false,
  validator,
  value,
  onChange,
  ...props
}) {
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState("");

  const handleBlur = () => {
    setTouched(true);
    validate(value);
  };

  const handleChange = (e) => {
    const val = e.target.value;
    onChange?.(e);
    if (touched) validate(val);
  };

  const validate = (val) => {
    let msg = "";
    if (required && !val.trim()) msg = "Campo obrigatório";
    else if (validator) msg = validator(val) || "";
    setError(msg);
  };

  return (
    <Box display="flex" flexDirection="column" gap={1} width="100%">
      <Typography variant="body1" sx={{ fontWeight: 500, color: "#000000" }}>
        {label}
      </Typography>
      <TextField
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        error={Boolean(error)}
        helperText={error || " "}
        fullWidth
        variant="outlined"
        {...props}
      />
    </Box>
  );
}

export default InputField;
