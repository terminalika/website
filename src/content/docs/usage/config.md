---
title: config.json
description: The optional configuration file and every field it accepts.
---

Terminalika works with no configuration at all. The config file exists so you
don't have to type `--claude` / `--pi` every time.

## location

| OS      | Path                                                    |
| ------- | ------------------------------------------------------- |
| Linux   | `~/.config/terminalika/config.json`                     |
| macOS   | `~/Library/Application Support/terminalika/config.json` |
| Windows | `%AppData%\terminalika\config.json`                     |

The same directory holds the launcher's runtime files:

| File            | Purpose                                                                          |
| --------------- | -------------------------------------------------------------------------------- |
| `scores.json`   | Best score per game.                                                             |
| `ws.json`       | Resolved [sidecar](/websocket/) address of the running game (`{"game","addr","url"}`). |
| `listener.json` | Which process holds the [agent listener seat](/agents/#one-listener-at-a-time). |
| `instance.lock` | Advisory lock used while a game is running.                                      |

A missing config file is not an error. A **malformed** one is reported on
stderr and ignored (the launcher continues with defaults).

## schema

```jsonc
{
  "claude": {
    "subscribe": false,   // bool   – enable the Claude Code watcher (OR-ed with --claude)
    "dir": "",            // string – only react to the Claude Code running in this project dir
    "session": ""         // string – explicit session file; wins over "dir"
  },
  "pi": {
    "subscribe": false,   // bool   – enable the pi watcher (OR-ed with --pi)
    "dir": "",            // string – only react to the pi running in this project dir
    "session": ""         // string – explicit session file; wins over "dir"
  }
}
```

Both blocks are optional and have the same shape.

| Field       | Type   | Default | Meaning                                                                                                      |
| ----------- | ------ | ------- | ------------------------------------------------------------------------------------------------------------ |
| `subscribe` | bool   | `false` | Turn the watcher on. The corresponding flag also turns it on; either is enough.                               |
| `dir`       | string | `""`    | Restrict to sessions of the agent whose working directory is this path. Empty means *every* project.         |
| `session`   | string | `""`    | Watch exactly this session file. When set, `dir` is ignored.                                                  |

## recipes

**Always watch Claude Code, whatever project it is running in:**

```sh
mkdir -p ~/.config/terminalika
cat > ~/.config/terminalika/config.json <<'EOF'
{"claude": {"subscribe": true}}
EOF
terminalika --game=snake     # no flag needed anymore
```

**Only react to the agent working on one specific repository:**

```json
{"claude": {"subscribe": true, "dir": "/home/me/work/backend"}}
```

**Watch both agents:**

```json
{
  "claude": {"subscribe": true},
  "pi":     {"subscribe": true}
}
```

**Keep the config but disable the sidecar for one run:**

```sh
terminalika --ws=""
```

(There is no config key for the sidecar; it is flag-only.)

## precedence

1. `--claude` / `--pi` on the command line.
2. `subscribe` in `config.json`.

They are OR-ed, so a flag can turn a watcher **on** but cannot turn one
**off** that the config enabled. `dir` and `session` come only from the
config file.
