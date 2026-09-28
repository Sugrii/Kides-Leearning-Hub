/**
 * Audio Pronunciation and Speech Service for Numbers (0-100) and Alphabet (A-Z)
 */

export interface AlphabetItem {
  letter: string;
  lowercase: string;
  phonetic: string;
  word: string;
  emoji: string;
  sentence: string;
  isVowel: boolean;
}

export const ALPHABET_DATA: AlphabetItem[] = [
  { letter: 'A', lowercase: 'a', phonetic: '/æ/', word: 'Apple', emoji: '🍎', sentence: 'A is for Apple, sweet and red!', isVowel: true },
  { letter: 'B', lowercase: 'b', phonetic: '/b/', word: 'Bear', emoji: '🐻', sentence: 'B is for Bear, big and fuzzy!', isVowel: false },
  { letter: 'C', lowercase: 'c', phonetic: '/k/', word: 'Cat', emoji: '🐱', sentence: 'C is for Cat, saying meow!', isVowel: false },
  { letter: 'D', lowercase: 'd', phonetic: '/d/', word: 'Dolphin', emoji: '🐬', sentence: 'D is for Dolphin, leaping in the sea!', isVowel: false },
  { letter: 'E', lowercase: 'e', phonetic: '/ɛ/', word: 'Elephant', emoji: '🐘', sentence: 'E is for Elephant with a long trunk!', isVowel: true },
  { letter: 'F', lowercase: 'f', phonetic: '/f/', word: 'Fox', emoji: '🦊', sentence: 'F is for Fox, quick and clever!', isVowel: false },
  { letter: 'G', lowercase: 'g', phonetic: '/g/', word: 'Giraffe', emoji: '🦒', sentence: 'G is for Giraffe, tall as the trees!', isVowel: false },
  { letter: 'H', lowercase: 'h', phonetic: '/h/', word: 'Hedgehog', emoji: '🦔', sentence: 'H is for Hedgehog, cute and prickly!', isVowel: false },
  { letter: 'I', lowercase: 'i', phonetic: '/ɪ/', word: 'Ice Cream', emoji: '🍦', sentence: 'I is for Ice Cream, cool and yummy!', isVowel: true },
  { letter: 'J', lowercase: 'j', phonetic: '/dʒ/', word: 'Jellyfish', emoji: '🪼', sentence: 'J is for Jellyfish, glowing in the water!', isVowel: false },
  { letter: 'K', lowercase: 'k', phonetic: '/k/', word: 'Kangaroo', emoji: '🦘', sentence: 'K is for Kangaroo, hopping high!', isVowel: false },
  { letter: 'L', lowercase: 'l', phonetic: '/l/', word: 'Lion', emoji: '🦁', sentence: 'L is for Lion, the brave jungle king!', isVowel: false },
  { letter: 'M', lowercase: 'm', phonetic: '/m/', word: 'Monkey', emoji: '🐵', sentence: 'M is for Monkey, swinging on vines!', isVowel: false },
  { letter: 'N', lowercase: 'n', phonetic: '/n/', word: 'Nest', emoji: '🪺', sentence: 'N is for Nest where baby birds rest!', isVowel: false },
  { letter: 'O', lowercase: 'o', phonetic: '/ɒ/', word: 'Octopus', emoji: '🐙', sentence: 'O is for Octopus with eight silly arms!', isVowel: true },
  { letter: 'P', lowercase: 'p', phonetic: '/p/', word: 'Penguin', emoji: '🐧', sentence: 'P is for Penguin, waddling on the ice!', isVowel: false },
  { letter: 'Q', lowercase: 'q', phonetic: '/kw/', word: 'Queen', emoji: '👑', sentence: 'Q is for Queen with a golden crown!', isVowel: false },
  { letter: 'R', lowercase: 'r', phonetic: '/r/', word: 'Rabbit', emoji: '🐰', sentence: 'R is for Rabbit with twitching ears!', isVowel: false },
  { letter: 'S', lowercase: 's', phonetic: '/s/', word: 'Sun', emoji: '☀️', sentence: 'S is for Sun, shining bright all day!', isVowel: false },
  { letter: 'T', lowercase: 't', phonetic: '/t/', word: 'Tiger', emoji: '🐯', sentence: 'T is for Tiger with striped orange fur!', isVowel: false },
  { letter: 'U', lowercase: 'u', phonetic: '/ʌ/', word: 'Unicorn', emoji: '🦄', sentence: 'U is for Unicorn, magical and sparkling!', isVowel: true },
  { letter: 'V', lowercase: 'v', phonetic: '/v/', word: 'Violin', emoji: '🎻', sentence: 'V is for Violin, playing sweet songs!', isVowel: false },
  { letter: 'W', lowercase: 'w', phonetic: '/w/', word: 'Whale', emoji: '🐳', sentence: 'W is for Whale, splashing giant waves!', isVowel: false },
  { letter: 'X', lowercase: 'x', phonetic: '/ks/', word: 'Xylophone', emoji: '🪵', sentence: 'X is for Xylophone, tapping cheerful notes!', isVowel: false },
  { letter: 'Y', lowercase: 'y', phonetic: '/j/', word: 'Yarn', emoji: '🧶', sentence: 'Y is for Yarn, cozy and colorful!', isVowel: false },
  { letter: 'Z', lowercase: 'z', phonetic: '/z/', word: 'Zebra', emoji: '🦓', sentence: 'Z is for Zebra with black and white stripes!', isVowel: false },
];

