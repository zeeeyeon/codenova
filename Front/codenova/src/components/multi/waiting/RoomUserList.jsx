import React from "react";
import RoomUserCard from "./RoomUserCard";

const RoomUserList = ({ users }) => {
  return (
    <div className="grid grid-cols-4 gap-6 ">
      {users.map((user, index) => (
        <RoomUserCard key={index} user={user} />
      ))}
    </div>
  );
};

export default RoomUserList;
