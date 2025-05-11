import { useParams, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import multiBg from "../../assets/images/multi_background.png";
import Header from "../../components/common/Header";
import boardBg from "../../assets/images/board1.jpg";
import logo from "../../assets/images/logo.png";
import TypingBox from "../../components/multi/game/TypingBox";
import ProgressBoard from "../../components/multi/game/ProgressBoard";
import rocket1 from "../../assets/images/multi_rocket_1.png";
import rocket2 from "../../assets/images/multi_rocket_2.png";
import rocket3 from "../../assets/images/multi_rocket_3.png";
import rocket4 from "../../assets/images/multi_rocket_4.png";
import { getSocket } from "../../sockets/socketClient";
import RoundScoreModal from "../../components/multi/modal/RoundScoreModal";
import FinalResultModal from "../../components/multi/modal/FinalResultModal";
import useAuthStore from "../../store/authStore";


const TypingBattlePage = () => {
  const { roomId } = useParams();  // ✅ roomId 읽어오기
  const [countdown, setCountdown] = useState(5);
  const [gameStarted, setGameStarted] = useState(false);

  const [startTime, setStartTime] = useState(null); // 게임 시작 순간간
  const [elapsedTime, setElapsedTime] = useState(0); // 밀리초 단위
  const [timeRunning, setTimeRunning] = useState(false); // 타이머 실행 중 여부
  const [targetCode, setTargetCode] = useState("");
  const {state} = useLocation();
  const rocketImages = [rocket1, rocket2, rocket3, rocket4];
  const [roundEnded, setRoundEnded] = useState(false);
  const [roundEndingCountdown, setRoundEndingCountdown] = useState(null); // null이면 표시 안함
  const [showRoundScoreModal, setShowRoundScoreModal] = useState(false);
  const [roundScoreData, setRoundScoreData] = useState(null);
  const [firstFinisher, setFirstFinisher] = useState(null);  // 첫번째 완주자
  const [currentRound, setCurrentRound] = useState(1);
  const [modalCountdown, setModalCountdown] = useState(5);
  const [finalResults, setFinalResults] = useState([]);
  const [showFinalModal, setShowFinalModal] = useState(false);

  const [roomInfo, setRoomInfo] = useState(null);
  const nickname = useAuthStore((state) => state.user?.nickname);


  const [users, setUsers] = useState(() => {
    const initialUsers = state?.users?.filter(u => !u.empty) || [];
  
    // rocketImage 부여 (slot 기반)
    return initialUsers.map(user => ({
      ...user,
      rocketImage: rocketImages[user.slot - 1] || rocket1,
      progress: 0, // 처음엔 0부터 시작
    }));
  });

  useEffect(() => {
    console.log("🔥 TypingBattlePage 초기 users 상태:", state?.users);
  }, []);

  // 카운트다운
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setGameStarted(true); // 카운트다운 끝나면 게임 시작
      setTimeRunning(true); // 타이머도 시작!
      setStartTime(Date.now()); // 현재시간 기록
    }
  }, [countdown]);

  // 게임 시작 실시간 경과 시간 업뎃
  useEffect(() => {
    if (timeRunning) {
      const interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime); // 밀리초 단위 경과 시간
      }, 10); // 10ms마다 업데이트(밀리초 보여주려고)
      return () => clearInterval(interval);
    }
  }, [timeRunning, startTime]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
  
    socket.emit("room_status", { roomId });
  
    const handleRoomStatus = (data) => {
      console.log("🧑‍🚀 TypingBattlePage room_status 수신:", data);
  
      const updatedUsers = Array.from({ length: data.maxCount }, (_, i) => {
        const user = data.users[i];
        return user
          ? {
              slot: i + 1,
              nickname: user.nickname,
              isHost: user.isHost,
              isReady: user.isReady,
              rocketImage: rocketImages[i], // 로켓 이미지 부여
              progress: 0,
              empty: false,
            }
          : {
              slot: i + 1,
              empty: true,
            };
      });
  
      setUsers(updatedUsers.filter((u) => !u.empty)); // 빈 슬롯 제거
    };
  
    socket.on("room_status", handleRoomStatus);
    return () => socket.off("room_status", handleRoomStatus);
  }, [roomId]);
  


  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleTypingStart = (data) => {
      console.log("🥘 typing_start 수신:", data);
      setTargetCode(data.script); // 문제 저장

      setUsers((prev) =>
        Array.isArray(prev)
          ? prev.map((user) => ({
              ...user,
              progress: 0,
            }))
          : [] // fallback
      );
    };

    socket.on("typing_start", handleTypingStart);
    return () => socket.off("typing_start", handleTypingStart);
  }, []);
  
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
  
    const handleProgressUpdate = (data) => {
      console.log("🚀 progress_update 수신:", data);
  
      setUsers((prev) =>
        prev.map((user) =>
          user.nickname === data.nickname
            ? { ...user, progress: data.progressPercent }
            : user
        )
      );
    };
  
    socket.on("progress_update", handleProgressUpdate);
    return () => socket.off("progress_update", handleProgressUpdate);
  }, []);

  // const handleFinish = () => {
  //   setTimeRunning(false); // 타자 타이머 정지
  
  //   if (!roundEnded) {
  //     setRoundEnded(true);
  //     setRoundEndingCountdown(10); // 🔔 카운트다운 표시 시작
  
  //     const countdownInterval = setInterval(() => {
  //       setRoundEndingCountdown((prev) => {
  //         if (prev === 1) {
  //           clearInterval(countdownInterval); // 끝나면 타이머 제거
  //           return null;
  //         }
  //         return prev - 1;
  //       });
  //     }, 1000);
  
  //     // 10초 후 서버에 round_end 알림
  //     setTimeout(() => {
  //       const socket = getSocket();
  //       socket.emit("round_end", { roomId });
  //     }, 10000);
  //   }
  // };

  // useEffect(() => {
  //   const socket = getSocket();
  //   if (!socket) return;
  
  //   const handleFinishNotice = (data) => {
  //     const { nickname } = data;
  //     console.log("🏁 finish_notice 수신:", nickname);
  
  //     setFirstFinisher(nickname); // 표시용
  //     handleFinish(); // 기존 라운드 종료 카운트다운 실행
  //   };
  
  //   socket.on("finish_notice", handleFinishNotice);
  //   return () => socket.off("finish_notice", handleFinishNotice);
  // }, []);

  const handleFinish = () => {
    if (roundEnded) return; // ✅ 중복 방지 (가장 먼저 체크)
    setRoundEnded(true);
    setTimeRunning(false); // 타자 타이머 정지
    setRoundEndingCountdown(10); // 🔔 카운트다운 표시 시작
  
    const countdownInterval = setInterval(() => {
      setRoundEndingCountdown((prev) => {
        if (prev === 1) {
          clearInterval(countdownInterval); // 끝나면 타이머 제거
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  
    // 10초 후 서버에 round_end 알림
    setTimeout(() => {
      const socket = getSocket();
      socket.emit("round_end", { roomId });
    }, 10000);
  };
  
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
  
    const handleFinishNotice = (data) => {
      const { nickname } = data;
      console.log("🏁 finish_notice 수신:", nickname);
  
      setFirstFinisher(nickname); // 표시용
      if (finisherNickname === nickname && !roundEnded) {
        handleFinish(); // ✅ 중복 방지
      }
    };
  
    socket.on("finish_notice", handleFinishNotice);
    return () => socket.off("finish_notice", handleFinishNotice);
  }, []);
  

  // 소켓 수신
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
  
    const handleRoundScore = (data) => {
      console.log("📊 round_score 수신:", data);
      setRoundScoreData(data);
      setCurrentRound(data.round+1);
      setShowRoundScoreModal(true);
      setModalCountdown(5); // 카운트다운 초기화
  
      const interval = setInterval(() => {
        setModalCountdown((prev) => {
          if (prev === 1) {
            clearInterval(interval);
            setShowRoundScoreModal(false);
  
            if (data.round < 3) {
              console.log("🍆 round_start emit");
              setCountdown(5);
              setGameStarted(false);
              setRoundEnded(false);
              setFirstFinisher(null);
              setTargetCode("");
              console.log("🎙️ round_start emit 시도:", { roomId, nickname});
              socket.emit("round_start", {
                roomId,
                nickname,
              });
            
            }

          }
          return prev - 1;
        });
      }, 1000);
    };
    
    socket.on("round_score", handleRoundScore);
    return () => socket.off("round_score", handleRoundScore);
  }, []);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    
    const handleGameResult = (data) => {
      console.log("💩 최종 게임 결과 안내 : ",data);
      setFinalResults(data.results); // 서버에서 avgSpeed 등 포함된 리스트로 보낸다고 가정
      setShowFinalModal(true);

    };
    socket.on("game_result", handleGameResult);
    return () => socket.off("game_result", handleGameResult);
  }, []);

  // 게임 종료시 받는 방 상태 정보보
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
  
    const handleRoomStatus = (data) => {
      console.log("🧑‍🚀 room_status 수신:", data);
      setRoomInfo(data); // 이걸 FinalResultModal로 넘겨줘야 함
  
      const updatedUsers = Array.from({ length: data.maxCount }, (_, i) => {
        const user = data.users[i];
        return user
          ? {
              slot: i + 1,
              nickname: user.nickname,
              isHost: user.isHost,
              isReady: user.isReady,
              rocketImage: rocketImages[i],
              progress: 0,
              empty: false,
            }
          : {
              slot: i + 1,
              empty: true,
            };
      });
  
      setUsers(updatedUsers.filter((u) => !u.empty));
    };
  
    socket.on("room_status", handleRoomStatus);
    return () => socket.off("room_status", handleRoomStatus);
  }, [roomId]);
  
  

  return (
    <div
    className="w-screen h-screen bg-cover bg-center bg-no-repeat overflow-hidden relative"
    style={{ backgroundImage: `url(${multiBg})` }}
  >

    {roundEndingCountdown !== null && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 text-white text-xl bg-black bg-opacity-80 px-6 py-3 rounded-xl border border-white text-center leading-relaxed">
          {firstFinisher && (
            <div className="font-bold mb-1">🎉 <span className="text-yellow-300">{firstFinisher}</span> 님이 가장 먼저 완주했어요!</div>
          )}
           {currentRound === 3 ? (
            <>🔥 마지막 라운드 종료까지 {roundEndingCountdown}초 남았습니다</>
          ) : (
            <>Round {currentRound} 종료까지 {roundEndingCountdown}초 남았습니다</>
          )}
        </div>
      )}


    {/* <h1 className="text-2xl text-center">Typing Battle 시작! (Room ID: {roomId})</h1> */}
    {/* 카운트다운 오버레이  */}
        {!gameStarted && (
            <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="text-9xl font-bold text-white animate-pulse">
                {countdown > 0 ? countdown : "Start!"}
            </div>
            </div>
        )}
    <div className="absolute top-[50%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[72rem] max-w-[1300px] aspect-[4/3] bg-contain bg-no-repeat bg-center relative flex flex-col items-center justify-start pt-[6.5%] rounded-2xl">
      <img src={boardBg} alt="board" className="absolute object-cover rounded-2xl z-0" />
  
      {/* 컨텐츠 */}
      <div className="relative z-10 w-full h-full flex flex-col px-20 py-6 top-16">
        
        {/* 로고 */}
        {/* <div className="flex justify-center mb-4">
          <img src={logo} alt="logo" className="w-[15rem]" />
        </div> */}
  
        {/* 타이핑 박스 */}
        <div className="h-[45%] flex items-center justify-center ">
        <TypingBox
            roomId={roomId}
            gameStarted = {gameStarted} 
            elapsedTime={elapsedTime} 
            onFinish={handleFinish}
            targetCode={targetCode}
            currentRound={currentRound}
            />
        </div>
  
        {/* 진행 보드 */}
        <div className="h-[26%] flex items-center justify-start">
          <ProgressBoard users={users}/>
        </div>
  
      </div>
    </div>
    {/* 라운드 종료 점수 모달 */}
      <RoundScoreModal
        visible={showRoundScoreModal}
        scores={roundScoreData?.scores || []}
        round={roundScoreData?.round || 0}
        countdown={modalCountdown}
        onClose={() => setShowRoundScoreModal(false)}
      />

    <FinalResultModal
      visible={showFinalModal}
      results={finalResults}
      onClose={() => setShowFinalModal(false)}
      roomInfo={roomInfo}

    />
  </div>

  
  
  );
};

export default TypingBattlePage;
