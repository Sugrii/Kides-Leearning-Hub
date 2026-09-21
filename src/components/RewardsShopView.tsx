import React from 'react';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  Star, 
  Award, 
  Check, 
  Lock, 
  CheckCircle2, 
  Flame, 
  Calculator, 
  BookOpen, 
  GraduationCap, 
  Trophy 
} from 'lucide-react';
import { StudentProgress, Companion, Badge } from '../types';
import { COMPANIONS, INITIAL_BADGES } from '../data/rewardData';
import { useSound } from '../hooks/useSound';

interface RewardsShopViewProps {
  progress: StudentProgress;
  onUpdateProgress: (updated: StudentProgress) => void;
  soundEnabled: boolean;
}

export const RewardsShopView: React.FC<RewardsShopViewProps> = ({
  progress,
  onUpdateProgress,
  soundEnabled,
}) => {
  const { playCoin, playCorrect, playClick } = useSound(soundEnabled);

  const handleUnlockCompanion = (companion: Companion) => {
    if (progress.coins < companion.cost) return;

    playCoin();
    setTimeout(playCorrect, 200);
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });

    onUpdateProgress({
      ...progress,
      coins: progress.coins - companion.cost,
      unlockedCompanionIds: [...progress.unlockedCompanionIds, companion.id],
      equippedCompanionId: companion.id,
    });
  };

  const handleEquipCompanion = (id: string) => {
    playClick();
    onUpdateProgress({
      ...progress,
      equippedCompanionId: id,
    });
  };

  const renderBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Flame': return <Flame className="w-5 h-5 text-amber-500" />;
      case 'Calculator': return <Calculator className="w-5 h-5 text-blue-500" />;
      case 'BookOpen': return <BookOpen className="w-5 h-5 text-emerald-500" />;
      case 'GraduationCap': return <GraduationCap className="w-5 h-5 text-indigo-500" />;
      case 'Trophy': return <Trophy className="w-5 h-5 text-yellow-500" />;
      default: return <Sparkles className="w-5 h-5 text-purple-500" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Wallet Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white shadow-md flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-100">
            Sparkle Bank & Trophy Room
          </span>
          <h2 className="text-xl sm:text-2xl font-black font-display">
            Adopt Companions & Wear Badges
          </h2>
          <p className="text-xs text-amber-50/90 max-w-md">
            Solve math and English challenges to earn coins. Unlock magical friends with passive learning boosts!
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center gap-2 text-sm sm:text-base font-bold">
            <Sparkles className="w-5 h-5 text-yellow-300" />
            <span>{progress.coins} Coins</span>
          </div>
          <div className="px-4 py-2 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center gap-2 text-sm sm:text-base font-bold">
            <Star className="w-5 h-5 text-yellow-300 fill-yellow-300" />
            <span>{progress.stars} Stars</span>
          </div>
        </div>
      </div>

      {/* Companions Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>🐾</span>
            <span>Learning Companions</span>
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {progress.unlockedCompanionIds.length} of {COMPANIONS.length} adopted
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {COMPANIONS.map((companion) => {
            const isUnlocked = progress.unlockedCompanionIds.includes(companion.id);
            const isEquipped = progress.equippedCompanionId === companion.id;
            const canAfford = progress.coins >= companion.cost;

            return (
              <div
                key={companion.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  isEquipped
                    ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 ring-2 ring-indigo-500/30'
                    : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-3xl shadow-xs">
                      {companion.emoji}
                    </div>
                    {isEquipped ? (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-600 text-white flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>Equipped</span>
                      </span>
                    ) : isUnlocked ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        Adopted
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        <span>{companion.cost} 🪙</span>
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {companion.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {companion.description}
                    </p>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{companion.perk}</span>
                  </div>
                </div>

                {/* Action button */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  {isUnlocked ? (
                    <button
                      id={`btn-equip-${companion.id}`}
                      onClick={() => handleEquipCompanion(companion.id)}
                      disabled={isEquipped}
                      className={`w-full py-2 rounded-xl text-xs font-bold transition ${
                        isEquipped
                          ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-default'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                      }`}
                    >
                      {isEquipped ? 'Currently Accompanying' : 'Equip Companion'}
                    </button>
                  ) : (
                    <button
                      id={`btn-unlock-${companion.id}`}
                      onClick={() => handleUnlockCompanion(companion)}
                      disabled={!canAfford}
                      className={`w-full py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        canAfford
                          ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <span>Adopt for {companion.cost}</span>
                      <Sparkles className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Badges & Achievements Section */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          <span>Earned Learning Badges</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {INITIAL_BADGES.map((badge) => {
            const isUnlocked = progress.unlockedBadgeIds.includes(badge.id);

            return (
              <div
                key={badge.id}
                className={`p-3.5 rounded-2xl border transition flex items-start gap-3 ${
                  isUnlocked
                    ? 'border-amber-200 dark:border-amber-900/50 bg-amber-50/30 dark:bg-amber-950/20'
                    : 'border-slate-200/60 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 opacity-60'
                }`}
              >
                <div className={`p-2.5 rounded-xl flex-shrink-0 ${
                  isUnlocked 
                    ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-600' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                }`}>
                  {renderBadgeIcon(badge.iconName)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {badge.name}
                    </h4>
                    {isUnlocked && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    {badge.description}
                  </p>
                  <span className="inline-block text-[10px] font-semibold text-slate-400 mt-1">
                    Goal: {badge.requirement}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