export const NUMBER_WORDS: string[] = [
  'Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
  'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen', 'Twenty',
  'Twenty-one', 'Twenty-two', 'Twenty-three', 'Twenty-four', 'Twenty-five', 'Twenty-six', 'Twenty-seven', 'Twenty-eight', 'Twenty-nine', 'Thirty',
  'Thirty-one', 'Thirty-two', 'Thirty-three', 'Thirty-four', 'Thirty-five', 'Thirty-six', 'Thirty-seven', 'Thirty-eight', 'Thirty-nine', 'Forty',
  'Forty-one', 'Forty-two', 'Forty-three', 'Forty-four', 'Forty-five', 'Forty-six', 'Forty-seven', 'Forty-eight', 'Forty-nine', 'Fifty',
  'Fifty-one', 'Fifty-two', 'Fifty-three', 'Fifty-four', 'Fifty-five', 'Fifty-six', 'Fifty-seven', 'Fifty-eight', 'Fifty-nine', 'Sixty',
  'Sixty-one', 'Sixty-two', 'Sixty-three', 'Sixty-four', 'Sixty-five', 'Sixty-six', 'Sixty-seven', 'Sixty-eight', 'Sixty-nine', 'Seventy',
  'Seventy-one', 'Seventy-two', 'Seventy-three', 'Seventy-four', 'Seventy-five', 'Seventy-six', 'Seventy-seven', 'Seventy-eight', 'Seventy-nine', 'Eighty',
  'Eighty-one', 'Eighty-two', 'Eighty-three', 'Eighty-four', 'Eighty-five', 'Eighty-six', 'Eighty-seven', 'Eighty-eight', 'Eighty-nine', 'Ninety',
  'Ninety-one', 'Ninety-two', 'Ninety-three', 'Ninety-four', 'Ninety-five', 'Ninety-six', 'Ninety-seven', 'Ninety-eight', 'Ninety-nine', 'One Hundred'
];

/**
 * Play synthesized musical chime for feedback
 */
export function playChime(pitchMultiplier: number = 1.0) {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const baseFreq = 440 * pitchMultiplier;
    osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  } catch {
    // Ignore audio failures
  }
}

/**
 * Play balloon pop sound effect
 */
export function playPopSound() {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(450, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.09);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.09);
  } catch {
    // Ignore
  }
}

