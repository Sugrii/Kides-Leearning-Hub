import React, { useState, useMemo, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  HelpCircle, 
  Sparkles, 
  ArrowRight, 
  RotateCcw, 
  Star, 
  Lightbulb,
  Scale,
  BrainCircuit,
  Filter,
  Volume2
} from 'lucide-react';
import { Exercise, SubjectType, AgeGroup, StudentProgress, AppView } from '../types';
import { EXERCISES } from '../data/curriculumData';
import { COMPANIONS } from '../data/rewardData';
import { LanguageCode, TRANSLATIONS } from '../i18n/translations';
import { useSound } from '../hooks/useSound';
import { speakText } from '../services/speechService';

interface StudentLearnViewProps {
  progress: StudentProgress;
  onUpdateProgress: (updated: StudentProgress) => void;
  selectedSubject: SubjectType | 'all';
  onSelectSubject: (subj: SubjectType | 'all') => void;
  selectedAgeGroup: AgeGroup;
  onSelectAgeGroup: (age: AgeGroup) => void;
  currentLanguage: LanguageCode;
  soundEnabled: boolean;
  onNavigateView?: (view: AppView) => void;
}

export const StudentLearnView: React.FC<StudentLearnViewProps> = ({
  progress,
  onUpdateProgress,
  selectedSubject,
  onSelectSubject,
  selectedAgeGroup,
  onSelectAgeGroup,
  currentLanguage,
  soundEnabled,
  onNavigateView,
}) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;
  const { playCorrect, playIncorrect, playCoin, playClick } = useSound(soundEnabled);
  const companion = COMPANIONS.find(c => c.id === progress.equippedCompanionId) || COMPANIONS[0];

  // Filter exercises based on curriculum criteria
  const filteredExercises = useMemo(() => {
    return EXERCISES.filter((ex) => {
      const matchSubject = selectedSubject === 'all' || ex.subject === selectedSubject;
      const matchAge = ex.ageGroup === selectedAgeGroup;
      return matchSubject && matchAge;
    });
  }, [selectedSubject, selectedAgeGroup]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [earnedAnimation, setEarnedAnimation] = useState<string | null>(null);

  const currentExercise = filteredExercises[currentIndex] || filteredExercises[0];

  // Gesture handling for mobile swipe (swipe to next/previous puzzle)
  const touchStartX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current !== null) {
      const touchEndX = e.changedTouches[0].clientX;
      const diffX = touchEndX - touchStartX.current;
      if (diffX < -60) {
        // Swipe left -> Next puzzle
        handleNext();
      } else if (diffX > 60) {
        // Swipe right -> Prev puzzle
        handlePrev();
      }
      touchStartX.current = null;
    }
  };

  const handleSelectOption = (opt: string) => {
    if (isAnswerChecked && isCorrect) return;
    playClick();
    setSelectedOption(opt);
  };

  const handleCheckAnswer = () => {
    if (!selectedOption || !currentExercise) return;

    const isMatch = String(selectedOption).trim().toLowerCase() === String(currentExercise.correctAnswer).trim().toLowerCase();
    setIsAnswerChecked(true);
    setIsCorrect(isMatch);

    if (isMatch) {
      playCorrect();
      setTimeout(playCoin, 250);

      // Trigger colorful celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.65 },
        colors: ['#4f46e5', '#f59e0b', '#10b981', '#ec4899', '#3b82f6'],
      });

      // Calculate rewards
      const starReward = currentExercise.points;
      const coinReward = Math.floor(currentExercise.points / 2) + 2;
      setEarnedAnimation(`+${starReward} ⭐  +${coinReward} 🪙`);

      const alreadyCompleted = progress.completedExerciseIds.includes(currentExercise.id);
      const newCompleted = alreadyCompleted 
        ? progress.completedExerciseIds 
        : [...progress.completedExerciseIds, currentExercise.id];

      const subj = currentExercise.subject;
      const updatedAccuracy = {
        ...progress.accuracyBySubject,
        [subj]: {
          attempted: progress.accuracyBySubject[subj].attempted + 1,
          correct: progress.accuracyBySubject[subj].correct + 1,
        },
      };

      onUpdateProgress({
        ...progress,
        stars: progress.stars + (alreadyCompleted ? 2 : starReward),
        coins: progress.coins + (alreadyCompleted ? 1 : coinReward),
        completedExerciseIds: newCompleted,
        accuracyBySubject: updatedAccuracy,
      });
    } else {
      playIncorrect();
      const subj = currentExercise.subject;
      const updatedAccuracy = {
        ...progress.accuracyBySubject,
        [subj]: {
          ...progress.accuracyBySubject[subj],
          attempted: progress.accuracyBySubject[subj].attempted + 1,
        },
      };
      onUpdateProgress({
        ...progress,
        accuracyBySubject: updatedAccuracy,
      });
    }
  };

  const handleNext = () => {
    if (filteredExercises.length === 0) return;
    playClick();
    setSelectedOption(null);
    setIsAnswerChecked(false);
    setIsCorrect(false);
    setShowHint(false);
    setEarnedAnimation(null);
    setCurrentIndex((prev) => (prev + 1) % filteredExercises.length);
  };

  const handlePrev = () => {
    if (filteredExercises.length === 0) return;
    playClick();
    setSelectedOption(null);
    setIsAnswerChecked(false);
    setIsCorrect(false);
    setShowHint(false);
    setEarnedAnimation(null);
    setCurrentIndex((prev) => (prev - 1 + filteredExercises.length) % filteredExercises.length);
  };

  // Text-to-speech for young kids reading support (100% offline resilient)
  const speakQuestion = () => {
    if (!currentExercise) return;
    speakText(currentExercise.question, { rate: 0.88, pitch: 1.1 });
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in">
      {/* Top Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        {/* Subject Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          <button
            onClick={() => { onSelectSubject('all'); setCurrentIndex(0); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              selectedSubject === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>{t.allSubjects}</span>
          </button>

          <button
            onClick={() => { onSelectSubject('math'); setCurrentIndex(0); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              selectedSubject === 'math'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <span>🔢</span>
            <span>{t.mathSubject}</span>
          </button>

          <button
            onClick={() => { onSelectSubject('english'); setCurrentIndex(0); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              selectedSubject === 'english'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <span>📖</span>
            <span>{t.englishSubject}</span>
          </button>
        </div>

        {/* Age Level Selector */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          {(['5-6', '7-8', '9-11'] as AgeGroup[]).map((age) => (
            <button
              key={age}
              onClick={() => { onSelectAgeGroup(age); setCurrentIndex(0); }}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                selectedAgeGroup === age
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Age {age}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Launch Discovery Cards for 0-100/Alphabet & Games */}
      {onNavigateView && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            id="quick-launch-counting-alphabet"
            onClick={() => onNavigateView('counting-alphabet')}
            className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white shadow-sm flex items-center justify-between gap-3 text-left transition active:scale-98 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-110 transition">
                🔢
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-100 block">
                  Audio Speech Lab
                </span>
                <strong className="text-sm font-bold block">
                  Count 0–100 & Alphabet A–Z
                </strong>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-teal-200 group-hover:translate-x-1 transition" />
          </button>

          <button
            id="quick-launch-games-zone"
            onClick={() => onNavigateView('games')}
            className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-700 hover:to-rose-700 text-white shadow-sm flex items-center justify-between gap-3 text-left transition active:scale-98 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-110 transition">
                🎮
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-200 block">
                  Interactive Arcade
                </span>
                <strong className="text-sm font-bold block">
                  6 Fun Educational Games
                </strong>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-rose-200 group-hover:translate-x-1 transition" />
          </button>
        </div>
      )}

      {/* Main Interactive Exercise Card */}
      {currentExercise ? (
        <div 
          id={`exercise-card-${currentExercise.id}`}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-7 shadow-sm transition-all overflow-hidden"
        >
          {/* Card Top Details */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                currentExercise.subject === 'math'
                  ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                  : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
              }`}>
                {currentExercise.subject === 'math' ? '🔢 Math' : '📖 English'}
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {currentExercise.curriculumTopic}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                +{currentExercise.points} pts
              </span>
              <span className="text-xs text-slate-400">
                {currentIndex + 1} / {filteredExercises.length}
              </span>
            </div>
          </div>

          {/* Question Text & Read Aloud button */}
          <div className="my-5 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-display leading-snug">
                {currentExercise.question}
              </h3>
              <button
                onClick={speakQuestion}
                title="Read question aloud"
                className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition flex-shrink-0"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            {currentExercise.instruction && (
              <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                {currentExercise.instruction}
              </p>
            )}
          </div>

          {/* Visual Aid Canvas / Display */}
          {currentExercise.visualAid && (
            <div className="my-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 flex flex-wrap items-center justify-center gap-3 text-2xl sm:text-3xl select-none">
              {currentExercise.visualAid.content.map((item, idx) => (
                <span 
                  key={idx} 
                  className="animate-bounce-subtle p-1 hover:scale-110 transition-transform"
                >
                  {item}
                </span>
              ))}
            </div>
          )}

          {/* Answer Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-5">
            {currentExercise.options?.map((opt, i) => {
              const isSelected = selectedOption === opt;
              let btnClass = 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/70 text-slate-800 dark:text-slate-200 hover:border-indigo-400';

              if (isSelected) {
                btnClass = 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200 font-bold ring-2 ring-indigo-500/30';
              }

              if (isAnswerChecked) {
                if (opt === currentExercise.correctAnswer) {
                  btnClass = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 font-bold ring-2 ring-emerald-500/30';
                } else if (isSelected && !isCorrect) {
                  btnClass = 'border-rose-500 bg-rose-50 dark:bg-rose-950/50 text-rose-900 dark:text-rose-200 font-medium';
                }
              }

              return (
                <button
                  key={i}
                  id={`opt-btn-${i}`}
                  onClick={() => handleSelectOption(opt)}
                  className={`p-3.5 rounded-2xl border text-left text-sm sm:text-base font-medium transition-all transform active:scale-98 touch-manipulation flex items-center justify-between ${btnClass}`}
                >
                  <span className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center font-bold text-xs text-slate-500 dark:text-slate-300">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span>{opt}</span>
                  </span>
                  {isSelected && !isAnswerChecked && (
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                  )}
                  {isAnswerChecked && opt === currentExercise.correctAnswer && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Feedback Banner upon checking */}
          {isAnswerChecked && (
            <div className={`p-4 rounded-2xl mb-4 border flex items-start justify-between gap-3 animate-in fade-in ${
              isCorrect
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
            }`}>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{isCorrect ? '🎉' : '💡'}</span>
                  <span className="font-bold text-sm sm:text-base">
                    {isCorrect ? t.correct : t.incorrect}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {currentExercise.explanation}
                </p>
                {earnedAnimation && (
                  <div className="text-xs font-bold text-amber-600 dark:text-amber-400 mt-1">
                    Awarded: {earnedAnimation}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Hint Drawer */}
          {showHint && (
            <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 text-amber-900 dark:text-amber-200 mb-4 flex items-start gap-2.5 text-xs animate-in fade-in">
              <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold">Friendly Hint from {companion.name.split(' ')[0]}:</span>
                <p className="leading-relaxed">{currentExercise.hint}</p>
              </div>
            </div>
          )}

          {/* Bottom Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            {/* Hint & Companion perk */}
            <div className="flex items-center gap-2">
              <button
                id="btn-show-hint"
                onClick={() => setShowHint(!showHint)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <HelpCircle className="w-4 h-4 text-amber-500" />
                <span>{showHint ? 'Hide Hint' : t.hint}</span>
              </button>

              <span className="hidden sm:inline text-xs text-slate-400">
                Swipe left for next ➔
              </span>
            </div>

            {/* Action Buttons: Check or Next */}
            <div className="flex items-center gap-2">
              {!isAnswerChecked ? (
                <button
                  id="btn-check-answer"
                  onClick={handleCheckAnswer}
                  disabled={!selectedOption}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:pointer-events-none text-white font-bold text-xs sm:text-sm shadow-sm transition flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{t.checkAnswer}</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  {!isCorrect && (
                    <button
                      id="btn-try-again"
                      onClick={() => {
                        setIsAnswerChecked(false);
                        setSelectedOption(null);
                      }}
                      className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs sm:text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>{t.tryAgain}</span>
                    </button>
                  )}
                  <button
                    id="btn-next-exercise"
                    onClick={handleNext}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-sm transition flex items-center gap-1.5"
                  >
                    <span>{t.nextExercise}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <p className="text-slate-500">No exercises found for this age or subject filter.</p>
        </div>
      )}

      {/* Curriculum Mastery Progress Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
              Math Accuracy
            </span>
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              {progress.accuracyBySubject.math.attempted > 0
                ? Math.round((progress.accuracyBySubject.math.correct / progress.accuracyBySubject.math.attempted) * 100)
                : 100}%
            </div>
            <p className="text-[11px] text-slate-400">
              {progress.accuracyBySubject.math.correct} of {progress.accuracyBySubject.math.attempted} answered correctly
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl font-bold">
            🔢
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              English Accuracy
            </span>
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              {progress.accuracyBySubject.english.attempted > 0
                ? Math.round((progress.accuracyBySubject.english.correct / progress.accuracyBySubject.english.attempted) * 100)
                : 100}%
            </div>
            <p className="text-[11px] text-slate-400">
              {progress.accuracyBySubject.english.correct} of {progress.accuracyBySubject.english.attempted} answered correctly
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl font-bold">
            📖
          </div>
        </div>
      </div>
    </div>
  );
};
