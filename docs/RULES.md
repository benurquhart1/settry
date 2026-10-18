# Settry rules

Settry mixes Set (find matching trios of cards) with Balatro (a run of rounds, a deck you shape, and jokers that bend the rules).
This file is the source of truth for how the game should play. The numbers live in `data/config.js`; jokers live in `data/jokers.js`.
When a rule changes, update this file and the data file together.

## The cards

Each card has four attributes, each with four values:

| Attribute | Values |
|-----------|--------|
| Count | 1, 2, 3, 4 |
| Shape | heart, diamond, spade, club |
| Shading | empty, solid, striped, checkered |
| Color | red, green, blue, black |

Every combination is one card, so the full deck is 4 × 4 × 4 × 4 = 256 cards. Open `gallery.html` to see them all.

## What counts as a set

A set is **4 cards**. For each of the four attributes, the 4 cards must be one of:

- all the same (4 red),
- all different (red, green, blue, black), or
- two pairs (2 red and 2 blue).

Anything else (3 of one value and 1 of another, or a pair plus two singles) breaks the set.
For example: 1 red solid heart, 2 red solid spades, 3 blue solid hearts and 4 blue solid spades is a set (count all different, shape two pairs, shading all same, color two pairs).

Any 3 cards have exactly one 4th card that completes them, just like any 2 cards in classic Set have exactly one 3rd.

Why this rule (2026-10-18): with only "all same or all different", a 12-card board had a 4-card set just 6% of the time.
With two pairs allowed, a random 12-card board has a set about 91% of the time and holds about 2 on average, close to classic Set (about 97% and 2.8).
Keeping 3-card sets instead would make them far too easy (about 8 per 12-card board).
`setSize` and `allowPairs` in `data/config.js` switch between these rules.

## The run (planned, not built yet)

A run plays like Balatro (ben, 2026-10-18):

- The run is a series of **antes**. Each ante has rounds you beat by scoring past a target.
- Between rounds there is a **shop**.
- Each ante ends with a **boss** round that plays a bit differently.
- Beating a round also gives a **reward** of its own, on top of reaching the shop.

Still to decide: how a set scores, the targets per ante, what rewards and the shop offer, and the boss rules.

## Card modifications

Modifications live in `data/modifiers.js`. A card lists the ones it has in `card.mods`, and a card can have more than one.

| Modification | Effect | Looks like |
|--------------|--------|------------|
| Wild suit | Counts as any shape when checking a set. | One shape stitched from a quarter of each suit: heart top left, club top right, spade bottom left, diamond bottom right. |
| Wild number | Counts as any number. | 5 symbols in a circle. |
| Wild color | Counts as any color. | Rainbow running diagonally across the card, red at top left to violet at bottom right. |
| Wild shading | Counts as any shading. | Polka dots inside the shapes. |

How a card gets a modification (shop, reward, joker) is still to decide. `gallery.html` shows examples of each, and of cards with several.

## The round (current version)

| Setting | Value | Config key |
|---------|-------|------------|
| Run deck | 30 cards drawn at random from the 81 | `runDeckSize` |
| Board | 12 cards face up | `boardSize` |
| Set size | 4 cards, pairs allowed | `setSize`, `allowPairs` |
| Goal | make 4 sets | `setsToWin` |
| Discards | 2 per round | `discards` |
| Discard size | up to 4 cards each | `maxDiscardSize` |

1. Shuffle the 256 cards and take 30. That is your deck for the run.
2. Deal 12 face up.
3. Select 4 cards and press **Play set**. If they form a set, it counts and the 4 cards are replaced from the deck. If not, nothing happens.
4. Or select 1 to 4 cards and press **Discard** to swap them for new cards from the deck. You have 2 discards.
5. Make 4 sets to win. You lose when the board has no set and you have no discards left (or the deck is empty).

There is only one round so far, and one player.

## Jokers

Jokers come in four rarities: **common, uncommon, rare, legendary**. None are defined yet.

## Open questions

- With 4 sets of 4 cards to make, a 30-card deck leaves little room for discards. Is 30 still right?
- Should a wrong set cost anything (a discard, points, a life)?
- Scoring: is a round only win/lose, or do sets score points like Balatro hands?
- What happens between rounds (shop, adding/removing cards from the run deck)?
- Multiplayer: does "each person" mean players take turns on one board, or each has their own?
