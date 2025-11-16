import { Box, IconButton } from "@mui/material";
import { Upload, Delete } from "@mui/icons-material";
import { getDashedInputProps } from "../styles/dashedInputProps";

function ImageBlock({ content, isEditing, onChange, sx }) {
  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      onChange({ file, preview: URL.createObjectURL(file) });
    }
  };

  const handleDelete = () => {
    onChange(null);
  };

  return (
    <Box
      sx={{
        ...getDashedInputProps(isEditing).style,
        padding: 0,
        position: "relative",
        minWidth: 0,
        minHeight: "70vh",
        height: "auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        boxSizing: "border-box",
        ...sx
      }}
    >
      {/* IMAGE */}
      {content ? (
        // wrapper preserves outer Box height/spacing while image can scale within limits
        <Box sx={{ width: "100%", boxSizing: "border-box" }}>
          <img
            src={content?.preview || content}
            alt=""
            style={{
              display: "block",
              width: "100%",
              height: "auto",                 // keep aspect ratio, do not force 100%
              maxHeight: "70vh",              // prevent image from overflowing the viewport
              objectFit: "contain",
              margin: 0,
            }}
          />
        </Box>
       ) : isEditing && (
         <Box sx={{ textAlign: "center", px: 2 }}>
           Nenhuma imagem
         </Box>
       )}

      {/* TOOLBAR */}
      {isEditing && (
        <Box
          sx={{
            position: "absolute",
            top: 8, right: 8,
            display: "flex",
            gap: 1, p: 0.5,
          }}
        >
          <IconButton component="label" size="small" sx={{ color: 'text.primary' }}>
            <Upload fontSize="small" />
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleUpload}
            />
          </IconButton>
          <IconButton size="small" onClick={handleDelete} sx={{ color: 'text.primary' }}>
            <Delete fontSize="small" />
          </IconButton>
        </Box>
      )}
    </Box>
  );
}

export default ImageBlock;