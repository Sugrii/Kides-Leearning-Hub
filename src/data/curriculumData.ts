import { Exercise } from '../types';
import { MATH_EXERCISES } from './mathQuestions';
import { ENGLISH_EXERCISES } from './englishQuestions';

export { MATH_EXERCISES, ENGLISH_EXERCISES };

export const EXERCISES: Exercise[] = [
  ...MATH_EXERCISES,
  ...ENGLISH_EXERCISES,
];
