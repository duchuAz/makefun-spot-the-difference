// A small seeded generator, so a picture is the same picture every time it is drawn: the stars, the
// grain in the wood and the angle of every frond come from a number the round was seeded with, and
// two runs of the same seed paint the same bytes.

/** Mulberry32: a 32-bit seed in, a repeatable stream of fractions in [0, 1) out. */
export function createRandom(seed) {
  let state = (seed >>> 0) || 0x9e3779b9;
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    /** A fraction between low and high. */
    between: (low, high) => low + next() * (high - low),
    /** A whole number from low to high, both ends included. */
    int: (low, high) => Math.floor(low + next() * (high - low + 1)),
    /** One of the list's entries. */
    pick: (list) => list[Math.floor(next() * list.length)],
    /** True one time in `n`, on average. */
    chance: (n) => next() < 1 / n,
  };
}

/** A seed from a string, so a round can be named as well as numbered. */
export function seedFrom(text) {
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}
