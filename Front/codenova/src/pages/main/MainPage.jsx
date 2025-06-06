import multibg from "../../assets/images/multi_background.png";
import boardImage from "../../assets/images/board2.jpg";
import Header from "../../components/common/Header";
import singleBtn from "../../assets/images/single_button.png";
import multiBtn from "../../assets/images/multi_button.png";
import makeRoomBtn from "../../assets/images/make_room_button.png";
import goRoomBtn from "../../assets/images/go_game_button.png";
import { Player } from "@lottiefiles/react-lottie-player";
import battleLottie from "../../assets/lottie/battle.json";
import defendLottie from "../../assets/lottie/defend.json";
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react";
import RoomCodeModal from "../../components/modal/RoomCodeModal";
import { createMeteoRoom } from "../../sockets/meteoSocket";
import useAuthStore from "../../store/authStore";
import TutoModal from "../../components/common/TutoModal";
import { getSocket } from "../../sockets/socketClient";
import randomBtn from "../../assets/images/gorandom_button.png";
import { onRandomMatch, onRandomMatchResponse, offRandomMatch } from "../../sockets/meteoSocket";
import SettingModal from "../../components/modal/SettingModal";
import PatchNoteModal from "../../components/PatchNoteModal";
const PATCH_VERSION = "1.0.3";
const MainPage = () => {
  const navigate = useNavigate()
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showTutoModal, setShowTutoModal] = useState(false);
  const [socketReady, setSocketReady] = useState(false);
  const [showSettingModal, setShowSettingModal] = useState(false);
  const [showPatchNote, setShowPatchNote] = useState(false);

  useEffect(() => {
    const lastSeenVersion = localStorage.getItem("codenova_patch_note");
    if (lastSeenVersion !== PATCH_VERSION) {
      setShowPatchNote(true);
    }
  }, []);

  const handleClosePatchNote = () => {
    localStorage.setItem("codenova_patch_note", PATCH_VERSION);
    setShowPatchNote(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const socket = getSocket();
      setSocketReady(!!socket);
    }, 300);
  
    return () => clearTimeout(timer);
  }, []);

  // 혹시 모르니 일단 main에선 모든 로컬 초기화
  useEffect(() => {
    localStorage.removeItem("roomId");
    localStorage.removeItem("roomCode");
    localStorage.removeItem("meteoRoomId");
    localStorage.removeItem("meteoRoomCode");
    localStorage.removeItem("meteoPlayers");
  }, []);
  
  

  const handleMultiClick = () => {
    if (!socketReady) {
      // alert("❌ 소켓이 연결되지 않았습니다.");
      return;
    }
    navigate("/multi");
  };


  const nickname = useAuthStore((state) => state.user?.nickname)
  // console.log(nickname)
  const handleCreateMeteoRoom = () => {
    if (!nickname) {
      alert("잘못된 접근입니다.");
      navigate("/auth/login");
      return;
    }
    // console.log("방 생성 요청 emit 보냄");
    createMeteoRoom(
      { isPrivate: true, nickname }, // 닉네임 넘겨서 createRoom emit
      (roomData) => {
        // console.log("✅ 방 생성 성공:", roomData);
        const initalPlayers = [{ sessionId: roomData.sessionId, nickname, isHost: roomData.isHost}];
        navigate("/meteo/landing", { state: { roomCode: roomData.roomCode, roomId: roomData.roomId, players: initalPlayers} });
      },
      (errorMessage) => {
        // console.error("❌ 방 생성 실패:", errorMessage);
        alert(errorMessage);
      }
    );
  };
  
  const handleRandomMatch = () => {
    if (!nickname) {
      alert("잘못된 접근입니다.");
      return;
    }
  
    // 1. 랜덤 매칭 emit
    onRandomMatch(nickname);
  
    // 2. 응답 수신 후 처리
    onRandomMatchResponse((roomData) => {
      // console.log("🎲 랜덤매칭 완료:", roomData);
  
      // ✅ 랜덤 매칭 성공 시 저장
      localStorage.setItem("meteoRoomCode", ""); // 랜덤은 코드 없음
      localStorage.setItem("meteoRoomId", roomData.roomId);
  
      navigate("/meteo/landing", {
        state: {
          roomCode: "", // 랜덤매칭은 코드 없음
          roomId: roomData.roomId,
          players: roomData.players,
        },
      });
  
      // ✅ cleanup
      offRandomMatch();
      
    });
  };



  return (
    <>
      {showPatchNote && <PatchNoteModal onClose={handleClosePatchNote} />}
      <div
        className="h-screen w-screen bg-cover bg-center bg-no-repeat overflow-hidden relative"
        style={{ backgroundImage: `url(${multibg})` }}
      >
      <Header 
        onShowTuto={() => setShowTutoModal(true)} 
        onShowSetting={() => setShowSettingModal(true)}  
      />

      {/* 보드 2개 (배틀모드 / 협력모드) */}
      <div className="flex justify-center items-center gap-20 mt-44 z-30">
        {/* 배틀모드 박스 */}
        <div className="relative w-[24rem] h-[30rem] shadow-2xl rounded-2xl">
          <img src={boardImage} alt="Battle Mode Board" className="w-full h-full rounded-2xl" />

          {/* 모드 제목 & 설명 */}
          <div className="absolute top-6 w-full text-center text-black text-4xl font-bold">배틀모드</div>
          <div className="absolute top-28 w-full text-center text-white text-2xl drop-shadow-sm">
            최강 개발자를 가려라!
          </div>

          {/* 버튼 묶음 */}
          <div className="absolute top-44 w-full flex flex-col items-center gap-6">
            <img src={singleBtn} role="button" alt="Single Mode" className="w-[10rem] cursor-pointer transition-all duration-150 hover:brightness-110 hover:translate-y-[2px] hover:scale-[0.98] active:scale-[0.95]" 
            onClick={() => navigate("/single/select/language")}
            />
            <img src={multiBtn}  role="button" alt="Multi Mode" className="w-[10rem] cursor-pointer transition-all duration-150 hover:brightness-110 hover:translate-y-[2px] hover:scale-[0.98] active:scale-[0.95]" 
            onClick={handleMultiClick}
            />
          </div>

          {/* 로티 애니메이션 - 박스 아래쪽에 고정 */}
          <Player
            autoplay
            loop
            src={battleLottie}
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[9rem] pointer-events-none"
          />
        </div>

        {/* 협력모드 박스 */}
        <div className="relative w-[24rem] h-[30rem] shadow-2xl rounded-2xl">
          <img
            src={boardImage}
            alt="Coop Mode Board"
            className="w-full h-full rounded-2xl"
          />

          {/* 제목 & 설명 */}
          <div className="absolute top-6 w-full text-center text-black text-4xl font-bold">
            협력모드
          </div>
          {/* <div className="absolute top-28 w-full text-center text-white text-2xl drop-shadow-sm">
            지구를 지켜라!
          </div> */}

          {/* 버튼 묶음 */}
          <div className="absolute top-28 w-full flex flex-col items-center gap-4">
            <img
              src={makeRoomBtn}
              role="button"
              alt="Make Room"
              onClick={handleCreateMeteoRoom}
              className="w-[10rem] cursor-pointer transition-all duration-150 hover:brightness-110 hover:translate-y-[2px] hover:scale-[0.98] active:scale-[0.95]"
            />
            <img
              src={goRoomBtn}
              role="button"
              alt="Enter Room"
              onClick={() => setShowRoomModal(true)}
              className="w-[10rem] cursor-pointer transition-all duration-150 hover:brightness-110 hover:translate-y-[2px] hover:scale-[0.98] active:scale-[0.95]"
            />
            <img
            src={randomBtn}
            role="button"
            alt="랜덤매칭"
            className="w-[10rem] cursor-pointer hover:brightness-110 hover:scale-105 transition-transform"
            onClick={handleRandomMatch}
          />
          </div>

          {/* 로티 애니메이션 - 박스 하단 고정 */}
          <Player 
            autoplay
            loop
            src={defendLottie}
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[9rem] pointer-events-none"
          />
        </div>
      </div>
      {showRoomModal && <RoomCodeModal onClose={() => setShowRoomModal(false)} />}
      {showTutoModal && <TutoModal onClose={() => setShowTutoModal(false)} />}
      {showSettingModal && <SettingModal onClose={() => setShowSettingModal(false)} />}
    </div>
    </>
  );
};

export default MainPage;
