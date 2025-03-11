export interface Memory {
  id?: string;
  content: string;
  timestamp: Date | number;
  source: string;
  isGlobal: boolean;
} 