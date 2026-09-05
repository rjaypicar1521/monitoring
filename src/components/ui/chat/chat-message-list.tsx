import React, { useRef, useEffect } from 'react';
import { ChatMessageData } from './types';
import { ChatMessage } from './chat-message';

interface ChatMessageListProps {
  messages: ChatMessageData[];
  currentUserId: string;
  isTyping?: boolean;
  typingUserName?: string;
  onReply?: (message: ChatMessageData) => void;
  onReactionAdd?: (messageId: string, emoji: string) => void;
  onDelete?: (messageId: string) => void;
  className?: string;
}

export const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  currentUserId,
  isTyping = false,
  typingUserName = 'Rjay Picar',
  onReply,
  onReactionAdd,
  onDelete,
  className = '',
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new message or typing state change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isTyping]);

  return (
    <div
      ref={scrollRef}
      className={`overflow-y-auto px-1 py-3 space-y-1 max-h-[380px] min-h-[160px] scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent ${className}`}
    >
      {/* Date Header Pill */}
      <div className="flex items-center justify-center my-2">
        <span className="px-3 py-0.5 rounded-full bg-slate-100 text-slate-500 font-mono text-[10px] font-bold border border-slate-200/80">
          Field Dispatch • Active Mission Session
        </span>
      </div>

      {messages.length === 0 ? (
        <div className="text-center py-8 text-xs text-slate-400 italic bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          No messages exchanged with technician yet. Send an instruction or query below.
        </div>
      ) : (
        messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg}
            isCurrentUser={msg.senderId === currentUserId}
            currentUserId={currentUserId}
            onReply={onReply}
            onReactionAdd={onReactionAdd}
            onDelete={onDelete}
          />
        ))
      )}

      {/* Typing Indicator */}
      {isTyping && (
        <div className="flex items-end gap-2.5 my-2">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-white font-bold text-[10px] flex items-center justify-center shadow-xs">
            RP
          </div>
          <div className="bg-slate-100 border border-slate-200/80 rounded-2xl rounded-bl-xs px-3 py-2 flex items-center gap-1.5 shadow-2xs">
            <span className="text-[11px] text-slate-500 font-medium">{typingUserName} is typing</span>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-amber-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 bg-amber-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 bg-amber-600 rounded-full animate-bounce" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
