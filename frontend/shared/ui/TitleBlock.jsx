import { Typography, TextField } from "@mui/material";
import { getDashedInputProps } from "../styles/dashedInputProps";

function TitleBlock({ content, isEditing, onChange, sx }) {  
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
          sx: (theme) => ({
            ...theme.typography.h4,
            color: theme.palette.text.hint,
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            ...sx
          })
        }
      }}
    />
  ) : (
    <Typography variant="h4" sx={{ color: theme => theme.palette.text.hint }}>
      {content}
    </Typography>
  );
};

export default TitleBlock;