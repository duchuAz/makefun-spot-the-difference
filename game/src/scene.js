// The picture both panels show: a keeper's greenhouse at night, painted from shapes rather than
// loaded from files. Every element is drawn from the numbers in config.js, so a difference's hot
// spot and the thing it changes cannot drift apart.
//
// drawScene takes the set of changes a panel carries. With none it paints the picture as the round
// built it; with one it paints that one element in its other state. Everything else — the stars, the
// grain, the fronds — comes from the round's seed, so the two panels differ only where they should.

import { BENCH, CAN, FERN, LANTERN, PALETTE, PICTURE, RUG, SCENE, SHELF, WINDOW } from './config.js';
import { createRandom } from './random.js';
import { curve, disc, glow, leaf, line, plank, pot, roundedBox, star, stoneFloor, verticalFill } from './art.js';

const WOOD = { light: PALETTE.wood0, mid: PALETTE.wood1, dark: PALETTE.wood2, edge: PALETTE.woodLight, grain: '#2a1a0e' };
const TERRACOTTA = { light: PALETTE.terracotta0, mid: '#a3552f', dark: PALETTE.terracotta1, rim: '#c27048' };

/** The arched path of the window's glass, which the night is clipped to. */
function addArch(ctx, x, y, width, height, arch) {
  ctx.moveTo(x, y + height);
  ctx.lineTo(x, y + arch);
  ctx.arc(x + arch, y + arch, arch, Math.PI, 0);
  ctx.lineTo(x + width, y + height);
  ctx.closePath();
}

/** A single closed arch, as its own path. */
function archPath(ctx, x, y, width, height, arch) {
  ctx.beginPath();
  addArch(ctx, x, y, width, height, arch);
}

/** The wall: a slow gradient, a damp stain in the corner, and the dark rail the tiles meet. */
function drawWall(ctx, random) {
  verticalFill(ctx, 0, 0, SCENE.width, SCENE.floorY, PALETTE.wall0, PALETTE.wall1);
  ctx.globalAlpha = 0.16;
  for (let index = 0; index < 5; index += 1) {
    glow(ctx, random.between(0, SCENE.width), random.between(0, SCENE.floorY), random.between(50, 130), 'rgba(120, 200, 170, 0.5)');
  }
  ctx.globalAlpha = 1;
  verticalFill(ctx, 0, SCENE.dadoY, SCENE.width, SCENE.floorY - SCENE.dadoY, PALETTE.wallDado, '#0b1310');
}

