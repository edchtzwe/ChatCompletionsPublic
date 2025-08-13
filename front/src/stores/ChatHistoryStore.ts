import { create } from "zustand";
import {useChatSessionStore} from "@store/ChatSessionStore";
import axios from "axios";

interface ChatMessage {
  id: string;
  role: string;
  message: string;
}

interface ChatStore {
  history: ChatMessage[];
  setHistory: (history: ChatMessage[]) => void;
  addMessage: (message: string, role?: string) => void;
  selectedIds: string[];
  toggleSelectMessage: (id: string) => void;
  clearSelectedIds: () => void;
  fetchChatHistory: (sessionId: string) => void;
  devMessage: string;
  setDevMessage: (message: string) => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  history: [],
  selectedIds: [],
  devMessage: "",

  addMessage: (message, role = "user") =>
    set((state) => ({
      history: [...state.history, { id: String(Date.now()), role, message }],
    })),
  setHistory: (history) => set({ history }),
  toggleSelectMessage: (id) => set((state) => {
    const { selectedIds } = state;
    return { 
      selectedIds: selectedIds.includes(id)
        ? selectedIds.filter(selectedId => selectedId !== id)
        : [...selectedIds, id] 
    };
  }),
  clearSelectedIds: () => set({ selectedIds: [] }),
  fetchChatHistory: async (sessionId: string) => {
    let baseUrl = useChatSessionStore.getState().baseUrl;

    if (!sessionId.length) {
        set({
            history: [],
            selectedIds: [],
        });
        return;
    }

    try {
      const res = await axios.post(`${baseUrl}/chat/fetch-session-chat`, {
        sessionId: sessionId,
      });

      set((state) => ({
        history: res.data.map((msg: any) => ({
          id: msg.id,
          role: msg.role === "assistant" ? "system" : "user",
          message: msg.message || (msg.json_dump ? JSON.parse(msg.json_dump) : ""),
        })),
        selectedIds: [],
      }));
    }
    catch (error) {
        console.error(error);
    }
  },
  setDevMessage: (message) => set((state) => {
    return {
      devMessage: message
    };
  }),
}));
