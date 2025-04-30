import authApi from "./authAxiosConfig";

export const singleLangCode = async (lang) => {
    try {
        const response = await authApi.get('/api/single/code', {params: {language: lang.toUpperCase()}});
        console.log(response.data)
        return response.data.content.content;
    } catch (e) {
        console.error("Single API 요청 실패:", e);
        throw e;
    }
}

export const singleCsCode = async (category) => {
    try {
        const response = await authApi.get('/api/single/cs/code', {params: {category: category.toUpperCase()}})
        return response.data.content;
    } catch (e) {
        console.error("CS API 요청 실패", e);
        throw e;
    }
}

