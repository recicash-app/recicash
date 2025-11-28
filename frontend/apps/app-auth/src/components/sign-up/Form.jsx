import React, { useState } from 'react';
import { Stack, Checkbox, Box, Typography, Alert } from '@mui/material';
import Policy from './Policy';
import { register } from '@shared/utils/auth';
import InputField from '@shared/ui/InputField';
import SendFormButton from '@shared/ui/SendFormButton';

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

  const [formError, setFormError] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'policy' ? checked : value
    }));
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    const requireField = (field, label) => {
      if (!formData[field].trim()) {
        errors[field] = `${label} é obrigatório`;
        isValid = false;
      }
    };

    requireField('first_name', 'Nome');
    requireField('last_name', 'Sobrenome');
    requireField('username', 'Nome de usuário');
    requireField('email', 'Email');
    requireField('password', 'Senha');
    requireField('cpf', 'CPF');
    requireField('zip_code', 'Código postal');

    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.email = 'Email inválido';
        isValid = false;
      }
    }

    if (formData.password.trim() && formData.password.length < 8 && !/[A-Z]/.test(formData.password)) {
      errors.password = 'A senha deve conter no mínimo 8 caracteres e pelo menos uma letra maiúscula';
      isValid = false;
    }

    if (formData.password !== formData.passwordConfirmation) {
      errors.passwordConfirmation = 'As senhas não coincidem';
      isValid = false;
    }

    if (formData.cpf.trim()) {
      const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
      if (!cpfRegex.test(formData.cpf)) {
        errors.cpf = 'CPF deve estar no formato xxx.xxx.xxx-xx';
        isValid = false;
      }
    }

    if (formData.zip_code.trim()) {
      const zipRegex = /^\d{5}-\d{3}$/;
      if (!zipRegex.test(formData.zip_code)) {
        errors.zip_code = 'Código postal deve estar no formato xxxxx-xxx';
        isValid = false;
      }
    }

    if (!formData.policy) {
      errors.policy = 'Você deve concordar com a política de privacidade';
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
      const response = await register({
        first_name: formData.first_name,
        last_name: formData.last_name,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        cpf: formData.cpf,
        zip_code: formData.zip_code
      });

      setSuccess(true);
      setFormData({
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

      setFormError({
        first_name: '',
        last_name: '',
        username: '',
        email: '',
        password: '',
        passwordConfirmation: '',
        cpf: '',
        zip_code: ''
      });

      // microfrontend-friendly redirect
      window.location.href = '/login';

    } catch (err) {
      setErrorMessage(
        err.message || 'Erro inesperado. Tente novamente mais tarde.'
      );
    }
  };


  return (
    <Stack spacing={3}>
      <InputField required label="Nome" name="first_name"
        value={formData.first_name}
        onChange={handleChange}
        error={!!formError.first_name}
        errorText={formError.first_name}
      />

      <InputField required label="Sobrenome" name="last_name"
        value={formData.last_name}
        onChange={handleChange}
        error={!!formError.last_name}
        errorText={formError.last_name}
      />

      <InputField required label="CPF" name="cpf"
        value={formData.cpf}
        onChange={handleChange}
        error={!!formError.cpf}
        errorText={formError.cpf}
      />

      <InputField required label="Código postal" name="zip_code"
        value={formData.zip_code}
        onChange={handleChange}
        error={!!formError.zip_code}
        errorText={formError.zip_code}
      />

      <InputField required label="Nome de usuário" name="username"
        value={formData.username}
        onChange={handleChange}
        error={!!formError.username}
        errorText={formError.username}
      />

      <InputField required label="Email" name="email" type="email"
        value={formData.email}
        onChange={handleChange}
        error={!!formError.email}
        errorText={formError.email}
      />

      <InputField required label="Senha" name="password" type="password"
        value={formData.password}
        onChange={handleChange}
        error={!!formError.password}
        errorText={formError.password}
      />

      <InputField required label="Repetir senha" name="passwordConfirmation" type="password"
        value={formData.passwordConfirmation}
        onChange={handleChange}
        error={!!formError.passwordConfirmation}
        errorText={formError.passwordConfirmation}
      />

      <Box display="flex" alignItems="center">
        <Checkbox name="policy" checked={formData.policy} onChange={handleChange} />
        <Typography fontSize="14px">Eu concordo com a</Typography>
        <Policy />
      </Box>

      {formError.policy && (
        <Typography color="error" fontSize="12px">
          {formError.policy}
        </Typography>
      )}

      <SendFormButton text="Criar conta" onClick={handleSubmit} />

      {success && <Alert severity="success">Conta criada com sucesso!</Alert>}

      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

      <Box height="32px" />
    </Stack>
  );
}

export default Form;