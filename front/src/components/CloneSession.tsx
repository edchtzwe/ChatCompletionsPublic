import React from 'react';
import axios from 'axios';
import { FaClone } from 'react-icons/fa';

import { useChatSessionStore } from '@store/ChatSessionStore';
import { useChatStore } from '@store/ChatHistoryStore';

// Tooltip CSS
const tooltipStyles = `
.clone-session-tooltip {
  position: relative;
  display: inline-block;
}
.clone-session-tooltip .tooltip-content {
  visibility: hidden;
  width: 220px;
  background-color: #222;
  color: #fff;
  text-align: left;
  border-radius: 6px;
  padding: 10px;
  position: absolute;
  left: 120%;
  top: 50%;
  transform: translateY(-50%);
  z-index: 9999;
  white-space: pre-line;
  font-size: 14px;
  opacity: 0;
  transition: opacity 0.2s;
}
.clone-session-tooltip:hover .tooltip-content {
  visibility: visible;
  opacity: 1;
}
`;

const CloneSessionButton: React.FC = () => {
  const baseUrl = useChatSessionStore((state) => state.baseUrl);
  const isAllDisabled = useChatSessionStore((state) => state.isAllDisabled);
  const selectedSession = useChatSessionStore((state) => state.selectedSession);
  const setIsAllDisabled = useChatSessionStore((state) => state.setIsAllDisabled);
  const setSelectedSession = useChatSessionStore((state) => state.setSelectedSession);
  const pushSession = useChatSessionStore((state) => state.pushSession);
  const fetchChatHistory = useChatStore((state) => state.fetchChatHistory);
  const setErrorMessage = useChatSessionStore((state) => state.setErrorMessage);
  const setFeedback = useChatSessionStore((state) => state.setFeedback);

  const handleCloneSession = async () => {
    if (!selectedSession) {
      return;
    }

    setIsAllDisabled(true);

    let newSessionId = null;
    try {
      const response = await axios.get(`${baseUrl}/chat/clone-session`, {params: {sessionId: selectedSession}});

      newSessionId = response.data.sessionId;
      if (newSessionId) {
        pushSession(newSessionId);
        setSelectedSession(newSessionId);
        fetchChatHistory(newSessionId);
      } else {
        throw new Error("Failed to clone the session...");
      }
    } catch (error) {
      console.error("Error cloning session:", error);
      let serverMsg =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        (typeof error?.response?.data === "string" ? error.response.data : null) ||
        error?.message ||
        "Unknown error";

      setErrorMessage(serverMsg);
    } finally {
      setFeedback({
        type: "success",
        message: "Session cloned with Session ID: " + newSessionId,
      });
      setIsAllDisabled(false);
    }
  };

  const tooltipText = `Clone the current session.`;

  return (
    <>
      {/* Tooltip styles */}
      <style>{tooltipStyles}</style>
      <div className="fixed bottom-60 left-1 p-4" style={{ zIndex: 10000 }}>
        <div className="clone-session-tooltip">
          <button
            className="cursor-pointer text-white-500 hover:text-green-400 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={handleCloneSession}
            disabled={isAllDisabled || !selectedSession}
          >
            <FaClone size={24} />
          </button>
          <span className="tooltip-content">
            {tooltipText}
          </span>
        </div>
      </div>
    </>
  );
};

export default CloneSessionButton;
