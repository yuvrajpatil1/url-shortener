import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [email, setEmail] = useState(null);
  const [name, setName] = useState(null);

  // On mount, check localStorage for saved auth info
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedEmail = localStorage.getItem("email");
    const savedName = localStorage.getItem("name");
    if (savedToken) {
      setToken(savedToken);
      setEmail(savedEmail);
      setName(savedName);
    }
  }, []);

  const login = (token, email) => {
    setToken(token);
    setEmail(email);
    localStorage.setItem("token", token);
    localStorage.setItem("email", email);
    localStorage.setItem("name", name); // Make sure backend sends it
  };

  const logout = () => {
    setToken(null);
    setEmail(null);
    localStorage.removeItem("token");
    localStorage.removeItem("email");
  };

  return (
    <AuthContext.Provider value={{ token, email, login, logout, name }}>
      {children}
    </AuthContext.Provider>
  );
}
