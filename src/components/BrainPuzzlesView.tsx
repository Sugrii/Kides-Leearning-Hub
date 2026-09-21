import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Scale, 
  Sparkles, 
  CheckCircle2, 
  RotateCcw, 
  ArrowRight, 
  Shuffle,
  Lightbulb
} from 'lucide-react';
import { StudentProgress } from '../types';
import { useSound } from '../hooks/useSound';

interface BrainPuzzlesViewProps {
  progress: StudentProgress;
  onUpdateProgress: (updated: StudentProgress) => void;
  soundEnabled: boolean;
}

export const BrainPuzzlesView: React.FC<BrainPuzzlesViewProps> = ({
  progress,
  onUpdateProgress,
  soundEnabled,
}) => {
  const { playCorrect, playIncorrect, playCoin, playClick } = useSound(soundEnabled);
  const [activeTab, setActiveTab] = useState<'balance' | 'word' | 'pattern'>('balance');

  // ================= Puzzle 1: Math Balance Scale =================
  const [scaleLeftTotal] = useState(18); // Left is 10 + 8 = 18
  const [scaleRightFixed] = useState(11); // Right has 11 + ?
  const [selectedBalanceAnswer, setSelectedBalanceAnswer] = useState<number | null>(null);
  const [isBalanceSolved, setIsBalanceSolved] = useState(false);
  const [balanceFeedback, setBalanceFeedback] = useState<string | null>(null);

  const balanceOptions = [5, 6, 7, 8, 9];

  const handleSelectBalance = (val: number) => {
    playClick();
    setSelectedBalanceAnswer(val);
    const rightTotal = scaleRightFixed + val;
    if (rightTotal === scaleLeftTotal) {
      setIsBalanceSolved(true);
      setBalanceFeedback('🎉 Perfectly Balanced! 10 + 8 = 18 and 11 + 7 = 18!');
      playCorrect();
      setTimeout(playCoin, 200);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      onUpdateProgress({
        ...progress,
        stars: progress.stars + 15,
        coins: progress.coins + 10,
      });
    } else {
      setIsBalanceSolved(false);
      playIncorrect();
      setBalanceFeedback(
        rightTotal < scaleLeftTotal 
          ? `⚖️ Tilted left! Right side is ${rightTotal}, need ${scaleLeftTotal}. Try a bigger number.`
          : `⚖️ Tilted right! Right side is ${rightTotal}, need ${scaleLeftTotal}. Try a smaller number.`
      );
    }
  };

  // ================= Puzzle 2: Word Scramble / Phonics Tile Arranger =================
  const targetWord = 'DOLPHIN';
  const initialTiles = ['L', 'H', 'D', 'I', 'P', 'O', 'N'];
  const [availableTiles, setAvailableTiles] = useState<string[]>(initialTiles);
  const [slottedTiles, setSlottedTiles] = useState<string[]>([]);
  const [isWordSolved, setIsWordSolved] = useState(false);

  const handlePickTile = (letter: string, index: number) => {
    if (isWordSolved) return;
    playClick();
    const newAvail = [...availableTiles];
    newAvail.splice(index, 1);
    setAvailableTiles(newAvail);
    const newSlotted = [...slottedTiles, letter];
    setSlottedTiles(newSlotted);

    if (newSlotted.length === targetWord.length) {
      const spelled = newSlotted.join('');
      if (spelled === targetWord) {
        setIsWordSolved(true);
        playCorrect();
        setTimeout(playCoin, 200);
        confetti({ particleCount: 70, spread: 60 });
        onUpdateProgress({
          ...progress,
          stars: progress.stars + 20,
          coins: progress.coins + 12,
        });
      } else {
        playIncorrect();
      }
    }
  };

  const handleReturnSlotted = (letter: string, index: number) => {
    if (isWordSolved) return;
    playClick();
    const newSlotted = [...slottedTiles];
    newSlotted.splice(index, 1);
    setSlottedTiles(newSlotted);
    setAvailableTiles([...availableTiles, letter]);
  };

  const handleResetWord = () => {
    setAvailableTiles(initialTiles);
    setSlottedTiles([]);
    setIsWordSolved(false);
  };

  // ================= Puzzle 3: Pattern Detective =================
  const patternSequence = ['2', '4', '8', '16', '32'];
  const patternOptions = ['48', '64', '54', '72'];
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);
  const [isPatternSolved, setIsPatternSolved] = useState(false);

  const handleCheckPattern = (opt: string) => {
    playClick();
    setSelectedPattern(opt);
    if (opt === '64') {
      setIsPatternSolved(true);
      playCorrect();
      setTimeout(playCoin, 200);
      confetti({ particleCount: 70, spread: 60 });
      onUpdateProgress({
        ...progress,
        stars: progress.stars + 15,
        coins: progress.coins + 8,
      });
    } else {
      setIsPatternSolved(false);
      playIncorrect();
    }
  };

  // Calculate tilt angle for the physical scale
  let tiltDeg = -8; // default tilt left (18 vs 11)
  if (selectedBalanceAnswer !== null) {
    const diff = (scaleRightFixed + selectedBalanceAnswer) - scaleLeftTotal;
    tiltDeg = diff === 0 ? 0 : diff > 0 ? 8 : -8;
  }

  return (
    <div className="space-y-5 animate-in fade-in">
      {/* Puzzle Navigation Mode */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-1.5 w-full">
          <button
            onClick={() => { playClick(); setActiveTab('balance'); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'balance'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Balance Scale</span>
          </button>

          <button
            onClick={() => { playClick(); setActiveTab('word'); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'word'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Shuffle className="w-4 h-4" />
            <span>Word Builder</span>
          </button>

          <button
            onClick={() => { playClick(); setActiveTab('pattern'); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'pattern'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Pattern Quest</span>
          </button>
        </div>
      </div>

      {/* ================= TAB 1: BALANCE SCALE ================= */}
      {activeTab === 'balance' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-7 shadow-sm space-y-6">
          <div className="text-center space-y-1">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              Interactive Physics & Math Balance
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-display">
              Balance the Equal Scales!
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Choose the missing weight so both sides have the exact same total sum.
            </p>
          </div>

          {/* Animated Physical Balance Rig */}
          <div className="py-6 flex flex-col items-center justify-center select-none">
            {/* Fulcrum and Beam */}
            <div 
              className="w-64 sm:w-80 h-3 rounded-full bg-slate-700 dark:bg-slate-300 transition-transform duration-500 ease-out flex items-center justify-between px-2 relative"
              style={{ transform: `rotate(${tiltDeg}deg)` }}
            >
              {/* Left Pan */}
              <div className="absolute -bottom-16 left-0 flex flex-col items-center">
                <div className="w-0.5 h-12 bg-slate-400" />
                <div className="px-3 py-2 rounded-xl bg-blue-500 text-white font-bold text-xs shadow-md">
                  10 + 8 = 18
                </div>
              </div>

              {/* Right Pan */}
              <div className="absolute -bottom-16 right-0 flex flex-col items-center">
                <div className="w-0.5 h-12 bg-slate-400" />
                <div className="px-3 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs shadow-md">
                  11 + {selectedBalanceAnswer !== null ? selectedBalanceAnswer : '?'}
                </div>
              </div>
            </div>

            {/* Fulcrum Triangle Stand */}
            <div className="w-0 h-0 border-l-[24px] border-l-transparent border-r-[24px] border-r-transparent border-b-[40px] border-b-slate-400 mt-0" />
            <div className="w-24 h-2 bg-slate-500 rounded-full" />
          </div>

          {/* Feedback banner */}
          {balanceFeedback && (
            <div className={`p-3 rounded-xl text-xs text-center font-bold ${
              isBalanceSolved 
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200' 
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200'
            }`}>
              {balanceFeedback}
            </div>
          )}

          {/* Answer Weight Buttons */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 text-center uppercase tracking-wider">
              Select Missing Weight (?)
            </label>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              {balanceOptions.map((num) => (
                <button
                  key={num}
                  id={`btn-balance-${num}`}
                  onClick={() => handleSelectBalance(num)}
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl font-bold text-base transition transform active:scale-95 flex items-center justify-center shadow-xs ${
                    selectedBalanceAnswer === num
                      ? num === 7
                        ? 'bg-emerald-600 text-white ring-4 ring-emerald-300'
                        : 'bg-rose-600 text-white ring-4 ring-rose-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-700'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: WORD BUILDER ================= */}
      {activeTab === 'word' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-7 shadow-sm space-y-6">
          <div className="text-center space-y-1">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              Phonics & Vocabulary Builder
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-display">
              Unscramble the Mystery Ocean Friend
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Clue: A friendly, smart mammal that leaps joyfully out of ocean waves! 🐬
            </p>
          </div>

          {/* Slots Container */}
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 min-h-[58px]">
            {Array.from({ length: targetWord.length }).map((_, i) => {
              const letter = slottedTiles[i];
              return (
                <button
                  key={i}
                  onClick={() => letter && handleReturnSlotted(letter, i)}
                  className={`w-10 h-12 sm:w-12 sm:h-14 rounded-xl border-2 flex items-center justify-center font-bold text-lg transition ${
                    letter
                      ? isWordSolved
                        ? 'bg-emerald-500 text-white border-emerald-600'
                        : 'bg-indigo-600 text-white border-indigo-700'
                      : 'border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-slate-400'
                  }`}
                >
                  {letter || ''}
                </button>
              );
            })}
          </div>

          {isWordSolved && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-800 dark:text-emerald-300 text-center text-xs font-bold">
              🎉 Bravo! You spelled "DOLPHIN" (+20 ⭐, +12 🪙)!
            </div>
          )}

          {/* Available Letter Tiles */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 px-1">
              <span>Tap a tile to place it:</span>
              <button 
                onClick={handleResetWord}
                className="flex items-center gap-1 text-indigo-600 hover:underline"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {availableTiles.map((letter, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePickTile(letter, idx)}
                  className="w-11 h-13 sm:w-13 sm:h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/60 border-2 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 font-extrabold text-lg shadow-sm hover:scale-105 active:scale-95 transition"
                >
                  {letter}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: PATTERN DETECTIVE ================= */}
      {activeTab === 'pattern' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-7 shadow-sm space-y-6">
          <div className="text-center space-y-1">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
              Logic & Number Patterns
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-display">
              The Doubling Mystery Pattern
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Each number is multiplied by 2. What is the next number?
            </p>
          </div>

          {/* Pattern Sequence visual */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 py-3">
            {patternSequence.map((val, idx) => (
              <React.Fragment key={idx}>
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold text-base sm:text-lg flex items-center justify-center">
                  {val}
                </div>
                <span className="text-slate-300 dark:text-slate-700 font-bold">➔</span>
              </React.Fragment>
            ))}
            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border-2 flex items-center justify-center font-bold text-base sm:text-lg ${
              isPatternSolved 
                ? 'bg-emerald-500 text-white border-emerald-600'
                : 'border-dashed border-purple-400 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300'
            }`}>
              {selectedPattern || '?'}
            </div>
          </div>

          {isPatternSolved && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-800 dark:text-emerald-300 text-center text-xs font-bold">
              🎉 Correct! 32 × 2 = 64 (+15 ⭐, +8 🪙)!
            </div>
          )}

          {/* Options */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {patternOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => handleCheckPattern(opt)}
                className={`p-3.5 rounded-2xl border font-bold text-base transition ${
                  selectedPattern === opt
                    ? opt === '64'
                      ? 'bg-emerald-600 text-white border-emerald-700'
                      : 'bg-rose-600 text-white border-rose-700'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:border-indigo-400'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
