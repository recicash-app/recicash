import InputField from '../../shared/ui/InputField'
import SendFormButton from '../../shared/ui/SendFormButton'
import GreenSpot from '../../shared/assets/shape-bottom-right.svg'

import React, { useState } from 'react';
import { Stack, Checkbox, Modal, Button, Box, Typography } from '@mui/material'
import { styled } from '@mui/system'

function Policy() {
    
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

        "& .MuiTouchRipple-root": {
            display: "none",
        },

        '&:hover': {
            textDecoration: 'underline',
            backgroundColor: 'transparent',
        },
    });

    const [openPopUp, setOpenPopUp] = useState(false);
    
    const handleOpen = () => {
        setOpenPopUp(true);
    };

    const handleClose = () => {
        setOpenPopUp(false);
    }

    return (
        <div>
            <ButtonText variant="text" onClick={handleOpen}>Política de Privacidade</ButtonText>
            <Modal open={openPopUp} onClose={handleClose}>
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

function Form() {

  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    email: '',
    password: '',
    passwordConfirmation: '',
    policy: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
        ...formData,
        [e.target.name]: e.target.name === "policy" ? e.target.checked : e.target.value
    });
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
        setError('Nome é obrigatório');
        return false;
    }
    if (!formData.cpf.trim()) {
      setError('CPF é obrigatório');
      return false;
  }
    if (!formData.email.trim()) {
        setError('Email é obrigatório');
        return false;
    }
    if (!formData.password.trim()) {
        setError('Senha é obrigatória');
        return false;
    }
    if (formData.password !== formData.passwordConfirmation) {
        setError('As senhas não coincidem');
        return false;
    }
    return true;
  };

  const handleSubmit = async (e) => { 
    
    console.log("Formulário enviado");
    console.log(formData);

    /*
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!validateForm()) return;

    setLoading(true);

    
    try {
        const response = await fetch('http://localhost:8080/formulario-cadastro', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                nome: formData.name,
                cpf: formData.cpf,
                email: formData.email,
                senha: formData.password
            }),
        });

        if (response.ok) {
            console.log('Formulário enviado com sucesso');
            setSuccess(true);
            setFormData({ name: '', cpf: '', email: '', password: '', passwordConfirmation: '' });

            setTimeout(() => {
                 window.location.href = '/fazer-login';
            }, 2000);
        } 
        else {
            const data = await response.json();
            throw new Error(data.message || 'Erro ao criar conta');
        }

    } 
    
    catch (error) {
        console.error('Erro:', error);
        setError(error.message || 'Erro de conexão. Tente novamente.');
    } 
    
    finally {
        setLoading(false);
    }
  */

  };

  return (
    <Stack spacing={3}>
      <InputField required label="Nome" name="name" type="name" value={formData.name} onChange={handleChange}/>
      <InputField required label="CPF" name="cpf" type="cpf" value={formData.cpf} onChange={handleChange}/>
      <InputField required label="Email" name="email" type="email" value={formData.email} onChange={handleChange}/>
      <InputField required label="Senha" name="password" type="password" value={formData.password} onChange={handleChange}/>
      <InputField required label="Repetir senha" name="passwordConfirmation" type="password" value={formData.passwordConfirmation} onChange={handleChange}/>
      <Box display="flex" alignItems="center" >
        <Checkbox required name="policy" onChange={handleChange} />
        <Typography fontFamily="Poppins" fontSize="14px"> Eu concordo com a</Typography>
        {Policy()}
      </Box>
      <SendFormButton text="Criar conta" onClick={handleSubmit}/>
    </Stack>
  );
}

function SignUpPage() {
    return(
        <Box>
            <img src={GreenSpot} alt="Green Spot" style={{ position: 'fixed', bottom: '0vw', right: '0vw', width: "47vw", transform: "scaleX(1.2)", indexZ: '-1' }} />
            <Stack spacing={8} style={{ position: 'absolute', left: '8vw', top: '20vh' }}>
                <Typography variant='h4' fontFamily='Poppins' fontWeight='bold' > Cadastro </Typography>
                {Form()}
            </Stack>
        </Box>
    )
}
  
export default SignUpPage;
  