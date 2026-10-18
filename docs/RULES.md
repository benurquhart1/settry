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
Every card you play has to be part of the hand: no extra cards.
For example, you can't play 4 cards when only 3 of them form a set.
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

## Starting decks and seeds

Pick a starting deck on the start menu (arrows to switch). Decks live in `data/decks.js`.

| Deck | Cards |
|------|-------|
| Red | 40 cards drawn from the 64 red cards |
| Blue | 40 cards drawn from the 64 blue cards |
| Green | 40 cards drawn from the 64 green cards |
| Black | 40 cards drawn from the 64 black cards |

Cards are drawn **with replacement**, so a deck can hold several copies of the same card.

Every game has a **seed** (shown on the start menu and during play). Every random thing in the game (building the deck, the deal, and later rewards and the shop) uses it, so the same seed and deck always play out the same.
All randomness must go through `js/rng.js`; never call `Math.random()` for game logic.

## The round (current version)

| Setting | Value | Config key |
|---------|-------|------------|
| Board | 16 cards in a 4x4 grid | `boardSize` |
| Play size | 2 to 5 cards | `minPlay`, `maxPlay` |
| Hands | 4 per round | `plays` |
| Target | 150 points (placeholder) | `roundTarget` |
| Discards | 2 per round, up to 4 cards each | `discards`, `maxDiscardSize` |

1. Your deck is shuffled (by the seed) into a draw pile, and 16 cards are dealt face up.
2. Select 2 to 5 cards. If they form a hand, the box on the right shows it with its points and mult. Press **Play hand** to score it.
3. Or select 1 to 4 cards and press **Discard** to swap them.
4. Played and discarded cards are replaced from the draw pile. When the pile is empty, their spots stay empty.
5. Reach the target within 4 hands to win the round.

**View deck** shows every card in your deck, sortable by color, number, shape or shading. Faded cards are used, outlined ones are on the board.

## Jokers

Jokers come in four rarities: **common, uncommon, rare, legendary**. None are defined yet.

## Open questions

- Do cards add their own points (like Balatro card chips), or does only the hand score?
- Round targets per ante.
- What happens between rounds (shop, adding/removing cards from the run deck)?
- Multiplayer: does "each person" mean players take turns on one board, or each has their own?
