import React, { useState } from 'react';
import { Addiction } from '../types';
import { Edit2, Save, X } from './Icons';

interface SettingsProps {
  addictions: Addiction[];
  onToggleAddiction: (id: number) => void;
  onUpdateDate: (id: number, date: string) => void;
}

export const Settings: React.FC<SettingsProps> = ({ addictions, onToggleAddiction, onUpdateDate }) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDate, setEditDate] = useState<string>('');

  // Convert stored ISO string (UTC) to local datetime-local input format (YYYY-MM-DDTHH:mm)
  const formatForInput = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const offset = date.getTimezoneOffset() * 60000;
      const localISOTime = (new Date(date.getTime() - offset)).toISOString().slice(0, 16);
      return localISOTime;
    } catch (e) {
      return '';
    }
  };

  const handleEditClick = (addiction: Addiction) => {
    setEditingId(addiction.id);
    setEditDate(formatForInput(addiction.startDate));
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditDate('');
  };

  const handleSaveDate = (id: number) => {
    if (!editDate) return;
    // The datetime-local input gives us a string like "2023-10-25T14:30"
    // We create a Date object from it (which assumes local time) and convert to ISO
    const newDate = new Date(editDate).toISOString();
    onUpdateDate(id, newDate);
    setEditingId(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden mb-20">
      <div className="p-4 border-b border-slate-100">
        <h2 className="font-bold text-lg text-slate-800">Gestione Dipendenze</h2>
        <p className="text-sm text-slate-500">Attiva, disattiva o modifica la data di inizio</p>
      </div>
      <div>
        {addictions.map(addiction => (
          <div key={addiction.id} className="p-4 border-b border-slate-50 last:border-0">
            {editingId === addiction.id ? (
              // Edit Mode
              <div className="space-y-3 bg-slate-50 p-3 rounded-lg animate-in fade-in duration-200">
                 <div className="flex justify-between items-center">
                    <p className="font-medium text-slate-800">{addiction.name}</p>
                    <span className="text-xs font-bold text-teal-600">Modifica Data Inizio</span>
                 </div>
                 <input 
                    type="datetime-local" 
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full p-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                 />
                 <div className="flex gap-2 justify-end">
                    <button 
                        onClick={handleCancelEdit}
                        className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100"
                    >
                        <X className="w-3.5 h-3.5" /> Annulla
                    </button>
                    <button 
                        onClick={() => handleSaveDate(addiction.id)}
                        className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 shadow-sm"
                    >
                        <Save className="w-3.5 h-3.5" /> Salva
                    </button>
                 </div>
              </div>
            ) : (
              // View Mode
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-800">{addiction.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Start: {new Date(addiction.startDate).toLocaleDateString()}</p>
                  <p className="text-[10px] text-slate-400">Costo sett.: €{addiction.weeklyCost}</p>
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleEditClick(addiction)}
                    className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-full transition-colors"
                    title="Modifica data"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => onToggleAddiction(addiction.id)}
                    className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-teal-500 ${addiction.active ? 'bg-teal-500' : 'bg-slate-200'}`}
                    title={addiction.active ? "Disattiva" : "Attiva"}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform shadow-sm ${addiction.active ? 'left-6' : 'left-1'}`}></div>
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="p-4 bg-slate-50 text-xs text-slate-500 text-center">
        Versione 1.1.0 • S&O Recovery App
      </div>
    </div>
  );
};