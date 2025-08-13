import React, { useState } from "react";
import { useChatSessionStore } from "@store/ChatSessionStore";
import { FaSpinner, FaPaperPlane } from "react-icons/fa";
import { useChatService } from "@services/ChatServices";

const ChatInput: React.FC = () => {
  const [input, setInput] = useState("");
  const disabled = useChatSessionStore((state) => state.isAllDisabled);
  const isSending = useChatSessionStore((state) => state.isBusy);
  const { sendChatMessage } = useChatService();

  const handleSend = async () => {
    if (!input.trim() || disabled) return;
    const message = input;
    setInput("");
    await sendChatMessage(message);
  };

  return (
    <div className="sticky bottom-0 left-0 w-full bg-gray-800 p-4 border-t border-gray-700 flex flex-col items-center">
      {isSending && (
        <div className="w-full bg-gray-700 h-2 overflow-hidden rounded mb-2">
          <div className="w-1/2 bg-blue-500 h-full animate-pulse mx-auto"></div>
        </div>
      )}
      <div className="flex items-center w-full">
        <textarea
          id="chat-input"
          rows={1}
          className="flex-1 p-3 bg-gray-700 border border-gray-600 text-gray-200 rounded-lg"
          placeholder="Enter your prompt here... (ENTER to send)"
          value={input}
          disabled={disabled}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          style={{ overflow: "auto", maxHeight: "100px" }}
        />
        <button
          className="ml-3 bg-blue-600 text-white rounded-full p-3 shadow-md hover:scale-105 active:scale-95 hover:cursor-pointer"
          onClick={handleSend}
          disabled={disabled || !input.trim()}
        >
          {isSending ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
