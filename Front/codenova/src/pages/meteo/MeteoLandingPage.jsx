import React, { useEffect, useState } from "react"
import MeteoBg from "../../assets/images/meteo_bg.png"
import Header from "../../components/common/Header"
import MeteoBoard from "../../assets/images/board1.jpg"
import UserBoard from "../../assets/images/board2.jpg"
import { useLocation, useNavigate } from "react-router-dom";
import Profile1 from "../../assets/images/profile1.png"
import Profile2 from "../../assets/images/profile2.png"
import Profile3 from "../../assets/images/profile3.png"
import Profile4 from "../../assets/images/profile4.png"
import socket from "../../sockets/socketClient"
import useAuthStore from "../../store/authStore"

const MeteoLandingPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { roomCode, roomId, players } = location.state || {};
    const [users, setUsers] = useState([null, null, null, null]);
    const profileImages = [Profile1, Profile2, Profile3, Profile4];
    const nickname = useAuthStore((state) => state.user?.nickname);
  
    const updateUsersFromPlayers = (playersArray) => {
      const updated = Array(4).fill(null);
      playersArray.forEach((player, idx) => {
        if (idx < 4) {
          updated[idx] = { nickname: player.nickname };
        }
      });
      setUsers(updated);
    };
  
    useEffect(() => {
      if (!roomCode || !nickname) {
        alert("방 정보가 없습니다. 메인으로 이동합니다.");
        navigate("/meteo/main");
        return;
      }
  
      // ⭐ 최초 입장했을 때
      if (players) {
        updateUsersFromPlayers(players);
      }
  
      // ⭐ 서버가 보내주는 players 업데이트 수신 (secretRoomJoin)
      const handleSecretRoomJoin = (roomData) => {
        console.log("🛰️ [secretRoomJoin 수신]", roomData);
        updateUsersFromPlayers(roomData.players);
      };
  
      socket.on("secretRoomJoin", handleSecretRoomJoin);
  
      // ⭐ 새로고침했을 때 재입장
      socket.on("connect", () => {
        console.log("🌐 소켓 재연결됨. 방 재조인 시도");
        const savedRoomCode = localStorage.getItem("meteoRoomCode");
        if (savedRoomCode && nickname) {
          socket.emit("joinSecretRoom", { roomCode: savedRoomCode, nickname });
        }
      });
  
      return () => {
        socket.off("secretRoomJoin", handleSecretRoomJoin);
        socket.off("connect");
      };
    }, [roomCode, nickname, players, navigate]);
  
    useEffect(() => {
      if (roomCode && roomId) {
        localStorage.setItem("meteoRoomCode", roomCode);
        localStorage.setItem("meteoRoomId", roomId);
      }
    }, [roomCode, roomId]);

    return (
        <div
            className="w-screen h-screen bg-cover bg-center bg-no-repeat overflow-hidden relative"
            style={{
            backgroundImage: `url(${MeteoBg})`,
            }}>
        <Header/>
        
        <div className="relative flex justify-center items-center mt-28">
        <img src={MeteoBoard} className="w-[66rem] rounded-2xl shadow-xl z-0" alt="meteoBoard"/>
        <div className="absolute top-[2%] left-1/2 -translate-x-1/2 z-20 text-1C1C1C text-3xl font-bold">
        지구를 지켜라!
        </div>


        <div className="absolute top-[15%] grid grid-cols-4 gap-9 z-10">
        {users.map((user, idx) => (
            <div key={idx} className="relative w-48 h-auto">
            <img
                src={UserBoard}
                alt={`user-board-${idx}`}
                className="w-full h-auto rounded-xl shadow-md"
            />

            <div className="absolute top-1 left-1/2 transform -translate-x-1/2 text-black text-xl">
                No.{idx + 1}
            </div>

            <img
                src={profileImages[idx]}
                alt={`user-profile-${idx}`}
                className="absolute top-12 left-1/2 transform -translate-x-1/2 w-14 h-auto"
            />

            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-m">
                {user ? user.nickname : "-"}
            </div>
            </div>
        ))}
        </div>


        {/* 채팅 + 방코드/버튼 */}
        <div className="flex absolute top-[50%] gap-6">
            {/* 채팅 영역 */}
            <div
            className="w-[44rem] h-[13rem] border-4 rounded-xl"
            style={{ borderColor: "#01FFFE" }}
            ></div>

            {/* 방코드 + 버튼 영역 */}
            <div className="flex flex-col gap-4">
            <div
                className="w-[10rem] h-[8rem] border-4 rounded-xl flex flex-col items-center justify-center text-white text-2xl"
                style={{ borderColor: "#01FFFE" }}
            >
            <p className="text-xl mb-1">방코드</p> 
            <p className="text-3xl">{roomCode ? roomCode : "없음"}</p> 
            </div>

            <div
                className="w-[10rem] h-[3.5rem] border-4 rounded-xl flex items-center justify-center"
                style={{ borderColor: "#01FFFE" }}
            ></div>
            </div>
                

        </div>
    </div>



    </div>
    )
}

export default MeteoLandingPage