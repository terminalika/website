---
title: games
description: The built-in games and their controls.
---

Four games ship with the launcher. Pick one from the menu or start it directly
with `--game=<name>`. Best scores are kept per game in `scores.json` next to
[`config.json`](/usage/config/).

`ESC`, `R` and `SPACE` are [global](/usage/keys/) and work in every game.

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

## invaders

```sh
terminalika --game=invaders
```

Minimal Space Invaders: a formation that sweeps, descends and shoots back; a
cannon with a short reload; lives and waves.

| Key                 | Action     |
| ------------------- | ---------- |
| `←` / `A`           | Move left  |
| `→` / `D`           | Move right |
| `↑` / `W` / `X`     | Fire       |

The cannon uses **held keys**: it keeps moving while you hold the key. On a
terminal without key-release support that will feel sticky; see
[terminals/key-releases](/terminals/).

## pong

```sh
terminalika --game=pong
```

Pong on a small court. A setup screen chooses between two players on one
keyboard or a bot challenge (easy / normal / hard, a predictive bot ported from
tpong) and a "first to N" match length.

**Setup screen**

| Key                      | Action            |
| ------------------------ | ----------------- |
| `↑ ↓` / `W S` / `k j`    | Move between rows |
| `← →` / `A D` / `h l`    | Change the value  |
| `ENTER`                  | Start the match   |

**In play**

| Key      | Action                                                     |
| -------- | ---------------------------------------------------------- |
| `W` / `S` | Left paddle                                               |
| `↑` / `↓` | Right paddle (two players) — or the *left* paddle too, against the bot |

**After a match**

| Key     | Action                  |
| ------- | ----------------------- |
| `ENTER` | Rematch                 |
| `M`     | Back to the setup screen |

Paddles use **held keys** as well; this is the game where real key releases
matter most. See [terminals/key-releases](/terminals/).
