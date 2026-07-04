// Seedable PRNG — mulberry32. Deterministic for tests and daily challenges.

export type Rng = () => number;

export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Random integer in [min, max] inclusive. */
export function randInt(rng: Rng, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

/** Pick a random element from a non-empty array. */
export function pick<T>(rng: Rng, arr: readonly T[]): T {
  const item = arr[Math.floor(rng() * arr.length)];
  if (item === undefined) throw new Error('pick: empty array');
  return item;
}

/** Default non-deterministic rng for gameplay. */
export const defaultRng: Rng = Math.random;
