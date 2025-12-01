import { useState } from 'react';
import { Dialog, Box, Typography, IconButton, Tooltip } from '@mui/material';
import { ContentCopy, Share } from '@mui/icons-material';

import Logo from '@shared/atoms/Logo';

function ValidationHashModal({ open, onClose, hash }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {  
    try {  
      await navigator.clipboard.writeText(hash);  
      setCopied(true);  
      setTimeout(() => setCopied(false), 1500);  
    } catch (err) {  
      alert('Falha ao copiar para a área de transferência. Verifique as permissões do navegador.');  
    }  
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Recicash - Hash de Validação',
        text: `Confira o hash de validação da sua reciclagem: ${hash}`,
      });
    } else {
      alert('Compartilhamento não suportado neste navegador.');
    }
  };

  if (!hash) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      slotProps={{ paper: {
        sx: {
          p: 3,
          borderRadius: 2,
          minWidth: 300,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        },
      }}}
    >
      <Logo sx={{ height: 50 }} />
      <Typography variant="h6">Hash de Validação</Typography>
      <Typography
        sx={{
          fontFamily: 'monospace',
          wordBreak: 'break-all',
          textAlign: 'center',
        }}
      >
        {hash}
      </Typography>
      <Box display="flex" gap={1}>
        <Tooltip title={copied ? 'Copiado!' : 'Copiar'}>
          <IconButton onClick={handleCopy}>
            <ContentCopy />
          </IconButton>
        </Tooltip>
        <Tooltip title="Compartilhar">
          <IconButton onClick={handleShare}>
            <Share />
          </IconButton>
        </Tooltip>
      </Box>
    </Dialog>
  );
}

export default ValidationHashModal;