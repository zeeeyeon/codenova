import VolumeSlider from "./VolumsSlider"
import useVolumeStore from "../../store/useVolumsStore";

const VolumsSetting = () => {

    const { bgmVolume, effectVolume, setBgmVolume, setEffectVolume } = useVolumeStore();

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
                        게임응향: 멀티 AND 유성 BGM설정 <br /> 타건음향: 싱글모드 타건설정
                    </div>
                </div>
            </div>
            

            {/* 배경 소리 조절 */}
            <VolumeSlider
                label="게임음향"
                value={Math.round(bgmVolume * 100)}
                onChange={(e) => setBgmVolume(Number(e.target.value) / 100 )}
        />

            {/* 유성 소리 조절 */}
            <VolumeSlider
                label="타건음향"
                value={Math.round(effectVolume * 100)}
                onChange={(e) => setEffectVolume(Number(e.target.value) / 100 )}
            />
        </div>
    )
}

export default VolumsSetting