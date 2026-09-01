---
title: keys
description: Global keybindings and how key presses reach the games.
---

## global keys

These are intercepted by the launcher before any game sees them:

| Key     | Action                                              |
| ------- | --------------------------------------------------- |
| `ESC`   | Leave the game and return to the home screen. On the home screen: quit. |
| `R`     | Reset the current game.                             |
| `SPACE` | Pause / resume the current game.                    |

Everything else (arrows, `WASD`, per-game keys) is forwarded to the running
game.

In the [pi extension](/pi/) `R` and `SPACE` are the same, but `ESC`
**parks** the game (pi gets the keyboard back; `alt+g` returns) instead of
leaving it - there is no home screen or wizard there, and `/play stop` is
the only exit. The two sections below are CLI screens.

## home screen

The landing screen shows only the animated hero and a one-line prompt; the
game library is hidden until you ask for it. The layout adapts to the
terminal: on a small window (a quarter of a screen, say) the big title
becomes one line and the card grid becomes a compact, scrollable list, so
every game stays reachable.

| Key                  | Action                                                         |
| -------------------- | -------------------------------------------------------------- |
| any letter           | Type-to-launch: opens the fuzzy search overlay (`sn` → snake). |
| `↓`, `j`, `ENTER`    | Slide the hero up and reveal the game library.                 |
| `←` `→` `↑` `↓`      | Move between game cards; `↑` on the top row hides the library again. |
| `ENTER`              | Launch the selected game / the top search match.               |
| `ESC`                | Close the search overlay, hide the library, or (hero) quit.    |
| `q`, `Ctrl-C`        | Quit.                                                          |

## setup wizard

| Key            | Action                          |
| -------------- | ------------------------------- |
| `↑` / `↓`      | Move between options            |
| `SPACE`, `x`   | Toggle the option               |
| `ENTER`, `→`   | Next step (last step: save)     |
| `ESC`, `←`     | Previous step (first step: quit)|

Per-game controls are listed in [usage/games](/usage/games/).

## held keys

A game with *continuous* movement (a paddle that glides while the key is
down) wants to know when a key is held and when it is let go. None of the
built-in games does that at the moment - they all move one step per
keypress - but the launcher supports it for games that do. Most terminals
only report presses, so the launcher probes the terminal at start and either:

- receives real press / repeat / release events (kitty keyboard protocol,
  win32-input-mode), or
- synthesises a release ~120 ms after the terminal's last auto-repeat, which
  works but feels sticky.

Which one you get, and why, is explained in [terminals/key-releases](/terminals/).
The [pi extension](/pi/#held-keys) does the same dance, with pi relaying
the events.
