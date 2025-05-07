import React, { useState } from "react";
import RoomItem from "../multi/RoomItem";



const RoomList = ({rooms, onEnterClick}) => {

    return (
        <div className="grid grid-cols-3 gap-x-12 gap-y-5 items-start justify-items-center mt-4 px-3
        max-h-[90%] overflow-y-auto custom-scrollbar">
          
          {rooms.map((room) => (
            <RoomItem key={room.id} room={room} onEnterClick={onEnterClick}/>
          ))}

    
        </div>
    );
};

export default RoomList;