import logo from "../../assets/images/codenova_logo.png"; // 🚀 왼쪽 로켓 로고
import mypageIcon from "../../assets/images/mypage_icon.png";
import rankingIcon from "../../assets/images/ranking_icon.png";
import helpIcon from "../../assets/images/help_icon.png";
import helpIcon2 from "../../assets/images/help_icon2.png";
import mypageIcon2 from "../../assets/images/mypage_icon2.png";
import rankingIcon2 from "../../assets/images/ranking_icon2.png";
import logoutIcon from "../../assets/images/logout_button.png";
import settingIcon from "../../assets/images/setting_btn.png";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import { disconnectSocket } from "../../sockets/socketClient";
import { useEffect, useState } from "react";
import TutoModal from "./TutoModal";
import SettingModal from "../modal/SettingModal";

const Header = ({onShowTuto, onShowSetting}) => {

  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout);
  const [userType ,setUserType] = useState(null);
  // const [nickname ,setNickname] = useState(null);
  const [showTuto, setShowTuto] = useState(false);
  const [isSetting, setIsSetting] = useState(false)

  useEffect(() => {
    const auth = JSON.parse(localStorage.getItem("auth-storage") || "{}");
    setUserType(auth?.state?.user?.userType);
    // setNickname(auth?.state?.user?.nickname);
  }, [])

  const nickname = useAuthStore((state) => state.user?.nickname);

  const handleLogout = () => {
    document.cookie = "accessToken=; path=/; max-age=0;";
  
    // Zustand 상태 초기화
    logout();
  
    // ✅ localStorage 항목 제거
    localStorage.removeItem("nickname");
    localStorage.removeItem("meteoRoomId");
    localStorage.removeItem("meteoRoomCode");
    localStorage.removeItem("auth-storage"); // ← 이것도 초기화하고 싶다면!
    localStorage.removeItem("codenova_patch_note");
  
    // 소켓 연결 해제
    disconnectSocket();
  
    navigate("/auth/login");
  };

  return (
    <header className="fixed top-0 left-0 w-full flex justify-between items-center px-3 py-3">
      {/* 왼쪽 로고 */}
      <img src={logo} alt="Logo" className="w-40 cursor-pointer hover:translate-y-[2px] hover:scale-[0.98] active:scale-[0.95]" onClick={() => navigate("/main")} />

      {/* 오른쪽 아이콘들 */}
      <div className="flex items-center gap-4">
        <div className=" text-white text-gl mr-4 text-center">
          {nickname ? `${nickname}님` : ''}
        </div>
        {userType !== "guest" && (
          <img
          src={mypageIcon2}
          alt="My Page"
          className="w-16 h-16 cursor-pointer hover:brightness-110 hover:scale-[0.98] active:scale-[0.85] transition"
          onClick={() => navigate("/mypage")}
          />
        )}
        
        <img
          src={rankingIcon2}
          alt="Ranking"
          className="w-16 h-16 cursor-pointer hover:brightness-110 hover:scale-[0.98] active:scale-[0.85] transition"
          onClick={() => navigate("/ranking")}
        />
        <img
          src={helpIcon2}
          alt="Help"
          className="w-16 h-16 cursor-pointer hover:brightness-110 hover:scale-[0.98] active:scale-[0.85] transition"
          onClick={onShowTuto}
        />
        <img
          src={settingIcon}
          alt="setting"
          className="w-16 h-16 cursor-pointer hover:brightness-110 hover:scale-[0.98] active:scale-[0.85] transition"
          onClick={onShowSetting}
        />
        <img 
          src={logoutIcon} 
          alt="로그아웃" 
          onClick={handleLogout}
          className="w-20 h-auto cursor-pointer hover:brightness-110 hover:scale-[0.98] active:scale-[0.85] transition"
        />
        {/* <button onClick={handleLogout} className="text-white">
          로그아웃
        </button> */}
      </div>
      {showTuto && <TutoModal onClose={() => setShowTuto(false)} />}
      {isSetting && <SettingModal onClose={() => setIsSetting(false)} />}
    </header>
  );
};

export default Header;
