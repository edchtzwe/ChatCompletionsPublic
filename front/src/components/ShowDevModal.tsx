import axios from "axios";
import React, { useState, useEffect, useRef } from 'react';

import { useChatSessionStore } from "@store/ChatSessionStore";

const baseUrl = useChatSessionStore.getState().baseUrl;

const ShowDevModal: React.FC = () => {
  let showDevModal = useChatSessionStore((state) => state.showDevModal);
  let devMessage = useChatSessionStore((state) => state.devMessage);
  const setDevMessage = useChatSessionStore((state) => state.setDevMessage);
  const setIsAllDisabled = useChatSessionStore((state) => state.setIsAllDisabled);
  const setShowDevModal = useChatSessionStore((state) => state.setShowDevModal);
  let selectedSession = useChatSessionStore((state) => state.selectedSession);
  const setSelectedSession = useChatSessionStore((state) => state.setSelectedSession);
  const pushSession = useChatSessionStore((state) => state.pushSession);
  const setFeedback = useChatSessionStore((state) => state.setFeedback);

  const [hold, setHold] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (showDevModal && textareaRef.current) {
      // Small timeout to ensure the DOM is fully rendered
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 0);
    }
  }, [showDevModal]);

  const submitDeveloperMessage = async () => {
    setHold(true);
    setShowDevModal(false);
    
    try {
      const res = await axios.post(`${baseUrl}/chat`, {
        devMessage,
        sessionId: selectedSession || undefined,
      });
      
      const { reply, sessionId: newSessionId } = res.data;

      console.log(res.data);
      console.log(selectedSession);
      console.log(newSessionId);
      if (!selectedSession && newSessionId) {
        pushSession(newSessionId);
        setSelectedSession(newSessionId);
      }
    }
    catch (error) {
      console.error("Error trying to set Developer Message", error);
    }
    finally {
      setFeedback({
        type: "success",
        message: "Developer message set successfully!",
      });
      setHold(false);
      setIsAllDisabled(false);
    }
  };

  const cancelHandler = () => {
    setShowDevModal(false);
    setIsAllDisabled(false);
  };

  return (
    <>
      {showDevModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded shadow-lg max-w-xl w-full">
            <h2 className="text-lg font-semibold mb-4">Set Developer Message</h2>
            <textarea
              ref={textareaRef}
              className="w-full bg-gray-700 border border-gray-600 rounded p-3 text-gray-200 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={8}
              value={devMessage}
              onChange={(e) => setDevMessage(e.target.value)}
              disabled={hold}
              placeholder="Enter your system instructions here..."
            />
            <div className="flex justify-end gap-2">
              <button
                className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 hover:cursor-pointer"
                onClick={cancelHandler}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:cursor-pointer"
                onClick={submitDeveloperMessage}
                disabled={hold}
              >
                Set Developer Message
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ShowDevModal;
