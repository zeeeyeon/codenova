
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
 * 타수(CPM) 계산
 * @param {number} totalTypedChars - 지금까지 타이핑한 총 글자 수
 * @param {number} elapsedSeconds - 흐른 시간(초)
 * @returns {number} - 계산된 타수 (WPM * 5)
*/
export const calculateCPM = (totalTypedChars, elapsedSeconds) => {
    if (elapsedSeconds === 0) return 0;
    const minutes = elapsedSeconds / 60;

    return Math.floor(totalTypedChars / minutes)
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

/**
 * 
 * @param {string} code - 타이핑할 코드
 * @returns {Array} - 줄별 맨 앞의 공백 수, 즐 별 글자 리스트 
 */

export const processCode = (code) =>{

    const lines = [] // 코드의 각 줄을 저장할 배열
    const space = [] // 각 줄 앞의 공백 수를 저장할 배열
    const charCount = []

    const codeLines = code.split('\n');

    codeLines.forEach(line => {
        const trimmedLine = line.trimStart(); // 앞의 공백 삭제
        const leadingSpaceCount = line.length - trimmedLine.length; // 앞에 공백 개수

        // 한 줄을 글자 단위로 쪼개어 lines 배열에 추가
        lines.push(trimmedLine.split(''));

        // 공백 개수 저장
        if (trimmedLine.length === 0) {
            space.push(1);
        } else {
            space.push(leadingSpaceCount);
        }
        // 줄 별 글자 수
        charCount.push(trimmedLine.length);
    })
    
    return {lines, space, charCount};

}

/**
 * 엔터를 클릭시 해당 줄의 유효성을 검사하는 함수
 * @param {Array} inputArray - 사용자가 입력한 코드
 * @param {Array} lineArray - 스크립트 코드
 * @returns {boolean} - 일치 여부 리턴
 */
export const compareInputWithLineEnter = (inputArray, lineArray) => {

    for (let i = 0; i < inputArray.length; i++) {
        if(inputArray[i] !== lineArray[i]) {
            return false;
        }
    }
    return inputArray.length === lineArray.length; // 두 배열 길이가 다를수도 있어서 길이 일치 여부로 리턴해야함함
}

/**
 * 사용자가 input과 스크립트가 일치하는지 검사하는 함수
 * @param {string} input - 사용자가 입력한 코드
 * @param {Array} lineArray - 스크립트 코드드
 * @returns {boolean} - 일치 여부 리턴
 */
export const compareInputWithLine = (input, lineArray) => {

    for (let i = 0; i < input.length; i++) {
        if(input[i] !== lineArray[i]) {
            return true;
        }
    }
    return false; 
}

/**
 * 
 * @param {Array} input 
 * @param {Array} lineArray 
 * @param {number} currentCharIndex 
 * @returns {number} 일치하는 글자 수
 */
export const calculateCurrentLineTypedChars = (input, lineArray) => {
    if (!Array.isArray(lineArray)) {
        //console.error("lineArray is not an array:", lineArray);
        return 0;
    }
    let cnt = 0;
    for (let i = 0; i < input.length ; i++) {
        if(input[i] === lineArray[i]) {
            cnt++;
        }
    }
    return cnt; 
}