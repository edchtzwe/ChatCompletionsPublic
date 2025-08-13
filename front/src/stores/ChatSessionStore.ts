import { create } from "zustand";

// --- Types ---
interface models {
  name: string;
  value: string;
}

interface AiProvider {
  name: string;
  value: string;
}

interface SessionName {
  session_id: string;
  name: string;
}

export interface Feedback {
  type: 'info' | 'error' | 'success';
  message: string;
};

interface ChatSessionStore {
  // Session
  sessions: string[];
  sessionNames: SessionName[];
  selectedSession: string;
  setSessions: (sessions: string[]) => void;
  setSessionNames: (sessionNames: SessionName[]) => void;
  setSelectedSession: (session: string) => void;
  pushSession: (session: string) => void;

  // Model
  models: models[];
  selectedModel: string;
  setModels: (models: models[]) => void;
  setSelectedModel: (model: string) => void;

  // AI Provider
  aiProviders: AiProvider[];
  selectedAiProvider: string;
  setAiProviders: (providers: AiProvider[]) => void;
  setSelectedAiProvider: (providerValue: string) => void;

  // UI State
  dropDownOpen: boolean;
  showDeleteConfirm: boolean;
  showDevModal: boolean;
  showPromptBuilder: boolean;
  setDropDownOpen: (isOpen: boolean) => void;
  setShowDeleteConfirm: (showDeleteConfirm: boolean) => void;
  setShowDevModal: (showDevModal: boolean) => void;
  setShowPromptBuilder: (showPromptBuilder: boolean) => void;

  // State Flags
  isBusy: boolean;
  isAllDisabled: boolean;
  setIsBusy: (isBusy: boolean) => void;
  setIsAllDisabled: (isAllDisabled: boolean) => void;

  // Messages
  devMessage: string;
  promptBuilderMessage: string;
  errorMessage: string;
  setDevMessage: (message: string) => void;
  setPromptBuilderMessage: (message: string) => void;
  setErrorMessage: (errorMessage: string) => void;
  feedback: Feedback | null;
  setFeedback: (feedback: Feedback) => void;

  // Settings
  baseUrl: string;
  temperature: number;
  searchContextSize: number;
  reasoningEffort: number;
  chatHistoryDepth: number;
  setTemperature: (temperature: number) => void;
  setSearchContextSize: (searchContextSize: number) => void;
  setReasoningEffort: (reasoningEffort: number) => void;
  setChatHistoryDepth: (chatHistoryDepth: number) => void;
}

// --- Store ---
export const useChatSessionStore = create<ChatSessionStore>((set, get) => ({
  // --- Session ---
  sessions: [],
  sessionNames: [],
  selectedSession: "",
  setSessions: (sessions) => set({ sessions }),
  setSessionNames: (sessionNames) => set({ sessionNames }),
  setSelectedSession: (session) => set({ selectedSession: session }),
  pushSession: (session) => {
    set((state) => {
      // --- changed: create new arrays to avoid mutation ---
      const sessions = [...state.sessions, session];
      const sessionNames = [...state.sessionNames, { session_id: session, name: session }];
      return { sessions, sessionNames };
    });
  },

  // --- Model ---
  models: [],
  selectedModel: "",
  setModels: (models) => set({ models }),
  setSelectedModel: (model) => set({ selectedModel: model }),

  // --- AI Provider ---
  aiProviders: [],
  selectedAiProvider: "openai",
  setAiProviders: (providers) => set({ aiProviders: providers }),
  setSelectedAiProvider: (providerValue) => set({ selectedAiProvider: providerValue }),

  // --- UI State ---
  dropDownOpen: false,
  showDeleteConfirm: false,
  showDevModal: false,
  showPromptBuilder: false,
  setDropDownOpen: (isOpen) => set({ dropDownOpen: isOpen }),
  setShowDeleteConfirm: (showDeleteConfirm) => set({ showDeleteConfirm }),
  setShowDevModal: (showDevModal) => set({ showDevModal }),
  setShowPromptBuilder: (showPromptBuilder) => set({ showPromptBuilder }),

  // --- State Flags ---
  isBusy: false,
  isAllDisabled: false,
  setIsBusy: (isBusy) => set({ isBusy }),
  setIsAllDisabled: (isAllDisabled) => set({ isAllDisabled }),

  // --- Messages ---
  devMessage: "",
  promptBuilderMessage: "",
  errorMessage: "",
  setDevMessage: (message) => set({ devMessage: message }),
  setPromptBuilderMessage: (message) => set({ promptBuilderMessage: message }),
  setErrorMessage: (errorMessage) => set({ errorMessage }),
  feedback: null,
  setFeedback: (feedback: Feedback) => set({ feedback }),

  // --- Settings ---
  baseUrl: "http://192.168.1.10:3000",
  temperature: 0.3,
  searchContextSize: 1,
  reasoningEffort: 1,
  chatHistoryDepth: 2,
  setTemperature: (temperature) => set({ temperature }),
  setSearchContextSize: (searchContextSize) => set({ searchContextSize }),
  setReasoningEffort: (reasoningEffort) => set({ reasoningEffort }),
  setChatHistoryDepth: (chatHistoryDepth) => set({ chatHistoryDepth }),
}));
