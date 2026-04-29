import api from "./api";

export const getRegistres = async () => {
  const res = await api.get("/registres");
  return res.data;
};

export const saveRegistre = async (data) => {
  const res = await api.post("/registres", data);
  return res.data;
};

export const deleteRegistre = async (moisNum, annee) => {
  const res = await api.delete(`/registres/${moisNum}/${annee}`);
  return res.data;
};
