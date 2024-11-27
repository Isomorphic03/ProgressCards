import React, { useState } from 'react';
import { WeekView } from './components/WeekView';
import { Stats } from './components/Stats';
import { HoursInput } from './components/HoursInput';
import { ThemeToggle } from './components/ThemeToggle';
import { useStudyData } from './hooks/useStudyData';
import { GraduationCap } from 'lucide-react';
import { StudyCategory } from './types';

export default function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { entries, addEntry, deleteEntry, getStats } = useStudyData();
  const { weeklyHours, monthlyHours } = getStats();

  const handleAddHours = (category: StudyCategory, hours: number) => {
    addEntry(selectedDate, category, hours);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <GraduationCap className="w-12 h-12" style={{ color: 'var(--primary)' }} />
            <h1 className="text-4xl font-bold" style={{ color: 'var(--foreground)' }}>Study Tracker</h1>
          </div>
          <div className="flex items-center justify-center gap-4">
            <p className="text-lg" style={{ color: 'var(--foreground)' }}>Track your study progress and level up your knowledge!</p>
            <ThemeToggle />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: '0.5rem' }}>
              <WeekView
                entries={entries}
                selectedDate={selectedDate}
                onDateClick={setSelectedDate}
              />
            </div>
            <div style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: '0.5rem' }}>
              <Stats weeklyHours={weeklyHours} monthlyHours={monthlyHours} />
            </div>
          </div>
          <div style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: '0.5rem' }}>
            <HoursInput
              selectedDate={selectedDate}
              onSubmit={handleAddHours}
              onDelete={deleteEntry}
            />
          </div>
        </div>
      </div>
    </div>
  );
}