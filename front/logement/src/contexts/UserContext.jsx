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
    localStorage.setItem("user", JSON.stringify(userData)); // sauvegarde
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user"); // suppression
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
