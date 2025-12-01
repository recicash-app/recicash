import React, { useState } from 'react';
import { Stack, Checkbox, Box, Typography, Alert } from '@mui/material';
import Policy from './Policy';
import { register } from '@shared/utils/auth';
import { processBackendErrors } from '@shared/utils/errorHandler';
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

  const [formErrors, setFormErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, checked, value } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'policy' ? checked : value
    }));

    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    if (generalError) {
      setGeneralError('');
    }
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    // Validação de campos obrigatórios
    const requiredFields = [
      { field: 'first_name', label: 'Nome' },
      { field: 'last_name', label: 'Sobrenome' },
      { field: 'username', label: 'Nome de usuário' },
      { field: 'email', label: 'Email' },
      { field: 'password', label: 'Senha' },
      { field: 'cpf', label: 'CPF' },
      { field: 'zip_code', label: 'Código postal' }
    ];

    requiredFields.forEach(({ field, label }) => {
      if (!formData[field].trim()) {
        errors[field] = `${label} é obrigatório`;
        isValid = false;
      }
    });

    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.email = 'Email inválido';
        isValid = false;
      }
    }

    if (formData.password.trim()) {
      const passwordErrors = [];
      
      if (formData.password.length < 8) {
        passwordErrors.push('pelo menos 8 caracteres');
      }
      
      if (!/[A-Z]/.test(formData.password)) {
        passwordErrors.push('pelo menos uma letra maiúscula');
      }
      
      if (!/\d/.test(formData.password)) {
        passwordErrors.push('pelo menos um número');
      }
      
      if (passwordErrors.length > 0) {
        errors.password = `A senha deve ter: ${passwordErrors.join(', ')}`;
        isValid = false;
      }
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

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset states
    setGeneralError('');
    setSuccess(false);
    setIsSubmitting(true);

    const isValid = validateForm();
    if (!isValid) {
      setIsSubmitting(false);
      return;
    }

    try {
      await register({
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
      setFormErrors({});

      // Redirect after success
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);

    } catch (error) {
      const { fieldErrors, generalError: backendError } = processBackendErrors(error);
      
      if (Object.keys(fieldErrors).length > 0) {
        setFormErrors(fieldErrors);
      }
      
      if (backendError) {
        setGeneralError(backendError);
      }
      
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <Stack spacing={3}>
      <InputField required label="Nome" name="first_name"
        value={formData.first_name}
        onChange={handleChange}
        error={!!formErrors.first_name}
        errorText={formErrors.first_name}
        disabled={isSubmitting}
      />

      <InputField required label="Sobrenome" name="last_name"
        value={formData.last_name}
        onChange={handleChange}
        error={!!formErrors.last_name}
        errorText={formErrors.last_name}
        disabled={isSubmitting}
      />

      <InputField required label="CPF" name="cpf"
        value={formData.cpf}
        onChange={handleChange}
        error={!!formErrors.cpf}
        errorText={formErrors.cpf}
        disabled={isSubmitting}
      />

      <InputField required label="Código postal" name="zip_code"
        value={formData.zip_code}
        onChange={handleChange}
        error={!!formErrors.zip_code}
        errorText={formErrors.zip_code}
        disabled={isSubmitting}
      />

      <InputField required label="Nome de usuário" name="username"
        value={formData.username}
        onChange={handleChange}
        error={!!formErrors.username}
        errorText={formErrors.username}
        disabled={isSubmitting}
      />

      <InputField required label="Email" name="email" type="email"
        value={formData.email}
        onChange={handleChange}
        error={!!formErrors.email}
        errorText={formErrors.email}
        disabled={isSubmitting}
      />

      <InputField required label="Senha" name="password" type="password"
        value={formData.password}
        onChange={handleChange}
        error={!!formErrors.password}
        errorText={formErrors.password}
        disabled={isSubmitting}
      />

      <InputField required label="Repetir senha" name="passwordConfirmation" type="password"
        value={formData.passwordConfirmation}
        onChange={handleChange}
        error={!!formErrors.passwordConfirmation}
        errorText={formErrors.passwordConfirmation}
        disabled={isSubmitting}
      />

      <Box display="flex" alignItems="center">
        <Checkbox 
          name="policy" 
          checked={formData.policy} 
          onChange={handleChange}
          disabled={isSubmitting}
        />
        <Typography fontSize="14px">Eu concordo com a</Typography>
        <Policy />
      </Box>

      {formErrors.policy && (
        <Typography color="error" fontSize="12px">
          {formErrors.policy}
        </Typography>
      )}

      <SendFormButton 
        text={isSubmitting ? "Criando conta..." : "Criar conta"} 
        onClick={handleSubmit}
        disabled={isSubmitting}
      />

      {success && (
        <Alert severity="success">
          Conta criada com sucesso! Redirecionando para login...
        </Alert>
      )}

      {generalError && (
        <Alert severity="error">
          {generalError}
        </Alert>
      )}

      <Box height="32px" />
    </Stack>
  );
}

export default Form;