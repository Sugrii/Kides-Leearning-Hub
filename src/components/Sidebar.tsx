import React, { useRef } from 'react';
import { 
  X, 
  BookOpen, 
  Puzzle, 
  Award, 
  Users, 
  GraduationCap, 
  ShieldCheck, 
  Calculator, 
  Sparkles,
  ChevronRight,
  Flame,
  Star,
  Gamepad2,
  Volume2
} from 'lucide-react';
import { AppView, SubjectType, AgeGroup, StudentProgress } from '../types';
import { COMPANIONS } from '../data/rewardData';
import { LanguageCode, TRANSLATIONS } from '../i18n/translations';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: AppView;
  onSelectView: (view: AppView) => void;
  selectedSubject: SubjectType | 'all';
  onSelectSubject: (subj: SubjectType | 'all') => void;
  selectedAgeGroup: AgeGroup;
  onSelectAgeGroup: (age: AgeGroup) => void;
  progress: StudentProgress;
  currentLanguage: LanguageCode;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  currentView,
  onSelectView,
  selectedSubject,
  onSelectSubject,
  selectedAgeGroup,
  onSelectAgeGroup,
  progress,
  currentLanguage,
}) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;
  const companion = COMPANIONS.find(c => c.id === progress.equippedCompanionId) || COMPANIONS[0];

  // Touch gesture support: swipe left to close
  const touchStartX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current !== null) {
      const touchEndX = e.changedTouches[0].clientX;
      const diffX = touchEndX - touchStartX.current;
      if (diffX < -50) {
        // Swiped left by more than 50px
        onClose();
      }
      touchStartX.current = null;
    }
  };

  const navItems: Array<{ view: AppView; label: string; icon: React.ReactNode; badge?: string }> = [
    { 
      view: 'learn', 
      label: t.learn, 
      icon: <BookOpen className="w-5 h-5 text-indigo-500" /> 
    },
    {
      view: 'counting-alphabet',
      label: t.countingAlphabet || 'Counting & Alphabet',
      icon: <Volume2 className="w-5 h-5 text-teal-500" />,
      badge: '0-100 & A-Z'
    },
    {
      view: 'games',
      label: t.arcadeGames || 'Games Zone',
      icon: <Gamepad2 className="w-5 h-5 text-rose-500" />,
      badge: '6 Games'
    },
    { 
      view: 'puzzles', 
      label: t.puzzles, 
      icon: <Puzzle className="w-5 h-5 text-violet-500" />,
      badge: 'Interactive'
    },
    { 
      view: 'rewards', 
      label: t.rewards, 
      icon: <Award className="w-5 h-5 text-amber-500" />,
      badge: `${progress.coins} 🪙`
    },
    { 
      view: 'parent-dashboard', 
      label: t.parentDashboard, 
      icon: <Users className="w-5 h-5 text-emerald-500" />,
      badge: 'PIN'
    },
    { 
      view: 'classroom', 
      label: t.classroom, 
      icon: <GraduationCap className="w-5 h-5 text-blue-500" />,
      badge: 'Google Sync'
    },
    { 
      view: 'privacy', 
      label: t.privacy, 
      icon: <ShieldCheck className="w-5 h-5 text-teal-500" />,
      badge: 'COPPA'
    },
  ];

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in"
          aria-hidden="true"
        />
      )}

      {/* Slide-out Sidebar Drawer */}
      <aside
        id="app-navigation-sidebar"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 sm:w-80 bg-white dark:bg-slate-900 shadow-2xl border-r border-slate-200 dark:border-slate-800 flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-indigo-50/50 dark:bg-indigo-950/20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              ✨
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-sm font-display leading-tight">
                {t.appName}
              </h2>
              <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                Core Primary Curriculum
              </p>
            </div>
          </div>
          <button
            id="btn-close-sidebar"
            onClick={onClose}
            aria-label="Close sidebar"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Body */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {/* Active Companion Card */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 dark:from-indigo-950/40 dark:to-purple-950/40 border border-indigo-200/60 dark:border-indigo-800/40 flex items-center gap-3">
            <div className="text-3xl p-1 rounded-xl bg-white dark:bg-slate-800 shadow-xs">
              {companion.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {companion.name}
                </h4>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                  Lv. {Math.floor(progress.stars / 20) + 1}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {companion.perk}
              </p>
            </div>
          </div>

          {/* Quick Curriculum Age Filter */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
              {t.ageGroup}
            </label>
            <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800/70 p-1 rounded-xl">
              {(['5-6', '7-8', '9-11'] as AgeGroup[]).map((age) => (
                <button
                  key={age}
                  onClick={() => onSelectAgeGroup(age)}
                  className={`py-1.5 text-xs font-bold rounded-lg transition ${
                    selectedAgeGroup === age
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {age} yrs
                </button>
              ))}
            </div>
          </div>

          {/* Core Subject Filter */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
              {t.subjectFocus}
            </label>
            <div className="space-y-1">
              <button
                onClick={() => onSelectSubject('all')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                  selectedSubject === 'all'
                    ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>{t.allSubjects}</span>
                </div>
                {selectedSubject === 'all' && <ChevronRight className="w-4 h-4" />}
              </button>

              <button
                onClick={() => onSelectSubject('math')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                  selectedSubject === 'math'
                    ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-blue-400" />
                  <span>{t.mathSubject}</span>
                </div>
                {selectedSubject === 'math' && <ChevronRight className="w-4 h-4" />}
              </button>

              <button
                onClick={() => onSelectSubject('english')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                  selectedSubject === 'english'
                    ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  <span>{t.englishSubject}</span>
                </div>
                {selectedSubject === 'english' && <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Navigation Categories */}
          <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
              Categories
            </label>
            <div className="space-y-1">
              {navItems.map((item) => {
                const isActive = currentView === item.view;
                return (
                  <button
                    key={item.view}
                    id={`nav-item-${item.view}`}
                    onClick={() => {
                      onSelectView(item.view);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition touch-manipulation ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200/80 dark:border-indigo-800/60'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Stats summary & swipe hint */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center justify-around text-xs font-semibold text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
              <span>{progress.stars} Stars</span>
            </div>
            <div className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>{progress.streakDays}d Streak</span>
            </div>
          </div>
          <p className="text-[10px] text-center text-slate-400 mt-2">
            Swipe left ‹ or tap background to close
          </p>
        </div>
      </aside>
    </>
  );
};
