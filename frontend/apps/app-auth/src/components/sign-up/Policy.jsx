import React, { useState } from 'react';
import { Modal, Button, Box, Typography } from '@mui/material'
import { styled } from '@mui/system' 

const PopUp = styled(Box)({
  backgroundColor: "#FFFFFF",
  borderRadius: "16px",
  padding: "32px",
  width: "600px",
  maxWidth: "90%",
  boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.25)",
  textAlign: "center",
  fontFamily: "Poppins, sans-serif",
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
});

const ButtonText = styled(Button)({
  boxShadow: 'none',
  textTransform: 'none',
  color: '#3A5B22',
  fontWeight: 'bold',
  fontFamily: 'Poppins',
  fontSize: '14px',
  border: 'none',

  "& .MuiTouchRipple-root": {
    display: "none",
  },

  '&:hover': {
    textDecoration: 'underline',
    backgroundColor: 'transparent',
    boxShadow: 'none',
  },

  '&:focus': {
    outline: 'none',
  },
});

function Policy() {   
  const [openPopUp, setOpenPopUp] = useState(false);

  return (
    <div>
      <ButtonText variant="text" onClick={() => setOpenPopUp(true)}>Política de Privacidade</ButtonText>
      <Modal open={openPopUp} onClose={() => setOpenPopUp(false)}>
        <PopUp>
          <Typography style={{ textAlign: 'justify' }}>
            Seu uso deste aplicativo implica na aceitação de nossa política de privacidade. 
            Coletamos dados pessoais, como nome, CPF, email e senha, para criar sua conta e fornecer nossos serviços. 
            Utilizamos cookies para melhorar sua experiência. Não compartilhamos suas informações com terceiros sem seu consentimento, exceto quando exigido por lei. 
            Você pode solicitar a exclusão de seus dados a qualquer momento. Ao continuar, você concorda com os termos desta política.
          </Typography>
        </PopUp>
      </Modal>
    </div>
  );
}

export default Policy;