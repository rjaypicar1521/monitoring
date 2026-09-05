import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  X, 
  Minus, 
  Maximize2, 
  Minimize2, 
  RefreshCw, 
  Send
} from 'lucide-react';
import { ChatMessageData } from './types';
import { ChatMessageList } from './chat-message-list';
import { ChatComposer } from './chat-composer';

interface FloatingMessengerProps {
  projectId: string;
  projectName?: string;
  currentUserRole: 'client' | 'installer';
  currentUserName: string;
  onSyncNote?: (content: string, author: string, authorRole: 'client' | 'installer') => void;
}

const DEFAULT_MESSAGES: ChatMessageData[] = [
  {
    id: 'm-init-1',
    senderId: 'usr-installer',
    senderName: 'Rjay Picar - RMVN',
    senderRole: 'technician',
    text: 'Hello UPCHQ team! All preliminary cabling for Zones 1-3 is complete. CAM-01 (Main Gate) and CAM-02 (Perimeter West) are verified online in 1080p.',
    timestamp: '10:15 AM',
    status: 'read',
    readBy: ['usr-client', 'usr-installer'],
    reactions: [{ emoji: '👍', count: 2, users: ['client', 'tech'] }],
  },
  {
    id: 'm-init-2',
    senderId: 'usr-installer',
    senderName: 'Rjay Picar - RMVN',
    senderRole: 'technician',
    text: 'Field update: Backdoor (CAM-04) cable is pulled at the doorway. Bracket mounting is temporarily deferred for occupant privacy clearance. Let me know when authorized to drill.',
    timestamp: '11:30 AM',
    status: 'read',
    readBy: ['usr-client', 'usr-installer'],
  },
];

