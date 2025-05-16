import { useNavigate } from "react-router-dom"
import endBtn from "../../assets/images/end_game_button.png"
import headerBtn from "../../assets/images/single_stop_btn.png"

const StopButton = () => {

    const navigate = useNavigate();
    
    return (
        <div className="fixed top-6 right-12 z-50 w-[4.5%] h-auto flex items-center justify-center">
            <img src={headerBtn} alt="게임 종료 버튼" 
                className="transition-all duration-200 hover:brightness-110 hover:translate-y-[2px] hover:scale-[0.97] active:scale-[0.85]"
                onClick={() => navigate("/single/select/language")}/>
        </div>
    )
}

export default StopButton;