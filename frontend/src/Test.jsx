import { useState } from "react";
import { LoremIpsum } from 'react-lorem-ipsum';
import { Box, Button, IconButton, Tooltip, Typography } from "@mui/material";
import { Edit, Save } from "@mui/icons-material";

import LeafBox from '../libs/ui/LeafBox';
import CardBox from '../libs/ui/CardBox';
import TitleBlock from "../libs/ui/TitleBlock";
import TextBlock from "../libs/ui/TextBlock";
import ImageBlock from "../libs/ui/ImageBlock";

function EditableContainer({ blocks }) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(blocks);

  const handleChange = (index, newValue) => {
    const updated = [...content];
    updated[index].content = newValue;
    setContent(updated);
  };

  return (
    <Box sx={{ p: 2, position: "relative" }} >
      {/* Toolbar */}
      <Box
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
        }}
      >
        <Tooltip title={isEditing ? "Salvar" : "Editar"} >
          <IconButton
            size="small"
            onClick={() => setIsEditing((prev) => !prev)}
            color={isEditing ? "success" : "primary"}
          >
            {isEditing ? <Save fontSize="small" /> : <Edit fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Box>

      EDITOR ESPECIAL

      {/* Renderiza blocos dinamicamente */}
      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
        <Box sx={{ width: '60%', display: 'flex', flexDirection: 'column', gap: 1 }}>
          <TitleBlock
            content={blocks[0].content}
            isEditing={isEditing}
            onChange={((val) => handleChange(0, val))}
          />
          <TextBlock
            content={blocks[2].content}
            isEditing={isEditing}
            onChange={((val) => handleChange(2, val))}
          />
        </Box>
        <ImageBlock
          sx={{ width: '45%' }}
          content={blocks[1].content}
          isEditing={isEditing}
          onChange={((val) => handleChange(1, val))}
        />
      </Box>
    </Box>
  );
}

function TestBasic() {
  const articleBlocks = [
    { type: "title", content: "Do Lixo ao Luxo: Materiais Reciclados que Viraram Tendência" },
    { type: "image", content: "/assets/recycle-bin.jpg" },
    { type: "text", content: "O papel é um dos materiais mais fáceis de reciclar..." },
  ];

  return (
    <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* TÍTULOS */}
      <Box>
        <Typography variant="h2" sx={{ p: 1, maxWidth: '756px' }}>
          Recicash: Descarte consciente que gera benefícios!
        </Typography>
        <Typography variant="h3" sx={{ p: 1, maxWidth: '756px' }}>
          Recicash: Descarte consciente que gera benefícios!
        </Typography>
        <Typography variant="h4" sx={{ p: 1, maxWidth: '756px' }}>
          Recicash: Descarte consciente que gera benefícios!
        </Typography>
        <Typography variant="h5" sx={{ p: 1, maxWidth: '756px' }}>
          Recicash: Descarte consciente que gera benefícios!
        </Typography>
        <Typography variant="h6" sx={{ p: 1, maxWidth: '756px' }}>
          Recicash: Descarte consciente que gera benefícios!
        </Typography>
      </Box>

      {/* TEXTO */}
      <Box>
        <Typography variant="body1" component="div" sx={{ textWrap: 'wrap' }}>
          <LoremIpsum p={1} />
        </Typography>

        <Typography variant="body2" component="div" sx={{ textWrap: 'wrap' }}>
          <LoremIpsum p={1} />
        </Typography>
      </Box>

      {/* BOTÕES */}
      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
        <Button variant="recicashPrimary">Primário</Button>
        <Button variant="recicashSecondary">Secundário</Button>
        <Button variant="recicashCTA" sx={{ boxShadow: 1 }}>
          CTA com sombra
        </Button>
        <Button variant="recicashCTA" sx={{ boxShadow: 2 }}>
          CTA com glow dourado
        </Button>
        <Button variant="recicashOutlined">Oco Escuro</Button>
      </Box>

      {/* CONTAINERS */}
      <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}} >
        <CardBox />
        <LeafBox sx={{ width: '75%' }}>
            <LoremIpsum p={2} />
        </LeafBox>
      </Box>

      {/* EDITOR */}
      <Box>
        <EditableContainer blocks={articleBlocks} />
      </Box>
    </Box>
  );
}

export default TestBasic;
