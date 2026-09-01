---
title: config.json
description: The configuration file written by the setup wizard, and every field it accepts.
---

The first time `terminalika` runs it asks three questions - which agents to
listen to, how to notify you, whether games auto-pause - and writes the
answers here. `terminalika --setup` asks again; `terminalika --reset` (or
`-r`) deletes the file and starts over; editing the file by hand works too.
A missing file simply triggers setup on the next run.

:::note
`config.json` and everything on this page belong to the CLI. The
[pi extension](/pi/) keeps its one setting in a separate
[`pi.json`](/pi/#pijson) in the same directory - and its `auto_pause` is a
three-valued string, not this file's bool.
:::

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
| `listener.json` | Which window holds the [agent listener seat](/events/#one-window-at-a-time).      |
| `instance.lock` | Advisory lock used while a game is running.                                      |

All of these are the CLI's; the extension writes only `pi.json` there.

A **malformed** file is reported on stderr and ignored (the launcher
continues with defaults).

## schema

```jsonc
{
  "version": 3,                      // written by the wizard
  "agents": ["claude", "pi"],        // ids to listen to: claude, pi, aider, cursor
  "auto_pause": true,                // pause the game on any agent event (omit = true)
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
| `auto_pause`       | bool     | `true`           | Freeze the running game with a one-line notice in the agent's colour. `false` shows a corner banner instead. The in-game notice cannot be turned off - listen to no agents for silence. |
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

**Banner instead of pausing:**

```json
{"agents": ["claude"], "auto_pause": false}
```

Fields from earlier versions - `notify` (desktop notifications) and
`background` (a login daemon) - are ignored: terminalika is a game
launcher, not a notification service.

**Keep the config but disable the WebSocket sidecar for one run:**

```sh
terminalika --ws=""
```

## precedence

1. `--agents=…` on the command line replaces `agents` for that run;
   `--claude` / `--pi` add their agent on top.
2. `agents` in `config.json` (plus the legacy `subscribe` flags).

Notification and auto-pause settings come only from the file.
