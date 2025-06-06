import logoImage from "../../assets/images/codenova_logo.png";
import Board from "../../assets/images/board1.jpg";
import multibg from "../../assets/images/multi_background.png";
import signupBtn from "../../assets/images/signup_button.png"; // 🎯 버튼 이미지 import
import { signupApi } from "../../api/authApi";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkIdApi, checkNicknameApi } from "../../api/authApi";
import useAuthStore from "../../store/authStore";
import { useEffect } from "react";
import goLanding from "../../assets/images/golanding.png";
const SignupPage = () => {
  const navigate = useNavigate();
  const [id, setId] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [idCheck, setIdCheck] = useState(null);
  const [nicknameCheck, setNicknameCheck] = useState(null);
  const token = useAuthStore((state) => state.token);
  // console.log("🔑 [토큰]", token);
  useEffect(() => {
    if (token) {
      navigate("/main");
    }
  }, [token, navigate]);
  const handleIdCheck = async () => {
    if (!id) {
      alert("ID를 입력하세요!");
      return;
    }
    try {
      const response = await checkIdApi({ id });
      const { code, message } = response.data.status;
  
      if (code === 200) {
        setIdCheck(true);
        alert("사용 가능한 ID입니다!");
      } else {
        setIdCheck(false);
        alert(message || "ID 중복입니다!");
      }
    } catch (err) {
      // console.error(err);
      alert("서버 에러입니다.");
    }
  };

  const handleNicknameCheck = async () => {
    if (!nickname) {
      alert("닉네임을 입력하세요!");
      return;
    }
    try {
      const response = await checkNicknameApi({ nickname });
      const { code, message } = response.data.status;
  
      if (code === 200) {
        setNicknameCheck(true);
        alert("사용 가능한 닉네임입니다!");
      } else {
        setNicknameCheck(false);
        alert(message || "닉네임 중복입니다!");
      }
    } catch (err) {
      // console.error(err);
      alert("서버 에러입니다.");
    }
  };
  const handleSignup = async () => {
    if (password !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다!");
      return;

    }if (idCheck !== true) {
      alert("ID 중복 확인을 완료해주세요!");
      return;
    }
    
    if (nicknameCheck !== true) {
      alert("닉네임 중복 확인을 완료해주세요!");
      return;
    }
    

    try {
      await signupApi({ id, nickname, password });
      alert("회원가입 성공!");
      navigate("/auth/login");
    } catch (err) {
      // console.error(err);
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
              value={id}
              onChange={(e) => {
                const value = e.target.value;
                const onlyEngNum = /^[a-zA-Z0-9]*$/;
                if (onlyEngNum.test(value)) {
                  setId(value);
                  setIdCheck(null);
                } else {
                  // alert("영문자와 숫자만 입력할 수 있습니다.");
                }
              }}
              className="flex-1 px-5 py-3 text-sm bg-transparent border-2 border-pink-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 placeholder:text-pink-300"
              placeholder="영문자와 숫자만 입력할 수 있습니다"
            />
            <button
              onClick={handleIdCheck}
              className="active:scale-95 text-sm max-w-[2rem] text-white"
              style={{ fontSize: '13px' }}
            >
              {idCheck === true ? '✔' : '중복체크'}
            </button>

          </div>

          {/* Nickname */}
          <div className="flex items-center gap-x-4">
            <label className="w-[8rem] text-pink-400 text-2xl">Nickname</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 11) {
                  setNickname(value);
                  setNicknameCheck(null);
                }
              }}
              className="flex-1 text-sm px-5 py-3 bg-transparent border-2 border-pink-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 placeholder:text-pink-300"
              placeholder="11자 내로 닉네임을 입력하세요"
            />
            <button
              onClick={handleNicknameCheck}
              className="active:scale-95 text-sm max-w-[2rem] text-white"
              style={{ fontSize: '13px' }}
            >
              {nicknameCheck === true ? '✔' : '중복체크'}
            </button>

          </div>

          {/* Password */}
          <div className="flex items-center gap-x-4">
            <label className="w-[8rem] text-pink-400 text-2xl">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 px-5 py-3 bg-transparent border-2 border-pink-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 placeholder:text-pink-300"
              placeholder="Enter your password"
            />
          </div>

          {/* Confirm Password */}
          <div className="flex items-center gap-x-4">
            <label className="w-[8rem] text-pink-400 text-2xl">Confirm</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="flex-1 px-5 py-3 bg-transparent border-2 border-pink-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 placeholder:text-pink-300"
              placeholder="Re-enter password"
            />
          </div>

          {/* 버튼 */}
          <div className="flex justify-center gap-12">
          <img
            src={signupBtn}
            role="button"
            alt="Sign Up Button"
            className="w-[10rem] -mt-4 cursor-pointer hover:brightness-110 transition-all duration-150 hover:translate-y-[2px] active:translate-y-[4px]"
            onClick={handleSignup}
          />
          <img
            src={goLanding}
            role="button"
            alt="Sign Up"
            className="w-[9rem] -mt-4 cursor-pointer hover:brightness-110 transition-all duration-150 hover:translate-y-[2px] active:translate-y-[4px]"
            onClick={() => navigate("/")}
          />
          </div>
        </div>

      </div>
    </div>
  );
};

export default SignupPage;
