// Boot and the one loop. The page is a fixed 1280 by 480 canvas, scaled to fit the window with its
// proportions kept, so the game is the same picture at any size. The loop reads input once a frame,
// runs the round's clock in real seconds, and paints: the board, then the strip along the top, then
// whichever screen is up.
//
// ?seed=N picks a different set of pictures. ?shot=play|start|hint|cleared stages that scene, paints
// it twice and sets window.__shotReady, which is how the entry's screenshots are taken.

import { CANVAS } from './config.js';
import { createAudio } from './audio.js';
import { createInput } from './input.js';
import { drawBoard } from './panels.js';
import { drawHud } from './hud.js';
import { drawCleared, drawOver, drawPaused, drawTitle } from './screens.js';
import { isShot, stageShot } from './shots.js';
import { STATUS, advance, begin, createGame, mark, remaining, retry, tick, togglePause, useHint } from './state.js';

const params = new URLSearchParams(window.location.search);
const shotName = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seedBase = Number.isInteger(seedParam) ? seedParam : 1;

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const ctx = canvas.getContext('2d', { alpha: false });
const audio = createAudio();
const game = createGame(seedBase);
const input = createInput(canvas, { onGesture: () => audio.unlock() });

/** How long a ring flashes when it is first found, and how long a miss stays on the page. */
const FLASH = 0.45;
const MISS_LIFE = 0.6;

const effect = { hint: null, miss: null, pulse: 0, flashUntil: new Map() };

/** Tell screen readers what happened, without a visual element for it. */
function announce(message) {
  status.textContent = message;
}

/** Deal a round and say what is hidden, for the announcement. */
function startRound(round) {
  if (round === 1) begin(game);
  else advance(game);
  announce(`Round ${game.round} of ${game.rounds}. ${game.differences.length} differences.`);
}

/** Take one mark, ring what it found and answer with the sound and the words for it. */
function applyMark(point) {
  const outcome = mark(game, point.x, point.y);
  if (outcome.result === 'found') {
    audio.found();
    effect.flashUntil.set(outcome.difference.id, performance.now() / 1000 + FLASH);
    announce(`Found: ${outcome.difference.label}. ${remaining(game)} to find.`);
    if (game.status === STATUS.CLEARED) {
      audio.cleared();
      announce(`Round cleared. Score ${game.score}.`);
    }
  } else if (outcome.result === 'miss') {
    audio.miss();
    effect.miss = { x: point.x, y: point.y, born: performance.now() / 1000 };
    announce(`Nothing there. ${remaining(game)} still to find.`);
    if (game.status === STATUS.OVER) audio.over();
  }
}

/** One frame: input, clock, then the board and whatever is over it. */
function frame(now) {
  requestAnimationFrame(frame);
  const seconds = now / 1000;
  effect.pulse = (seconds * 0.9) % 1;

  for (let count = input.takeHints(); count > 0; count -= 1) {
    if (game.status !== STATUS.PLAY) break;
    const hinted = useHint(game);
    if (hinted === null) break;
    audio.hint();
    effect.hint = { x: hinted.x, y: hinted.y, born: seconds };
    announce(`A hint points at one of them. ${Math.ceil(game.secondsLeft)} seconds left.`);
  }
  for (let count = input.takePauses(); count > 0; count -= 1) {
    togglePause(game);
    announce(game.status === STATUS.PAUSED ? 'Paused.' : 'Playing.');
  }
  for (let count = input.takeRestarts(); count > 0; count -= 1) {
    if (game.status === STATUS.TITLE) break;
    retry(game);
    announce(`Round ${game.round} again. ${game.differences.length} differences.`);
  }
  for (let count = input.takeConfirms(); count > 0; count -= 1) {
    if (game.status === STATUS.TITLE) startRound(1);
  }
  for (const point of input.takeMarks()) {
    if (game.status === STATUS.TITLE) startRound(1);
    else if (game.status === STATUS.CLEARED) {
      advance(game);
      announce(game.status === STATUS.OVER ? `Every round cleared. Score ${game.score}.` : `Round ${game.round} of ${game.rounds}. ${game.differences.length} differences.`);
    } else if (game.status === STATUS.OVER) startRound(1);
    else if (game.status === STATUS.PLAY) applyMark(point);
  }

  const before = game.secondsLeft;
  tick(game, (frame.last === undefined ? 0 : Math.min(0.25, (now - frame.last) / 1000)));
  frame.last = now;
  if (game.status === STATUS.PLAY && Math.ceil(before) !== Math.ceil(game.secondsLeft) && game.secondsLeft <= 10) {
    announce(`${Math.ceil(game.secondsLeft)} seconds left.`);
  }
  if (game.status === STATUS.OVER && before > 0) audio.over();

  paint(seconds);
}

/** Paint the board, the strip and the screen that is up. */
function paint(seconds) {
  ctx.fillStyle = '#080c10';
  ctx.fillRect(0, 0, CANVAS.width, CANVAS.height);

  const cursor = input.cursor();
  const hint = effect.hint === null ? null : { ...effect.hint, age: seconds - effect.hint.born };
  if (hint !== null && hint.age > 1) {
    effect.hint = null;
  }
  const miss = effect.miss === null ? null : { ...effect.miss, age: seconds - effect.miss.born };
  if (miss !== null && miss.age > MISS_LIFE) effect.miss = null;

  drawBoard(ctx, {
    seed: game.seed,
    ids: game.ids,
    differences: game.differences,
    found: game.found,
    active: cursor.panel,
    cursor: { x: cursor.x, y: cursor.y },
    pulse: effect.pulse,
    hint: effect.hint === null ? null : hint,
    miss,
  });

  drawHud(ctx, {
    round: game.round,
    rounds: game.rounds,
    secondsLeft: game.secondsLeft,
    hintsLeft: game.hintsLeft,
    foundCount: game.found.size,
    total: game.differences.length,
    lowTime: game.secondsLeft <= 20,
  });

  if (game.status === STATUS.TITLE) drawTitle(ctx);
  else if (game.status === STATUS.PAUSED) drawPaused(ctx);
  else if (game.status === STATUS.CLEARED) drawCleared(ctx, game);
  else if (game.status === STATUS.OVER) drawOver(ctx, game, game.won);
}

/** Keep the canvas's proportions while filling as much of the window as it allows. */
function fit() {
  const scale = Math.min(window.innerWidth / CANVAS.width, window.innerHeight / CANVAS.height);
  canvas.style.width = `${Math.round(CANVAS.width * scale)}px`;
  canvas.style.height = `${Math.round(CANVAS.height * scale)}px`;
}

/**
 * A staged screenshot: set the scene and paint it, then paint it once more so the fonts are settled,
 * and only then say the frame is ready. It paints straight through rather than from the frame loop,
 * so a scene is complete even when the page is not the one on screen, and the clock never runs, so
 * the frame is exactly the scene that was asked for.
 */
async function runShot(name) {
  const staged = stageShot(name, game, input);
  effect.hint = staged.hint;
  effect.pulse = 0.25;
  await document.fonts.ready;
  const seconds = performance.now() / 1000;
  paint(seconds);
  paint(seconds);
  window.__shotReady = true;
}

fit();
window.addEventListener('resize', fit);

if (shotName !== null && isShot(shotName)) {
  runShot(shotName);
} else {
  begin(game);
  game.status = STATUS.TITLE;
  announce('The Keeper\u2019s Greenhouse. Press space or click to begin.');
  requestAnimationFrame(frame);
}
