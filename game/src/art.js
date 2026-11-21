// The drawing primitives the scene is built from: rounded boxes, glowing discs, wooden planks,
// stone tiles, leaves and the arc a stroke makes. Each one paints into the context it is given and
// takes plain numbers, so the scene reads as a list of what is drawn rather than as canvas calls.

/** A rectangle with rounded corners, filled. */
export function roundedBox(ctx, x, y, width, height, radius, fill) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

/** A vertical gradient between two colours, for a box or for the whole panel. */
export function verticalFill(ctx, x, y, width, height, top, bottom) {
  const paint = ctx.createLinearGradient(0, y, 0, y + height);
  paint.addColorStop(0, top);
  paint.addColorStop(1, bottom);
  ctx.fillStyle = paint;
  ctx.fillRect(x, y, width, height);
}

/** A soft radial glow, brightest at its centre and gone at its edge. */
export function glow(ctx, x, y, radius, colour) {
  const paint = ctx.createRadialGradient(x, y, 0, x, y, radius);
  paint.addColorStop(0, colour);
  paint.addColorStop(0.55, colour.replace(/[\d.]+\)$/, '0.16)'));
  paint.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = paint;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

/** A filled disc. */
export function disc(ctx, x, y, radius, fill) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

/** A stroke that runs from one point to another in the given colour and width. */
export function line(ctx, x0, y0, x1, y1, colour, width) {
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.strokeStyle = colour;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.stroke();
}

/** A quadratic curve from one point to another, bent through the control point. */
export function curve(ctx, x0, y0, cx, cy, x1, y1, colour, width) {
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.quadraticCurveTo(cx, cy, x1, y1);
  ctx.strokeStyle = colour;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.stroke();
}

/** A wooden board: a lit top edge, a body, a shaded bottom edge and a few grain lines. */
export function plank(ctx, x, y, width, height, tones, random) {
  verticalFill(ctx, x, y, width, height, tones.light, tones.dark);
  ctx.fillStyle = tones.edge;
  ctx.fillRect(x, y, width, 2);
  ctx.fillRect(x, y + height - 3, width, 3);
  ctx.globalAlpha = 0.35;
  for (let index = 0; index < 4; index += 1) {
    const gy = y + 4 + random.between(0, height - 9);
    line(ctx, x + 3, gy, x + width - 3, gy + random.between(-1, 1), tones.grain, 1);
  }
  ctx.globalAlpha = 1;
}

/** The stone floor: courses of tiles that get taller as they come toward the viewer. */
export function stoneFloor(ctx, x, y, width, height, tones) {
  verticalFill(ctx, x, y, width, height, tones.top, tones.bottom);
  ctx.strokeStyle = tones.line;
  ctx.lineWidth = 1.5;
  const rows = [0, 0.3, 0.55, 0.78, 1];
  for (let row = 1; row < rows.length; row += 1) {
    const at = y + height * rows[row];
    line(ctx, x, at, x + width, at, tones.line, 1.5);
  }
  for (let row = 0; row < rows.length - 1; row += 1) {
    const top = y + height * rows[row];
    const bottom = y + height * rows[row + 1];
    const step = 74 + row * 26;
    const offset = (row % 2) * step * 0.5;
    for (let tx = x + offset; tx < x + width; tx += step) {
      line(ctx, tx, top, tx + (row - 1.5) * 6, bottom, tones.line, 1.2);
    }
  }
}

/** A leaf: two curves meeting at a point, filled from the base colour to its lighter tip. */
export function leaf(ctx, x, y, length, angle, width, light, dark) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  const paint = ctx.createLinearGradient(0, 0, length, 0);
  paint.addColorStop(0, dark);
  paint.addColorStop(1, light);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(length * 0.45, -width, length, 0);
  ctx.quadraticCurveTo(length * 0.45, width, 0, 0);
  ctx.fillStyle = paint;
  ctx.fill();
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.18)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(length * 0.5, 0, length, 0);
  ctx.stroke();
  ctx.restore();
}

/** A clay pot: a tapered body, a rim and a shadow down its left side. */
export function pot(ctx, x, y, width, height, tones) {
  const paint = ctx.createLinearGradient(x, y, x + width, y);
  paint.addColorStop(0, tones.light);
  paint.addColorStop(0.55, tones.mid);
  paint.addColorStop(1, tones.dark);
  ctx.beginPath();
  ctx.moveTo(x + width * 0.08, y);
  ctx.lineTo(x + width * 0.92, y);
  ctx.lineTo(x + width * 0.74, y + height);
  ctx.lineTo(x + width * 0.26, y + height);
  ctx.closePath();
  ctx.fillStyle = paint;
  ctx.fill();
  ctx.fillStyle = tones.rim;
  ctx.fillRect(x, y - 5, width, 7);
  ctx.globalAlpha = 0.25;
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.moveTo(x + width * 0.08, y);
  ctx.lineTo(x + width * 0.3, y);
  ctx.lineTo(x + width * 0.36, y + height);
  ctx.lineTo(x + width * 0.26, y + height);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
}

/** A star: a disc with four short rays, brighter when it is a big one. */
export function star(ctx, x, y, radius, colour, rays) {
  disc(ctx, x, y, radius, colour);
  if (!rays) return;
  ctx.globalAlpha = 0.55;
  ctx.strokeStyle = colour;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x - radius * 2.4, y);
  ctx.lineTo(x + radius * 2.4, y);
  ctx.moveTo(x, y - radius * 2.4);
  ctx.lineTo(x, y + radius * 2.4);
  ctx.stroke();
  ctx.globalAlpha = 1;
}
