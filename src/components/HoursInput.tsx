import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Clock, Zap, X, Trash2 } from 'lucide-react';
import { StudyCategory, CATEGORIES } from '../types';
import { subscribeToStudyEntries, StudyEntry, factoryReset } from '../firebase';

interface Props {
  selectedDate: Date;
  onSubmit: (category: StudyCategory, hours: number) => void;
  onDelete: (entryId: string, hourIndex: number) => void;
}

function TodayProgress({ onDelete }: { onDelete: (entryId: string, hourIndex: number) => void }) {
  const [todayEntries, setTodayEntries] = useState<StudyEntry[]>([]);

  useEffect(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const unsubscribe = subscribeToStudyEntries(today, (entries) => {
      setTodayEntries(entries);
    });

    return () => unsubscribe();
  }, []);

  if (!todayEntries.length) return null;

  return (
    <div className="mt-8 space-y-4">
      <div className="flex items-center gap-2">
        <Zap className="w-5 h-5 text-yellow-500" />
        <h3 className="text-lg font-semibold text-gray-800">Today's Progress</h3>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {todayEntries.map((entry) => 
          entry.hours.map((hour, index) => (
            <div
              key={`${entry.id}-${index}`}
              className={`
                p-4 rounded-lg relative
                bg-${CATEGORIES[hour.category].color}-100
                border-2 border-${CATEGORIES[hour.category].color}-200
                group
              `}
            >
              <button
                onClick={() => entry.id && onDelete(entry.id, index)}
                className={`
                  absolute top-1 right-1 p-1 rounded-full
                  bg-${CATEGORIES[hour.category].color}-200
                  text-${CATEGORIES[hour.category].color}-700
                  opacity-0 group-hover:opacity-100
                  transition-opacity duration-200
                  hover:bg-${CATEGORIES[hour.category].color}-300
                `}
              >
                <X className="w-4 h-4" />
              </button>
              <div className={`
                text-3xl font-bold text-${CATEGORIES[hour.category].color}-700
                flex items-center justify-center
              `}>
                {hour.hours}
              </div>
              <div className={`
                text-sm text-${CATEGORIES[hour.category].color}-600
                text-center mt-1
              `}>
                {CATEGORIES[hour.category].label}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function HoursInput({ selectedDate, onSubmit, onDelete }: Props) {
  const [category, setCategory] = useState<StudyCategory>('productive');
  const [hours, setHours] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numHours = parseFloat(hours);
    if (numHours > 0) {
      onSubmit(category, numHours);
      setHours('');
    }
  };

  const handleReset = async () => {
    if (window.confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
      setIsResetting(true);
      try {
        await factoryReset();
      } catch (error) {
        console.error('Error resetting data:', error);
      } finally {
        setIsResetting(false);
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-6 h-6 text-indigo-600" />
          <h2 className="text-xl font-bold text-gray-800">
            Add Study Hours
          </h2>
        </div>
        <button
          onClick={handleReset}
          disabled={isResetting}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
          title="Factory Reset"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
      <p className="text-gray-600 mb-4">
        Selected date: {format(selectedDate, 'MMMM d, yyyy')}
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(CATEGORIES).map(([key, { color, label }]) => (
              <button
                key={key}
                type="button"
                onClick={() => setCategory(key as StudyCategory)}
                className={`
                  py-2 px-3 rounded-md text-sm font-medium
                  ${category === key
                    ? `bg-${color}-500 text-white`
                    : `bg-${color}-100 text-${color}-700 hover:bg-${color}-200`
                  }
                `}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="hours" className="block text-sm font-medium text-gray-700">
            Hours studied
          </label>
          <input
            type="number"
            id="hours"
            min="0.5"
            step="0.5"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 text-center"
            placeholder="Enter hours"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white rounded-md py-2 px-4 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Add Hours
        </button>
      </form>
      <TodayProgress onDelete={onDelete} />
    </div>
  );
}