import React, { useState } from 'react';
import { Sparkles, Plus, Loader2 } from 'lucide-react';
import { parseReminderInput } from '../services/geminiService';
import { SmartParseResult } from '../types';

interface SmartInputProps {
  onAdd: (title: string, dateTime: string, category?: SmartParseResult['category']) => void;
}

export const SmartInput: React.FC<SmartInputProps> = ({ onAdd }) => {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [mode, setMode] = useState<'smart' | 'manual'>('smart');

  // Manual mode state
  const [manualDate, setManualDate] = useState('');
  const [manualTime, setManualTime] = useState('');

  const handleSmartSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsProcessing(true);
    try {
      // Optimistic simple add if no date keywords found could be done here, 
      // but let's send everything to Gemini for category detection and standardization.
      const result = await parseReminderInput(input);
      
      if (result && result.dateTime) {
        onAdd(result.title, result.dateTime, result.category);
        setInput('');
      } else {
        // Fallback: If AI fails or returns null, just add it for "one hour from now"
        const now = new Date();
        now.setHours(now.getHours() + 1);
        onAdd(input, now.toISOString(), 'personal');
        setInput('');
      }
    } catch (err) {
      console.error("Smart add failed", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !manualDate || !manualTime) return;

    const isoString = new Date(`${manualDate}T${manualTime}`).toISOString();
    onAdd(input, isoString, 'personal');
    setInput('');
    setManualDate('');
    setManualTime('');
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-slate-100 bg-slate-50/50">
            <button 
                onClick={() => setMode('smart')}
                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${mode === 'smart' ? 'text-indigo-600 bg-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
                <Sparkles size={16} />
                AI Smart Add
            </button>
            <button 
                onClick={() => setMode('manual')}
                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${mode === 'manual' ? 'text-indigo-600 bg-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
                <Plus size={16} />
                Manual Add
            </button>
        </div>

      <div className="p-4">
        {mode === 'smart' ? (
          <form onSubmit={handleSmartSubmit} className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g., Remind me to call Mom tomorrow at 5pm..."
              className="w-full pl-4 pr-14 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
              disabled={isProcessing}
            />
            <button
              type="submit"
              disabled={isProcessing || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
            >
              {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
            </button>
            <p className="text-xs text-slate-400 mt-2 px-1">
              Try: "Meeting with team on Friday at 2pm" or "Take meds in 15 minutes"
            </p>
          </form>
        ) : (
          <form onSubmit={handleManualSubmit} className="space-y-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Task title..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              required
            />
            <div className="flex gap-3">
                <input
                type="date"
                value={manualDate}
                onChange={(e) => setManualDate(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-600"
                required
                />
                <input
                type="time"
                value={manualTime}
                onChange={(e) => setManualTime(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-600"
                required
                />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              Add Reminder
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
