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

## Hands

Each play uses 2 to 5 cards from your hand. The play scores its best hand: **points × mult**.
Cards that aren't part of that hand are played but don't add anything.
The list and numbers live in `data/hands.js`; how each is recognized is in `js/hands.js`.

| Hand | Cards | Points | Mult | Score |
|------|-------|--------|------|-------|
| Pair | 2 with the same number | 10 | 2 | 20 |
| Set of 3 | 3 that are part of a full set | 10 | 2 | 20 |
| Three of a kind | 3 with the same number | 20 | 3 | 60 |
| Set of 4 | a full set | 20 | 3 | 60 |
| Two pair | 2 + 2 with the same number | 30 | 2 | 60 |
| Full house | 3 + 2 with the same number | 40 | 4 | 160 |
| Four of a kind | 4 with the same number | 50 | 5 | 250 |
| Five of a kind | 5 with the same number | 100 | 8 | 800 |

"Of a kind" means the same **number** (1 to 4 symbols), like ranks in poker.

**Sets.** For each of the four attributes (number, shape, shading, color), the cards are all the same or all different.
A set of 4 is a full set; a set of 3 is three cards that follow the same rule.
(The earlier "two pairs also count" set rule is off: `allowPairs` in `data/config.js`.)

**Wild cards** count as any value of their attribute. A wild number helps both sets and "of a kind" hands.

More hands, including a set of 5, are to come.

## The run (planned, not built yet)

A run plays like Balatro (ben, 2026-10-18):

- The run is a series of **antes**. Each ante has rounds you beat by scoring past a target.
- Between rounds there is a **shop**.
- Each ante ends with a **boss** round that plays a bit differently.
- Beating a round also gives a **reward** of its own, on top of reaching the shop.

Still to decide: the targets per ante, what rewards and the shop offer, and the boss rules.

## Card modifications

Modifications live in `data/modifiers.js`. A card lists the ones it has in `card.mods`, and a card can have more than one.

| Modification | Effect | Looks like |
|--------------|--------|------------|
| Wild suit | Counts as any shape when checking a set. | A circle in place of the suit. |
| Wild number | Counts as any number. | 5 symbols in a circle. |
| Wild color | Counts as any color. | Rainbow running diagonally across the card, red at top left to violet at bottom right. |
| Wild shading | Counts as any shading. | Polka dots inside the shapes. |

How a card gets a modification (shop, reward, joker) is still to decide. `gallery.html` shows examples of each, and of cards with several.

## The round (current version)

| Setting | Value | Config key |
|---------|-------|------------|
| Run deck | 30 cards drawn at random from the 256 | `runDeckSize` |
| Hand | 12 cards | `handSize` |
| Play size | 2 to 5 cards | `minPlay`, `maxPlay` |
| Plays | 4 per round | `plays` |
| Target | 150 points (placeholder) | `roundTarget` |
| Discards | 2 per round, up to 4 cards each | `discards`, `maxDiscardSize` |

1. Shuffle the 256 cards and take 30. That is your deck for the run.
2. Draw a hand of 12.
3. Select 2 to 5 cards and press **Play**. The game shows which hand they make before you play. Played cards are replaced from the deck.
4. Or select 1 to 4 cards and press **Discard** to swap them.
5. Reach the target within 4 plays to win the round.

There is only one round so far, and one player.

## Jokers

Jokers come in four rarities: **common, uncommon, rare, legendary**. None are defined yet.

## Open questions

- Do cards add their own points (like Balatro card chips), or does only the hand score?
- Round targets per ante.
- What happens between rounds (shop, adding/removing cards from the run deck)?
- Multiplayer: does "each person" mean players take turns on one board, or each has their own?
