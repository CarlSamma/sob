import React, { useEffect, useState } from 'react';
import { Addiction, Relapse, MILESTONES } from '../types';
import { AlertCircle, HeartPulse, TrendingUp, RefreshCw } from './Icons';
import { analyzePatterns } from '../services/geminiService';

interface DashboardProps {
  addictions: Addiction[];
  relapses: Relapse[];
  onLogRelapse: () => void;
  onResetDate: (id: number) => void;
}

const TimeCounter = ({ startDate }: { startDate: string }) => {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const update = () => {
      const now = new Date().getTime();
      const start = new Date(startDate).getTime();
      const diff = now - start;

      if (diff < 0) {
          setTime({ days: 0, hours: 0, minutes: 0, seconds: 0 });
          return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTime({ days, hours, minutes, seconds });
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [startDate]);

  return (
    <div className="grid grid-cols-4 gap-2 text-center py-4">
      <div>
        <div className="text-2xl font-bold text-slate-800">{time.days}</div>
        <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Giorni</div>
      </div>
      <div>
        <div className="text-2xl font-bold text-slate-800">{time.hours}</div>
        <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Ore</div>
      </div>
      <div>
        <div className="text-2xl font-bold text-slate-800">{time.minutes}</div>
        <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Min</div>
      </div>
      <div>
        <div className="text-2xl font-bold text-slate-800">{time.seconds}</div>
        <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Sec</div>
      </div>
    </div>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({ addictions, relapses, onLogRelapse, onResetDate }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const activeAddictions = addictions.filter(a => a.active);

  const calculateSavings = (addiction: Addiction) => {
    const now = new Date().getTime();
    const start = new Date(addiction.startDate).getTime();
    const days = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    return ((days / 7) * addiction.weeklyCost).toFixed(2);
  };

  const getMilestoneProgress = (startDate: string) => {
    const start = new Date(startDate).getTime();
    const now = new Date().getTime();
    const currentDays = (now - start) / (1000 * 60 * 60 * 24);

    // Find next milestone
    const nextMilestone = MILESTONES.find(m => m.days > currentDays);
    const prevMilestone = [...MILESTONES].reverse().find(m => m.days <= currentDays) || { days: 0 };

    if (!nextMilestone) {
        return { percent: 100, label: "Leggenda", daysLeft: 0 };
    }

    const totalSpan = nextMilestone.days - prevMilestone.days;
    const progress = currentDays - prevMilestone.days;
    const percent = Math.min(100, Math.max(0, (progress / totalSpan) * 100));
    
    return {
        percent: percent,
        label: nextMilestone.label,
        daysLeft: Math.ceil(nextMilestone.days - currentDays)
    };
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    const result = await analyzePatterns(relapses, addictions);
    setAnalysis(result);
    setAnalyzing(false);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header Stats */}
      {activeAddictions.length === 0 ? (
        <div className="p-6 bg-white rounded-xl text-center border border-slate-200">
          <p className="text-slate-500">Nessuna dipendenza attiva. Vai in Impostazioni per iniziare.</p>
        </div>
      ) : (
        activeAddictions.map(addiction => {
          const progress = getMilestoneProgress(addiction.startDate);
          
          return (
            <div key={addiction.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className={`${addiction.color} p-4 text-white flex justify-between items-center`}>
                    <div className="flex items-center gap-2">
                         <h3 className="font-bold text-lg flex items-center gap-2">
                            <HeartPulse className="w-5 h-5 opacity-80" />
                            {addiction.name}
                        </h3>
                        <button 
                            onClick={() => onResetDate(addiction.id)} 
                            className="ml-2 p-1.5 bg-white/20 hover:bg-white/30 rounded-full transition-colors group"
                            title="Ricomincia astensione da ora"
                        >
                            <RefreshCw className="w-4 h-4 text-white group-active:rotate-180 transition-transform duration-300" />
                        </button>
                    </div>
                    <div className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                        €{calculateSavings(addiction)} Risparmiati
                    </div>
                </div>
                <div className="p-2">
                    <div className="text-center pt-2">
                         <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                             Iniziato il {new Date(addiction.startDate).toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })} alle {new Date(addiction.startDate).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                         </p>
                    </div>
                    {/* Aggiunta key per forzare il reset del componente quando cambia la data */}
                    <TimeCounter key={addiction.startDate} startDate={addiction.startDate} />
                </div>
                
                {/* Real Progress Logic */}
                <div className="px-6 pb-6">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Prossimo Obiettivo</span>
                        <div className="text-right">
                            <span className="text-sm font-bold text-slate-800">{progress.label}</span>
                            <span className="text-[10px] text-slate-400 block">(-{progress.daysLeft} giorni)</span>
                        </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                        <div 
                            className="bg-slate-800 h-2 rounded-full transition-all duration-1000 ease-out" 
                            style={{ width: `${progress.percent}%` }}
                        ></div>
                    </div>
                </div>
            </div>
          );
        })
      )}

      {/* Quick Action */}
      <button 
        onClick={onLogRelapse}
        className="w-full py-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl border border-red-100 flex items-center justify-center gap-2 transition-colors font-medium"
      >
        <AlertCircle className="w-5 h-5" />
        Registra una Ricaduta
      </button>

      {/* AI Analysis Section */}
      <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-indigo-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Analisi Pattern AI
          </h3>
          <button 
            onClick={handleAnalyze} 
            disabled={analyzing || relapses.length < 1}
            className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-full disabled:opacity-50"
          >
            {analyzing ? 'Analisi...' : 'Aggiorna'}
          </button>
        </div>
        <p className="text-sm text-indigo-800 leading-relaxed">
          {analysis || (relapses.length < 3 
            ? "Registra almeno 3 eventi per sbloccare l'analisi predittiva dei pattern comportamentali." 
            : "Clicca su 'Aggiorna' per analizzare i tuoi dati e scoprire i trigger nascosti.")}
        </p>
      </div>

      {/* Recent History */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
        <h3 className="font-bold text-slate-800 mb-4">Cronologia Recente</h3>
        {relapses.length === 0 ? (
          <p className="text-sm text-slate-400 italic">Nessun evento negativo registrato. Ottimo lavoro!</p>
        ) : (
          <div className="space-y-4">
            {relapses.slice(0, 5).map(relapse => {
                const addName = addictions.find(a => a.id === relapse.addictionId)?.name;
                return (
                    <div key={relapse.id} className="flex gap-4 items-start pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                        <div className="w-2 h-2 mt-2 rounded-full bg-red-400 shrink-0"></div>
                        <div>
                        <p className="text-sm font-medium text-slate-800">Sgarro: {addName}</p>
                        <p className="text-xs text-slate-500 mt-1">{new Date(relapse.timestamp).toLocaleString()}</p>
                        {relapse.trigger && (
                            <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2 rounded border border-slate-100">
                            "{relapse.trigger}"
                            </p>
                        )}
                        </div>
                    </div>
                )
            })}
          </div>
        )}
      </div>
    </div>
  );
};