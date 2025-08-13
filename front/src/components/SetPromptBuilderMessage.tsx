import React from 'react';
import { FaPen, FaRegFileAlt } from 'react-icons/fa';
import { useChatSessionStore } from '@store/ChatSessionStore';

// Tooltip CSS
const tooltipStyles = `
.prompt-builder-tooltip {
  position: relative;
  display: inline-block;
}
.prompt-builder-tooltip .tooltip-content {
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
.prompt-builder-tooltip:hover .tooltip-content {
  visibility: visible;
  opacity: 1;
}
`;

const SetPromptBuilderMessage: React.FC = () => {
  const baseUrl = useChatSessionStore((state) => state.baseUrl);
  const isAllDisabled = useChatSessionStore((state) => state.isAllDisabled);
  const setIsAllDisabled = useChatSessionStore((state) => state.setIsAllDisabled);
  const selectedSession = useChatSessionStore((state) => state.selectedSession);
  const setPromptBuilderMessage = useChatSessionStore((state) => state.setPromptBuilderMessage);
  const setShowPromptBuilderModal = useChatSessionStore((state) => state.setShowPromptBuilder);
  const setErrorMessage = useChatSessionStore((state) => state.setErrorMessage);

  const showPromptBuilderModal = async () => {
    setIsAllDisabled(true);
    setShowPromptBuilderModal(true);
  };

  const tooltipText = `Set the Prompt Builder message.`;

  return (
    <>
      <style>{tooltipStyles}</style>
      <div className="fixed bottom-18 left-0 p-4" style={{ zIndex: 10000 }}>
        <div className="prompt-builder-tooltip" style={{ position: "relative" }}>
          <button
            className="cursor-pointer text-white-500 hover:text-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={showPromptBuilderModal}
            disabled={isAllDisabled}
            style={{ position: "relative" }}
          >
            <FaRegFileAlt size={38} />
            <FaPen
              size={18}
              style={{
                position: "absolute",
                bottom: 4,
                right: 4,
                background: "white",
                borderRadius: "50%",
                padding: 2,
                color: "#1e293b"
              }}
            />
          </button>
          <span className="tooltip-content">
            {tooltipText || "Open freetext modal"}
          </span>
        </div>
      </div>
    </>
  );
};

export default SetPromptBuilderMessage
