import { data } from "react-router-dom";
import authApi from "./authAxiosConfig";

export const getMyProfile = async () => {
    try {
        const response = await authApi.get('/api/member/profile');
        console.log(response.data);
        return response.data;

    } catch (e) {
        // console.error("내정보 조회 API 요청 실패:", e);
        throw e;
    }
}


export const upDateMyProfile = async (data) => {
    try {
        // console.log(data);
        const response = await authApi.post('/api/member/profile', data);
        // console.log(response.data);
        return response.data;

    } catch (e) {
        // console.error("내정보 조회 API 요청 실패:", e);
        throw e;
    }
}
