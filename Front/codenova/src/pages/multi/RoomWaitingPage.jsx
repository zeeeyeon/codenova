import { useParams, useLocation, useNavigate } from "react-router-dom"; // 라우터의 파라미터 읽어오기
import {useState, useEffect, use} from "react";
import { getSocket } from "../../sockets/socketClient";
import multiBg from "../../assets/images/multi_background.png";
import boardBg from "../../assets/images/board1.jpg";
import lockImg from "../../assets/images/black_lock_icon.png";
import unlockImg from "../../assets/images/black_unlock_icon.png";
import RoomUserList from "../../components/multi/waiting/RoomUserList";
import Header from "../../components/common/Header";
import RoomChatBox from "../../components/multi/waiting/RoomChatBox";
import RoomInfoPanel from "../../components/multi/waiting/RoomInfoPanel";
import useAuthStore from "../../store/authStore";


const RoomWaitingPage = () => {
    const {roomId} = useParams(); // url에 담긴 roomId 읽어오기
    const {state} = useLocation();  // navigate할때 보낸 데이터
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [chatMessages, setChatMessages] = useState([]);  // 입장알림림
    const [showReadyAlert, setShowReadyAlert] = useState(false);
    
    const nickname = useAuthStore((state) => state.user?.nickname);

    const myUser = users.find((u) => u.nickname === nickname);
    const isReady = myUser?.isReady || false;
    const isHost = myUser?.isHost || false;

    
    


    // 나가기
    const handleLeaveRoom = () => {
      const socket = getSocket();
      // console.log("[LEAVE] emit leave_room", {
      //   roomId,
      //   nickname,
      // });
      socket.emit("leave_room", { roomId, nickname });
    
      navigate("/multi");
    };

      // 초기값 사용하기 위함.
      const [roomInfo, setRoomInfo] = useState(() => {
        const initialInfo = state?.roomInfo ?? state; // ✅ 두 경우 모두 대응
        return {
          roomTitle: initialInfo?.roomTitle || "",
          isPublic: initialInfo?.isPublic ?? true,
          language: initialInfo?.language || "Unknown",
          currentPeople: initialInfo?.currentPeople || 1,
          standardPeople: initialInfo?.standardPeople || 4,
          roomCode: initialInfo?.roomCode || "",
        };
      });
    
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
        // console.log("💡 방 업데이트 수신:", updatedRoom);
        setRoomInfo((prev) => ({
          roomTitle: updatedRoom.title,
          isPublic: !updatedRoom.isLocked,
          language: updatedRoom.language,
          currentPeople: updatedRoom.currentCount,
          standardPeople: updatedRoom.maxCount,
          roomCode: updatedRoom.roomCode ?? prev.roomCode,
          status: updatedRoom.isStarted ? "playing" : "waiting"
        }));

        socket.emit("room_status", {
          roomId,
          nickname: state?.nickname,
          roomCode: state?.roomCode
        });
      }
    };

    socket.on("room_update", handleRoomUpdate);
    return () => socket.off("room_update", handleRoomUpdate);
  }, [roomId]);

  
  // 방 최초초 입장시 room_status 요청
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
      // console.log("✅ room_status 응답 수신:", data);
  
      // roomInfo 세팅 (추가로 방 정보도 최신화)
      setRoomInfo((prev) => ({
        ...prev,
        roomTitle: data.roomTitle,
        isPublic: !data.isLocked,
        language: data.language,
        currentPeople: data.currentCount,
        standardPeople: data.maxCount,
        roomCode: data.roomCode ?? prev.roomCode,
        status: data.isStarted ? "playing" : "waiting"
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
      // console.log("🟢 join_room 수신:", data);
      
      // data.status 기준으로 유저 슬롯 구성
      const updatedSlots = Array.from({ length: 4 }, (_, i) => {
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

  // join_notice 브로드캐스트
  useEffect(() => {
  const socket = getSocket();
  if (!socket) return;

  const handleJoinNotice = (data) => {
    // console.log("📢 join_notice 수신:", data);
    setChatMessages((prev) => [...prev, { type: "notice", text: data.message }]);
  };

  socket.on("join_notice", handleJoinNotice);
  return () => socket.off("join_notice", handleJoinNotice);
}, []);


// leave_notice 브로드캐스트
useEffect(() => {
  const socket = getSocket();
  if (!socket) return;

  const handleLeaveNotice = (data) => {
    // console.log("📤 leave_notice 수신:", data);
    setChatMessages((prev) => [...prev, { type: "notice", text: data.message }]);
  };

  socket.on("leave_notice", handleLeaveNotice);
  return () => socket.off("leave_notice", handleLeaveNotice);
}, []);

// 대기방 채팅 

const handleSendMessage = (messageText) => {
  const socket = getSocket();
  if (!socket || !nickname || !roomId) return;

  const messageData = {
    roomId,
    nickname,
    message: messageText.text,
  };

  // console.log("📫emit send_chat : ", messageData);
  socket.emit("send_chat", messageData);
};

useEffect(() => {
  const socket = getSocket();
  if (!socket) return;

  const handleReceiveChat = (data) => {
    // console.log("send_chat 수신 :", data);
    setChatMessages((prev) => [
      ...prev,
      {
        type : "chat",
        text: `${data.nickname}: ${data.message}`,
        timestamp: data.timestamp,
      },
    ]);
  };

  socket.on("send_chat", handleReceiveChat);
  return () => socket.off("send_chat", handleReceiveChat);
}, []);

const handleReadyToggle = () => {
  const socket = getSocket();
  if (!socket || !nickname || !roomId) return;


  // console.log("📤 emit start:", { roomId, nickname });
  socket.emit("ready", {
    roomId,
    nickname
  });
};

useEffect(() => {
  const socket = getSocket();
  if (!socket) return;

  const handleReadyStatusUpdate = (data) => {
    // console.log("🧪 ready_status_update 수신:", data);

    const newUsers = Array.from({ length: 4 }, (_, i) => {
      const user = data.users[i];
      return user
        ? {
            slot: i + 1,
            nickname: user.nickname,
            isHost: user.isHost,
            isReady: user.isReady,
            empty: false,
          }
        : {
            slot: i + 1,
            empty: true,
          };
    });

    setUsers(newUsers); // 상태 반영

    // 준비 인원 확인은 여기서 해야 함!
    const readyCount = newUsers.filter(u => !u.empty && u.isReady).length;
    const totalCount = newUsers.filter(u => !u.empty).length;

    if (readyCount === totalCount && totalCount > 1) {
      setChatMessages(prev => [
        ...prev,
        {
          type: "notice",
          text: "모든 플레이어가 준비되었습니다. 방장님은 게임을 시작할 수 있어요!",
        }
      ]);

      setShowReadyAlert(true);
      setTimeout(() => setShowReadyAlert(false), 4000);
    }
  };

  socket.on("ready_status_update", handleReadyStatusUpdate);
  return () => socket.off("ready_status_update", handleReadyStatusUpdate);
}, [roomInfo.standardPeople]);


const handleStartGame = () => {
  const socket = getSocket();
  if (!socket || !nickname || !roomId) return;

  // console.log("🎮 emit start_game", { roomId, nickname });
  socket.emit("start_game", { roomId, nickname });
};

useEffect(() => {
  const socket = getSocket();
  if (!socket) return;

  const handleGameStarted = (data) => {
    // console.log("🎮 수신된 이벤트: game_started", data);
    // console.log("📦 navigate 직전 users 상태:", users);
    if (String(data.roomId) === String(roomId)) {
      navigate(`/multi/game/${roomId}`);
    }
  };

  socket.on("game_started", handleGameStarted);
  return () => socket.off("game_started", handleGameStarted);
}, [roomId, navigate]);

useEffect(() => {
  const handlePopState = (event) => {
    // confirm 대화 상자 사용 (확인/취소 버튼 모두 제공)
    const isConfirmed = window.confirm("방을 나가시겠습니까?");

    if (isConfirmed) {
      // 사용자가 '확인'을 클릭한 경우
      handleLeaveRoom();
      // console.log("🚪 [뒤로가기] 방 나감 처리 시작");
    } else {
      // 사용자가 '취소'를 클릭한 경우
      // 현재 URL 상태를 다시 푸시하여 브라우저 히스토리에 추가
      window.history.pushState({ page: "multi" }, "", window.location.pathname);
      // console.log("🔙 [뒤로가기] 취소됨, 방에 머무름");
    }
  };

  // 현재 history 상태 저장
  window.history.pushState({ page: "multi" }, "", window.location.pathname);

  // 이벤트 리스너 등록
  window.addEventListener("popstate", handlePopState);

  return () => {
    window.removeEventListener("popstate", handlePopState);
  };
}, [nickname]);

// 새로고침 막음
useEffect(() => {
  const handleKeyDown = (e) => {
    // F5 키 또는 Ctrl+R 눌렀을 때
    if (e.key === "F5" || (e.ctrlKey && e.key === "r")) {
      e.preventDefault();
      e.stopPropagation();
      alert("새로고침은 사용할 수 없습니다.");
    }
  };

  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, []);




    return (
        <div
            className="w-screen h-screen bg-cover bg-center bg-no-repeat overflow-hidden relative"
            style={{ backgroundImage: `url(${multiBg})` }}
        >
            {/* <Header /> */}

            {showReadyAlert && (
              <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50">
                <div className="bg-green-500 text-white font-semibold py-3 px-6 rounded-full shadow-lg animate-bounce transition-all duration-500">
                  모든 플레이어가 준비 완료! 방장님, 게임을 시작해주세요!
                </div>
              </div>
            )}

        <div className="absolute top-[50%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[72rem] max-w-[1300px] aspect-[4/3] bg-contain bg-no-repeat bg-center relative flex flex-col items-center justify-start pt-[6.5%] rounded-2xl">
                <img
                  src={boardBg}
                  alt="board"
                  className="absolute object-cover rounded-2xl z-0"
        />

        <div className="relative z-10 flex items-center gap-1 mt-5">
            <img
              src={roomInfo.isPublic ? unlockImg : lockImg}
              alt={roomInfo.isPublic ? "공개방" : "비공개방"}
              className="w-6 h-6 mb-2"
            />
            <h2 className="text-2xl font-bold">{roomInfo.roomTitle}</h2>
          </div>
          {/* 사용자 리스트 */}
          <div className="w-full flex justify-center mt-10">
            <RoomUserList users={users} />
          </div>

          {/* 채팅박스 */}
          <div className="w-[90%] flex justify-start items-start gap-6 z-10 pl-6">
            <RoomChatBox 
                messages={chatMessages}
                onSendMessage={handleSendMessage}
                />
            <RoomInfoPanel 
              isPublic={roomInfo.isPublic}
              roomTitle={roomInfo.roomTitle}
              language={roomInfo.language}
              currentPeople={roomInfo.currentPeople}
              standardPeople={roomInfo.standardPeople}
              roomCode={roomInfo.roomCode}
              onLeave={handleLeaveRoom}
              onReady={handleReadyToggle}
              isHost={isHost}
              isReady={isReady}
              allReady={users.filter((u) => !u.empty && u.isReady).length === users.filter((u) => !u.empty).length}
              onStart={handleStartGame}
              canstart={
                isHost &&
                users.filter((u) => !u.empty && u.nickname !== nickname).every((u) => u.isReady) &&
                users.filter((u) => !u.empty).length >= 2
              }
            />
          </div>
                </div>
                </div>
            );
};

export default RoomWaitingPage;