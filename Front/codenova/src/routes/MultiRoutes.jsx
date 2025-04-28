import { Routes, Route } from "react-router-dom";
import MultiPage from "../pages/multi/MultiPage";
import RoomWaitingPage from "../pages/multi/RoomWaitingPage";

const MultiRoutes = () => {
  return (
    <Routes>
        {/* 예시임 그냥 */}
      <Route path="" element={<MultiPage />} />
      <Route path="room/:roomId" element={<RoomWaitingPage />} /> 
    </Routes>
  );
};

export default MultiRoutes;
