import React, { useState, useRef } from 'react';
import { Check, CheckCheck, Clock, Reply, SmilePlus, Trash2, Pin, Paperclip, FileText, Image as ImageIcon, Play, Pause, Mic, Download } from 'lucide-react';
import { ChatMessageData } from './types';

const QUICK_REACTIONS = ['👍', '❤️', '🔥', '✅', '👀', '🙏'];

interface ChatMessageProps {
  message: ChatMessageData;
  isCurrentUser: boolean;
  onReply?: (message: ChatMessageData) => void;
  onReactionAdd?: (messageId: string, emoji: string) => void;
  onDelete?: (messageId: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isCurrentUser,
  onReply,
  onReactionAdd,
  onDelete,
}) => {
  const [showToolbar, setShowToolbar] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggleAudio = () => {
    if (!message.voice?.url) return;
    if (!audioRef.current) {
      audioRef.current = new Audio(message.voice.url);
      audioRef.current.onended = () => setIsPlayingAudio(false);
      audioRef.current.onerror = () => setIsPlayingAudio(false);
    }
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play().then(() => setIsPlayingAudio(true)).catch(() => setIsPlayingAudio(false));
    }
  };

  const formattedTime = typeof message.timestamp === 'string'
    ? message.timestamp
    : new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div
      className={`group/msg relative flex gap-2.5 my-3.5 items-end ${
        isCurrentUser ? 'justify-end' : 'justify-start'
      }`}
      onMouseEnter={() => setShowToolbar(true)}
      onMouseLeave={() => {
        setShowToolbar(false);
        setShowPicker(false);
      }}
    >
      {/* Incoming Avatar (Technician) */}
      {!isCurrentUser && (
        <div className="relative shrink-0 mb-1">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-white font-bold text-xs flex items-center justify-center shadow-xs border border-amber-400/40">
            {message.senderAvatar ? (
              <img src={message.senderAvatar} alt={message.senderName} className="w-full h-full rounded-xl object-cover" />
            ) : (
              <span>RP</span>
            )}
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
        </div>
      )}

      {/* Message Bubble Container */}
      <div className={`relative max-w-[82%] sm:max-w-[70%] space-y-1 ${isCurrentUser ? 'items-end' : 'items-start'}`}>
        {/* Sender Name & Role info */}
        <div className={`flex items-center gap-1.5 text-[11px] px-1 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
          <span className="font-bold text-slate-800">{message.senderName}</span>
          {message.senderRole && (
            <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full border ${
              isCurrentUser
                ? 'bg-amber-100 text-amber-900 border-amber-200'
                : 'bg-slate-800 text-white border-slate-700'
            }`}>
              {isCurrentUser ? 'Client' : 'Lead Technician'}
            </span>
          )}
        </div>

        {/* Quoted Reply if any */}
        {message.replyTo && (
          <div className={`text-[11px] p-2 rounded-xl border-l-2 mb-1 flex flex-col gap-0.5 ${
            isCurrentUser
              ? 'bg-slate-100/80 border-amber-500 text-slate-700'
              : 'bg-slate-100/90 border-slate-600 text-slate-700'
          }`}>
            <span className="font-bold text-[10px] text-amber-700">Replying to {message.replyTo.senderName}</span>
            <span className="truncate italic line-clamp-1">{message.replyTo.text}</span>
          </div>
        )}

        {/* Bubble */}
        <div
          className={`relative p-3.5 rounded-2xl shadow-xs transition-all text-xs leading-relaxed ${
            isCurrentUser
              ? 'bg-slate-900 text-slate-100 rounded-br-xs border border-slate-800 shadow-slate-900/10'
              : 'bg-white text-slate-900 rounded-bl-xs border border-slate-200/90 shadow-slate-200/40'
          }`}
        >
          {/* Main message text */}
          {message.text && <p className="whitespace-pre-wrap select-text">{message.text}</p>}

          {/* Real Voice Note with Playback */}
          {message.voice && (
            <div className={`flex items-center gap-3 p-2 rounded-xl my-1 border ${
              isCurrentUser ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}>
              <button
                type="button"
                onClick={toggleAudio}
                className="w-8 h-8 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 shadow-xs transition cursor-pointer"
                title={isPlayingAudio ? 'Pause voice note' : 'Play voice note'}
              >
                {isPlayingAudio ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </button>
              <div className="flex-1 min-w-[130px] space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="flex items-center gap-1 font-bold text-amber-500">
                    <Mic className="w-3 h-3" /> Voice Note
                  </span>
                  <span className="opacity-70">{message.voice.duration}s</span>
                </div>
                <div className="w-full bg-slate-200/40 h-1.5 rounded-full overflow-hidden">
                  <div className={`h-full bg-amber-500 rounded-full transition-all duration-300 ${isPlayingAudio ? 'w-full animate-pulse' : 'w-1/3'}`} />
                </div>
              </div>
            </div>
          )}

          {/* Real Attachments & Photos */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2.5 pt-2 border-t border-slate-200/40 space-y-2">
              {message.attachments.map((att, idx) => {
                const isImage = att.type?.startsWith('image/') || att.url?.startsWith('data:image/');
                return isImage && att.url ? (
                  <div key={idx} className="rounded-xl overflow-hidden border border-slate-200/60 group/att relative">
                    <img src={att.url} alt={att.name} className="max-h-52 w-full object-cover rounded-xl" />
                    <div className="p-1.5 flex items-center justify-between text-[10px] font-mono bg-black/60 text-white backdrop-blur-xs">
                      <span className="truncate max-w-[180px]">{att.name}</span>
                      <a href={att.url} download={att.name} className="hover:text-amber-400 p-0.5 flex items-center gap-1" title="Download image">
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ) : (
                  <a
                    key={idx}
                    href={att.url || '#'}
                    download={att.name}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-[11px] hover:border-amber-400 transition cursor-pointer ${
                      isCurrentUser
                        ? 'bg-slate-800/80 border-slate-700 text-slate-200'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="font-medium truncate flex-1">{att.name}</span>
                    {att.size && <span className="text-[10px] opacity-60 font-mono">{att.size}</span>}
                    <Download className="w-3.5 h-3.5 opacity-60 hover:opacity-100 shrink-0" />
                  </a>
                );
              })}
            </div>
          )}

          {/* Metadata Footer: timestamp & checkmarks */}
          <div className={`flex items-center gap-1.5 mt-1.5 text-[10px] font-mono ${
            isCurrentUser ? 'justify-end text-slate-400' : 'justify-start text-slate-400'
          }`}>
            <span>{formattedTime}</span>
            {isCurrentUser && (
              <span className="inline-flex items-center text-sky-400">
                {message.status === 'sending' && <Clock className="w-3 h-3 animate-spin text-slate-400" />}
                {message.status === 'sent' && <Check className="w-3.5 h-3.5 text-slate-400" />}
                {(message.status === 'delivered' || message.status === 'read' || !message.status) && (
                  <CheckCheck className="w-3.5 h-3.5 text-sky-400" />
                )}
              </span>
            )}
          </div>
        </div>

        {/* Reaction Badges below bubble */}
        {message.reactions && message.reactions.length > 0 && (
          <div className={`flex flex-wrap gap-1 mt-1 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
            {message.reactions.map((r) => (
              <button
                key={r.emoji}
                type="button"
                onClick={() => onReactionAdd?.(message.id, r.emoji)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-white border border-slate-200 shadow-2xs hover:bg-slate-50 transition cursor-pointer"
              >
                <span>{r.emoji}</span>
                <span className="text-[10px] font-mono font-bold text-slate-600">{r.count}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Toolbar on hover */}
      {showToolbar && (
        <div
          className={`absolute -top-3.5 z-20 flex items-center gap-0.5 rounded-xl border border-slate-200 bg-white/95 backdrop-blur-md px-1 py-0.5 shadow-md transition animate-in fade-in zoom-in-95 ${
            isCurrentUser ? 'right-0' : 'left-8'
          }`}
        >
          {/* Quick Reaction Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowPicker(!showPicker)}
              className="p-1 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition cursor-pointer"
              title="Add reaction"
            >
              <SmilePlus className="w-3.5 h-3.5" />
            </button>

            {/* Quick Picker Popover */}
            {showPicker && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-2xl shadow-xl z-30">
                {QUICK_REACTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      onReactionAdd?.(message.id, emoji);
                      setShowPicker(false);
                    }}
                    className="w-7 h-7 flex items-center justify-center text-sm rounded-xl hover:scale-125 hover:bg-slate-100 transition cursor-pointer"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reply Button */}
          {onReply && (
            <button
              type="button"
              onClick={() => onReply(message)}
              className="p-1 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition cursor-pointer"
              title="Reply"
            >
              <Reply className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Delete Button */}
          {onDelete && isCurrentUser && (
            <button
              type="button"
              onClick={() => onDelete(message.id)}
              className="p-1 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
              title="Delete message"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
