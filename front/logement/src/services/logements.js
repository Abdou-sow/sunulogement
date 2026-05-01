import api from "./api";

// Obtenir tous les logements
export const getLogements = async () => {
  const res = await api.get("/logements");
  return res.data;
};

// Obtenir un logement par ID
export const getLogementById = async (id) => {
  const res = await api.get(`/logements/${id}`);
  return res.data;
};

// Créer un logement (nécessite token)
export const createLogement = async (logementData) => {
  const res = await api.post("/logements", logementData);
  return res.data;
};

// Obtenir les logements d'un proprietaire par son Id (nécessite token)
export const getLogementsByProprietaireId = async (id) => {
  const res = await api.get(`/logements/proprietaire/${id}`);
  return res.data;
};

// Supprimer un logement (nécessite token)
export const deleteLogement = async (id) => {
  const res = await api.delete(`/logements/${id}`);
  return res.data;

};// Supprimer un logement (nécessite token)
export const updateLogementById = async (id, logementData) => {
  const res = await api.put(`/logements/${id}`, logementData);
  return res.data;
};

// Créer une candidature 
export const createCandidature = async (id, candidaturetData) => {
  const res = await api.post(`/candidatures/${id}`, candidaturetData);
  return res.data;
};

// obtenir la listes des candidatures dun proprietaire par son id 
export const getCandidaturesByProprietaireId = async (id) => {
  const res = await api.get(`/candidatures/${id}`);
  return res.data;
}

// Valider une candidature
export const validerCandidature = async (candidatureId) => {
  const res = await api.put(`/candidatures/${candidatureId}/valider`);
  return res.data;
};

// Refuser une candidature
export const refuserCandidature = async (candidatureId) => {
  const res = await api.put(`/candidatures/${candidatureId}/refuser`);
  return res.data;
};

// Supprimer une candidature
export const deleteCandidature = async (candidatureId) => {
  const res = await api.delete(`/candidatures/${candidatureId}`);
  return res.data;
};

// Ajouter un locataire (nécessite token)
export const addLocataire = async (locataire) => {
  const res = await api.post(`/locataires`, locataire);
  return res.data;
};

// Obtenir les locataires d'un proprietaire par son Id (nécessite token)
export const getLocatairesByProprietaireId = async (proprietaireId) => {
  const res = await api.get(`/locataires/${proprietaireId}`);
  return res.data;
};

// Nouvelle route : mettre à jour un locataire par ID
export const updateLocataireById = async (id, locataireData) => {
  const res = await api.put(`/locataires/${id}`, locataireData);
  return res.data;
};

export const validerPaiement = async (PayementId) => {
  const res = await api.patch(`/locataires/paiement/${PayementId}`);
  return res.data;
};

export const marquerPaiementImpaye = async (paiementId) => {
  const res = await api.patch(`/locataires/paiement/${paiementId}/impaye`);
  return res.data;
};

// Nouvelle route : créer un paiement pour un locataire
export const createPaiement = async (locataireId, paiementData) => {
  const res = await api.post(`/locataires/${locataireId}/paiement`, paiementData);
  return res.data;
};

// Nouvelle route : obtenir les paiements d'un locataire par ID
export async function updateCandidatureStatus(candidatureId, payload) {
  const res = await api.put(`/candidatures/${candidatureId}`, payload);
  return res.data;
}
// Nouvelle route : obtenir les paiements d'un locataire par ID
export const getReservationsByProprietaireId = async (proprietaireId) => {
  const res = await api.get(`/reservations/proprietaire/${proprietaireId}`);
  return res.data;
};

export const createReservationByCandidatureId = async (candidatureId, reservationData) => {
  const res = await api.post(`/reservations/${candidatureId}`, reservationData);
  return res.data;
};

export const updateReservation = async (reservationId, data) => {
  const res = await api.put(`/reservations/${reservationId}`, data);
  return res.data;
};

export const deleteReservation = async (reservationId) => {
  const res = await api.delete(`/reservations/${reservationId}`);
  return res.data;
};

// Modérateur — obtenir tous les propriétaires
export const getAllProprietaires = async () => {
  const res = await api.get("/moderateur/proprietaires");
  return res.data;
};

// Marquer automatiquement les paiements passés comme impayés
export const autoMarkUnpaid = async () => {
  const res = await api.post("/locataires/auto-mark-unpaid");
  return res.data;
};

// Supprimer un paiement
export const deletePaiement = async (paiementId) => {
  const res = await api.delete(`/locataires/paiement/${paiementId}`);
  return res.data;
};

// Vérifier le mot de passe du propriétaire
export const verifyPassword = async (password) => {
  const res = await api.post("/auth/verify-password", { password });
  return res.data;
};

// Documents client
export const uploadClientDocument = async (clientId, formData) => {
  const res = await api.post(`/clients/${clientId}/documents`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const deleteClientDocument = async (clientId, docId) => {
  const res = await api.delete(`/clients/${clientId}/documents/${docId}`);
  return res.data;
};

// Modérateur — autoriser un propriétaire
export const autoriserProprietaire = async (id) => {
  const res = await api.patch(`/moderateur/proprietaires/${id}/autoriser`);
  return res.data;
};

// Modérateur — refuser un propriétaire
export const refuserProprietaire = async (id) => {
  const res = await api.patch(`/moderateur/proprietaires/${id}/refuser`);
  return res.data;
};


