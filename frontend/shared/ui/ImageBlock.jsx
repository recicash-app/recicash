import { Box } from "@mui/material";
import { getDashedInputProps } from "../styles/dashedInputProps";

function ImageBlock({ content, isEditing, onChange }) {
  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) onChange(URL.createObjectURL(file));
  };

  return (
    <Box
      sx={{
        ...getDashedInputProps(isEditing).style,
        position: "relative",
				minWidth: 120,             
        minHeight: 180,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
			}}
    >
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
      {isEditing && (
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0,
            cursor: "pointer",
          }}
        />
      )}
    </Box>
  );
}

export default ImageBlock;
