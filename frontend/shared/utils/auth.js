import api from "./api";

export async function getAuthUser() {
  const response = await api.get("/users/me/");
  return response;
} 

export async function getCSRFToken() {
  await api.get("/token/csrf/");
}

export async function login(email, password) {
  await getCSRFToken();
  const response = await api.post(
    "/token/",
    { email, password },
  );

  return response.data;
}

export async function register(userData) {
  await getCSRFToken();
  const response = await api.post(
    "/users/",
    userData,
  );

  return response.data;
}

export async function logout() {
  await getCSRFToken();
  const response = await api.post(
    "/token/logout/",
    {},
  );

  return response.data;
}


export function handleRedirect(role) {
  if (role === 'A') {
    window.location.href = 'http://admin.docker.localhost';
  } else if (role === 'U') {
    window.location.href = 'http://web.docker.localhost';
  } else if (role === 'M') {
    window.location.href = 'http://ecoponto.docker.localhost';
  } else {
    window.location.href = 'http://web.docker.localhost';
  }
}