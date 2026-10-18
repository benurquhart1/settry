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

Each play uses 2 to 4 cards from the board (5 with the Fifth Card joker). The play scores its best hand, Balatro-style:

1. Start with the hand's points and mult (table below).
2. Each played card adds its own points, one at a time, **in the order you selected them**: a card adds its number (1 to 4), and a wild number adds 5.
3. Score = points × mult.

For example, a set of 4 with numbers 2, 4, 3, 1 scores (20 + 2 + 4 + 3 + 1) × 3 = 90.
On screen, selected cards move to a row above the board in the order you clicked them (and fade on the board), and score one by one when you play.
Every card you play has to be part of the hand: no extra cards.
For example, you can't play 4 cards when only 3 of them form a set.
The list and numbers live in `data/hands.js`; how each is recognized is in `js/hands.js`.

| Hand | Cards | Points | Mult | Score |
|------|-------|--------|------|-------|
| Pair | 2 identical cards | 10 | 2 | 20 |
| Set of 3 | 3 that are part of a full set | 10 | 2 | 20 |
| Three of a kind | 3 identical cards | 20 | 3 | 60 |
| Set of 4 | a full set | 20 | 3 | 60 |
| Two pair | 2 identical + 2 identical | 30 | 2 | 60 |
| Full house | 3 identical + 2 identical | 40 | 4 | 160 |
| Four of a kind | 4 identical cards | 50 | 5 | 250 |
| Five of a kind | 5 identical cards | 100 | 8 | 800 |

"Of a kind" means **identical cards**: the same number, shape, shading and color (ben, 2026-10-18). Decks are drawn with replacement, so duplicates happen. A wild attribute matches anything.

**Sets.** For each of the four attributes (number, shape, shading, color), the cards are all the same or all different.
A set of 4 is a full set; a set of 3 is three cards that follow the same rule.
(The earlier "two pairs also count" set rule is off: `allowPairs` in `data/config.js`.)

**Wild cards** count as any value of their attribute. Wilds help both sets and "of a kind" hands.

More hands, including a set of 5, are to come.

## The run

A run plays like Balatro (ben, 2026-10-18). Numbers live in `data/config.js`.

- You start with **$5** and your starting deck. Your deck carries over from round to round, and it's fully reshuffled at the start of each round.
- The run has **8 antes**, each with **3 rounds**: small, big and boss. Beat the boss of ante 8 to win the run. Fail to reach a round's target and the run is over.

| Round | Target | Reward |
|-------|--------|--------|
| Small | ante target × 1 | $3 |
| Big | ante target × 1.5 | $5 |
| Boss | ante target × 2 | $8 |

Ante targets (placeholders, to tune): 100, 250, 600, 1500, 3500, 6500, 11500, 16500.

When you win a round you also get **$1 for each unused hand**, plus **interest of $1 for every $5 you hold, up to $5** (both like Balatro).
Boss rounds don't have special rules yet.

## The shop

After each round you cash out and visit the shop (`js/shop.js`, packs in `data/packs.js`).

- **2 jokers** for sale (the Shopkeeper joker adds a third). Prices: common $4, uncommon $6, rare $10, unique $16. You can hold 5 jokers.
- **2 packs** for sale, picked at random by how common each pack is. Buying a pack opens it: choose from its options or skip.
- **Reroll** replaces the jokers for sale (not the packs). The first reroll in each shop costs $4, then $1 more each time.
- **Sell** a joker for half its price, rounded down (at least $1), while in the shop.

| Pack | Price | Contents |
|------|-------|----------|
| Standard | $4 | Choose 1 of 3 cards to add to your deck |
| Jumbo Standard | $6 | Choose 1 of 5 cards |
| Mega Standard | $8 | Choose 2 of 5 cards |
| Buffoon | $4 | Choose 1 of 2 jokers |
| Jumbo Buffoon | $6 | Choose 1 of 4 jokers |
| Mega Buffoon | $8 | Choose 2 of 4 jokers |

Pack cards can be any of the 256 cards, and each has a 25% chance of one wild modification.
Jokers in the shop and in packs use the joker drop rates. Until saves exist, locked jokers can still show up (`ignoreUnlocks`), but TBD jokers never do.

The seed drives separate streams for building the deck, shuffling, the shop, packs and luck rolls, so rerolling the shop never changes which cards you draw.

## Card modifications

Modifications live in `data/modifiers.js`. A card lists the ones it has in `card.mods`, and a card can have more than one.

| Modification | Effect | Looks like |
|--------------|--------|------------|
| Wild suit | Counts as any shape when checking a set. | A circle in place of the suit. |
| Wild number | Counts as any number. Adds 5 points when it scores. | 5 symbols in a circle. |
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
| Heart | 40 cards drawn from the 64 hearts |
| Diamond | 40 cards drawn from the 64 diamonds |
| Spade | 40 cards drawn from the 64 spades |
| Club | 40 cards drawn from the 64 clubs |
| Solid | 40 cards drawn from the 64 solid cards |
| Shaded | 40 cards drawn from the 64 striped cards |
| Empty | 40 cards drawn from the 64 empty cards |
| Checkered | 40 cards drawn from the 64 checkered cards |
| Free for all | 40 cards drawn from all 256 |

