import api from "./api";

export const register = async (userData) => {
  const res = await api.post("/auth/register", userData);
  return res.data.user;
};

export const updateProfile = async (data) => {
  const res = await api.put("/auth/update-profile", data);
  return res.data.user;
};

export const login = async (userData) => {
  const res = await api.post("/auth/login", userData);
  if (res.data.token) localStorage.setItem("token", res.data.token);
  return res.data.user;
};


export const logout = () => {
  localStorage.removeItem("token");
};

export const forgotPassword = async (email) => {
  const res = await api.post("/auth/forgot-password", { email });
  return res.data;
};

export const resetPassword = async (token, password) => {
  const res = await api.post(`/auth/reset-password/${token}`, { password });
  return res.data;
};
