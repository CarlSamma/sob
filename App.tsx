import React, { useState, useEffect } from 'react';
import { Tab, Addiction, Relapse, JournalEntry } from './types';
import { getAddictions, saveAddictions, getRelapses, saveRelapse, updateAddictionStartDate, getJournalEntries, saveJournalEntry } from './services/storageService';
import { Dashboard } from './components/Dashboard';
import { AICoach } from './components/AICoach';
import { Settings } from './components/Settings';
import { RelapseLog } from './components/RelapseLog';
import { Journal } from './components/Journal';
import { HeartPulse, MessageSquare, SettingsIcon, BookOpen } from './components/Icons';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.DASHBOARD);
  const [addictions, setAddictions] = useState<Addiction[]>([]);
  const [relapses, setRelapses] = useState<Relapse[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [showRelapseModal, setShowRelapseModal] = useState(false);

  // Load initial data
  useEffect(() => {
    setAddictions(getAddictions());
    setRelapses(getRelapses());
    setJournalEntries(getJournalEntries());
  }, []);

  const handleLogRelapse = (newRelapse: Omit<Relapse, 'id'>) => {
    const relapse: Relapse = { ...newRelapse, id: Date.now() };
    const updatedRelapses = saveRelapse(relapse);
    setRelapses(updatedRelapses);
    
    // Also reset the start date for that addiction
    const updatedAddictions = updateAddictionStartDate(newRelapse.addictionId, newRelapse.timestamp);
    setAddictions(updatedAddictions);
    
    setShowRelapseModal(false);
  };

  const handleAddJournalEntry = (newEntry: Omit<JournalEntry, 'id'>) => {
      const entry: JournalEntry = { ...newEntry, id: Date.now() };
      const updated = saveJournalEntry(entry);
      setJournalEntries(updated);
  };

  const handleToggleAddiction = (id: number) => {
    const updated = addictions.map(a => a.id === id ? { ...a, active: !a.active } : a);
    saveAddictions(updated);
    setAddictions(updated);
  };

  const handleResetDate = (id: number) => {
      const confirm = window.confirm("Vuoi far ripartire il contatore da ADESSO? Questa azione cancellerà i progressi attuali per questa dipendenza.");
      if(confirm) {
        const updated = updateAddictionStartDate(id, new Date().toISOString());
        setAddictions(updated);
      }
  };

  const handleUpdateDate = (id: number, date: string) => {
    const updated = updateAddictionStartDate(id, date);
    setAddictions(updated);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto shadow-2xl overflow-hidden relative">
      {/* Header */}
      <header className="bg-white p-4 flex justify-between items-center sticky top-0 z-10 border-b border-slate-100">
        <h1 className="text-xl font-bold text-teal-700 tracking-tight">S&O</h1>
        <div className="text-xs font-semibold bg-teal-50 text-teal-700 px-3 py-1 rounded-full">
            {addictions.filter(a => a.active).length} Attivi
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 overflow-y-auto">
        {activeTab === Tab.DASHBOARD && (
          <Dashboard 
            addictions={addictions} 
            relapses={relapses} 
            onLogRelapse={() => setShowRelapseModal(true)} 
            onResetDate={handleResetDate}
          />
        )}
        {activeTab === Tab.JOURNAL && (
          <Journal 
            entries={journalEntries}
            onAddEntry={handleAddJournalEntry}
          />
        )}
        {activeTab === Tab.COACH && (
          <AICoach 
            addictions={addictions} 
            relapses={relapses} 
            journalEntries={journalEntries}
          />
        )}
        {activeTab === Tab.SETTINGS && (
          <Settings 
            addictions={addictions} 
            onToggleAddiction={handleToggleAddiction}
            onUpdateDate={handleUpdateDate}
          />
        )}
      </main>

      {/* Navigation Bar */}
      <nav className="bg-white border-t border-slate-200 px-4 py-3 flex justify-between items-center sticky bottom-0 z-20 pb-safe">
        <button 
          onClick={() => setActiveTab(Tab.DASHBOARD)}
          className={`flex flex-col items-center gap-1 transition-colors w-16 ${activeTab === Tab.DASHBOARD ? 'text-teal-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <HeartPulse className="w-6 h-6" />
          <span className="text-[10px] font-semibold">Home</span>
        </button>

        <button 
          onClick={() => setActiveTab(Tab.JOURNAL)}
          className={`flex flex-col items-center gap-1 transition-colors w-16 ${activeTab === Tab.JOURNAL ? 'text-teal-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <BookOpen className="w-6 h-6" />
          <span className="text-[10px] font-semibold">Diario</span>
        </button>

        <button 
          onClick={() => setActiveTab(Tab.COACH)}
          className={`flex flex-col items-center gap-1 transition-colors w-16 ${activeTab === Tab.COACH ? 'text-teal-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <div className="relative">
            <MessageSquare className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          </div>
          <span className="text-[10px] font-semibold">AI Coach</span>
        </button>

        <button 
          onClick={() => setActiveTab(Tab.SETTINGS)}
          className={`flex flex-col items-center gap-1 transition-colors w-16 ${activeTab === Tab.SETTINGS ? 'text-teal-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <SettingsIcon className="w-6 h-6" />
          <span className="text-[10px] font-semibold">Profilo</span>
        </button>
      </nav>

      {/* Modals */}
      {showRelapseModal && (
        <RelapseLog 
          addictions={addictions.filter(a => a.active).length > 0 ? addictions.filter(a => a.active) : addictions} 
          onSave={handleLogRelapse} 
          onCancel={() => setShowRelapseModal(false)} 
        />
      )}
    </div>
  );
};

export default App;