import React, { useState, useRef, useEffect } from 'react';
import { Send, CheckCircle2 } from './Icons';
import { Addiction, Relapse, ChatMessage, JournalEntry } from '../types';
import { getCoachResponse } from '../services/geminiService';

interface AICoachProps {
  addictions: Addiction[];
  relapses: Relapse[];
  journalEntries: JournalEntry[];
}

export const AICoach: React.FC<AICoachProps> = ({ addictions, relapses, journalEntries }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Ciao! Sono il tuo coach S&O. Ho accesso ai tuoi dati e al tuo diario. Come ti senti oggi? Hai bisogno di motivazione o stai affrontando un momento difficile?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const responseText = await getCoachResponse(userMsg.text, addictions, relapses, journalEntries);

    const modelMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, modelMsg]);
    setIsTyping(false);
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-500 p-4 text-white flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
          <CheckCircle2 className="text-white" />
        </div>
        <div>
          <h2 className="font-bold">S&O Coach AI</h2>
          <p className="text-xs text-teal-100 opacity-90">Analisi integrata col Diario</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
                msg.role === 'user'
                  ? 'bg-teal-600 text-white rounded-tr-none'
                  : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              <p className={`text-[10px] mt-2 ${msg.role === 'user' ? 'text-teal-200' : 'text-slate-400'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-4 shadow-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {messages.length < 3 && (
        <div className="px-4 py-2 bg-slate-50 flex gap-2 overflow-x-auto scrollbar-hide">
          <button onClick={() => handleQuickPrompt("Ho una voglia matta adesso.")} className="text-xs bg-white border border-teal-200 text-teal-700 px-3 py-1.5 rounded-full hover:bg-teal-50 transition whitespace-nowrap">
            🆘 Ho un craving
          </button>
          <button onClick={() => handleQuickPrompt("Quali sono i miei progressi?")} className="text-xs bg-white border border-teal-200 text-teal-700 px-3 py-1.5 rounded-full hover:bg-teal-50 transition whitespace-nowrap">
            📈 I miei progressi
          </button>
          <button onClick={() => handleQuickPrompt("Mi sento demotivato.")} className="text-xs bg-white border border-teal-200 text-teal-700 px-3 py-1.5 rounded-full hover:bg-teal-50 transition whitespace-nowrap">
            😔 Mi sento giù
          </button>
        </div>
      )}

      {/* Input */}
      <div className="p-4 bg-white border-t border-slate-100">
        <div className="flex gap-2 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Scrivi al coach..."
            className="flex-1 bg-slate-100 border-0 rounded-full px-5 py-3 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none placeholder-slate-400"
            disabled={isTyping}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="w-11 h-11 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-full flex items-center justify-center transition-colors shadow-md"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};