import React from 'react';
import { Trophy, Calendar, Clock } from 'lucide-react';
import { StudyCategory, CATEGORIES } from '../types';

interface Props {
  weeklyHours: Record<StudyCategory, number>;
  monthlyHours: Record<StudyCategory, number>;
  totalHours: Record<StudyCategory, number>;
}

function ProgressBar({ hours, color }: { hours: number; color: string }) {
  const level = Math.floor(hours / 10) + 1;
  const progress = (hours % 10) * 10;

  return (
    <div className="space-y-2">
      <p className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>{hours} hours</p>
      <p style={{ color: 'var(--foreground)' }}>Level {level}</p>
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
            <span style={{ color: 'var(--foreground)' }}>{label}</span>
          </div>
          <span className="font-semibold" style={{ color: 'var(--foreground)' }}>
            {hours[category as StudyCategory] || 0} hours
          </span>
        </div>
      ))}
    </div>
  );
}

export function Stats({ weeklyHours, monthlyHours, totalHours }: Props) {
  const sections = [
    {
      title: "This Week's Progress",
      icon: Trophy,
      hours: weeklyHours,
      description: "Your study progress for this week"
    },
    {
      title: "This Month's Progress",
      icon: Calendar,
      hours: monthlyHours,
      description: "Your study progress for this month"
    },
    {
      title: "Total Progress",
      icon: Clock,
      hours: totalHours,
      description: "Your all-time study progress"
    }
  ];

  return (
    <div className="grid gap-6">
      {sections.map((section, index) => (
        <div key={index} style={{ backgroundColor: 'var(--card)' }} className="rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <section.icon className="w-8 h-8" style={{ color: 'var(--primary)' }} />
            <div>
              <h2 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>{section.title}</h2>
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>{section.description}</p>
            </div>
          </div>
          <CategoryBreakdown hours={section.hours} />
        </div>
      ))}
    </div>
  );
}