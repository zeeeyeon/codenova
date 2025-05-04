import { Routes, Route } from "react-router-dom";
import MeteoLandingPage from "../pages/meteo/MeteoLandingPage";
import MeteoGamePage from "../pages/meteo/MeteoGamePage";

const MeteoRoutes = () => {
  return (
    <div className="w-full h-full">
        <Routes>
          <Route path="landing" element={<MeteoLandingPage />} />
          <Route path="game" element={<MeteoGamePage />} />
        </Routes>
    </div>
  );
};

export default MeteoRoutes;
