---
title: config.json
description: The configuration file written by the setup wizard, and every field it accepts.
---

The first time `terminalika` runs it asks three questions - which agents to
listen to, how to notify you, whether games auto-pause - and writes the
answers here. `terminalika --setup` asks again; `terminalika --reset` (or
`-r`) deletes the file and starts over; editing the file by hand works too.
A missing file simply triggers setup on the next run.

## location

| OS      | Path                                                    |
| ------- | ------------------------------------------------------- |
| Linux   | `~/.config/terminalika/config.json`                     |
| macOS   | `~/Library/Application Support/terminalika/config.json` |
| Windows | `%AppData%\terminalika\config.json`                     |

`TERMINALIKA_CONFIG_DIR` overrides the directory. The same directory holds
the launcher's runtime files:

| File            | Purpose                                                                          |
| --------------- | -------------------------------------------------------------------------------- |
| `scores.json`   | Best score per game.                                                             |
| `hub.json`      | Address of the running [webhook ingest](/events/#webhooks-terminalika-notify) (`{"pid","addr","url"}`). |
| `ws.json`       | Resolved [sidecar](/websocket/) address of the running game (`{"game","addr","url"}`). |
| `listener.json` | Which process holds the [agent listener seat](/events/#windows-and-the-background-daemon). |
| `daemon.json`   | The running background daemon; deleting it asks the daemon to stop.             |
| `daemon.log`    | The daemon's few log lines (start, seat changes, events).                        |
| `instance.lock` | Advisory lock used while a game is running.                                      |

A **malformed** file is reported on stderr and ignored (the launcher
continues with defaults).

## schema

```jsonc
{
  "version": 3,                      // written by the wizard
  "agents": ["claude", "pi"],        // ids to listen to: claude, pi, aider, cursor
  "notify": {
    "desktop": "unfocused"           // when to show a desktop notification: never | no_window | unfocused | always
  },
  "auto_pause": true,                // pause the game on any agent event (omit = true)
  "background": true,                // keep `terminalika daemon` running from login
  "webhook": {
    "disabled": false,               // turn the local event ingest off
    "addr": ""                       // base address; empty = 127.0.0.1:7788
  },
  "claude": {
    "dir": "",                       // only the Claude Code running in this project dir
    "session": "",                   // explicit transcript file; wins over "dir"
    "message": ""                    // custom overlay line when the agent finishes
  },
  "pi": {
    "dir": "",
    "session": "",
    "message": ""
  },
  "aider": {
    "dir": "",                       // where .aider.chat.history.md lives; empty = cwd
    "history": ""                    // explicit history file; wins over "dir"
  }
}
```

| Field              | Type     | Default          | Meaning                                                                                     |
| ------------------ | -------- | ---------------- | ------------------------------------------------------------------------------------------- |
| `agents`           | string[] | `[]`             | Agents to monitor concurrently. See [events](/events/#agents).                              |
| `notify.desktop`   | string   | `never`          | When a native desktop notification is shown: `never`, `no_window` (only from the background process), `unfocused` (unless the terminalika window has focus), `always`. The v2 booleans still load: `true` = `always`, `false` = `never`; a v2 `bell` is ignored. |
| `auto_pause`       | bool     | `true`           | Freeze the running game with a one-line notice in the agent's colour. `false` shows a corner banner instead. The in-game notice cannot be turned off - listen to no agents for silence. |
| `background`       | bool     | `false`          | Register `terminalika daemon` to start at login and keep it running, so events are delivered while no window is open. See [events](/events/#windows-and-the-background-daemon). |
| `webhook.disabled` | bool     | `false`          | Don't start the local HTTP ingest.                                                          |
| `webhook.addr`     | address  | `127.0.0.1:7788` | Base address of the ingest; a taken port is skipped forward.                                |
| `<agent>.dir`      | string   | `""`             | Restrict to the agent whose working directory is this path. Empty means *every* project.    |
| `<agent>.session`  | string   | `""`             | Watch exactly this session file (`claude`, `pi`). When set, `dir` is ignored.               |
| `aider.history`    | string   | `""`             | Watch exactly this history file.                                                             |
| `<agent>.message`  | string   | `""`             | Replaces the one-line in-game notice ("Claude Code's done - you're up.") for that agent's `finished` events. |

### legacy fields

Files written before the wizard existed used `"claude": {"subscribe": true}`
/ `"pi": {"subscribe": true}`. They still work and are OR-ed into `agents`.

## recipes

**Listen to Claude Code and Aider, both scoped to one repository:**

```json
{
  "agents": ["claude", "aider"],
  "claude": {"dir": "/home/me/work/backend"},
  "aider":  {"dir": "/home/me/work/backend"}
}
```

**Banner instead of pausing, desktop notifications only when you're away:**

```json
{"agents": ["claude"], "notify": {"desktop": "unfocused"}, "auto_pause": false}
```

**A notification service with no window open - the daemon does the work:**

```json
{"agents": ["claude", "aider"], "notify": {"desktop": "no_window"}, "background": true}
```

**Keep the config but disable the WebSocket sidecar for one run:**

```sh
terminalika --ws=""
```

## precedence

1. `--agents=…` on the command line replaces `agents` for that run;
   `--claude` / `--pi` add their agent on top.
2. `agents` in `config.json` (plus the legacy `subscribe` flags).

Notification and auto-pause settings come only from the file.
