import React, { useState } from "react";
import RoomItem from "../multi/RoomItem";


// 더미데이터
const dummyRooms = [
    { id : 1, title: "찡이방 한판뜨자!", roomCode: "ABCD12",currentPeople: 2, standardPeople: 4, language : "Python", isPublic: false, status: "waiting"},
    { id : 2, title: "아무나 들어오셈!", roomCode: "XYZ789",currentPeople: 1, standardPeople: 2, language : "Java", isPublic: true, status: "waiting"},
    { id : 3, title: "다함께 코드노바!", roomCode: "XYZ789",currentPeople: 2, standardPeople: 2, language : "JavaScript", isPublic: false, status: "playing"},
    { id : 4, title: "아무나 들어오셈!", roomCode: "XYZ789",currentPeople: 1, standardPeople: 2, language : "JavaScript", isPublic: true, status: "playing"},
    { id : 5, title: "아무나 들어오셈!", roomCode: "XYZ789",currentPeople: 1, standardPeople: 2, language : "JavaScript", isPublic: false, status: "waiting"},
    { id : 6, title: "아무나 들어오셈!", roomCode: "XYZ789",currentPeople: 2, standardPeople: 2, language : "JavaScript", isPublic: false, status: "playing"},
    { id : 7, title: "아무나 들어오셈!", roomCode: "XYZ789",currentPeople: 2, standardPeople: 2, language : "JavaScript", isPublic: false, status: "playing"},
]


const RoomList = ({onEnterClick}) => {

  

    return (
        <div className="grid grid-cols-3 gap-x-11 gap-y-5 items-start justify-items-center mt-6 px-3
        max-h-[90%] overflow-y-auto custom-scrollbar">
          
          {dummyRooms.map((room) => (
            <RoomItem key={room.id} room={room} onEnterClick={onEnterClick}/>
          ))}

    
        </div>
    );
};

export default RoomList;