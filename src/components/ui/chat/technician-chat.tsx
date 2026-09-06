import React, { useState, useEffect } from 'react';
import { MessageSquare, Shield, CheckCircle2, RefreshCw, Radio, PhoneCall } from 'lucide-react';
import { ChatMessageData } from './types';
import { ChatMessageList } from './chat-message-list';
import { ChatComposer } from './chat-composer';
import { DEFAULT_INITIAL_MESSAGES } from './chat-constants';
import { subscribeToAttendance } from '../../../utils/attendanceService';

export { DEFAULT_INITIAL_MESSAGES };

interface TechnicianChatProps {
  projectId: string;
  projectName?: string;
  technicianName?: string;
  technicianRole?: string;
  currentUserName?: string;
  currentUserRole?: string;
  onSyncNote?: (content: string, author: string, authorRole: 'client' | 'installer') => void;
  className?: string;
}

export const TechnicianChat: React.FC<TechnicianChatProps> = ({
  projectId,
  projectName = 'CCTV Monitoring Project',
  technicianName = 'Rjay Picar - RMVN',
  technicianRole = 'Lead Systems Architect & CCTV Specialist',
  currentUserName = 'UPCHQ',
  currentUserRole = 'Client Project Sponsor',
  onSyncNote,
  className = '',
}) => {
  const storageKey = `cctv_chat_messages_v2_${projectId}`;

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
    return DEFAULT_INITIAL_MESSAGES;
  });

  const [isTyping, setIsTyping] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ChatMessageData | null>(null);

  // Sync to localStorage and broadcast sync event
  const saveAndSyncMessages = (updater: (prev: ChatMessageData[]) => ChatMessageData[]) => {
    setMessages((prev) => {
      const updated = updater(prev);
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('cctv_chat_sync', { detail: { projectId } }));
      } catch {}
      return updated;
    });
  };

  // Re-sync when storageKey changes
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
    setMessages(DEFAULT_INITIAL_MESSAGES);
  }, [storageKey]);

  // Listen to cross-tab storage and same-tab chat sync events
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

    const handleCustomSync = (e?: Event) => {
      const custom = e as CustomEvent<{ projectId?: string }>;
      if (custom?.detail?.projectId && custom.detail.projectId !== projectId) {
        return;
      }
      syncFromStorage();
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('cctv_chat_sync', handleCustomSync);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('cctv_chat_sync', handleCustomSync);
    };
  }, [storageKey, projectId]);

  // Subscribe to real-time attendance events
  useEffect(() => {
    const unsubscribe = subscribeToAttendance((event) => {
      if (event.projectId && event.projectId !== projectId) return;
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
          }
        }
      } catch {}
    });
    return () => unsubscribe();
  }, [projectId, storageKey]);

  const isAdmin = currentUserRole === 'installer';

  // Handle Send message from Client
  const handleSendMessage = (text: string, attachments?: { name: string; size?: string; type?: string }[]) => {
    const newMsg: ChatMessageData = {
      id: `msg-${Date.now()}`,
      senderId: 'client-current',
      senderName: currentUserName,
      senderRole: isAdmin ? 'technician' : 'client',
      text,
      attachments: isAdmin ? attachments : undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'delivered',
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

    // Also optionally sync to project note log
    if (onSyncNote) {
      onSyncNote(text, currentUserName, 'client');
    }

    // Trigger simulated realistic field response from Rjay Picar
    const lower = text.toLowerCase();
    setTimeout(() => {
      setIsTyping(true);
    }, 800);

    setTimeout(() => {
      setIsTyping(false);
      let replyText = 'Received and logged for the installation crew! Standing by on site.';

      if (lower.includes('cam') || lower.includes('angle') || lower.includes('adjust')) {
        replyText = 'Copy that! I am on the ladder right now. I will test the viewing angle on the handheld CCTV tester and lock the bracket.';
      } else if (lower.includes('cable') || lower.includes('power') || lower.includes('electrician')) {
        replyText = 'Understood. Conduit run is secured with EMT clamps. Once the circuit breaker is energised, we will terminate the 12V DC power jacks immediately.';
      } else if (lower.includes('backdoor') || lower.includes('privacy')) {
        replyText = 'Acknowledged. We will hold off on CAM-04 mounting until you grant permission. Cables are safely coiled inside the junction box.';
      } else if (lower.includes('dvr') || lower.includes('record') || lower.includes('feed')) {
        replyText = 'DVR is mounted in the comms rack with 2TB surveillance drive active. Live streaming throughput is steady at 30fps.';
      }

      const techReply: ChatMessageData = {
        id: `msg-${Date.now() + 1}`,
        senderId: 'tech-rjay',
        senderName: technicianName,
        senderRole: 'technician',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'delivered',
        replyTo: {
          id: newMsg.id,
          senderName: newMsg.senderName,
          text: newMsg.text,
        },
      };

      saveAndSyncMessages((prev) => [...prev, techReply]);
    }, 2400);
  };

  const handleReactionAdd = (messageId: string, emoji: string) => {
    saveAndSyncMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== messageId) return msg;
        const existingReactions = msg.reactions || [];
        const existingIndex = existingReactions.findIndex((r) => r.emoji === emoji);
        const myKey = 'client-current';

        if (existingIndex >= 0) {
          const target = existingReactions[existingIndex];
          const hasLiked = target.users?.includes(myKey);

          if (hasLiked) {
            // Toggle off
            const remaining = (target.users || []).filter((u) => u !== myKey);
            const newCount = Math.max(0, target.count - 1);
            if (newCount === 0 || remaining.length === 0) {
              return {
                ...msg,
                reactions: existingReactions.filter((_, i) => i !== existingIndex),
              };
            }
            const updated = [...existingReactions];
            updated[existingIndex] = { ...target, count: newCount, users: remaining };
            return { ...msg, reactions: updated };
          } else {
            const updated = [...existingReactions];
            updated[existingIndex] = {
              ...target,
              count: target.count + 1,
              users: [...(target.users || []), myKey],
            };
            return { ...msg, reactions: updated };
          }
        } else {
          return {
            ...msg,
            reactions: [...existingReactions, { emoji, count: 1, users: [myKey] }],
          };
        }
      })
    );
  };

  const handleDeleteMessage = (messageId: string) => {
    saveAndSyncMessages((prev) => prev.filter((m) => m.id !== messageId));
  };

  const handleResetChat = () => {
    saveAndSyncMessages(() => DEFAULT_INITIAL_MESSAGES);
  };

  return (
    <div className={`bg-white/95 backdrop-blur-md rounded-[32px] p-6 border border-slate-200/90 shadow-sm space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          {/* Technician Avatar with Live Status */}
          <div className="relative shrink-0">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#181a20] to-[#2a2e39] text-amber-400 flex items-center justify-center font-bold text-sm shadow-md border border-slate-700">
              RP
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white" />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-slate-900">{technicianName}</h3>
              <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <Radio className="w-2.5 h-2.5 text-emerald-600 animate-pulse" />
                Live on Site
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              {technicianRole}
            </p>
          </div>
        </div>

        {/* Right Header Status / Reset */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-[11px] font-mono text-slate-400 font-medium hidden sm:inline">
            {messages.length} message{messages.length === 1 ? '' : 's'}
          </span>
          <button
            type="button"
            onClick={handleResetChat}
            className="text-[11px] font-mono text-slate-400 hover:text-slate-700 px-2.5 py-1 rounded-xl hover:bg-slate-100 transition cursor-pointer border border-transparent hover:border-slate-200 flex items-center gap-1"
            title="Reset to default field messages"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>

      {/* Chat Messages Feed */}
      <ChatMessageList
        messages={messages}
        currentUserId="client-current"
        isTyping={isTyping}
        typingUserName="Rjay Picar"
        onReply={(msg) => setReplyingTo(msg)}
        onReactionAdd={handleReactionAdd}
        onDelete={handleDeleteMessage}
      />

      {/* Composer Input */}
      <ChatComposer
        onSend={handleSendMessage}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
        allowAttachments={isAdmin}
        currentUserRole={isAdmin ? 'installer' : 'client'}
      />
    </div>
  );
};
