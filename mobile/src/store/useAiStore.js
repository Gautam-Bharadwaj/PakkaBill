import { create } from 'zustand';
import * as aiApi from '../api/ai.api';
import logger from '../utils/logger';

const useAiStore = create((set) => ({
  insights: [],
  isLoadingInsights: false,
  
  chatHistory: [],
  isChatting: false,

  fetchInsights: async () => {
    set({ isLoadingInsights: true });
    try {
      const { data } = await aiApi.getAiInsights();
      set({ insights: data.data || [], isLoadingInsights: false });
    } catch (error) {
      logger.error('[AI Store] fetchInsights failed', error);
      set({ isLoadingInsights: false });
    }
  },

  askChat: async (question) => {
    // Optimistic UI update
    const userMsg = { _id: Date.now().toString(), text: question, isUser: true };
    set((state) => ({ 
      chatHistory: [...state.chatHistory, userMsg],
      isChatting: true 
    }));

    try {
      const { data } = await aiApi.askAiChat(question);
      const aiMsg = { _id: (Date.now() + 1).toString(), text: data.data.answer, isUser: false };
      set((state) => ({
        chatHistory: [...state.chatHistory, aiMsg],
        isChatting: false
      }));
    } catch (error) {
      logger.error('[AI Store] askChat failed', error);
      const errorMsg = { _id: (Date.now() + 1).toString(), text: "An error occurred. Please try again.", isUser: false, isError: true };
      set((state) => ({
        chatHistory: [...state.chatHistory, errorMsg],
        isChatting: false
      }));
    }
  },

  clearChat: () => set({ chatHistory: [] }),
}));

export default useAiStore;
