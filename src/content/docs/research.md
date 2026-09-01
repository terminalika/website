---
title: research
description: What interruption and attention research says about the small waits an AI agent creates - the studies behind terminalika's design, with their actual numbers and their limits.
---

terminalika's premise is that a one-to-two-minute wait on an AI agent is a
dangerous moment: too short to work, too long to sit still, and the easiest
door out of the terminal. That premise isn't a hunch. Human-computer
interaction and organisational psychology have been measuring the cost of
interruptions and task switching for two decades. This page collects the
studies the home page leans on, what each one actually measured, and where
terminalika's design choices come from.

## 1. it takes ~23 minutes to get back

**Gloria Mark, Victor González & Justin Harris - "No Task Left Behind?
Examining the Nature of Fragmented Work", CHI 2005.**
Three and a half days of shadowing 24 information workers, second by
second. People spent on average just over 11 minutes on a "working sphere"
(a project) before switching, and within a sphere only about three minutes
on a single task. After an interruption, around 57% of interrupted spheres
were resumed the same day - and getting back took, on average, a little over
23 minutes, typically via two other spheres first.

**Mark, Daniela Gudith & Ulrich Klocke - "The Cost of Interrupted Work:
More Speed and Stress", CHI 2008.**
A controlled study (48 participants answering email under interruption
conditions). Interrupted people finished the main task *faster* - they
compensated by working harder - but reported significantly higher stress,
frustration, time pressure and effort. The interruption cost doesn't always
show up as lost minutes; sometimes it shows up as the state you're in
afterwards.

*What terminalika takes from it:* the interruption to avoid isn't the
agent's notification - it's the detour you take while waiting for it. The
game exists so that the wait has somewhere to go that isn't a second and
third "working sphere".

## 2. attention residue

**Sophie Leroy - "Why is it so hard to do my work? The challenge of
attention residue when switching between work tasks", Organizational
Behavior and Human Decision Processes, 2009.**
Two experiments. When people switch from task A to task B, part of their
attention stays on A ("attention residue"), and performance on B suffers.
Residue is worst when A was left unfinished and under time pressure; it
shrinks when A is brought to a clear stopping point before the switch.

*What terminalika takes from it:* the agent's turn is unfinished business
by definition - you're waiting on it. Anything you open in the meantime
inherits that residue. A game with no state worth keeping (you can lose
Snake and nothing is lost) is the closest thing to "not switching at all",
and the notice line - *who* wants *what* - is there so that returning
doesn't require reconstructing the suspended task.

## 3. developers are the worst-hit case

**Chris Parnin & Spencer Rugaber - "Resumption strategies for interrupted
programming tasks", Software Quality Journal, 2011** (extending Parnin &
DeLine, "Evaluating Cues for Resuming Interrupted Programming Tasks", CHI
2010).
Analysis of 10,000+ recorded programming sessions from 86 developers, plus
a survey of 414. After an interruption, a developer typically needed 10 to
15 minutes before making their first edit; only about 10% of sessions
resumed editing within a minute. Most of that time went to "resumption
strategies" - navigating around the code to rebuild the mental model
before doing anything.

**André Meyer, Thomas Fritz, Gail Murphy & Thomas Zimmermann - "Software
Developers' Perceptions of Productivity", FSE 2014.**
Survey of 379 developers plus observation. Developers rate a day
productive when they complete tasks or achieve goals *without significant
interruptions and context switches*; unproductive days are dominated by
switching, meetings and blocked work.

*What terminalika takes from it:* programming has an unusually expensive
resume, so the switch to avoid is the one *out of the code context*. Both
the game and the notice live in the same terminal, one pane away from the
agent - or, with the pi plugin, in the agent's own window; switching panes
(or pressing `ESC`) is the whole path back.

## 4. the alert is the door, not the destination