/** The night behind the glass: sky, stars, moon, and the far hill with the keeper's cottage on it. */
function drawNight(ctx, random, variant) {
  const glass = { x: WINDOW.x, y: WINDOW.y, width: WINDOW.width, height: WINDOW.height };
  const arch = WINDOW.arch;
  ctx.save();
  archPath(ctx, glass.x, glass.y, glass.width, glass.height, arch);
  ctx.clip();
  verticalFill(ctx, glass.x, glass.y, glass.width, glass.height, PALETTE.night0, PALETTE.night2);

  for (let index = 0; index < 26; index += 1) {
    const sx = glass.x + random.between(4, glass.width - 4);
    const sy = glass.y + random.between(4, glass.height * 0.72);
    const big = random.chance(5);
    ctx.globalAlpha = big ? 0.95 : random.between(0.35, 0.8);
    star(ctx, sx, sy, big ? 1.9 : random.between(0.7, 1.3), PALETTE.star, big);
  }
  ctx.globalAlpha = 1;

  // One star the round can take away: a bright one, high and left of the moon where nothing hides it.
  const marker = glass.x + glass.width * 0.20;
  const markerY = glass.y + 52;
  if (!variant.has('bright-star')) {
    glow(ctx, marker, markerY, 15, 'rgba(232, 238, 252, 0.55)');
    ctx.globalAlpha = 0.95;
    star(ctx, marker, markerY, 3.8, '#ffffff', true);
    ctx.globalAlpha = 1;
  }

  const moonX = glass.x + glass.width * 0.68;
  const moonY = glass.y + 74;
  glow(ctx, moonX, moonY, 62, PALETTE.moonGlow);
  disc(ctx, moonX, moonY, 27, PALETTE.moon);
  if (variant.has('moon-phase')) {
    // A crescent: the moon's own colour, with the sky's shade bitten out of its lower left.
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    disc(ctx, moonX - 13, moonY + 8, 24, '#000');
    ctx.restore();
    ctx.save();
    archPath(ctx, glass.x, glass.y, glass.width, glass.height, arch);
    ctx.clip();
    ctx.globalAlpha = 0.35;
    disc(ctx, moonX - 6, moonY + 4, 22, PALETTE.night1);
    ctx.globalAlpha = 1;
    ctx.restore();
  } else {
    ctx.globalAlpha = 0.22;
    disc(ctx, moonX - 9, moonY - 6, 6, '#b9ae91');
    disc(ctx, moonX + 8, moonY + 9, 4.5, '#b9ae91');
    disc(ctx, moonX + 2, moonY - 13, 3, '#b9ae91');
    ctx.globalAlpha = 1;
  }

  // The hill, and the cottage whose one window is either lit or dark.
  ctx.fillStyle = PALETTE.hill;
  ctx.beginPath();
  ctx.moveTo(glass.x, glass.y + glass.height);
  ctx.lineTo(glass.x, glass.y + glass.height * 0.74);
  ctx.quadraticCurveTo(glass.x + glass.width * 0.42, glass.y + glass.height * 0.6, glass.x + glass.width, glass.y + glass.height * 0.82);
  ctx.lineTo(glass.x + glass.width, glass.y + glass.height);
  ctx.closePath();
  ctx.fill();

  const houseX = glass.x + glass.width * 0.80;
  const houseY = glass.y + glass.height * 0.78;
  ctx.fillStyle = '#101a2c';
  ctx.fillRect(houseX, houseY - 13, 24, 15);
  ctx.beginPath();
  ctx.moveTo(houseX - 3, houseY - 13);
  ctx.lineTo(houseX + 12, houseY - 22);
  ctx.lineTo(houseX + 27, houseY - 13);
  ctx.closePath();
  ctx.fill();
  if (variant.has('cottage-dark')) {
    ctx.fillStyle = '#0a1120';
    ctx.fillRect(houseX + 5, houseY - 9, 6, 6);
  } else {
    ctx.fillStyle = '#ffd489';
    ctx.fillRect(houseX + 5, houseY - 9, 6, 6);
    ctx.globalAlpha = 0.5;
    glow(ctx, houseX + 8, houseY - 6, 16, 'rgba(255, 212, 137, 0.6)');
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

/** The window's frame, muntins, sill and the crack a round may put in one pane. */
function drawWindow(ctx, variant) {
  const frame = WINDOW.frame;

  // The frame is a ring of wood around the glass, not a slab over it: the outer arch with the
  // opening cut out of it, filled by the even-odd rule.
  ctx.beginPath();
  addArch(ctx, WINDOW.x - frame, WINDOW.y - frame, WINDOW.width + frame * 2, WINDOW.height + frame * 2, WINDOW.arch + frame);
  addArch(ctx, WINDOW.x, WINDOW.y, WINDOW.width, WINDOW.height, WINDOW.arch);
  ctx.fillStyle = PALETTE.wood2;
  ctx.fill('evenodd');
  ctx.strokeStyle = PALETTE.woodLight;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  const glass = { x: WINDOW.x, y: WINDOW.y, width: WINDOW.width, height: WINDOW.height };

  // Muntins: one upright down the middle, two crossbars, all of the frame's wood.
  ctx.save();
  archPath(ctx, glass.x, glass.y, glass.width, glass.height, WINDOW.arch);
  ctx.clip();
  ctx.fillStyle = PALETTE.wood2;
  ctx.fillRect(glass.x + glass.width / 2 - 3, glass.y, 6, glass.height);
  for (const share of [0.34, 0.62]) {
    ctx.fillRect(glass.x, glass.y + glass.height * share - 3, glass.width, 6);
  }
  ctx.globalAlpha = 0.28;
  ctx.fillStyle = '#bfe6dc';
  ctx.fillRect(glass.x + glass.width / 2 - 3, glass.y, 2, glass.height);
  ctx.globalAlpha = 1;
  ctx.restore();

  if (variant.has('pane-crack')) {
    // A crack in the upper left pane, forking out from one point where a stone must have hit it.
    const cx = glass.x + glass.width * 0.46;
    const cy = glass.y + glass.height * 0.26;
    ctx.save();
    archPath(ctx, glass.x, glass.y, glass.width, glass.height, WINDOW.arch);
    ctx.clip();
    ctx.strokeStyle = 'rgba(232, 248, 252, 0.9)';
    ctx.lineWidth = 1.7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx - 15, cy - 19);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx + 12, cy - 12);
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + 15, cy + 13);
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx - 12, cy + 17);
    ctx.moveTo(cx - 7, cy - 9);
    ctx.lineTo(cx - 11, cy + 2);
    ctx.stroke();
    ctx.restore();
  }

  // The sill, wider than the frame, with the moon's light caught on its top edge.
  plank(ctx, WINDOW.x - 18, WINDOW.y + WINDOW.height - 2, WINDOW.width + 36, 14, WOOD, createRandom(7));
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = '#cfe6dd';
  ctx.fillRect(WINDOW.x - 18, WINDOW.y + WINDOW.height - 2, WINDOW.width + 36, 2);
  ctx.globalAlpha = 1;
}

