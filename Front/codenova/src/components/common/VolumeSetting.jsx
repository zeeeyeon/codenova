import VolumeSlider from "./VolumsSlider"
import { useState } from "react";

const VolumsSetting = () => {

    const [bgmVolume, setBgmVolume] = useState(50);
    const [effectVolume, setEffectVolume] = useState(70);

    return (
        <div className="flex flex-col w-[90%] h-[30%] mb-4 justify-center items-center">
            <div className="w-full flex justify-center ">
                <div className="text-2xl w-auto text-center">
                    음향 설정
                </div>

                <div className="relative group ml-2 ">

                    <span className="cursor-help text-white text-xl font-bold">
                    ?
                    </span>
                    <div className="absolute top-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block bg-black bg-opacity-90 text-white text-sm px-3 py-2 rounded shadow-md whitespace-nowrap z-30 text-center
                        animate-fade-slide-up">
                        추후 음악 추가 예정<br />
                    </div>
                </div>
            </div>
            

            {/* 배경 소리 조절 */}
            <VolumeSlider
                label="배경음악"
                value={bgmVolume}
                onChange={(e) => setBgmVolume(Number(e.target.value))}
        />

            {/* 유성 소리 조절 */}
            <VolumeSlider
                label="게임음악"
                value={effectVolume}
                onChange={(e) => setEffectVolume(Number(e.target.value))}
            />
        </div>
    )
}

export default VolumsSetting