**Shamsi Iqbal & Eric Horvitz - "Disruption and Recovery of Computing
Tasks: Field Study, Analysis, and Directions", CHI 2007.**
Two weeks of logging 27 people's email and IM alerts. Responding to an
alert took a couple of minutes on average, but people then frequently
visited *other* applications before returning to the suspended task - the
alert opened a door and a good part of the time was spent wandering
through it. Recovery was harder the longer the detour.

*What terminalika takes from it:* a notification that sends you to a
browser tab to "check something" costs more than the notification. Hence
the pause-in-place: the event arrives where you already are, the game
stops, and the way forward is the agent, not a tab.

## 5. attention spans on screens keep shrinking

**Gloria Mark - "Attention Span", 2023** (summarising her lab's
computer-logging studies over two decades).
Average uninterrupted attention on a single screen fell from around 2.5
minutes in 2004 to about 75 seconds in 2012 and roughly 47 seconds in the
most recent studies. Roughly half of switches are self-interruptions -
nobody pinged you; you just went.

*What terminalika takes from it:* the self-interruption is the one to
design for. The agent will take a minute or three; that is several times the
average screen dwell. Something has to occupy that gap or the browser will.

## 6. waiting on the AI is now a real part of the workday

**METR - "Measuring the Impact of Early-2025 AI on Experienced Open-Source
Developer Productivity", July 2025.**
A randomized controlled trial: 16 experienced open-source developers, 246
real issues on their own mature repositories, AI tools allowed or
disallowed per issue. Developers *expected* AI to make them 24% faster and
believed afterwards it had made them 20% faster; measured, they were 19%
*slower*. Screen recordings showed less time actively coding and more time
prompting, waiting on generations, reviewing output and idle.

*What terminalika takes from it:* the wait is real, measured, and part of
how AI-assisted development works today. terminalika doesn't claim to make
it shorter. It claims to make the wait not turn into an interruption -
which, per sections 1-4, is where the actual minutes go.

## what this does not say

Honest limits, so the pitch stays honest:

- None of these studies tested playing a game during a wait. The argument
  is inferential: a zero-stakes, same-context activity should carry less
  residue and a shorter resume than a browser detour. That is plausible,
  not proven.
- Mark's 23 minutes is a mean across knowledge workers in 2005, not a
  number specific to developers or to 2025. Parnin's 10-15 minutes is the
  developer-specific figure, and it measured *time to first edit*, not
  time to full recovery.
- METR's sample is small (16 developers) and specific (experienced
  maintainers on repositories they know deeply). Its authors are explicit
  that it does not generalise to every developer or task.
- Waits also have a legitimate use: reading the diff so far, planning the
  next prompt. terminalika is for the waits where you'd otherwise reach for
  a tab, not a claim that every wait should be a game.

## references

- Mark, G., González, V. M., & Harris, J. (2005). No Task Left Behind?
  Examining the Nature of Fragmented Work. *CHI 2005.*
- Mark, G., Gudith, D., & Klocke, U. (2008). The Cost of Interrupted Work:
  More Speed and Stress. *CHI 2008.*
- Leroy, S. (2009). Why is it so hard to do my work? The challenge of
  attention residue when switching between work tasks. *Organizational
  Behavior and Human Decision Processes, 109*(2).
- Parnin, C., & DeLine, R. (2010). Evaluating Cues for Resuming Interrupted
  Programming Tasks. *CHI 2010.*
- Parnin, C., & Rugaber, S. (2011). Resumption strategies for interrupted
  programming tasks. *Software Quality Journal, 19*(1).
- Iqbal, S. T., & Horvitz, E. (2007). Disruption and Recovery of Computing
  Tasks: Field Study, Analysis, and Directions. *CHI 2007.*
- Meyer, A. N., Fritz, T., Murphy, G. C., & Zimmermann, T. (2014). Software
  Developers' Perceptions of Productivity. *FSE 2014.*
- Mark, G. (2023). *Attention Span: A Groundbreaking Way to Restore Balance,
  Happiness and Productivity.* Hanover Square Press.
- METR (2025). Measuring the Impact of Early-2025 AI on Experienced
  Open-Source Developer Productivity. metr.org.
