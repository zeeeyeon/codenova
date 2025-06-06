import backgroundImg from '../../assets/images/multi_background.png'
import BoardContainer from '../../components/single/BoardContainer'
import okBtn from '../../assets/images/ok_btn2.png'
import updateBtn from '../../assets/images/update_btn.png'
import leftBtn from "../../assets/images/left_btn.png"
import rightBtn from "../../assets/images/right_btn.png"
import leftBtn2 from "../../assets/images/less-than_white.png"
import rightBtn2 from "../../assets/images/greater-than_white.png"
import xBtn from "../../assets/images/x_btn.png"
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { checkNicknameApi } from '../../api/authApi'
import { getMyProfile, upDateMyProfile } from '../../api/myPage'
import Header from '../../components/common/Header'
import TutoModal from '../../components/common/TutoModal'
import useAuthStore from '../../store/authStore'
import CustomAlert from '../../components/common/CustomAlert'

const MyPage= () => {

    const navigate = useNavigate();
    const btn_class = 'cursor-pointer scale-75 transition-all duration-150 hover:brightness-110 hover:translate-y-[2px] hover:scale-[0.98] active:scale-[0.95]'
    const [showTutoModal, setShowTutoModal] = useState(false)
    const [showSettingModal, setShowSettingModal] = useState(false)    
    const [currentLangIndex, setCurrentLangIndex] = useState(0);
    const [showAlert, setShowAlert] = useState(false);
    const [alertText, setAlertText] = useState("");
    const [id, setId] = useState("")
    const [nicknameCheck, setNicknameCheck] = useState(false);
    const [nickname, setNickName] = useState(null);
    const [newNickname, setNewNickName] = useState("");
    const [number, setNumber] = useState(null);
    const [newNumber, setNewNumber] = useState("");
    const [userScoreList, setUserScoreList] = useState([]);

    const updateNickname = useAuthStore((state) => state.updateNickname);
    const openAlert = (msg) => {
        setAlertText(msg);
        setShowAlert(true);
    };
    useEffect(() =>{
        // console.log(userScoreList)
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
          //console.error(err);
          alert("서버 에러입니다.");
        }
        


    }

    useEffect(() => {
        getMemberData()
    }, [])

    const handleNicknameCheck = async () => {
        if (!newNickname) {
            openAlert("수정하실 닉네임을 입력하세요");
            return;
        } else if (newNickname.length > 11) {
            openAlert("닉네임은 최대 11자까지 입력할 수 있습니다")
        }

        try {
            const response = await checkNicknameApi({nickname: newNickname});
            const { code, messsage } = response.data.status;

            if (code === 200 ) {
                setNicknameCheck(true);
                openAlert("사용 가능한 닉네임입니다!");
            } else {
                setNicknameCheck(false);
                openAlert(messsage || "닉네임 중복입니다!")
            }
        } catch (e) {
            //console.error(e);
            alert("서버 에러입니다.");
        }

    }

    
    const handleUpdate = async () => {
        
        const nicknameChanged = newNickname && newNickname !== nickname;
        const numberChanged = newNumber && newNumber !== number;
        
        if(numberChanged && newNumber.length !== 13){ //번호를 입력했지만 올라르지 않을때
            openAlert("올바른 번호를 입력해주세요")
            return;
        }
        if(nicknameChanged && !nicknameCheck){ //변경 닉네임을 입력했지만 중복검사를 하지 않았을때
            openAlert("닉네임 중복 검사를 하지 않았습니다")
            return;
        }

        // 변경 사항 없을 때
        if (!nicknameChanged && !numberChanged) {
            openAlert("변경된 내용이 없습니다.");
          return;
        }

        const updatedProfile = {
            nickname: nicknameChanged ? newNickname : "",
            phoneNum: numberChanged ? newNumber : "",
        };

        try {
            const response = await upDateMyProfile(updatedProfile);
            const {code, message} = response.status;
            if (code === 200){
                const updatedNickname = response.content.nickname; 
                updateNickname(updatedNickname);
                setNickName(updatedNickname);
                setNumber(response.content.phoneNum);
                setNewNickName('');
                setNewNumber('');
                setNicknameCheck(false);
                openAlert("수정이 완료되었습니다.")
            } else{
                alert(message)
            }
        } catch (e){
            //console.error(e);
            openAlert("수정중 오류가 발생했습니다.")
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
            {showTutoModal && (
                <div className="z-[9999]">
                    <TutoModal onClose={() => setShowTutoModal(false)} />
                </div>
            )}
            {showAlert && (
                <CustomAlert message={alertText} onConfirm={() => setShowAlert(false)} />
            )}
            <Header 
                onShowTuto={() => setShowTutoModal(true)}
                onShowSetting={() => setShowSettingModal(true)} 
            />
            <BoardContainer>
                {/* 타이틀 텍스트 */}
                <div className="absolute top-[1%] left-1/2 -translate-x-1/2 text-3xl drop-shadow-md z-10"
                    style={{color: '#1C1C1C'}}
                >
                    마이페이지
                </div>

                <img src={xBtn} 
                    role="button"
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
                              maxLength={11}
                              onChange={(e) => {
                                const value = e.target.value;
                                const trimmed = value.slice(0, 11); // 문자 수 기준 잘라내기
                                setNewNickName(trimmed);
                                setNicknameCheck(false);
                              }}
                              className="w-[50%] h-[110%] bg-transparent border-2 px-2 text-xl text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 "
                              style={{
                                borderColor :"#51E2F5",
                              }}
                              placeholder={nickname}
                            />
                            { nicknameCheck === false &&
                                <div 
                                onClick={handleNicknameCheck}
                                className='text-sm f w-[15%] ml-2 cursor-pointer'>
                                중복체크
                                </div>
                                
                            }
                            { nicknameCheck === true &&
                                <div 
                                onClick={handleNicknameCheck}
                                className='text-sm f w-[15%] ml-2 cursor-pointer'>
                                    ✔
                                </div>
                                
                            }
                            
                            
                    </div>

                    <div className=" w-[60%] flex items-center">
                        <div className='w-[32%]'>Number</div>
                        <input
                            type="tel"
                              value={newNumber}
                              maxLength={13}
                              onChange={(e) => {
                                let input = e.target.value.replace(/[^0-9]/g, ''); // 숫자만 남기기

                                    if (input.length <= 3) {
                                      setNewNumber(input);
                                    } else if (input.length <= 7) {
                                      setNewNumber(`${input.slice(0, 3)}-${input.slice(3)}`);
                                    } else {
                                      setNewNumber(`${input.slice(0, 3)}-${input.slice(3, 7)}-${input.slice(7, 11)}`);
                                    }
                              }}
                              className="w-[50%] h-[110%] bg-transparent border-2 px-2 text-xl text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
                        <img src={leftBtn2} 
                            role="button"
                            alt="왼쪽" 
                            className={`cursor-pointer w-[5%] h-auto   ${btn_class}`} 
                            onClick={handlePrev}/>
                        <div className="flex justify-center w-[40%]">
                            {userScoreList?.[currentLangIndex]?.language || ""}
                        </div>
                        
                        <img 
                            src={rightBtn2} 
                            role="button"
                            alt="오른쪽" 
                            className={`cursor-pointer w-[5%] h-auto ${btn_class}`} 
                            onClick={handleNext}
                        />
                    </div>
                    <div className=" w-[60%] text-center">
                        최고타수 : {Math.floor(userScoreList?.[currentLangIndex]?.score) || "0"}
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