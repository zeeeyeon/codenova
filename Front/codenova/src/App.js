import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainPage from "./pages/main/MainPage";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import SingleRoutes from "./routes/SingleRoutes";
import MultiRoutes from "./routes/MultiRoutes";

function App() {
  return (
    <BrowserRouter>
        <Routes>
          <Route path="/" element={<h2 className="text-xl">Landing Page</h2>} />
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