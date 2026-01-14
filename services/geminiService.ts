import { GoogleGenAI } from "@google/genai";
import { Addiction, Relapse, JournalEntry } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to format context for the AI
const buildContext = (addictions: Addiction[], relapses: Relapse[], journalEntries: JournalEntry[] = []) => {
  const activeAddictions = addictions.filter(a => a.active);
  
  let contextStr = `Profilo Utente:\n`;
  
  activeAddictions.forEach(addiction => {
    const start = new Date(addiction.startDate).getTime();
    const now = new Date().getTime();
    const days = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    const savings = ((days / 7) * addiction.weeklyCost).toFixed(2);
    
    contextStr += `- Dipendenza: ${addiction.name}. Sobrio da: ${days} giorni. Risparmi stimati: €${savings}.\n`;
  });

  const recentRelapses = relapses.slice(0, 5);
  if (recentRelapses.length > 0) {
    contextStr += `\nUltimi eventi negativi (Sgarri):\n`;
    recentRelapses.forEach(r => {
        const addName = addictions.find(a => a.id === r.addictionId)?.name || 'Sconosciuto';
        contextStr += `- ${new Date(r.timestamp).toLocaleDateString()}: ${addName}. Trigger: "${r.trigger}". Gravità: ${r.severity}/5.\n`;
    });
  }

  const recentJournal = journalEntries.slice(0, 3);
  if (recentJournal.length > 0) {
    contextStr += `\nUltime note del diario (Stati d'animo recenti):\n`;
    recentJournal.forEach(j => {
      contextStr += `- ${new Date(j.timestamp).toLocaleDateString()}: Umore: ${j.mood}. Nota: "${j.text}"\n`;
    });
  }

  return contextStr;
};

export const getCoachResponse = async (
  message: string, 
  addictions: Addiction[], 
  relapses: Relapse[],
  journalEntries: JournalEntry[] = []
): Promise<string> => {
  if (!apiKey) return "API Key non configurata.";

  const context = buildContext(addictions, relapses, journalEntries);
  
  const systemInstruction = `
    Sei "S&O Coach", un assistente per la sobrietà empatico, calmo e non giudicante. 
    Il tuo obiettivo è motivare l'utente, analizzare i trigger e suggerire alternative sane.
    Parla sempre in italiano. Sii conciso ma caloroso.
    
    Utilizza i dati forniti nel contesto per personalizzare la risposta. 
    
    Linee guida specifiche:
    1. Se l'utente ha scritto nel diario che è stressato, chiedigli come va oggi.
    2. Se l'utente ha appena avuto una ricaduta, sii gentile e analizza cosa è successo.
    3. Se l'utente sta festeggiando un traguardo, congratulati enfatizzando i risparmi e la salute.
    
    CONTESTO ATTUALE UTENTE:
    ${context}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: message,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    return response.text || "Mi dispiace, non riesco a formulare una risposta al momento.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Si è verificato un errore di connessione con il coach virtuale.";
  }
};

export const analyzePatterns = async (relapses: Relapse[], addictions: Addiction[]): Promise<string> => {
    if (!apiKey) return "API Key mancante.";
    if (relapses.length < 3) return "Non ci sono abbastanza dati per analizzare i pattern. Registra più eventi se necessario.";

    const context = buildContext(addictions, relapses);
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: "Analizza i dati delle ricadute forniti nel contesto. Identifica pattern ricorrenti (giorni, orari, trigger emotivi) e dai un suggerimento breve e tattico.",
            config: {
                systemInstruction: `Agisci come un analista comportamentale. Il tuo input sono i log delle ricadute. Il tuo output è una breve analisi (max 3 frasi) in Italiano. ${context}`
            }
        });
        return response.text || "Analisi non disponibile.";
    } catch (e) {
        return "Errore durante l'analisi.";
    }
};