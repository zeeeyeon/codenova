import api from "./axiosConfig"
import authApi from "./authAxiosConfig";

export const singleLangCode = async (lang) => {
    try {
        const response = await api.get('/api/single/code', {params: {language: lang.toUpperCase()}});
        console.log(response.data);
        return response.data.content;

    } catch (e) {
        console.error("Single API 요청 실패:", e);
        throw e;
    }
}

export const singleCsCode = async (category) => {
    try {
        const response = await api.get('/api/single/cs/code', {params: {category: category.toUpperCase()}})
        return response.data.content;
    } catch (e) {
        console.error("CS API 요청 실패", e);
        throw e;
    }
}

export const getLangCode = async (codeId) => {
    try {
        const response = await api.get(`/api/single/test`, {params: {codeId: codeId}})
        console.log(response.data);
        return response.data.content;
    } catch (e) {
        console.error("getLangCode API 요청 실패", e);
        throw e;
    }
}

export const postRecord = async (data) => {
    try {
        const response = await authApi.post('/api/single/code/result', data);
        console.log(response.data);
        return response.data;
    } catch (e) {
        console.error("기록저장 API 요청 실패",e);
        throw e;
    }
}