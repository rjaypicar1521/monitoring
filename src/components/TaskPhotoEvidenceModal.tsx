import React, { useState, useEffect, useRef } from 'react';
import { Camera, Upload, X, Check, Image as ImageIcon, AlertCircle, Trash2 } from 'lucide-react';
import { CCTVTask } from '../types';
import { Camera as CapCamera, CameraResultType, CameraSource } from '@capacitor/camera';

interface TaskPhotoEvidenceModalProps {
  task: CCTVTask | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (taskId: string, photoEvidence: string, photoCaption: string) => void;
  onDeleteEvidence?: (taskId: string) => void;
  currentUserRole?: 'client' | 'installer';
  isReadOnly?: boolean;
}

export const TaskPhotoEvidenceModal: React.FC<TaskPhotoEvidenceModalProps> = ({
  task,
  isOpen,
  onClose,
  onConfirm,
  onDeleteEvidence,
  currentUserRole,
  isReadOnly
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

  const handleCameraCapture = async () => {
    try {
      setError(null);
      const photo = await CapCamera.getPhoto({
        quality: 85,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        webUseInput: true
      });
      if (photo?.dataUrl) {
        setPhotoData(photo.dataUrl);
      } else if (photo?.webPath) {
        setPhotoData(photo.webPath);
      }
    } catch (err: any) {
      // User cancelled or web fallback needed
      const msg = err?.message || String(err);
      if (msg.toLowerCase().includes('denied')) {
        setError('Camera permission denied. Please grant permission or upload file.');
      } else if (!msg.toLowerCase().includes('cancel')) {
        console.warn('Camera capture fallback to file picker:', err);
        fileInputRef.current?.click();
      }
    }
  };

  const handleGallerySelect = async () => {
    try {
      setError(null);
      const photo = await CapCamera.getPhoto({
        quality: 85,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
        webUseInput: true
      });
      if (photo?.dataUrl) {
        setPhotoData(photo.dataUrl);
      } else if (photo?.webPath) {
        setPhotoData(photo.webPath);
      }
    } catch (err: any) {
      const msg = err?.message || String(err);
      if (msg.toLowerCase().includes('denied')) {
        setError('Photo gallery permission denied. Please grant permission or choose file.');
      } else if (!msg.toLowerCase().includes('cancel')) {
        fileInputRef.current?.click();
      }
    }
  };

  if (!isOpen || !task) return null;

  // STRICT CLIENT / READ-ONLY VIEW: Inspection only, no upload/change/delete buttons or file pickers
  const isInstaller = currentUserRole === 'installer';
  if (!isInstaller || isReadOnly) {
    const hasPhoto = Boolean(photoData);

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
        <div className="bg-white w-full max-w-lg rounded-[32px] p-6 sm:p-7 shadow-2xl border border-slate-200/90 relative space-y-5">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            title="Close viewer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#111317] text-amber-300 flex items-center justify-center shrink-0 shadow-md">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  Photographic Evidence
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  Read Only
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Official verified site inspection photo proof
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
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 ${
              task.status === 'Done' ? 'bg-emerald-100 text-emerald-950' : 'bg-amber-100 text-amber-950'
            }`}>
              {task.status === 'Done' ? 'Verified Done' : task.status}
            </span>
          </div>

          {/* Photo Display (Read Only) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 block">
              Site Photo Evidence
            </label>

            {hasPhoto ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-300 bg-slate-950 max-h-64 flex items-center justify-center shadow-inner">
                <img
                  src={photoData}
                  alt={task.title}
                  className="w-full h-full max-h-64 object-contain"
                />
                <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-emerald-400 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  <span>Verified Evidence</span>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 text-center space-y-2">
                <ImageIcon className="w-8 h-8 text-slate-400 mx-auto" />
                <div className="text-xs font-bold text-slate-700">No Photographic Evidence Uploaded</div>
                <div className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  The installer team has not attached verified photo proof for this task yet.
                </div>
              </div>
            )}
          </div>

          {/* Read-Only Caption / Notes */}
          {caption && (
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Verification Notes
              </span>
              <p className="text-slate-800 font-medium">
                {caption}
              </p>
            </div>
          )}

          {/* Actions: ONLY Close Button */}
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition cursor-pointer"
            >
              Close Viewer
            </button>
          </div>
        </div>
      </div>
    );
  }

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
                    onClick={handleGallerySelect}
                    className="px-3 py-1.5 bg-white text-slate-900 rounded-xl text-xs font-bold shadow-md cursor-pointer hover:bg-slate-100 transition"
                  >
                    Change Photo
                  </button>
                  <button
                    type="button"
                    onClick={handleCameraCapture}
                    className="px-3 py-1.5 bg-amber-400 text-slate-950 rounded-xl text-xs font-bold shadow-md cursor-pointer hover:bg-amber-500 transition"
                  >
                    Retake
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
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={handleCameraCapture}
                  className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs shadow-md transition cursor-pointer active:scale-[0.99]"
                >
                  <Camera className="w-4 h-4" />
                  <span>Take Live Photo (Native Camera)</span>
                </button>

                <div
                  onClick={handleGallerySelect}
                  className="border-2 border-dashed border-slate-300 hover:border-slate-800 bg-slate-50 hover:bg-slate-100/80 rounded-2xl p-4 text-center cursor-pointer transition space-y-1"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center mx-auto">
                    <Upload className="w-4 h-4 text-slate-700" />
                  </div>
                  <div className="text-xs font-bold text-slate-800">
                    Or select image from device gallery
                  </div>
                  <div className="text-[10px] text-slate-400">
                    PNG, JPG, or WEBP up to 5MB
                  </div>
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
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
            {task.photoEvidence ? (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Delete photographic evidence for "${task.title}"?`)) {
                    if (onDeleteEvidence) {
                      onDeleteEvidence(task.id);
                    } else {
                      onConfirm(task.id, '', '');
                    }
                    onClose();
                  }
                }}
                className="px-3.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
                title="Delete photographic evidence from this task"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Evidence</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
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
