import api from "./api";

export const getClients = async () => {
  const res = await api.get("/clients");
  return res.data;
};

export const createClient = async (data) => {
  const res = await api.post("/clients", data);
  return res.data;
};

export const updateClient = async (id, data) => {
  const res = await api.put(`/clients/${id}`, data);
  return res.data;
};

export const deleteClient = async (id) => {
  const res = await api.delete(`/clients/${id}`);
  return res.data;
};
