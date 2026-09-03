import React, { useState } from 'react';
import { Send, Bot, Sparkles, Copy, Check, ChevronDown, ChevronUp, Terminal } from 'lucide-react';
import { CCTVProject } from '../types';
import { handleAssistantQuery } from '../utils/assistantEngine';

interface AssistantBarProps {
  project: CCTVProject;
}

export const AssistantBar: React.FC<AssistantBarProps> = ({ project }) => {
  const [inputQuery, setInputQuery] = useState('');
  const [response, setResponse] = useState<string | null>(() => {
    // Initial default update
    return handleAssistantQuery('project monitoring update', project);
  });
  const [isExpanded, setIsExpanded] = useState(true);
  const [copied, setCopied] = useState(false);

  const quickPrompts = [
    { label: 'Project Monitoring Update', query: 'project monitoring update' },
    { label: 'Weekly Check-in', query: 'weekly check-in' },
    { label: 'Summarize for exec', query: 'Summarize for exec' },
    { label: 'What should we do next?', query: 'What should we do next?' },
    { label: 'Project health score', query: 'Show project health score' },
    { label: 'Full project update', query: 'Full project update' }
  ];

  const handleSubmit = (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const queryToRun = customQuery || inputQuery;
    if (!queryToRun.trim()) return;

    const res = handleAssistantQuery(queryToRun, project);
    setResponse(res);
    setIsExpanded(true);
    setInputQuery('');
  };

  const handleCopy = () => {
    if (!response) return;
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
      {/* Bar Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-slate-900 via-sky-950/40 to-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">
                User Input 2: Project Monitoring Assistant
              </h3>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-950 text-sky-300 border border-sky-800 uppercase font-mono">
                Active
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Rules: Passage integrity, facts vs inferences, early risk detection, health scoring (/25)
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {response && (
            <button
              onClick={handleCopy}
              className="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1 transition"
              title="Copy assistant output"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Quick Intent Chips */}
      <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800/80 flex flex-wrap gap-1.5">
        <span className="text-xs text-slate-500 flex items-center gap-1 mr-1">
          <Sparkles className="w-3 h-3 text-sky-400" />
          Quick Intents:
        </span>
        {quickPrompts.map((p) => (
          <button
            key={p.label}
            onClick={() => handleSubmit(undefined, p.query)}
            className="text-xs px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-sky-600/30 text-slate-300 hover:text-sky-200 border border-slate-700/80 hover:border-sky-500/50 transition font-medium"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Expandable Output Area */}
      {isExpanded && response && (
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 max-h-72 overflow-y-auto">
          <div className="font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed bg-slate-900/90 p-3.5 rounded-lg border border-slate-800">
            {response}
          </div>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-3 bg-slate-900/90 flex gap-2">
        <div className="relative flex-1">
          <Terminal className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Type assistant query (e.g., 'What should we do next?', 'Summarize for client', 'Show health score')..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Ask</span>
        </button>
      </form>
    </div>
  );
};
