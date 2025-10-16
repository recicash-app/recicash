import { useState } from "react";
import { LoremIpsum } from 'react-lorem-ipsum';
import { Box, Button, IconButton, Tooltip, Typography } from "@mui/material";
import { Edit, Save } from "@mui/icons-material";

import shape1 from "@shared/assets/shape-top-left.svg";
import shape2 from "@shared/assets/shape-top-right.svg";
import shape3 from "@shared/assets/shape-bottom-right.svg";
import shape4 from "@shared/assets/pattern-plus-green-white.svg";

import LeafBox from '@shared/ui/LeafBox';
import CardBox from '@shared/ui/CardBox';
import TitleBlock from "@shared/ui/TitleBlock";
import TextBlock from "@shared/ui/TextBlock";
import ImageBlock from "@shared/ui/ImageBlock";
import FullScreenOverlay from "@shared/ui/FullScreenOverlay";

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

function TestBasis() {
  const [overlayOpen, setOverlayOpen] = useState(false);

  const articleBlocks = [
    { type: "title", content: "Do Lixo ao Luxo: Materiais Reciclados que Viraram Tendência" },
    { type: "image" },
    { type: "text", content: "O papel é um dos materiais mais fáceis de reciclar..." },
  ];

  return (
    <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* TITLES */}
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

      {/* BODY */}
      <Box>
        <Typography variant="body1" component="div" sx={{ textWrap: 'wrap' }}>
          <LoremIpsum p={1} />
        </Typography>

        <Typography variant="body2" component="div" sx={{ textWrap: 'wrap' }}>
          <LoremIpsum p={1} />
        </Typography>
      </Box>

      {/* BUTTONS */}
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
      <Box sx={{ position: "relative", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }} >        
        <CardBox />
        <CardBox focused />
        <CardBox focused onClick={() => setOverlayOpen(true)} />

        <LeafBox sx={{ gridRow: "2", gridColumn: "1" }}>
          <Box
            component="img"
            src="/icon-recycle.svg"
            alt="recycle icon"
            sx={{ width: "80%", userSelect: "none", pointerEvent: "none" }}
          />
        </LeafBox>
        <LeafBox sx={{ gridRow: "2 / 4", gridColumn: "2 / 4" }}>
            <LoremIpsum p={2} />
        </LeafBox>
      </Box>

      {/* EDITOR */}
      <Box>
        <EditableContainer blocks={articleBlocks} />
      </Box>

      {/* DECORATIONS */}
      <Box sx={{ position: "relative", height: "80vh", border: "1px solid black" }}>
        <img src={shape1} alt="" style={{ position: "absolute", top: 0, left: 0, width: "20%" }} />
        <img src={shape2} alt="" style={{ position: "absolute", top: 0, right: 0, width: "15%" }} />
        <img src={shape3} alt="" style={{ position: "absolute", bottom: 0, right: 0, width: "20%" }} />
        <img src={shape4} alt="" style={{ position: "absolute", bottom: "40%", right: "20%", width: "10%" }} />
      </Box>

      {/* OVERLAY */}
      <FullScreenOverlay open={overlayOpen} onClose={() => setOverlayOpen(false)} />
    </Box>
  );
}

export default TestBasis;
