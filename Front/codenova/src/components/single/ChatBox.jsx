import { useState , useRef, useEffect, useCallback } from "react";
import { chatBotRequest } from "../../api/singleApi";
import { useChatStore } from "../../store/useChatStore";
// import ReactMarkdown from 'react-markdown';
// import remarkGfm from 'remark-gfm'
// import remarkBreaks from 'remark-breaks'


const ChatBox = ({codeId}) => {

    const addMessage = useChatStore((state) => state.addMessage);
    const replaceLastMessage = useChatStore((state) => state.replaceLastMessage);

    const [content, setContent] = useState([]);

    const [currentInput, setCurrentInput] = useState("")
    const inputAreaRef = useRef(null);
    const chatEndRef = useRef(null);


    useEffect(() => {            
        inputAreaRef.current.focus();
    }, []);

    useEffect(() => {
        const initial = useChatStore.getState().chats[codeId] ?? [];
        setContent(initial);

        const unsubscribe = useChatStore.subscribe(
            (state) => state.chats[codeId],
            (newChat) => {
                setContent(newChat ?? []);
            },
            { fireImmediately: false }
        );

        return () => unsubscribe();
    }, [codeId]);



    
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
        // console.log(content)
    }, [content]);


    const handleSubmit = async () => {

        if (!currentInput.trim()) return;
        
        const userMessage = currentInput; 
        
        setCurrentInput(""); 
        
        // console.log('Submit:', currentInput );
        
        const newMessage = {
            sender : "me",
            time : new Date().toLocaleString(),
            message : userMessage
        } 
        addMessage(codeId, newMessage)
        // 그냥 바로 더하기
        setContent((prev) => [...prev, newMessage]);
    
        const AIMessage = {
            sender: "AI",
            time: new Date().toLocaleString(),
            message: "💬 AI가 입력중입니다...",
            loading: true
        } 
        addMessage(codeId, AIMessage);
        // 그냥 바로 더하기
        setContent((prev) => [...prev, AIMessage]);
        console.log('Store check', useChatStore.getState().chats[codeId]);
        console.log('Content check', content);
    
        try {
            const response = await chatBotRequest(userMessage);
            const { code, message } = response.status;
            if (code === 200){
                const AIResponse = {
                    sender: "AI",
                    time: new Date().toLocaleString(),
                    message: response.content.response
                }
                replaceLastMessage(codeId, AIResponse);
                setContent((prev) => [...prev.slice(0, -1), AIResponse]);
            } else{
                const AIResponse = {
                    sender: "AI",
                    time: new Date().toLocaleString(),
                    message: "⚠️ 오류: 응답 실패"
                }
                replaceLastMessage(codeId, AIResponse);
                setContent((prev) => [...prev.slice(0, -1), AIResponse]);
            }
        } catch (e) {
            const AIResponse = {
                    sender: "AI",
                    time: new Date().toLocaleString(),
                    message: "⚠️ 서버 오류 발생"
                }
                replaceLastMessage(codeId, AIResponse);
                setContent((prev) => [...prev.slice(0, -1), AIResponse]);
        }

    };

    return (
        <div className="w-full h-[90%] border-black flex flex-col">

            {/* 체팅 박스 */}
            <div className="w-full h-[90%] overflow-y-auto scrollbar-hide">
                {content.map((item, idx) => (
                    <div
                        key = {idx}
                        className = {`flex ${item.sender === "me" ? "justify-end" : "justify-start"}`}
                        ref={chatEndRef}
                    >
                        <div
                            className={`max-w-[60%] p-2 rounded-xl text-sm mb-2 ${
                              item.sender === "me"
                                ? "bg-blue-500 text-white rounded-br-none"
                                : "bg-gray-300 text-black rounded-bl-none"
                            }`}
                          >
                            
                            <div className="whitespace-pre-wrap">{item.message}</div>
                            <div className="text-sm text-right opacity-60 mt-1">{item.time}</div>
                        
                        </div>
                    </div>
                ))}
            </div>

            {/* 텍스트 인풋 박스 */}
            <div className="w-full h-[10%] flex items-center justify-center">
                <input type="text"
                    ref={inputAreaRef}
                    className="border-2 w-full h-[90%] rounded-xl relative px-2"
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleSubmit()
                        }
                    }}
                />

                {/* <button
                onClick = {() => {
                    
                }}
                className = "absolute z-[11] right-20 bottom-0.5 -translate-y-1/2 bg-blue-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-600 active:scale-95"
                >   
                    
                </button> */}

                <button
                onClick = {() => {
                    handleSubmit()
                }}
                className = "absolute z-[11] right-6 bottom-0.5 -translate-y-1/2 bg-blue-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-600 active:scale-95"
                >   
                    전송
                </button>
            </div>
            

        </div>

    )

}

export default ChatBox;
