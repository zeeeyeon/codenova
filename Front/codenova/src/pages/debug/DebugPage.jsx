import backgroundImg from '../../assets/images/single_background.jpg'

const DebugPage = () => {

    

    return (
        <div className="w-screen h-screen flex items-center justify-center bg-no-repeat bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundImg})`}}
        >
            <div className="w-[90%] h-[90%] border-2 flex items-end"
                style={{
                    borderColor: '#51E2F5',
                    backgroundColor: '#1C1C1C',
                    // opacity: 0.7
                }}
            >
                {/* 목록 컨테이너 */}
                <div className='w-[20%] h-full border-r-2 flex flex-col'
                    style={{
                        borderColor: '#51E2F5',
                    }}
                >
                    <div className="w-full h-[10%] border-b-2 text-white text-5xl grid place-items-center"
                        style={{
                            borderColor: '#51E2F5',
                        }}
                    >
                        PYTHON
                    </div>

                </div>

                {/* 코드 타이핑 박스 */}
                <div className="w-[40%] h-[95%] border-2">

                </div>

                {/* 디버깅 박스 */}
                <div className="w-[40%] h-[95%] border-2">

                </div>

            </div>
        </div>
    );
}

export default DebugPage;