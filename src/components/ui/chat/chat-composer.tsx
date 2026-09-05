import React, { useState, useRef, useEffect } from 'react';
import { Send, ArrowUp, Paperclip, X, Image as ImageIcon, Sparkles } from 'lucide-react';
import { ChatMessageData } from './types';

interface ChatComposerProps {
  onSend: (text: string, attachments?: { name: string; size?: string; type?: string }[]) => void;
  replyingTo?: ChatMessageData | null;
  onCancelReply?: () => void;
  placeholder?: string;
  quickPrompts?: string[];
  disabled?: boolean;
}

export const ChatComposer: React.FC<ChatComposerProps> = ({
  onSend,
  replyingTo,
  onCancelReply,
  placeholder = 'Type message or directive to Lead Technician (Rjay Picar)...',
  quickPrompts = [
    'Can we verify CAM-04 backdoor angle?',
    'What is the ETA for power trunking line?',
    'Electrician is on site for inspection',
    'Please confirm DVR live feed test'
  ],
  disabled = false,
}) => {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<{ name: string; size?: string; type?: string }[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  const handleSend = () => {
    if (!text.trim() && attachments.length === 0) return;
    onSend(text.trim(), attachments.length > 0 ? attachments : undefined);
    setText('');
    setAttachments([]);
    if (onCancelReply) onCancelReply();
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAttachDemoFile = () => {
    const sampleFiles = [
      { name: 'site-conduit-photo.jpg', size: '1.8 MB', type: 'image/jpeg' },
      { name: 'camera-angle-instruction.pdf', size: '240 KB', type: 'application/pdf' },
      { name: 'dvr-rack-clearance.png', size: '890 KB', type: 'image/png' },
    ];
    const picked = sampleFiles[Math.floor(Math.random() * sampleFiles.length)];
    setAttachments((prev) => [...prev, picked]);
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2 border-t border-slate-100 pt-3">
      {/* Quick Prompt Chips */}
      {quickPrompts && quickPrompts.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-none">
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1 shrink-0">
            <Sparkles className="w-3 h-3" /> Quick:
          </span>
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setText(prompt)}
              className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-amber-100 hover:text-amber-950 text-slate-600 text-[11px] font-medium transition cursor-pointer shrink-0 border border-slate-200/60"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Quoting / Replying preview banner */}
      {replyingTo && (
        <div className="flex items-center justify-between bg-amber-50/80 border border-amber-200/90 rounded-xl px-3 py-1.5 text-xs text-amber-900 animate-in fade-in">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-bold text-[11px]">Replying to {replyingTo.senderName}:</span>
            <span className="text-slate-600 truncate text-[11px] max-w-[260px] italic">
              {replyingTo.text}
            </span>
          </div>
          <button
            type="button"
            onClick={onCancelReply}
            className="p-1 rounded-lg hover:bg-amber-200 text-amber-800 transition cursor-pointer shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Attachments preview banner */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {attachments.map((att, idx) => (
            <div
              key={idx}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 text-[11px] text-slate-700"
            >
              <Paperclip className="w-3 h-3 text-amber-600" />
              <span className="font-medium truncate max-w-[150px]">{att.name}</span>
              <button
                type="button"
                onClick={() => handleRemoveAttachment(idx)}
                className="hover:text-rose-600 p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Composer Box */}
      <div className="flex items-end gap-2 bg-slate-50 border border-slate-200 focus-within:border-slate-800 focus-within:bg-white rounded-2xl p-2 transition shadow-2xs">
        <button
          type="button"
          onClick={handleAttachDemoFile}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer shrink-0"
          title="Attach site photo or document"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 bg-transparent border-0 focus:ring-0 focus:outline-none text-xs text-slate-800 placeholder-slate-400 resize-none py-1.5 min-h-[28px] max-h-[120px]"
        />

        <button
          type="button"
          onClick={handleSend}
          disabled={disabled || (!text.trim() && attachments.length === 0)}
          className="p-2 rounded-xl bg-[#111317] hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none text-white shadow-xs transition cursor-pointer shrink-0"
          title="Send message (Enter)"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 font-mono">
        <span>Press <kbd className="bg-slate-100 px-1 py-0.5 rounded border border-slate-200 text-slate-600 font-sans">Enter</kbd> to send, <kbd className="bg-slate-100 px-1 py-0.5 rounded border border-slate-200 text-slate-600 font-sans">Shift + Enter</kbd> for new line</span>
        <span className="text-amber-700 font-sans font-bold">Encrypted 2-Way Dispatch</span>
      </div>
    </div>
  );
};
