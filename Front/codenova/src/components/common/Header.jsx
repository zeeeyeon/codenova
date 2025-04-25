import logo from "../../assets/images/codenova_logo.png"; // 🚀 왼쪽 로켓 로고
import mypageIcon from "../../assets/images/mypage_icon.png";
import rankingIcon from "../../assets/images/ranking_icon.png";
import helpIcon from "../../assets/images/help_icon.png";
import { useNavigate } from "react-router-dom";
const Header = () => {

  const navigate = useNavigate()

  return (
    <header className="w-full flex justify-between items-center px-3 py-3">
      {/* 왼쪽 로고 */}
      <img src={logo} alt="Logo" className="w-40 cursor-pointer hover:translate-y-[2px] hover:scale-[0.98] active:scale-[0.95]" onClick={() => navigate("/main")} />

      {/* 오른쪽 아이콘들 */}
      <div className="flex items-center gap-2">
        <img
          src={mypageIcon}
          alt="My Page"
          className="w-20 h-20 cursor-pointer hover:brightness-110 hover:scale-[0.98] active:scale-[0.95] transition"
        />
        <img
          src={rankingIcon}
          alt="Ranking"
          className="w-20 h-20 cursor-pointer hover:brightness-110 hover:scale-[0.98] active:scale-[0.95] transition"
        />
        <img
          src={helpIcon}
          alt="Help"
          className="w-20 h-20 cursor-pointer hover:brightness-110 hover:scale-[0.98] active:scale-[0.95] transition"
        />
      </div>
    </header>
  );
};

export default Header;
