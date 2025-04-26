import api from "./axiosConfig";

export const signupApi = async ({ id, nickname, password }) => {
    const response = await api.post("/api/member/signup", {
      id,
      nickname,
      password,
    });
    return response.data;
  };