import boardImage from "../../../assets/images/board3.png";
import confirmBtn from "../../../assets/images/board4.png";

const AloneAlertModal = ({ roomInfo, onConfirm }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div
        className="relative w-[600px] h-[300px] bg-contain bg-no-repeat flex flex-col items-center justify-center text-white px-8 pt-8 pb-6 rounded-2xl"
        style={{ backgroundImage: `url(${boardImage})` }}
      >
        {/* 헤더 */}
        <h2 className="text-3xl text-yellow-300  mb-3 drop-shadow">
          ⚠️ 방에 혼자 남았습니다
        </h2>

        {/* 설명 */}
        <p className="text-center text-white text-xl leading-relaxed mb-4  mt-4 drop-shadow">
          상대방이 나가서<br />
          게임을 계속 진행할 수 없습니다.
        </p>

        {/* 버튼 + 텍스트 오버레이 */}
        <div
                className="relative mt-8 group focus:outline-none"
                role="button"
                tabIndex={0}
                onClick={onConfirm}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault(); // prevent page scroll on space
                        onConfirm();
                      }
                }}
                >
                {/* 버튼 이미지 */}
                <img
                    src={confirmBtn}
                    alt="확인"
                    className="w-[200px] transition-transform duration-200 rounded-2xl group-hover:scale-105"
                />

                {/* 텍스트 오버레이 */}
                <div
                    className="absolute inset-0 flex items-center justify-center text-2xl text-white pointer-events-none transition-transform duration-200 group-hover:scale-105"
                >
                    확인
                </div>
                </div>

      </div>
    </div>
  );
};

export default AloneAlertModal;
