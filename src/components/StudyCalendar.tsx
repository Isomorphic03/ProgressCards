import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { StudyEntry } from '../types';
import { Calendar } from 'lucide-react';

interface Props {
  entries: StudyEntry[];
  onDateClick: (date: Date) => void;
  selectedDate: Date;
}

export function StudyCalendar({ entries, onDateClick, selectedDate }: Props) {
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-6 h-6 text-indigo-600" />
        <h2 className="text-xl font-bold text-gray-800">
          {format(selectedDate, 'MMMM yyyy')}
        </h2>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
        {days.map(day => {
          const dayEntry = entries.find(entry => 
            isSameDay(new Date(entry.date), day)
          );
          const isSelected = isSameDay(day, selectedDate);

          return (
            <button
              key={day.toISOString()}
              onClick={() => onDateClick(day)}
              className={`
                aspect-square p-2 rounded-lg transition-all
                ${isSelected ? 'bg-indigo-600 text-white' : 'hover:bg-indigo-50'}
                ${dayEntry ? 'font-bold' : ''}
              `}
            >
              <div className="text-sm">{format(day, 'd')}</div>
              {dayEntry && (
                <div className="text-xs mt-1">
                  {dayEntry.hours}h
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}