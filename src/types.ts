export type Role = 'user' | 'assistant';

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  isStreaming?: boolean;
}

export type ChetanaTone = 'balanced' | 'witty' | 'formal';
export type ChetanaLanguage = 'auto' | 'bn' | 'banglish' | 'en';

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
}

export interface UserPreferences {
  tone: ChetanaTone;
  language: ChetanaLanguage;
  soundEnabled: boolean; // 🔊 চেতনা Sound (ON / OFF)
  chetanaMode: boolean; // 🧠 Chetana Suggestion Mode
}

export interface BalanceChange {
  id: string;
  amount: number;
  text: string;
  type: 'consume' | 'reward';
}
