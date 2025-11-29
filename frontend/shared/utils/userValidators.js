export function validateUsername(username) {
  if (!username?.trim()) return "Usuário obrigatório";
}

export function validateEmail(email) {
  if (!email?.trim()) return "Email obrigatório";

  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) return "Email inválido";
}

export function validateCPF(cpf) {
  if (!cpf?.trim()) return;

  const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
  if (!cpfRegex.test(cpf)) return "CPF deve estar no formato xxx.xxx.xxx-xx";
}

export function validateZip(zip) {
  if (!zip?.trim()) return;

  const zipRegex = /^\d{5}-\d{3}$/;
  if (!zipRegex.test(zip)) return "Código postal deve estar no formato xxxxx-xxx";
}

export function validatePassword(password) {
  if (!password?.trim()) return "Senha é obrigatória";

  const strong = /^(?=.*[A-Z]).{8,}$/;

  if (!strong.test(password)) {
    return "Senha: mínimo 8 caracteres e 1 letra maiúscula";
  }
}

export function validateConfirmPassword(password, confirm) {
  if (password !== confirm) return "Confirmação de senha não confere";
}

export function validateUserForm(formData, { isEditing = false } = {}) {
  const e = {};

  const usernameError = validateUsername(formData.username);
  if (usernameError) e.username = usernameError;

  const emailError = validateEmail(formData.email);
  if (emailError) e.email = emailError;

  const cpfError = validateCPF(formData.cpf);
  if (cpfError) e.cpf = cpfError;

  const zipError = validateZip(formData.zip_code);
  if (zipError) e.zip_code = zipError;

  if (!isEditing) {
    const passError = validatePassword(formData.password);
    if (passError) e.password = passError;

    const confirmError = validateConfirmPassword(
      formData.password,
      formData.confirm_password
    );
    if (confirmError) e.confirm_password = confirmError;
  }

  return e;
}