Cards are drawn **with replacement**, so a deck can hold several copies of the same card.

Every game has a **seed** (shown on the start menu and during play). Every random thing in the game (building the deck, the deal, and later rewards and the shop) uses it, so the same seed and deck always play out the same.
All randomness must go through `js/rng.js`; never call `Math.random()` for game logic.

## The round (current version)

| Setting | Value | Config key |
|---------|-------|------------|
| Board | 16 cards in a 4x4 grid | `boardSize` |
| Play size | 2 to 4 cards (5 with the Fifth Card joker) | `minPlay`, `maxPlay` |
| Hands | 4 per round | `plays` |
| Discards | 2 per round, up to 4 cards each | `discards`, `maxDiscardSize` |

1. Your deck is shuffled (by the seed) into a draw pile, and 16 cards are dealt face up.
2. Select 2 to 4 cards (5 with Fifth Card). If they form a hand, the box on the right shows it with its points and mult. Press **Play hand** to score it.
3. Or select 1 to 4 cards and press **Discard** to swap them.
4. Played and discarded cards are replaced from the draw pile. When the pile is empty, their spots stay empty.
5. Reach the round's target within 4 hands to win it.

**View deck** shows every card in your deck, sortable by color, number, shape or shading. Faded cards are used, outlined ones are on the board.

## Jokers

Jokers live in `data/jokers.js` (effects are data; `js/jokers.js` applies them). `jokers.html` shows every joker card.
A joker card has art on the top half, its name in the middle and a text box at the bottom. Names and art are placeholders.
You can hold up to 5 (`jokerSlots`). Scoring jokers apply **left to right**, after the cards have added their points.
Buy them in the shop or find them in Buffoon packs. You can also pick test jokers on the start menu to start a run with.

**Drop rates** (by rarity): common 60%, uncommon 25%, rare 12%, unique 3%. Legendary jokers never drop.
Many jokers will need to be unlocked first (`unlocked` in the data; all are unlocked for now).

**Words used on jokers**
- A **difference** is, in a set, each attribute that is all different; in an of-a-kind hand, each group of identical cards (a pair has 1, two pair has 2).
- A **match** is, in a set, each attribute that is all the same; in an of-a-kind hand, each card (a pair has 2, three of a kind has 3).

| Rarity | Joker | Effect |
|--------|-------|--------|
| Common | Encore | +1 mult for each time this hand has been played this game (including this play). |
| Common | Variety | +1 mult for each difference in the hand. |
| Common | Overtime | +1 hand each round. |
| Common | Recycler | +1 discard each round. |
| Uncommon | Big Table | +2 cards on the board. |
| Uncommon | Odd One Out | Earn $1 for each difference in the hand. |
| Uncommon | Birds of a Feather | Earn $1 for each match in the hand. |
| Uncommon | Shopkeeper | +1 joker for sale in the shop. |
| Uncommon | Numberfile | +1 mult for each different number played. |
| Rare | Kaleidoscope | Multiply mult by the number of differences in the hand. |
| Rare | Mirror | Multiply mult by the number of matches in the hand. No matches scores 0. |
| Rare | Fifth Card | Play up to 5 cards at a time (the normal limit is 4). |
| Rare | Copycat | If your first discard of the round is 1 card, add a copy of it to your deck. |
| Rare | Shredder | If your first discard of the round is 1 card, remove it from your deck. |
| Rare | Full Spectrum | ×5 mult if the hand is a set with every attribute different. |
| Unique | Recycle | Played and discarded cards go straight back into the draw pile (at random spots). Unlock: run out of cards in the draw pile. |

**Deck jokers** (common, ben 2026-10-18): one per starting deck, unlocked by beating that deck.

| Joker | Effect |
|-------|--------|
| Red Joker | +1 mult for each red card played. |
| Blue Joker | +10 points for each blue card played. |
| Green Joker | Each green card played has a 50% chance to earn $1. |
| Black Joker | TBD. |
| Diamond Joker | Each diamond played has a 50% chance of ×2 mult. |
| Spade Joker | TBD. |
| Heart Joker | TBD. |
| Club Joker | TBD. |

Chance effects are rolled with the game's seed, once, when the hand is played; the preview just shows the odds.
A wild card counts as every color (or suit) for these jokers.

Legendary jokers: to come.

Unlocks are listed but not tracked yet: that needs user accounts and saves (see `docs/TODO.md`). The test picker on the start menu offers every joker, locked or not.

## Open questions

- Do cards add their own points (like Balatro card chips), or does only the hand score?
- Round targets per ante.
- What happens between rounds (shop, adding/removing cards from the run deck)?
- Multiplayer: does "each person" mean players take turns on one board, or each has their own?
