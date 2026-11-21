// The four scenes the screenshots are taken of, staged rather than played: each one deals a round,
// rings the differences it says are found, and puts the crosshair and the hint where the frame
// wants them. A scene is a pure function of the round it names, so the same screenshot is the same
// frame every time it is taken, and every frame is the real board a player sees.

import { DIFFERENCES } from './config.js';
import { idsOf, pickDifferences } from './differences.js';
import { STATUS, countForRound, seedForRound } from './state.js';

/**
 * The scenes, by the name in the page's `?shot=`:
 *   play     a round in progress: three ringed, the rest still hidden, the crosshair on the hunt
 *   start    the title card over the board
 *   hint     a hint's pulse on a difference not yet found, more of the round ringed
 *   cleared  every difference ringed, the round cleared
 */
export const SHOTS = {
  play: { round: 2, found: 3, secondsLeft: 104, score: 640, cursor: { panel: 1, x: 366, y: 118 } },
  start: { round: 1, found: 0, secondsLeft: 150, score: 0, title: true, cursor: { panel: 0, x: 304, y: 200 } },
  hint: { round: 3, found: 5, secondsLeft: 61, score: 1480, hintAge: 0.34, cursor: { panel: 0, x: 205, y: 236 } },
  cleared: { round: 3, found: -1, secondsLeft: 44, score: 2210, cleared: true, cursor: { panel: 1, x: 420, y: 210 } },
};

/** Whether a name is one of the staged scenes. */
export const isShot = (name) => Object.hasOwn(SHOTS, name);

/**
 * Put `game` and the crosshair into the named scene and say what is left to draw over the board:
 * `{ hint }`, the pulse to show, or null. The scene sets the game's own status, so the frame the
 * screenshot captures is the frame the game would really paint. `found` counts the differences to
 * ring, or -1 for all of them.
 */
export function stageShot(name, game, input) {
  const shot = SHOTS[name] ?? SHOTS.play;
  const seed = seedForRound(shot.round);
  const differences = pickDifferences(seed, countForRound(shot.round), DIFFERENCES.minApart);

  game.round = shot.round;
  game.seed = seed;
  game.differences = differences;
  game.ids = idsOf(differences);
  game.found = new Set();
  game.secondsLeft = shot.secondsLeft;
  game.score = shot.score;
  game.hintsLeft = 1;
  game.misses = 0;
  game.message = '';
  game.status = STATUS.PLAY;

  const ringed = shot.found === -1 ? differences.length : shot.found;
  for (let index = 0; index < ringed; index += 1) game.found.add(differences[index].id);

  input.place(shot.cursor.panel, shot.cursor.x, shot.cursor.y);

  if (shot.title) {
    game.status = STATUS.TITLE;
    return { hint: null };
  }
  if (shot.cleared) {
    game.status = STATUS.CLEARED;
    return { hint: null };
  }
  const hidden = differences.find((difference) => !game.found.has(difference.id));
  return { hint: shot.hintAge === undefined || hidden === undefined ? null : { x: hidden.x, y: hidden.y, age: shot.hintAge } };
}
