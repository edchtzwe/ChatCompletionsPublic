import { useChatSessionStore } from "@store/ChatSessionStore";
import axios from "axios";

const AIProviderSelect: React.FC = () => {
  const BASE_URL = useChatSessionStore((state) => state.baseUrl);
  const selectedAiProvider = useChatSessionStore((state) => state.selectedAiProvider);
  const setSelectedAiProvider = useChatSessionStore((state) => state.setSelectedAiProvider);
  const aiProviders = useChatSessionStore((state) => state.aiProviders);

  const isAllDisabled = useChatSessionStore((state) => state.isAllDisabled);
  const setIsAllDisabled = useChatSessionStore((state) => state.setIsAllDisabled);
  const setModels = useChatSessionStore((state) => state.setModels);
  const selectedModel = useChatSessionStore((state) => state.selectedModel);
  const setSelectedModel = useChatSessionStore((state) => state.setSelectedModel);

  const fetchModelsForProvider = async (providerValue: string) => {
    setIsAllDisabled(true);

    let res;
    try {
      res = await axios.get(`${BASE_URL}/chat/fetch-all-models`, { params: { aiprovider: providerValue } });

      if (!res) {
        throw new Error("Failed to fetch models...");
      }

      setModels(res.data.models);
    }
    catch (e) {
      console.error("Failed to fetch models...", e);
    }
    finally {
      let defaultModel;
      res.data.models.forEach((model: any) => {
        if (model.default) {
          defaultModel = model;
          return;
        }
      });

      if (defaultModel) {
        setSelectedModel(defaultModel.value);
      }

      setIsAllDisabled(false);
    }
  };

  return (
    <select
      className="p-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 hover:cursor-pointer hover:scale-101"
      value={selectedAiProvider}
      onChange={(e) => {
        const newProvider = e.target.value;
        setSelectedAiProvider(newProvider);
        fetchModelsForProvider(newProvider);
      }}
      disabled={isAllDisabled}
    >
      {aiProviders.map((provider) => (
        <option key={provider.value} value={provider.value}>
          {provider.name}
        </option>
      ))}
    </select>
  );
}

export default AIProviderSelect;
