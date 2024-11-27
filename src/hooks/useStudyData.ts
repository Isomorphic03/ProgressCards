import { useState, useEffect } from 'react';
import { StudyEntry, StudyCategory } from '../types';
import { startOfDay, isWithinInterval, startOfWeek, startOfMonth, format } from 'date-fns';
import { 
  addStudyEntry, 
  deleteStudyHour, 
  subscribeToStudyEntries,
  subscribeToProgressTotals,
  updateProgressTotals,
  ProgressTotals
} from '../firebase';
import { Timestamp } from 'firebase/firestore';

export function useStudyData() {
  const [entries, setEntries] = useState<StudyEntry[]>([]);
  const [progressTotals, setProgressTotals] = useState<ProgressTotals | null>(null);

  useEffect(() => {
    // Subscribe to all entries
    const unsubscribeEntries = subscribeToStudyEntries('', (newEntries) => {
      setEntries(newEntries);
    });

    // Subscribe to progress totals
    const unsubscribeProgressTotals = subscribeToProgressTotals((totals) => {
      setProgressTotals(totals);
    });

    return () => {
      unsubscribeEntries();
      unsubscribeProgressTotals();
    };
  }, []);

  // Update progress totals whenever entries change
  useEffect(() => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const monthStart = startOfMonth(today);

    const weeklyHours = entries
      .filter(entry => 
        isWithinInterval(new Date(entry.date), { start: weekStart, end: today })
      )
      .reduce((acc, entry) => {
        entry.hours.forEach(({ category, hours }) => {
          acc[category] = (acc[category] || 0) + hours;
        });
        return acc;
      }, {} as Record<StudyCategory, number>);

    const monthlyHours = entries
      .filter(entry => 
        isWithinInterval(new Date(entry.date), { start: monthStart, end: today })
      )
      .reduce((acc, entry) => {
        entry.hours.forEach(({ category, hours }) => {
          acc[category] = (acc[category] || 0) + hours;
        });
        return acc;
      }, {} as Record<StudyCategory, number>);

    // Update Firebase with new totals
    updateProgressTotals({
      weeklyTotals: weeklyHours,
      monthlyTotals: monthlyHours,
      lastUpdated: Timestamp.now()
    }).catch(error => {
      console.error('Error updating progress totals:', error);
    });
  }, [entries]);

  const addEntry = async (date: Date, category: StudyCategory, hours: number) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    
    try {
      await addStudyEntry({
        date: dateStr,
        hours: [{ category, hours }]
      });
    } catch (error) {
      console.error('Error adding entry:', error);
    }
  };

  const deleteEntry = async (entryId: string, hourIndex: number) => {
    try {
      await deleteStudyHour(entryId, hourIndex);
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  const getStats = () => {
    // Return the stored totals from Firebase if available, otherwise calculate from entries
    if (progressTotals) {
      return {
        weeklyHours: progressTotals.weeklyTotals,
        monthlyHours: progressTotals.monthlyTotals
      };
    }

    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const monthStart = startOfMonth(today);

    const weeklyHours = entries
      .filter(entry => 
        isWithinInterval(new Date(entry.date), { start: weekStart, end: today })
      )
      .reduce((acc, entry) => {
        entry.hours.forEach(({ category, hours }) => {
          acc[category] = (acc[category] || 0) + hours;
        });
        return acc;
      }, {} as Record<StudyCategory, number>);

    const monthlyHours = entries
      .filter(entry => 
        isWithinInterval(new Date(entry.date), { start: monthStart, end: today })
      )
      .reduce((acc, entry) => {
        entry.hours.forEach(({ category, hours }) => {
          acc[category] = (acc[category] || 0) + hours;
        });
        return acc;
      }, {} as Record<StudyCategory, number>);

    return { weeklyHours, monthlyHours };
  };

  return { entries, addEntry, deleteEntry, getStats, progressTotals };
}