/** The framed moth on the wall: a case with two wings, a body and the spots a round may add. */
function drawMothCase(ctx, variant) {
  const { x, y, width, height, frame } = PICTURE;
  roundedBox(ctx, x - frame, y - frame, width + frame * 2, height + frame * 2, 3, PALETTE.wood1);
  roundedBox(ctx, x - frame + 2, y - frame + 2, width + frame * 2 - 4, height + frame * 2 - 4, 2, PALETTE.woodLight);
  ctx.fillStyle = '#101d1a';
  ctx.fillRect(x, y, width, height);

  const cx = x + width / 2;
  const cy = y + height / 2;
  ctx.fillStyle = '#c8a86a';
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(cx, cy - 3);
    ctx.quadraticCurveTo(cx + side * 30, cy - 26, cx + side * 33, cy - 2);
    ctx.quadraticCurveTo(cx + side * 30, cy + 18, cx, cy + 5);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = '#e6d5a8';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 1, 3.4, 15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#e6d5a8';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(cx - 1, cy - 13);
  ctx.quadraticCurveTo(cx - 9, cy - 26, cx - 15, cy - 24);
  ctx.moveTo(cx + 1, cy - 13);
  ctx.quadraticCurveTo(cx + 9, cy - 26, cx + 15, cy - 24);
  ctx.stroke();

  const spots = variant.has('moth-spots') ? 4 : 2;
  for (const side of [-1, 1]) {
    for (let index = 0; index < spots / 2; index += 1) {
      disc(ctx, cx + side * (12 + index * 8), cy - 6 + index * 8, 3.4, '#5b3f22');
    }
  }
}

