---
slug: draft-room
eyebrow: Brawl Stars · match prep
title: A Draft Board That Shows Its Working
summary: The public Brawl Stars tools are built for ranked players. A team preparing a best of five needs the opponent's own games against other teams, the map draft, global bans and an honest estimate, so I built that, with every suggestion split into the parts it is made of.
date: 2026-11-13
metric: 25
metricLabel: games the official battle log keeps per player; Draft Room stores every sync
stats: 27 : 1 | weight of a game between two teams against a ranked game; 20 | games a map record needs before it outweighs the prior; 78 | automated tests, from the model to the sync
role: Design, build & analysis
stack: TypeScript, React, TanStack Start, Postgres, Brawl Stars API
ctaLabel: Ask me for a walkthrough →
---

## What the public tools miss

There are good Brawl Stars tools for players: tier lists per map, counter tables, pick assistants and draft practice for ranked. I went through all of them before I started. What none of them does is prepare a team for one opponent in the competitive format. In the 2026 rulebook a match is a best of five sets, each set a best of three games on one map. The teams draft the maps in turn, one per mode, and each bans two brawlers for the whole match. Before every set each player bans one more brawler blind, then the picks go 1-2-2-1.

For that you need three things a ranked tool cannot give you. The opponent's own games against other teams. The order of maps the draft is likely to produce. And a number for the match, not only for one game.

## Where the numbers come from

The official battle log only keeps a player's last 25 games. Draft Room stores every sync, so the history of a roster keeps growing. An hourly job syncs the teams that matter first: my own team and pinned opponents every hour, opponents I am preparing against and top-tier teams every hour, everyone else every three hours. With time left in a run it reads a rotating slice of the global top 200 and keeps only their drafted games, so tier lists rest on more than the teams I track.

Not every game counts the same, and that is where my first version was wrong. It counted a pro stack in ranked three times, a scrim only twice. But ranked is a different game: random opponents, no prepared plan. Now every game is sorted by what it was. A game between two tracked teams outside the ranked queue (a scrim or an official match) counts most, a friendly against an untracked team half as much, and ranked stays a faint background, about one twenty-seventh of a team game, that only fills gaps where no team has played a brawler. The trophy ladder is out. A switch on every page shows the numbers from team games alone, and each page says how many games of which kind stand behind it. Older games fade with a half-life of three weeks.

![Draft board in the demo: Harbor Lights picks fourth on Pit Stop, the top suggestion Sprout at +32.8 split into map strength, pick rate, synergy with Pam, matchups and comfort](/projects/draft-room/draft-board.jpg)

## A 3-0 is not a 60 %

Small samples are the main danger in esports numbers. A brawler that went 3-0 on a map should not rank above one that went 120-80 there. Every win rate in Draft Room shrinks towards the level above it: a map's towards the mode's, the mode's towards the brawler's overall rate, and that towards 50 %. The prior is worth 20 games, so a map record has to be about that long before it speaks for itself.

My first version had this wrong in two ways. The prior for a map included the map's own games, so they were counted twice and small samples still looked confident. And synergy was measured against the overall average, so two strong brawlers looked like a good pair only because both were strong. Now each prior leaves out the games it is judging, and a pair is measured against what the two brawlers' own rates predict, without the games they played together.

## Every suggestion shows its parts

A suggestion is a sum of named parts in win-rate points: strength on this map, how often good teams pick it, synergy with the picks already made, matchups into the enemy picks, and how much the roster plays it. In the demo above, Sprout on Pit Stop scores +32.8: +9.8 from the map, +14.0 next to Pam and +8.9 into Ziggy and Belle. A coach can disagree with a part and still use the rest, which is not possible with a single score.

The same parts drive a practice mode. The bot does not draft what is best; it drafts what the opponent's record says they are likely to pick, so the practice is against this opponent and not against a perfect drafter.

![Match prep: set chance per map from both teams' records in team games, the likely map draft and the match projection](/projects/draft-room/match-prep.jpg)

## From one game to the match

Match prep puts the opponent's map pool next to ours and combines both records into the chance to win one game on each map. A set is a best of three, so that becomes the chance to win two games first, p²(3−2p): 60 % per game is 65 % per set. Treating a map as a single game, as my first version did, understates every favourite. Then it plays the map draft through, each team taking its best open map, computes the match as first to three sets over that order, and says which side to choose and which two global bans hurt the opponent most.

Below that come the opponent's meetings with other tracked teams, rebuilt from the battle logs into sets and matches: which looked like the real format, their set record per mode, the mode they open with, the mode they never play. What the logs can't show, the map draft and the bans, I enter from the VOD in about two minutes per match; the page then shows the opponent's global bans, their first map pick and their blind bans per mode.

![Map page: the layout, the five best brawlers right now and the full tier list for Hard Rock Mine](/projects/draft-room/map-page.jpg)

## What it does not do

It reads public battle logs and the drafts I enter, nothing else. Scrims are only visible when they were played as friendly games, games on LAN may not appear at all, and a prepared strategy that a team has never played cannot show up. The suggestions are a starting point for the staff, not a decision. The demo uses invented teams and players; the real workspace is private and only approved staff can open it.
