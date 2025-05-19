import React, {useState} from "react";
import modalBg from "../../../assets/images/board1.jpg";
import makeRoomBtn from "../../../assets/images/make_room_btn.png";
import cancleBtn from "../../../assets/images/multi_cancel_btn.png";
import { createRoom } from "../../../sockets/MultiSocket";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../../store/authStore";
import MultiAlertModal from "../modal/MultiAlertModal";
import changeBtn from "../../../assets/images/multi_room_info_change_btn.png";
import { getSocket } from "../../../sockets/socketClient";

const MakeRoomModal = ({ onClose, isEdit=false, initialData = {} }) => {
    const [title, setTitle] = useState(initialData.title || "");
    const [people, setPeople] = useState(initialData.people || undefined);
    const [language, setLanguage] = useState(initialData.language || "PYTHON");
    const [isPublic, setIsPublic] = useState(initialData.isPublic ?? true);
    const [activeArrow, setActiveArrow] = useState(null);

    const languages = ["PYTHON", "JAVA", "JS","SQL","RANDOM"]
    const navigate = useNavigate();
    const nickname = useAuthStore((state) => state.user?.nickname);

    const [alertMessage, setAlertMessage] = useState(null);
    const [isCreating, setIsCreating] = useState(false);

    const handleLangChange = (dir) => {
        const index = languages.indexOf(language);
        if (dir === "prev") {
          setLanguage(languages[(index - 1 + languages.length) % languages.length]);
        } else {
          setLanguage(languages[(index + 1) % languages.length]);
        }
        setActiveArrow(dir); // 화살표 색상 반짝
        setTimeout(() => setActiveArrow(null), 300); 
      };

      const handleSubmit = () => {
        if (isCreating) return;

        if (!title || !people || !language || !nickname) {
          setAlertMessage("모든 항목을 입력해주세요!");
          return;
        }

        setIsCreating(true); // 중복 생성 방지지
      
        
        
        if (isEdit) {
          // 수정 요청
          const payload = {
            roomTitle : title,
            nickname,
            language,        
            maxCount: people,
            isLocked: !isPublic,
          };

          const socket = getSocket();
          if (socket) {
            socket.emit("fix_room", {
              ...payload,
              roomId: initialData.roomId, // 반드시 전달되어야 함
            });
          }
          onClose(); // 모달 닫기
        } else {
          // 방 생성 로직 그대로 유지
          const payload = {
            title,
            nickname,
            language,        
            maxNum: people,
            isLocked: !isPublic,
          };
          createRoom({ ...payload }, (res) => {
            if (!res || !res.roomId) {
              alert("방 생성 실패");
              return;
            }
            navigate(`/multi/room/${res.roomId}`, {
              state: {
                roomTitle: title,
                language,
                currentPeople: 1,
                standardPeople: people,
                isPublic,
                roomCode: res.roomCode,
              },
            });
            onClose();
          });
        }
      };
      
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="relative w-[60vw] max-w-[1300px] aspect-[4/3] rounded-2xl overflow-hidden shadow-xl top-[13%]">
        <img
          src={modalBg}
          alt="modal"
          className="absolute inset-0  object-cover rounded-2xl"
        />

        {/* 모달 내부 콘텐츠 */}
        {/* 내부 콘텐츠 */}
        <div className="relative z-10 w-full h-full px-12 py-4 flex flex-col text-white">
        <div className="text-3xl text-center mb-4 text-black font-bold">
          {isEdit ? "방 정보 수정" : "방 만들기"}
          </div>
        <div className="flex flex-1 justify-center mt-[5%]">
        <div className="flex flex-col gap-9 w-full max-w-[600px] text-2xl">
    

            {/* 방 제목 */}
            <div className="flex items-center gap-3">
              <span className="w-[100px] text-right mr-4 text-[#51E2F5]">제&nbsp;&nbsp;목</span>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-[470px] px-4 py-2 text-black font-bold rounded-md"
                placeholder="다함께 코드노바~"
                maxLength={10}
              />
            </div>

            {/* 인원 수 */}
            <div className="flex items-center gap-20">
                <span className="w-[100px] text-right text-[#51E2F5]">인원수</span>
                {[2, 3, 4].map((n) => {
                  const isDisabled = Number(initialData.currentPeople || 0) > n;

                  return (
                    <label
                      key={n}
                      className={`flex items-center gap-4 cursor-pointer 
                        ${isDisabled ? "opacity-50 cursor-not-allowed" : "hover:brightness-110 hover:scale-[1.1] active:scale-[0.98]"}`}
                          >
                            <input
                              type="checkbox"
                              name="people"
                              checked={people === n}
                              onChange={() => setPeople(n)}
                              disabled={isDisabled}
                              className="peer scale-150 accent-fuchsia-600 rounded-sm"
                            />
                            <span className={`cursor-[url('/cursors/click.png')_16_16,_pointer] transition ${isDisabled ? "text-gray-400" : "peer-checked:text-fuchsia-400"}`}>
                              {n}명
                            </span>
                          </label>
                        );
                      })}
                    </div>

            {/* 언어 */}
            <div className="flex items-center gap-20">
              <span className="w-[100px] text-right text-[#51E2F5]">언&nbsp;&nbsp;어</span>
              <button 
                onClick={() => handleLangChange("prev")}
                className={`
                    transition-colors duration-300
                    hover:text-fuchsia-400
                    ${activeArrow === "prev" ? "text-fuchsia-400" : "text-white"}
                    hover:brightness-110 hover:scale-[1.1] active:scale-[0.98]
                `}
                >
                ◀
                </button>

                <span className="w-[120px] text-center">{language}</span>

                <button 
                onClick={() => handleLangChange("next")}
                className={`
                    transition-colors duration-300
                    hover:text-fuchsia-400
                    ${activeArrow === "next" ? "text-fuchsia-400" : "text-white"}
                    hover:brightness-110 hover:scale-[1.1] active:scale-[0.98]
                `}
                >
                ▶
                </button>

            </div>

            {/* 공개 여부 */}
            <div className="flex items-center gap-24">
              <span className="w-[100px] text-right text-[#51E2F5]">공&nbsp;&nbsp;개</span>
              <label className="flex items-center gap-4 cursor-pointer hover:brightness-110 hover:scale-[1.1] active:scale-[0.98]">
                <input
                    type="checkbox"
                    name="visible"
                    checked={isPublic}
                    onChange={() => setIsPublic(true)}
                    className="peer scale-150 accent-fuchsia-600 rounded-sm"
                />
                <span className="cursor-[url('/cursors/click.png')_16_16,_pointer] peer-checked:text-fuchsia-400 transition">
                    공개
                </span>
              </label>
              <label className="flex items-center gap-4 cursor-pointer hover:brightness-110 hover:scale-[1.1] active:scale-[0.98]">
                <input
                    type="checkbox"
                    name="visible"
                    checked={!isPublic}
                    onChange={() => setIsPublic(false)}
                    className="peer scale-150 accent-fuchsia-600 rounded-sm"
                />
                <span className="cursor-[url('/cursors/click.png')_16_16,_pointer] peer-checked:text-fuchsia-400 transition">
                    비공개
                </span>
                </label>
            </div>

            {/* 버튼 */}
            <div className="flex justify-center  gap-24">
              <button
                className="w-[120px] h-[40px] hover:brightness-110 hover:scale-[0.98] active:scale-[0.95]"
                onClick={onClose}
              >
                <img
                src={cancleBtn}
                alt="취소"
                />
              </button>
              <button 
                className="w-[120px] h-[40px] hover:brightness-110 hover:scale-[0.98] active:scale-[0.95] mt-0.5"
                onClick={handleSubmit}
                disabled={isCreating} 
                >
                <img
                src={isEdit? changeBtn : makeRoomBtn}
                alt={isEdit? "방 정보 수정" : "방만들기"}
                />
              </button>
            </div>
          </div>
          </div>
        </div>
      </div>

      {alertMessage && (
      <MultiAlertModal
        message={alertMessage}
        onConfirm={() => setAlertMessage(null)}
      />
    )}

    </div>
  );
};

export default MakeRoomModal;
