import { useChatSessionStore } from "@store/ChatSessionStore";

function wordWrap(str, maxWords = 20) {
  const words = str.split(" ");
  let result = [];
  for (let i = 0; i < words.length; i += maxWords) {
    result.push(words.slice(i, i + maxWords).join(" "));
  }
  return result.join("\n");
}

export const ErrorModal = () => {
    const errorMessage = useChatSessionStore((state) => state.errorMessage);
    const setErrorMessage = useChatSessionStore((state) => state.setErrorMessage);

    if (!errorMessage) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg max-w-lg w-full">
                <h2 className="text-lg font-semibold mb-4 text-red-600 dark:text-red-400">
                    Server Error
                </h2>
                <pre className="whitespace-pre-wrap break-words text-gray-800 dark:text-gray-200 mb-4">
                    {wordWrap(errorMessage, 20)}
                </pre>
                <div className="flex justify-end">
                    <button
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:cursor-pointer hover:scale-105"
                        onClick={() => setErrorMessage("")}
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
};
