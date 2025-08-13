import React from 'react';
import axios from "axios";

import { useChatSessionStore } from "@store/ChatSessionStore";


const SetDeveloperMessage: React.FC = () => {
  let isAllDisabled = useChatSessionStore((state) => state.isAllDisabled);
  const setIsAllDisabled = useChatSessionStore((state) => state.setIsAllDisabled);

  let selectedSession = useChatSessionStore((state) => state.selectedSession);

  const setDevMessage = useChatSessionStore.getState().setDevMessage;
  const setShowDevModal = useChatSessionStore.getState().setShowDevModal;

  const baseUrl = useChatSessionStore.getState().baseUrl;

  const fetchDeveloperMessage = async () => {
    setIsAllDisabled(true);

    try {
      if (selectedSession) {
        const res = await axios.post(`${baseUrl}/chat/get-developer-message`, {
          sessionId: selectedSession || undefined,
        });
        setDevMessage(res.data.message || "");
      }

      setShowDevModal(true);
    }
    catch (error) {
      console.error("Failed to fetch developer message:", error);
    }
    finally {
      // setIsAllDisabled(false); Doing this will just flip isAllDisabled. The logic in try would finish, and will not hold just because the modal is shown. Its lifecycle does not depend on the modal.
    }
  };

  return (
    <div className="flex flex-col items-center relative group">
      <button
        className="flex items-center justify-center border border-blue-500 rounded w-8 h-8
          bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 
          disabled:opacity-50 transition-all duration-200 ease-in-out transform hover:scale-105 
          active:scale-95 text-white font-bold hover:cursor-pointer"
        onClick={fetchDeveloperMessage}
        disabled={isAllDisabled}
      >
        导
      </button>
      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 text-xs bg-gray-700 
                rounded-lg shadow-lg transition-opacity opacity-0 group-hover:opacity-100 delay-0 
                whitespace-normal break-words max-w-xs text-center">
        Set&#8203;Developer&#8203;Message
      </div>
    </div>
  );
};

export default SetDeveloperMessage;
