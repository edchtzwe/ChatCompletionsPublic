import { useChatSessionStore } from "@store/ChatSessionStore";

const SessionSelect = () => {
  const setSelectedSession = useChatSessionStore((state) => state.setSelectedSession);
  const selectedSession = useChatSessionStore((state) => state.selectedSession);
  const isAllDisabled = useChatSessionStore((state) => state.isAllDisabled);
  const sessionNames = useChatSessionStore((state) => state.sessionNames);
  const setDevMessage = useChatSessionStore((state) => state.setDevMessage);

  const sessionChangeHandler = (value) => {
    setSelectedSession(value);
    setDevMessage('');
  };

  return (
    <div className="flex gap-2 items-center">
      <select
        className="p-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 hover:cursor-pointer hover:scale-101"
        value={selectedSession}
        onChange={(e) => sessionChangeHandler(e.target.value)}
        disabled={isAllDisabled}
      >
        <option value="">New session...</option>
        {sessionNames.map((item) => (
          <option key={item.session_id} value={item.session_id}>
            {item.name || item.session_id}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SessionSelect;
