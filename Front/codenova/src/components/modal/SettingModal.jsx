import Board2Container from "../single/BoardContainer"
import xBtn from "../../assets/images/x_btn.png"
import TextColorSetting from "../common/TextColorSetting";
import { useState } from "react";
import VolumsSetting from "../common/VolumeSetting";

const SettingModal = ({ onClose }) => {

    const [bgmVolume, setBgmVolume] = useState(50);
    const [effectVolume, setEffectVolume] = useState(70);

    const btn_class = 'cursor-pointer scale-75 transition-all duration-150 hover:brightness-110 hover:translate-y-[2px] hover:scale-[0.98] active:scale-[0.95]'

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-70 font-[PixelFont] text-white">
            <Board2Container>
                 <div className="absolute top-[1%] left-1/2 -translate-x-1/2 font-bold text-4xl drop-shadow-md z-10 w-[27%] text-center  px-2 "
                    style={{color: '#1C1C1C'}}
                    >    
                    설정       
                    </div>
                <img src={xBtn} 
                    alt="x" 
                    className= {`cursor-pointer scale-75 absolute top-1 right-2 text-black text-ml font-extrabold w-[4%] ${btn_class}`}
                    onClick={()=> onClose()}
                />

                <div className="flex flex-col w-full h-full items-center justify-center gap-4">

                    <VolumsSetting/>

                    <TextColorSetting/>

                    {/* 로그아웃 버튼 */}
                </div>



            </Board2Container>
        </div>
        
    )
}
export default SettingModal;