export const FloatingMessenger: React.FC<FloatingMessengerProps> = ({
  projectId,
  projectName = 'CCTV Project',
  currentUserRole,
  currentUserName,
  onSyncNote,
}) => {
  const storageKey = `cctv_messenger_chat_${projectId}`;

  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [replyingTo, setReplyingTo] = useState<ChatMessageData | null>(null);

  const isAdmin = currentUserRole === 'installer';
  const isClient = !isAdmin;
  const currentUserId = isClient ? 'usr-client' : 'usr-installer';
  const partnerName = isClient ? 'Rjay Picar - RMVN' : 'UPCHQ';
  const partnerRole = isClient ? 'Lead Systems Architect & Tech' : 'Client Project Sponsor';
  const partnerInitials = isClient ? 'RP' : 'UP';

  // Helper to compute unread incoming messages for the current user
  const computeUnreadCount = (msgList: ChatMessageData[], userId: string): number => {
    return msgList.filter((m) => {
      // Only count messages from the OTHER user
      if (m.senderId === userId) return false;
      // If legacy message with status 'read' and no readBy array, consider already read
      if (m.status === 'read' && (!m.readBy || m.readBy.length === 0)) return false;
      // Unread if readBy doesn't include current user
      return !m.readBy || !m.readBy.includes(userId);
    }).length;
  };

  // Load messages from localStorage
  const [messages, setMessages] = useState<ChatMessageData[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
    return DEFAULT_MESSAGES;
  });

  // Re-sync messages when storageKey changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      }
    } catch {}
    setMessages(DEFAULT_MESSAGES);
  }, [storageKey]);

  // Listen to cross-tab storage and same-tab sync events
  useEffect(() => {
    const syncFromStorage = () => {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setMessages(parsed);
          }
        }
      } catch {}
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === storageKey && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setMessages(parsed);
          }
        } catch {}
      }
    };

    const handleCustomSync = () => {
      syncFromStorage();
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('cctv_messenger_sync', handleCustomSync);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('cctv_messenger_sync', handleCustomSync);
    };
  }, [storageKey]);

  const saveAndSyncMessages = (updater: (prev: ChatMessageData[]) => ChatMessageData[]) => {
    setMessages((prev) => {
      const updated = updater(prev);
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
        window.dispatchEvent(new Event('cctv_messenger_sync'));
      } catch {}
      return updated;
    });
  };

  // Track unread count and automatically mark messages as read when messenger is open
  useEffect(() => {
    if (isOpen) {
      // Messenger is open: mark all incoming unread messages as read by current user
      const unreadExists = messages.some(
        (m) => m.senderId !== currentUserId && (!m.readBy || !m.readBy.includes(currentUserId))
      );
      if (unreadExists) {
        saveAndSyncMessages((prev) =>
          prev.map((m) => {
            if (m.senderId !== currentUserId && (!m.readBy || !m.readBy.includes(currentUserId))) {
              return {
                ...m,
                status: 'read',
                readBy: [...(m.readBy || []), currentUserId],
              };
            }
            return m;
          })
        );
      }
      setUnreadCount(0);
    } else {
      // Messenger is closed: calculate exact unread count
      const count = computeUnreadCount(messages, currentUserId);
      setUnreadCount(count);
    }
  }, [messages, currentUserId, isOpen]);

  // Handle opening messenger: resets unread count and marks all as read
  const handleOpenMessenger = () => {
    setIsOpen(true);
    setUnreadCount(0);
    saveAndSyncMessages((prev) =>
      prev.map((m) => {
        if (m.senderId !== currentUserId && (!m.readBy || !m.readBy.includes(currentUserId))) {
          return {
            ...m,
            status: 'read',
            readBy: [...(m.readBy || []), currentUserId],
          };
        }
        return m;
      })
    );
  };

  // Handle Send Message
  const handleSendMessage = (
    text: string,
    attachments?: { name: string; size?: string; type?: string; url?: string }[],
    voice?: { url: string; duration: number }
  ) => {
    const newMsg: ChatMessageData = {
      id: `msg-${Date.now()}`,
      senderId: currentUserId,
      senderName: currentUserName,
      senderRole: isClient ? 'client' : 'admin',
      text,
      attachments: isAdmin ? attachments : undefined,
      voice,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'delivered',
      readBy: [currentUserId],
      replyTo: replyingTo
        ? {
            id: replyingTo.id,
            senderName: replyingTo.senderName,
            text: replyingTo.text,
          }
        : undefined,
    };

    saveAndSyncMessages((prev) => [...prev, newMsg]);
    setReplyingTo(null);

    // Sync to project notes
    if (onSyncNote && text.trim()) {
      onSyncNote(text.trim(), currentUserName, isClient ? 'client' : 'installer');
    }
  };

  const handleReactionAdd = (messageId: string, emoji: string) => {
    saveAndSyncMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== messageId) return msg;
        const existing = msg.reactions || [];
        const index = existing.findIndex((r) => r.emoji === emoji);

        const myIdentifier = currentUserName || (isClient ? 'UPCHQ' : 'Rjay Picar - RMVN');
        const myKeys = [
          myIdentifier,
          isClient ? 'usr-client' : 'usr-installer',
          isClient ? 'client' : 'tech',
          isClient ? 'client-current' : 'installer'
        ];

        if (index >= 0) {
          const target = existing[index];
          const hasAlreadyLiked = target.users?.some((u) => myKeys.includes(u));

          if (hasAlreadyLiked) {
            // TOGGLE OFF: User already liked, remove like
            const remainingUsers = (target.users || []).filter((u) => !myKeys.includes(u));
            const newCount = Math.max(0, target.count - 1);

            if (newCount === 0 || remainingUsers.length === 0) {
              return {
                ...msg,
                reactions: existing.filter((_, i) => i !== index),
              };
            }

            const updated = [...existing];
            updated[index] = {
              ...target,
              count: newCount,
              users: remainingUsers,
            };
            return { ...msg, reactions: updated };
          } else {
            // TOGGLE ON: User has not liked yet, add single like
            const updated = [...existing];
            updated[index] = {
              ...target,
              count: target.count + 1,
              users: [...(target.users || []), myIdentifier],
            };
            return { ...msg, reactions: updated };
          }
        } else {
          // New emoji reaction
          return {
            ...msg,
            reactions: [...existing, { emoji, count: 1, users: [myIdentifier] }],
          };
        }
      })
    );
  };

  const handleDeleteMessage = (messageId: string) => {
    saveAndSyncMessages((prev) => prev.filter((m) => m.id !== messageId));
  };

  const handleResetChat = () => {
    saveAndSyncMessages(() => DEFAULT_MESSAGES);
  };

  return (
    <>
      {/* 1. FLOATING CHAT HEAD TRIGGER (MESSENGER STYLE) */}
      {!isOpen && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 animate-in fade-in zoom-in-90 duration-200">
          <button
            type="button"
            onClick={handleOpenMessenger}
            className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-[#0084FF] via-[#0066FF] to-[#A033FF] hover:scale-105 active:scale-95 text-white shadow-xl shadow-blue-500/30 transition-transform duration-200 cursor-pointer border-2 border-white/80"
            title="Open Messenger"
          >
            {/* Facebook Messenger SVG Icon */}
            <svg
              className="w-7 h-7 fill-white transition-transform group-hover:scale-110"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.91 1.455 5.518 3.735 7.208V22l3.373-1.851c.91.252 1.88.389 2.892.389 5.523 0 10-4.145 10-9.258C22 6.145 17.523 2 12 2zm1.037 12.443l-2.584-2.756-5.044 2.756 5.547-5.89 2.65 2.756 4.978-2.756-5.547 5.89z" />
            </svg>

            {/* Active Green Online Status Pulse */}
            <span className="absolute bottom-0 right-0 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white" />
            </span>

            {/* Unread Badge Count */}
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white font-black text-[11px] font-mono min-w-[22px] h-[22px] px-1 rounded-full border-2 border-white shadow-lg flex items-center justify-center animate-in zoom-in-75 duration-200">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
        </div>
      )}

      {/* 2. FLOATING MESSENGER POPUP WINDOW */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-200 ease-out flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden ${
            isExpanded
              ? 'bottom-4 right-4 w-[94vw] sm:w-[580px] h-[86vh] max-h-[780px]'
              : 'bottom-4 right-4 w-[92vw] sm:w-[410px] h-[600px] max-h-[88vh]'
          }`}
        >
          {/* Messenger Header */}
          <header className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-slate-900 via-[#181a20] to-slate-900 text-white border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              {/* Partner Avatar */}
              <div className="relative shrink-0">
                <div className={`w-10 h-10 rounded-full font-bold text-xs flex items-center justify-center border-2 border-white/80 shadow-xs ${
                  isClient
                    ? 'bg-gradient-to-br from-[#181a20] to-[#2a2e39] text-amber-400'
                    : 'bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950'
                }`}>
                  {partnerInitials}
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full" />
              </div>

              {/* Title & Status */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-xs sm:text-sm text-white truncate">
                    {partnerName}
                  </h3>
                  <span className="text-[9px] font-mono bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/30">
                    Active
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">
                  {partnerRole}
                </p>
              </div>
            </div>

            {/* Window Controls */}
            <div className="flex items-center gap-1 text-slate-300">
              {/* Expand / Minimize Window */}
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-full hover:bg-white/10 hover:text-white transition cursor-pointer hidden sm:inline-flex"
                title={isExpanded ? 'Restore size' : 'Expand window'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              {/* Minimize down to chat head */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 hover:text-white transition cursor-pointer"
                title="Minimize to chat bubble"
              >
                <Minus className="w-4 h-4" />
              </button>

              {/* Close */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:bg-rose-500/20 hover:text-rose-300 transition cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Sub-header Context Bar */}
          <div className="bg-slate-100/90 border-b border-slate-200/80 px-4 py-1.5 flex items-center justify-between text-[11px] text-slate-600">
            <span className="font-medium truncate">
              {projectName} • Encrypted Dispatch
            </span>
            <button
              type="button"
              onClick={handleResetChat}
              className="text-[10px] font-mono text-slate-400 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
              title="Reset sample thread"
            >
              <RefreshCw className="w-2.5 h-2.5" />
              <span>Reset</span>
            </button>
          </div>

          {/* Message Feed */}
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col p-3 bg-white">
            <ChatMessageList
              messages={messages}
              currentUserId={isClient ? 'usr-client' : 'usr-installer'}
              isTyping={isTyping}
              typingUserName={partnerName}
              onReply={(msg) => setReplyingTo(msg)}
              onReactionAdd={handleReactionAdd}
              onDelete={handleDeleteMessage}
              className="flex-1 min-h-0"
            />
          </div>

          {/* Composer Box at bottom */}
          <div className="p-3 bg-white border-t border-slate-100 shrink-0">
            <ChatComposer
              onSend={handleSendMessage}
              replyingTo={replyingTo}
              onCancelReply={() => setReplyingTo(null)}
              placeholder={`Message ${partnerName.split(' ')[0]}...`}
              allowAttachments={isAdmin}
              currentUserRole={currentUserRole}
            />
          </div>
        </div>
      )}


    </>
  );
};
