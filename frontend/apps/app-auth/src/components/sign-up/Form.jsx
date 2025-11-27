import React, { useState } from 'react';
import { Stack, Checkbox, Box, Typography, Alert } from '@mui/material'
import InputField from '@shared/ui/InputField'
import SendFormButton from '@shared/ui/SendFormButton'
import Policy from './Policy';

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

  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formError, setFormError] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    password: '',
    passwordConfirmation: '',
    cpf: '',
    zip_code: '',
    policy: ''
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.name === "policy" ? e.target.checked : e.target.value
    });
  };

  const validateForm = () => {
    let localFormError = {
      first_name: '',
      last_name: '',
      username: '',
      email: '',
      password: '',
      passwordConfirmation: '',
      cpf: '',
      zip_code: '',
      policy: ''
    };
    let hasError = false;

    if (!formData.first_name.trim()) {
      localFormError.first_name = 'Nome é obrigatório';
      hasError = true;
    }

    if (!formData.last_name.trim()) {
      localFormError.last_name = 'Sobrenome é obrigatório';
      hasError = true;
    }

    if (!formData.username.trim()) {
      localFormError.username = 'Nome de usuário é obrigatório';
      hasError = true;
    }

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
    else if (formData.password.length < 8) {
      localFormError.password = 'Senha deve ter pelo menos 8 caracteres';
      hasError = true;
    }

    if (formData.password !== formData.passwordConfirmation) {
      localFormError.passwordConfirmation = 'As senhas não coincidem';
      hasError = true;
    }

    if (!formData.cpf.trim()) {
      localFormError.cpf = 'CPF é obrigatório';
      hasError = true;
    } 
    else {
      const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
      if (!cpfRegex.test(formData.cpf)) {
        localFormError.cpf = 'CPF deve estar no formato xxx.xxx.xxx-xx';
        hasError = true;
      }
    }

    if (!formData.zip_code.trim()) {
      localFormError.zip_code = 'Código postal é obrigatório';
      hasError = true;
    } 
    else {
      const zipCodeRegex = /^\d{5}-\d{3}$/;
      if (!zipCodeRegex.test(formData.zip_code)) {
        localFormError.zip_code = 'Código postal deve estar no formato xxxxx-xxx';
        hasError = true;
      }
    }

    if (!formData.policy) {
      localFormError.policy = 'Você deve concordar com a política de privacidade';
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
      const response = await fetch(`http://api.docker.localhost/api/v1/users/`, {
        method: 'POST',
        credentials: 'include',
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
        window.location.href = '/login';
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
        <InputField required label="Nome" name="first_name" type="name" value={formData.first_name} onChange={handleChange} error={formError.first_name ? true : false} errorText={formError.first_name}/>
        <InputField required label="Sobrenome" name="last_name" type="name" value={formData.last_name} onChange={handleChange} error={formError.last_name ? true : false} errorText={formError.last_name}/>
        <InputField required label="CPF" name="cpf" type="cpf" value={formData.cpf} onChange={handleChange} error={formError.cpf ? true : false} errorText={formError.cpf}/>
        <InputField required label="Código postal" name="zip_code" type="zip_code" value={formData.zip_code} onChange={handleChange} error={formError.zip_code ? true : false} errorText={formError.zip_code}/>
        <InputField required label="Nome de usuário" name="username" type="name" value={formData.username} onChange={handleChange} error={formError.username ? true : false} errorText={formError.username}/>
        <InputField required label="Email" name="email" type="email" value={formData.email} onChange={handleChange} error={formError.email ? true : false} errorText={formError.email}/>
        <InputField required label="Senha" name="password" type="password" value={formData.password} onChange={handleChange} error={formError.password ? true : false} errorText={formError.password}/>
        <InputField required label="Repetir senha" name="passwordConfirmation" type="password" value={formData.passwordConfirmation} onChange={handleChange} error={formError.passwordConfirmation ? true : false} errorText={formError.passwordConfirmation}/>
        <Box display="flex" alignItems="center" >
          <Checkbox required name="policy" onChange={handleChange} />
          <Typography fontFamily="Poppins" fontSize="14px"> Eu concordo com a</Typography>
          <Policy />
        </Box>
        {formError.policy && <Typography color="error" fontSize="12px">{formError.policy}</Typography>}
        <SendFormButton text="Criar conta" onClick={handleSubmit}/>
        {success && <Alert severity="success">Conta criada com sucesso!</Alert>}
        <Box height="32px" />
    </Stack>
  );
  );
}

export default Form;