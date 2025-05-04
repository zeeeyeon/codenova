import backgroundImg from '../../assets/images/multi_background.png'
import BoardContainer from '../../components/single/BoardContainer'
import okBtn from '../../assets/images/ok_btn2.png'
import updateBtn from '../../assets/images/update_btn.png'
import leftBtn from "../../assets/images/left_btn.png"
import rightBtn from "../../assets/images/right_btn.png"
import xBtn from "../../assets/images/x_btn.png"
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { checkNicknameApi } from '../../api/authApi'
import { getMyProfile } from '../../api/myPage'

const MyPage= () => {

    const navigate = useNavigate();
    const btn_class = 'cursor-pointer scale-75 transition-all duration-150 hover:brightness-110 hover:translate-y-[2px] hover:scale-[0.98] active:scale-[0.95]'

    const [currentLangIndex, setCurrentLangIndex] = useState(0);

    const [id, setId] = useState("")
    const [nicknameCheck, setNicknameCheck] = useState(false);
    const [nickname, setNickName] = useState("");
    const [newNickname, setNewNickName] = useState("");
    const [number, setNumber] = useState("");
    const [newNumber, setNewNumber] = useState("");
    const [userScoreList, setUserScoreList] = useState([]);

    useEffect(() =>{
        console.log(userScoreList)
    },[userScoreList])

    const getMemberData = async () => {

        try {
            const response = await getMyProfile();
            const { code , message } = response.status;
            
            if (code === 200) {
                setId(response.content.id);
                setNickName(response.content.nickname);
                setNumber(response.content.phoneNum);
                setUserScoreList(response.content.userScoreList)
              } else {
                alert(message);
              }
        } catch (err) {
          console.error(err);
          alert("서버 에러입니다.");
        }
        


    }

    useEffect(() => {
        getMemberData()
    }, [])

    const handleNicknameCheck = async () => {
        if (!newNickname) {
            alert("수정하실 닉네임을 입력하세요");
            return;
        } else if (newNickname.length > 11) {
            alert("닉네임은 최대 11자까지 입력할 수 있습니다")
        }

        try {
            const response = await checkNicknameApi({newNickname});
            const { code, messsage } = response.data.status;

            if (code === 200 ) {
                setNicknameCheck(true);
                alert("사용 가능한 닉네임입니다!");
            } else {
                setNicknameCheck(false);
                alert(messsage || "닉네임 중복입니다!!")
            }
        } catch (e) {
            console.error(e);
            alert("서버 에러입니다.");
        }

    }

    
    const handleUpdate = async () => {
        
        if (!nicknameCheck) { // 사용자가 새 닉네임을 입력했지만 중복 검사를 하지 않은 경우
            setNicknameCheck(false);
            alert("새 닉네임의 변경 가능 여부를 먼저 확인해주세요");
            return;
        }
        const nicknameChanged = newNickname && newNickname !== nickname;
        const numberChanged = newNumber && newNumber !== number && newNumber.length === 11;
        
        // 변경 사항 없을 때
        if (!nicknameChanged && !numberChanged) {
          alert("변경된 내용이 없습니다.");
          return;
        }

        try {

        } catch (e){
            console.error(e);
            alert("수정중 오류가 발생했습니다.")
        }
        
    }


    const handlePrev = () => {
        setCurrentLangIndex((prev) => (prev - 1 + userScoreList.length) % userScoreList.length);
      };
      
      const handleNext = () => {
        setCurrentLangIndex((prev) => (prev + 1) % userScoreList.length);
      };


    return (
        <div 
            className="w-screen h-screen flex items-center justify-center bg-no-repeat bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundImg})`}}
        >
            <BoardContainer>
                {/* 타이틀 텍스트 */}
                <div className="absolute top-[1%] left-1/2 -translate-x-1/2 font-bold text-4xl drop-shadow-md z-10"
                    style={{color: '#1C1C1C'}}
                >
                    마이페이지
                </div>

                <img src={xBtn} 
                    alt="x" 
                    className= {`cursor-pointer scale-75 absolute top-1 right-2 text-black text-ml font-extrabold w-[4%] ${btn_class}`}
                    onClick={()=> navigate(-1)}
                />

                <div className="text-white text-2xl mt-4 w-full h-full flex flex-col items-center gap-4 justify-center">
                    <div className="w-[60%] flex">
                        <div className='w-[32%]'>ID</div>
                        <span>{id}</span>
                    </div>

                    <div className=" w-[60%] flex items-center">
                        <div className='w-[32%]'>NickName</div>
                        <input
                            type="text"
                              value={newNickname}
                              onChange={(e) => {
                                setNewNickName(e.target.value)
                              }}
                              className="w-[50%] h-[110%] bg-transparent border-2 text-xl text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 "
                              style={{
                                borderColor :"#51E2F5",
                              }}
                              placeholder={nickname}
                            />
                            <button
                              onClick={handleNicknameCheck}
                              className="active:scale-95 text-xl"
                            >
                              ✅
                            </button>
                            {nicknameCheck === true && <span className="text-green-400 text-xl">⭕</span>}
                            {nicknameCheck === false && <span className="text-red-400 text-xl">❌</span>}
                    </div>

                    <div className=" w-[60%] flex items-center">
                        <div className='w-[32%]'>Number</div>
                        <input
                            type="tel"
                              value={newNumber}
                              onChange={(e) => {
                                const onlyNumbers = e.target.value.replace(/[^0-9]/g, '');
                                setNewNumber(onlyNumbers);
                              }}
                              className="w-[50%] h-[110%] bg-transparent border-2 text-xl text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                              style={{
                                borderColor :"#51E2F5",
                              }}
                              placeholder={number}
                            />


                            
                            <div className="relative group ml-2">
                              <span className="cursor-help text-white text-xl">?</span>
                              <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block bg-black text-white text-sm px-2 py-1 rounded shadow-md whitespace-nowrap z-10">
                                올바른 전화번호를 등록해주셔야 <br/>추후 상품수령이 가능합니다!!
                              </div>
                            </div>
                    </div>

                    <div className=" w-[60%] mt-2 flex justify-center">
                        <img src={leftBtn} 
                            alt="왼쪽" 
                            className={`cursor-pointer scale-75 ${btn_class}`} 
                            onClick={handlePrev}/>
                        <div className="flex justify-center w-[40%]">
                            {userScoreList?.[currentLangIndex]?.language || ""}
                        </div>
                        
                        <img 
                            src={rightBtn} 
                            alt="오른쪽" 
                            className={`cursor-pointer scale-75 ${btn_class}`} 
                            onClick={handleNext}
                        />
                    </div>
                    <div className=" w-[60%] text-center">
                        최고타수 : 999타 
                    </div>
                              
                    {/* 버튼 컨테이너  */}
                    <div className={`flex w-full h-[15%] mt-4 max-w-[400px] justify-center gap-14`}>
                        <img
                            src={updateBtn}
                            alt="수정하기"
                            className="rounded-3xl transition-all duration-200 hover:brightness-110 hover:translate-y-[2px] hover:scale-[0.97] active:scale-[0.94]"
                            onClick={() => handleUpdate()}
                        />
                        <img
                            src={okBtn}
                            alt="확인"
                            className="rounded-3xl transition-all duration-200 hover:brightness-110 hover:translate-y-[2px] hover:scale-[0.97] active:scale-[0.94]"
                            onClick={() => navigate(-1)}
                        />
                    </div>
                </div>

                

            </BoardContainer>

        </div>
    );
};

export default MyPage;