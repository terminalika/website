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

		titleStyle := tcell.StyleDefault.Foreground(tcell.ColorGreen).Bold(true)
		subtitleStyle := tcell.StyleDefault.Foreground(tcell.ColorGray)
		itemStyle := tcell.StyleDefault.Foreground(tcell.ColorWhite)
		selectedStyle := tcell.StyleDefault.Foreground(tcell.ColorBlack).Background(tcell.ColorAqua)

		drawLogo(s, w/2-logoWidth/2, h/2-8)
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

// logoCellWidth/logoSize/logoWidth describe the terminalika logo: a 3x3
// snake board -
//
//	[0 0 g]
//	[r 0 g]
//	[0 H g]
//
// g = snake body (green), H = snake head (lime), r = food (red), 0 = empty -
// kept in sync with internal/menu/menu.go in terminalika/terminalika and
// logo.svg/favicon.svg here. Each logical pixel is drawn two columns wide so
// it reads roughly square in a terminal cell grid.
const (
	logoCellWidth = 2
	logoSize      = 3
	logoWidth     = logoSize * logoCellWidth
)

type logoPixel struct {
	x, y  int
	color tcell.Color
}

var logoPixels = []logoPixel{
	{2, 0, tcell.ColorGreen},
	{0, 1, tcell.ColorRed},
	{2, 1, tcell.ColorGreen},
	{1, 2, tcell.ColorLime},
	{2, 2, tcell.ColorGreen},
}

// drawLogo draws the terminalika logo with its top-left corner at (x, y).
func drawLogo(s tcell.Screen, x, y int) {
	for _, p := range logoPixels {
		style := tcell.StyleDefault.Background(p.color)
		px, py := x+p.x*logoCellWidth, y+p.y
		for i := 0; i < logoCellWidth; i++ {
			s.SetContent(px+i, py, ' ', nil, style)
		}
	}
}
