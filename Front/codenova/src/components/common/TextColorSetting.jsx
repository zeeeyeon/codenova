import ColorPicker from "./ColorPicker";
import { userColorStore } from "../../store/userSettingStore";

const TextColorSetting = () => {

    const colors = userColorStore((state) => state.colors);
    const setColor = userColorStore((state) => state.setColor);
    const resetSingleColor = userColorStore((state) => state.resetSingleColor);

    const colorTypes = [
        { type: 'correct', label: '정답 색상' },
        { type: 'wrong', label: '오답 색상' },
        { type: 'typing', label: '기본 색상' }
    ];


    return (
        <div className="w-[50%] h-[35%] text-white flex flex-col items-center  gap-2">
            <div className="flex">
                <div className="text-2xl">
                    텍스트 색상 지정
                </div>

            
                <div className="relative group ml-2">

                    <span className="cursor-help text-white text-xl font-bold">
                    ?
                    </span>
                    <div className="absolute top-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block bg-black bg-opacity-90 text-white text-sm px-3 py-2 rounded shadow-md whitespace-nowrap z-30 text-center
                        animate-fade-slide-up">
                        싱글모드 or 멀티모드시 코드 색상 지정<br />
                        설정이 가능합니다!<br/>
                    </div>
                </div>
            </div>
            
          
            
            {colorTypes.map(({type, label}) => (
                <div className=" w-[60%] h-[20%] flex justify-center items-center">
                    <ColorPicker
                        label={label}
                        value={colors[type]}
                        onChange={(e) => setColor(type ,e.target.value)}
                    />
                    <button
                        className="px-2 py-1 text-sm bg-gray-600 rounded h-[70%] flext text-center leading-none"
                        onClick={() => resetSingleColor(type)}
                    >
                        ⟳
                    </button>
                </div>
            ))}
            




        </div>
    );            
    
};

export default TextColorSetting;