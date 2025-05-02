import { useNavigate } from "react-router-dom"
import endBtn from "../../assets/images/end_game_button.png"

const StopButton = () => {

    const navigate = useNavigate();
    
    return (
        <div className="fixed top-6 right-12 z-50 w-[8%] h-auto">
            <img src={endBtn} alt="게임 종료 버튼" 
                className="transition-all duration-200 hover:brightness-110 hover:translate-y-[2px] hover:scale-[0.97] active:scale-[0.94]"
                onClick={() => navigate("/single/select/language")}/>
        </div>
    )
}

export default StopButton;