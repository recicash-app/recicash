import { Typography, TextField } from "@mui/material";
import ReactMarkdown from "react-markdown";
import { getDashedInputProps } from "../styles/dashedInputProps";

function TextBlock({ content, isEditing, onChange, sx }) {
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
            ...theme.typography.body1,
            justifyContent: "flex-start",
            alignItems: "flex-start",
            ...sx,
          }),
        },
      }}
    />
  ) : (
    <Typography
      component="div"
      color="text.secondary"
      sx={{ lineHeight: 1.7, ...sx }}
    >
      <ReactMarkdown>{content}</ReactMarkdown>
    </Typography>
  );
}

export default TextBlock;