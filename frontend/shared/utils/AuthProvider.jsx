import { createContext, useContext, useEffect, useState } from "react";
import { getAuthUser } from "./auth";
import { AUTH_URL } from "./constants";

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
    window.location.href = `${AUTH_URL}/login`;
  }

  function signUpRedirect() {
    window.location.href = `${AUTH_URL}/cadastro`;
  }

  function signOutRedirect() {
    window.location.href = `${AUTH_URL}/logout`;
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
