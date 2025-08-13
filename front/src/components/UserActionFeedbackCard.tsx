import { useChatSessionStore } from '@store/ChatSessionStore';
import React, { useEffect, useState, useRef } from 'react';

const feedbackIcons = {
    info: 'ℹ️',
    error: '❌',
    success: '✅',
};

const FeedbackCard = () => {
    const feedback = useChatSessionStore((state) => state.feedback);
    const setFeedback = useChatSessionStore((state) => state.setFeedback);
    const [visible, setVisible] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (feedback) {
            setVisible(true);
            timerRef.current = setTimeout(() => {
                setVisible(false);
                setFeedback(null);
            }, 3000);
        }

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [feedback, setFeedback]);

    const handleMouseEnter = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
    };

    const handleMouseLeave = () => {
        timerRef.current = setTimeout(() => {
            setVisible(false);
            setFeedback(null);
        }, 3000);
    };

    const handleClose = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setVisible(false);
        setFeedback(null);
    };

    if (!visible || !feedback) return null;

    return (
        <div
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-20 bg-gray-800 text-gray-200 px-4 py-2 rounded shadow-lg flex items-center gap-2"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <span className="text-xl">{feedbackIcons[feedback.type]}</span>
            <span>{feedback.message}</span>
            <button className="ml-4 text-gray-400 hover:text-gray-200" onClick={handleClose}>
                ✖️
            </button>
        </div>
    );
};

export default FeedbackCard;
