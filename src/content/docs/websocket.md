---
title: websocket
description: The optional WebSocket sidecar that exposes the running game's events and commands.
---

While a game runs, terminalika can open a small WebSocket server next to it.
The terminal stays in charge; the sidecar is a bonus observer/controller for
external programs (bots, overlays, agent integrations). CLI only: the
[pi extension](/pi/) runs its games as wasm inside pi and opens no sidecar.

## address

```sh
terminalika --game=snake                      # sidecar on 127.0.0.1:8080 (default)
terminalika --game=snake --ws=127.0.0.1:9000  # different base address
terminalika --game=snake --ws=""              # disabled
```

If the base port is taken (another project, Docker, …) the launcher tries
`+1`, `+2`, … up to 100 ports. Since the terminal is full-screen, the
resolved address is **never printed**; it is written to `ws.json` in the
[config directory](/usage/config/#location):

```json
{"game":"snake","addr":"127.0.0.1:8081","url":"ws://127.0.0.1:8081"}
```

When the sidecar is disabled or failed to bind, the file carries an `error`
field instead (`"disabled"` or the bind error). The file is removed when the
game ends.

`ws.json` is a single shared file: if several instances run with the
sidecar enabled, each overwrites the others' entry. Run the extra instances
with `--ws=""` or discover their ports another way.

## protocol

Connect to `/` on the address. Both directions use JSON text frames with a
top-level `kind`.

**Client → server**

```json
{"kind":"list_commands"}
{"kind":"command", "id":"c1", "type":"snake.set_direction", "payload":{"direction":"up"}}
```

**Server → client**

```json
{"kind":"command_list", "commands":[{"name":"snake.set_direction", "description":"..."}]}
{"kind":"event", "type":"snake.direction_changed", "game":"snake", "correlation_id":"c1", "payload":{"from":"right","to":"up"}}
{"kind":"error", "code":"unknown_kind", "message":"..."}
```

- Every command produces a domain event as its acknowledgment, correlated by
  `id` → `correlation_id`.
- Commands that fail produce a `command.rejected` event carrying the
  command's correlation id.
- Spontaneous events (keyboard / timer driven) carry no `correlation_id`.

## pause with a reason

Every game accepts `<game>.pause` with an optional `reason`, shown on the
pause overlay. This is exactly what the [agent watchers](/agents/) use:

```json
{"kind":"command", "type":"snake.pause", "payload":{"reason":"Paused: Claude's done, you're up."}}
```

## example client

```sh
# list what the running game can do (needs websocat)
websocat "$(jq -r .url ~/.config/terminalika/ws.json)" <<'EOF'
{"kind":"list_commands"}
EOF
```
