import { Typography, TextField } from "@mui/material";
import { getDashedInputProps } from "../styles/dashedInputProps";

function TextBlock({ content, isEditing, onChange }) {
  return isEditing ? (
    <TextField
      variant="standard"
      multiline
      fullWidth
      value={content}
      onChange={(e) => onChange(e.target.value)}
      slotProps={{
        input: {
          ...getDashedInputProps(isEditing),
          sx: (theme) => theme.typography.body1,
        }
      }}
    />
  ) : (
    <Typography sx={{ color: "#5E6282", lineHeight: 1.7 }}>
      {content}
    </Typography>
  );
};

export default TextBlock;