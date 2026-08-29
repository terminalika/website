---
title: flags
description: Every command line flag terminalika accepts.
---

`terminalika` uses Go's standard flag parsing: `-flag`, `--flag`, `-flag=value`
and `--flag value` all work. Run `terminalika -h` to see the same list from the
binary.

## reference

| Flag        | Type     | Default          | What it does                                                                                                        |
| ----------- | -------- | ---------------- | ------------------------------------------------------------------------------------------------------------------- |
| `--game`    | string   | *(menu)*         | Skip the menu and launch a game directly: `snake`, `tetris`, `invaders` or `pong`. An unknown name exits with an error before the terminal is touched. |
| `--ws`      | address  | `127.0.0.1:8080` | Base address for the [WebSocket sidecar](/websocket/). If the port is taken the next ones are tried. Empty string (`--ws=""`) disables the sidecar. |
| `--claude`  | bool     | `false`          | Subscribe to [Claude Code](/agents/claude/) sessions and pause the game when the agent settles.                     |
| `--pi`      | bool     | `false`          | Subscribe to [pi](/agents/pi/) sessions and pause the game when the agent settles.                                  |
| `--version` | bool     | `false`          | Print the version and exit.                                                                                         |
| `-h`        |          |                  | Print flag help and exit.                                                                                           |

Boolean flags and their `config.json` counterparts are **OR-ed**: either one
being set enables the feature. See [usage/config.json](/usage/config/).

## examples

```sh
# menu
terminalika

# straight into a game
terminalika --game=pong

# game + Claude Code subscription, no sidecar
terminalika --game=tetris --claude --ws=""

# watch both agents at once; either one settling pauses the game
terminalika --game=invaders --claude --pi

# sidecar on a different port range
terminalika --game=snake --ws=127.0.0.1:9000
```

## exit codes

| Code | Meaning                                                            |
| ---- | ------------------------------------------------------------------ |
| `0`  | Normal exit (ESC from the menu, or the game returned).              |
| `1`  | Unknown `--game`, or the screen could not be created/initialised.   |

Errors that are not fatal (unreadable `config.json`, a listener seat that could
not be claimed) are written to stderr and the launcher keeps going.

## environment variables

Terminalika itself reads none, but the agent watchers honour the agents' own
variables:

| Variable                      | Used by  | Effect                                              |
| ----------------------------- | -------- | --------------------------------------------------- |
| `CLAUDE_CONFIG_DIR`           | `--claude` | Sessions are read from `<dir>/projects`.          |
| `PI_CODING_AGENT_SESSION_DIR` | `--pi`   | Overrides the session directory directly.           |
| `PI_CODING_AGENT_DIR`         | `--pi`   | Moves the whole agent dir; sessions in `<dir>/sessions`. |
| `ZELLIJ`, `TMUX`              | key-release probe | Presence tells the launcher it is inside a multiplexer; see [terminals](/terminals/). |
| `WT_SESSION`                  | key-release probe | On Windows, marks Windows Terminal (win32-input-mode). |
