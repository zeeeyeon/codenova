// src/components/ErrorBoundary.jsx
import React from "react";
import logo from "../assets/images/codenova_logo.png";
import errorAstronaut from "../assets/lottie/error.json";
import { Player } from "@lottiefiles/react-lottie-player";
import { useNavigate } from "react-router-dom";

// ❌ wrapper 삭제
// ✅ navigate hook 대신 location 이동만
class ErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // console.error("🚨 ErrorBoundary caught:", error, info);
  }

  handleGoToMain = () => {
    window.location.href = "/main";  // ✅ useNavigate() 대신 사용
  };

  render() {
    if (this.state.error) {
      window.location.href ="/main"
      return (
        <div className="w-screen h-screen bg-black flex flex-col items-center justify-center text-white text-center">
          <img src={logo} alt="Logo" className="w-[20rem]" />
          <Player
            autoplay
            loop
            src={errorAstronaut}
            className="w-[16rem] h-[16rem] mb-6"
          />
          <h1 className="text-4xl font-bold mb-2">앗! 우주에서 오류가 발생했어요 🚀</h1>
          <p className="text-lg mb-6">문제가 발생했어요. 메인으로 돌아갈게요.</p>
          <button
            onClick={this.handleGoToMain}
            className="px-6 py-2 bg-gray-50 text-black font-semibold rounded-xl hover:bg-yellow-300 transition-all duration-150"
          >
            메인으로 이동하기
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;