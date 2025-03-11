export interface ChatMessage {
  id?: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: number;
  usedMemories?: string[]; // Memories used in this message
}

export interface Chat {
  id?: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
} 