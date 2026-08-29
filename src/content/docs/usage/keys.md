---
title: keys
description: Global keybindings and how key presses reach the games.
---

## global keys

These are intercepted by the launcher before any game sees them:

| Key     | Action                                              |
| ------- | --------------------------------------------------- |
| `ESC`   | Leave the game and return to the menu. In the menu: quit. |
| `R`     | Reset the current game.                             |
| `SPACE` | Pause / resume the current game.                    |

Everything else (arrows, `WASD`, per-game keys) is forwarded to the running
game.

## menu

| Key            | Action            |
| -------------- | ----------------- |
| `↑` / `↓`, `k` / `j` | Move selection |
| `ENTER`        | Start the selected game |
| `ESC`, `q`, `Ctrl-C` | Quit        |

Per-game controls are listed in [usage/games](/usage/games/).

## held keys

Movement in Pong (paddles) and Invaders (cannon) is *continuous*: the game
wants to know when a key is held down and when it is let go. Most terminals
only report presses, so the launcher probes the terminal at start and either:

- receives real press / repeat / release events (kitty keyboard protocol,
  win32-input-mode), or
- synthesises a release ~120 ms after the terminal's last auto-repeat, which
  works but feels sticky.

Which one you get, and why, is explained in [terminals/key-releases](/terminals/).
