import React from 'react';
import { format, subDays, isSameDay } from 'date-fns';
import { StudyEntry, StudyCategory, CATEGORIES } from '../types';
import { Calendar } from 'lucide-react';

interface Props {
  entries: StudyEntry[];
  onDateClick: (date: Date) => void;
  selectedDate: Date;
}

function aggregateHoursByCategory(hours: { category: StudyCategory; hours: number }[]) {
  return Object.entries(CATEGORIES).reduce((acc, [category]) => {
    const totalHours = hours
      .filter(h => h.category === category)
      .reduce((sum, h) => sum + h.hours, 0);
    if (totalHours > 0) {
      acc[category as StudyCategory] = totalHours;
    }
    return acc;
  }, {} as Record<StudyCategory, number>);
}

export function WeekView({ entries, onDateClick, selectedDate }: Props) {
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => subDays(today, 6 - i));

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="w-6 h-6 text-indigo-600" />
        <h2 className="text-xl font-bold text-gray-800">Last 7 Days</h2>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map(day => {
          const dayEntry = entries.find(entry => 
            isSameDay(new Date(entry.date), day)
          );
          const isSelected = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, today);
          const aggregatedHours = dayEntry ? aggregateHoursByCategory(dayEntry.hours) : {};

          return (
            <button
              key={day.toISOString()}
              onClick={() => onDateClick(day)}
              className={`
                flex flex-col items-center p-3 rounded-lg transition-all
                ${isSelected ? 'ring-2 ring-indigo-600' : ''}
                ${isToday ? 'bg-indigo-50' : 'hover:bg-gray-50'}
              `}
            >
              <div className="text-sm font-medium mb-1">
                {format(day, 'EEE')}
              </div>
              <div className={`
                text-2xl font-bold mb-2
                ${isToday ? 'text-indigo-600' : 'text-gray-900'}
              `}>
                {format(day, 'd')}
              </div>
              {Object.entries(CATEGORIES).map(([category, { color, label }]) => {
                const hours = aggregatedHours[category as StudyCategory];
                if (!hours) return null;
                
                return (
                  <div
                    key={`${category}`}
                    className={`
                      w-full text-sm py-1 px-2 rounded mb-1 text-white text-center font-semibold
                      bg-${color}-500
                    `}
                  >
                    {hours}
                  </div>
                );
              })}
            </button>
          );
        })}
      </div>
    </div>
  );
}