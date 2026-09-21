import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Gamepad2, 
  Sparkles, 
  RotateCcw, 
  Trophy, 
  Heart, 
  Timer, 
  Zap, 
  Volume2, 
  Award, 
  CheckCircle2, 
  XCircle,
  ArrowRight,
  Flame,
  Star,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { StudentProgress } from '../types';
import { useSound } from '../hooks/useSound';
import { playPopSound, playChime, speakText } from '../services/speechService';

interface ArcadeGamesViewProps {
  progress: StudentProgress;
  onUpdateProgress: (updated: StudentProgress) => void;
  soundEnabled: boolean;
}

type GameId = 
  | 'balloon-pop'
  | 'memory-match'
  | 'star-catcher'
  | 'flash-dash'
  | 'word-builder'
  | 'sorting-factory';

export const ArcadeGamesView: React.FC<ArcadeGamesViewProps> = ({
  progress,
  onUpdateProgress,
  soundEnabled,
}) => {
  const { playCorrect, playIncorrect, playCoin, playClick } = useSound(soundEnabled);
  const [selectedGame, setSelectedGame] = useState<GameId>('balloon-pop');

  // Shared high score tracker per game
  const [highScores, setHighScores] = useState<Record<GameId, number>>(() => {
    try {
      const saved = localStorage.getItem('kids_arcade_high_scores');
      return saved ? JSON.parse(saved) : {
        'balloon-pop': 0,
        'memory-match': 0,
        'star-catcher': 0,
        'flash-dash': 0,
        'word-builder': 0,
        'sorting-factory': 0,
      };
    } catch {
      return {
        'balloon-pop': 0,
        'memory-match': 0,
        'star-catcher': 0,
        'flash-dash': 0,
        'word-builder': 0,
        'sorting-factory': 0,
      };
    }
  });

  const saveHighScore = (game: GameId, score: number) => {
    if (score > (highScores[game] || 0)) {
      const updated = { ...highScores, [game]: score };
      setHighScores(updated);
      try {
        localStorage.setItem('kids_arcade_high_scores', JSON.stringify(updated));
      } catch {
        // ignore
      }
    }
  };

  // =========================================================================
  // GAME 1: BALLOON POP MANIA 🎈
  // =========================================================================
  const balloonRounds = [
    { target: 'Pop 3 + 4', answer: '7', options: ['5', '6', '7', '8'], color: 'from-pink-500 to-rose-500' },
    { target: 'Pop word rhyming with "Cat"', answer: 'Hat', options: ['Dog', 'Sun', 'Hat', 'Cup'], color: 'from-blue-500 to-indigo-500' },
    { target: 'Pop 5 × 2', answer: '10', options: ['8', '10', '12', '15'], color: 'from-emerald-500 to-teal-500' },
    { target: 'Pop the Vowel letter', answer: 'E', options: ['B', 'E', 'K', 'T'], color: 'from-amber-500 to-orange-500' },
    { target: 'Pop 9 - 4', answer: '5', options: ['3', '4', '5', '6'], color: 'from-purple-500 to-violet-500' },
    { target: 'Pop the Even Number', answer: '14', options: ['7', '9', '11', '14'], color: 'from-cyan-500 to-blue-500' },
    { target: 'Pop 6 × 3', answer: '18', options: ['12', '15', '18', '21'], color: 'from-red-500 to-pink-500' },
    { target: 'Pop opposite of "Hot"', answer: 'Cold', options: ['Warm', 'Cold', 'Sun', 'Fire'], color: 'from-teal-500 to-green-500' },
  ];

  const [balloonIndex, setBalloonIndex] = useState(0);
  const [balloonScore, setBalloonScore] = useState(0);
  const [balloonPopped, setBalloonPopped] = useState<string | null>(null);
  const [balloonFeedback, setBalloonFeedback] = useState<string | null>(null);

  const handlePopBalloon = (opt: string) => {
    const current = balloonRounds[balloonIndex % balloonRounds.length];
    setBalloonPopped(opt);
    playPopSound();

    if (opt === current.answer) {
      playCorrect();
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } });
      const newScore = balloonScore + 10;
      setBalloonScore(newScore);
      saveHighScore('balloon-pop', newScore);
      setBalloonFeedback('Pop! Perfect Hit! ⭐ +10 pts');

      onUpdateProgress({
        ...progress,
        stars: progress.stars + 1,
        coins: progress.coins + 2,
      });

      setTimeout(() => {
        setBalloonIndex((prev) => prev + 1);
        setBalloonPopped(null);
        setBalloonFeedback(null);
      }, 700);
    } else {
      playIncorrect();
      setBalloonFeedback('Oops, that wasn\'t the target! Try again.');
      setTimeout(() => {
        setBalloonPopped(null);
        setBalloonFeedback(null);
      }, 900);
    }
  };

  // =========================================================================
  // GAME 2: MEMORY MATCH FLIPPING CARDS 🃏
  // =========================================================================
  type MatchCard = { id: number; key: string; display: string; pairId: number; isFlipped: boolean; isMatched: boolean };

  const initialPairs = [
    { key: 'p1', a: '4 + 4', b: '8' },
    { key: 'p2', a: '3 × 3', b: '9' },
    { key: 'p3', a: '10 - 5', b: '5' },
    { key: 'p4', a: '🐱 Cat', b: 'Cat' },
    { key: 'p5', a: '☀️ Sun', b: 'Sun' },
    { key: 'p6', a: '2 + 7', b: '9' },
  ];

  const createShuffledCards = (): MatchCard[] => {
    const cards: MatchCard[] = [];
    initialPairs.forEach((pair, i) => {
      cards.push({ id: i * 2, key: pair.key, display: pair.a, pairId: i, isFlipped: false, isMatched: false });
      cards.push({ id: i * 2 + 1, key: pair.key, display: pair.b, pairId: i, isFlipped: false, isMatched: false });
    });
    return cards.sort(() => Math.random() - 0.5);
  };

  const [memoryCards, setMemoryCards] = useState<MatchCard[]>(createShuffledCards);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [memoryMoves, setMemoryMoves] = useState(0);
  const [memoryMatchesCount, setMemoryMatchesCount] = useState(0);

  const handleCardClick = (cardId: number) => {
    if (flippedIds.length === 2) return;
    const card = memoryCards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;

    playClick();
    const newFlipped = [...flippedIds, cardId];
    setFlippedIds(newFlipped);

    setMemoryCards(prev => prev.map(c => c.id === cardId ? { ...c, isFlipped: true } : c));

    if (newFlipped.length === 2) {
      setMemoryMoves(m => m + 1);
      const [firstId, secondId] = newFlipped;
      const c1 = memoryCards.find(c => c.id === firstId);
      const c2 = memoryCards.find(c => c.id === secondId);

      if (c1 && c2 && c1.pairId === c2.pairId) {
        playCorrect();
        setMemoryCards(prev => prev.map(c => (c.id === firstId || c.id === secondId) ? { ...c, isMatched: true } : c));
        setFlippedIds([]);
        const nextMatches = memoryMatchesCount + 1;
        setMemoryMatchesCount(nextMatches);

        if (nextMatches === initialPairs.length) {
          confetti({ particleCount: 50, spread: 80 });
          const finalScore = Math.max(10, 100 - memoryMoves * 4);
          saveHighScore('memory-match', finalScore);
          onUpdateProgress({
            ...progress,
            stars: progress.stars + 2,
            coins: progress.coins + 10,
          });
        }
      } else {
        playIncorrect();
        setTimeout(() => {
          setMemoryCards(prev => prev.map(c => (c.id === firstId || c.id === secondId) ? { ...c, isFlipped: false } : c));
          setFlippedIds([]);
        }, 900);
      }
    }
  };

  const resetMemoryGame = () => {
    playClick();
    setMemoryCards(createShuffledCards());
    setFlippedIds([]);
    setMemoryMoves(0);
    setMemoryMatchesCount(0);
  };

  // =========================================================================
  // GAME 3: FALLING STAR CATCHER ⭐
  // =========================================================================
  const [catcherPos, setCatcherPos] = useState(50); // percentage 0 - 100
  const [starPos, setStarPos] = useState<{ x: number; y: number; val: string; isTarget: boolean } | null>(null);
  const [starScore, setStarScore] = useState(0);
  const [starLives, setStarLives] = useState(3);
  const [starGameOver, setStarGameOver] = useState(false);
  const [isCatcherRunning, setIsCatcherRunning] = useState(false);
  const starTargetType = 'EVEN Numbers (e.g. 2, 4, 6, 8)';

  // Falling animation loop
  useEffect(() => {
    if (!isCatcherRunning || starGameOver) return;

    let animFrame: number;
    let currentY = 0;
    let currentX = Math.floor(Math.random() * 80) + 10;
    const isEven = Math.random() > 0.5;
    const val = isEven ? String(Math.floor(Math.random() * 10) * 2 + 2) : String(Math.floor(Math.random() * 10) * 2 + 1);

    setStarPos({ x: currentX, y: 0, val, isTarget: isEven });

    const interval = setInterval(() => {
      currentY += 4;
      if (currentY >= 88) {
        // Check catch collision
        const caught = Math.abs(currentX - catcherPos) < 18;
        if (caught) {
          if (isEven) {
            playCorrect();
            setStarScore(s => {
              const updated = s + 10;
              saveHighScore('star-catcher', updated);
              return updated;
            });
          } else {
            playIncorrect();
            setStarLives(l => {
              if (l <= 1) {
                setStarGameOver(true);
                setIsCatcherRunning(false);
                return 0;
              }
              return l - 1;
            });
          }
        } else if (isEven) {
          // Missed a target star
          setStarLives(l => {
            if (l <= 1) {
              setStarGameOver(true);
              setIsCatcherRunning(false);
              return 0;
            }
            return l - 1;
          });
        }
        // Respawn next star
        currentY = 0;
        currentX = Math.floor(Math.random() * 80) + 10;
        const nextIsEven = Math.random() > 0.5;
        const nextVal = nextIsEven ? String(Math.floor(Math.random() * 10) * 2 + 2) : String(Math.floor(Math.random() * 10) * 2 + 1);
        setStarPos({ x: currentX, y: 0, val: nextVal, isTarget: nextIsEven });
      } else {
        setStarPos(prev => prev ? { ...prev, y: currentY } : null);
      }
    }, 60);

    return () => clearInterval(interval);
  }, [isCatcherRunning, catcherPos, starGameOver]);

  // =========================================================================
  // GAME 4: SPEED FLASH DASH (30-SEC RAPID FIRE) ⚡
  // =========================================================================
  const flashPrompts = [
    { q: '7 × 8 = ?', a: '56', opts: ['48', '54', '56'] },
    { q: 'Opposite of "Cold"?', a: 'Hot', opts: ['Warm', 'Hot', 'Ice'] },
    { q: '25 + 15 = ?', a: '40', opts: ['35', '40', '45'] },
    { q: 'Rhymes with "Sun"?', a: 'Run', opts: ['Moon', 'Run', 'Star'] },
    { q: '12 ÷ 4 = ?', a: '3', opts: ['3', '4', '6'] },
    { q: 'Is 15 Even or Odd?', a: 'Odd', opts: ['Even', 'Odd', 'Neither'] },
    { q: '9 × 3 = ?', a: '27', opts: ['24', '27', '30'] },
    { q: 'Past tense of "Run"?', a: 'Ran', opts: ['Ran', 'Runned', 'Running'] },
    { q: '50 - 18 = ?', a: '32', opts: ['32', '34', '38'] },
    { q: 'Which is a vowel?', a: 'O', opts: ['B', 'O', 'M'] },
  ];

  const [flashIndex, setFlashIndex] = useState(0);
  const [flashTimeLeft, setFlashTimeLeft] = useState(30);
  const [flashScore, setFlashScore] = useState(0);
  const [flashStreak, setFlashStreak] = useState(0);
  const [flashActive, setFlashActive] = useState(false);

  useEffect(() => {
    if (!flashActive || flashTimeLeft <= 0) return;
    const timer = setInterval(() => {
      setFlashTimeLeft(t => {
        if (t <= 1) {
          setFlashActive(false);
          playChime(1.5);
          saveHighScore('flash-dash', flashScore);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [flashActive, flashTimeLeft, flashScore]);

  const handleFlashAnswer = (choice: string) => {
    if (!flashActive) return;
    const curr = flashPrompts[flashIndex % flashPrompts.length];
    if (choice === curr.a) {
      playCorrect();
      const mult = flashStreak >= 3 ? 2 : 1;
      const added = 10 * mult;
      const newScore = flashScore + added;
      setFlashScore(newScore);
      setFlashStreak(s => s + 1);
      saveHighScore('flash-dash', newScore);
    } else {
      playIncorrect();
      setFlashStreak(0);
    }
    setFlashIndex(i => i + 1);
  };

  const startFlashDash = () => {
    playClick();
    setFlashTimeLeft(30);
    setFlashScore(0);
    setFlashStreak(0);
    setFlashIndex(0);
    setFlashActive(true);
  };

  // =========================================================================
  // GAME 5: WORD BUILDER LAB 🧪
  // =========================================================================
  const wordBuilderList = [
    { word: 'LION', emoji: '🦁', letters: ['I', 'L', 'O', 'N'] },
    { word: 'FROG', emoji: '🐸', letters: ['O', 'F', 'G', 'R'] },
    { word: 'STAR', emoji: '⭐', letters: ['T', 'S', 'R', 'A'] },
    { word: 'DUCK', emoji: '🦆', letters: ['U', 'D', 'K', 'C'] },
    { word: 'BEAR', emoji: '🐻', letters: ['A', 'B', 'R', 'E'] },
    { word: 'SHIP', emoji: '🚢', letters: ['H', 'S', 'P', 'I'] },
  ];

  const [builderIndex, setBuilderIndex] = useState(0);
  const currWordItem = wordBuilderList[builderIndex % wordBuilderList.length];
  const [assembledLetters, setAssembledLetters] = useState<string[]>([]);
  const [availableLetters, setAvailableLetters] = useState<string[]>(currWordItem.letters);
  const [builderScore, setBuilderScore] = useState(0);

  const handleAddLetter = (letter: string, index: number) => {
    playClick();
    speakText(letter);
    const nextAssembled = [...assembledLetters, letter];
    setAssembledLetters(nextAssembled);
    setAvailableLetters(availableLetters.filter((_, i) => i !== index));

    if (nextAssembled.length === currWordItem.word.length) {
      const full = nextAssembled.join('');
      if (full === currWordItem.word) {
        playCorrect();
        confetti({ particleCount: 40, spread: 70 });
        speakText(`${currWordItem.word}! Awesome spelling!`);
        const newScore = builderScore + 15;
        setBuilderScore(newScore);
        saveHighScore('word-builder', newScore);
        onUpdateProgress({
          ...progress,
          stars: progress.stars + 1,
          coins: progress.coins + 5,
        });

        setTimeout(() => {
          const nextIdx = (builderIndex + 1) % wordBuilderList.length;
          setBuilderIndex(nextIdx);
          setAssembledLetters([]);
          setAvailableLetters(wordBuilderList[nextIdx].letters);
        }, 1200);
      } else {
        playIncorrect();
        speakText('Oops, try rearranging the letters!');
        setTimeout(() => {
          setAssembledLetters([]);
          setAvailableLetters(currWordItem.letters);
        }, 800);
      }
    }
  };

  const resetWordBuilder = () => {
    playClick();
    setAssembledLetters([]);
    setAvailableLetters(currWordItem.letters);
  };

  // =========================================================================
  // GAME 6: SHAPE & SORTING FACTORY 🏭
  // =========================================================================
  const sortingItems = [
    { item: '14', category: 'even', label: '14' },
    { item: '7', category: 'odd', label: '7' },
    { item: '22', category: 'even', label: '22' },
    { item: '19', category: 'odd', label: '19' },
    { item: '50', category: 'even', label: '50' },
    { item: '33', category: 'odd', label: '33' },
    { item: '8', category: 'even', label: '8' },
    { item: '91', category: 'odd', label: '91' },
    { item: '64', category: 'even', label: '64' },
    { item: '5', category: 'odd', label: '5' },
  ];

  const [sortIndex, setSortIndex] = useState(0);
  const [sortScore, setSortScore] = useState(0);
  const [sortStreak, setSortStreak] = useState(0);
  const [sortFeedback, setSortFeedback] = useState<string | null>(null);

  const currSortItem = sortingItems[sortIndex % sortingItems.length];

  const handleSortItem = (bin: 'even' | 'odd') => {
    if (bin === currSortItem.category) {
      playCorrect();
      const newScore = sortScore + 10;
      setSortScore(newScore);
      setSortStreak(s => s + 1);
      saveHighScore('sorting-factory', newScore);
      setSortFeedback('Correct Bin! 📦');

      onUpdateProgress({
        ...progress,
        stars: progress.stars + 1,
        coins: progress.coins + 2,
      });
    } else {
      playIncorrect();
      setSortStreak(0);
      setSortFeedback('Oops! That went into the wrong bin.');
    }

    setTimeout(() => {
      setSortIndex(i => i + 1);
      setSortFeedback(null);
    }, 500);
  };

  // Games directory metadata
  const gamesList: Array<{ id: GameId; title: string; desc: string; icon: string; tag: string }> = [
    { id: 'balloon-pop', title: 'Balloon Pop Mania', desc: 'Pop floating balloons to solve math equations & phonetic rhymes!', icon: '🎈', tag: 'Fast Reflexes' },
    { id: 'memory-match', title: 'Memory Match Cards', desc: 'Flip pairs of math facts and phonics cards before moves run out!', icon: '🃏', tag: 'Brain Memory' },
    { id: 'star-catcher', title: 'Falling Star Catcher', desc: 'Steer your basket to catch even numbers while dodging odd ones!', icon: '⭐', tag: 'Action Arcade' },
    { id: 'flash-dash', title: 'Speed Flash Dash', desc: '30-second rapid-fire dash! Multiply streaks with quick thinking!', icon: '⚡', tag: 'Time Trial' },
    { id: 'word-builder', title: 'Word Builder Lab', desc: 'Snap phonetic letter tiles into slots to spell picture words!', icon: '🧪', tag: 'Spelling & Phonics' },
    { id: 'sorting-factory', title: 'Sorting Factory', desc: 'Sort numbers and shapes into the correct factory bins!', icon: '🏭', tag: 'Classification' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Arcade Header Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-600 text-white shadow-lg space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-white/20 uppercase tracking-wide">
                Kids Educational Arcade
              </span>
              <span className="text-xs text-rose-100 flex items-center gap-1 font-semibold">
                <Trophy className="w-3.5 h-3.5 text-amber-300" />
                6 Interactive Games
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display">
              Fun Learning Games Zone
            </h2>
            <p className="text-xs sm:text-sm text-rose-100 max-w-xl leading-relaxed">
              Level up your math, phonics, and logic skills while playing 6 engaging educational mini-games!
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center gap-3">
            <Trophy className="w-6 h-6 text-amber-300" />
            <div>
              <span className="text-[10px] uppercase font-bold text-white/80 block">Current High Score</span>
              <strong className="text-xl font-black text-white">{highScores[selectedGame] || 0} pts</strong>
            </div>
          </div>
        </div>

        {/* 6 Game Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-2">
          {gamesList.map((g) => {
            const isActive = selectedGame === g.id;
            return (
              <button
                key={g.id}
                id={`arcade-tab-${g.id}`}
                onClick={() => {
                  playClick();
                  setSelectedGame(g.id);
                }}
                className={`p-2.5 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all duration-200 text-center ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-md scale-102 font-bold ring-2 ring-white/60'
                    : 'bg-black/20 hover:bg-white/15 text-white/90 font-medium'
                }`}
              >
                <span className="text-2xl">{g.icon}</span>
                <span className="text-xs leading-tight line-clamp-1">{g.title.split(' ')[0]}</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded-md ${
                  isActive ? 'bg-purple-100 text-purple-800' : 'bg-white/10 text-white/75'
                }`}>
                  {g.tag}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* GAME 1: BALLOON POP MANIA                                                */}
      {/* ========================================================================= */}
      {selectedGame === 'balloon-pop' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-rose-500 uppercase tracking-wider">Game 1: Reflex & Math</span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-display">
                Balloon Pop Mania 🎈
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pop the balloon with the correct answer before it floats away!
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-[11px] text-slate-400 block">Score</span>
                <strong className="text-xl text-rose-600 font-black">{balloonScore}</strong>
              </div>
              <button
                onClick={() => {
                  setBalloonScore(0);
                  setBalloonIndex(0);
                  playClick();
                }}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                title="Restart"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Current Target Challenge */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/40 dark:to-pink-950/40 border border-rose-200 dark:border-rose-900/60 text-center space-y-1">
            <span className="text-xs font-extrabold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
              Target Mission
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {balloonRounds[balloonIndex % balloonRounds.length].target}
            </div>
          </div>

          {balloonFeedback && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 text-emerald-800 dark:text-emerald-200 text-xs font-bold text-center animate-in fade-in">
              {balloonFeedback}
            </div>
          )}

          {/* Floating Balloons Grid */}
          <div className="py-6 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 min-h-[220px] items-center justify-center">
            {balloonRounds[balloonIndex % balloonRounds.length].options.map((opt) => {
              const isPopped = balloonPopped === opt;
              const bgGradient = balloonRounds[balloonIndex % balloonRounds.length].color;

              return (
                <button
                  key={opt}
                  id={`balloon-btn-${opt}`}
                  onClick={() => handlePopBalloon(opt)}
                  className={`relative flex flex-col items-center justify-center transition-all duration-300 transform active:scale-95 group ${
                    isPopped ? 'scale-125 opacity-0' : 'hover:-translate-y-2'
                  }`}
                >
                  <div className={`w-24 h-28 sm:w-28 sm:h-32 rounded-[50%_50%_50%_50%_/_60%_60%_40%_40%] bg-gradient-to-b ${bgGradient} text-white shadow-lg flex items-center justify-center font-black text-2xl sm:text-3xl relative`}>
                    {/* Balloon shine highlight */}
                    <div className="absolute top-3 left-3 w-4 h-6 rounded-full bg-white/40 rotate-[-20deg]" />
                    <span>{opt}</span>
                    {/* Balloon knot */}
                    <div className="absolute -bottom-1.5 w-3 h-2 bg-rose-700/80 rounded-sm" />
                  </div>
                  {/* Balloon string */}
                  <div className="w-0.5 h-7 bg-slate-300 dark:bg-slate-700 mt-1" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* GAME 2: MEMORY MATCH FLIPPING CARDS                                      */}
      {/* ========================================================================= */}
      {selectedGame === 'memory-match' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-violet-500 uppercase tracking-wider">Game 2: Visual Memory</span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-display">
                Memory Match Cards 🃏
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Flip two cards at a time to find matching math equations and phonics words!
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-center">
                <span className="text-[11px] text-slate-400 block">Moves</span>
                <strong className="text-lg text-slate-800 dark:text-slate-100 font-bold">{memoryMoves}</strong>
              </div>
              <div className="text-center">
                <span className="text-[11px] text-slate-400 block">Matches</span>
                <strong className="text-lg text-violet-600 font-bold">{memoryMatchesCount} / {initialPairs.length}</strong>
              </div>
              <button
                onClick={resetMemoryGame}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                title="Restart"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Card Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4">
            {memoryCards.map((card) => {
              const showFace = card.isFlipped || card.isMatched;

              return (
                <button
                  key={card.id}
                  id={`memory-card-${card.id}`}
                  onClick={() => handleCardClick(card.id)}
                  disabled={card.isMatched}
                  className={`h-24 sm:h-28 rounded-2xl p-2 flex flex-col items-center justify-center font-black transition-all duration-300 transform active:scale-95 shadow-sm ${
                    showFace
                      ? card.isMatched
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 border-2 border-emerald-400 text-emerald-800 dark:text-emerald-300 scale-98'
                        : 'bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-violet-400 text-slate-400 hover:text-violet-500'
                  }`}
                >
                  {showFace ? (
                    <span className="text-lg sm:text-xl font-bold">{card.display}</span>
                  ) : (
                    <span className="text-2xl opacity-60">❓</span>
                  )}
                </button>
              );
            })}
          </div>

          {memoryMatchesCount === initialPairs.length && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 text-emerald-800 dark:text-emerald-300 text-center font-bold text-sm animate-in fade-in flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>Congratulations! All pairs matched in {memoryMoves} moves! +10 Coins</span>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* GAME 3: FALLING STAR CATCHER                                             */}
      {/* ========================================================================= */}
      {selectedGame === 'star-catcher' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">Game 3: Action Catch</span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-display">
                Falling Star Catcher ⭐
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Move your basket left & right to catch <strong>{starTargetType}</strong>!
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-rose-500">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Heart
                    key={i}
                    className={`w-5 h-5 ${i < starLives ? 'fill-rose-500' : 'opacity-30'}`}
                  />
                ))}
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-400 block">Score</span>
                <strong className="text-xl text-amber-500 font-black">{starScore}</strong>
              </div>
            </div>
          </div>

          {/* Game Canvas Area */}
          <div className="relative w-full h-72 sm:h-80 rounded-3xl bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 border-2 border-indigo-900 overflow-hidden select-none">
            {/* Background stars */}
            <div className="absolute inset-0 opacity-40 pointer-events-none text-xs text-indigo-300">
              <span className="absolute top-4 left-10">✦</span>
              <span className="absolute top-12 right-20">★</span>
              <span className="absolute top-28 left-1/3">✦</span>
              <span className="absolute top-40 right-1/4">★</span>
            </div>

            {/* Falling Star */}
            {starPos && isCatcherRunning && (
              <div
                style={{ left: `${starPos.x}%`, top: `${starPos.y}%` }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 flex flex-col items-center justify-center font-black text-sm shadow-lg ring-2 ring-amber-300/80 animate-bounce"
              >
                <span>⭐</span>
                <span className="text-[11px] font-black leading-none">{starPos.val}</span>
              </div>
            )}

            {/* Basket Avatar at Bottom */}
            <div
              style={{ left: `${catcherPos}%` }}
              className="absolute bottom-3 transform -translate-x-1/2 w-20 h-10 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white flex items-center justify-center font-bold text-xs shadow-md border-2 border-amber-300 transition-all duration-75"
            >
              🧺 Basket
            </div>

            {/* Overlay if not running */}
            {!isCatcherRunning && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center gap-3 text-white p-4 text-center">
                <span className="text-4xl">⭐</span>
                <h4 className="text-lg font-bold">
                  {starGameOver ? 'Game Over!' : 'Ready to Catch Stars?'}
                </h4>
                <p className="text-xs text-slate-300 max-w-xs">
                  {starGameOver
                    ? `Final Score: ${starScore} points! Play again to beat your record.`
                    : `Catch even numbers! Each correct catch scores +10 points.`}
                </p>
                <button
                  id="btn-start-star-catcher"
                  onClick={() => {
                    playClick();
                    setStarScore(0);
                    setStarLives(3);
                    setStarGameOver(false);
                    setIsCatcherRunning(true);
                  }}
                  className="px-6 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm shadow-lg transition"
                >
                  {starGameOver ? 'Play Again' : 'Start Game'}
                </button>
              </div>
            )}
          </div>

          {/* Basket Left & Right Control Buttons */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setCatcherPos(p => Math.max(10, p - 12))}
              disabled={!isCatcherRunning}
              className="flex items-center gap-1.5 px-6 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold text-sm hover:bg-slate-200 active:scale-95 disabled:opacity-40 transition"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Move Left</span>
            </button>
            <button
              onClick={() => setCatcherPos(p => Math.min(90, p + 12))}
              disabled={!isCatcherRunning}
              className="flex items-center gap-1.5 px-6 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold text-sm hover:bg-slate-200 active:scale-95 disabled:opacity-40 transition"
            >
              <span>Move Right</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* GAME 4: SPEED FLASH DASH                                                 */}
      {/* ========================================================================= */}
      {selectedGame === 'flash-dash' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">Game 4: 30-Sec Time Trial</span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-display">
                Speed Flash Dash ⚡
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Answer as many quick-fire questions as you can before the 30-second timer hits zero!
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-rose-600 font-black text-xl">
                <Timer className="w-5 h-5" />
                <span>{flashTimeLeft}s</span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-400 block">Score</span>
                <strong className="text-xl text-amber-500 font-black">{flashScore}</strong>
              </div>
            </div>
          </div>

          {/* Multiplier Streak indicator */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">
            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <Flame className="w-4 h-4" />
              <span>Streak: {flashStreak} in a row!</span>
            </div>
            {flashStreak >= 3 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black uppercase animate-pulse">
                2x Combo Multiplier Active! 🔥
              </span>
            )}
          </div>

          {!flashActive ? (
            <div className="p-8 rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800 text-center space-y-3">
              <div className="text-4xl">⚡</div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                {flashTimeLeft === 0 ? 'Round Finished!' : 'Ready for the 30-Second Dash?'}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm mx-auto">
                {flashTimeLeft === 0
                  ? `Awesome hustle! You scored ${flashScore} points!`
                  : 'Fast math calculations and sight words! Tap the right answer quickly to keep your streak going.'}
              </p>
              <button
                id="btn-start-flash-dash"
                onClick={startFlashDash}
                className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm shadow-md transition"
              >
                {flashTimeLeft === 0 ? 'Dash Again' : 'Start 30-Sec Dash'}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-slate-900 text-white text-center shadow-md">
                <span className="text-[11px] text-amber-400 font-bold uppercase tracking-wider block">Flashcard Question</span>
                <span className="text-3xl sm:text-4xl font-black font-display mt-1 block">
                  {flashPrompts[flashIndex % flashPrompts.length].q}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {flashPrompts[flashIndex % flashPrompts.length].opts.map((opt) => (
                  <button
                    key={opt}
                    id={`flash-opt-${opt}`}
                    onClick={() => handleFlashAnswer(opt)}
                    className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 dark:hover:bg-amber-500 text-slate-900 dark:text-white font-black text-xl shadow-xs transition active:scale-95"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* GAME 5: PHONICS WORD BUILDER LAB                                         */}
      {/* ========================================================================= */}
      {selectedGame === 'word-builder' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-teal-500 uppercase tracking-wider">Game 5: Phonics & Spelling</span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-display">
                Phonics Word Builder Lab 🧪
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tap letter tiles in order to spell the mystery word!
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-[11px] text-slate-400 block">Score</span>
                <strong className="text-xl text-teal-600 font-black">{builderScore}</strong>
              </div>
              <button
                onClick={resetWordBuilder}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                title="Reset word"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Picture and Slots Target */}
          <div className="p-6 rounded-3xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900 flex flex-col items-center justify-center gap-4">
            <span className="text-6xl filter drop-shadow">{currWordItem.emoji}</span>
            <div className="flex gap-2">
              {Array.from({ length: currWordItem.word.length }).map((_, i) => {
                const char = assembledLetters[i];
                return (
                  <div
                    key={i}
                    className="w-12 h-14 rounded-2xl border-2 border-dashed border-teal-400 bg-white dark:bg-slate-800 flex items-center justify-center font-black text-2xl text-teal-700 dark:text-teal-300 shadow-xs"
                  >
                    {char || ''}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Scrambled Tile Bank */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-500 block text-center">
              Tap letter tiles in correct sequence:
            </span>
            <div className="flex items-center justify-center gap-3">
              {availableLetters.map((l, idx) => (
                <button
                  key={`${l}-${idx}`}
                  id={`letter-tile-${l}-${idx}`}
                  onClick={() => handleAddLetter(l, idx)}
                  className="w-14 h-14 rounded-2xl bg-gradient-to-b from-teal-500 to-emerald-600 text-white font-black text-2xl shadow-md hover:scale-105 active:scale-95 transition"
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* GAME 6: SHAPE & SORTING FACTORY                                          */}
      {/* ========================================================================= */}
      {selectedGame === 'sorting-factory' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider">Game 6: Logic Sorting</span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-display">
                Shape & Sorting Factory 🏭
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sort incoming numbers into <strong>Even</strong> or <strong>Odd</strong> factory bins!
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-[11px] text-slate-400 block">Score</span>
                <strong className="text-xl text-indigo-600 font-black">{sortScore}</strong>
              </div>
            </div>
          </div>

          {/* Factory Conveyor Belt Item */}
          <div className="p-8 rounded-3xl bg-slate-900 text-white flex flex-col items-center justify-center gap-3 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Conveyor Item
            </span>
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-black text-4xl shadow-lg border-2 border-white/20 animate-pulse">
              {currSortItem.label}
            </div>
            {sortFeedback && (
              <span className="text-xs font-bold text-amber-300 animate-in fade-in">
                {sortFeedback}
              </span>
            )}
          </div>

          {/* Destination Sorting Bins */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            <button
              id="btn-sort-even-bin"
              onClick={() => handleSortItem('even')}
              className="p-6 rounded-3xl bg-gradient-to-b from-blue-50 to-indigo-100 dark:from-blue-950/40 dark:to-indigo-950/40 border-2 border-blue-300 dark:border-blue-800 hover:border-blue-500 text-center space-y-2 transition active:scale-95 group"
            >
              <div className="text-3xl group-hover:scale-110 transition">📦</div>
              <h4 className="text-lg font-black text-blue-900 dark:text-blue-200">
                EVEN BIN
              </h4>
              <p className="text-[11px] text-blue-700 dark:text-blue-300">
                Ends in 0, 2, 4, 6, 8
              </p>
            </button>

            <button
              id="btn-sort-odd-bin"
              onClick={() => handleSortItem('odd')}
              className="p-6 rounded-3xl bg-gradient-to-b from-purple-50 to-pink-100 dark:from-purple-950/40 dark:to-pink-950/40 border-2 border-purple-300 dark:border-purple-800 hover:border-purple-500 text-center space-y-2 transition active:scale-95 group"
            >
              <div className="text-3xl group-hover:scale-110 transition">📦</div>
              <h4 className="text-lg font-black text-purple-900 dark:text-purple-200">
                ODD BIN
              </h4>
              <p className="text-[11px] text-purple-700 dark:text-purple-300">
                Ends in 1, 3, 5, 7, 9
              </p>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
