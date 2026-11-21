// Every measurement, colour and tuning number the game uses, in one place.
//
// The page is a fixed 1280 by 480 so a screenshot of the viewport is the whole two-panel game at the
// size the bounty asks for. Each picture is drawn in its own 608 by 400 space and the panels are
// placed side by side; nothing scales, so a marker sits where the same pixel sits in both pictures.

export const CANVAS = { width: 1280, height: 480 };

/** The strip along the top: the title, the round, the clock, and the counter of differences left. */
export const HUD = { height: 56, padX: 20, counterRight: 1260 };

/** Where the two pictures go, and how much space each one has. */
export const PANEL = { width: 608, height: 400, top: 64, left: 20, gap: 24 };

/** The right panel's left edge, from the left panel's. */
export const PANEL_STRIDE = PANEL.width + PANEL.gap;

/** The picture's own coordinates: the wall fills the top, the stone floor the bottom. */
export const SCENE = { width: 608, height: 400, floorY: 300, dadoY: 296 };

/** The arched window on the left of the picture: the glass opening, the night behind it, and the
    width of the wood around it. */
export const WINDOW = { x: 26, y: 22, width: 212, height: 250, arch: 106, frame: 8, muntin: 6 };

/** The lantern that hangs from the ceiling on a cord, in the middle of the wall. */
export const LANTERN = { x: 300, cordTop: 0, cordLength: 34, bodyWidth: 38, bodyHeight: 52 };

/** The framed moth on the wall, right of the lantern. */
export const PICTURE = { x: 352, y: 44, width: 78, height: 68, frame: 6 };

/** The shelf on the right of the wall, and the jars and books standing on it. */
export const SHELF = { x: 446, y: 170, width: 142, thickness: 9, bracket: 7 };

/** The workbench across the bottom of the wall, with its two pots and the sleeping cat. */
export const BENCH = { x: 300, y: 240, width: 292, top: 11, legHeight: 60 };

/** The big potted fern in the near left corner, standing on the floor in front of the window. */
export const FERN = { potX: 44, potY: 306, potWidth: 74, potHeight: 62, fronds: 7 };

/** The watering can that stands on the floor beside the bench. */
export const CAN = { x: 258, y: 344, width: 58, height: 40 };

/** The rug that runs along the floor in front of everything. */
export const RUG = { x: 168, y: 352, width: 424, height: 40, motifs: 6 };

/** How a round is played: a clock that runs out, wrong marks that cost seconds, and a few hints. */
export const ROUND = { seconds: 150, wrongPenalty: 4, hintPenalty: 10, hints: 2, rounds: 3 };

/** How many of the catalogue's differences a round hides in its pictures. */
export const DIFFERENCES = { perRound: 8, firstRound: 7, radius: 30, minApart: 96 };

/** The marker drawn over a difference once it is found, and the one that shows where the cursor is. */
export const MARK = { ring: 25, width: 4, tick: 9 };

/** The colours, named for what they paint rather than what they are. */
export const PALETTE = {
  night0: '#0b1224',
  night1: '#1b2a4a',
  night2: '#2d3f63',
  moon: '#f2e9cf',
  moonGlow: 'rgba(242, 233, 207, 0.30)',
  star: '#e8eefc',
  hill: '#16223a',
  wall0: '#1d2f2a',
  wall1: '#16241f',
  wallDado: '#0f1a17',
  wood0: '#7a4f2c',
  wood1: '#5a3820',
  wood2: '#3d2615',
  woodLight: '#9c6a3c',
  stone0: '#3a3f45',
  stone1: '#2b3036',
  stoneLine: '#20252a',
  lanternGlass: '#ffd489',
  lanternGlow: 'rgba(255, 206, 122, 0.42)',
  lanternDark: '#8d6a3a',
  brass: '#c9a227',
  leaf0: '#3f7d4e',
  leaf1: '#2a5c39',
  leaf2: '#59a06a',
  fernLight: '#6fbe7d',
  terracotta0: '#b5643c',
  terracotta1: '#8a4526',
  catFur0: '#4a4f5c',
  catFur1: '#333845',
  catCream: '#c9c3b4',
  rug0: '#7c2f3a',
  rug1: '#5a1f28',
  rugMotif: '#d8a24a',
  glass: '#9fd0c4',
  amber: '#e8a33d',
  teal: '#3fa89b',
  cream: '#efe6d2',
  ink: '#0d1512',
  hudBg: '#0a1119',
  hudText: '#e6e2d6',
  hudDim: '#8d9aa6',
  found: '#ffd166',
  foundGlow: 'rgba(255, 209, 102, 0.55)',
  miss: '#ff6b6b',
  cursor: '#8fe3ff',
  hint: '#b98cff',
};
