import React, { useState } from 'react';
import { Stack, Alert } from '@mui/material';
import InputField from '@shared/ui/InputField';
import SendFormButton from '@shared/ui/SendFormButton';
import { login, handleRedirect } from '@shared/utils/auth';

function Form() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [formError, setFormError] = useState({ email: '', password: '' });

  const [errorMessage, setErrorMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    if (!formData.email.trim()) {
      errors.email = 'Email é obrigatório';
      isValid = false;
    } else {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!regex.test(formData.email)) {
        errors.email = 'Email inválido';
        isValid = false;
      }
    }

    if (!formData.password.trim()) {
      errors.password = 'Senha é obrigatória';
      isValid = false;
    }

    setFormError(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccess(false);

    const isValid = validateForm();
    if (!isValid) return;

    try {
      const user = await login(formData.email, formData.password);
      setSuccess(true);
      setFormData({ email: '', password: '' });
      setFormError({ email: '', password: '' });
      handleRedirect(user.access_level);
    } catch (err) {
      setErrorMessage(err.message || 'Erro inesperado.');
    }
  };

  return (
    <Stack spacing={3}>
      <InputField required label="Email" name="email" type="email" value={formData.email} onChange={handleChange} error={formError.email ? true : false} errorText={formError.email}/>
      <InputField required label="Senha" name="password" type="password" value={formData.password} onChange={handleChange} error={formError.password ? true : false} errorText={formError.password}/> 
      <SendFormButton text="Entrar" onClick={handleSubmit}/>
      {success && <Alert severity="success">Login realizado com sucesso!</Alert>}
      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
    </Stack>
  );
}

export default Form;