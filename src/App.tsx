/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  AppView, 
  SubjectType, 
  AgeGroup, 
  StudentProgress, 
  ParentSettings, 
  ClassroomAssignment, 
  AppNotification 
} from './types';
import { 
  loadStudentProgress, 
  saveStudentProgress, 
  loadParentSettings, 
  saveParentSettings, 
  loadAssignments, 
  saveAssignments, 
  loadNotifications, 
  saveNotifications,
  getOfflineQueue,
  clearOfflineQueue,
  wipeAllUserData
} from './services/storage';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { StudentLearnView } from './components/StudentLearnView';
import { CountingAndAlphabetView } from './components/CountingAndAlphabetView';
import { ArcadeGamesView } from './components/ArcadeGamesView';
import { BrainPuzzlesView } from './components/BrainPuzzlesView';
import { RewardsShopView } from './components/RewardsShopView';
import { ParentDashboardView } from './components/ParentDashboardView';
import { ClassroomView } from './components/ClassroomView';
import { NotificationsModal } from './components/NotificationsModal';
import { PrivacyComplianceModal } from './components/PrivacyComplianceModal';
import { OfflineCenterModal } from './components/OfflineCenterModal';
import { LanguageCode } from './i18n/translations';
import { Clock, ShieldAlert, WifiOff } from 'lucide-react';

