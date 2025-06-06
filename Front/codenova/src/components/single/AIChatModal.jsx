import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import ChatBox from "./ChatBox";

const AIChat = ({isOpen , onClose, codeId}) => {
    
    const [position, setPosition] = useState({ x: 0, y: 0 });


    // isOpen 되면 위치 초기화
    useEffect(() => {
        if (isOpen) {
            setPosition({ x: 0, y: 0 });
        }
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    drag
                    dragMomentum={false}
                    style={{ x: position.x, y: position.y }}
                    onDragEnd={(e, info) => {
                      setPosition({ x: info.point.x, y: info.point.y });
                    }}
                    initial={{ clipPath: 'circle(0% at 90% 90%)', opacity: 0 }}
                    animate={{ clipPath: 'circle(150% at 90% 90%)', opacity: 1 }}
                    exit={{ clipPath: 'circle(0% at 90% 90%)', opacity: 0 }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                    className="fixed bottom-8 right-8 w-[50%] h-[70%] bg-white shadow-2xl rounded-2xl z-[10] p-4 origin-bottom-right"
                >
                    <div className="flex justify-between items-center mb-2 border-b-2 h-[10%]">
                        <h2 className="text-lg font-bold">💬 AI 개발자</h2>
                        <button onClick={onClose} className="text-2xl hover:scale-110 transition">×</button>
                    
                    </div>
                    
                    <ChatBox
                        codeId = {codeId}
                    />
                
                </motion.div>
            )}
        </AnimatePresence>

    )
}

export default AIChat;