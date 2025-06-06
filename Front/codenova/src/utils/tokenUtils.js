// utils/tokenUtils.js
export const getAccessToken = () => {
  try {
    const data = JSON.parse(localStorage.getItem("auth-storage"));
    return data?.state?.token || null;
  } catch (e) {
    return null;
  }
};
