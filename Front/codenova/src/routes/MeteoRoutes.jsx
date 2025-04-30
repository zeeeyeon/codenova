import { Routes, Route } from "react-router-dom";
import MeteoLandingPage from "../pages/meteo/MeteoLandingPage";
import MeteoGamePage from "../pages/meteo/MeteoGamePage";
import ErrorBoundary from "../components/ErrorBoundary";

const MeteoRoutes = () => {
  return (
    <div className="w-full h-full">
      <ErrorBoundary>
        <Routes>
          <Route path="landing" element={<MeteoLandingPage />} />
          <Route path="game" element={<MeteoGamePage />} />
        </Routes>
      </ErrorBoundary>
    </div>
  );
};

export default MeteoRoutes;
