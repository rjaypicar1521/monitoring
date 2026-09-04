import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Upload, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Camera, 
  ArrowRight, 
  Download, 
  Copy, 
  Layers, 
  Check, 
  FileCode
} from 'lucide-react';
import { CCTVProject } from '../types';
import { parseDocxReport } from '../utils/docxParser';

interface ImportProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportProject: (project: CCTVProject) => void;
}

export const ImportProjectModal: React.FC<ImportProjectModalProps> = ({
  isOpen,
  onClose,
  onImportProject
}) => {
  const [activeMode, setActiveMode] = useState<'docx' | 'json'>('docx');
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedProject, setParsedProject] = useState<CCTVProject | null>(null);
  const [jsonText, setJsonText] = useState('');
  const [copiedTemplate, setCopiedTemplate] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsParsing(true);

    try {
      if (file.name.endsWith('.docx')) {
        const project = await parseDocxReport(file);
        setParsedProject(project);
      } else if (file.name.endsWith('.json')) {
        const text = await file.text();
        const project = JSON.parse(text) as CCTVProject;
        if (!project.name || !project.tasks) {
          throw new Error('Invalid JSON format: missing "name" or "tasks"');
        }
        setParsedProject(project);
      } else {
        throw new Error('Unsupported format. Please upload a .docx (Microsoft Word) or .json file.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to parse file. Please verify file integrity.');
      setParsedProject(null);
    } finally {
      setIsParsing(false);
    }
  };

  const handleJsonSubmit = () => {
    try {
      setError(null);
      const parsed = JSON.parse(jsonText.trim());
      if (!parsed.name || !parsed.tasks) {
        throw new Error('JSON format error: must include "name" and "tasks" array.');
      }
      setParsedProject(parsed);
    } catch (err: any) {
      setError(err?.message || 'Invalid JSON syntax.');
    }
  };

  const handleConfirmImport = () => {
    if (!parsedProject) return;
    onImportProject(parsedProject);
    onClose();
  };

  const sampleDocxFormatGuide = {
    projectName: "United Pentecostal Church Philippines Inc. - Headquarters",
    reportTitle: "Project Achievement Report: CCTV Installation Progress & Success Update",
    reportDate: "03 September 2026",
    preparedBy: "Rjay Picar - RMVN",
    overallCompletion: 50,
    operationalCameras: 2,
    areas: [
      { area: "Cashier", verifiedStatus: "Installed, tested, and working", progress: 100, condition: "Complete" },
      { area: "Front Desk", verifiedStatus: "Installed, tested, and working", progress: 100, condition: "Complete" },
      { area: "Entrance Door", verifiedStatus: "Camera installation remaining", progress: 0, condition: "Pending" },
      { area: "Backdoor Entrance", verifiedStatus: "Deferred - temporary sleeping area", progress: 0, condition: "On hold" },
      { area: "Access Point Relocation", verifiedStatus: "Move AP to the existing CCTV LAN cable", progress: 0, condition: "Pending" }
    ],
    recommendedActions: [
      "Confirm when workers have vacated the backdoor area.",
      "Schedule Entrance Door and Backdoor Entrance installation.",
      "Trace all PoE injectors, then relocate the AP to the existing CCTV cable."
    ]
  };

  const handleCopyTemplateJson = () => {
    navigator.clipboard.writeText(JSON.stringify(sampleDocxFormatGuide, null, 2));
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white max-w-2xl w-full rounded-3xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center">
              <FileText className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Import CCTV Project / Report
              </h2>
              <p className="text-xs text-slate-500">
                Upload your installation report (.docx) or JSON formatted data.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle: DOCX vs JSON */}
        <div className="px-6 pt-4 flex items-center justify-between border-b border-slate-100">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setActiveMode('docx'); setError(null); }}
              className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition cursor-pointer ${
                activeMode === 'docx'
                  ? 'border-amber-500 text-amber-900'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              📄 Word Report (.docx)
            </button>
            <button
              type="button"
              onClick={() => { setActiveMode('json'); setError(null); }}
              className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition cursor-pointer ${
                activeMode === 'json'
                  ? 'border-amber-500 text-amber-900'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              ⚙️ JSON Schema
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopyTemplateJson}
            className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1 mb-2 cursor-pointer"
            title="Copy reference JSON format matching docx report"
          >
            {copiedTemplate ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Format Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>DOCX Format Guide</span>
              </>
            )}
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {activeMode === 'docx' ? (
            <div className="space-y-4">
              {/* Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-amber-500 hover:bg-amber-50/20 bg-slate-50 rounded-2xl p-8 text-center cursor-pointer transition space-y-3 group"
              >
                <div className="w-12 h-12 rounded-full bg-white shadow-xs border border-slate-200 mx-auto flex items-center justify-center text-slate-600 group-hover:text-amber-600 transition">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-amber-700 transition">
                    Click to select your CCTV Achievement Report (.docx)
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Auto-extracts project name, completion percentage, cameras, tables, and site photo proof.
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".docx,.json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {isParsing && (
                <div className="py-4 text-center text-xs text-amber-800 animate-pulse font-medium">
                  Reading document XML and extracting embedded site photos...
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-800 block">
                Paste Project JSON (matches docx schema)
              </label>
              <textarea
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                placeholder='{\n  "name": "United Pentecostal Church Philippines Inc. - Headquarters",\n  "tasks": [...]\n}'
                rows={7}
                className="w-full font-mono text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-slate-800 focus:bg-white focus:outline-none"
              />
              <button
                type="button"
                onClick={handleJsonSubmit}
                disabled={!jsonText.trim()}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Parse & Preview JSON
              </button>
            </div>
          )}

          {/* Parsed Result Preview */}
          {parsedProject && (
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-xs text-slate-900">Parsed Successfully</span>
                </div>
                <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                  {parsedProject.overallCompletion}% Complete
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Project Name</span>
                  <strong className="text-slate-800 truncate block">{parsedProject.name}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Prepared By</span>
                  <span className="text-slate-800">{parsedProject.preparedBy}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Operational Cameras</span>
                  <span className="text-slate-800">{parsedProject.installedCameras} / {parsedProject.totalCameras}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Milestone Tasks</span>
                  <span className="text-slate-800">{parsedProject.tasks.length} areas</span>
                </div>
              </div>

              {/* Photo Evidence Count */}
              {parsedProject.tasks.filter(t => t.photoEvidence).length > 0 && (
                <div className="pt-2 border-t border-slate-200/80 flex items-center gap-2 text-xs text-emerald-800">
                  <Camera className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    <strong>{parsedProject.tasks.filter(t => t.photoEvidence).length} photographic evidence attachments</strong> found and extracted from report!
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirmImport}
            disabled={!parsedProject}
            className="px-5 py-2 bg-[#1a1c22] hover:bg-slate-800 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-2"
          >
            <span>Import & Load Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
          </button>
        </div>
      </div>
    </div>
  );
};
