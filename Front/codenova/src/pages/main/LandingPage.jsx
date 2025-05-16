import { useNavigate } from "react-router-dom";
import logoImage from "../../assets/images/codenova_logo.png";
import signupButton from "../../assets/images/signup_button.png";
import loginButton from "../../assets/images/login_button.png";
import multibg from "../../assets/images/multi_background.png";
import guestButton from "../../assets/images/guest_login.png";
import { guestLoginApi } from "../../api/authApi";
import useAuthStore from "../../store/authStore";
import { connectSocket } from "../../sockets/socketClient";
import { useEffect } from "react";

const LandingPage = () => {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login);
  const token = useAuthStore((state) => state.token);
  useEffect(() => {
    if (token) {
      navigate("/main");
    }
  }, [token, navigate]);
  const handleGuestLogin = async () => {
    try {
      const res = await guestLoginApi();
      const accessToken = res.headers["authorization"]?.split(" ")[1];
      const { nickname, userType } = res.data.content;

      if (!accessToken) {
        alert("잘못된 접근 방식입니다!");
        return;
      }

      document.cookie = `accessToken=${accessToken}; path=/; max-age=86400;`;

      login({
        nickname,
        token: accessToken,
        userType: userType || "guest",
      });

      connectSocket();
      navigate("/main");
    } catch (err) {
      console.error(err);
      alert("비회원 로그인 실패!");
    }
  };

  return (
    <div
      className="h-screen w-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${multibg})` }}
    >
      {/* 로고 */}
      <img src={logoImage} alt="CodeNova Logo" className="mx-auto pt-10 w-[30rem]" />

      {/* 버튼 영역 */}
      <div className="flex justify-center gap-10 mt-8">
        <img
          src={signupButton}
          alt="Sign Up"
          className="w-[14rem] cursor-pointer transition-all duration-150 hover:brightness-110 hover:translate-y-[2px] hover:scale-[0.98] active:scale-[0.95]"
          onClick={() => navigate("/auth/signup")}
        />
        <img
          src={loginButton}
          alt="Log In"
          className="w-[14rem] cursor-pointer transition-all duration-150 hover:brightness-110 hover:translate-y-[2px] hover:scale-[0.98] active:scale-[0.95]"
          onClick={() => navigate("/auth/login")} 
        />
        <img
          src={guestButton}
          alt="GuestLogin"
          className="w-[14rem] cursor-pointer transition-all duration-150 hover:brightness-110 hover:translate-y-[2px] hover:scale-[0.98] active:scale-[0.95]"
          onClick={ handleGuestLogin } 
        />
      </div>

      {/* 문구 영역 */}
      <div className="mt-10 text-center font-mono">
        <p className="text-white text-7xl drop-shadow-[2px_2px_0_black]">
          Code like a supernova
        </p>
        <p className="text-6xl mt-4 drop-shadow-[2px_2px_0_black]">
          <span className="text-yellow-400">Fast</span>,{" "}
          <span className="text-lime-400">bright</span>,{" "}
          <span className="text-cyan-400">unstoppable</span>
        </p>
      </div>     

    </div>
  );
};

export default LandingPage;
