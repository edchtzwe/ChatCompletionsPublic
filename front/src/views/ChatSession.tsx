import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

import { useChatStore } from "@store/ChatHistoryStore";
import { useChatSessionStore } from "@store/ChatSessionStore";
import ChatHistory from "@components/ChatHistory";
import ChatInput from "@components/ChatInput";
import SessionSelect from "@components/SessionSelect";
import SetDeveloperMessage from "@components/SetDeveloperMessage";
import ShowDevModal from "@components/ShowDevModal";
import ModelSelect from "@components/ModelSelect";
import AIProviderSelect from "@components/AIProviderSelect";
import TemperatureSlider from "@components/TemperatureSlider";
import { SonarThinkParser, SonarThinkPayload } from "@services/SonarThinkParser";
import SearchContextSizeToggle from "@components/SearchContextSizeToggle";
import ReasoningEffortToggle from "@components/ReasoningEffortToggle";
import { ErrorModal } from "@components/ErrorModal";
import MissionControl from "@components/MissionControlToggle";
import NameSetter from "@components/NameSetter";
import ChatHistoryDepthControl from "@components/ChatHistoryDepthControl";
import PromptBuilderModal from "@components/PromptBuilderModal";
import DeleteSessionButton from "@components/DeleteSession";
import SessionCommons from "@services/SessionCommons";
import FeedbackCard from "@components/UserActionFeedbackCard";

const ChatView: React.FC = () => {
  const BASE_URL = useChatSessionStore((state) => state.baseUrl);

  const { setHistory } = useChatStore();
  // const setSessions = useChatSessionStore((state) => state.setSessions);
  const setSessionNames = useChatSessionStore((state) => state.setSessionNames);
  let selectedSession = useChatSessionStore((state) => state.selectedSession);
  const setIsAllDisabled = useChatSessionStore((state) => state.setIsAllDisabled);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  let showDevModal = useChatSessionStore((state) => state.showDevModal);
  const isModalActive = showDevModal;
  let chatHistory = useChatStore((state) => state.history);
  const setSelectedModel = useChatSessionStore((state) => state.setSelectedModel);
  const setModels = useChatSessionStore((state) => state.setModels);
  const selectedModel = useChatSessionStore((state) => state.selectedModel);
  const setAiProviders = useChatSessionStore((state) => state.setAiProviders);
  const setSelectedAiProvider = useChatSessionStore((state) => state.setSelectedAiProvider);
  const selectedAiProvider = useChatSessionStore((state) => state.selectedAiProvider);

  const fetchSessionChat = async () => {
    if (!selectedSession) {
      setHistory([]);
      return;
    }
    const res = await axios.post(`${BASE_URL}/chat/fetch-session-chat`, {
      sessionId: selectedSession,
      aiprovider: selectedAiProvider,
    });

    setHistory([]);
    const history: Array<{ id: string, role: string, message: string }> = [];

    for (const msg of res.data) {
      const role = msg.role === "assistant" ? "system" : "user";
      const message = msg.message || "";

      if (SonarThinkParser.hasThinkSection(message)) {
        try {
          const parsed = SonarThinkParser.extractAndFormat(message) as SonarThinkPayload;

          if (parsed.thinkContent.trim().length > 0) {
            history.push({
              id: msg.id + "_think",
              role: "thinker",
              message: SonarThinkParser.assembleParts(parsed.thinkContent, "")
            });
          }

          if (parsed.afterContent.trim().length > 0) {
            history.push({
              id: msg.id + "_after",
              role: role,
              message: SonarThinkParser.assembleParts("", parsed.afterContent)
            });
          }

        } catch (error) {
          // clearly handle and log the error
          console.error(`Error parsing message id ${msg.id}:`, error);
          history.push({
            id: msg.id + "_error",
            role: role,
            message: "Error parsing message content."
          });
        }
      }
      else {
        history.push({
          id: msg.id,
          role: role,
          message: message
        });
      }

      setHistory(history);
    }
  };

  const fetchModels = async (provider: string) => {
    setIsAllDisabled(true);

    let res;
    try {
      res = await axios.get(`${BASE_URL}/chat/fetch-all-models`, {"params":{"aiprovider": provider}});

      if (!res) {
        throw new Error("Failed to fetch models...");
      }

      setModels(res.data.models);
    }
    catch (e) {
      console.error("Failed to fetch models...", e);
    }
    finally {
      if (!selectedModel) {
        let defaultModel;
        res.data.models.forEach((model: any) => {
          if (model.default) {
            defaultModel = model;
            return;
          }
        });
        setSelectedModel(defaultModel.value);
      }
      setIsAllDisabled(false);
    }
  };

  const focusChatInput = () => {
    const chatInput = document.getElementById("chat-input");
    if (chatInput) chatInput.focus();
  };

  useEffect(() => { SessionCommons.fetchSessions(BASE_URL, setSessionNames); }, []);
  useEffect(() => { focusChatInput(); }, []);
  useEffect(() => { fetchSessionChat(); }, [selectedSession]);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);
  useEffect(() => {focusChatInput();}, [chatHistory]);
  useEffect(() => {
    axios.get(`${BASE_URL}/chat/fetch-ai-providers`)
      .then((response) => {
        const providers = response.data.providers;
        setAiProviders(providers);

        const defaultProvider = providers.find((provider: any) => provider.default) || providers[0];
        setSelectedAiProvider(defaultProvider.value);
        /**
         * React batching does not flush until the end of the synchronous cycle. This function is asynchronous, so the hold happens.
         * Either pass the hard value, or .state().aiProvider to get the hard store value.
         */
        fetchModels(defaultProvider.value);
      })
      .catch((error) => {
        console.error("Failed to fetch AI providers:", error);
      });
    }, []);
    
  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-gray-200">
      <FeedbackCard />

      <div className={`fixed top-0 w-full z-10 h-16 p-4 border-b border-gray-700 ${isModalActive ? 'pointer-events-none opacity-50' : 'bg-gray-800'} flex gap-2 items-center`}>
        <NameSetter />
        <SessionSelect />
        <DeleteSessionButton />

        {/* <ActionSelect /> */}
        <AIProviderSelect />
        <ModelSelect />

        <div className="flex gap-2 ml-auto items-start">
          <ChatHistoryDepthControl />
          <ReasoningEffortToggle />
          <SearchContextSizeToggle />
          <SetDeveloperMessage />
        </div>
      </div>

      {/* <PulseBar /> */}

      <div className="flex-1 mt-20 overflow-y-auto">
        <ChatHistory />
      </div>

      <MissionControl />

      <TemperatureSlider />

      <ChatInput />

      <ShowDevModal />
      <PromptBuilderModal />
      <ErrorModal />

    </div>
  );
};

export default ChatView;
