import backgroundImg from '../../assets/images/single_background.jpg'
// import ReportImg from '../../assets/images/report.png'
import box from '../../assets/images/board1.jpg'
import Header from "../../components/common/Header"
import leftBtn from "../../assets/images/left_btn.png"
import rightBtn from "../../assets/images/right_btn.png"
import titleBox from "../../assets/images/logo_remove4.png"

import { useState } from "react"

const MyReport= () => {

    const categories = [
        { title: "디자인패턴", reports: ["싱글톤 패턴", "팩토리 패턴", "MVC 패턴", "의존성", "implements"] },
        { title: "데이터베이스", reports: ["OSI 7계층", "TCP/IP", "HTTP", "DNS", "ARP"] },
        { title: "자료구조", reports: ["프로세스", "스레드", "메모리 관리", "스케줄링", "교착 상태"] },
        { title: "네트워크", reports: ["OSI 7계층", "TCP/IP", "HTTP", "DNS", "ARP"] },
        { title: "운영체제", reports: ["프로세스", "스레드", "메모리 관리", "스케줄링", "교착 상태"] },
      ];

    const reports = [
        { id: 1, date: "2025_04_22_5", words: ["싱글톤 패턴", "팩토리 패턴", "MVC 패턴", "에라 모르겠다", "수수수코드노바"] },
        { id: 2, date: "2025_04_23_4", words: ["의존성", "implements"] },
        { id: 3, date: "2025_04_24_3", words: ["전략 패턴", "옵저버 패턴"] },
        { id: 4, date: "2025_04_22_2", words: ["싱글톤 패턴", "팩토리 패턴", "MVC 패턴", "에라 모르겠다", "수수수코드노바"] },
        { id: 5, date: "2025_04_22_1", words: ["싱글톤 패턴", "팩토리 패턴", "MVC 패턴", "에라 모르겠다", "수수수코드노바"] },
        { id: 6, date: "2025_04_22_1", words: ["싱글톤 패턴", "팩토리 패턴", "MVC 패턴", "에라 모르겠다", "수수수코드노바"] },
        { id: 7, date: "2025_04_22_1", words: ["싱글톤 패턴", "팩토리 패턴", "MVC 패턴", "에라 모르겠다", "수수수코드노바"] },
        { id: 8, date: "2025_04_22_1", words: ["싱글톤 패턴", "팩토리 패턴", "MVC 패턴", "에라 모르겠다", "수수수코드노바"] },
    ];

    const [selectedWords, selSelectedWords] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + categories.length) % categories.length);
    }

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % categories.length);
    };

    const currentCategory = categories[currentIndex]

    const handleReportClick = (words) => {
        selSelectedWords(words);
    };

    return (
        <div 
            className="w-screen h-screen flex flex-col items-center justify-center bg-no-repeat bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundImg})`}}
        >
            <Header/>

            <div className='flex flex-row justify-center items-center w-full gap-16'>
                {/* 리포트 내용이 출력되는 컨텐츠 박스 */}
                <div className="w-[35vw] h-[40vw] border-4 rounded-2xl "
                    style={{
                        borderColor: '#51E2F5',
                        backgroundColor: '#FFFFFF'
                    }}
                >

                </div>

                {/* 내 리포트 목록을 확인하는 컨텐츠 박스 */}
                <div className='relative w-[40vw] h-[30vw] max-w-5xl py-12 px-6 flex flex-row items-center gap-6 rounded-2xl'
                    style={{
                        backgroundImage: `url(${box})`,
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '100% 100%'
                    }}
                >

                    {/* <img
                        src={titleBox}
                        alt="타이틀 박스"
                        className="absolute -top-[17.5%] left-1/2 -translate-x-1/2 w-[35%] h-auto object-contain z-10"
                      /> */}
                    {/* 타이틀 텍스트 */}
                    <div className="absolute top-[1%] left-1/2 -translate-x-1/2 font-bold text-2xl text-white drop-shadow-md z-20"
                        style={{ color: '#1C1C1C' }}
                    >
                        {currentCategory.title}
                    </div>
                    


                    {/* ◀ 왼쪽 버튼 */}
                    <button onClick={handlePrev} className="flex flex-col items-center cursor-pointer">
                        <img src={leftBtn} alt="왼쪽" className="w-5 h-5 hover:scale-110 transition" />
                    </button>

                    <div className="flex flex-row gap-6 items-center w-[100%] h-[100%]">

                        <div className="text-2xl w-[50%] h-[90%] text-white py-6 mt-8">
                            <div className="mb-4">
                                리포트 목록
                            </div>

                            <div className="w-full h-[75%] border-2 rounded-2xl p-4 text-xl overflow-y-auto"
                                style={{
                                    borderColor : '#51E2F5'
                                }}
                            >
                                {reports.map((report) => (
                                    <div
                                        key={report.id}
                                        className="mb-1 cursor-pointer hover:bg-[#2a2a2a] p-1 rounded-lg transition"
                                        onClick={() => handleReportClick(report.words)}
                                    >
                                         {report.date}
                                    </div>
                                ))}
                            </div>

                        </div>

                        {/* 오른쪽 선택된 단어 리스트 */}
                        <div className="text-white text-2xl w-[60%] h-[90%] flex flex-col py-6 mt-8">
                            <div className="mb-4">선택한 단어</div>

                            <div className="w-full h-[75%] border-2 rounded-2xl p-4 text-xl"
                                style={{ borderColor: '#51E2F5' }}>
                                {selectedWords.length === 0 ? (
                                <div className="text-gray-400">리포트를 선택하세요</div>
                                ) : (
                                selectedWords.map((word, idx) => (
                                  <div key={idx} className="mb-2">{word}</div>
                                ))
                                )}
                            </div>
                        </div>

                    </div>
                
                {/* ▶ 오른쪽 버튼 */}
                <button onClick={handleNext} className="flex flex-col items-center cursor-pointer">
                    <img src={rightBtn} alt="오른쪽" className="w-5 h-5 hover:scale-110 transition" />
                </button>

                </div>
            </div>
            

        </div>
    );
};

export default MyReport;