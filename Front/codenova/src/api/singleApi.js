import authApi from "./authAxiosConfig";

export const singleLangCode = async (lang) => {
    try {
        const response = await authApi.get('/api/single/code', {params: {language: lang.toUpperCase()}});
<<<<<<< HEAD
        console.log(response.data);
        return response.data.content;
=======
        // console.log(response.data);
        return response.data.content.content;
>>>>>>> 7126c5b77042e6af7e0adc429889ad39a2a5c375
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

export const getLangCode = async (codeId) => {
    try {
<<<<<<< HEAD
        const response = await authApi.get(`/api/single/test`, {params: {codeId: codeId}})
        return response.data.content;
=======
        // const response = await authApi.get(`/api/single/test/${codeId}`)
        const response = await authApi.get(`/api/single/test`, {params: {codeId: codeId}})
        return response.data.content.content;
>>>>>>> 7126c5b77042e6af7e0adc429889ad39a2a5c375
    } catch (e) {
        console.error("getLangCode API 요청 실패", e);
        throw e;
    }
}
