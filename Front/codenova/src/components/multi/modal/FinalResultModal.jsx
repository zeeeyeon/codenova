import React, { useEffect,useState } from "react";
import { useNavigate } from "react-router-dom";
import resultBg from "../../../assets/images/board3.png";
import waitBtn from "../../../assets/images/board4.png";
import rank1 from "../../../assets/images/rank_1.png";
import rank2 from "../../../assets/images/rank_2.png";
import rank3 from "../../../assets/images/rank_3.png";

const FinalResultModal = ({ visible, results = [], onClose, roomInfo }) => {
  const navigate = useNavigate();
  const [fireworks, setFireworks] = useState([]);

  const rankIcons = [rank1, rank2, rank3];

  useEffect(() => {
    if (!visible) return;

    const interval = setInterval(() => {
      setFireworks((prev) => [
        ...prev,
        {
          id: Math.random(),
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          size: Math.random() * 8 + 4,
          color: ["#ff0", "#f0f", "#0ff", "#0f0", "#f00"][Math.floor(Math.random() * 5)],
        },
      ]);
    }, 80);

    // 30개 생성 후 멈추기
    setTimeout(() => clearInterval(interval), 40 * 80);

    return () => clearInterval(interval);
  }, [visible]);


  if (!visible) return null;

  const handleConfirm = () => {
    navigate(`/multi/room/${String(roomInfo.roomId)}`, {
      state: { roomInfo },
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 overflow-hidden">
      {/* 폭죽 레이어 */}
      {fireworks.map((fw) => (
        <div
        key={fw.id}
        className="firework sparkle"
        style={{
          position: "absolute",
          left: fw.left,
          top: fw.top,
          width: `${fw.size}px`,
          height: `${fw.size}px`,
          backgroundColor: fw.color,
          zIndex: 60,
          borderRadius: "50%",
        }}
      />
      ))}

      <div
        className="relative w-[900px] h-[610px] bg-center bg-contain bg-no-repeat flex flex-col items-center justify-start pt-[7rem] px-10 z-50 rounded-2xl"
        style={{ backgroundImage: `url(${resultBg})` }}
      >
        <h2 className="text-3xl text-pink-500 drop-shadow mb-4">🏆 최종 결과 🏆</h2>

        <div className="w-[90%] overflow-x-auto">
          <table className="w-full text-white text-center drop-shadow">
            <thead>
              <tr className="border-b border-white text-xl">
                <th className="py-2">순위</th>
                <th className="py-2">닉네임</th>
                <th className="py-2">총점</th>
              </tr>
            </thead>
            <tbody>
              {results.map((user, i) => (
                <tr key={user.nickname} className="border-b border-white/30 text-xl">
                  <td className="py-2">
                    {i < 3 ? (
                      <img src={rankIcons[i]} alt={`rank ${i + 1}`} className="w-11 h-11 mx-auto" />
                    ) : (
                      <span className="text-white">{i + 1}위</span>
                    )}
                  </td>
                  <td className={`py-2 ${i === 0 ? "text-yellow-200 animate-pulse glow-effect" : ""}`}>
                    {user.nickname}
                  </td>
                  <td className={`py-2 ${i === 0 ? "text-yellow-200 animate-pulse glow-effect" : ""}`}>
                    {user.totalScore} 점
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 버튼 영역 */}
        <div className="relative mt-auto mb-28">
          <div
            className="w-[230px] cursor-pointer hover:scale-105 transition-transform duration-200 relative"
            onClick={handleConfirm}
          >
            <img
              src={waitBtn}
              role="button"
              alt="대기방으로 이동"
              className="w-full rounded-2xl"
            />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-lg whitespace-nowrap pointer-events-none">
              대기방으로 이동!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinalResultModal;