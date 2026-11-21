// The round as data rather than as drawing: what is hidden, what is found, how long is left and
// what the score is. Nothing here touches a canvas, so a round can be played by a test or staged by
// a screenshot exactly as a person plays it.

import { DIFFERENCES, ROUND } from './config.js';
import { idsOf, pickDifferences } from './differences.js';
import { seedFrom } from './random.js';

/** Where a round is: waiting to start, being played, paused, won, or lost to the clock. */
export const STATUS = { TITLE: 'title', PLAY: 'play', PAUSED: 'paused', CLEARED: 'cleared', OVER: 'over' };

/** The seed a round's picture is drawn from, so round 2 is always the same picture. */
export const seedForRound = (round) => seedFrom(`keeper-greenhouse-${round}`);

/** How many differences a round hides: one more each round, up to the catalogue's comfort. */
export const countForRound = (round) => Math.min(DIFFERENCES.perRound, DIFFERENCES.firstRound + round - 1);

/** A fresh game: nothing found, the clock full, waiting on the title screen. */
export function createGame(seedBase = 0) {
  const game = {
    seedBase,
    status: STATUS.TITLE,
    round: 1,
    rounds: ROUND.rounds,
    seed: seedForRound(1),
    differences: [],
    ids: new Set(),
    found: new Set(),
    secondsLeft: ROUND.seconds,
    hintsLeft: ROUND.hints,
    misses: 0,
    score: 0,
    /** True when the last round was cleared rather than lost to the clock. */
    won: false,
    /** When the last find happened, so the board can flash; the loop ages it. */
    lastFound: null,
    message: '',
  };
  return game;
}

/** Deal the round's differences and put the clock back, without changing the round number. */
export function dealRound(game, round) {
  game.round = round;
  game.seed = seedForRound(round);
  game.differences = pickDifferences(game.seed, countForRound(round), DIFFERENCES.minApart);
  game.ids = idsOf(game.differences);
  game.found = new Set();
  game.secondsLeft = ROUND.seconds;
  game.hintsLeft = ROUND.hints;
  game.misses = 0;
  game.lastFound = null;
  return game;
}

/** Start the game from the title screen. */
export function begin(game) {
  dealRound(game, 1);
  game.score = 0;
  game.won = false;
  game.status = STATUS.PLAY;
  game.message = '';
  return game;
}

/** The next round, or the end of the game when the last one is done. */
export function advance(game) {
  if (game.round >= game.rounds) {
    game.status = STATUS.OVER;
    game.won = true;
    game.message = 'Every round cleared';
    return game;
  }
  dealRound(game, game.round + 1);
  game.status = STATUS.PLAY;
  return game;
}

/** Start the round again, keeping the score: the same picture, the same differences. */
export function retry(game) {
  dealRound(game, game.round);
  game.status = STATUS.PLAY;
  return game;
}

/**
 * Run the clock. `dt` is seconds since the last tick. A round that runs out of time is lost; one
 * that finds everything is cleared, which the caller sees as STATUS.CLEARED.
 */
export function tick(game, dt) {
  if (game.status !== STATUS.PLAY) return game;
  game.secondsLeft = Math.max(0, game.secondsLeft - dt);
  if (game.secondsLeft <= 0) {
    game.status = STATUS.OVER;
    game.won = false;
    game.message = 'The clock ran out';
  }
  return game;
}

/**
 * A mark at a point in the picture. Returns 'found' with the difference, 'repeat' when it is one
 * already ringed, or 'miss' when nothing is that close. A miss costs seconds; a find scores by how
 * much of the clock is left.
 */
export function mark(game, x, y) {
  if (game.status !== STATUS.PLAY) return { result: 'ignored' };
  let nearest = null;
  let best = Infinity;
  for (const difference of game.differences) {
    if (game.found.has(difference.id)) continue;
    const distance = Math.hypot(difference.x - x, difference.y - y);
    if (distance < best) {
      best = distance;
      nearest = difference;
    }
  }
  if (nearest !== null && best <= DIFFERENCES.radius) {
    game.found.add(nearest.id);
    game.lastFound = nearest;
    const timeBonus = Math.round((game.secondsLeft / ROUND.seconds) * 60);
    game.score += 100 + timeBonus;
    game.message = nearest.label;
    if (game.found.size === game.differences.length) game.status = STATUS.CLEARED;
    return { result: 'found', difference: nearest };
  }
  if (nearest !== null && best <= DIFFERENCES.radius * 1.6 && game.found.size === game.differences.length) {
    return { result: 'repeat' };
  }
  game.misses += 1;
  game.secondsLeft = Math.max(0, game.secondsLeft - ROUND.wrongPenalty);
  if (game.secondsLeft <= 0) {
    game.status = STATUS.OVER;
    game.won = false;
    game.message = 'The clock ran out';
  }
  return { result: 'miss' };
}

/** Spend a hint: the nearest difference still hidden, or null when none is left to spend. */
export function useHint(game) {
  if (game.status !== STATUS.PLAY || game.hintsLeft <= 0) return null;
  const hidden = game.differences.filter((difference) => !game.found.has(difference.id));
  if (hidden.length === 0) return null;
  game.hintsLeft -= 1;
  game.secondsLeft = Math.max(0, game.secondsLeft - ROUND.hintPenalty);
  return hidden[0];
}

/** Pause or resume, which only a running or paused round can do. */
export function togglePause(game) {
  if (game.status === STATUS.PLAY) game.status = STATUS.PAUSED;
  else if (game.status === STATUS.PAUSED) game.status = STATUS.PLAY;
  return game;
}

/** The number still to find. */
export const remaining = (game) => game.differences.length - game.found.size;
