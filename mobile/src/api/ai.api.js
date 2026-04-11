import client from './client';
import { ENDPOINTS } from '../constants/api';

export const getGstSuggestion = (product) => 
  client.get(ENDPOINTS.AI_GST_SUGGESTION, { params: { product } });

export const getAiInsights = () => 
  client.get(ENDPOINTS.AI_INSIGHTS);

export const askAiChat = (question) => 
  client.post(ENDPOINTS.AI_CHAT, { question });
