import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainPage from "./pages/main/MainPage";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import SingleRoutes from "./routes/SingleRoutes";
import MultiRoutes from "./routes/MultiRoutes";
import LandingPage from "./pages/main/LandingPage";
import MeteoRoutes from "./routes/MeteoRoutes";
import MyPageRoutes from "./routes/MyPageRoutes";
import useAuthStore from "./store/authStore";
import { connectSocket, disconnectSocket } from "./sockets/socketClient";
import { useEffect, useRef } from "react";

function App() {
  const isAuthenticated = useAuthStore((state) => !!state.token);

  useEffect(() => {
    if (isAuthenticated) {
      // 로그인 직후 혹은 복구 직후
      console.log("🟢 Authenticated → connect socket");
      connectSocket();
    } else {
      // 로그아웃 직후
      console.log("🔴 Not authenticated → disconnect socket");
      disconnectSocket();
    }
  }, [isAuthenticated]);

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