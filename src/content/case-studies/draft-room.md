---
slug: draft-room
eyebrow: Brawl Stars · match prep
title: A Draft Board That Shows Its Working
summary: The public Brawl Stars tools are built for ranked players. A team preparing a best of five needs the opponent's own pool, the map draft, global bans and an honest estimate, so I built that, with every suggestion split into the parts it is made of.
date: 2026-11-13
metric: 25
metricLabel: games the official battle log keeps per player; Draft Room stores every sync
stats: 3 : 1 | weight of a pro game against a ranked game; 20 | games a map record needs before it outweighs the prior; 71 | automated tests, from the model to the sync
role: Design, build & analysis
stack: TypeScript, React, TanStack Start, Postgres, Brawl Stars API
ctaLabel: Ask me for a walkthrough →
---

## What the public tools miss

There are good Brawl Stars tools for players: tier lists per map, counter tables, pick assistants and draft practice for ranked. I went through all of them before I started. What none of them does is prepare a team for one opponent in the competitive format, where a match is a best of five maps, each team has two global bans for the whole match, and every map starts with three blind bans per team before the picks go 1-2-2-1.

For that you need three things a ranked tool cannot give you. The opponent's own pool, from their own games. The order of maps the draft is likely to produce. And a number for the series, not only for one map.

## Where the numbers come from

The official battle log only keeps a player's last 25 games. Draft Room stores every sync, so the history of a roster keeps growing. An hourly job syncs the teams that matter first: my own team and pinned opponents every hour, opponents I am preparing against and top-tier teams every hour, everyone else every three hours. With time left in a run it reads a rotating slice of the global top 200 and keeps only their drafted games, so tier lists rest on more than the teams I track.

Not every game counts the same. A game of a tracked pro team counts three times as much as a ranked game, a friendly (where scrims happen) twice, trophy ladder a fifth. Older games fade with a half-life of 30 days.

![Draft board in the demo: Harbor Lights picks fourth on Pit Stop, the top suggestion Pam at +17.5 split into map strength, pick rate, synergy with Hank, matchups and comfort](/projects/draft-room/draft-board.jpg)

## A 3-0 is not a 60 %

Small samples are the main danger in esports numbers. A brawler that went 3-0 on a map should not rank above one that went 120-80 there. Every win rate in Draft Room shrinks towards the level above it: a map's towards the mode's, the mode's towards the brawler's overall rate, and that towards 50 %. The prior is worth 20 games, so a map record has to be about that long before it speaks for itself.

My first version had this wrong in two ways. The prior for a map included the map's own games, so they were counted twice and small samples still looked confident. And synergy was measured against the overall average, so two strong brawlers looked like a good pair only because both were strong. Now each prior leaves out the games it is judging, and a pair is measured against what the two brawlers' own rates predict, without the games they played together.

## Every suggestion shows its parts

A suggestion is a sum of named parts in win-rate points: strength on this map, how often good teams pick it, synergy with the picks already made, matchups into the enemy picks, and how much the roster plays it. In the demo above, Pam on Pit Stop scores +17.5, and +8.6 of that is the map. A coach can disagree with a part and still use the rest, which is not possible with a single score.

The same parts drive a practice mode. The bot does not draft what is best; it drafts what the opponent's record says they are likely to pick, so the practice is against this opponent and not against a perfect drafter.

![Match prep: map pool with records for both teams, the likely map draft and the series projection](/projects/draft-room/match-prep.jpg)

## From one map to the series

Match prep puts the opponent's map pool next to ours, combines both records into a chance per map, and plays the map draft through: each team takes its best open map. The series chance is computed for first to three over that order, and the page says which side to choose and which two global bans hurt the opponent most.

![Map page: the layout, the five best brawlers right now and the full tier list for Hard Rock Mine](/projects/draft-room/map-page.jpg)

## What it does not do

It reads public battle logs, nothing else. Scrims are only visible when they were played as friendly games, and a prepared strategy that a team has never played in public cannot show up. The suggestions are a starting point for the staff, not a decision. The demo uses invented teams and players; the real workspace is private and only approved staff can open it.
