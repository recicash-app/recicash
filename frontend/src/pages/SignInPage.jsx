import InputField from '../../shared/ui/InputField'
import SendFormButton from '../../shared/ui/SendFormButton'
import GreenSpot from '../../shared/assets/shape-bottom-right.svg'
import Tree from '../../shared/assets/tree.svg'

import React, { useState, useEffect } from 'react';
import { Stack, Checkbox, Modal, Button, Divider, Box, Typography } from '@mui/material'
import { styled } from '@mui/system'

function GoogleButton() {
    useEffect(() => {
        google.accounts.id.initialize({
          client_id: 'SEU_CLIENT_ID_DO_GOOGLE', // TO-DO: console.cloud.google.com
          callback: handleCredentialResponse,
        });
    
        google.accounts.id.renderButton(
          document.getElementById('googleSignInDiv'),
          { theme: 'outline', size: 'large', width: 300 }
        );
      }, []);
    
      const handleCredentialResponse = (response) => {
        console.log("Token JWT do Google:", response.credential);
      };
    
      return <div id="googleSignInDiv"></div>;
}

function Form() {

  const [formData, setFormData] = useState({
    name: '',
    password: '',
    passwordConfirmation: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
        ...formData,
        [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    
    if (!formData.email.trim()) {
        setError('Email é obrigatório');
        return false;
    }
    if (!formData.password.trim()) {
        setError('Senha é obrigatória');
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
        const response = await fetch('http://localhost:8080/formulario-login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                email: formData.email,
                senha: formData.password
            }),
        });

        if (response.ok) {
            console.log('Formulário enviado com sucesso');
            setSuccess(true);
            setFormData({ email: '', password: '' });

            setTimeout(() => {
                 window.location.href = '/inicio';
            }, 2000);
        } 
        else {
            const data = await response.json();
            throw new Error(data.message || 'Erro ao fazer login na conta');
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
      <InputField required label="Email" name="email" type="email" value={formData.email} onChange={handleChange}/>
      <InputField required label="Senha" name="password" type="password" value={formData.password} onChange={handleChange}/> 
      <SendFormButton text="Entrar" onClick={handleSubmit}/>
    </Stack>
  );
}

function SignUpPage() {
    return(
        <Box>
            <img src={GreenSpot} alt="Green Spot" style={{ position: 'fixed', bottom: '0vw', right: '0vw', width: "47vw", transform: "scaleX(1.2)", indexZ: '-1' }} />
            <img src={Tree} alt="Tree" style={{ position: 'fixed', bottom: '0vw', right: '0vw', width: "45vw", indexZ: '-1' }} />
            <Stack spacing={8} style={{ position: 'absolute', left: '8vw', top: '20vh' }}>
                <Typography variant='h4' fontFamily='Poppins' fontWeight='bold' > Login </Typography>
                <Stack spacing={4}>
                    <Form />
                    <Divider>ou</Divider>
                    <Box style={{ display:'flex', justifyContent:'center', alignItems:'center' }}>
                        <GoogleButton />
                    </Box>
                </Stack>
            </Stack>

            

        </Box>
    )
}
  
export default SignUpPage;
  