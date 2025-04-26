import logoImage from "../../assets/images/codenova_logo.png";
import Board from "../../assets/images/board1.jpg";
import multibg from "../../assets/images/multi_background.png";
import signupBtn from "../../assets/images/signup_button.png"; // 🎯 버튼 이미지 import
import { signupApi } from "../../api/authApi";
import { useState } from "react";

const SignupPage = () => {

  const [id, setId] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다!");
      return;
    }

    try {
      await signupApi({ id, nickname, password });
      alert("회원가입 성공!");
    } catch (err) {
      console.error(err);
      alert("회원가입 실패!");
    }
  };

  return (
    <div
      className="relative h-screen w-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${multibg})` }}
    >
      {/* 로고 */}
      <img
        src={logoImage}
        alt="CodeNova Logo"
        className="mx-auto pt-5 w-[24rem] z-20 relative"
      />

      {/* 보드 + 입력창 */}
      <div className="relative mx-auto w-[52rem] -mt-16 z-10 rounded-xl overflow-hidden">
        <img src={Board} alt="SignupBoard" className="w-full" />

        {/* 입력창들 */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[30rem] flex flex-col gap-6">

          {/* ID */}
          <div className="flex items-center gap-x-4">
            <label className="w-[8rem] text-pink-400 text-2xl">ID</label>
            <input
              type="text"
              className="flex-1 px-5 py-3 bg-transparent border-2 border-pink-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 placeholder:text-pink-300"
              placeholder="Enter your ID"
            />
          </div>

          {/* Nickname */}
          <div className="flex items-center gap-x-4">
            <label className="w-[8rem] text-pink-400 text-2xl">Nickname</label>
            <input
              type="text"
              className="flex-1 px-5 py-3 bg-transparent border-2 border-pink-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 placeholder:text-pink-300"
              placeholder="Enter your nickname"
            />
          </div>

          {/* Password */}
          <div className="flex items-center gap-x-4">
            <label className="w-[8rem] text-pink-400 text-2xl">Password</label>
            <input
              type="password"
              className="flex-1 px-5 py-3 bg-transparent border-2 border-pink-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 placeholder:text-pink-300"
              placeholder="Enter your password"
            />
          </div>

          {/* Confirm Password */}
          <div className="flex items-center gap-x-4">
            <label className="w-[8rem] text-pink-400 text-2xl">Confirm</label>
            <input
              type="password"
              className="flex-1 px-5 py-3 bg-transparent border-2 border-pink-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 placeholder:text-pink-300"
              placeholder="Re-enter password"
            />
          </div>

          {/* 버튼 */}
          <div className="flex justify-center">
          <img
            src={signupBtn}
            alt="Sign Up Button"
            className="w-[10rem] -mt-4 cursor-pointer hover:brightness-110 transition-all duration-150 hover:translate-y-[2px] active:translate-y-[4px]"
            onClick={handleSignup}
          />
          </div>
        </div>

      </div>
    </div>
  );
};

export default SignupPage;
