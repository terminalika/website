// Command wasm is the browser build of terminalika used on terminalika.dev:
// the real games from terminalika-core, driven by a small port of the
// launcher's menu and engine, rendered through tcell's WebAssembly screen.
//
// Build (see scripts/build-wasm.sh):
//
//	GOOS=js GOARCH=wasm go build -o ../public/play/terminalika.wasm .
//
// The page passes `--game=<name>` through wasm_exec's argv exactly like the
// real binary's flag; without it the menu is shown. Key releases come from
// the browser's keyup events, relayed by the glue script as key events with
// the Meta modifier set (see releaseMod).
package main

import (
	"flag"
	"os"
	"strings"
	"syscall/js"

	core "github.com/terminalika/terminalika-core"
	"github.com/terminalika/terminalika-core/games"

	"github.com/gdamore/tcell/v2"
)

func main() {
	registry := games.Default()

	fs := flag.NewFlagSet("terminalika", flag.ContinueOnError)
	gameFlag := fs.String("game", "", "skip the menu and launch a game directly ("+strings.Join(registry.Names(), ", ")+")")
	// Accepted for parity with the real binary; they have no effect in the
	// browser (no sidecar, no agent session files to watch).
	fs.String("ws", "127.0.0.1:8080", "")
	fs.Bool("pi", false, "")
	fs.Bool("claude", false, "")
	fs.Bool("version", false, "")
	_ = fs.Parse(os.Args[1:])

	if *gameFlag != "" && !registry.Has(*gameFlag) {
		return
	}

	screen, err := tcell.NewScreen()
	if err != nil {
		return
	}
	if err := screen.Init(); err != nil {
		return
	}
	defer screen.Fini()
	screen.SetSize(termSize())

	if *gameFlag != "" {
		runGame(screen, registry, *gameFlag)
		return
	}

	for {
		name, ok := runMenu(screen, registry.Names())
		if !ok {
			return
		}
		runGame(screen, registry, name)
	}
}

func runGame(screen tcell.Screen, registry *core.Registry, name string) {
	game, ok := registry.Get(name)
	if !ok {
		return
	}
	newEngine(screen, game).run()
}

// termSize reads the cell grid the page prepared (window.tkTermSize =
// {cols, rows}); tcell's web screen defaults to 80x24 otherwise.
func termSize() (int, int) {
	cols, rows := 80, 24
	v := js.Global().Get("tkTermSize")
	if v.Type() == js.TypeObject {
		if c := v.Get("cols"); c.Type() == js.TypeNumber && c.Int() > 0 {
			cols = c.Int()
		}
		if r := v.Get("rows"); r.Type() == js.TypeNumber && r.Int() > 0 {
			rows = r.Int()
		}
	}
	return cols, rows
}
