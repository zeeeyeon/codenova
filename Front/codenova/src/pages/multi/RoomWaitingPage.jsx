import { useParams, useLocation, useNavigate } from "react-router-dom"; // 라우터의 파라미터 읽어오기
import {useState, useEffect} from "react";
import { getSocket } from "../../sockets/socketClient";
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
    const [users, setUsers] = useState([]);

    const handleLeaveRoom = () => {
        navigate("/multi"); // multi 페이지로 이동
      };


      // 초기값 사용하기 위함.
      const [roomInfo, setRoomInfo] = useState(() => ({
        roomTitle: state?.roomTitle || "",
        isPublic: state?.isPublic ?? true,
        language: state?.language || "Unknown",
        currentPeople: state?.currentPeople || 1,
        standardPeople: state?.standardPeople || 4,
        roomCode: state?.roomCode || "",
      }));

      
      const dummyUsers = [
        { slot: 1, nickname: "동현갈비", profileImage: "url1", typing: "???타수", isReady: true, isHost: true },
        { slot: 2, nickname: "과일왕자이과람", profileImage: "url2", typing: "???타수", isReady: false },
        { slot: 3, nickname: "TIMMY이지연", profileImage: "url3", typing: "???타수", isReady: true },
        { slot: 4, empty: true }
    ];
      
    useEffect(() => {
      const socket = getSocket();
      if (!socket) return;
    
       // ✅ 진입하자마자 최신 room info 요청
    socket.emit("room_list", (rooms) => {
      const myRoom = rooms.find((r) => String(r.roomId) === String(roomId));
      if (myRoom) {
        setRoomInfo((prev) => ({
          roomTitle: myRoom.title,
          isPublic: !myRoom.isLocked,
          language: myRoom.language,
          currentPeople: myRoom.currentCount,
          standardPeople: myRoom.maxCount,
          roomCode: prev.roomCode, // ✅ 여기 유지!
        }));
      }
    });

    // ✅ 실시간 업데이트 반영
    const handleRoomUpdate = (updatedRoom) => {
      if (String(updatedRoom.roomId) === String(roomId)) {
        console.log("💡 방 업데이트 수신:", updatedRoom);
        setRoomInfo({
          roomTitle: updatedRoom.title,
          isPublic: !updatedRoom.isLocked,
          language: updatedRoom.language,
          currentPeople: updatedRoom.currentCount,
          standardPeople: updatedRoom.maxCount,
          roomCode: updatedRoom.roomCode,
        });
      }
    };

    socket.on("room_update", handleRoomUpdate);
    return () => socket.off("room_update", handleRoomUpdate);
  }, [roomId]);

    
    
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
              src={roomInfo.isPublic ? unlockImg : lockImg}
              alt={roomInfo.isPublic ? "공개방" : "비공개방"}
              className="w-6 h-6"
            />
            <h2 className="text-2xl">{roomInfo.roomTitle}</h2>
          </div>
          {/* 사용자 리스트 */}
  <div className="w-full flex justify-center mt-10">
    <RoomUserList users={dummyUsers} />
  </div>

  {/* 채팅박스 */}
  <div className="w-[90%] flex justify-start items-start gap-6 z-10 pl-6">
    <RoomChatBox />
    <RoomInfoPanel 
      isPublic={roomInfo.isPublic}
      roomTitle={roomInfo.roomTitle}
      language={roomInfo.language}
      currentPeople={roomInfo.currentPeople}
      standardPeople={roomInfo.standardPeople}
      roomCode={roomInfo.roomCode}
      onLeave={handleLeaveRoom}
      isReady={isReady}
      onReady={() => setIsReady(prev => !prev)}
    />
  </div>
        </div>
        </div>
    );
};

export default RoomWaitingPage;