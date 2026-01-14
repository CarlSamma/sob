import { Addiction, Relapse, JournalEntry } from '../types';

const ADDICTIONS_KEY = 'so_addictions';
const RELAPSES_KEY = 'so_relapses';
const JOURNAL_KEY = 'so_journal';

const DEFAULT_ADDICTIONS: Addiction[] = [
  {
    id: 1,
    name: 'Sigarette',
    startDate: new Date().toISOString(),
    weeklyCost: 35,
    active: true,
    color: 'bg-orange-500'
  },
  {
    id: 2,
    name: 'Alcol',
    startDate: new Date().toISOString(),
    weeklyCost: 50,
    active: false,
    color: 'bg-blue-500'
  },
  {
    id: 3,
    name: 'Weed',
    startDate: new Date().toISOString(),
    weeklyCost: 40,
    active: false,
    color: 'bg-green-500'
  }
];

export const getAddictions = (): Addiction[] => {
  const data = localStorage.getItem(ADDICTIONS_KEY);
  if (!data) {
    localStorage.setItem(ADDICTIONS_KEY, JSON.stringify(DEFAULT_ADDICTIONS));
    return DEFAULT_ADDICTIONS;
  }
  return JSON.parse(data);
};

export const saveAddictions = (addictions: Addiction[]) => {
  localStorage.setItem(ADDICTIONS_KEY, JSON.stringify(addictions));
};

export const getRelapses = (): Relapse[] => {
  const data = localStorage.getItem(RELAPSES_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveRelapse = (relapse: Relapse) => {
  const current = getRelapses();
  const updated = [relapse, ...current];
  localStorage.setItem(RELAPSES_KEY, JSON.stringify(updated));
  return updated;
};

export const getJournalEntries = (): JournalEntry[] => {
  const data = localStorage.getItem(JOURNAL_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveJournalEntry = (entry: JournalEntry) => {
  const current = getJournalEntries();
  const updated = [entry, ...current];
  localStorage.setItem(JOURNAL_KEY, JSON.stringify(updated));
  return updated;
};

export const updateAddictionStartDate = (id: number, newDate: string) => {
  const addictions = getAddictions();
  const updated = addictions.map(a => a.id === id ? { ...a, startDate: newDate } : a);
  saveAddictions(updated);
  return updated;
};