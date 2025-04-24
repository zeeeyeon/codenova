import { Routes, Route } from "react-router-dom";
import MeteoLandingPage from "../pages/meteo/MeteoLandingPage";

const MeteoRoutes = () => {
  return (
    <div className="w-full h-full">
      <Routes>
        <Route path="landing" element={<MeteoLandingPage />} />
      </Routes>
    </div>
  );
};

export default MeteoRoutes;
