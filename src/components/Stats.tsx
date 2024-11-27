import React from 'react';
import { Trophy, Calendar } from 'lucide-react';
import { StudyCategory, CATEGORIES } from '../types';

interface Props {
  weeklyHours: Record<StudyCategory, number>;
  monthlyHours: Record<StudyCategory, number>;
}

function ProgressBar({ hours, color }: { hours: number; color: string }) {
  const level = Math.floor(hours / 10) + 1;
  const progress = (hours % 10) * 10;

  return (
    <div className="space-y-2">
      <p className="text-3xl font-bold text-gray-900">{hours} hours</p>
      <p className="text-gray-600">Level {level}</p>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`bg-${color}-500 rounded-full h-2.5 transition-all duration-500`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function CategoryBreakdown({ hours }: { hours: Record<StudyCategory, number> }) {
  return (
    <div className="space-y-3">
      {Object.entries(CATEGORIES).map(([category, { color, label }]) => (
        <div key={category} className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full bg-${color}-500`} />
            <span className="text-gray-700">{label}</span>
          </div>
          <span className="font-semibold">
            {hours[category as StudyCategory] || 0} hours
          </span>
        </div>
      ))}
    </div>
  );
}

export function Stats({ weeklyHours, monthlyHours }: Props) {
  return (
    <div className="grid gap-6">
      {Object.entries(CATEGORIES).map(([category, { color, label }]) => (
        <div key={category} className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-4 h-4 rounded-full bg-${color}-500`} />
            <h3 className="text-xl font-bold text-gray-800">{label} Progress</h3>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <Trophy className="w-6 h-6 text-gray-600" />
                <h4 className="text-lg font-semibold text-gray-800">Weekly Progress</h4>
              </div>
              <ProgressBar 
                hours={weeklyHours[category as StudyCategory] || 0} 
                color={color}
              />
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-6 h-6 text-gray-600" />
                <h4 className="text-lg font-semibold text-gray-800">Monthly Progress</h4>
              </div>
              <ProgressBar 
                hours={monthlyHours[category as StudyCategory] || 0}
                color={color}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}