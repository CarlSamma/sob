export interface Addiction {
  id: number;
  name: string; // "Sigarette", "Alcol", "Weed"
  startDate: string; // ISO String
  weeklyCost: number;
  active: boolean;
  color: string;
}

export interface Relapse {
  id: number;
  addictionId: number;
  timestamp: string; // ISO String
  trigger: string;
  severity: number; // 1-5
}

export interface JournalEntry {
  id: number;
  timestamp: string;
  mood: 'happy' | 'neutral' | 'sad' | 'stressed';
  text: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export enum Tab {
  DASHBOARD = 'DASHBOARD',
  JOURNAL = 'JOURNAL',
  COACH = 'COACH',
  SETTINGS = 'SETTINGS',
}

export const MILESTONES = [
  { days: 1, label: '24 Ore', description: 'Il primo passo è il più difficile.' },
  { days: 3, label: '3 Giorni', description: 'La chimica inizia a cambiare.' },
  { days: 7, label: '1 Settimana', description: 'Una settimana di libertà.' },
  { days: 30, label: '1 Mese', description: 'Nuove abitudini si stanno formando.' },
  { days: 90, label: '3 Mesi', description: 'Stile di vita consolidato.' },
  { days: 180, label: '6 Mesi', description: 'Metà anno di successo.' },
  { days: 365, label: '1 Anno', description: 'Un giro completo intorno al sole.' },
];