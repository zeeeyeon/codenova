import { Routes, Route } from "react-router-dom";
import MultiPage from "../pages/multi/MultiPage";

const MultiRoutes = () => {
  return (
    <Routes>
        {/* 예시임 그냥 */}
      <Route path="" element={<MultiPage />} />
    </Routes>
  );
};

export default MultiRoutes;
