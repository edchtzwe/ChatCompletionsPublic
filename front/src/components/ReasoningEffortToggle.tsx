import { useChatSessionStore } from "@store/ChatSessionStore";

const ReasoningEffortToggle: React.FC = () => {
    const reasoningEffort = useChatSessionStore((state) => state.reasoningEffort);
    const isAllDisabled = useChatSessionStore((state) => state.isAllDisabled);
    const setReasoningEffort = useChatSessionStore((state) => state.setReasoningEffort);

    const handleToggle = () => {
        setReasoningEffort(reasoningEffort === 1 ? 2 : 1);
    };

    return (
        <div className="flex flex-col items-center relative group">
            <button
                className={`flex items-center justify-center border rounded w-8 h-8
          focus:outline-none focus:ring-2 transition-all duration-200 ease-in-out
          transform hover:scale-105 active:scale-95 hover:cursor-pointer
          disabled:cursor-not-allowed disabled:opacity-50 font-bold text-base
          ${reasoningEffort === 1
                        ? "bg-green-400 border-green-500 hover:bg-green-500" // Lazy: Green theme
                        : "bg-orange-400 border-orange-500 hover:bg-orange-500"}`} // Hardworking: Orange theme
                onClick={handleToggle}
                disabled={isAllDisabled}
            >
                {reasoningEffort === 1 ? "懒" : "勤"}
            </button>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 text-xs bg-gray-700 
                rounded-lg shadow-lg transition-opacity opacity-0 group-hover:opacity-100 delay-0 
                whitespace-normal break-words max-w-xs text-center">
                Reasoning&#8203;Effort&#8203;
            </div>
        </div>
    );
};

export default ReasoningEffortToggle;
