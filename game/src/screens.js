// The screens that are not the board: the title, the pause, the round cleared and the end. Each one
// dims the board and stands a card on it, so the picture is always behind and the game never shows a
// blank page.

import { CANVAS, PALETTE } from './config.js';

/** A dim wash over everything already drawn. */
function scrim(ctx, alpha) {
  ctx.fillStyle = `rgba(6, 10, 14, ${alpha})`;
  ctx.fillRect(0, 0, CANVAS.width, CANVAS.height);
}

/** A card centred on the page: a dark panel with a lit top edge and a shadow. */
function card(ctx, width, height) {
  const x = (CANVAS.width - width) / 2;
  const y = (CANVAS.height - height) / 2;
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 28;
  ctx.shadowOffsetY = 8;
  ctx.fillStyle = 'rgba(14, 24, 26, 0.94)';
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, 14);
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = 'rgba(159, 208, 196, 0.28)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(x + 0.5, y + 0.5, width - 1, height - 1, 14);
  ctx.stroke();
  return { x, y, width, height };
}

/** A key cap drawn around its letter, so the controls are shown rather than described. */
function keycap(ctx, x, y, label, width) {
  const w = width ?? Math.max(26, label.length * 11 + 14);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.beginPath();
  ctx.roundRect(x, y, w, 24, 6);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.font = 'bold 11px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.fillStyle = PALETTE.hudText;
  ctx.textAlign = 'center';
  ctx.fillText(label, x + w / 2, y + 16);
  ctx.textAlign = 'left';
  return w;
}

/** A line of the title card: key caps on the left, what they do on the right. */
function controlLine(ctx, x, y, caps, description) {
  let cursorX = x;
  for (const cap of caps) cursorX += keycap(ctx, cursorX, y, cap) + 5;
  ctx.font = '13px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.fillStyle = PALETTE.hudDim;
  ctx.fillText(description, cursorX + 6, y + 17);
}

/** The title: the name, what the game is, the controls, and how to begin. */
export function drawTitle(ctx) {
  scrim(ctx, 0.55);
  const { x, y, width } = card(ctx, 660, 286);
  ctx.textAlign = 'center';
  ctx.font = 'bold 34px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.fillStyle = PALETTE.cream;
  ctx.fillText('THE KEEPER\u2019S GREENHOUSE', x + width / 2, y + 62);
  ctx.font = '13px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.fillStyle = PALETTE.teal;
  ctx.fillText('a spot the difference game in three rounds', x + width / 2, y + 86);

  ctx.strokeStyle = 'rgba(159, 208, 196, 0.22)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + 60, y + 104);
  ctx.lineTo(x + width - 60, y + 104);
  ctx.stroke();

  ctx.textAlign = 'left';
  controlLine(ctx, x + 60, y + 122, ['\u2190', '\u2192', '\u2191', '\u2193'], 'move the crosshair over either picture');
  controlLine(ctx, x + 60, y + 154, ['ENTER'], 'mark a difference   \u00b7   click it too, with the mouse');
  controlLine(ctx, x + 60, y + 186, ['H'], 'spend a hint   \u00b7   P pause   \u00b7   R start over');

  ctx.textAlign = 'center';
  ctx.font = '12px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.fillStyle = PALETTE.hudDim;
  ctx.fillText('Three rounds, each with more to find. A wrong mark costs you seconds.', x + width / 2, y + 224);
  ctx.font = 'bold 15px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.fillStyle = PALETTE.found;
  ctx.fillText('PRESS SPACE OR CLICK TO BEGIN', x + width / 2, y + 258);
  ctx.textAlign = 'left';
}

/** The pause card. */
export function drawPaused(ctx) {
  scrim(ctx, 0.5);
  const { x, y, width } = card(ctx, 420, 128);
  ctx.textAlign = 'center';
  ctx.font = 'bold 26px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.fillStyle = PALETTE.cream;
  ctx.fillText('PAUSED', x + width / 2, y + 54);
  ctx.font = '13px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.fillStyle = PALETTE.hudDim;
  ctx.fillText('Press P to go on', x + width / 2, y + 86);
  ctx.textAlign = 'left';
}

/** The card between rounds: what was found, the score, and the key that carries on. */
export function drawCleared(ctx, game) {
  scrim(ctx, 0.55);
  const { x, y, width } = card(ctx, 520, 200);
  ctx.textAlign = 'center';
  ctx.font = 'bold 30px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.fillStyle = PALETTE.found;
  ctx.fillText('ROUND CLEARED', x + width / 2, y + 62);
  ctx.font = '15px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.fillStyle = PALETTE.cream;
  ctx.fillText(`All ${game.differences.length} found with ${Math.ceil(game.secondsLeft)} seconds to spare`, x + width / 2, y + 96);
  ctx.font = 'bold 22px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.fillStyle = PALETTE.teal;
  ctx.fillText(`Score ${game.score}`, x + width / 2, y + 132);
  ctx.font = 'bold 13px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.fillStyle = PALETTE.hudDim;
  ctx.fillText(game.round >= game.rounds ? 'PRESS SPACE TO SEE THE RESULT' : 'PRESS SPACE FOR THE NEXT ROUND', x + width / 2, y + 168);
  ctx.textAlign = 'left';
}

/** The end card: the score, and how to play again. */
export function drawOver(ctx, game, won) {
  scrim(ctx, 0.62);
  const { x, y, width } = card(ctx, 520, 216);
  ctx.textAlign = 'center';
  ctx.font = 'bold 30px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.fillStyle = won ? PALETTE.found : PALETTE.miss;
  ctx.fillText(won ? 'ALL THREE ROUNDS DONE' : 'OUT OF TIME', x + width / 2, y + 62);
  ctx.font = '14px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.fillStyle = PALETTE.hudDim;
  ctx.fillText(game.message || `Round ${game.round} of ${game.rounds}`, x + width / 2, y + 92);
  ctx.font = 'bold 30px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.fillStyle = PALETTE.teal;
  ctx.fillText(`${game.score}`, x + width / 2, y + 140);
  ctx.font = '11px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.fillStyle = PALETTE.hudDim;
  ctx.fillText('POINTS', x + width / 2, y + 160);
  ctx.font = 'bold 13px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.fillStyle = PALETTE.cream;
  ctx.fillText('PRESS SPACE TO PLAY AGAIN', x + width / 2, y + 192);
  ctx.textAlign = 'left';
}
