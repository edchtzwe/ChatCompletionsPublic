import { useChatSessionStore } from "@store/ChatSessionStore";

const SearchContextSizeToggle: React.FC = () => {
    const searchContextSize = useChatSessionStore((state) => state.searchContextSize);
    const isAllDisabled = useChatSessionStore((state) => state.isAllDisabled);
    const setSearchContextSize = useChatSessionStore((state) => state.setSearchContextSize);

    const handleToggle = () => {
        setSearchContextSize(searchContextSize === 1 ? 2 : 1);
    };

    return (
        <div className="flex flex-col items-center relative group">
            <button
                className={`flex items-center justify-center border rounded w-8 h-8
          focus:outline-none focus:ring-2 transition-all duration-200 ease-in-out
          transform hover:scale-105 active:scale-95 hover:cursor-pointer
          disabled:cursor-not-allowed disabled:opacity-50 font-bold text-base
          ${searchContextSize === 1
                        ? "bg-blue-400 border-blue-500 hover:bg-blue-500"
                        : "bg-purple-400 border-purple-500 hover:bg-purple-500"}`}
                onClick={handleToggle}
                disabled={isAllDisabled}
            >
                {searchContextSize === 1 ? "中" : "大"}
            </button>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 text-xs bg-gray-700 
                rounded-lg shadow-lg transition-opacity opacity-0 group-hover:opacity-100 delay-0 
                whitespace-normal break-words max-w-xs text-center">
                Search&#8203;Context&#8203;Size
            </div>
        </div>
    );
};

export default SearchContextSizeToggle;
