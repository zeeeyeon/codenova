import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainPage from "./pages/main/MainPage";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import SingleRoutes from "./routes/SingleRoutes";
import MultiRoutes from "./routes/MultiRoutes";
import LandingPage from "./pages/main/LandingPage";
import MeteoRoutes from "./routes/MeteoRoutes";
import MyPageRoutes from "./routes/MyPageRoutes";

function App() {
  return (
    <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage/>} />
          <Route path="/main/*" element={<MainPage />} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/signup" element={<SignupPage />} />
          <Route path="/single/*" element={<SingleRoutes />} />
          <Route path="/multi/*" element={<MultiRoutes />} />
          <Route path="/meteo/*" element={<MeteoRoutes />} />
          <Route path="/mypage/*" element={<MyPageRoutes />} />
        </Routes>
    </BrowserRouter>
  );
}

export default App;