export default function App() {
  // App state
  const [currentView, setCurrentView] = useState<AppView>('learn');
  const [selectedSubject, setSelectedSubject] = useState<SubjectType | 'all'>('all');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<AgeGroup>('7-8');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>('en');
  
  // Modals
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showOfflineModal, setShowOfflineModal] = useState(false);

  // Dark mode
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('kids_hub_dark_mode') === 'true';
  });

  // Network & Offline support
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isSimulatedOffline, setIsSimulatedOffline] = useState(false);
  const [pendingOfflineCount, setPendingOfflineCount] = useState(0);

  // Persistent user state
  const [progress, setProgress] = useState<StudentProgress>(loadStudentProgress);
  const [parentSettings, setParentSettings] = useState<ParentSettings>(loadParentSettings);
  const [assignments, setAssignments] = useState<ClassroomAssignment[]>(loadAssignments);
  const [notifications, setNotifications] = useState<AppNotification[]>(loadNotifications);

  // Dark mode class sync
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('kids_hub_dark_mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('kids_hub_dark_mode', 'false');
    }
  }, [darkMode]);

  // Online / Offline listener
  useEffect(() => {
    const handleOnline = () => {
      if (!isSimulatedOffline) {
        setIsOnline(true);
        // Process offline queue
        const queue = getOfflineQueue();
        if (queue.length > 0) {
          clearOfflineQueue();
          setPendingOfflineCount(0);
        }
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check of queue
    setPendingOfflineCount(getOfflineQueue().length);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isSimulatedOffline]);

  // Daily screen time ticker (increments spent minutes every 60 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const updated = {
          ...prev,
          dailyMinutesSpent: prev.dailyMinutesSpent + 1,
        };
        saveStudentProgress(updated, isOnline && !isSimulatedOffline);
        return updated;
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [isOnline, isSimulatedOffline]);

  // Save changes to encrypted storage
  const handleUpdateProgress = (updated: StudentProgress) => {
    setProgress(updated);
    saveStudentProgress(updated, isOnline && !isSimulatedOffline);
    if (!isOnline || isSimulatedOffline) {
      setPendingOfflineCount((prev) => prev + 1);
    }
  };

  const handleUpdateSettings = (updated: ParentSettings) => {
    setParentSettings(updated);
    saveParentSettings(updated);
  };

  const handleUpdateAssignments = (updated: ClassroomAssignment[]) => {
    setAssignments(updated);
    saveAssignments(updated);
  };

  const handleToggleSimulatedNetwork = () => {
    const nextOffline = !isSimulatedOffline;
    setIsSimulatedOffline(nextOffline);
    setIsOnline(!nextOffline);
  };

  const handleMarkAllNotificationsRead = () => {
    const updated = notifications.map(n => ({ ...n, isRead: true }));
    setNotifications(updated);
    saveNotifications(updated);
  };

  const handleAddNotification = (notif: AppNotification) => {
    const updated = [notif, ...notifications];
    setNotifications(updated);
    saveNotifications(updated);
  };

  const handleDataWiped = () => {
    setProgress(loadStudentProgress());
    setParentSettings(loadParentSettings());
    setAssignments(loadAssignments);
    setNotifications(loadNotifications);
    setPendingOfflineCount(0);
  };

  // Touch gesture: swipe from left screen edge to open sidebar
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleGlobalTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleGlobalTouchEnd = (e: React.TouchEvent) => {
    if (touchStartRef.current) {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const diffX = touchEndX - touchStartRef.current.x;
      const diffY = Math.abs(touchEndY - touchStartRef.current.y);

      // If user swiped right starting near left edge (< 40px)
      if (touchStartRef.current.x < 40 && diffX > 60 && diffY < 50) {
        setIsSidebarOpen(true);
      }
      touchStartRef.current = null;
    }
  };

  const unreadNotifCount = notifications.filter(n => !n.isRead).length;
  const isScreenLimitReached = progress.dailyMinutesSpent >= parentSettings.dailyScreenLimitMinutes;

  return (
    <div 
      onTouchStart={handleGlobalTouchStart}
      onTouchEnd={handleGlobalTouchEnd}
      className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200 flex flex-col font-sans selection:bg-indigo-500 selection:text-white pb-16 md:pb-6"
    >
      {/* Top Header */}
      <Header
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        progress={progress}
        isOnline={isOnline && !isSimulatedOffline}
        onToggleSimulatedNetwork={handleToggleSimulatedNetwork}
        onOpenOfflineCenter={() => setShowOfflineModal(true)}
        unreadCount={unreadNotifCount}
        onOpenNotifications={() => setShowNotificationsModal(true)}
        onOpenPrivacy={() => setShowPrivacyModal(true)}
        currentLanguage={currentLanguage}
        onChangeLanguage={(lang) => setCurrentLanguage(lang)}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        pendingOfflineCount={pendingOfflineCount}
      />

      {/* Slide-out / Slide-in Navigation Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentView={currentView}
        onSelectView={(view) => setCurrentView(view)}
        selectedSubject={selectedSubject}
        onSelectSubject={(subj) => setSelectedSubject(subj)}
        selectedAgeGroup={selectedAgeGroup}
        onSelectAgeGroup={(age) => setSelectedAgeGroup(age)}
        progress={progress}
        currentLanguage={currentLanguage}
        onOpenOfflineCenter={() => setShowOfflineModal(true)}
      />

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
        {/* Offline Status Alert Banner if disconnected */}
        {(!isOnline || isSimulatedOffline) && (
          <div className="rounded-2xl p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex flex-wrap items-center justify-between gap-2 shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <WifiOff className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>
                <strong>Offline Mode Active:</strong> All 210 questions, audio phonics, 6 games & stars work 100% offline. Progress is securely encrypted locally.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowOfflineModal(true)}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 font-bold text-[11px] whitespace-nowrap shadow-2xs hover:bg-amber-100 dark:hover:bg-slate-700 transition"
              >
                Offline Hub
              </button>
              <button
                onClick={handleToggleSimulatedNetwork}
                className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] whitespace-nowrap transition"
              >
                Go Online
              </button>
            </div>
          </div>
        )}

        {/* Screen Time Limit Alert if limit exceeded */}
        {isScreenLimitReached && (
          <div className="rounded-2xl p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 text-xs flex items-center justify-between gap-3 shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-rose-600 flex-shrink-0" />
              <div>
                <span className="font-bold">Daily Screen Limit Reached ({parentSettings.dailyScreenLimitMinutes} mins):</span>
                <p className="text-[11px] text-rose-800 dark:text-rose-300 mt-0.5">
                  Great learning today! It's time for some outdoor play or resting your eyes.
                </p>
              </div>
            </div>
            <button
              onClick={() => setCurrentView('parent-dashboard')}
              className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-xs whitespace-nowrap hover:bg-rose-700 transition"
            >
              Parent Settings
            </button>
          </div>
        )}

        {/* Dynamic View Rendering */}
        {currentView === 'learn' && (
          <StudentLearnView
            progress={progress}
            onUpdateProgress={handleUpdateProgress}
            selectedSubject={selectedSubject}
            onSelectSubject={setSelectedSubject}
            selectedAgeGroup={selectedAgeGroup}
            onSelectAgeGroup={setSelectedAgeGroup}
            currentLanguage={currentLanguage}
            soundEnabled={parentSettings.soundEnabled}
            onNavigateView={(view) => setCurrentView(view)}
          />
        )}

        {currentView === 'counting-alphabet' && (
          <CountingAndAlphabetView
            progress={progress}
            onUpdateProgress={handleUpdateProgress}
            soundEnabled={parentSettings.soundEnabled}
          />
        )}

        {currentView === 'games' && (
          <ArcadeGamesView
            progress={progress}
            onUpdateProgress={handleUpdateProgress}
            soundEnabled={parentSettings.soundEnabled}
          />
        )}

        {currentView === 'puzzles' && (
          <BrainPuzzlesView
            progress={progress}
            onUpdateProgress={handleUpdateProgress}
            soundEnabled={parentSettings.soundEnabled}
          />
        )}

        {currentView === 'rewards' && (
          <RewardsShopView
            progress={progress}
            onUpdateProgress={handleUpdateProgress}
            soundEnabled={parentSettings.soundEnabled}
          />
        )}

        {currentView === 'parent-dashboard' && (
          <ParentDashboardView
            settings={parentSettings}
            onUpdateSettings={handleUpdateSettings}
            progress={progress}
            soundEnabled={parentSettings.soundEnabled}
          />
        )}

        {currentView === 'classroom' && (
          <ClassroomView
            assignments={assignments}
            onUpdateAssignments={handleUpdateAssignments}
            progress={progress}
            soundEnabled={parentSettings.soundEnabled}
            isOnline={isOnline && !isSimulatedOffline}
          />
        )}

        {currentView === 'privacy' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Child Privacy, COPPA & GDPR Compliance Center
              </h2>
              <button
                onClick={() => setShowPrivacyModal(true)}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
              >
                Open Full Trust Center
              </button>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Kids Learning Hub conforms strictly to international privacy standards including COPPA (16 CFR Part 312), GDPR (Article 8 & 17), and FERPA. Zero third-party ad networks, no behavioral telemetry, and verifiable client-side cryptographic storage ensure complete safety for primary school children.
            </p>
          </div>
        )}
      </main>

      {/* Mobile Sticky Bottom Navigation Bar */}
      <BottomNav
        currentView={currentView}
        onSelectView={(view) => setCurrentView(view)}
        currentLanguage={currentLanguage}
      />

      {/* Real-time Notifications Center Modal */}
      <NotificationsModal
        isOpen={showNotificationsModal}
        onClose={() => setShowNotificationsModal(false)}
        notifications={notifications}
        onMarkAllRead={handleMarkAllNotificationsRead}
        onAddSampleNotification={handleAddNotification}
      />

      {/* Privacy, COPPA & GDPR Trust Center Modal */}
      <PrivacyComplianceModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        onDataWiped={handleDataWiped}
      />

      {/* Offline Mode & Activity Readiness Diagnostic Center */}
      <OfflineCenterModal
        isOpen={showOfflineModal}
        onClose={() => setShowOfflineModal(false)}
        isOnline={isOnline && !isSimulatedOffline}
        onToggleSimulatedOffline={handleToggleSimulatedNetwork}
        pendingQueueCount={pendingOfflineCount}
        onClearQueue={() => setPendingOfflineCount(0)}
      />
    </div>
  );
}
