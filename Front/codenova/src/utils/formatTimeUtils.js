/**
 * time 포멧 함수
 * @param {number} ms - 밀리세컨드
 * @returns {string} - 00:00:00
*/
export const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((ms % 1000) / 10);

    return `${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2, '0')}:${String(milliseconds).padStart(2, '0')}`
}