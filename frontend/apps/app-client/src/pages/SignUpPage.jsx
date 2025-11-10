import InputField from '../../../../shared/ui/InputField'
import SendFormButton from '../../../../shared/ui/SendFormButton'
import GreenSpot from '../../../../shared/assets/shape-bottom-right.svg'
import Cupom from '../../../../shared/assets/cupom.jpg'
import Ecoponto from '../../../../shared/assets/ecoponto.jpeg'
import Reciclagem from '../../../../shared/assets/reciclagem.jpg'

import React, { useState } from 'react';
import { Stack, Checkbox, Modal, Button, Box, Typography, Alert } from '@mui/material'
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
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    password: '',
    passwordConfirmation: '',
    cpf: '',
    zip_code: '',
    policy: false
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
        ...formData,
        [e.target.name]: e.target.name === "policy" ? e.target.checked : e.target.value
    });
  };

  const validateForm = () => {
    if (!formData.first_name.trim()) {
        setError('Nome é obrigatório');
        return false;
    }
    if (!formData.last_name.trim()) {
        setError('Sobrenome é obrigatório');
        return false;
    }
    if (!formData.username.trim()) {
        setError('Nome de usuário é obrigatório');
        return false;
    }
    if (!formData.email.trim()) {
        setError('Email é obrigatório');
        return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        setError('Email deve estar em um formato válido');
        return false;
    }
    if (!formData.password.trim()) {
        setError('Senha é obrigatória');
        return false;
    }
    if (formData.password.length < 8) {
        setError('Senha deve ter pelo menos 8 caracteres, incluindo números e letras minúsculas e maiúsculas');
        return false;
    }
    if (formData.password !== formData.passwordConfirmation) {
        setError('As senhas não coincidem');
        return false;
    }
    if (!formData.cpf.trim()) {
      setError('CPF é obrigatório');
      return false;
    }
    const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
    if (!cpfRegex.test(formData.cpf)) {
        setError('CPF deve estar no formato xxx.xxx.xxx-xx');
        return false;
    }
    if (!formData.zip_code.trim()) {
      setError('Código postal é obrigatório');
      return false;
    }
    const zipCodeRegex = /^\d{5}-\d{3}$/;
    if (!zipCodeRegex.test(formData.zip_code)) {
        setError('Código postal deve estar no formato xxxxx-xxx');
        return false;
    }
    if (formData.policy !== true) {
      setError('Você deve concordar com a política de privacidade');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => { 
    e.preventDefault();
    setError('');
    setSuccess(false);
    if (!validateForm()) return;

    try {
        const response = await fetch(`http://api.docker.localhost:${import.meta.env.VITE_HTTP_PORT}/api/v1/users/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                first_name: formData.first_name,
                last_name: formData.last_name,
                username: formData.username,
                email: formData.email,
                password: formData.password,
                cpf: formData.cpf,
                zip_code: formData.zip_code
            }),
        });

        if (response.ok) {
            console.log('Cadastro feito com sucesso :)');
            setSuccess(true);
            setFormData({ first_name: '', last_name: '', username: '', email: '', password: '', passwordConfirmation: '', cpf: '', zip_code: '', policy: false });
            // window.location.href = '/login';
        } 
        else {
            const data = await response.text();
            throw new Error(data || 'Erro ao criar conta');
        }

    } 
    
    catch (error) {
        console.error('Erro:', error);
        setError(error.message || 'Erro de conexão. Tente novamente.');
    } 

  };

  return (
    <Stack spacing={3}>
      <InputField required label="Nome" name="first_name" type="name" value={formData.first_name} onChange={handleChange}/>
      <InputField required label="Sobrenome" name="last_name" type="name" value={formData.last_name} onChange={handleChange}/>
      <InputField required label="CPF" name="cpf" type="cpf" value={formData.cpf} onChange={handleChange}/>
      <InputField required label="Código postal" name="zip_code" type="zip_code" value={formData.zip_code} onChange={handleChange}/>
      <InputField required label="Nome de usuário" name="username" type="name" value={formData.username} onChange={handleChange}/>
      <InputField required label="Email" name="email" type="email" value={formData.email} onChange={handleChange}/>
      <InputField required label="Senha" name="password" type="password" value={formData.password} onChange={handleChange}/>
      <InputField required label="Repetir senha" name="passwordConfirmation" type="password" value={formData.passwordConfirmation} onChange={handleChange}/>
      <Box display="flex" alignItems="center" >
        <Checkbox required name="policy" onChange={handleChange} />
        <Typography fontFamily="Poppins" fontSize="14px"> Eu concordo com a</Typography>
        {Policy()}
      </Box>
      <SendFormButton text="Criar conta" onClick={handleSubmit}/>
      {error && <Alert severity="error"> {error}</Alert>}
      {success && <Alert severity="success">Conta criada com sucesso!</Alert>}
      <Box height="32px" />
    </Stack>
  );
}

function Information() {

    const commonAnimation = {
        animation: "borderMorph 10s ease-in-out infinite alternate",
        boxShadow: "0px 4px 12px rgba(0,0,0,0.25)",
    };

    const borderKeyframes = `
        @keyframes borderMorph {
        0%   { border-radius: 50% 50% 50% 50%; }
        25%  { border-radius: 70% 30% 90% 40%; }
        50%  { border-radius: 85% 55% 45% 35%; }
        75%  { border-radius: 60% 40% 30% 70%; }
        100% { border-radius: 50% 50% 50% 50%; }
        }
    `;

    const floatBg = `
    @keyframes floatBg {
        0% { transform: scale(1.0); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1.0); }
      }
    `;

    function infoBox(top, left, img, text, delay, dir) {
        return (
            <Box display="flex" alignItems="center" position="absolute" top={top} left={left} zIndex={1} width="100%" height="100%">
            {dir === 1 ? (
                <>
                <img src={img} alt={text} style={{ width: '40%', height: '30%', opacity: '0.9', borderRadius: '50%', ...commonAnimation, animationDelay: delay }} />
                <Typography marginLeft={2} fontSize="1.3vw" fontWeight="bold" fontFamily="Poppins" color="#225C22" maxWidth="30vw">
                    {text}
                </Typography>
                </>
            ) : (
                <>
                <Typography marginRight={2} fontSize="1.3vw" fontWeight="bold" fontFamily="Poppins" color="#225C22" maxWidth="30vw">
                    {text}
                </Typography>
                <img src={img} alt={text} style={{ width: '40%', height: '30%', opacity: '0.9', borderRadius: '50%', ...commonAnimation, animationDelay: delay }} />
                </>
            )}
            </Box>
        );
    }

    const Eco = infoBox("-24%", "5%", Ecoponto, "Veja ecopontos próximos a você!", "0s", 1);

    const Reci = infoBox("5%", "15%", Reciclagem, "Aprenda sobre reciclagem!", "2s", 0);

    const Cup = infoBox("33%", "-5%", Cupom, "Troque pontos por cupons de desconto!", "4s", 1);

    return (
        <Box sx={{ position: 'fixed', bottom: '0vw', right: '0vw', width: '47vw', zIndex: -1, }}>
            <style>{floatBg}</style>
            <img src={GreenSpot} alt="Green Spot" style={{ width: '100%', display: 'block', position: 'relative', zIndex: 0, animation: "floatBg 10s ease-in-out infinite alternate" }} />
            <style>{borderKeyframes}</style>
            {Eco}
            {Reci}
            {Cup}
        </Box>
    );
}

function SignUpPage() {
    return(
        <Box>
            <Information style={{ zIndex: '-1' }}/>
            <Stack spacing={8} style={{ position: 'absolute', left: '8vw', top: '20vh' }}>
                <Typography variant='h4' fontFamily='Poppins' fontWeight='bold' > Cadastro </Typography>
                {Form()}
            </Stack>
        </Box>
    )
}
  
export default SignUpPage;
  