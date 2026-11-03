'use client';

import React from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { useTheme, Theme } from '@/context/ThemeContext';

export const ThemeSwitcher: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, setTheme } = useTheme();

  const options: { value: Theme; label: string; icon: React.ElementType }[] = [
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'system', label: 'System', icon: Laptop },
  ];

  return (
    <div 
      role="radiogroup" 
      aria-label="Color Theme Selection"
      className={`inline-flex items-center p-0.5 rounded-lg border border-[#cbd5e1] dark:border-[#1e2533] bg-[#f1f5f9] dark:bg-[#0d1017] transition-colors ${className}`}
    >
      {options.map(({ value, label, icon: Icon }) => {
        const isActive = theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => setTheme(value)}
            title={`Set theme to ${label}`}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
              isActive
                ? 'bg-white dark:bg-[#1e2533] text-[#4d7c0f] dark:text-lime-400 shadow-xs border border-[#cbd5e1] dark:border-lime-500/30 font-semibold'
                : 'text-[#64748b] dark:text-slate-400 hover:text-[#111827] dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-[#141824]'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline-block text-[11px]">{label}</span>
          </button>
        );
      })}
    </div>
  );
};
