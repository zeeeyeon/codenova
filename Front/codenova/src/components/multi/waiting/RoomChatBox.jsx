import React, { useState, useRef, useEffect } from "react";

const RoomChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messageListRef = useRef(null);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, input]);
    setInput("");
  };

  // ✅ 자동 스크롤
  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);  // messages 업데이트 될 때마다 실행

  return (
    <div className="w-[73%] h-[220px] bg-[#0D0D2B] bg-opacity-70 rounded-2xl flex flex-col p-4 mt-5">
      
      {/* 채팅 내용 영역 */}
      <div
        ref={messageListRef}
        className="h-[140px] overflow-y-auto mb-2 custom-scrollbar text-white text-sm space-y-1 px-1"
      >
        {messages.map((msg, index) => (
          <div key={index}>{msg}</div>
        ))}
      </div>

      {/* 입력창 */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1 px-4 py-2 rounded-md text-black text-sm"
          placeholder="메시지를 입력하세요"
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
