import React from 'react';
import { BookOpen, Puzzle, Award, Users, Volume2, Gamepad2 } from 'lucide-react';
import { AppView } from '../types';
import { LanguageCode, TRANSLATIONS } from '../i18n/translations';

interface BottomNavProps {
  currentView: AppView;
  onSelectView: (view: AppView) => void;
  currentLanguage: LanguageCode;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentView,
  onSelectView,
  currentLanguage,
}) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  const items: Array<{ view: AppView; label: string; icon: React.ReactNode }> = [
    { view: 'learn', label: 'Learn', icon: <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { view: 'counting-alphabet', label: '123 & ABC', icon: <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { view: 'games', label: 'Games', icon: <Gamepad2 className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { view: 'puzzles', label: 'Puzzles', icon: <Puzzle className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { view: 'rewards', label: 'Rewards', icon: <Award className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { view: 'parent-dashboard', label: 'Parents', icon: <Users className="w-4 h-4 sm:w-5 sm:h-5" /> },
  ];

  return (
    <nav 
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 pb-safe shadow-lg"
    >
      <div className="grid grid-cols-6 h-14">
        {items.map((item) => {
          const isActive = currentView === item.view;
          return (
            <button
              key={item.view}
              id={`bottom-nav-${item.view}`}
              onClick={() => onSelectView(item.view)}
              className={`flex flex-col items-center justify-center gap-0.5 transition-colors touch-manipulation ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <div className={`p-1 rounded-xl transition ${isActive ? 'bg-indigo-50 dark:bg-indigo-950/60' : ''}`}>
                {item.icon}
              </div>
              <span className="text-[9px] leading-none tracking-tight truncate max-w-full px-0.5">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
