import React from "react";
import RoomItem from "../multi/RoomItem";

// 더미데이터
const dummyRooms = [
    { id : 1, title: "찡이방 한판뜨자!", currentPeople: 2, standardPeople: 4, language : "Python", isPublic: true, status: "waiting"},
    { id : 2, title: "아무나 들어오셈!", currentPeople: 1, standardPeople: 2, language : "Java", isPublic: false, status: "waiting"},
    { id : 3, title: "아무나 들어오셈!", currentPeople: 2, standardPeople: 2, language : "JavaScript", isPublic: false, status: "playing"},
]


const RoomList = () => {
    return (
        <div className="flex flex-col gap-4 items-center mt-4">
        {dummyRooms.map((room) => (
        <RoomItem key={room.id} room={room} />
      ))}
    </div>
    );
};

export default RoomList;