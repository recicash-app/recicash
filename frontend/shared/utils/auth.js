import api from "./api";
import { ADMIN_URL, ECOPONTO_URL, WEB_URL, LANDING_PAGE_URL } from "./constants";

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
    window.location.href = ADMIN_URL;
  } else if (role === 'U') {
    window.location.href = WEB_URL;
  } else if (role === 'M') {
    window.location.href = ECOPONTO_URL;
  } else {
    window.location.href = LANDING_PAGE_URL;
  }
}