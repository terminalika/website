---
title: pi
description: Pause the game when pi finishes a turn.
---

Terminalika tails pi's session files and pauses the game when the agent stops
and waits for you. pi appends entries live, so no bridge process and no pi
server mode is needed. Works on Linux, macOS and Windows.

## enable

```sh
# for one run
terminalika --game=snake --pi

# permanently
cat > ~/.config/terminalika/config.json <<'EOF'
{"pi": {"subscribe": true}}
EOF
terminalika --game=snake
```

The flag and the config field are OR-ed; either is enough.

## config

```jsonc
{
  "pi": {
    "subscribe": true,
    "dir": "/home/me/my-project",   // optional: only the pi running in this directory
    "session": "",                  // optional: an explicit session file, overrides "dir"
    "message": ""                   // optional: custom pause text, after the fixed "Paused: " prefix
  }
}
```

| Field       | Meaning                                                                            |
| ----------- | ---------------------------------------------------------------------------------- |
| `subscribe` | Enable the watcher.                                                                |
| `dir`       | Restrict to sessions of the pi whose working directory is this path. Unset = every project. |
| `session`   | Watch exactly this session file. Wins over `dir`.                                  |
| `message`   | Pause overlay text shown after the fixed `Paused: ` prefix. Defaults to `PI's done, you're up.`. |

## where sessions are read from

pi's own resolution order:

1. `PI_CODING_AGENT_SESSION_DIR`, if set, is used directly;
2. otherwise `PI_CODING_AGENT_DIR` moves the whole agent directory and
   sessions live in `<dir>/sessions`;
3. otherwise `~/.pi/agent/sessions`.

## what triggers the pause

A new **assistant** message with a terminal `stopReason` (for example
`stop`). Messages with `stopReason: "toolUse"` are ignored, and only entries
appended *after* the game started count.

The game receives:

```json
{"kind":"command", "type":"snake.pause", "payload":{"reason":"Paused: PI's done, you're up."}}
```

so the pause overlay reads **Paused: PI's done, you're up.** (or your custom
`message`). `SPACE` resumes.

## with Claude Code too

```sh
terminalika --pi --claude
```

Either agent settling pauses the game. Both watchers share the single
[listener seat](/agents/#one-window-at-a-time).
