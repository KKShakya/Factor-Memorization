import { FactorPair, FamousNumberFact, GameMode } from './types';

export const FAMOUS_NUMBERS: FamousNumberFact[] = [
  { number: 144, description: "12² - A gross (a dozen dozen). Highly composite number.", factorPairs: [] },
  { number: 156, description: "12 × 13 - A beautiful pronic number (multiplication of adjacent integers).", factorPairs: [] },
  { number: 169, description: "13² - Perfect square of the prime number 13.", factorPairs: [] },
  { number: 182, description: "13 × 14 - Pronica/oblong number.", factorPairs: [] },
  { number: 196, description: "14² - Perfect square of 14.", factorPairs: [] },
  { number: 210, description: "14 × 15 - Multi-composite number, product of four consecutive primes (2×3×5×7).", factorPairs: [] },
  { number: 225, description: "15² - Perfect square of 15, key angle-relative number.", factorPairs: [] },
  { number: 240, description: "15 × 16 - Highly composite number with 20 distinct divisors.", factorPairs: [] },
  { number: 256, description: "16² - 2⁸ (Perfect power of 2). Essential in computer science (one byte).", factorPairs: [] },
  { number: 272, description: "16 × 17 - Pronica number.", factorPairs: [] },
  { number: 289, description: "17² - Perfect square of the prime number 17.", factorPairs: [] },
  { number: 324, description: "18² - Perfect square of 18.", factorPairs: [] },
  { number: 338, description: "13 × 26 - Twice 169. Notable double square composite.", factorPairs: [] },
  { number: 361, description: "19² - Perfect square of the prime number 19.", factorPairs: [] },
  { number: 400, description: "20² - Perfect square of 20.", factorPairs: [] },
  { number: 600, description: "24 × 25 - Highly composite base centenary value.", factorPairs: [] },
  { number: 625, description: "25² - Perfect square of 25. 5⁴.", factorPairs: [] },
  { number: 1024, description: "32² - 2¹⁰ (Perfect power of 2). Famous in computing as 1 Kibi.", factorPairs: [] },
  { number: 72, description: "8 × 9 - Highly composite number. Base of many ancient measuring systems.", factorPairs: [] },
  { number: 108, description: "9 × 12 - Sacred number in many Eastern philosophies, elegant highly composite.", factorPairs: [] },
  { number: 192, description: "12 × 16 - Highly composite number, base binary digital value.", factorPairs: [] }
  , { number: 180, description: "15*12", factorPairs: [] },
  { number: 216, description: "72*3", factorPairs: [] },
  { number: 1008, description: "56*18", factorPairs: [] },
];

// Calculate factor pairs excluding 1 and the number itself
export function getFactorPairs(num: number): FactorPair[] {
  const result: FactorPair[] = [];
  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) {
      result.push({ f1: i, f2: num / i });
    }
  }
  // Sort them by first factor
  return result.sort((a, b) => a.f1 - b.f1);
}

// Populate the helper's factorPairs statically but can also be dynamic
FAMOUS_NUMBERS.forEach(item => {
  item.factorPairs = getFactorPairs(item.number);
});

