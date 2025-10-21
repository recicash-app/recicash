import { useState } from "react";
import { Box, IconButton } from "@mui/material";
import { Upload, Delete, Link as LinkIcon } from "@mui/icons-material";
import { getDashedInputProps } from "../styles/dashedInputProps";

function ImageBlock({ content, isEditing, onChange }) {
  const [linkValue, setLinkValue] = useState("");

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) onChange(URL.createObjectURL(file));
  };

  const handleLinkSubmit = () => {
    if (linkValue) {
      onChange(linkValue);
      setLinkValue("");
    }
  };

  const handleDelete = () => {
    onChange("");
  };

  return (
    <Box
      sx={{
        ...getDashedInputProps(isEditing).style,
        padding: 0,
        position: "relative",
				minWidth: 120,             
        minHeight: 180,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
			}}
    >
      {/* IMAGE */}
      {content ? (
        <img
          src={content}
          alt="block"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
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
          <IconButton size="small" sx={{ color: 'text.primary' }}>
            <LinkIcon fontSize="small" />
          </IconButton>
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