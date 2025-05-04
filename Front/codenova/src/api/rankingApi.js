import api from "./axiosConfig"
import authApi from "./authAxiosConfig";

export const getRanking = async (lang) => {
    const response = await api.get(`/api/single/ranking/${lang}`)
    return response;
}

export const getMemberRanking = async (lang) => {
    const response = await authApi.get(`/api/single/ranking/${lang}`)
    return response;
}