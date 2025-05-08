import React from "react";

const RoundScoreModal = ({ visible, scores, round, countdown }) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 w-[600px] max-w-full shadow-xl">
        <h2 className="text-2xl font-bold text-center mb-4">Round {round} 결과</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border border-gray-300 rounded">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2">닉네임</th>
                <th className="px-4 py-2">점수</th>
                <th className="px-4 py-2">오타 수</th>
                {/* <th className="px-4 py-2">소요 시간</th> */}
              </tr>
            </thead>
            <tbody>
              {scores.map((user, i) => (
                <tr key={i} className="border-t">
                  <td className="px-4 py-2">{user.nickname}</td>
                  <td className="px-4 py-2">{user.score}</td>
                  <td className="px-4 py-2">{user.typoCount}</td>
                  {/* <td className="px-4 py-2">
                    {Number.isFinite(user.time) ? `${user.time.toFixed(2)}s` : "-"}
                    </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 text-center">
        <div className="text-gray-700 mb-2">다음 라운드 시작까지 {countdown}초</div>
        </div>
      </div>
    </div>
  );
};

export default RoundScoreModal;
