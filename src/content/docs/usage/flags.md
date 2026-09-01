---
title: flags
description: Every command line flag and subcommand terminalika accepts.
---

`terminalika` uses Go's standard flag parsing: `-flag`, `--flag`, `-flag=value`
and `--flag value` all work. Run `terminalika -h` to see the same list from the
binary.

:::note
This page is the CLI. The [pi extension](/pi/) has no flags and no
subcommands - its whole surface is `/play`.
:::

## reference

| Flag        | Type     | Default          | What it does                                                                                                        |
| ----------- | -------- | ---------------- | ------------------------------------------------------------------------------------------------------------------- |
| `--game`    | string   | *(home screen)*  | Skip the home screen and launch a game directly: `snake`, `tetris`, `2048` or `mines`. An unknown name exits with an error before the terminal is touched. |
| `--agents`  | list     | *(config)*       | Comma-separated agent ids to listen to for this run (`claude,pi,aider,cursor`), replacing the config's list.       |
| `--claude`  | bool     | `false`          | Also listen to [Claude Code](/agents/claude/) (added on top of the config / `--agents`).                            |
| `--pi`      | bool     | `false`          | Also listen to [pi](/agents/pi/).                                                                                    |
| `--setup`   | bool     | `false`          | Run the setup wizard again (also: `terminalika setup`).                                                             |
| `--reset`, `-r` | bool | `false`          | Delete `config.json` and start over with the setup wizard (also: `terminalika reset`).                              |
| `--ws`      | address  | `127.0.0.1:8080` | Base address for the [WebSocket sidecar](/websocket/). If the port is taken the next ones are tried. Empty string (`--ws=""`) disables the sidecar. |
| `--version` | bool     | `false`          | Print the version and exit.                                                                                         |
| `-h`        |          |                  | Print flag help and exit.                                                                                           |

## subcommands

| Command                                  | What it does                                                                                       |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `terminalika setup`                      | Run the setup wizard again.                                                                        |
| `terminalika reset`                      | Delete `config.json` and start over with the setup wizard.                                         |
| `terminalika notify` `--agent <id>` `[--kind finished\|input_required]` `[--detail text]` | Deliver an agent event to the running terminalika through its [webhook](/events/#webhooks-terminalika-notify). Reads hook JSON from stdin when piped. Never fails the caller unless `--quiet=false`. |

## examples

```sh
# home screen (first run: setup wizard)
terminalika

# straight into a game
terminalika --game=2048

# game + Claude Code only, no sidecar
terminalika --game=tetris --agents=claude --ws=""

# listen to everything at once
terminalika --agents=claude,pi,aider,cursor

# from an agent hook
terminalika notify --agent aider --kind finished
```

## exit codes

| Code | Meaning                                                            |
| ---- | ------------------------------------------------------------------ |
| `0`  | Normal exit (ESC/q from the home screen, or the game returned).     |
| `1`  | Unknown `--game`, or the screen could not be created/initialised.   |
| `2`  | `terminalika notify` usage error.                                   |

Errors that are not fatal (unreadable `config.json`, a listener seat or
webhook port that could not be claimed) are written to stderr and the
launcher keeps going.

## environment variables

| Variable                      | Used by  | Effect                                              |
| ----------------------------- | -------- | --------------------------------------------------- |
| `TERMINALIKA_CONFIG_DIR`      | everything, the [pi extension](/pi/#pijson) included | Overrides the config/runtime directory. |
| `CLAUDE_CONFIG_DIR`           | `claude` | Sessions are read from `<dir>/projects`.            |
| `PI_CODING_AGENT_SESSION_DIR` | `pi`     | Overrides the session directory directly.           |
| `PI_CODING_AGENT_DIR`         | `pi`     | Moves the whole agent dir; sessions in `<dir>/sessions`. |
| `ZELLIJ`, `TMUX`              | key-release probe | Presence tells the launcher it is inside a multiplexer; see [terminals](/terminals/). |
| `WT_SESSION`                  | key-release probe | On Windows, marks Windows Terminal (win32-input-mode). |
