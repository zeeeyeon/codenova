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
import { getAccessToken } from "../../utils/tokenUtils";
import { createMeteoRoom } from "../../sockets/meteoSocket";
import useAuthStore from "../../store/authStore";

const MainPage = () => {
  const navigate = useNavigate()
  const [showRoomModal, setShowRoomModal] = useState(false);

  useEffect(() => {
    const accessToken = getAccessToken();
    if (!accessToken) {
      alert("로그인이 필요합니다.");
      navigate("/auth/login");
    }
  }, [navigate]);


  const nickname = useAuthStore((state) => state.user?.nickname)
  // console.log(nickname)
  const handleCreateMeteoRoom = () => {
    if (!nickname) {
      alert("닉네임이 없습니다.");
      navigate("/auth/login");
      return;
    }
    console.log("방 생성 요청 emit 보냄");
    createMeteoRoom(
      { isPrivate: true, nickname }, // 닉네임 넘겨서 createRoom emit
      (roomData) => {
        console.log("✅ 방 생성 성공:", roomData);
        const initalPlayers = [{ sessionId: roomData.sessionId, nickname, isHost: roomData.isHost}];
        navigate("/meteo/landing", { state: { roomCode: roomData.roomCode, roomId: roomData.roomId, players: initalPlayers} });
      },
      (errorMessage) => {
        console.error("❌ 방 생성 실패:", errorMessage);
        alert(errorMessage);
      }
    );
  };
    
  return (
    <div
      className="h-screen w-screen bg-cover bg-center bg-no-repeat overflow-hidden relative"
      style={{ backgroundImage: `url(${multibg})` }}
    >
      <Header />

      {/* 보드 2개 (배틀모드 / 협력모드) */}
      <div className="flex justify-center items-center gap-20 mt-44">
        {/* 배틀모드 박스 */}
        <div className="relative w-[24rem] h-[30rem] shadow-2xl rounded-2xl">
          <img src={boardImage} alt="Battle Mode Board" className="w-full h-full rounded-2xl" />

          {/* 모드 제목 & 설명 */}
          <div className="absolute top-6 w-full text-center text-black text-4xl font-bold">배틀모드</div>
          <div className="absolute top-28 w-full text-center text-white text-2xl drop-shadow-sm">
            최강 개발자를 가려라!
          </div>

          {/* 버튼 묶음 */}
          <div className="absolute top-40 w-full flex flex-col items-center gap-2">
            <img src={singleBtn} alt="Single Mode" className="w-[10rem] cursor-pointer transition-all duration-150 hover:brightness-110 hover:translate-y-[2px] hover:scale-[0.98] active:scale-[0.95]" 
            onClick={() => navigate("/single/select/language")}
            />
            <img src={multiBtn} alt="Multi Mode" className="w-[10rem] cursor-pointer transition-all duration-150 hover:brightness-110 hover:translate-y-[2px] hover:scale-[0.98] active:scale-[0.95]" 
            onClick={() => navigate("/multi")}
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
          <div className="absolute top-28 w-full text-center text-white text-2xl drop-shadow-sm">
            지구를 지켜라!
          </div>

          {/* 버튼 묶음 */}
          <div className="absolute top-40 w-full flex flex-col items-center gap-2">
            <img
              src={makeRoomBtn}
              alt="Make Room"
              onClick={handleCreateMeteoRoom}
              className="w-[10rem] cursor-pointer transition-all duration-150 hover:brightness-110 hover:translate-y-[2px] hover:scale-[0.98] active:scale-[0.95]"
            />
            <img
              src={goRoomBtn}
              alt="Enter Room"
              onClick={() => setShowRoomModal(true)}
              className="w-[10rem] cursor-pointer transition-all duration-150 hover:brightness-110 hover:translate-y-[2px] hover:scale-[0.98] active:scale-[0.95]"
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
    </div>

);
};

export default MainPage;
