# Settry rules

Settry mixes Set (find matching trios of cards) with Balatro (a run of rounds, a deck you shape, and jokers that bend the rules).
This file is the source of truth for how the game should play. The numbers live in `data/config.js`; jokers live in `data/jokers.js`.
When a rule changes, update this file and the data file together.

## The cards

Each card has four attributes, each with three values:

| Attribute | Values |
|-----------|--------|
| Count | 1, 2, 3 |
| Shape | oval, diamond, squiggle |
| Shading | solid, shaded (striped), empty |
| Color | red, green, blue |

Every combination is one card, so the full deck is 3 × 3 × 3 × 3 = 81 cards.

## What counts as a set

Three cards form a set when, for each of the four attributes, the three cards are either all the same or all different.
For example, one red solid oval, two red shaded ovals and three red empty ovals is a set (count differs, shape same, shading differs, color same).

## A run (current version)

| Setting | Value | Config key |
|---------|-------|------------|
| Run deck | 30 cards drawn at random from the 81 | `runDeckSize` |
| Board | 12 cards face up | `boardSize` |
| Goal | make 4 sets | `setsToWin` |
| Discards | 2 per round | `discards` |
| Discard size | up to 4 cards each | `maxDiscardSize` |

1. Shuffle the 81 cards and take 30. That is your deck for the run.
2. Deal 12 face up.
3. Select 3 cards and press **Play set**. If they form a set, it counts and the 3 cards are replaced from the deck. If not, nothing happens.
4. Or select 1 to 4 cards and press **Discard** to swap them for new cards from the deck. You have 2 discards.
5. Make 4 sets to win. You lose when the board has no set and you have no discards left (or the deck is empty).

There is only one round so far, and one player.

## Jokers

Jokers come in four rarities: **common, uncommon, rare, legendary**. None are defined yet.

## Open questions

- Should a wrong set cost anything (a discard, points, a life)?
- Scoring: is a round only win/lose, or do sets score points like Balatro hands?
- What happens between rounds (shop, adding/removing cards from the run deck)?
- Multiplayer: does "each person" mean players take turns on one board, or each has their own?
