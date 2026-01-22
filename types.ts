
export enum AIView {
  CHAT = 'chat',
  VISION = 'vision',
  MOTION = 'motion',
  VOICE = 'voice',
  MAPS = 'maps'
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  sources?: { uri: string; title: string }[];
}

export interface OperationLog {
  id: string;
  method: string;
  status: 'pending' | 'success' | 'error';
  timestamp: number;
  duration?: number;
}

export interface GeneratedAsset {
  id: string;
  type: 'image' | 'video';
  url: string;
  prompt: string;
  timestamp: number;
}
