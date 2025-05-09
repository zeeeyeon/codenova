import { getSocket } from "./socketClient";

//필요할 거 같은 메서드
/**
 *  싱글모드 방 생성(createSingleRoom)
 *  - 1. emit으로 서버로 데이터 전달
 *  - 2. once로 스크립트 코드 받기
 */
export const createSingleRoom  = ({lang, nickname}, onSuccess, onError) => {

    const socket = getSocket();
    if (!socket) return;

    // 서버로 데이터 보내기
    socket.emit("createSingleRoom", {language : lang, nickname});
    // 코드 한번만 받기
    socket.once("singleRoomCreated", ({code}) => {
        onSuccess(code);
    } )
    socket.once("singleError", (error) => {
        onError(error.message);
    })
}

/**
 *  게임 시작(emitGameStart)
 *  - 사용자가 한문자 입력시 시작
 *  - 1. emit으로 서버로 데이터 전달
 *  - 2. on ? once? 
 */
export const emitGameStart = ({roomId, nickname}, onSuccess, onError ) => {
    const socket = getSocket();
    if (!socket) return;

    socket.emit("startGame", {roomId, nickname});

    socket.once("gameStarted", ({startTime}) => {
        onSuccess(startTime);
    })

    socket.once("startGameError", (error) => {
        onError(error.message);
    })


};

/**
 *  게임 완료(onGameEnd)
 *  - 100로 달성하면 최종 타수랑 진행시간을 서버로 부터 받아야함 
 */
export const onceGameEnd = (callback) => {
    const socket = getSocket();
    if (!socket) return;

    socket.once("gameEnd", (data) => {
        callback(data); //speed, elapsedTime
    })
}


/**
 *  다시하기 (restartSingleGame) + 새 문제 요청
 *  - 게임이 끝나고 finish 모달에서 다시하기 클릭하면 다시 코드 받고 시작할 수 있어야함
 */
export const restartSingleGame = ({ lang, nickname }, onSuccess, onError) => {

    const socket = getSocket();
    if (!socket) return;

    socket.emit("restartGame", {language: lang, nickname});

    socket.once("gameRestarted", ({code}) => {
        onSuccess(code)
    });

    socket.once("restartGameError", (error) => {
        onError(error.message);
    })
}

/**
 *  그만하기 (stopSingeGame)
 *  - 게임이 끝나고 finish 모달에서 그만하기를 클릭하면 방도 사라지고 완전히 게임 종료료
 */
export const stopSingleGame = ({roomId, nickname}) => {

    const socket = getSocket();
    if (!socket) return;

    getSocket.emit("stopSingleGame", {roomId, nickname});
}


/**
 *  게임 도중에 종료(exitSingleGame) 
 *  - 게임 도중에 종료 버튼 누르면 그냥 나가지기 
 *  - 1. emit으로 서버로 데이터 전달
 */
export const exitSingleGame = ({ roomId, nickname }) => {
    const socket = getSocket();
    if (!socket) return;

    getSocket.emit("exitSingleGame", { roomId, nickname })
}


/**
 *  사용자 입력 (inputText)
 *  - 사용자가 input을 입력 혹은 지우는 이벤트 
 *  - 1. emit으로 서버로 데이터 전달
 */
export const inputText = ({char, tpye, timestamp}) => {
    const socket = getSocket();
    if (!socket) return;

    socket.emit("inputText", {char, tpye, timestamp});
}

/**
 *  사용자 입력 (speedUpdate)
 *  - 사용자가 입력한 데이터에 따라 타수 및 진행시간 받기기
 */
export const speedUpdate = (callback) => {
     const socket = getSocket();
    if (!socket) return;

    socket.on("speedUpdate", (data) => {
        callback(data); // speed, elapsedTime
    })
}

/**
 * speedUpdate 수신 리스너 제거 
 */
export const offSpeedUpdate = () => {
    const socket = getSocket();
    if (!socket) return;

    socket.off("speedUpdate")
}