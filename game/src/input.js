// Input: the arrow keys and WASD move a crosshair over the pictures, Enter or Space marks what is
// under it, H spends a hint, P pauses and R starts the round again; the mouse does the same by
// pointing at a spot and clicking it. Both work at once, and the crosshair stays where the pointer
// left it, so a player can switch between the two without losing their place.

import { PANEL, PANEL_STRIDE, SCENE } from './config.js';
import { panelAt, toPicture } from './panels.js';

/** How far one key press moves the crosshair, and how far with Shift held. */
const STEP = 9;
const STEP_FAST = 26;

/** Which panel a picture point is in, clamped to the page, for the crosshair after a move. */
function clampToPicture(panel, x, y) {
  const originX = PANEL.left + panel * PANEL_STRIDE;
  return {
    x: Math.min(PANEL.width - 1, Math.max(0, x - originX)),
    y: Math.min(SCENE.height - 1, Math.max(0, y - PANEL.top)),
  };
}

/**
 * Watch the page's keyboard and pointer. Returns the cursor, which panel it is in, and the actions
 * pressed since the last time they were taken — so the loop reads input once a frame and never
 * handles the same press twice.
 */
export function createInput(canvas, { onGesture } = {}) {
  const state = {
    panel: 0,
    x: PANEL.width / 2,
    y: SCENE.height / 2,
    pointer: null,
    keys: new Set(),
    marks: [],
    hints: 0,
    pauses: 0,
    restarts: 0,
    confirms: 0,
  };

  const gesture = () => onGesture?.();

  window.addEventListener('keydown', (event) => {
    const key = event.key;
    const handled = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'a', 'd', 'w', 's', 'A', 'D', 'W', 'S', 'Enter', ' ', 'h', 'H', 'p', 'P', 'r', 'R', 'Tab'];
    if (handled.includes(key)) event.preventDefault();
    gesture();
    if (event.repeat) return;

    const step = event.shiftKey ? STEP_FAST : STEP;
    if (key === 'ArrowLeft' || key === 'a' || key === 'A') state.x = Math.max(0, state.x - step);
    else if (key === 'ArrowRight' || key === 'd' || key === 'D') state.x = Math.min(PANEL.width - 1, state.x + step);
    else if (key === 'ArrowUp' || key === 'w' || key === 'W') state.y = Math.max(0, state.y - step);
    else if (key === 'ArrowDown' || key === 's' || key === 'S') state.y = Math.min(SCENE.height - 1, state.y + step);
    else if (key === 'Tab') state.panel = state.panel === 0 ? 1 : 0;
    else if (key === 'Enter' || key === ' ') state.marks.push({ panel: state.panel, x: state.x, y: state.y });
    else if (key === 'h' || key === 'H') state.hints += 1;
    else if (key === 'p' || key === 'P') state.pauses += 1;
    else if (key === 'r' || key === 'R') state.restarts += 1;
  });

  window.addEventListener('keyup', (event) => state.keys.delete(event.key));

  canvas.addEventListener('pointermove', (event) => {
    const panel = panelAt(event.offsetX, event.offsetY);
    if (panel < 0) return;
    state.panel = panel;
    const point = clampToPicture(panel, event.offsetX, event.offsetY);
    state.x = point.x;
    state.y = point.y;
    state.pointer = { panel, ...point };
  });

  canvas.addEventListener('pointerdown', (event) => {
    const panel = panelAt(event.offsetX, event.offsetY);
    if (panel < 0) {
      state.confirms += 1;
      gesture();
      return;
    }
    gesture();
    state.panel = panel;
    const point = clampToPicture(panel, event.offsetX, event.offsetY);
    state.x = point.x;
    state.y = point.y;
    state.marks.push({ panel, ...point });
  });

  return {
    state,
    /** The cursor in picture coordinates, and which panel it is in. */
    cursor: () => ({ panel: state.panel, x: state.x, y: state.y }),
    /** The marks pressed since the last call, as picture points. */
    takeMarks() {
      const taken = state.marks;
      state.marks = [];
      return taken;
    },
    takeHints() {
      const taken = state.hints;
      state.hints = 0;
      return taken;
    },
    takePauses() {
      const taken = state.pauses;
      state.pauses = 0;
      return taken;
    },
    takeRestarts() {
      const taken = state.restarts;
      state.restarts = 0;
      return taken;
    },
    takeConfirms() {
      const taken = state.confirms;
      state.confirms = 0;
      return taken;
    },
    /** Put the crosshair where a staged screenshot wants it. */
    place(panel, x, y) {
      state.panel = panel;
      state.x = x;
      state.y = y;
    },
  };
}
