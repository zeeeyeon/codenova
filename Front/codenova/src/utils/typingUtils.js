
/**
 * 타수(WPM) 계산
 * @param {number} totalTypedChars - 지금까지 타이핑한 총 글자 수
 * @param {number} elapsedSeconds - 흐른 시간(초)
 * @returns {number} - 계산된 타수 (WPM)
*/
export const calculateWPM = (totalTypedChars, elapsedSeconds) => {
    if (elapsedSeconds === 0) return 0;
    
    const words = totalTypedChars / 5;
    const minutes = elapsedSeconds / 60;

    return Math.floor(words / minutes)
}


/**
 * 타수(WPM) 계산
 * @param {number} totalTypedChars - 지금까지 타이핑한 총 글자 수
 * @param {number} elapsedSeconds - 흐른 시간(초)
 * @returns {number} - 계산된 타수 (WPM * 5)
*/
export const calculateCPM = (totalTypedChars, elapsedSeconds) => {
    if (elapsedSeconds === 0) return 0;
    return Math.floor((totalTypedChars / elapsedSeconds) * 60);
  };


/**
 * 타수(WPM) 계산
 * @param {number} cpm - 현재 계산된 타수
 * @returns {number} - 속도 진행률(%)
*/
export const getSpeedProgress = (cpm) => {
    if (cpm >= 300) return 100;
    return Math.floor((cpm / 300) * 100);
}

/**
 * 싱글모드 진행률 계산
 * @param {number} currentLineIndex - 현재 진행중인 줄
 * @param {number} lineIndex - 총 줄 수
 * @returns {number} - 총 진행률(%)
*/
export const getProgress = (currentLineIndex, lineIndex) => {
    if (lineIndex === 0) return 0;
    return Math.floor((currentLineIndex / lineIndex) * 100);
}