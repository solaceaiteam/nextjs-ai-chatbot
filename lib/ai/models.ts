export const DEFAULT_CHAT_MODEL: string = 'chat-model';

export interface ChatModel {
  id: string;
  name: string;
  description: string;
}

export const chatModels: Array<ChatModel> = [
  {
    id: 'chat-model',
    name: 'Solace 1.0',
    description: 'Primary Solace AI model for all-purpose chat',
  },
  {
    id: 'chat-model-2',
    name: 'Solace 2.0',
    description: 'Solace AI model with advanced reasoning (Premium only)',
  },
];
