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

const MeteoLandingPage = () => {
    const location = useLocation();
    const roomCode = location.state?.roomCode;
    const navigate = useNavigate();

    const profileImages = [Profile1, Profile2, Profile3, Profile4];

    useEffect(() => {
    if (!roomCode) {
        alert("방코드가 없습니다.");
        navigate("/meteo/main");
    }

    if (location.state?.players) {
        const players = location.state.players;
        const newUsers = Array(4).fill(null);
        players.forEach((player, idx) => {
        if (idx < 4) {
            newUsers[idx] = { nickname: player.nickname };
        }
        });
        setUsers(newUsers);
    }

    // 방 처음 진입했을 때
    socket.once("secretRoomJoin", (roomData) => {
        console.log("🛰️ [secretRoomJoin 수신]", roomData);
        const newUsers = Array(4).fill(null);
        roomData.players.forEach((player, idx) => {
        if (idx < 4) {
            newUsers[idx] = { nickname: player.nickname };
        }
        });
        setUsers(newUsers);
    });

    // 다른 사람이 새로 들어올 때
    socket.on("JoinSecretRoomBroadcast", (roomData) => {
        console.log("🛰️ [JoinSecretRoomBroadcast 수신]", roomData);
        const newUsers = Array(4).fill(null);
        roomData.players.forEach((player, idx) => {
        if (idx < 4) {
            newUsers[idx] = { nickname: player.nickname };
        }
        });
        setUsers(newUsers);
    });

    return () => {
        socket.off("JoinSecretRoomBroadcast");
    };
    }, [roomCode, navigate, location.state]);


    // user 실시간 업뎃 배열
    const [users, setUsers] = useState([null, null, null, null]);

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


            {/* ✅ 하단 레이아웃: 채팅 + 방코드/버튼 */}
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