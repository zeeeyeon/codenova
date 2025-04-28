import { useParams, useLocation, useNavigate } from "react-router-dom"; // 라우터의 파라미터 읽어오기
import {useState} from "react";
import multiBg from "../../assets/images/multi_background.png";
import boardBg from "../../assets/images/board1.jpg";
import lockImg from "../../assets/images/black_lock_icon.png";
import unlockImg from "../../assets/images/black_unlock_icon.png";
import RoomUserList from "../../components/multi/waiting/RoomUserList";
import Header from "../../components/common/Header";
import RoomChatBox from "../../components/multi/waiting/RoomChatBox";
import RoomInfoPanel from "../../components/multi/waiting/RoomInfoPanel";

const RoomWaitingPage = () => {
    const {roomId} = useParams(); // url에 담긴 roomId 읽어오기
    const {state} = useLocation();  // navigate할때 보낸 데이터
    const navigate = useNavigate();
    const [isReady, setIsReady] = useState(false); 

    const handleLeaveRoom = () => {
        navigate("/multi"); // multi 페이지로 이동
      };

    const {
        roomTitle,
        isPublic,
        language,
        currentPeople,
        standardPeople,
        roomCode
      } = state || {}; 

      const dummyUsers = [
        { slot: 1, nickname: "동현갈비", profileImage: "url1", typing: "???타수", isReady: true },
        { slot: 2, nickname: "과일왕자이과람", profileImage: "url2", typing: "???타수", isReady: false },
        { slot: 3, nickname: "TIMMY이지연", profileImage: "url3", typing: "???타수", isReady: true },
        { slot: 4, empty: true }
    ];
      
    
    return (
        <div
            className="w-screen h-screen bg-cover bg-center bg-no-repeat overflow-hidden relative"
            style={{ backgroundImage: `url(${multiBg})` }}
        >
            <Header />

        <div className="absolute top-[53%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[66vw] max-w-[1300px] aspect-[4/3] bg-contain bg-no-repeat bg-center relative flex flex-col items-center justify-start pt-[6.5%] rounded-2xl">
                <img
                  src={boardBg}
                  alt="board"
                  className="absolute object-cover rounded-2xl z-0"
        />

        <div className="relative z-10 flex items-center gap-2 mt-5">
            <img
              src={isPublic ? unlockImg : lockImg}
              alt={isPublic ? "공개방" : "비공개방"}
              className="w-6 h-6"
            />
            <h2 className="text-2xl">{roomTitle}</h2>
          </div>
          {/* 사용자 리스트 */}
  <div className="w-full flex justify-center mt-10">
    <RoomUserList users={dummyUsers} />
  </div>

  {/* 채팅박스 */}
  <div className="w-[90%] flex justify-start items-start gap-6 z-10 pl-6">
    <RoomChatBox />
    <RoomInfoPanel 
        isPublic={isPublic} 
        roomTitle={roomTitle} 
        language={language} 
        currentPeople={currentPeople} 
        standardPeople={standardPeople}
        roomCode={roomCode}
        onLeave={handleLeaveRoom}
        isReady={isReady}
        onReady={() => setIsReady(prev => !prev)} />
  </div>
        </div>
        </div>
    );
};

export default RoomWaitingPage;