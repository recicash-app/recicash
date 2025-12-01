/**
 * Simple error handling system for forms
 * Focuses only on the essentials: translating backend errors to Portuguese
 */

/**
 * Translates backend error messages to Portuguese
 */
const ERROR_TRANSLATIONS = {
  // Required field errors
  'This field is required.': 'Este campo é obrigatório',
  'This field may not be blank.': 'Este campo não pode estar vazio',
  
  // Email errors
  'Enter a valid email address.': 'Digite um email válido',
  'user with this email already exists.': 'Este email já está em uso',
  'A user with that email already exists.': 'Este email já está em uso',
  
  // username
  'A user with that username already exists.': 'Este nome de usuário já está em uso',
  'user with this username already exists.': 'Este nome de usuário já está em uso',
  
  // password
  'Password must have at least 8 characters.': 'A senha deve ter pelo menos 8 caracteres',
  'Password must contains at least one number': 'A senha deve conter pelo menos um número',
  'Password must have at least one capitalized letter': 'A senha deve ter pelo menos uma letra maiúscula',
  
  // CPF 
  'Invalid CPF. The format required is XXX.XXX.XXX-XX.': 'CPF inválido. Use o formato xxx.xxx.xxx-xx',
  'user with this cpf already exists.': 'Este CPF já está em uso',
  'A user with that cpf already exists.': 'Este CPF já está em uso',
  
  'Invalid credentials.': 'Email ou senha incorretos'
};


export function translateError(message) {
  if (!message) return 'Erro desconhecido';
  
  if (ERROR_TRANSLATIONS[message]) {
    return ERROR_TRANSLATIONS[message];
  }
  
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('already exists')) {
    return 'Este valor já está sendo usado';
  }
  
  if (lowerMessage.includes('invalid')) {
    return 'Valor inválido';
  }
  
  if (lowerMessage.includes('required')) {
    return 'Campo obrigatório';
  }
  
  return message;
}

/**
 * Processes backend errors and returns object with errors by field
 */
export function processBackendErrors(error) {
  const fieldErrors = {};
  let generalError = null;
  
  try {
    if (error.response && error.response.data) {
      const data = error.response.data;
      
      if (typeof data === 'object' && !Array.isArray(data)) {
        Object.keys(data).forEach(field => {
          const fieldError = data[field];
          
          if (field === 'non_field_errors' || field === 'detail') {
            if (Array.isArray(fieldError)) {
              const translatedErrors = fieldError.map(err => translateError(err));
              generalError = translatedErrors.join('. ');
            } else {
              generalError = translateError(fieldError);
            }
          } else {
            if (Array.isArray(fieldError)) {
              const translatedErrors = fieldError.map(err => translateError(err));
              fieldErrors[field] = translatedErrors.join('. ');
            } else {
              fieldErrors[field] = translateError(fieldError);
            }
          }
        });
      } else {
        const message = Array.isArray(data) ? data[0] : data.message || data;
        generalError = translateError(message);
      }
    } else {
      generalError = 'Erro de conexão. Verifique sua internet e tente novamente';
    }
  } catch (e) {
    generalError = 'Erro inesperado. Tente novamente mais tarde';
  }
  
  return { fieldErrors, generalError };
}