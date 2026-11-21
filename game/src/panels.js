// The board: the two pictures, the frames around them, and everything drawn on top of the art — the
// rings over the differences already found, the cursor, the hint's pulse and the flash of a miss.
//
// The art itself is painted once per round into an offscreen canvas for each panel and then blitted
// every frame: the picture does not change while a round runs, so the gradients, the stars and the
// fern's fronds are laid down once and the loop only paints what moves.

import { MARK, PALETTE, PANEL, PANEL_STRIDE, SCENE } from './config.js';
import { drawScene } from './scene.js';

/** The two offscreen canvases the pictures are painted into, and the round they hold. */
const cache = { key: null, panels: [] };

/** A canvas of the picture's size. */
function offscreen() {
  const canvas = document.createElement('canvas');
  canvas.width = SCENE.width;
  canvas.height = SCENE.height;
  return canvas;
}

/** Paint both pictures for a round, or keep the ones already painted for it. */
function ensurePainted(seed, ids) {
  const key = `${seed}|${[...ids].sort().join(',')}`;
  if (cache.key === key) return cache.panels;
  cache.panels = [new Set(), new Set(ids)].map((variant) => {
    const canvas = offscreen();
    drawScene(canvas.getContext('2d'), seed, variant);
    return canvas;
  });
  cache.key = key;
  return cache.panels;
}

/** The frame each picture sits in: a bevelled edge, and a brighter one on the panel being aimed at. */
function drawFrame(ctx, x, y, active) {
  const pad = 4;
  ctx.fillStyle = active ? '#3c4a52' : '#232c31';
  ctx.fillRect(x - pad, y - pad, PANEL.width + pad * 2, PANEL.height + pad * 2);
  ctx.strokeStyle = active ? PALETTE.cursor : 'rgba(255, 255, 255, 0.10)';
  ctx.lineWidth = active ? 2 : 1;
  ctx.strokeRect(x - pad + 0.5, y - pad + 0.5, PANEL.width + pad * 2 - 1, PANEL.height + pad * 2 - 1);
}

/** A ring over a difference that has been found: a halo, the ring, and a tick inside it. */
function drawFoundRing(ctx, cx, cy, colour, glowColour) {
  ctx.save();
  ctx.shadowColor = glowColour;
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.arc(cx, cy, MARK.ring, 0, Math.PI * 2);
  ctx.strokeStyle = colour;
  ctx.lineWidth = MARK.width;
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 0.35;
  ctx.beginPath();
  ctx.arc(cx, cy, MARK.ring + 5, 0, Math.PI * 2);
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.beginPath();
  ctx.moveTo(cx - MARK.tick, cy + 1);
  ctx.lineTo(cx - 2, cy + MARK.tick - 1);
  ctx.lineTo(cx + MARK.tick, cy - MARK.tick);
  ctx.strokeStyle = colour;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
  ctx.restore();
}

/** The crosshair that shows where a mark would land, in the panel being aimed at. */
function drawCursor(ctx, cx, cy, pulse) {
  ctx.save();
  ctx.strokeStyle = PALETTE.cursor;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.9;
  ctx.beginPath();
  ctx.arc(cx, cy, 13 + pulse * 2, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    ctx.moveTo(cx + dx * 6, cy + dy * 6);
    ctx.lineTo(cx + dx * 19, cy + dy * 19);
  }
  ctx.globalAlpha = 0.65;
  ctx.stroke();
  ctx.restore();
}

/** The pulse that shows where a hint points, widening as it fades. */
function drawHintPulse(ctx, cx, cy, age) {
  ctx.save();
  const spread = 18 + age * 26;
  ctx.globalAlpha = Math.max(0, 1 - age);
  ctx.strokeStyle = PALETTE.hint;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, spread, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

/** The cross that marks a click that found nothing, fading where it landed. */
function drawMissCross(ctx, cx, cy, age) {
  ctx.save();
  ctx.globalAlpha = Math.max(0, 1 - age * 1.6);
  ctx.strokeStyle = PALETTE.miss;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx - 10, cy - 10);
  ctx.lineTo(cx + 10, cy + 10);
  ctx.moveTo(cx + 10, cy - 10);
  ctx.lineTo(cx - 10, cy + 10);
  ctx.stroke();
  ctx.restore();
}

/**
 * Paint the whole board for the round in `view`:
 *   view.seed, view.ids        the round's picture and the differences it hides
 *   view.found                 ids already ringed
 *   view.active                which panel the cursor is in (0 or 1)
 *   view.cursor                { x, y } in picture coordinates
 *   view.hint                  { x, y, age } or null
 *   view.miss                  { x, y, age } or null
 *   view.pulse                 the cursor's breathing phase, in turns
 */
export function drawBoard(ctx, view) {
  const panels = ensurePainted(view.seed, view.ids);
  for (let index = 0; index < 2; index += 1) {
    const originX = PANEL.left + index * PANEL_STRIDE;
    drawFrame(ctx, originX, PANEL.top, index === view.active);
    ctx.drawImage(panels[index], originX, PANEL.top);

    ctx.save();
    ctx.translate(originX, PANEL.top);
    for (const difference of view.differences) {
      if (view.found.has(difference.id)) drawFoundRing(ctx, difference.x, difference.y, PALETTE.found, PALETTE.foundGlow);
    }
    if (view.hint) drawHintPulse(ctx, view.hint.x, view.hint.y, view.hint.age);
    if (view.miss) drawMissCross(ctx, view.miss.x, view.miss.y, view.miss.age);
    if (index === view.active) drawCursor(ctx, view.cursor.x, view.cursor.y, view.pulse);
    ctx.restore();

    // The panel's letter, so the two pictures are named without a caption taking room.
    ctx.font = 'bold 13px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.fillStyle = index === view.active ? PALETTE.cursor : 'rgba(230, 226, 214, 0.45)';
    ctx.fillText(index === 0 ? 'A' : 'B', originX + 9, PANEL.top + 18);
  }
}

/** Picture coordinates to the page's, for a click that landed on `panel` at page point (x, y). */
export function toPicture(panel, x, y) {
  const originX = PANEL.left + panel * PANEL_STRIDE;
  return { x: x - originX, y: y - PANEL.top };
}

/** Which panel a page point is in, or -1 when it is in neither. */
export function panelAt(x, y) {
  if (y < PANEL.top || y > PANEL.top + PANEL.height) return -1;
  for (let index = 0; index < 2; index += 1) {
    const originX = PANEL.left + index * PANEL_STRIDE;
    if (x >= originX && x <= originX + PANEL.width) return index;
  }
  return -1;
}
