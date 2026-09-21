export type SubjectType = 'math' | 'english';

export type AgeGroup = '5-6' | '7-8' | '9-11';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export type ExerciseType = 
  | 'multiple-choice'
  | 'word-scramble'
  | 'math-balance'
  | 'pattern-complete'
  | 'fill-blank'
  | 'picture-match';

export interface Exercise {
  id: string;
  subject: SubjectType;
  ageGroup: AgeGroup;
  difficulty: DifficultyLevel;
  curriculumTopic: string;
  question: string;
  instruction?: string;
  options?: string[];
  correctAnswer: string | number | string[];
  hint: string;
  explanation: string;
  visualAid?: {
    type: 'icons' | 'equation' | 'letters' | 'shape';
    content: string[];
  };
  points: number;
}

export interface StudentProgress {
  stars: number;
  coins: number;
  streakDays: number;
  lastActiveDate: string;
  completedExerciseIds: string[];
  accuracyBySubject: {
    math: { attempted: number; correct: number };
    english: { attempted: number; correct: number };
  };
  equippedCompanionId: string;
  unlockedCompanionIds: string[];
  unlockedBadgeIds: string[];
  dailyMinutesSpent: number;
}

export interface Companion {
  id: string;
  name: string;
  cost: number;
  emoji: string;
  description: string;
  perk: string;
  color: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  iconName: string;
  requirement: string;
  isUnlocked: boolean;
  unlockedAt?: string;
  category: 'streak' | 'math' | 'english' | 'mastery';
}

export interface ParentSettings {
  pin: string;
  dailyScreenLimitMinutes: number;
  subjectFocus: 'all' | 'math' | 'english';
  ageGroupOverride: AgeGroup | 'adaptive';
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  parentEmail: string;
  e2eEncryptionEnabled: boolean;
  consentSignedDate: string;
}

export interface ClassroomAssignment {
  id: string;
  title: string;
  subject: SubjectType;
  ageGroup: AgeGroup;
  dueDate: string;
  targetExercisesCount: number;
  status: 'assigned' | 'in-progress' | 'completed';
  googleClassroomId: string;
  averageScore?: number;
}

export interface ClassroomStudent {
  id: string;
  name: string;
  email: string;
  avatar: string;
  mathProficiency: number;
  englishProficiency: number;
  lastSynced: string;
  status: 'Active' | 'Needs Attention' | 'Excelling';
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'urgent' | 'assignment' | 'streak' | 'reward';
  timestamp: string;
  isRead: boolean;
}

export type AppView = 
  | 'learn'
  | 'counting-alphabet'
  | 'games'
  | 'puzzles'
  | 'rewards'
  | 'parent-dashboard'
  | 'classroom'
  | 'privacy';
