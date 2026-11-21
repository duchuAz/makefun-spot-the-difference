// The catalogue of differences a round can hide, and the rule that picks which ones a round uses.
//
// Each entry names the one thing scene.js paints differently, where in the picture it sits, and what
// to call it: the label is what the game says when you find it, and it is the name a reader of the
// source sees first. A round picks its differences so their spots are far enough apart that no ring
// covers another, which also keeps two changes from landing on the same lamp or the same pane.

import { CAN, FERN, LANTERN, PICTURE, RUG, SHELF, WINDOW } from './config.js';
import { createRandom } from './random.js';

/** The glass the night shows through, which the window's differences are placed inside. */
const GLASS = { x: WINDOW.x, y: WINDOW.y, width: WINDOW.width, height: WINDOW.height };

/** The catalogue: id, where it is, what to call it, and how hard it is to spot (1 easy, 3 subtle). */
export const CATALOGUE = [
  { id: 'lantern-out', x: LANTERN.x, y: LANTERN.cordLength + 32, label: 'The lantern is out', tier: 1 },
  { id: 'lantern-green', x: LANTERN.x, y: LANTERN.cordLength + 32, label: 'The lantern burns green', tier: 2 },
  { id: 'lantern-smoke', x: LANTERN.x + 4, y: 18, label: 'A wisp of smoke', tier: 3 },
  { id: 'moon-phase', x: GLASS.x + GLASS.width * 0.68, y: GLASS.y + 74, label: 'The moon is a crescent', tier: 1 },
  { id: 'bright-star', x: GLASS.x + GLASS.width * 0.20, y: GLASS.y + 52, label: 'A bright star is missing', tier: 2 },
  { id: 'cottage-dark', x: GLASS.x + GLASS.width * 0.80 + 8, y: GLASS.y + GLASS.height * 0.78 - 6, label: 'The cottage window is dark', tier: 2 },
  { id: 'pane-crack', x: GLASS.x + GLASS.width * 0.46, y: GLASS.y + GLASS.height * 0.26, label: 'A pane is cracked', tier: 3 },
  { id: 'moth-spots', x: PICTURE.x + PICTURE.width / 2, y: PICTURE.y + PICTURE.height / 2, label: 'The moth has more spots', tier: 3 },
  { id: 'jar-colour', x: SHELF.x + 54, y: SHELF.y - 21, label: 'A jar holds something pink', tier: 2 },
  { id: 'third-jar', x: SHELF.x + 88, y: SHELF.y - 15, label: 'The third jar is gone', tier: 1 },
  { id: 'leaning-book', x: SHELF.x + SHELF.width - 18, y: SHELF.y - 20, label: 'A book leans over', tier: 2 },
  { id: 'cushion', x: 348, y: 233, label: 'The cushion changed colour', tier: 2 },
  { id: 'cat-tail', x: 556, y: 192, label: 'The cat\u2019s tail is up', tier: 2 },
  { id: 'cat-awake', x: 480, y: 214, label: 'The cat has opened its eyes', tier: 3 },
  { id: 'fern-frond', x: FERN.potX + FERN.potWidth / 2, y: FERN.potY - 46, label: 'The fern lost two fronds', tier: 2 },
  { id: 'fern-bloom', x: FERN.potX + FERN.potWidth / 2, y: FERN.potY - 56, label: 'The fern flower is pink', tier: 2 },
  { id: 'can-spout', x: CAN.x + CAN.width / 2, y: CAN.y + 20, label: 'The watering can faces the other way', tier: 1 },
  { id: 'rug-motif', x: RUG.x + 176, y: RUG.y + RUG.height / 2, label: 'A rug motif is teal', tier: 3 },
];

/** The catalogue by id, for reading a label back. */
export const BY_ID = new Map(CATALOGUE.map((entry) => [entry.id, entry]));

/**
 * The differences a round hides: `count` of the catalogue, spread out so no two rings overlap and
 * the easy ones do not all come first. The round's seed decides which, so a round is repeatable.
 */
export function pickDifferences(seed, count, minApart) {
  const random = createRandom(seed ^ 0x7f4a7c15);
  const pool = CATALOGUE.slice();
  // Shuffle, then take in turn any that is far enough from everything taken, easiest tier first only
  // when the shuffle alone cannot fill the round.
  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random.next() * (index + 1));
    [pool[index], pool[swap]] = [pool[swap], pool[index]];
  }
  const chosen = [];
  const farEnough = (entry) => chosen.every((taken) => Math.hypot(taken.x - entry.x, taken.y - entry.y) >= minApart);
  for (const entry of pool) {
    if (chosen.length === count) break;
    if (farEnough(entry)) chosen.push(entry);
  }
  // A round always fills: if the spacing left room, relax it and take the rest in catalogue order.
  if (chosen.length < count) {
    for (const entry of CATALOGUE) {
      if (chosen.length === count) break;
      if (!chosen.includes(entry)) chosen.push(entry);
    }
  }
  return chosen.sort((a, b) => a.y - b.y || a.x - b.x);
}

/** The ids of a round's differences, which is what the two panels are painted with. */
export const idsOf = (differences) => new Set(differences.map((entry) => entry.id));
