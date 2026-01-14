import React, { useState } from 'react';
import { JournalEntry } from '../types';
import { Plus } from './Icons';

interface JournalProps {
  entries: JournalEntry[];
  onAddEntry: (entry: Omit<JournalEntry, 'id'>) => void;
}

const MoodSelector = ({ selected, onSelect }: { selected: string, onSelect: (m: any) => void }) => {
    const moods = [
        { key: 'happy', emoji: '😊', label: 'Bene' },
        { key: 'neutral', emoji: '😐', label: 'Neutro' },
        { key: 'stressed', emoji: '😖', label: 'Stress' },
        { key: 'sad', emoji: '😔', label: 'Triste' },
    ];

    return (
        <div className="flex justify-between gap-2 mb-4">
            {moods.map(m => (
                <button
                    key={m.key}
                    onClick={() => onSelect(m.key)}
                    className={`flex-1 p-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${selected === m.key ? 'bg-teal-50 border-teal-500 ring-1 ring-teal-500' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
                >
                    <span className="text-2xl">{m.emoji}</span>
                    <span className="text-[10px] font-medium text-slate-600">{m.label}</span>
                </button>
            ))}
        </div>
    );
};

export const Journal: React.FC<JournalProps> = ({ entries, onAddEntry }) => {
  const [isWriting, setIsWriting] = useState(false);
  const [text, setText] = useState('');
  const [mood, setMood] = useState<'happy' | 'neutral' | 'sad' | 'stressed'>('neutral');

  const handleSubmit = () => {
    if (!text.trim()) return;
    onAddEntry({
        timestamp: new Date().toISOString(),
        mood,
        text
    });
    setText('');
    setMood('neutral');
    setIsWriting(false);
  };

  if (isWriting) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 animate-in fade-in zoom-in duration-200">
            <h2 className="font-bold text-lg text-slate-800 mb-4">Nuova Pagina di Diario</h2>
            
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Come ti senti?</label>
            <MoodSelector selected={mood} onSelect={setMood} />

            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">I tuoi pensieri</label>
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Scrivi qui i tuoi pensieri, le tue paure o le tue vittorie..."
                className="w-full h-40 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none resize-none mb-4"
            />
            
            <div className="flex gap-2">
                <button onClick={() => setIsWriting(false)} className="flex-1 py-3 text-slate-500 font-medium hover:bg-slate-50 rounded-xl">Annulla</button>
                <button onClick={handleSubmit} className="flex-1 py-3 bg-teal-600 text-white font-medium rounded-xl hover:bg-teal-700 shadow-lg shadow-teal-200">Salva Nota</button>
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
        <div className="bg-teal-600 rounded-xl p-6 text-white shadow-lg shadow-teal-200">
            <h2 className="text-xl font-bold mb-1">Il tuo Diario</h2>
            <p className="text-teal-100 text-sm mb-4">Scrivere aiuta a liberare la mente senza giudizio.</p>
            <button 
                onClick={() => setIsWriting(true)}
                className="w-full py-3 bg-white text-teal-700 font-bold rounded-lg hover:bg-teal-50 transition flex items-center justify-center gap-2"
            >
                <Plus className="w-5 h-5" />
                Scrivi un pensiero
            </button>
        </div>

        <div className="space-y-4">
            {entries.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                    <p>Il diario è vuoto.</p>
                    <p className="text-xs">Inizia a scrivere per tracciare il tuo umore.</p>
                </div>
            ) : (
                entries.map(entry => (
                    <div key={entry.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                                <span className="text-xl" title={entry.mood}>
                                    {entry.mood === 'happy' ? '😊' : entry.mood === 'sad' ? '😔' : entry.mood === 'stressed' ? '😖' : '😐'}
                                </span>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                                    {new Date(entry.timestamp).toLocaleDateString()}
                                </span>
                            </div>
                            <span className="text-[10px] text-slate-300">
                                {new Date(entry.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                        </div>
                        <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{entry.text}</p>
                    </div>
                ))
            )}
        </div>
    </div>
  );
};