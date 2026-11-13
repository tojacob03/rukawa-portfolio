---
slug: deck-prediction-backtest
eyebrow: Esports · checking my own tool
title: How Often My Deck Predictions Are Right
summary: My analysis tool ranks the decks an opponent is likely to play next. I had used it for months without ever measuring how often it is right. So I replayed 5,334 duels, let the tool predict each one from earlier games only, and counted the hits. One setting turned out to be wrong.
date: 2026-11-13
metric: 63 %
metricLabel: of deciding third games where the exact deck played was in the tool's top three
stats: 5,334 | duels replayed, each predicted only from earlier games; 40 % | of third games called exactly with the first guess; 1 % | hit rate when guessing the most popular deck of the moment
role: Analysis & build
stack: Python, PostgreSQL, TypeScript
featured: true
---

## Why I measured it

[My analysis platform](/work/player-analysis-tooling) ranks the decks an opponent is likely to bring: before a set for the opener, and during a set for what is still left after the cards already used are gone. I used that ranking in real preparation. What I could not tell anyone was how often it is right. "It feels right" is not a number, and a coach who gets a ranking from me should know how much weight it can carry.

## The test

The data is 8,659 duels in the CRL format (best of three, no card twice in a set) from the 515 players in my tracking database, played between 2 June and 13 November 2026.

For every duel of a player with at least ten earlier duels, I did what I would do before a real set:

1. Build the ranking using only duels played *before* this one.
2. Compare it with what the player then actually played.
3. For games 2 and 3, first remove every deck that shares a card with a deck already used in this set, as the tool does live.

That leaves 5,334 tested duels from 214 players. A hit is strict: the exact eight cards. A deck that differs by one card counts as a miss.

## What came out

| | First guess right | In the top three |
| --- | --- | --- |
| Game 1 (opener) | 21.5 % | 40.2 % |
| Game 2 | 27.7 % | 57.3 % |
| Game 3 | 39.9 % | 63.2 % |

*Later half of the tested duels (2,667 duels, 1,085 of them with a third game). Why only the later half is explained below.*

Two comparisons show what these numbers are worth:

- **Guessing the popular deck.** If I name the opener that all other players used most in the two weeks before, I am right 1.0 % of the time, and 3.9 % with three guesses. Players at this level do not open with "the meta deck". What a player has done before says far more than what everyone else is doing.
- **"Same as last time."** If I simply name the opener from the player's previous duel, I am right 21.4 % of the time. That is as good as the tool's first guess for game 1. For a single guess at the opener, the tool adds nothing over a good memory. Its value is in the top three, and in games 2 and 3.

## Where the value comes from

The step that matters most is removing the used cards. Without it, the same ranking calls game 3 exactly 16 % of the time. With it, 39 %. For game 2 it is 18 % against 27 %. (These four numbers are over all 5,334 duels.)

This is the part that is hard to do by hand in the minutes between two games: go through everything a player has ever shown and strike out each deck that is no longer possible. The longer the set runs, the fewer decks are left and the better the call gets. That is why game 3 is the easiest to predict, not the hardest.

## The setting that was wrong

The tool weights recent duels more than old ones. I had set it so that a duel counts half after 21 days. I picked that number once and never checked it.

The test says it was far too long:

| A duel counts half after | Game 1, top three | Game 2, top three | Game 3, top three |
| --- | --- | --- | --- |
| 21 days (old) | 32.8 % | 46.8 % | 57.1 % |
| 7 days | 38.5 % | 54.5 % | 61.8 % |
| **3 days (new)** | **40.2 %** | **57.3 %** | **63.2 %** |

*Same later half of the duels as above.*

To avoid fooling myself, I chose the new value on the earlier half of the duels only (before 31 August) and then checked it on the later half, which had played no part in the choice. The gain holds there. All numbers in this write-up for the new setting come from that later half or are marked otherwise.

In plain terms: what a player practised this week says much more about their next set than what they played three weeks ago. The tool now uses three days.

## What the tool cannot see

- **About half of all openers are new.** In 48 % of duels the player opened with a deck they had never opened with in my data before. No ranking built on history can contain a deck that has not been played yet. For game 1, a top-six list tops out near 50 % for that reason.
- **Exact decks are a strict target.** A player who swaps one card has, for this test, played a different deck. For preparation the win condition often matters more than the eighth card. I have not measured hit rates per archetype yet, so I make no claim about them.
- **Most of the data is practice.** Only 113 of the tested duels are tournament duels, from 25 players. There the hit rates are higher (opener in the top three: 72 %, game 2: 91 %), probably because players bring what they practised. But 113 duels, with only 38 third games, are too few to promise that, and this subset was not part of the held-back check.

## What changes in my work

- A ranking I hand to a coach now comes with its hit rate: roughly two in five for the opener, three in five from game 2 on, both for the top three.
- Preparation covers three decks, not one. The first guess alone is right too rarely to build a plan on.
- The weighting is three days instead of 21, and the test is a script in the tool's repository. When the data or the logic changes, I run it again instead of trusting the old numbers.

*Unofficial analysis of public battle logs. Not affiliated with Supercell.*
