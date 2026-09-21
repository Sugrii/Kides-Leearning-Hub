import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  CheckCircle2, 
  Search, 
  Filter, 
  HelpCircle,
  Award,
  Hash,
  Type,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { 
  ALPHABET_DATA, 
  NUMBER_WORDS, 
  AlphabetItem, 
  speakNumber, 
  speakAlphabet, 
  speakText, 
  stopSpeech, 
  playChime 
} from '../services/speechService';
import { StudentProgress } from '../types';
import { useSound } from '../hooks/useSound';

interface CountingAndAlphabetViewProps {
  progress: StudentProgress;
  onUpdateProgress: (updated: StudentProgress) => void;
  soundEnabled: boolean;
}

export const CountingAndAlphabetView: React.FC<CountingAndAlphabetViewProps> = ({
  progress,
  onUpdateProgress,
  soundEnabled,
}) => {
  const { playCorrect, playIncorrect, playClick } = useSound(soundEnabled);

  // Main Mode: 'numbers' | 'alphabet'
  const [activeTab, setActiveTab] = useState<'numbers' | 'alphabet'>('numbers');

  // ================= NUMBERS 0-100 STATE =================
  const [selectedNumber, setSelectedNumber] = useState<number>(0);
  const [isCountingAuto, setIsCountingAuto] = useState<boolean>(false);
  const [countingRange, setCountingRange] = useState<'0-10' | '0-20' | '0-50' | '0-100'>('0-20');
  const [numberFilter, setNumberFilter] = useState<'all' | 'evens' | 'odds' | 'tens' | 'fives'>('all');
  const [isSpeakingNumber, setIsSpeakingNumber] = useState<boolean>(false);
  const autoCountTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Number quiz challenge state
  const [targetQuizNumber, setTargetQuizNumber] = useState<number | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);

  // ================= ALPHABET A-Z STATE =================
  const [selectedLetter, setSelectedLetter] = useState<AlphabetItem>(ALPHABET_DATA[0]);
  const [alphabetFilter, setAlphabetFilter] = useState<'all' | 'vowels' | 'consonants'>('all');
  const [isAutoPlayingAlphabet, setIsAutoPlayingAlphabet] = useState<boolean>(false);
  const [isSpeakingAlphabet, setIsSpeakingAlphabet] = useState<boolean>(false);
  const alphabetTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Letter quiz challenge state
  const [targetQuizLetter, setTargetQuizLetter] = useState<AlphabetItem | null>(null);
  const [letterQuizFeedback, setLetterQuizFeedback] = useState<string | null>(null);

  // Clean up speech and timers on unmount
  useEffect(() => {
    return () => {
      stopSpeech();
      if (autoCountTimerRef.current) clearInterval(autoCountTimerRef.current);
      if (alphabetTimerRef.current) clearInterval(alphabetTimerRef.current);
    };
  }, []);

  // ================= NUMBERS HANDLERS =================
  const handleSelectNumber = (num: number) => {
    playClick();
    setSelectedNumber(num);
    setIsSpeakingNumber(true);
    speakNumber(num, () => setIsSpeakingNumber(false));

    // Check quiz
    if (targetQuizNumber !== null) {
      if (num === targetQuizNumber) {
        playCorrect();
        setQuizFeedback(`🎉 Splendid! You found number ${num} (${NUMBER_WORDS[num]})! +5 Coins`);
        onUpdateProgress({
          ...progress,
          stars: progress.stars + 1,
          coins: progress.coins + 5,
        });
        setTimeout(() => {
          setTargetQuizNumber(null);
          setQuizFeedback(null);
        }, 3000);
      } else {
        playIncorrect();
        setQuizFeedback(`That was ${num}. Look closely for ${targetQuizNumber}!`);
      }
    }
  };

  const handleStartNumberQuiz = () => {
    playClick();
    const maxNum = countingRange === '0-10' ? 10 : countingRange === '0-20' ? 20 : countingRange === '0-50' ? 50 : 100;
    const randomNum = Math.floor(Math.random() * (maxNum + 1));
    setTargetQuizNumber(randomNum);
    setQuizFeedback(`Listen closely: Can you tap number ${randomNum}?`);
    speakText(`Can you find number ${randomNum}? ${NUMBER_WORDS[randomNum]}`);
  };

  const toggleAutoCounting = () => {
    if (isCountingAuto) {
      setIsCountingAuto(false);
      if (autoCountTimerRef.current) clearInterval(autoCountTimerRef.current);
      stopSpeech();
    } else {
      setIsCountingAuto(true);
      playClick();
      let current = selectedNumber;
      const maxNum = countingRange === '0-10' ? 10 : countingRange === '0-20' ? 20 : countingRange === '0-50' ? 50 : 100;
      if (current >= maxNum) current = 0;

      setSelectedNumber(current);
      speakNumber(current);

      autoCountTimerRef.current = setInterval(() => {
        current += 1;
        if (current > maxNum) {
          setIsCountingAuto(false);
          if (autoCountTimerRef.current) clearInterval(autoCountTimerRef.current);
          speakText('Hooray! We counted all the way!');
          return;
        }
        setSelectedNumber(current);
        speakNumber(current);
      }, 1200);
    }
  };

  // ================= ALPHABET HANDLERS =================
  const handleSelectLetter = (item: AlphabetItem) => {
    playClick();
    setSelectedLetter(item);
    setIsSpeakingAlphabet(true);
    speakAlphabet(item, 'full', () => setIsSpeakingAlphabet(false));

    // Check letter quiz
    if (targetQuizLetter !== null) {
      if (item.letter === targetQuizLetter.letter) {
        playCorrect();
        setLetterQuizFeedback(`🌟 Correct! ${item.letter} is for ${item.word}! +5 Coins`);
        onUpdateProgress({
          ...progress,
          stars: progress.stars + 1,
          coins: progress.coins + 5,
        });
        setTimeout(() => {
          setTargetQuizLetter(null);
          setLetterQuizFeedback(null);
        }, 3000);
      } else {
        playIncorrect();
        setLetterQuizFeedback(`That was letter ${item.letter}. Try to find letter ${targetQuizLetter.letter}!`);
      }
    }
  };

  const handleStartLetterQuiz = () => {
    playClick();
    const randomIndex = Math.floor(Math.random() * ALPHABET_DATA.length);
    const target = ALPHABET_DATA[randomIndex];
    setTargetQuizLetter(target);
    setLetterQuizFeedback(`Can you find letter ${target.letter} for ${target.word}?`);
    speakText(`Can you find letter ${target.letter}? ${target.letter} is for ${target.word}!`);
  };

  const toggleAutoPlayAlphabet = () => {
    if (isAutoPlayingAlphabet) {
      setIsAutoPlayingAlphabet(false);
      if (alphabetTimerRef.current) clearInterval(alphabetTimerRef.current);
      stopSpeech();
    } else {
      setIsAutoPlayingAlphabet(true);
      playClick();
      let index = ALPHABET_DATA.findIndex(a => a.letter === selectedLetter.letter);
      if (index === -1 || index >= ALPHABET_DATA.length - 1) index = 0;

      const first = ALPHABET_DATA[index];
      setSelectedLetter(first);
      speakAlphabet(first, 'phonics');

      alphabetTimerRef.current = setInterval(() => {
        index += 1;
        if (index >= ALPHABET_DATA.length) {
          setIsAutoPlayingAlphabet(false);
          if (alphabetTimerRef.current) clearInterval(alphabetTimerRef.current);
          speakText('Awesome! We practiced the whole alphabet!');
          return;
        }
        const currentItem = ALPHABET_DATA[index];
        setSelectedLetter(currentItem);
        speakAlphabet(currentItem, 'phonics');
      }, 1600);
    }
  };

  // Filtered lists
  const filteredNumbers = Array.from({ length: 101 }, (_, i) => i).filter((n) => {
    if (numberFilter === 'evens') return n > 0 && n % 2 === 0;
    if (numberFilter === 'odds') return n % 2 !== 0;
    if (numberFilter === 'tens') return n > 0 && n % 10 === 0;
    if (numberFilter === 'fives') return n > 0 && n % 5 === 0;
    return true;
  });

  const filteredAlphabet = ALPHABET_DATA.filter((item) => {
    if (alphabetFilter === 'vowels') return item.isVowel;
    if (alphabetFilter === 'consonants') return !item.isVowel;
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in pb-10">
      {/* Top Hero Banner & Mode Navigation */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-teal-500 via-emerald-600 to-indigo-600 text-white shadow-lg space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-white/20 tracking-wide uppercase">
                Interactive Audio Lab
              </span>
              <span className="text-xs text-teal-100 flex items-center gap-1 font-medium">
                <Volume2 className="w-3.5 h-3.5" />
                Speech & Phonics Sound
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display">
              Number Counting 0-100 & Alphabet A-Z
            </h2>
            <p className="text-xs sm:text-sm text-teal-50 max-w-xl leading-relaxed">
              Tap any number or letter to hear clear native audio pronunciation, learn phonics sounds, skip count, and play audio discovery challenges!
            </p>
          </div>

          {/* Tab Switcher Pills */}
          <div className="flex p-1.5 rounded-2xl bg-black/20 backdrop-blur-md border border-white/20 self-start sm:self-auto">
            <button
              id="tab-numbers-0-100"
              onClick={() => {
                setActiveTab('numbers');
                stopSpeech();
                playClick();
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeTab === 'numbers'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <Hash className="w-4 h-4" />
              <span>Numbers (0-100)</span>
            </button>
            <button
              id="tab-alphabet-a-z"
              onClick={() => {
                setActiveTab('alphabet');
                stopSpeech();
                playClick();
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeTab === 'alphabet'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <Type className="w-4 h-4" />
              <span>Alphabet (A-Z)</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: NUMBERS 0 TO 100 COUNTING & PRONUNCIATION                     */}
      {/* ========================================================================= */}
      {activeTab === 'numbers' && (
        <div className="space-y-5 animate-in fade-in">
          {/* Active Number Spotlight Card */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5 text-center md:text-left">
              <div className="relative">
                <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex flex-col items-center justify-center font-black shadow-md border-4 border-white dark:border-slate-800 ${
                  isSpeakingNumber ? 'scale-105 ring-4 ring-emerald-400/50 animate-pulse' : ''
                } transition-all duration-300`}>
                  <span className="text-3xl sm:text-4xl leading-none">{selectedNumber}</span>
                  <span className="text-[10px] uppercase font-bold text-emerald-100 mt-1">Number</span>
                </div>
                {isSpeakingNumber && (
                  <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-400 text-slate-900 text-xs flex items-center justify-center animate-bounce shadow">
                    🔊
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                  <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                    {selectedNumber % 2 === 0 ? 'Even Number' : 'Odd Number'}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Place Value: {Math.floor(selectedNumber / 10)} Tens, {selectedNumber % 10} Ones
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display">
                  {NUMBER_WORDS[selectedNumber]}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Tap to hear pronunciation with natural phonetic cadence.
                </p>
              </div>
            </div>

            {/* Quick Voice & Quiz Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 w-full md:w-auto">
              <button
                id="btn-speak-number-aloud"
                onClick={() => {
                  setIsSpeakingNumber(true);
                  speakNumber(selectedNumber, () => setIsSpeakingNumber(false));
                }}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-sm shadow-md transition"
              >
                <Volume2 className="w-4 h-4" />
                <span>Hear Pronunciation</span>
              </button>

              <button
                id="btn-toggle-auto-count"
                onClick={toggleAutoCounting}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-bold text-sm shadow-sm transition ${
                  isCountingAuto 
                    ? 'bg-rose-500 hover:bg-rose-600 text-white animate-pulse'
                    : 'bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                }`}
              >
                {isCountingAuto ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isCountingAuto ? 'Pause Counting' : 'Count With Me'}</span>
              </button>

              <button
                id="btn-start-number-quiz"
                onClick={handleStartNumberQuiz}
                className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-sm transition"
              >
                <Sparkles className="w-4 h-4" />
                <span>Find Quiz</span>
              </button>
            </div>
          </div>

          {/* Quiz Feedback Banner if active */}
          {quizFeedback && (
            <div className={`p-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-between gap-3 animate-in fade-in shadow-xs ${
              quizFeedback.includes('Splendid')
                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 border border-emerald-300'
                : 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border border-amber-300'
            }`}>
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 flex-shrink-0" />
                <span>{quizFeedback}</span>
              </div>
              <button
                onClick={() => {
                  if (targetQuizNumber !== null) {
                    speakText(`Can you find number ${targetQuizNumber}?`);
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-white/80 dark:bg-black/40 text-slate-800 dark:text-white text-xs font-bold shadow-2xs hover:bg-white"
              >
                Repeat Prompt 🔊
              </button>
            </div>
          )}

          {/* Control Bar: Filters & Skip Counting */}
          <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-800/50 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
              <Filter className="w-4 h-4 text-emerald-600" />
              <span>Filter & Skip Counting:</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'all', label: 'All 0-100' },
                { id: 'evens', label: 'Evens (by 2s)' },
                { id: 'odds', label: 'Odds' },
                { id: 'fives', label: 'By 5s' },
                { id: 'tens', label: 'By 10s' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => {
                    setNumberFilter(f.id as any);
                    playClick();
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    numberFilter === f.id
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span>Auto Count Range:</span>
              <select
                value={countingRange}
                onChange={(e) => setCountingRange(e.target.value as any)}
                className="px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-white"
              >
                <option value="0-10">0 to 10</option>
                <option value="0-20">0 to 20</option>
                <option value="0-50">0 to 50</option>
                <option value="0-100">0 to 100</option>
              </select>
            </div>
          </div>

          {/* Interactive 0-100 Numbers Grid */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold">Showing {filteredNumbers.length} interactive numbers</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Tap any number to listen!</span>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 sm:gap-2.5">
              {filteredNumbers.map((num) => {
                const isSelected = selectedNumber === num;
                const isTargetQuiz = targetQuizNumber === num;

                return (
                  <button
                    key={num}
                    id={`num-tile-${num}`}
                    onClick={() => handleSelectNumber(num)}
                    className={`h-11 sm:h-12 rounded-2xl flex flex-col items-center justify-center font-bold transition-all duration-150 active:scale-95 ${
                      isSelected
                        ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md scale-105 ring-2 ring-emerald-400 ring-offset-2 dark:ring-offset-slate-900'
                        : isTargetQuiz
                        ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border-2 border-dashed border-amber-400 animate-pulse'
                        : 'bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60'
                    }`}
                  >
                    <span className="text-base sm:text-lg leading-none">{num}</span>
                    <span className="text-[8px] opacity-75 truncate max-w-[90%] leading-none mt-0.5">
                      {num === 0 ? 'zero' : num % 10 === 0 ? NUMBER_WORDS[num].toLowerCase() : ''}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: ALPHABET A-Z PRONUNCIATION & PHONICS STUDIO                   */}
      {/* ========================================================================= */}
      {activeTab === 'alphabet' && (
        <div className="space-y-5 animate-in fade-in">
          {/* Active Letter Spotlight Card */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5 text-center md:text-left">
              <div className="relative">
                <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 text-white flex flex-col items-center justify-center font-black shadow-md border-4 border-white dark:border-slate-800 ${
                  isSpeakingAlphabet ? 'scale-105 ring-4 ring-purple-400/50 animate-pulse' : ''
                } transition-all duration-300`}>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl">{selectedLetter.letter}</span>
                    <span className="text-xl sm:text-2xl text-purple-200">{selectedLetter.lowercase}</span>
                  </div>
                  <span className="text-[11px] font-mono text-pink-200 mt-1">
                    {selectedLetter.phonetic}
                  </span>
                </div>
                <div className="absolute -bottom-2 -right-2 text-2xl filter drop-shadow">
                  {selectedLetter.emoji}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                  <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                    selectedLetter.isVowel
                      ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                      : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300'
                  }`}>
                    {selectedLetter.isVowel ? 'Vowel Sound' : 'Consonant Sound'}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Phonetic sound: <strong className="text-purple-600 dark:text-purple-400">{selectedLetter.phonetic}</strong>
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display flex items-center justify-center md:justify-start gap-2">
                  <span>{selectedLetter.letter} is for {selectedLetter.word}</span>
                  <span className="text-2xl">{selectedLetter.emoji}</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 italic">
                  "{selectedLetter.sentence}"
                </p>
              </div>
            </div>

            {/* Alphabet Pronunciation Control Actions */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 w-full md:w-auto">
              <button
                id="btn-speak-letter-full"
                onClick={() => {
                  setIsSpeakingAlphabet(true);
                  speakAlphabet(selectedLetter, 'full', () => setIsSpeakingAlphabet(false));
                }}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold text-sm shadow-md transition"
              >
                <Volume2 className="w-4 h-4" />
                <span>Hear Full Sound</span>
              </button>

              <button
                id="btn-toggle-auto-alphabet"
                onClick={toggleAutoPlayAlphabet}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-bold text-sm shadow-sm transition ${
                  isAutoPlayingAlphabet
                    ? 'bg-rose-500 hover:bg-rose-600 text-white animate-pulse'
                    : 'bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                }`}
              >
                {isAutoPlayingAlphabet ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isAutoPlayingAlphabet ? 'Pause Sing-Along' : 'Sing A to Z'}</span>
              </button>

              <button
                id="btn-start-letter-quiz"
                onClick={handleStartLetterQuiz}
                className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-sm transition"
              >
                <Sparkles className="w-4 h-4" />
                <span>Phonics Quiz</span>
              </button>
            </div>
          </div>

          {/* Letter Quiz Feedback */}
          {letterQuizFeedback && (
            <div className={`p-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-between gap-3 animate-in fade-in shadow-xs ${
              letterQuizFeedback.includes('Correct')
                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 border border-emerald-300'
                : 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border border-amber-300'
            }`}>
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 flex-shrink-0" />
                <span>{letterQuizFeedback}</span>
              </div>
              <button
                onClick={() => {
                  if (targetQuizLetter) {
                    speakText(`Can you find letter ${targetQuizLetter.letter}? ${targetQuizLetter.letter} is for ${targetQuizLetter.word}!`);
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-white/80 dark:bg-black/40 text-slate-800 dark:text-white text-xs font-bold shadow-2xs hover:bg-white"
              >
                Repeat Prompt 🔊
              </button>
            </div>
          )}

          {/* Filter Bar for Alphabet */}
          <div className="p-3.5 rounded-2xl bg-slate-100/70 dark:bg-slate-800/50 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
              <Filter className="w-4 h-4 text-purple-600" />
              <span>Filter Letters:</span>
            </div>

            <div className="flex gap-2">
              {[
                { id: 'all', label: 'All 26 Letters (A-Z)' },
                { id: 'vowels', label: 'Vowels Only (A, E, I, O, U)' },
                { id: 'consonants', label: 'Consonants (21 Letters)' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => {
                    setAlphabetFilter(f.id as any);
                    playClick();
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    alphabetFilter === f.id
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive 26-Letter Grid Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-3.5">
            {filteredAlphabet.map((item) => {
              const isSelected = selectedLetter.letter === item.letter;
              const isTargetQuiz = targetQuizLetter?.letter === item.letter;

              return (
                <button
                  key={item.letter}
                  id={`letter-card-${item.letter}`}
                  onClick={() => handleSelectLetter(item)}
                  className={`p-3.5 rounded-2xl flex flex-col items-center justify-between gap-2 text-center transition-all duration-200 active:scale-95 ${
                    isSelected
                      ? 'bg-gradient-to-b from-purple-500 to-indigo-600 text-white shadow-md scale-105 ring-2 ring-purple-400 ring-offset-2 dark:ring-offset-slate-900'
                      : isTargetQuiz
                      ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border-2 border-dashed border-amber-400 animate-pulse'
                      : 'bg-white dark:bg-slate-900 hover:bg-purple-50 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : item.isVowel
                        ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}>
                      {item.isVowel ? 'Vowel' : item.phonetic}
                    </span>
                    <span className="text-xl leading-none">{item.emoji}</span>
                  </div>

                  <div className="my-1">
                    <span className="text-3xl font-black tracking-tight">{item.letter}</span>
                    <span className="text-xl font-bold opacity-80 ml-1">{item.lowercase}</span>
                  </div>

                  <div className="w-full pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-1 text-xs font-bold truncate">
                    <Volume2 className="w-3 h-3 opacity-60 flex-shrink-0" />
                    <span className="truncate">{item.word}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