/** The shelf and what stands on it: three jars, one of them a colour a round may change, and books. */
function drawShelf(ctx, variant) {
  const { x, y, width, thickness, bracket } = SHELF;
  plank(ctx, x, y, width, thickness, WOOD, createRandom(11));
  for (const bx of [x + 14, x + width - 26]) {
    ctx.fillStyle = PALETTE.wood2;
    ctx.beginPath();
    ctx.moveTo(bx, y + thickness);
    ctx.lineTo(bx + bracket, y + thickness);
    ctx.lineTo(bx + 2, y + thickness + 16);
    ctx.closePath();
    ctx.fill();
  }

  const jars = [
    { x: x + 8, height: 34, width: 26, fill: PALETTE.amber },
    { x: x + 42, height: 42, width: 24, fill: PALETTE.teal },
    { x: x + 74, height: 30, width: 28, fill: '#a8714a' },
  ];
  if (variant.has('third-jar')) jars.pop();

  for (const jar of jars) {
    const jarY = y - jar.height;
    const fill = variant.has('jar-colour') && jar.x === x + 42 ? '#c96f9a' : jar.fill;
    ctx.globalAlpha = 0.92;
    roundedBox(ctx, jar.x, jarY, jar.width, jar.height, 4, 'rgba(214, 236, 232, 0.22)');
    ctx.globalAlpha = 1;
    ctx.fillStyle = fill;
    ctx.fillRect(jar.x + 2, jarY + jar.height * 0.42, jar.width - 4, jar.height * 0.54);
    ctx.strokeStyle = 'rgba(226, 244, 250, 0.55)';
    ctx.lineWidth = 1.2;
    roundedBox(ctx, jar.x, jarY, jar.width, jar.height, 4, 'rgba(0,0,0,0)');
    ctx.stroke();
    ctx.fillStyle = PALETTE.wood2;
    ctx.fillRect(jar.x - 1, jarY - 5, jar.width + 2, 6);
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(jar.x + 4, jarY + 6, 2.5, jar.height - 14);
    ctx.globalAlpha = 1;
  }

  const books = [
    { x: x + width - 44, width: 9, height: 38, colour: '#7a3f4a' },
    { x: x + width - 33, width: 8, height: 34, colour: '#3f5a7a' },
    { x: x + width - 23, width: 10, height: 40, colour: '#6b6a3f' },
  ];
  for (const book of books) {
    const leaning = variant.has('leaning-book') && book === books[2];
    ctx.save();
    if (leaning) {
      ctx.translate(book.x + book.width, y);
      ctx.rotate(-0.42);
      ctx.fillStyle = book.colour;
      ctx.fillRect(-book.width, -book.height, book.width, book.height);
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      ctx.fillRect(-book.width, -book.height, 2, book.height);
    } else {
      ctx.fillStyle = book.colour;
      ctx.fillRect(book.x, y - book.height, book.width, book.height);
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      ctx.fillRect(book.x, y - book.height, 2, book.height);
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.fillRect(book.x, y - book.height * 0.5, book.width, 1.5);
    }
    ctx.restore();
  }
}

