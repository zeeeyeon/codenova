import authApi from "./authAxiosConfig";

export const getSessionKey = async () => {
    try {
        const response = await authApi.get('api/session-key')
        console.log(response.data);
        return response.data;
    } catch (e) {
        console.error("세션키 요청 실피 : " , e)
        throw e;
    }
}


