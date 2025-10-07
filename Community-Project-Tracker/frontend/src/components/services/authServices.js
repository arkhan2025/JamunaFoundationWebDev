import api from "./api";

export const register = (payload) => api.post("/users/register", payload);
export const login = (payload) => api.post("/users/login", payload);
export const getMe = () => api.get("/users/me");
