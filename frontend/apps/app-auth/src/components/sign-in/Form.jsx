import React, { useState } from 'react';
import { Stack, Alert } from '@mui/material'
import InputField from '@shared/ui/InputField'
import SendFormButton from '@shared/ui/SendFormButton'

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
        const response = await fetch(`http://api.docker.localhost/api/v1/token/`, {
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

        const data = await response.json();
        if (response.ok) {
            

            console.log('Login feito com sucesso :)');

            // SALVA O ID DO USUÁRIO PARA USAR DEPOIS NA CARTEIRA E HISTÓRICO
            if (data.user_id) {
                localStorage.setItem('user_id', data.user_id);
                // Opcional: Salvar o nome para mostrar "Olá, Fulano" depois
                if (data.first_name) localStorage.setItem('user_name', data.first_name);
                
                console.log("ID SALVO COM SUCESSO:", data.user_id);
            } else {
                console.warn("Atenção: user_id não encontrado na resposta:", data);
            }


            setSuccess(true);
            setFormData({ email: '', password: '' });
            setFormError({ email: '', password: '' });
            // window.location.href = '/inicio';

            // Redireciona para o início
            setTimeout(() => {
                window.location.href = '/inicio'; 
            }, 1000);
        } 
        else {
            throw new Error('Credenciais inválidas');
        }

        //const data = await response.json();
        //console.log('Tokens recebidos:', data);
    }
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

export default Form;