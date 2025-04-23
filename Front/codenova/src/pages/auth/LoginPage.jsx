import multibg from "../../assets/images/multi_background.png";
import logoImage from "../../assets/images/codenova_logo.png";
import Board from "../../assets/images/board1.jpg";
import loginBtn from "../../assets/images/login_button.png"; // 🎯 로그인 버튼 이미지

const LoginPage = () => {
  return (
    <div
      className="h-screen w-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${multibg})` }}
    >
      {/* 로고 */}
      <img
        src={logoImage}
        alt="CodeNova Logo"
        className="mx-auto pt-10 w-[28rem] z-20 relative"
      />

      {/* 보드 + 입력창 */}
      <div className="relative mx-auto w-[52rem] -mt-16 z-10 rounded-xl overflow-hidden">
        <img src={Board} alt="LoginBoard" className="w-full" />

        {/* 입력창들 */}
        <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[30rem] flex flex-col gap-8">
          {/* ID */}
          <div className="flex items-center gap-x-4">
            <label className="w-[8rem] text-pink-400 text-2xl">ID</label>
            <input
              type="text"
              className="flex-1 px-5 py-3 text-xl bg-transparent border-2 border-pink-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 placeholder:text-pink-300"
              placeholder="Enter your ID"
            />
          </div>

          {/* Password */}
          <div className="flex items-center gap-x-4">
            <label className="w-[8rem] text-pink-400 text-2xl">Password</label>
            <input
              type="password"
              className="flex-1 px-3 py-4 text-xl bg-transparent border-2 border-pink-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 placeholder:text-pink-300"
              placeholder="Enter your password"
            />
          </div>

          {/* 로그인 버튼 */}
          <div className="flex justify-center">
            <img
              src={loginBtn}
              alt="Login Button"
              className="w-[10rem]  cursor-pointer transition-all duration-150 hover:translate-y-[2px] hover:brightness-110 hover:scale-[0.98] active:scale-[0.95]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