/** The lantern on its cord: brass, glass, a flame, and the pool of light it throws on the wall. */
function drawLantern(ctx, variant) {
  const { x, cordTop, cordLength, bodyWidth, bodyHeight } = LANTERN;
  const top = cordTop + cordLength;
  line(ctx, x, cordTop, x, top, '#2a2118', 2);
  disc(ctx, x, top, 3, PALETTE.brass);

  const lit = !variant.has('lantern-out');
  const glass = variant.has('lantern-green') ? '#9fe3b4' : PALETTE.lanternGlass;

  if (lit) {
    glow(ctx, x, top + bodyHeight * 0.62, 108, variant.has('lantern-green') ? 'rgba(159, 227, 180, 0.34)' : PALETTE.lanternGlow);
  }

  // Cap, glass housing and base.
  ctx.beginPath();
  ctx.moveTo(x - bodyWidth * 0.62, top + 8);
  ctx.lineTo(x + bodyWidth * 0.62, top + 8);
  ctx.lineTo(x + bodyWidth * 0.34, top);
  ctx.lineTo(x - bodyWidth * 0.34, top);
  ctx.closePath();
  ctx.fillStyle = PALETTE.brass;
  ctx.fill();

  const housingTop = top + 9;
  const housingHeight = bodyHeight - 18;
  ctx.beginPath();
  ctx.moveTo(x - bodyWidth / 2, housingTop);
  ctx.lineTo(x + bodyWidth / 2, housingTop);
  ctx.lineTo(x + bodyWidth / 2 - 5, housingTop + housingHeight);
  ctx.lineTo(x - bodyWidth / 2 + 5, housingTop + housingHeight);
  ctx.closePath();
  ctx.fillStyle = lit ? glass : '#3a3128';
  ctx.globalAlpha = lit ? 0.92 : 0.85;
  ctx.fill();
  ctx.globalAlpha = 1;

  if (lit) {
    glow(ctx, x, housingTop + housingHeight * 0.55, 20, 'rgba(255, 246, 214, 0.9)');
    ctx.fillStyle = '#fffbe8';
    ctx.beginPath();
    ctx.ellipse(x, housingTop + housingHeight * 0.56, 3.4, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    if (variant.has('lantern-smoke')) {
      // Two wisps curling off the cap, the thinner one trailing the first.
      ctx.globalAlpha = 0.42;
      curve(ctx, x + 1, top - 4, x + 14, top - 20, x + 3, top - 38, '#dcefe8', 2.4);
      ctx.globalAlpha = 0.3;
      curve(ctx, x - 3, top - 2, x + 9, top - 16, x - 2, top - 30, '#cfe6dd', 1.8);
      ctx.globalAlpha = 1;
    }
  }

  ctx.fillStyle = PALETTE.brass;
  ctx.fillRect(x - bodyWidth / 2 - 2, housingTop + housingHeight, bodyWidth + 4, 7);
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(x - bodyWidth / 2, housingTop + housingHeight + 4, bodyWidth, 3);
}

/** The workbench: a board on two legs, with a pot at each end and the cat asleep in the middle. */
function drawBench(ctx, variant) {
  const { x, y, width, top, legHeight } = BENCH;
  for (const legX of [x + 18, x + width - 34]) {
    verticalFill(ctx, legX, y + top, 16, legHeight, PALETTE.wood1, PALETTE.wood2);
  }
  plank(ctx, x, y, width, top, WOOD, createRandom(19));

  // A cushion at the left end, its colour one of the round's differences.
  const cushion = variant.has('cushion') ? '#3f6f8a' : '#8a5a3f';
  roundedBox(ctx, x + 22, y - 14, 52, 15, 6, cushion);
  roundedBox(ctx, x + 26, y - 16, 44, 7, 4, 'rgba(255,255,255,0.14)');

  for (const potX of [x + 96, x + 152]) {
    pot(ctx, potX, y - 30, 34, 30, TERRACOTTA);
    const random = createRandom(potX);
    for (let index = 0; index < 5; index += 1) {
      leaf(ctx, potX + 17, y - 30, random.between(16, 24), random.between(-2.4, -0.7), random.between(5, 8), PALETTE.leaf2, PALETTE.leaf1);
    }
  }

  drawCat(ctx, x + width - 118, y - 2, variant);
}

/** The cat asleep on the bench: a curled body, a head, ears, stripes and a tail a round may lift. */
function drawCat(ctx, x, y, variant) {
  const fur = PALETTE.catFur0;
  const shade = PALETTE.catFur1;

  // The tail: curled tight around the body, or lifted and swinging off the bench's end.
  if (variant.has('cat-tail')) {
    curve(ctx, x + 62, y - 14, x + 96, y - 44, x + 78, y - 62, shade, 9);
  } else {
    curve(ctx, x + 58, y - 12, x + 88, y - 6, x + 66, y + 4, shade, 9);
  }

  ctx.beginPath();
  ctx.ellipse(x + 34, y - 20, 40, 21, -0.06, 0, Math.PI * 2);
  ctx.fillStyle = fur;
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(x + 34, y - 12, 30, 12, -0.06, 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.catCream;
  ctx.fill();

  // Head, ears, and the closed eyes (or open ones) of a sleeping animal.
  const hx = x + 6;
  const hy = y - 24;
  disc(ctx, hx, hy, 17, fur);
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(hx + side * 4, hy - 13);
    ctx.lineTo(hx + side * 16, hy - 24);
    ctx.lineTo(hx + side * 17, hy - 9);
    ctx.closePath();
    ctx.fillStyle = fur;
    ctx.fill();
  }
  ctx.globalAlpha = 0.85;
  disc(ctx, hx - 5, hy - 2, 2.6, '#f6efe0');
  disc(ctx, hx + 5, hy - 2, 2.6, '#f6efe0');
  ctx.globalAlpha = 1;
  if (variant.has('cat-awake')) {
    // Open eyes: a dark pupil ringed by the eye's pale green, and the glint of the lantern in it.
    disc(ctx, hx - 5, hy - 2, 3.4, '#7fa86a');
    disc(ctx, hx + 5, hy - 2, 3.4, '#7fa86a');
    disc(ctx, hx - 5, hy - 2, 2, '#141a1e');
    disc(ctx, hx + 5, hy - 2, 2, '#141a1e');
    disc(ctx, hx - 6, hy - 3.4, 0.9, '#ffffff');
    disc(ctx, hx + 4, hy - 3.4, 0.9, '#ffffff');
  } else {
    ctx.strokeStyle = '#20262b';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(hx - 5, hy - 2, 3, 0.2, Math.PI - 0.2);
    ctx.arc(hx + 5, hy - 2, 3, 0.2, Math.PI - 0.2);
    ctx.stroke();
  }
  ctx.fillStyle = '#c98b8b';
  ctx.beginPath();
  ctx.moveTo(hx, hy + 3);
  ctx.lineTo(hx - 2.4, hy + 5.5);
  ctx.lineTo(hx + 2.4, hy + 5.5);
  ctx.closePath();
  ctx.fill();

  ctx.globalAlpha = 0.35;
  for (let index = 0; index < 3; index += 1) {
    curve(ctx, x + 26 + index * 14, y - 34, x + 34 + index * 14, y - 22, x + 28 + index * 14, y - 10, shade, 3);
  }
  ctx.globalAlpha = 1;
}

/** The fern in its pot, standing in the near left corner in front of the window. */
function drawFern(ctx, random, variant) {
  const { potX, potY, potWidth, potHeight, fronds } = FERN;
  pot(ctx, potX, potY, potWidth, potHeight, TERRACOTTA);
  const baseX = potX + potWidth / 2;
  const baseY = potY - 2;
  const count = variant.has('fern-frond') ? fronds - 2 : fronds;
  for (let index = 0; index < count; index += 1) {
    const spread = count === 1 ? 0 : index / (count - 1) - 0.5;
    const angle = -Math.PI / 2 + spread * 2.5;
    const length = random.between(46, 76);
    leaf(ctx, baseX, baseY, length, angle, random.between(8, 13), PALETTE.fernLight, PALETTE.leaf1);
  }
  if (variant.has('fern-bloom')) {
    disc(ctx, baseX + 4, baseY - 58, 5.5, '#e8798f');
    disc(ctx, baseX - 6, baseY - 52, 4.5, '#e8798f');
  } else {
    disc(ctx, baseX + 4, baseY - 58, 5.5, '#f2c14e');
    disc(ctx, baseX - 6, baseY - 52, 4.5, '#f2c14e');
  }
}

/** The watering can on the floor, its spout pointing left or right. */
function drawCan(ctx, variant) {
  const { x, y, width, height } = CAN;
  const flipped = variant.has('can-spout');
  ctx.save();
  if (flipped) {
    ctx.translate(x + width, 0);
    ctx.scale(-1, 1);
    ctx.translate(-x, 0);
  }
  const body = ctx.createLinearGradient(x, y, x + width, y + height);
  body.addColorStop(0, '#6f8b93');
  body.addColorStop(1, '#3d5157');
  roundedBox(ctx, x, y + 8, width - 16, height - 12, 7, body);
  ctx.fillStyle = '#4a626a';
  ctx.beginPath();
  ctx.moveTo(x - 14, y + height - 10);
  ctx.lineTo(x + 4, y + 12);
  ctx.lineTo(x + 12, y + 16);
  ctx.lineTo(x - 6, y + height - 6);
  ctx.closePath();
  ctx.fill();
  disc(ctx, x - 16, y + height - 10, 5, '#5c757d');
  curve(ctx, x + 16, y + 8, x + 26, y - 12, x + 42, y + 8, '#4a626a', 5);
  ctx.restore();
}

/** The rug along the floor: a border, a field, and the motifs a round may recolour. */
function drawRug(ctx, variant) {
  const { x, y, width, height, motifs } = RUG;
  roundedBox(ctx, x, y, width, height, 4, PALETTE.rug1);
  roundedBox(ctx, x + 5, y + 5, width - 10, height - 10, 3, PALETTE.rug0);
  ctx.strokeStyle = 'rgba(255, 226, 170, 0.35)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x + 11, y + 10, width - 22, height - 20);
  const step = (width - 60) / (motifs - 1);
  for (let index = 0; index < motifs; index += 1) {
    const mx = x + 30 + index * step;
    const my = y + height / 2;
    const colour = variant.has('rug-motif') && index === 2 ? PALETTE.teal : PALETTE.rugMotif;
    ctx.fillStyle = colour;
    ctx.beginPath();
    ctx.moveTo(mx, my - 9);
    ctx.lineTo(mx + 8, my);
    ctx.lineTo(mx, my + 9);
    ctx.lineTo(mx - 8, my);
    ctx.closePath();
    ctx.fill();
  }
}

/** The light the room really has: the moon's cool wash from the window, and the lantern's warm one. */
function drawLighting(ctx, variant) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = 0.5;
  glow(ctx, WINDOW.x + WINDOW.width * 0.62, WINDOW.y + 120, 190, 'rgba(150, 190, 235, 0.20)');
  if (!variant.has('lantern-out')) {
    ctx.globalAlpha = 0.85;
    glow(ctx, LANTERN.x, LANTERN.cordLength + 44, 150, 'rgba(255, 206, 122, 0.22)');
  }
  ctx.restore();
}

