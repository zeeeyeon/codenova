import React from "react";

const RoomItem = ({ room }) => {
    return (
      <div className="w-[600px] bg-white bg-opacity-90 rounded-xl px-6 py-4 shadow-md flex justify-between items-center hover:scale-[1.02] transition">
        <div>
          <div className="text-xl font-bold text-[#333]">{room.title}</div>
          <div className="text-sm text-gray-600">
            {room.language} · {room.currentPeople}/{room.standardPeople}명 · {room.isPublic ? "공개" : "비공개"}
        </div>
        </div>
        <button className="px-4 py-2 bg-fuchsia-500 text-white rounded-md hover:bg-fuchsia-600 transition">
          입장
        </button>
      </div>
    );
  };
  
  export default RoomItem;