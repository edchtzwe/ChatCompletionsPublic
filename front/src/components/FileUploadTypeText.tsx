import React from 'react';
import axios from "axios";
import { FaFileCode } from 'react-icons/fa';

import {useChatSessionStore} from "@store/ChatSessionStore";
import {useChatStore} from "@store/ChatHistoryStore";

// Tooltip CSS
const tooltipStyles = `
.file-upload-tooltip {
  position: relative;
  display: inline-block;
}
.file-upload-tooltip .tooltip-content {
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
.file-upload-tooltip:hover .tooltip-content {
  visibility: visible;
  opacity: 1;
}
`;

const FileUploadTypeText: React.FC = () => {
  let isAllDisabled = useChatSessionStore((state) => state.isAllDisabled);
  let selectedSession = useChatSessionStore((state) => state.selectedSession);
  const baseUrl = useChatSessionStore.getState().baseUrl;
  const setIsAllDisabled = useChatSessionStore((state) => state.setIsAllDisabled);
  const addMessage = useChatStore.getState().addMessage;
  const setSelectedSession = useChatSessionStore((state) => state.setSelectedSession);
  const pushSession = useChatSessionStore((state) => state.pushSession);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return false;
    }

    const sortedFiles = Array.from(files).sort((a, b) => a.name.localeCompare(b.name));

    const formData = new FormData();
    sortedFiles.forEach((file) => formData.append("files", file));

    if (selectedSession) {
      formData.append("sessionId", selectedSession);
    }

    setIsAllDisabled(true);

    try {
      const response = await axios.post(`${baseUrl}/chat/text-file-as-raw-text`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      addMessage(response.data.message, "system");

      // Set the new session id
      const newSessionId = response.data.sessionId;
      if (!selectedSession && newSessionId) {
        pushSession(newSessionId);
        setSelectedSession(newSessionId);
      }

      useChatStore.getState().fetchChatHistory(newSessionId);
    }
    catch (error) {
      console.error("Error uploading file:", error);
    }
    finally {
      setIsAllDisabled(false);
    }
  };

  const tooltipText = `Upload code or text files here.`;

  return (
    <>
      <style>{tooltipStyles}</style>
      <div className="fixed bottom-32 left-0 p-4" style={{ zIndex: 10000 }}>
        <div className="file-upload-tooltip">
          <label className="cursor-pointer text-white-500 hover:text-blue-400">
            <FaFileCode size={38} />
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              disabled={isAllDisabled}
            />
          </label>
          <span className="tooltip-content">
            {tooltipText}
          </span>
        </div>
      </div>
    </>
  );
};

export default FileUploadTypeText;