/** A vignette, so the corners settle and the eye goes to the middle of the picture. */
function drawVignette(ctx) {
  const paint = ctx.createRadialGradient(SCENE.width / 2, SCENE.height * 0.46, SCENE.height * 0.28, SCENE.width / 2, SCENE.height * 0.5, SCENE.width * 0.78);
  paint.addColorStop(0, 'rgba(0, 0, 0, 0)');
  paint.addColorStop(1, 'rgba(0, 0, 0, 0.45)');
  ctx.fillStyle = paint;
  ctx.fillRect(0, 0, SCENE.width, SCENE.height);
}

/**
 * Paint one panel: the picture as the round seeded it, with the changes in `variant` applied.
 * `variant` is a Set of the difference ids that panel carries in their other state.
 */
export function drawScene(ctx, seed, variant) {
  const random = createRandom(seed);
  ctx.save();
  drawWall(ctx, random);
  drawNight(ctx, createRandom(seed ^ 0x51ed), variant);
  drawWindow(ctx, variant);
  drawMothCase(ctx, variant);
  drawShelf(ctx, variant);
  drawLantern(ctx, variant);
  stoneFloor(ctx, 0, SCENE.floorY, SCENE.width, SCENE.height - SCENE.floorY, {
    top: PALETTE.stone0,
    bottom: PALETTE.stone1,
    line: PALETTE.stoneLine,
  });
  // Nearest last: the rug lies on the floor, the bench stands on it, and the can stands in front of
  // both, so nothing that a round can change ends up hidden under something else.
  drawRug(ctx, variant);
  drawBench(ctx, variant);
  drawFern(ctx, createRandom(seed ^ 0x9a13), variant);
  drawCan(ctx, variant);
  drawLighting(ctx, variant);
  drawVignette(ctx);
  ctx.restore();
}
