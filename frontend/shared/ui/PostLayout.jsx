import { Box } from "@mui/material";
import TitleBlock from "@shared/ui/TitleBlock";
import TextBlock from "@shared/ui/TextBlock";
import ImageBlock from "@shared/ui/ImageBlock";

function PostLayout({ data, isEditing, onChange }) {
  const { title, text, image } = data;

  const handleChange = (field, value) => {
    onChange?.((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
        gap: "24px",
        p: 3,
        minHeight: "60vh",
        width: "100%",
        alignItems: "start",
      }}
    >
      {/* Left Column */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: "2vh" }}>
        <TitleBlock
          sx={{ minHeight: "10vh" }}
          isEditing={isEditing}
          content={title}
          onChange={(val) => handleChange("title", val)}
        />

        <TextBlock
          sx={{ flex: 1, minHeight: "58vh", mb: 2 }}
          isEditing={isEditing}
          content={text}
          onChange={(val) => handleChange("text", val)}
        />
      </Box>

      {/* Right Column */}
      <ImageBlock
        isEditing={isEditing}
        content={image}
        sx={{ width: "33vw", mb: 2 }}
        onChange={(val) => handleChange("image", val)}
      />
    </Box>
  );
}

export default PostLayout;