export function generateTarget(mode: GameMode, lastTarget?: number): { target: number; hintFacts?: string; factorPairs: FactorPair[] } {
  let target = 0;
  let hintFacts = "";

  const richComposites = [
    48, 60, 64, 72, 80, 84, 90, 96, 100, 108, 120, 132, 140, 144, 150, 160, 168, 180, 192, 200,
    216, 220, 240, 250, 252, 270, 280, 288, 300, 320, 330, 360, 384, 400, 420, 432, 450, 480, 500, 540, 560, 576, 600,
    720, 800, 840, 900, 960, 1000
  ];

  let attemptsToAvoidRepeat = 0;
  while (attemptsToAvoidRepeat < 15) {
    if (mode === 'tables') {
      // Confined to only tables from 13-29 and multiplier 2 to 9. Smallest: 26, largest: 261.
      const base = Math.floor(Math.random() * (29 - 13 + 1)) + 13; // 13 to 29
      const multiplier = Math.floor(Math.random() * (9 - 2 + 1)) + 2; // 2 to 9
      target = base * multiplier;
      hintFacts = `Product from tables: ${base} × ${multiplier}.`;
    } else if (mode === 'famous') {
      // Famous Mode gets the structured mathematical subsets explicitly requested
      const r = Math.random();
      if (r < 0.20) {
        // Pronic numbers from n = 11 to 19
        const n = Math.floor(Math.random() * 9) + 11; // 11 to 19
        target = n * (n + 1);
        hintFacts = `Pronic Sequence: Multiplication of adjacent values ${n} × ${n + 1}.`;
      } else if (r < 0.40) {
        // Squares up to 100 (where baseline n is up to 100)
        const n = Math.floor(Math.random() * 97) + 4; // 4 to 100
        target = n * n;
        hintFacts = `Perfect Square Sequence: ${n} × ${n} (${n}²).`;
      } else if (r < 0.55) {
        // Cubes up to 30 (n up to 30)
        const n = Math.floor(Math.random() * 28) + 3; // 3 to 30
        target = n * n * n;
        hintFacts = `Perfect Cube Sequence: ${n}³ (${n} × ${n * n}).`;
      } else if (r < 0.70) {
        // n * 2n where n = 12 to 17
        const n = Math.floor(Math.random() * 6) + 12; // 12 to 17
        target = n * (2 * n);
        hintFacts = `Double factors ratio: product of ${n} × ${2 * n}.`;
      } else if (r < 0.85) {
        // Standard static curation
        const item = FAMOUS_NUMBERS[Math.floor(Math.random() * FAMOUS_NUMBERS.length)];
        target = item.number;
        hintFacts = item.description;
      } else {
        // More random composite numbers like 192, 144, 180, etc.
        target = richComposites[Math.floor(Math.random() * richComposites.length)];
        hintFacts = `Highly divisible system target with multiple valid factor solutions.`;
      }
    } else {
      // Challenge Mode - comprehensive high-end composite gymnastics mix
      const mix = Math.random();
      if (mix < 0.20) {
        const n = Math.floor(Math.random() * 9) + 11; // 11 to 19
        target = n * (n + 1);
        hintFacts = `Adjacent integers multiplication: ${n} × ${n + 1}.`;
      } else if (mix < 0.40) {
        const n = Math.floor(Math.random() * 97) + 4; // 4 to 100
        target = n * n;
        hintFacts = `Square sequence: perfect square ${n}².`;
      } else if (mix < 0.55) {
        const n = Math.floor(Math.random() * 28) + 3; // 3 to 30
        target = n * n * n;
        hintFacts = `Cube sequence: perfect cube ${n}³.`;
      } else if (mix < 0.70) {
        const n = Math.floor(Math.random() * 6) + 12; // 12 to 17
        target = n * (2 * n);
        hintFacts = `Double factor balancing ratio: ${n} × ${2 * n}.`;
      } else if (mix < 0.85) {
        target = richComposites[Math.floor(Math.random() * richComposites.length)];
        hintFacts = `Divisible mathematical target from rich collection.`;
      } else {
        let found = false;
        let attempts = 0;
        while (!found && attempts < 100) {
          const potential = Math.floor(Math.random() * 901) + 40; // 40 to 940
          const factors = getFactorPairs(potential);
          if (factors.length > 0) {
            target = potential;
            found = true;
            hintFacts = `Solve factors for composite value.`;
          }
          attempts++;
        }
        if (!found) target = 180;
      }
    }

    if (lastTarget === undefined || target !== lastTarget) {
      break;
    }
    attemptsToAvoidRepeat++;
  }

  // Get factor pairs
  const factorPairs = getFactorPairs(target);

  return {
    target,
    hintFacts,
    factorPairs
  };
}

export function isPrime(num: number): boolean {
  if (num <= 1) return false;
  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) return false;
  }
  return true;
}

export function getPrimeFactorization(num: number): number[] {
  const factors: number[] = [];
  let d = 2;
  let temp = num;
  while (temp > 1) {
    while (temp % d === 0) {
      factors.push(d);
      temp /= d;
    }
    d++;
    if (d * d > temp) {
      if (temp > 1) {
        factors.push(temp);
      }
      break;
    }
  }
  return factors.sort((a, b) => a - b);
}
