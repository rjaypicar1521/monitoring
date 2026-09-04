import React, { useState, useEffect, useRef } from 'react';
import { Camera, Upload, X, Check, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { CCTVTask } from '../types';

interface TaskPhotoEvidenceModalProps {
  task: CCTVTask | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (taskId: string, photoEvidence: string, photoCaption: string) => void;
}

export const TaskPhotoEvidenceModal: React.FC<TaskPhotoEvidenceModalProps> = ({
  task,
  isOpen,
  onClose,
  onConfirm
}) => {
  const [photoData, setPhotoData] = useState<string>('');
  const [caption, setCaption] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && task) {
      setPhotoData(task.photoEvidence || '');
      setCaption(task.photoCaption || `${task.area || task.title} installation verified`);
      setError(null);
    }
  }, [isOpen, task]);

  if (!isOpen || !task) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('File size exceeds 5MB. Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const res = event.target?.result as string;
      if (res) {
        setPhotoData(res);
        setError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePresetSelect = (url: string, presetCaption: string) => {
    setPhotoData(url);
    setCaption(presetCaption);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoData) {
      setError('Photo evidence is required to complete this task.');
      return;
    }
    onConfirm(task.id, photoData, caption.trim() || 'Installation verified and tested.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-[32px] p-6 sm:p-7 shadow-2xl border border-slate-200/90 relative space-y-5">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#111317] text-amber-300 flex items-center justify-center shrink-0 shadow-md">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Attach Photographic Evidence
            </h2>
            <p className="text-xs text-slate-500">
              Required proof to mark task as verified & complete
            </p>
          </div>
        </div>

        {/* Task Summary Pill */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <div className="font-bold text-slate-900 truncate">{task.title}</div>
            <div className="text-[11px] text-slate-500">
              {task.area ? `Area: ${task.area}` : task.category} • Assigned: {task.owner}
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-950 shrink-0">
            Pending Evidence
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Photo Dropzone / Preview */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 block">
              Site Photo Evidence <span className="text-rose-600">*</span>
            </label>

            {photoData ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-300 bg-slate-900 h-48 group">
                <img
                  src={photoData}
                  alt="Evidence preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-white text-slate-900 rounded-xl text-xs font-bold shadow-md cursor-pointer hover:bg-slate-100 transition"
                  >
                    Change Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhotoData('')}
                    className="px-3 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer hover:bg-rose-700 transition"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-slate-800 bg-slate-50 hover:bg-slate-100/80 rounded-2xl p-6 text-center cursor-pointer transition space-y-2"
              >
                <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center mx-auto">
                  <Upload className="w-5 h-5 text-slate-700" />
                </div>
                <div className="text-xs font-bold text-slate-800">
                  Click to upload site photo evidence
                </div>
                <div className="text-[11px] text-slate-400">
                  PNG, JPG, or WEBP up to 5MB
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {/* Quick Presets for Demo/Testing */}
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-slate-500">
              Or choose verified sample evidence:
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() =>
                  handlePresetSelect(
                    '/evidence/image1.jpg',
                    'Dome camera installed and aligned'
                  )
                }
                className="p-1.5 rounded-xl border border-slate-200 hover:border-amber-400 text-left bg-slate-50 hover:bg-amber-50/50 transition cursor-pointer text-[10px]"
              >
                <span className="font-bold block text-slate-800">Cashier Dome</span>
                <span className="text-slate-400 text-[9px]">Aligned & tested</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  handlePresetSelect(
                    '/evidence/image2.jpg',
                    'Front Desk camera installed above reception'
                  )
                }
                className="p-1.5 rounded-xl border border-slate-200 hover:border-amber-400 text-left bg-slate-50 hover:bg-amber-50/50 transition cursor-pointer text-[10px]"
              >
                <span className="font-bold block text-slate-800">Front Desk</span>
                <span className="text-slate-400 text-[9px]">Above reception</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  handlePresetSelect(
                    '/evidence/image3.jpg',
                    'Live video feeds confirmed on CCTV monitor'
                  )
                }
                className="p-1.5 rounded-xl border border-slate-200 hover:border-amber-400 text-left bg-slate-50 hover:bg-amber-50/50 transition cursor-pointer text-[10px]"
              >
                <span className="font-bold block text-slate-800">NVR Display</span>
                <span className="text-slate-400 text-[9px]">Feeds live on monitor</span>
              </button>
            </div>
          </div>

          {/* Caption Input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-800 block">
              Verification Caption / Notes
            </label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="e.g. Dome camera aligned and tested on NVR monitor"
              className="w-full bg-slate-50 border border-slate-200 focus:border-slate-800 focus:bg-white rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none transition shadow-2xs"
            />
          </div>

          {error && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-1.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!photoData}
              className="px-5 py-2.5 rounded-xl bg-[#111317] hover:bg-slate-800 disabled:opacity-40 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5 text-amber-300" />
              <span>Complete Task with Evidence</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export interface LightboxPhoto {
  url: string;
  title: string;
  caption?: string;
  area?: string;
}

interface PhotoLightboxModalProps {
  photo: LightboxPhoto | null;
  onClose: () => void;
}

export const PhotoLightboxModal: React.FC<PhotoLightboxModalProps> = ({
  photo,
  onClose
}) => {
  if (!photo) return null;

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in cursor-zoom-out"
    >
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="bg-[#111317] text-white max-w-2xl w-full rounded-3xl overflow-hidden shadow-2xl border border-slate-800 cursor-default animate-in zoom-in-95"
      >
        <div className="p-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <h3 className="font-bold text-sm text-white">{photo.title}</h3>
            {photo.area && (
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 text-[10px] font-mono font-bold">
                {photo.area}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="relative bg-black flex items-center justify-center max-h-[60vh] overflow-hidden">
          <img
            src={photo.url}
            alt={photo.title}
            className="w-full h-full max-h-[60vh] object-contain"
          />
        </div>

        {photo.caption && (
          <div className="p-4 bg-[#181a20] border-t border-slate-800/80">
            <p className="text-xs text-slate-300 font-medium leading-relaxed">
              📷 <strong>Photographic Evidence:</strong> {photo.caption}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
