// The strip along the top of the page: the game's name, the round, the clock, the hints left, and
// the counter of differences that says how many are found and how many remain.

import { CANVAS, HUD, PALETTE } from './config.js';

/** Seconds as m:ss, which is how the clock is always written. */
export function clockText(seconds) {
  const whole = Math.max(0, Math.ceil(seconds));
  const minutes = Math.floor(whole / 60);
  return `${minutes}:${String(whole % 60).padStart(2, '0')}`;
}

/** A labelled pill: a dim caption above a value, in a rounded box. */
function pill(ctx, x, y, width, height, caption, value, colour, align = 'center') {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, 8);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.09)';
  ctx.lineWidth = 1;
  ctx.stroke();

  const cx = align === 'center' ? x + width / 2 : x + 14;
  ctx.textAlign = align === 'center' ? 'center' : 'left';
  ctx.font = '600 9px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.fillStyle = PALETTE.hudDim;
  ctx.fillText(caption, cx, y + 15);
  ctx.font = 'bold 17px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.fillStyle = colour;
  ctx.fillText(value, cx, y + 33);
}

/**
 * Paint the top strip. `view` carries the round number and count, the seconds left, the hints left,
 * how many differences are found of how many, and whether the clock is nearly out.
 */
export function drawHud(ctx, view) {
  ctx.save();
  ctx.fillStyle = PALETTE.hudBg;
  ctx.fillRect(0, 0, CANVAS.width, HUD.height);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
  ctx.fillRect(0, HUD.height - 1, CANVAS.width, 1);

  // The game's name, set in the same monospace as the rest so it reads at any size.
  ctx.textAlign = 'left';
  ctx.font = 'bold 20px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.fillStyle = PALETTE.hudText;
  ctx.fillText('THE KEEPER\u2019S GREENHOUSE', HUD.padX, 27);
  ctx.font = '11px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.fillStyle = PALETTE.hudDim;
  ctx.fillText('spot the difference \u00b7 keyboard or mouse', HUD.padX, 45);

  pill(ctx, 470, 9, 104, 38, 'ROUND', `${view.round} / ${view.rounds}`, PALETTE.hudText);
  pill(ctx, 584, 9, 104, 38, 'TIME', clockText(view.secondsLeft), view.lowTime ? PALETTE.miss : PALETTE.hudText);
  pill(ctx, 698, 9, 104, 38, 'HINTS', String(view.hintsLeft), view.hintsLeft > 0 ? PALETTE.hint : PALETTE.hudDim);

  // The counter: the number found over the number hidden, and what is still to find, in one box.
  const boxX = 836;
  const boxWidth = HUD.counterRight - boxX;
  ctx.fillStyle = 'rgba(255, 209, 102, 0.10)';
  ctx.beginPath();
  ctx.roundRect(boxX, 6, boxWidth, 44, 10);
  ctx.fill();
  ctx.strokeStyle = PALETTE.found;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.font = 'bold 27px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.fillStyle = PALETTE.found;
  const found = `${view.foundCount}`;
  ctx.fillText(found, boxX + 16, 38);
  const foundWidth = ctx.measureText(found).width;
  ctx.font = 'bold 17px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.fillStyle = 'rgba(255, 209, 102, 0.65)';
  ctx.fillText(`/ ${view.total}`, boxX + 16 + foundWidth + 6, 38);

  const remaining = view.total - view.foundCount;
  ctx.textAlign = 'right';
  ctx.font = '600 9px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.fillStyle = PALETTE.hudDim;
  ctx.fillText('DIFFERENCES FOUND', boxX + boxWidth - 14, 20);
  ctx.font = 'bold 14px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.fillStyle = remaining === 0 ? PALETTE.teal : PALETTE.hudText;
  ctx.fillText(remaining === 0 ? 'all found' : `${remaining} still to find`, boxX + boxWidth - 14, 40);

  // A progress bar along the very bottom of the strip, so the round's shape is visible at a glance.
  const barY = HUD.height - 4;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
  ctx.fillRect(0, barY, CANVAS.width, 3);
  const share = view.total === 0 ? 0 : view.foundCount / view.total;
  const paint = ctx.createLinearGradient(0, 0, CANVAS.width * share, 0);
  paint.addColorStop(0, PALETTE.teal);
  paint.addColorStop(1, PALETTE.found);
  ctx.fillStyle = paint;
  ctx.fillRect(0, barY, CANVAS.width * share, 3);
  ctx.restore();
}
