package main

import (
	"fmt"

	"github.com/gdamore/tcell/v2"
)

// runMenu is the launcher's game selection screen. It returns the chosen
// game and true, or "" and false when the player quits (ESC / q).
func runMenu(screen tcell.Screen, gamesList []string) (string, bool) {
	if len(gamesList) == 0 {
		return "", false
	}
	selected := 0
	move := func(delta int) { selected = (selected + delta + len(gamesList)) % len(gamesList) }

	draw := func() {
		s := screen
		s.Clear()
		w, h := s.Size()

		titleStyle := tcell.StyleDefault.Foreground(tcell.ColorAqua).Bold(true)
		subtitleStyle := tcell.StyleDefault.Foreground(tcell.ColorGray)
		itemStyle := tcell.StyleDefault.Foreground(tcell.ColorWhite)
		selectedStyle := tcell.StyleDefault.Foreground(tcell.ColorBlack).Background(tcell.ColorAqua)

		emitCentered(s, w/2, h/2-4, titleStyle, "TERMINALIKA")
		emitCentered(s, w/2, h/2-3, subtitleStyle, "select a game")

		startY := h/2 - 1
		for i, name := range gamesList {
			y := startY + i*2
			if i == selected {
				emitCentered(s, w/2, y, selectedStyle, fmt.Sprintf("> %s <", name))
			} else {
				emitCentered(s, w/2, y, itemStyle, fmt.Sprintf("  %s  ", name))
			}
		}
		emitCentered(s, w/2, h-2, subtitleStyle, "Arrows: navigate  Enter: play  Esc/Q: back to the shell")
		s.Show()
	}

	draw()
	for {
		ev := screen.PollEvent()
		if ev == nil {
			return "", false
		}
		switch ev := ev.(type) {
		case *tcell.EventKey:
			if isRelease(ev) {
				continue
			}
			switch ev.Key() {
			case tcell.KeyEscape, tcell.KeyCtrlC:
				return "", false
			case tcell.KeyUp:
				move(-1)
			case tcell.KeyDown:
				move(1)
			case tcell.KeyEnter:
				return gamesList[selected], true
			case tcell.KeyRune:
				switch ev.Rune() {
				case 'q', 'Q':
					return "", false
				case 'j':
					move(1)
				case 'k':
					move(-1)
				}
			}
		case *tcell.EventResize:
			screen.Sync()
		}
		draw()
	}
}

func emitCentered(s tcell.Screen, centerX, y int, style tcell.Style, str string) {
	x := centerX - len(str)/2
	for _, r := range str {
		s.SetContent(x, y, r, nil, style)
		x++
	}
}
