import { useChatSessionStore } from "@store/ChatSessionStore";

const PulseBar: React.FC = () => {
  const isAllDisabled = useChatSessionStore((state) => state.isAllDisabled);

  if (!isAllDisabled) return null;

  return (
    <div className="absolute inset-x-4 top-0 h-1 overflow-hidden">
      <div className="w-1/2 h-full bg-blue-500 animate-pulse mx-auto rounded" />
    </div>
  );
};

export default PulseBar;
