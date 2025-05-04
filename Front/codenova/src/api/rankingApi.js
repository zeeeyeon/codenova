import authApi from "./authAxiosConfig";

export const getRanking = async (lang) => {
    const response = await authApi.get(`/api/single/ranking/${lang}`)
    return response;
}
