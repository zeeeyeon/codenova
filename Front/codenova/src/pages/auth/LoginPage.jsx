import multibg from "../../assets/images/multi_background.png";
import logoImage from "../../assets/images/codenova_logo.png";
import Board from "../../assets/images/board1.jpg";
import loginBtn from "../../assets/images/login_button.png"; // 🎯 로그인 버튼 이미지
import { useState } from "react";
import { loginApi } from "../../api/authApi";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";

const LoginPage = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const response = await loginApi({ id, password })
      console.log(response)
      const rawToken = response.headers['authorization'];
      if (!rawToken) {
        alert("토큰이 없습니다!");
        return;
      }
  
      const accessToken = rawToken.split(' ')[1]
      document.cookie = `accessToken=${accessToken}; path=/; max-age=86400;`;

      login({
        user: { id }, 
        token: accessToken,
      });
  
      navigate("/main")
    } catch (err) {
      console.error(err)
      alert("로그인 실패!")
    }
  }
  
  

  return (
    <div
      className="h-screen w-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${multibg})` }}
    >
      {/* 로고 */}
      <img
        src={logoImage}
        alt="CodeNova Logo"
        className="mx-auto pt-10 w-[24rem] z-20 relative"
      />

      {/* 보드 + 입력창 */}
      <div className="relative mx-auto w-[44rem] -mt-16 z-10 rounded-xl overflow-hidden">
        <img src={Board} alt="LoginBoard" className="w-full" />

        {/* 입력창들 */}
        <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[30rem] flex flex-col gap-8">
          {/* ID */}
          <div className="flex items-center gap-x-4">
            <label className="w-[8rem] text-pink-400 text-2xl">ID</label>
            <input
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
              className="flex-1 px-3 py-3 text-xl bg-transparent border-2 border-pink-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 placeholder:text-pink-300"
              placeholder="Enter your ID"
            />
          </div>

          {/* Password */}
          <div className="flex items-center gap-x-4">
            <label className="w-[8rem] text-pink-400 text-2xl">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 px-3 py-4 text-xl bg-transparent border-2 border-pink-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 placeholder:text-pink-300"
              placeholder="Enter your password"
            />
          </div>

          {/* 로그인 버튼 */}
          <div className="flex justify-center">
            <img
              src={loginBtn}
              alt="Login Button"
              onClick={handleLogin}
              className="w-[10rem]  cursor-pointer transition-all duration-150 hover:translate-y-[2px] hover:brightness-110 hover:scale-[0.98] active:scale-[0.95]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
