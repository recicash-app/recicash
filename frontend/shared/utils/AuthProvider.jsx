import { createContext, useContext, useEffect, useState } from "react";
import { getAuthUser } from "./auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const isAuth = !!user;

  async function loadUser() {
    try {
      const res = await getAuthUser();
      setUser(res.data);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUser();
  }, []);

  function signInRedirect() {
    window.location.href = `http://auth.docker.localhost/login`;
  }

  function signUpRedirect() {
    window.location.href = `http://auth.docker.localhost/cadastro`;
  }

  function signOutRedirect() {
    window.location.href = "http://auth.docker.localhost/logout";
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuth,
        loading,
        signInRedirect,
        signUpRedirect,
        signOutRedirect,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
