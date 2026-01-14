import React, { useState } from 'react';
import { Addiction, Relapse } from '../types';

interface RelapseLogProps {
  addictions: Addiction[];
  onSave: (relapse: Omit<Relapse, 'id'>) => void;
  onCancel: () => void;
}

export const RelapseLog: React.FC<RelapseLogProps> = ({ addictions, onSave, onCancel }) => {
  const [addictionId, setAddictionId] = useState<number>(addictions.find(a => a.active)?.id || addictions[0].id);
  const [trigger, setTrigger] = useState('');
  const [severity, setSeverity] = useState(3);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      addictionId,
      timestamp: new Date().toISOString(),
      trigger,
      severity
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl animate-in fade-in zoom-in duration-200">
        <h2 className="text-xl font-bold text-slate-900 mb-1">Registra Sgarro</h2>
        <p className="text-sm text-slate-500 mb-6">L'onestà è il primo passo. Questo dato aiuterà l'AI a supportarti meglio.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Dipendenza</label>
            <select 
              value={addictionId} 
              onChange={(e) => setAddictionId(Number(e.target.value))}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
            >
              {addictions.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Cosa ha scatenato l'evento? (Trigger)</label>
            <textarea 
              value={trigger}
              onChange={(e) => setTrigger(e.target.value)}
              placeholder="Es. Stress lavoro, festa con amici..."
              required
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none h-24 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Gravità (1-5)</label>
            <div className="flex justify-between gap-2">
              {[1, 2, 3, 4, 5].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setSeverity(num)}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-all ${
                    severity === num 
                      ? 'bg-slate-800 text-white border-slate-800' 
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 px-1">
              <span>Lieve</span>
              <span>Grave</span>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              type="button" 
              onClick={onCancel}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
            >
              Annulla
            </button>
            <button 
              type="submit" 
              className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-teal-200"
            >
              Salva
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};