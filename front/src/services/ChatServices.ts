import axios from "axios";
import { useChatStore } from "@store/ChatHistoryStore";
import { useChatSessionStore } from "@store/ChatSessionStore";
import { SonarThinkParser, SonarThinkPayload } from "@services/SonarThinkParser";

export const useChatService = () => {
  const BASE_URL = useChatSessionStore((state) => state.baseUrl);
  const { addMessage } = useChatStore();
  const {
    selectedSession,
    selectedModel,
    selectedAiProvider,
    temperature,
    searchContextSize,
    chatHistoryDepth,
    reasoningEffort,
    setSelectedSession,
    pushSession,
    setErrorMessage,
    setIsAllDisabled,
    setIsBusy,
  } = useChatSessionStore();

  const sendChatMessage = async (message: string) => {
    if (!message.trim()) {
      return;
    }

    setIsAllDisabled(true);
    setIsBusy(true);
    addMessage(message, "user");

    try {
      const response = await axios.post(`${BASE_URL}/chat`, {
        message,
        sessionId: selectedSession || undefined,
        selectedModel: selectedModel || undefined,
        aiprovider: selectedAiProvider || "DEEPSEEK",
        temperature: temperature >= 0 ? temperature : 1,
        searchContextSize: [0, 1, 2].includes(searchContextSize) ? searchContextSize : 1,
        chatHistoryDepth: chatHistoryDepth > 0 ? chatHistoryDepth : 16,
        reasoningEffort: [0, 1, 2].includes(reasoningEffort) ? reasoningEffort : 1,
      });

      const { reply, sessionId: returnedSessionId } = response.data;

      if (SonarThinkParser.hasThinkSection(reply)) {
        const { thinkContent, afterContent } = SonarThinkParser.extractAndFormat(reply) as SonarThinkPayload;
        addMessage(thinkContent, "thinker");
        addMessage(afterContent, "system");
      } else {
        addMessage(reply, "system");
      }

      if (!selectedSession && returnedSessionId) {
        pushSession(returnedSessionId);
        setSelectedSession(returnedSessionId);
      }
    } catch (error) {
      console.error("Chat completion failed:", error);
      const serverMsg =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        (typeof error?.response?.data === "string" ? error.response.data : null) ||
        error?.message ||
        "Unknown error";

      setErrorMessage(serverMsg);
    } finally {
      setIsAllDisabled(false);
      setIsBusy(false);
    }
  };

  return { sendChatMessage };
};
