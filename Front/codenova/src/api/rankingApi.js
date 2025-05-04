import api from "./axiosConfig"

export const getRanking = async (lang) => {
    const response = await api.get(`/api/single/ranking/${lang}`)
    return response;
}
