---
title: games
description: The built-in games and their controls.
---

Four games ship with the launcher, none of them needing key releases or
quick reflexes: they move one step per keypress, so they can be dropped
mid-move when an agent calls. Pick one from the menu or start it directly
with `--game=<name>` - in the [pi extension](/pi/), with `/play <name>`.
Best scores are kept per game in `scores.json` next to
[`config.json`](/usage/config/) (the extension keeps none yet: its wasm has
no filesystem).

`ESC`, `R` and `SPACE` are [global](/usage/keys/) and work in every game
(in pi, `ESC` parks instead of leaving).

## 2048

```sh
terminalika --game=2048
```

Slide the tiles; equal neighbours merge, and a new 2 (sometimes a 4) drops
into a free cell after every move. The run ends when nothing can move.
Reaching 2048 marks the run as won, and you keep playing.

| Key                         | Action |
| --------------------------- | ------ |
| `↑ ↓ ← →` / `WASD` / `HJKL` | Slide  |

There is no clock: the board only changes when you press a key, so it waits
as long as your agent takes.

## mines

```sh
terminalika --game=mines
```

Minesweeper. The game opens on a picker: beginner (9×9, 10 mines),
intermediate (16×16, 40) or expert (30×16, 99), each with its own best score
shown next to it; `R` brings the picker back. The first reveal is always
safe and opens up; a number says how many mines touch it. Reveal every safe
cell to clear the field - the clock only counts while you play, and a faster
clear scores a bigger bonus.

**Picker**

| Key                 | Action           |
| ------------------- | ---------------- |
| `↑ ↓` / `W S`       | Highlight a size |
| `ENTER`             | Start            |

**On the field**

| Key                         | Action                                                     |
| --------------------------- | ---------------------------------------------------------- |
| `↑ ↓ ← →` / `WASD` / `HJKL` | Move the cursor                                            |
| `ENTER` / `X`               | Reveal; on a number with all its flags placed, its neighbours |
| `F`                         | Flag / unflag                                              |

## snake

```sh
terminalika --game=snake
```

Classic Snake: eat, grow, speed up, don't bite yourself.

| Key                 | Action          |
| ------------------- | --------------- |
| `↑ ↓ ← →` / `WASD`  | Change direction |

## tetris

```sh
terminalika --game=tetris
```

Minimal Tetris: drop, rotate, clear lines.

| Key          | Action     |
| ------------ | ---------- |
| `←` / `A`    | Move left  |
| `→` / `D`    | Move right |
| `↓` / `S`    | Soft drop  |
| `↑` / `W`    | Rotate     |
| `X`          | Hard drop  |

