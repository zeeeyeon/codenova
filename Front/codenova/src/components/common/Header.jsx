import logo from "../../assets/images/codenova_logo.png"; // 🚀 왼쪽 로켓 로고
import mypageIcon from "../../assets/images/mypage_icon.png";
import rankingIcon from "../../assets/images/ranking_icon.png";
import helpIcon from "../../assets/images/help_icon.png";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import { disconnectSocket } from "../../sockets/socketClient";
import { useEffect, useState } from "react";

const Header = () => {

  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout);
  const [userType ,setUserType] = useState(null);

  useEffect(() => {
    const auth = JSON.parse(localStorage.getItem("auth-storage") || "{}");
    setUserType(auth?.state?.user?.userType);

  }, [])



  const handleLogout = () => {
    document.cookie = "accessToken=; path=/; max-age=0;";
  
    // Zustand 상태 초기화
    logout();
  
    // ✅ localStorage 항목 제거
    localStorage.removeItem("nickname");
    localStorage.removeItem("meteoRoomId");
    localStorage.removeItem("meteoRoomCode");
    localStorage.removeItem("auth-storage"); // ← 이것도 초기화하고 싶다면!
  
    // 소켓 연결 해제
    disconnectSocket();
  
    navigate("/auth/login");
  };

  return (
    <header className="fixed top-0 left-0 w-full flex justify-between items-center px-3 py-3">
      {/* 왼쪽 로고 */}
      <img src={logo} alt="Logo" className="w-40 cursor-pointer hover:translate-y-[2px] hover:scale-[0.98] active:scale-[0.95]" onClick={() => navigate("/main")} />

      {/* 오른쪽 아이콘들 */}
      <div className="flex items-center gap-2">
        {userType !== "guest" && (
          <img
          src={mypageIcon}
          alt="My Page"
          className="w-20 h-20 cursor-pointer hover:brightness-110 hover:scale-[0.98] active:scale-[0.95] transition"
          onClick={() => navigate("/mypage")}
          />
        )}
        
        <img
          src={rankingIcon}
          alt="Ranking"
          className="w-20 h-20 cursor-pointer hover:brightness-110 hover:scale-[0.98] active:scale-[0.95] transition"
          onClick={() => navigate("/ranking")}
        />
        <img
          src={helpIcon}
          alt="Help"
          className="w-20 h-20 cursor-pointer hover:brightness-110 hover:scale-[0.98] active:scale-[0.95] transition"
        />
        <button onClick={handleLogout} className="text-white">
          로그아웃
        </button>
      </div>
    </header>
  );
};

export default Header;
