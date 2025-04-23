import { useNavigate } from "react-router-dom";
import logoImage from "../../assets/images/codenova_logo.png";
import signupButton from "../../assets/images/signup_button.png";
import loginButton from "../../assets/images/login_button.png";
import multibg from "../../assets/images/multi_background.png";
const LandingPage = () => {
  const navigate = useNavigate()
  return (
    <div
      className="h-screen w-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${multibg})` }}
    >
      {/* 로고 */}
      <img src={logoImage} alt="CodeNova Logo" className="mx-auto pt-10 w-[40rem]" />

      {/* 버튼 영역 */}
      <div className="flex justify-center gap-10 mt-12">
        <img
          src={signupButton}
          alt="Sign Up"
          className="w-[16rem] cursor-pointer transition-all duration-150 hover:brightness-110 hover:translate-y-[2px] hover:scale-[0.98] active:scale-[0.95]"
          onClick={() => navigate("/auth/signup")}
        />
        <img
          src={loginButton}
          alt="Log In"
          className="w-[16rem] cursor-pointer transition-all duration-150 hover:brightness-110 hover:translate-y-[2px] hover:scale-[0.98] active:scale-[0.95]"
          onClick={() => navigate("/auth/login")} 
        />
      </div>
    </div>
  );
};

export default LandingPage;
