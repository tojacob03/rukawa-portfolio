---
slug: scout-hq
eyebrow: League of Legends · opponent reports
title: One Page per Opponent, Facts Only
summary: For League of Legends I built a private scouting tool that turns five to seven Riot IDs into a one-page report for a coach. It states what the data shows and leaves every pick and ban decision to the staff.
date: 2026-11-12
metric: 5–7
metricLabel: Riot IDs per opponent become one printable page for the coach
stats: 30 days | of ranked games per player by default, up to 90; 4 | kinds of early deaths told apart; 0 | pick or ban recommendations
role: Design, build & analysis
stack: TypeScript, React, Supabase, Postgres, Riot API, Leaguepedia
---

## The job

A coach preparing for a Prime League match has a few hours and a lot of tabs: each player's ranked history, mastery, the team's official drafts, maybe a VOD. Scout HQ puts the answer on one page. You enter the opponent's players with their roles, and the report shows rank, champion pool, comfort picks and activity per player, then the team: ban candidates, champions several players share, players with small pools, and the drafts from their league games.

## League games first

Ranked games say what a player likes. League games say what the team does. Drafts from official matches come in every night from Leaguepedia, and once a team has ten league games in the period, the report builds its ban candidates from them: picks with record, bans the opponent drew, presence over the last 20 games, and the player's ranked games on that role underneath.

A ban rate alone is easy to misread. If every team in the league bans a champion, it is the meta, not a plan against this team. So next to each ban rate the report shows the rate against the other teams of the same league over the same period.

## What free tools don't show

- **Fearless depth.** In fearless series a champion is gone once either team has picked it. Per role the report counts the champions a team really plays, how many of them were still free before games 3 and 4, and how picks from game 3 on went inside and outside that pool.
- **Early deaths by type.** Deaths before minute 15 are split into dive (several enemies near the player's own tower), gank (enemy jungler involved), solo (one enemy at most) and fight. A team that dies to ganks needs a different plan from one that loses fights.
- **New in training.** A champion with three or more games in the last seven days that the player had not played at all before.
- **Pocket picks.** Champions a player plays in ranked or has high mastery on that the team never picked in league games.
- **Lane phase.** CS and CS difference at 10 minutes, gold and XP difference at 15, each against the direct opponent, and for junglers the starting side and where they first get involved.

## What it leaves out on purpose

The report states facts and makes no pick or ban recommendations; the judgement stays with the coach, and each report has room for the coach's own notes. It also leaves out everything Riot's policies rule out: MMR estimates, live game data, custom games and anything that would unmask anonymous players. It is private, behind a login, and a report is shared only with the team it was made for, as a page or a PDF.

## Where it goes next

For 2027 I am looking for an analyst role with a League of Legends team. Scout HQ is the tool I would bring: the reports, the draft import and the comparisons are built; what changes with a team is which opponents come first.
