export type StudyCategory = 'productive' | 'creative' | 'learning';

export interface StudyHours {
  category: StudyCategory;
  hours: number;
}

export interface StudyEntry {
  date: string;
  id: string;
  hours: StudyHours[];
}

export const CATEGORIES: Record<StudyCategory, { color: string; label: string }> = {
  productive: { color: 'emerald', label: 'Maths' },
  creative: { color: 'blue', label: 'Productive' },
  learning: { color: 'rose', label: 'CP' }
};