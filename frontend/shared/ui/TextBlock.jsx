import { Typography, TextField } from "@mui/material";
import { getDashedInputProps } from "../styles/dashedInputProps";

function TextBlock({ content, isEditing, onChange, sx }) {
  return isEditing ? (
    <TextField
      variant="standard"
      multiline
      fullWidth
      value={content}
      onChange={(e) => onChange(e.target.value)}
      InputProps={{
        ...getDashedInputProps(isEditing),
        sx: (theme) => ({
          ...theme.typography.body1,
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          ...sx
        })
      }}
    />
  ) : (
    <Typography sx={{ color: "#5E6282", lineHeight: 1.7 }}>
      {content}
    </Typography>
  );
};

export default TextBlock;