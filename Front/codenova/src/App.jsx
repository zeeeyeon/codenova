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
import RankingRoutes from "./routes/RankingRoutes";
import { connectSocket, disconnectSocket } from "./sockets/socketClient";
import { useEffect} from "react";
import PrivateRoute from "./routes/PrivateRoute";
import { preventDevTool } from "./components/common/preDevTool";
import { useSessionStore } from "./store/useSessionStore";

function App() {
  const userType = useAuthStore((state) => state.user?.userType);
  const isAuthenticated = useAuthStore((state) => !!state.token);

  useEffect(() => {
    if (isAuthenticated) {
      // 로그인 직후 혹은 복구 직후
      // console.log("🟢 Authenticated → connect socket");
      connectSocket();
      if (userType === "member") {
        useSessionStore.getState().initSessionFromStorage();
      }
    } else {
      // 로그아웃 직후
      // console.log("🔴 Not authenticated → disconnect socket");
      disconnectSocket();
      useSessionStore.getState().clearSession();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    preventDevTool();
  }, [])



  return (
    <BrowserRouter>
    {/* <ErrorBoundary> */}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/signup" element={<SignupPage />} />

        {/* 🔐 보호된 라우트 */}
        <Route
          path="/main/*"
          element={
            <PrivateRoute>
              <MainPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/single/*"
          element={
            <PrivateRoute>
              <SingleRoutes />
            </PrivateRoute>
          }
        />
        <Route
          path="/multi/*"
          element={
            <PrivateRoute>
              <MultiRoutes />
            </PrivateRoute>
          }
        />
        <Route
          path="/meteo/*"
          element={
            <PrivateRoute>
              <MeteoRoutes />
            </PrivateRoute>
          }
        />
        <Route
          path="/mypage/*"
          element={
            <PrivateRoute>
              <MyPageRoutes />
            </PrivateRoute>
          }
        />
        <Route
          path="/ranking/*"
          element={
            <PrivateRoute>
              <RankingRoutes />
            </PrivateRoute>
          }
        />
      </Routes>
    {/* </ErrorBoundary> */}
    </BrowserRouter>
  );
}

export default App;
