import api from "./axiosConfig";

export const signupApi = async ({ id, nickname, password }) => {
    return await api.post("/api/member/signup", { id, nickname, password });
  };

export const loginApi = async ({ id, password }) => {
    return await api.post("/api/member/login", { id, password });
};

export const checkIdApi = async ({ id }) => {
    return await api.get(`/api/member/check-id/${id}`);
};

export const checkNicknameApi = async ({ nickname }) => {
    return await api.get(`/api/member/check-nickname/${nickname}`);
};