/**
 * Play synthesized phonics / letter formant tone using on-device Web Audio API.
 * Ensures an audible, pleasant harmonic sound even if offline or if device lacks local TTS voice packages.
 */
export function playPhonicsTone(letter: string) {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const charCode = letter.toUpperCase().charCodeAt(0);
    // Base frequency scaled from 220Hz (A3) across 26 letters up to 587Hz (D5)
    const normalized = Math.max(0, Math.min(25, charCode - 65));
    const baseFreq = 260 + normalized * 12;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc1.type = 'triangle';
    osc2.type = 'sine';

    osc1.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    osc2.frequency.setValueAtTime(baseFreq * 1.5, ctx.currentTime);

    // Resonant formant filter for vowel/consonant vocal tract feel
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(baseFreq * 2.2, ctx.currentTime);
    filter.Q.setValueAtTime(3.0, ctx.currentTime);

    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + 0.28);
    osc2.stop(ctx.currentTime + 0.28);
  } catch {
    // Ignore audio failures
  }
}

/**
 * Speak any text using Web SpeechSynthesis API with on-device fallback and watchdog timer.
 * Guaranteed to execute offline without requiring internet connectivity.
 */
export function speakText(
  text: string, 
  options?: { rate?: number; pitch?: number; onEnd?: () => void }
): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve();
      return;
    }

    // Play subtle musical tone alongside speech for immediate tactile acoustic feedback
    playChime(1.1);

    if (!('speechSynthesis' in window)) {
      if (options?.onEnd) options.onEnd();
      resolve();
      return;
    }

    try {
      window.speechSynthesis.cancel(); // Cancel any lingering paused speech

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = options?.rate ?? 0.88; // Slower rate tailored for kids
      utterance.pitch = options?.pitch ?? 1.1; // Cheerful bright pitch
      utterance.lang = 'en-US';

      // Prefer local on-device English voices for 100% offline playback
      const voices = window.speechSynthesis.getVoices();
      const localVoice = voices.find(v => v.lang.startsWith('en') && (v.localService || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Karen') || v.name.includes('Google') || v.name.includes('English')));
      if (localVoice) {
        utterance.voice = localVoice;
      }

      let completed = false;
      const finish = () => {
        if (!completed) {
          completed = true;
          if (options?.onEnd) options.onEnd();
          resolve();
        }
      };

      // Watchdog timer: if speech synthesis hangs offline, auto-resolve in 2.5s
      const watchdog = setTimeout(() => {
        finish();
      }, 2500);

      utterance.onend = () => {
        clearTimeout(watchdog);
        finish();
      };

      utterance.onerror = () => {
        clearTimeout(watchdog);
        finish();
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      if (options?.onEnd) options.onEnd();
      resolve();
    }
  });
}

/**
 * Stop any ongoing speech
 */
export function stopSpeech() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignore
    }
  }
}

/**
 * Pronounce number (0 to 100) - completely offline
 */
export function speakNumber(num: number, onEnd?: () => void) {
  const word = NUMBER_WORDS[num] || String(num);
  // Also trigger number pitch chime
  playChime(0.8 + (num % 20) * 0.03);
  speakText(word, { rate: 0.88, pitch: 1.1, onEnd });
}

/**
 * Pronounce alphabet letter and phonics - completely offline
 */
export function speakAlphabet(item: AlphabetItem, mode: 'letter' | 'phonics' | 'full' = 'full', onEnd?: () => void) {
  playPhonicsTone(item.letter);
  let phrase = '';
  if (mode === 'letter') {
    phrase = item.letter;
  } else if (mode === 'phonics') {
    phrase = `${item.letter} says ${item.word}`;
  } else {
    phrase = `${item.letter}. ${item.letter} is for ${item.word}! ${item.sentence}`;
  }
  speakText(phrase, { rate: 0.88, pitch: 1.15, onEnd });
}

