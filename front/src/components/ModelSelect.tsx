import { useChatSessionStore } from "@store/ChatSessionStore";

const ModelSelect: React.FC = () => {
    let selectedModel = useChatSessionStore((state) => state.selectedModel);
    const setSelectedModel = useChatSessionStore((state) => state.setSelectedModel);
    let isAllDisabled = useChatSessionStore((state) => state.isAllDisabled);
    let models = useChatSessionStore((state) => state.models);

    return (
        <select
          className="p-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 hover:cursor-pointer hover:scale-101"
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          disabled={ isAllDisabled }
        >
          <option value="">Select a model...</option>
          {models.map((model) => (
            <option key={model.value} value={model.value}>
              {model.name}
            </option>
          ))}
        </select>
    );
}

export default ModelSelect;
