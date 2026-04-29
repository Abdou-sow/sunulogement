import React, { createContext, useState, useContext, useEffect } from 'react';
import { getLogements } from '../services/logements';

const AnnoncesContext = createContext();

export function useAnnonces() {
  return useContext(AnnoncesContext);
}

export function AnnoncesProvider({ children }) {

  const [annonces, setAnnonces] = useState([])
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getLogements();
        setAnnonces(data.filter((l) => l.etat === "disponible"));
      } catch (error) {
        console.error("Erreur de chargement :", error);
      }
    };
    fetchData();
  }, []);

  const addAnnonce = (annonce) => {
    setAnnonces((prev) => [...prev, annonce]);
  };

  const getAnnonceById = (id) => {
    return annonces.find((a) => String(a._id) === String(id));
  };

  return (
    <AnnoncesContext.Provider value={{ annonces, addAnnonce, getAnnonceById }}>
      {children}
    </AnnoncesContext.Provider>
  );
}
