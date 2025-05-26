import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainPage from "./pages/main/MainPage";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import SingleRoutes from "./routes/SingleRoutes";
import MultiRoutes from "./routes/MultiRoutes";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/main/*" element={<MainPage />} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/signup" element={<SignupPage />} />
        <Route path="/single/*" element={<SingleRoutes />} />
        <Route path="/multi/*" element={<MultiRoutes />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
