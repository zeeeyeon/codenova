import { Routes, Route } from "react-router-dom";
import MultiPage from "../pages/multi/MultiPage";
import RoomWaitingPage from "../pages/multi/RoomWaitingPage";
import TypingBattlePage from "../pages/multi/TypingBattlePage";

const MultiRoutes = () => {
  return (
    <Routes>
        {/* 예시임 그냥 */}
      <Route path="" element={<MultiPage />} />
      <Route path="room/:roomId" element={<RoomWaitingPage />} /> 
      <Route path="game/:roomId" element={<TypingBattlePage />} />
    </Routes>
  );
};

export default MultiRoutes;
