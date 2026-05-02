// src/contexts/UserContext.jsx
import React, { createContext, useContext, useState } from "react";

const UserContext = createContext();

export function UserProvider({ children }) {
  // 🔑 Charger le user depuis localStorage au démarrage
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    if (!savedUser) return null;
    const parsed = JSON.parse(savedUser);
    // Si l'ancienne structure { token, user: {...} } est détectée, on la corrige
    if (parsed?.user && parsed?.token) {
      localStorage.setItem("user", JSON.stringify(parsed.user));
      return parsed.user;
    }
    return parsed;
  });

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const updateUser = (userData) => {
    const updated = { ...user, ...userData };
    setUser(updated);
    localStorage.setItem("user", JSON.stringify(updated));
  };

  return (
    <UserContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
