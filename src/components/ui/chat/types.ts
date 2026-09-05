export interface ChatUser {
  id: string;
  name: string;
  role?: string;
  avatar?: string;
  status?: 'online' | 'away' | 'offline';
  initials?: string;
}

export interface ChatMessageData {
  id: string;
  senderId: string;
  senderName: string;
  senderRole?: 'client' | 'technician' | 'admin';
  senderAvatar?: string;
  text: string;
  timestamp: string | number | Date;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  replyTo?: {
    id: string;
    senderName: string;
    text: string;
  };
  reactions?: {
    emoji: string;
    count: number;
    users: string[];
  }[];
  attachments?: {
    name: string;
    size?: string;
    type?: string;
    url?: string;
  }[];
  isPinned?: boolean;
}

export interface TypingUser {
  id: string;
  name: string;
}

export type ChatTheme = 'lunar' | 'midnight' | 'aurora' | 'ember';
