/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
  safelist: [
    'bg-emerald-500',
    'bg-emerald-100',
    'bg-emerald-200',
    'bg-emerald-600',
    'text-emerald-700',
    'bg-blue-500',
    'bg-blue-100',
    'bg-blue-200',
    'bg-blue-600',
    'text-blue-700',
    'bg-rose-500',
    'bg-rose-100',
    'bg-rose-200',
    'bg-rose-600',
    'text-rose-700',
  ],
};