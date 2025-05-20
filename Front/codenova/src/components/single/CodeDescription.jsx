import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import java from 'highlight.js/lib/languages/java';
import python from 'highlight.js/lib/languages/python';
import sql from 'highlight.js/lib/languages/sql';
import 'highlight.js/styles/atom-one-dark.css';
import { codeDescription } from '../../api/singleApi';
import { useState, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import chatBtn from '../../assets/images/chat_bot.png'
import AIChat from './AIChatModal';
import copyIcon from '../../assets/images/copy_icon.png'
import QnA1Img from '../../assets/images/QnA1.png'
import QnA2Img from '../../assets/images/QnA2.png'
import QnA3Img from '../../assets/images/QnA3.png'

// 등록
hljs.registerLanguage('java', java);
hljs.registerLanguage('python', python);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('sql', sql);


const CodeDescription = ({onClose, lang, codeId}) => {

    const [code, setCode] = useState("");
    const [description, setDescription] = useState("");
    const [isAIChat, setIsAIChat] = useState(false);
    const [copied, setCopied] = useState(false);

    const [qnAcurrnetIndex, setQnACurrentIndex] = useState(0);
    const QnABtns = [QnA1Img, QnA2Img, QnA3Img];

    useEffect(() => {
            if (codeId){
                getCodeDescription(codeId)
            }
        },[codeId])

    const getCodeDescription = async () => {
        try {
            const response = await codeDescription(codeId)
            const {code, message} = response.status
            if (code === 200) {
                setCode(response.content.annotation);
                setDescription(response.content.descript);
            } else {
                // console.log("error", message)
            }
        } catch (e) {
            throw e
        }
    }

    const handleCopyDescrip = (num) => {
        
        // 코드를 복사하고 싶은 경우
        if (num === 1) {
            navigator.clipboard.writeText(code)
                .then(() => {
                    setCopied(true)
                    setTimeout(() => setCopied(false), 1500)
                })
                .catch(e => {
                    // console.log(e);
                })

        // 설명을 복사하고 싶은 경우
        } else {
            navigator.clipboard.writeText(description)
                .then(() => {
                    setCopied(true)
                    setTimeout(() => setCopied(false), 1500)
                }) 
                .catch(e => {
                    // console.log(e);
                })  
        }
        
    }

    useEffect(() =>  {
        const QnAInterval = setInterval(() => {
            setQnACurrentIndex((prev) => (prev + 1) % 3); 
        }, 800);

        return () => {
            clearInterval(QnAInterval);
        }
    }, [])

    const langFormat = useMemo(() => {
        if (lang === "JAVA") return "language-java";
        if (lang === "PYTHON") return "language-python";
        if (lang === "JS") return "language-javascript";
        if (lang === "SQL") return "language-sql";
        return "";
    }, [lang]);

    useEffect(() => {

        const codeBlocks = document.querySelectorAll('pre code.hljs');
        codeBlocks.forEach((block) => {
            block.removeAttribute('data-highlighted');  // ✅ highlight 초기화
        });
        hljs.highlightAll();  // ✅ 다시 적용
    }, [langFormat, code]);
    
    return (
        <div className="w-[90%] h-[90%] z-[9999] rounded-xl flex items-center justify-center border-2"
            style={{
                backgroundColor: '#111111',
                borderColor : "rgba(255, 255, 255, 0.1)"
            }}
        >
            <div className='absolute w-[5%] h-[5%] right-0 top-2 text-7xl text-gray-400 cursor-pointer transition-all duration-150 hover:brightness-110 hover:translate-y-[2px] hover:scale-[0.98] active:scale-[0.95]'
                onClick={onClose}
            >
                x
            </div>

            <div className="w-[99%] h-[98%] rounded-xl flex p-2 items-center justify-between"
            >
                
                <div className="w-[50%] h-full border-2 rounded-xl relative"
                    style={{
                        borderColor : "rgba(255, 255, 255, 0.1)",
                        backgroundColor: '#282c34'
                    }}
                >   
                    {/* 코드 설명 복사 버튼 */}
                    <img src={copyIcon} 
                        alt="복사아이콘"
                        className='absolute w-auto h-auto right-8 top-2 cursor-pointer transition-all duration-150 hover:brightness-110 hover:translate-y-[2px] hover:scale-[0.98] active:scale-[0.95]'
                        onClick={() => handleCopyDescrip(1)}    
                    />
                    {/* 코드 */}
                    <pre className='h-full w-full px-8 py-2'>
                        <code className={`${langFormat} block w-full h-full overflow-y-auto overflow-x-auto custom-scrollbar`}>
                            {code}
                        </code>
                    </pre>

                </div>

                <div className="w-[50%] h-full border-2 rounded-xl text-white p-4 relative"
                    style={{
                        borderColor : "rgba(255, 255, 255, 0.1)",
                        backgroundColor: '#1C1C1C'
                    }}
                >
                    {/* 코드 설명 */}
                    <div className='prose prose-invert max-w-none w-full h-full overflow-y-auto overflow-x-auto custom-scrollbar'>

                        {/* 코드 설명 복사 버튼 */}
                        <img src={copyIcon} 
                            alt="복사아이콘"
                            className='absolute w-auto h-auto right-8 top-2 cursor-pointer transition-all duration-150 hover:brightness-110 hover:translate-y-[2px] hover:scale-[0.98] active:scale-[0.95]'
                            onClick={() => handleCopyDescrip(2)}    
                        />
                         
                        <ReactMarkdown>{description}</ReactMarkdown>
                    </div>
                </div>

                {/* AI chat 버튼 */}
                <button
                  className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-400 shadow-lg hover:brightness-110 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center animate-float ring-2 ring-indigo-300/50 hover:ring-4"
                >
                    <img src={QnABtns[qnAcurrnetIndex]} alt={`코드설명버튼${qnAcurrnetIndex + 1}`} 
                        className= {`w-full cursor-pointer absolute -top-12 -right-6 will-change-transform animate-poke`}
                    />
                    <img 
                        src={chatBtn} 
                        alt="챗봇버튼" 
                        className="w-[70%] h-auto"
                        onClick={() => setIsAIChat(true)}
                            
                    />
                </button>
            </div>

            {copied && (
                <div className="absolute top-6 bg-black text-white text-sm px-3 py-1 rounded-lg shadow transition-opacity duration-300 z-50">
                    복사완료
                </div>
            )}

            <AIChat 
                isOpen = {isAIChat} 
                onClose={() => setIsAIChat(false)}
                codeId = {codeId}  
            />
        </div>
    )
}

export default CodeDescription;

