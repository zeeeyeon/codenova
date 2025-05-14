import React, { useState, useRef, useEffect } from "react";

const RoomChatBox = ({messages = [], onSendMessage }) => {
  const [input, setInput] = useState("");
  const messageListRef = useRef(null);

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage?.({ type: "chat", text: input });
    setInput("");
  };

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="w-[73%] h-[230px] bg-[#0D0D2B] bg-opacity-70 rounded-2xl flex flex-col p-4 mt-7">
      <div
        ref={messageListRef}
        className="h-[150px] overflow-y-auto custom-scrollbar text-white text-sm space-y-1 px-1"
      >
        {messages.map((msg, index) => (
          <div
            key={index}
              className={`text-m ${
                msg.text.includes("입장") ? "text-green-400 text-center" :
                msg.text.includes("퇴장") ? "text-red-400 text-center" :
                msg.text.includes("게임을 시작") ? "text-yellow-300 text-center" :
                "text-white"
              }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <div className="flex gap-2 mt-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1 px-4 py-2 rounded-md text-black text-m"
          placeholder="메시지를 입력하세요."
        />
        <button
          onClick={handleSend}
          className="bg-fuchsia-500 text-white rounded-md px-4 hover:brightness-110 active:scale-95 transition"
        >
          전송
        </button>
      </div>
    </div>
  );
};

export default RoomChatBox;