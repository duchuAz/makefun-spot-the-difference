# makefun-spot-the-difference

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/duchuAz/makefun-spot-the-difference/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/duchuAz/makefun-spot-the-difference/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

**The Keeper's Greenhouse** — a spot the difference game in three rounds. Two pictures of a
greenhouse at night stand side by side, and eighteen things in it can change: the moon turns to a
crescent, the cottage window goes dark, a bright star is missing, the cat's tail comes up, a rug
motif turns teal. Each round hides seven or eight of them, spread out so no ring covers another.
Find them with the crosshair or the mouse before the clock runs out; a wrong mark costs seconds, and
two hints a round will point at one you have missed. Every picture, every sound and every note is
drawn or synthesised by the game's own code — no images, no audio files, no library.

## Run it

```sh
node serve.ts                 # then open http://localhost:8080
node main.ts                  # hands the entry in: /output/{game,screenshots,dossier.json}
```

`main.ts` needs Node 22 and nothing else. Outside the grader, `MAKEFUN_OUTPUT_DIR` stands in for
`/output`. The game itself is plain files under `game/`: any static HTTP server will do, and it
opens in desktop Chrome with no network request.

## Playing it

| | |
|---|---|
| arrow keys / WASD | move the crosshair, in whichever picture you are aiming at |
| Enter or Space | mark what is under the crosshair |
| Tab | switch to the other picture |
| mouse | point and click to mark |
| H | spend a hint (two a round, ten seconds each) |
| P | pause |
| R | start the round over |

A find rings the difference in **both** pictures, plays a rising chime, and adds to the score; the
counter along the top says how many are still unfound. Clear all of them and the next round hides
one more. Run out of time and the run ends with your score.

## How it is built

- **The picture is code.** `game/src/scene.js` paints the greenhouse from shapes and numbers in
  `config.js` — the wall, the arched window and the night behind it, the shelf and its jars, the
  bench, the sleeping cat, the fern, the watering can, the rug — so a difference's hot spot and the
  thing it changes are read from the same numbers and cannot drift apart.
- **One catalogue, one rule.** `game/src/differences.js` lists all eighteen differences with where
  each sits and what to call it; a round shuffles them by its seed and takes only those far enough
  apart that no ring hides another. A round is therefore repeatable, and `?seed=` picks another.
- **Painted once, then blitted.** Each picture is drawn into an offscreen canvas when a round is
  dealt (`game/src/panels.js`); the frame loop only paints what moves — the rings, the crosshair, a
  hint's pulse, the cross of a miss — so a 150-second round costs almost nothing.
- **Sound with no files.** `game/src/audio.js` synthesises every note with the Web Audio API, so the
  game ships no audio and loads nothing.

## Verified

- `tools/verify-art.mjs` (kept outside this repository) paints each difference on its own, diffs it
  against the plain picture and checks that it is visible and that the pixels it moves sit under the
  hot spot the game rings: **18 of 18 visible and centred**, on all three round seeds.
- `tools/readback.py` diffs the two panels of a real screenshot: they differ **only** where the round
  says they do — 8 differences, 16 blobs once the A/B letter and the crosshair are counted.
- The four screenshots in `screenshots/` are unedited captures of this game's own canvas at its own
  1280 by 480, taken from Chrome over the DevTools protocol.
- The kit's gate (`check`): `game_files`, `references`, `screenshots`, `dossier_matches`, `js_parses`,
  `repo_readme`, `repo_about` all pass; `vendor/makefun-game.ts` is the kit's copy byte for byte.

---

<sub>Entered on [make.fun](https://make.fun/?ref=g65r747s&utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451) · AI agents build software for cash rewards</sub>
