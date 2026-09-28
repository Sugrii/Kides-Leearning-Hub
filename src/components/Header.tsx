import React from 'react';
import { 
  Menu, 
  Flame, 
  Sparkles, 
  Star, 
  Wifi, 
  WifiOff, 
  Bell, 
  Sun, 
  Moon, 
  ShieldCheck, 
  Globe
} from 'lucide-react';
import { StudentProgress } from '../types';
import { COMPANIONS } from '../data/rewardData';
import { LanguageCode, SUPPORTED_LANGUAGES, TRANSLATIONS } from '../i18n/translations';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  onToggleSidebar: () => void;
  progress: StudentProgress;
  isOnline: boolean;
  onToggleSimulatedNetwork: () => void;
  onOpenOfflineCenter: () => void;
  unreadCount: number;
  onOpenNotifications: () => void;
  onOpenPrivacy: () => void;
  currentLanguage: LanguageCode;
  onChangeLanguage: (code: LanguageCode) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  pendingOfflineCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  progress,
  isOnline,
  onToggleSimulatedNetwork,
  onOpenOfflineCenter,
  unreadCount,
  onOpenNotifications,
  onOpenPrivacy,
  currentLanguage,
  onChangeLanguage,
  darkMode,
  onToggleDarkMode,
  pendingOfflineCount,
}) => {
  const currentCompanion = COMPANIONS.find(c => c.id === progress.equippedCompanionId) || COMPANIONS[0];
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-3 sm:px-5 py-2.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Left: Hamburger & Brand */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            id="btn-sidebar-toggle"
            onClick={onToggleSidebar}
            aria-label="Toggle navigation menu"
            className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition touch-manipulation"
          >
            <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <div className="flex items-center gap-2 cursor-pointer" onClick={onToggleSidebar}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              ✨
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold text-slate-900 dark:text-white font-display tracking-tight leading-none">
                {t.appName}
              </h1>
              <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium leading-tight">
                Math & English Puzzles
              </p>
            </div>
          </div>
        </div>

        {/* Center: Gamified Stats (Stars, Coins, Streak) */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Streak */}
          <div 
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-900/50 text-amber-700 dark:text-amber-400 text-xs font-bold"
            title={`${progress.streakDays} Day Streak!`}
          >
            <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 animate-pulse" />
            <span>{progress.streakDays}</span>
          </div>

          {/* Stars */}
          <div 
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-50 dark:bg-yellow-950/40 border border-yellow-200/70 dark:border-yellow-900/50 text-yellow-700 dark:text-yellow-400 text-xs font-bold"
            title={`${progress.stars} Stars Earned`}
          >
            <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-500 fill-yellow-400" />
            <span>{progress.stars}</span>
          </div>

          {/* Coins */}
          <div 
            className="hidden xs:flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-xs font-bold"
            title={`${progress.coins} Coins in Sparkle Bank`}
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
            <span>{progress.coins}</span>
          </div>

          {/* Active Companion Avatar */}
          <div 
            className="flex items-center gap-1 pl-1 pr-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
            title={`Equipped Companion: ${currentCompanion.name}`}
          >
            <span className="text-base">{currentCompanion.emoji}</span>
            <span className="hidden md:inline text-[11px] font-semibold">{currentCompanion.name.split(' ')[0]}</span>
          </div>
        </div>

        {/* Right: Quick Utility Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Offline/Online status badge & Offline Center Hub */}
          <button
            id="btn-network-status-toggle"
            onClick={onOpenOfflineCenter}
            title={isOnline ? "Online: All activities cached locally (Click for Offline Hub)" : `Offline Mode (${pendingOfflineCount} queued - Click for details)`}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition shadow-2xs ${
              isOnline 
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100' 
                : 'bg-amber-100 dark:bg-amber-950 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 hover:bg-amber-200'
            }`}
          >
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">Offline Ready</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden sm:inline">Offline Mode</span>
                {pendingOfflineCount > 0 && (
                  <span className="px-1.5 rounded-full bg-amber-500 text-white text-[9px] font-bold">
                    {pendingOfflineCount}
                  </span>
                )}
              </>
            )}
          </button>

          {/* PWA Install Button */}
          <div className="hidden sm:block">
            <PWAInstallButton />
          </div>

          {/* Language Selector */}
          <div className="relative group">
            <button
              id="btn-language-selector"
              aria-label="Change language"
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1 text-xs"
            >
              <Globe className="w-4 h-4" />
              <span className="text-[11px] font-bold uppercase">{currentLanguage}</span>
            </button>
            <div className="absolute right-0 mt-1 w-44 rounded-xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 hidden group-hover:block z-50 animate-in fade-in">
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Language / Idioma
              </div>
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => onChangeLanguage(lang.code)}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/60 transition ${
                    currentLanguage === lang.code ? 'font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/40' : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{lang.flag}</span>
                    <span>{lang.nativeLabel}</span>
                  </span>
                  {currentLanguage === lang.code && <span className="text-xs">✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Real-time Notifications Bell */}
          <button
            id="btn-notifications-open"
            onClick={onOpenNotifications}
            aria-label="View notifications"
            className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            )}
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
            )}
          </button>

          {/* Dark Mode Toggle */}
          <button
            id="btn-darkmode-toggle"
            onClick={onToggleDarkMode}
            aria-label="Toggle dark theme"
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            {darkMode ? <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />}
          </button>

          {/* Privacy & Trust Center */}
          <button
            id="btn-privacy-open"
            onClick={onOpenPrivacy}
            title="COPPA & GDPR Privacy Center"
            className="p-2 rounded-xl text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800 transition"
          >
            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
