import React, { useRef, useState, useEffect } from 'react';
import { useChatSessionStore } from "@store/ChatSessionStore";

const CONTEXT_OPTIONS = [2, 4, 6, 10, 16, 32, 50];

const ChatHistoryDepthControl: React.FC = () => {
    const chatHistoryDepth = useChatSessionStore((state) => state.chatHistoryDepth);
    const setChatHistoryDepth = useChatSessionStore((state) => state.setChatHistoryDepth);
    const isAllDisabled = useChatSessionStore((state) => state.isAllDisabled);
    const inputRef = useRef<HTMLInputElement>(null);

    const [clickCount, setClickCount] = useState(0);
    const [clickTimer, setClickTimer] = useState<NodeJS.Timeout | null>(null);

    // Context menu state
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number } | null>(null);

    // Clean up timer on component unmount
    useEffect(() => {
        return () => {
            if (clickTimer) {
                clearTimeout(clickTimer)
            };
        };
    }, [clickTimer]);

    // Close context menu on click outside
    useEffect(() => {
        if (contextMenu) {
            const handleClick = () => setContextMenu(null);
            window.addEventListener('click', handleClick);
            return () => window.removeEventListener('click', handleClick);
        }
    }, [contextMenu]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const numericValue = parseInt(value, 10);
        if (!isNaN(numericValue) && numericValue > 0) {
            setChatHistoryDepth(numericValue);
        }
    };

    const handleClick = (e: React.MouseEvent<HTMLInputElement>) => {
        setClickCount(prev => prev + 1);

        if (clickTimer) {
            clearTimeout(clickTimer);
        }

        const timer = setTimeout(() => {
            if (clickCount === 0) {
                if (inputRef.current) {
                    inputRef.current.select();
                }
            } else if (clickCount === 1) {
                setChatHistoryDepth(chatHistoryDepth + 4);
            } else if (clickCount === 2) {
                setChatHistoryDepth(chatHistoryDepth + 10);
            }

            setClickCount(0);
            setClickTimer(null);
        }, 250);

        setClickTimer(timer);
    };

    // Handle right click (context menu)
    const handleContextMenu = (e: React.MouseEvent<HTMLInputElement>) => {
        e.preventDefault();
        setContextMenu({
            x: e.clientX,
            y: e.clientY
        });
    };

    // Handle context menu selection
    const handleContextMenuSelect = (value: number) => {
        setChatHistoryDepth(value);
        setContextMenu(null);
    };

    return (
        <div className="flex flex-col items-center relative group">
            <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                className="w-9 h-9 text-center rounded-md font-semibold
                    border border-gray-300 shadow
                    focus:outline-none focus:ring-2 focus:ring-cyan-500
                    transition-all duration-150
                    bg-[#00E5CE] text-gray-900
                    disabled:cursor-not-allowed"
                value={chatHistoryDepth}
                onChange={handleChange}
                onClick={handleClick}
                onContextMenu={handleContextMenu}
                disabled={isAllDisabled}
                min={1}
                style={{
                    MozAppearance: 'textfield',
                    WebkitAppearance: 'none',
                    appearance: 'none'
                }}
            />
            {!contextMenu && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 text-xs bg-gray-700 
                rounded-lg shadow-lg transition-opacity opacity-0 group-hover:opacity-100 delay-0 
                whitespace-normal break-words max-w-xs text-center">
                    Chat&#8203;History&#8203;Depth<br />
                </div>
            )}

            {contextMenu && (
                <ul
                    className="fixed z-50 bg-white border border-gray-300 rounded shadow-lg py-1"
                    style={{
                        top: contextMenu.y,
                        left: contextMenu.x,
                        minWidth: 80
                    }}
                >
                    {CONTEXT_OPTIONS.map((option) => (
                        <li
                            key={option}
                            className="px-4 py-2 hover:bg-cyan-100 cursor-pointer text-gray-900"
                            onClick={() => handleContextMenuSelect(option)}
                        >
                            {option}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ChatHistoryDepthControl;
