import { useChatSessionStore } from "@store/ChatSessionStore";
import axios from "axios";
import { useState, useEffect, useRef } from "react";
import { FaSave, FaTimes } from "react-icons/fa";

const NameSetter = () => {
    const BASE_URL = useChatSessionStore((state) => state.baseUrl);
    const setSessionNames = useChatSessionStore((state) => state.setSessionNames);
    const sessionNames = useChatSessionStore((state) => state.sessionNames);
    const setIsAllDisabled = useChatSessionStore((state) => state.setIsAllDisabled);
    const selectedSession = useChatSessionStore((state) => state.selectedSession);
    const isAllDisabled = useChatSessionStore((state) => state.isAllDisabled);

    const [isNaming, setIsNaming] = useState(false);
    const [sessionName, setSessionNameInput] = useState("");

    const [sessionNameMap, setSessionNameMap] = useState(new Map());
    useEffect(() => {
        if (sessionNames) {
            const map = new Map(sessionNames.map(session => [session.session_id, session]));
            setSessionNameMap(map);
        }
    }, [sessionNames]);

    const inputRef = useRef(null);
    useEffect(() => {
        if (isNaming && selectedSession && sessionNameMap.size > 0) {
            const currentSession = sessionNameMap.get(selectedSession);
            if (currentSession) {
                setSessionNameInput(currentSession.name || "");

                setTimeout(() => {
                    if (inputRef.current) {
                        inputRef.current.focus();
                        inputRef.current.select();
                    }
                }, 0);
            }
        }
    }, [isNaming, selectedSession, sessionNameMap]);

    const handleSaveName = async () => {
        if (!selectedSession) {
            console.error("No selected session....");
            return;
        }
        if (!sessionName.trim()) {
            console.error("Cannot set session name to empty...");
            return;
        }
        try {
            setIsAllDisabled(true);
            const response = await axios.get(`${BASE_URL}/chat/save-session-name`, {
                params: {
                    sessionId: selectedSession,
                    name: sessionName.trim()
                }
            });
            if (response.status === 200 && response.data) {
                setSessionNames(response.data);
                setSessionNameInput('');
                setIsNaming(false);
            } else {
                console.error("The server ran into a problem that is not an error...");
            }
        } catch (error) {
            console.error('Error saving session name:', error);
        } finally {
            setIsAllDisabled(false);
        }
    };

    const handleCancelNaming = () => {
        setSessionNameInput('');
        setIsNaming(false);
    };

    return (
        <div className="relative">
            <div className="relative group">
                <button
                    className={`flex items-center justify-center bg-yellow-400 border border-yellow-500 rounded w-8 h-8
      hover:bg-yellow-500 active:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-300
      transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95
      hover:cursor-pointer disabled:cursor-not-allowed text-gray-900 font-bold
      ${isNaming ? "z-50" : ""}`}
                    style={{ boxShadow: isNaming ? "0 0 0 2px #facc15" : "none" }}
                    onClick={() => setIsNaming((prev) => !prev)}
                    disabled={isAllDisabled || !selectedSession}
                >
                    名
                </button>
                <div
                    className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 text-xs bg-gray-700
      rounded-lg shadow-lg transition-opacity duration-200
      ${isNaming ? "opacity-0 pointer-events-none" : "opacity-0 group-hover:opacity-100 pointer-events-none"}
      whitespace-normal break-words max-w-xs text-center z-50`}
                >
                    Set&#8203;Session&#8203;Name
                </div>
            </div>
            {isNaming && (
                <div
                    className="flex gap-2 items-center p-3 rounded  absolute mt-2 z-50"
                    style={{ top: "1.5rem", transform: "translateX(9%)", minWidth: "220px" }}
                >
                    <input
                        ref={inputRef}
                        type="text"
                        className="p-2 bg-gray-700 border border-gray-600 rounded flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white hover:scale-105"
                        placeholder="Enter session name"
                        value={sessionName}
                        onChange={(e) => setSessionNameInput(e.target.value)}
                        disabled={isAllDisabled}
                        style={{ minWidth: "100px" }}
                    />
                    <button
                        className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 rounded w-8 h-8 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:cursor-pointer hover:scale-105"
                        onClick={handleSaveName}
                        title="Save session name"
                        disabled={isAllDisabled}
                        style={{ minWidth: "2rem", minHeight: "2rem" }}
                    >
                        <FaSave className="text-white" />
                    </button>
                    <button
                        className="flex items-center justify-center bg-gray-600 hover:bg-gray-700 rounded w-8 h-8 focus:outline-none focus:ring-2 focus:ring-gray-500 hover:cursor-pointer hover:scale-105"
                        onClick={handleCancelNaming}
                        title="Cancel naming"
                        disabled={isAllDisabled}
                        style={{ minWidth: "2rem", minHeight: "2rem" }}
                    >
                        <FaTimes className="text-white" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default NameSetter;
