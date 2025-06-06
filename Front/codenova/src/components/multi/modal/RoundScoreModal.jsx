import React from "react";
import roundBg from "../../../assets/images/board3.png";
import rank1 from "../../../assets/images/rank_1.png";
import rank2 from "../../../assets/images/rank_2.png";
import rank3 from "../../../assets/images/rank_3.png";

const RoundScoreModal = ({ visible, scores, round, countdown }) => {
  const rankIcons = [rank1, rank2, rank3];
  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div
        className="relative w-[900px] h-[600px] bg-center bg-contain bg-no-repeat flex flex-col items-center justify-start pt-[7rem] px-10 "
        style={{ backgroundImage: `url(${roundBg})` }}
      >
        <h2 className="text-3xl text-pink-500 drop-shadow mb-4">
          [Round {round} 결과]
        </h2>

        <div className="w-[90%] overflow-x-auto">
          <table className="w-full text-white text-center drop-shadow">
            <thead>
              <tr className="border-b border-white text-xl">
                <th className="py-2">순위</th>
                <th className="py-2">닉네임</th>
                <th className="py-2">점수</th>
                <th className="py-2">오타 수</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((user, i) => (
                <tr key={i} className="border-b border-white/30 text-xl">
                   <td className="py-2 w-[90px]">
                      {i < 3 ? (
                        <img
                          src={rankIcons[i]}
                          alt={`rank ${i + 1}`}
                          className="w-9 h-9 mx-auto"
                        />
                      ) : (
                        <span className="text-white">{i + 1}위</span> // ✅ 4등 이상 텍스트
                      )}
                    </td>
                  <td className={`py-2 ${i === 0 ? 'text-yellow-200  animate-pulse glow-effect' : ''}`}>
                    {user.nickname}
                  </td>

                  <td className={`py-2 ${i === 0 ? 'text-yellow-200  animate-pulse glow-effect' : ''}`}>{user.score} 점</td>
                  <td className={`py-2 ${i === 0 ? 'text-yellow-200  animate-pulse glow-effect' : ''}`}>{user.typoCount} 개</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-auto pb-32 text-center text-yellow-400  drop-shadow text-2xl">
          다음 라운드 시작까지 {countdown}초
        </div>
      </div>
    </div>
  );
};

export default RoundScoreModal;
