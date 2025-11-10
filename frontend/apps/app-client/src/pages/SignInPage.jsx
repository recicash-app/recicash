import InputField from '../../../../shared/ui/InputField'
import SendFormButton from '../../../../shared/ui/SendFormButton'
import GreenSpot from '../../../../shared/assets/shape-bottom-right.svg'
import Tree from '../../../../shared/assets/tree.svg'

import React, { useState } from 'react';
import { Stack, Button, Divider, Box, Typography, Alert } from '@mui/material'
import { styled } from '@mui/system'

function SignUpOption() { 

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
            boxShadow: 'none',
        },

        '&:focus': {
            outline: 'none',
        },
    });

    const handleClick = () => {
        console.log("Redirecionando para a página de cadastro");
        window.location.href = '/cadastro';
    };

    return(
        <ButtonText variant='text' onClick={handleClick}>
            Cadastrar-se
        </ButtonText>
    )
}

function Form() {

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formError, setFormError] = useState({
    email: '',
    password: '',
  })

  const handleChange = (e) => {
    setFormData({
        ...formData,
        [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    let localFormError = { email: '', password: '' };
    let hasError = false;

    if (!formData.email.trim()) {
        localFormError.email = 'Email é obrigatório';
        hasError = true;
    } 
    else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            localFormError.email = 'Email inválido';
            hasError = true;
        }
    }

    if (!formData.password.trim()) {
        localFormError.password = 'Senha é obrigatória';
        hasError = true;
    }

    setFormError(localFormError);
    setError(hasError);
  };

  const handleSubmit = async (e) => { 
    e.preventDefault();
    setError(false);
    setSuccess(false);
    validateForm();
    if (error) return;
    
    try {
        const response = await fetch(`http://api.docker.localhost:${import.meta.env.VITE_HTTP_PORT}/api/v1/token/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                email: formData.email,
                password: formData.password
            }),
        });

        if (response.ok) {
            console.log('Login feito com sucesso :)');
            setSuccess(true);
            setFormData({ email: '', password: '' });
            setFormError({ email: '', password: '' });
            // window.location.href = '/inicio';
        } 
        else {
            throw new Error('Credenciais inválidas');
        }

        const data = await response.json();
        //console.log('Tokens recebidos:', data);
    } 
    
    catch (error) {
        console.error('Erro:', error.message);
        setError(error.message || 'Erro de conexão. Tente novamente.');
    } 

  };    


  return (
    <Stack spacing={3}>
      <InputField required label="Email" name="email" type="email" value={formData.email} onChange={handleChange} error={formError.email ? true : false} errorText={formError.email}/>
      <InputField required label="Senha" name="password" type="password" value={formData.password} onChange={handleChange} error={formError.password ? true : false} errorText={formError.password}/> 
      <SendFormButton text="Entrar" onClick={handleSubmit}/>
      {success && <Alert severity="success">Login realizado com sucesso!</Alert>}
    </Stack>
  );
}

function SignInPage() {
    return(
        <Box>
            <img src={GreenSpot} alt="Green Spot" style={{ position: 'fixed', bottom: '0vw', right: '0vw', width: "47vw", transform: "scaleX(1.2)", indexZ: '-1' }} />
            <img src={Tree} alt="Tree" style={{ position: 'fixed', bottom: '0vw', right: '0vw', width: "45vw", indexZ: '-1' }} />
            <Stack spacing={8} style={{ position: 'absolute', left: '8vw', top: '25vh' }}>
                <Typography variant='h4' fontFamily='Poppins' fontWeight='bold' > Login </Typography>
                <Stack spacing={4}>
                    <Form />
                    <Divider>ou</Divider>
                    <Stack spacing={4} style={{ alignItems:'center' }}>
                        <Box display="flex" alignItems="center">
                            <Typography fontFamily="Poppins" fontSize="14px"> Não tem conta?</Typography>
                            <SignUpOption />
                        </Box>
                    </Stack>
                </Stack>
            </Stack>

            

        </Box>
    )
}
  
export default SignInPage;
  