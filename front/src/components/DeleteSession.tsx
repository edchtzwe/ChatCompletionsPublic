// import SessionCommons from "@services/SessionCommons";
import SessionCommons from "@services/SessionCommons";
import { useChatSessionStore } from "@store/ChatSessionStore";
import axios from "axios";
import { useState } from "react";
import { FaTrash, FaTimes } from "react-icons/fa";

const DeleteSessionButton = () => {
    const BASE_URL = useChatSessionStore((state) => state.baseUrl);
    const selectedSession = useChatSessionStore((state) => state.selectedSession);
    const setSelectedSession = useChatSessionStore((state) => state.setSelectedSession);
    const setIsAllDisabled = useChatSessionStore((state) => state.setIsAllDisabled);
    const isAllDisabled = useChatSessionStore((state) => state.isAllDisabled);
    const setSessionNames = useChatSessionStore((state) => state.setSessionNames);

    const [isPromptOpen, setIsPromptOpen] = useState(false);

    const handleDeleteSession = async () => {
        if (!selectedSession) {
            console.error("No selected session to delete.");
            return;
        }

        try {
            setIsAllDisabled(true);
            const response = await axios.delete(`${BASE_URL}/chat/delete-session`, {
                data: { sessionId: selectedSession }
            });

            if (response.status === 200 && response.data) {
                setSelectedSession("");
                SessionCommons.fetchSessions(BASE_URL, setSessionNames);
                setIsPromptOpen(false);
            } else {
                console.error("Server responded with a non-error issue.");
            }
        } catch (error) {
            console.error("Error deleting session:", error);
        } finally {
            setIsAllDisabled(false);
        }
    };

    return (
        <div className="relative">
            <div className="relative group">
                <button
                    className={`flex items-center justify-center bg-red-700 border border-red-800 rounded w-8 h-8
                    hover:bg-red-800 active:bg-red-900 focus:outline-none focus:ring-2 focus:ring-red-500
                    transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95
                    hover:cursor-pointer disabled:cursor-not-allowed text-white font-bold`}
                    onClick={() => setIsPromptOpen(true)}
                    disabled={isAllDisabled || !selectedSession}
                >
                    滅
                </button>
                <div
                    className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 text-xs bg-gray-700
                    rounded-lg shadow-lg transition-opacity duration-200
                    opacity-0 group-hover:opacity-100 pointer-events-none
                    whitespace-normal break-words max-w-xs text-center z-50`}
                >
                    Delete Session
                </div>
            </div>

            {isPromptOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-4 w-64">
                    <p className="text-white text-sm mb-4">
                        Are you sure you want to delete this session? <br />
                        <span className="text-red-500 font-bold">This action is permanent and cannot be undone.</span>
                    </p>
                    <div className="flex justify-end gap-2">
                        <button
                            className="flex items-center justify-center bg-gray-600 hover:bg-gray-700 rounded px-3 py-1 text-white focus:outline-none focus:ring-2 focus:ring-gray-500 hover:scale-105 transition-all duration-200 ease-in-out hover:cursor-pointer"
                            onClick={() => setIsPromptOpen(false)}
                            disabled={isAllDisabled}
                        >
                            <FaTimes className="mr-1" /> Cancel
                        </button>
                        <button
                            className="flex items-center justify-center bg-red-700 hover:bg-red-800 rounded px-3 py-1 text-white focus:outline-none focus:ring-2 focus:ring-red-500 hover:scale-105 transition-all duration-200 ease-in-out hover:cursor-pointer"
                            onClick={handleDeleteSession}
                            disabled={isAllDisabled}
                        >
                            <FaTrash className="mr-1" /> Delete
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeleteSessionButton;
