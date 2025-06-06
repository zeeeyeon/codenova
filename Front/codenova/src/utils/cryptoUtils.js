import CryptoJS from 'crypto-js';
import { useSessionStore } from '../store/useSessionStore';

export const encryptWithSessionKey = (data) => {

    const sessionKey = useSessionStore.getState().sessionKey;
    if (!sessionKey) throw new Error("sessionKey가 없습니다.");

    const key = CryptoJS.enc.Base64.parse(sessionKey); // 🔑 키는 Base64라고 가정 (필요시 직접 Hex, Utf8로 맞추기)
    const iv = CryptoJS.lib.WordArray.random(16); // 16바이트 IV 생성
    // console.log(key.sigBytes)

    const dataStr = JSON.stringify(data);

    const encrypted = CryptoJS.AES.encrypt(dataStr, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });

    // ✅ [IV + CipherText]를 Base64로 인코딩
    const combined = iv.concat(encrypted.ciphertext);
    const encryptedBase64 = CryptoJS.enc.Base64.stringify(combined);

    return encryptedBase64;
};
