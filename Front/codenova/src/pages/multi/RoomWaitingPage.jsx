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
    
    // 방 정보 최신화용 
    useEffect(() => {
      const socket = getSocket();
      if (!socket) return;
    
       // 진입하자마자 최신 room info 요청
    socket.emit("room_list", (rooms) => {
      const myRoom = rooms.find((r) => String(r.roomId) === String(roomId));
      if (myRoom) {
        setRoomInfo((prev) => ({
          roomTitle: myRoom.title,
          isPublic: !myRoom.isLocked,
          language: myRoom.language,
          currentPeople: myRoom.currentCount,
          standardPeople: myRoom.maxCount,
          roomCode: prev.roomCode,
        }));
      }
    });

    // 실시간 업데이트 반영
    const handleRoomUpdate = (updatedRoom) => {
      if (String(updatedRoom.roomId) === String(roomId)) {
        console.log("💡 방 업데이트 수신:", updatedRoom);
        setRoomInfo((prev) => ({
          roomTitle: updatedRoom.title,
          isPublic: !updatedRoom.isLocked,
          language: updatedRoom.language,
          currentPeople: updatedRoom.currentCount,
          standardPeople: updatedRoom.maxCount,
          roomCode: prev.roomCode,
        }));
      }
    };

    socket.on("room_update", handleRoomUpdate);
    return () => socket.off("room_update", handleRoomUpdate);
  }, [roomId]);

  
  // 방 최토 입장시 room_status 요청
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    
    // 방 상태 요청(room_status 응답 : 현재 유저 목록 등등)
    socket.emit("room_status", {
      roomId: roomId,
      nickname: state?.nickname,
      roomCode: state?.roomCode
    });
  
    const handleRoomStatus = (data) => {
      console.log("✅ room_status 응답 수신:", data);
  
      // roomInfo 세팅 (추가로 방 정보도 최신화)
      setRoomInfo((prev) => ({
        ...prev,
        roomTitle: data.roomTitle,
        isPublic: !data.isLocked,
        language: data.language,
        currentPeople: data.currentCount,
        standardPeople: data.maxCount,
      }));
  
      // 사용자 슬롯 세팅
      const slotData = Array.from({ length: data.maxCount }, (_, i) => {
        const user = data.users[i];
        if (user) {
          return {
            slot: i + 1,
            nickname: user.nickname,
            isHost: user.isHost,
            isReady: user.isReady,
            empty: false,
          };
        } else {
          return {
            slot: i + 1,
            empty: true,
          };
        }
      });
  
      setUsers(slotData);
    };
  
    socket.on("room_status", handleRoomStatus);
  
    return () => {
      socket.off("room_status", handleRoomStatus);
    };
  }, [roomId]);

  // join 브로드캐스트
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !roomInfo?.standardPeople) return;
  
    const handleJoinRoom = (data) => {
      console.log("🟢 join_room 수신:", data);
      
      // data.status 기준으로 유저 슬롯 구성
      const updatedSlots = Array.from({ length: roomInfo.standardPeople }, (_, i) => {
        const user = data.status[i];
        if (user) {
          return {
            slot: i + 1,
            nickname: user.nickname,
            isHost: user.isHost,
            isReady: user.isReady,
            empty: false,
          };
        } else {
          return {
            slot: i + 1,
            empty: true,
          };
        }
      });
  
      setUsers(updatedSlots);
    };
    socket.on("join_room", handleJoinRoom);
    return () => {
      socket.off("join_room", handleJoinRoom);
    };
  }, [roomInfo?.standardPeople]);

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
            <RoomUserList users={users} />
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