import React, { useState, useRef, useEffect } from 'react';
import { Send, ArrowUp, Paperclip, X, Image as ImageIcon, Mic, Square, Check } from 'lucide-react';
import { ChatMessageData } from './types';

interface ChatComposerProps {
  onSend: (
    text: string,
    attachments?: { name: string; size?: string; type?: string; url?: string }[],
    voice?: { url: string; duration: number }
  ) => void;
  replyingTo?: ChatMessageData | null;
  onCancelReply?: () => void;
  placeholder?: string;
  disabled?: boolean;
  allowAttachments?: boolean;
  currentUserRole?: 'client' | 'installer';
}

export const ChatComposer: React.FC<ChatComposerProps> = ({
  onSend,
  replyingTo,
  onCancelReply,
  placeholder = 'Type a message to technician...',
  disabled = false,
  allowAttachments,
  currentUserRole,
}) => {
  const canAttachPhotos = Boolean(allowAttachments !== undefined ? allowAttachments : currentUserRole === 'installer');
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<{ name: string; size?: string; type?: string; url?: string }[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  // Clean up recording timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const handleSend = () => {
    const validAttachments = canAttachPhotos && attachments.length > 0 ? attachments : undefined;
    if (!text.trim() && !validAttachments) return;
    onSend(text.trim(), validAttachments);
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

  // Real native file picker handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canAttachPhotos) return;
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        const sizeStr = file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.round(file.size / 1024)} KB`;

        setAttachments((prev) => [
          ...prev,
          {
            name: file.name,
            size: sizeStr,
            type: file.type || 'application/octet-stream',
            url: dataUrl,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // Real microphone audio recording using MediaRecorder
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn('Microphone error:', err);
      // Fallback: prompt user if mic blocked
      alert('Microphone access is not permitted or unavailable on this browser.');
    }
  };

  const stopAndSendRecording = () => {
    if (!mediaRecorderRef.current || !isRecording) return;
    if (timerRef.current) clearInterval(timerRef.current);

    const duration = recordingSeconds || 1;
    mediaRecorderRef.current.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        onSend('', undefined, { url: dataUrl, duration });
      };
      reader.readAsDataURL(audioBlob);

      mediaRecorderRef.current?.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      setRecordingSeconds(0);
    };

    mediaRecorderRef.current.stop();
  };

  const cancelRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  return (
    <div className="space-y-2 border-t border-slate-100 pt-3">
      {/* Hidden native file input (Admin only) */}
      {canAttachPhotos && (
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          accept="image/*,.pdf,.doc,.docx,.txt"
          className="hidden"
        />
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
                className="hover:text-rose-600 p-0.5 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Active Voice Recording UI */}
      {isRecording ? (
        <div className="flex items-center justify-between bg-rose-50 border border-rose-200 rounded-2xl p-2.5 animate-pulse">
          <div className="flex items-center gap-2 text-rose-700 text-xs font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
            <Mic className="w-4 h-4" />
            <span>Recording voice note... {recordingSeconds}s</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={cancelRecording}
              className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-rose-100 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={stopAndSendRecording}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition shadow-xs cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Send Audio</span>
            </button>
          </div>
        </div>
      ) : (
        /* Standard Composer Input Box */
        <div className="flex items-end gap-2 bg-slate-50 border border-slate-200 focus-within:border-slate-800 focus-within:bg-white rounded-2xl p-2 transition shadow-2xs">
          {/* Real file upload button (Admin only) */}
          {canAttachPhotos && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition cursor-pointer shrink-0"
              title="Upload photo or document"
            >
              <Paperclip className="w-4 h-4" />
            </button>
          )}

          {/* Real voice recording button */}
          <button
            type="button"
            onClick={startRecording}
            className="p-2 rounded-xl text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition cursor-pointer shrink-0"
            title="Record voice note"
          >
            <Mic className="w-4 h-4" />
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
      )}

      <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 font-mono">
        <span>Press <kbd className="bg-slate-100 px-1 py-0.5 rounded border border-slate-200 text-slate-600 font-sans">Enter</kbd> to send, <kbd className="bg-slate-100 px-1 py-0.5 rounded border border-slate-200 text-slate-600 font-sans">Shift + Enter</kbd> for line</span>
        <span className="text-amber-700 font-sans font-bold">2-Way Live Dispatch</span>
      </div>
    </div>
  );
};
