# Settry rules

Settry mixes Set (find matching trios of cards) with Balatro (a run of fights, a deck you shape, and jokers that bend the rules).
This file is the source of truth for how the game should play. The numbers live in `data/config.js`; jokers live in `data/jokers.js`.
When a rule changes, update this file and the data file together.

## The cards

Each card has four attributes:

| Attribute | Values |
|-----------|--------|
| Count | 1, 2, 3, 4, 5 |
| Shape | heart, diamond, spade, club |
| Shading | empty, solid, striped, checkered |
| Color | red, green, blue, black |

Starting decks and Standard packs only use numbers 1 to 4 (256 cards, `SETTRY_START_COUNTS`). 5s only come from the Count Up charm, which adds 1 to a card's number and wraps 5 back to 1 (ben, 2026-10-18). Counting 5s there are 320 cards. Open `gallery.html` to see them all.

## Hands

Each play uses 1 to 4 cards from the board (5 with the Fifth Card joker). The play scores its best hand, Balatro-style:

1. Start with the hand's points and mult (table below).
2. Each played card adds its own points, one at a time, **in the order you selected them**: a card adds its number (1 to 5), then applies its enhancement, if it has one.
3. Steel cards still on the board (not played) apply.
4. Jokers apply, left to right.
5. Score = points × mult.

For example, a set of 4 with numbers 2, 4, 3, 1 scores (20 + 2 + 4 + 3 + 1) × 3 = 90.
On screen, selected cards move to a row above the board in the order you clicked them (and fade on the board), and score one by one when you play.
Every card you play has to be part of the hand: no extra cards.
For example, you can't play 4 cards when only 3 of them form a set.
The list and numbers live in `data/hands.js`; how each is recognized is in `js/hands.js`.

| Hand | Cards | Points | Mult | Score |
|------|-------|--------|------|-------|
| High card | any 1 card | 5 | 1 | 5 |
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

A run is a ladder of **20 fights**, then endless mode (ben, 2026-10-18, moving away from Balatro's antes). Fights, targets and rewards live in `data/fights.js`; other numbers in `data/config.js`.

- You start with **$5** and your starting deck. Your deck carries over from fight to fight, and it's fully reshuffled at the start of each fight.
- Every run starts with a free **Starting Jokers** pack: choose 1 of 3 jokers (normal drop rates), or skip.
- Before each fight you **choose one of 2 opponents**. Each shows its target (points needed), its reward, and any modifier.
- **Every 4th fight is a boss** (fights 4, 8, 12, 16 and 20), with 3 regular fights in between. Fail to reach a fight's target and the run is over.
- Beat fight 20 to win the run. Then you can keep going in **endless mode** (like Balatro), where targets keep growing.

| Fight | Opponents on offer | Reward | Target |
|-------|--------------------|--------|--------|
| Regular | two of: $3, $5, $8 (always different) | as shown | base × 1, × 1.3, × 1.7 |
| Boss | two bosses with different modifiers | $10 | base × 2 (Giant × 1.5 more) |

**Prizes** (ben, 2026-10-18). On top of the money, each regular opponent offers a prize from the reward pool for its place in the group of 4 (`rewardPools` in `data/fights.js`). The two opponents always offer different prizes. Winning opens the prize like a pack: choose from it, or skip.
"Jokers" means jokers rolled with the normal drop rates. Card prizes have numbers 1 to 4. "Deck cards" only include cards your starting deck could have. Modified cards have a 30% chance (boosted cards: always) of one wild or enhancement, such as Steel.

| Fight in the group | Prize pool (choose X of Y) |
|--------------------|----------------------------|
| 1st (fights 1, 5, 9, ...) | Common jokers 1 of 3 · Jokers 1 of 2 · Cards 2 of 5 (may be modified) · Charms 1 of 4 |
| 2nd | Common jokers 1 of 4 · Jokers 1 of 3 · Uncommon jokers 1 of 2 · Deck cards 2 of 5 (may be modified) · Charms 2 of 3 |
| 3rd | Common jokers 2 of 5 · Uncommon jokers 1 of 4 · Rare joker 1 of 1 (may be unique) · Jokers 1 of 5 · Charms 2 of 5 · Boosted deck cards 2 of 5 |
| Boss | No prize: each boss instead sets a bonus for the shop that follows (`SETTRY_SHOP_MODIFIERS`) |

| Boss shop bonus | Effect |
|-----------------|--------|
| Free packs | Packs in that shop cost $0. |
| Free rerolls | Rerolls start at $0 (then +$1 each). |
| Extra joker | 1 more joker for sale (also after rerolls). |
| Extra packs | 2 more packs for sale. |

Base targets (placeholders, scaling to be worked on): 100 for fights 1-4, 300 for 5-8, 800 for 9-12, 2000 for 13-16, 5000 for 17-20, then × 2.5 for each further group of 4 in endless mode.

**Boss modifiers** (`SETTRY_BOSS_MODIFIERS`; usually only bosses have one, more to come from ben):

| Modifier | Effect |
|----------|--------|
| Red / Green / Blue / Black Ban | Cards of that color don't score. |
| Heart / Diamond / Spade / Club Ban | Cards of that suit don't score. |
| Giant | The target is 1.5 times bigger. |
| Short Hands | You can only play up to 3 cards. |

A card that doesn't score still counts toward making the hand, but adds no points, its enhancement does nothing, and jokers ignore it. It looks greyed out on the board. A wild card only counts as banned if its own value is the banned one.

**Joker slots** start at **2**. Each boss before the final one (fights 4, 8, 12 and 16) gives **+1 slot**, up to **6**. The final boss and endless mode don't add slots.

When you win a fight you also get **$1 for each unused hand** (like Balatro).
There is **no standard interest** (ben, 2026-10-18): interest only comes from the Credit Union, Bank and Treasury jokers.
At cash out, after the reward and unused hands are added, money jokers apply left to right, each on the running balance: interest, Day Trader and Gambler rolls, and Loan Shark's debt interest. Money amounts are rounded to whole dollars (interest down, debt interest up).

**Debt.** Your money can't go below $0 unless you hold the Loan Shark joker; with it, you can spend down to -$49. You lose the run if your money reaches -$50, or if you are below $0 without the Loan Shark (for example after selling it while in debt).

## The shop

The shop only opens **after boss fights** (ben, 2026-10-18), including in endless mode (`js/shop.js`, packs in `data/packs.js`). After a regular fight you cash out and go straight to choosing the next opponent.

- **2 jokers** for sale (the Shopkeeper joker adds a third). Prices: common $4, uncommon $6, rare $10, unique $16. You can only buy one if you have a free joker slot.
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
| Charm | $4 | Choose 1 of 3 charms |
| Jumbo Charm | $6 | Choose 1 of 5 charms |
| Mega Charm | $8 | Choose 2 of 5 charms |

Pack cards can be any of the 256 cards numbered 1 to 4, and each has a 25% chance of one wild modification.
Charms you take from a pack go into your charm slots; with both full, use or sell one first.
Jokers in the shop and in packs use the joker drop rates. Until saves exist, locked jokers can still show up (`ignoreUnlocks`), but TBD jokers never do.

The seed drives separate streams for building the deck, shuffling, the shop, packs and luck rolls, so rerolling the shop never changes which cards you draw.

## Card modifications

Modifications live in `data/modifiers.js`. A card lists the ones it has in `card.mods`, and a card can have more than one (unlike Balatro, wilds stack).
There is no wild number any more (ben, 2026-10-18): numbers run 1 to 5 instead.

| Modification | Effect | Looks like |
|--------------|--------|------------|
| Wild suit | Counts as any shape when checking a set. | A circle in place of the suit. |
| Wild color | Counts as any color. | Rainbow running diagonally across the card, red at top left to violet at bottom right. |
| Wild shading | Counts as any shading. | Polka dots inside the shapes. |

Cards get wilds from Standard packs (25% chance of one) and from the Prism and Circle charms. `gallery.html` shows examples of each, of cards with several, and of each enhancement.

### Enhancements

Also in `data/modifiers.js` (`SETTRY_ENHANCEMENTS`). A card has at most one, in `card.enh`; giving it a new one replaces the old (like Balatro).
An enhanced card has a tinted background and a tag along the bottom.

| Enhancement | Effect |
|-------------|--------|
| Mult | +4 mult when scored. |
| Bonus | +30 points when scored (on top of its number). |
| Lucky | When scored: 1 in 5 chance of +20 mult, and 1 in 15 chance of $20. |
| Glass | ×2 mult when scored. 1 in 4 chance to break, which removes it from your deck. |
| Steel | ×5 mult for each Steel card still on the board (not played) when you play a hand. |

Steel follows Balatro's "held in hand" rule, with the board as your hand; ben set it to ×5 (Balatro's is ×1.5).
Lucky and Glass chances are rolled with the seed when the hand is played; the preview shows the odds.

## Charms (consumables)

Charms are one-use cards, like Balatro's tarot cards (ben, 2026-10-18). They live in `data/consumables.js`; `js/consumables.js` applies them.
You hold up to **2** (`consumableSlots`). They come from Charm packs in the shop. Sell one for $1 in the shop.
Card charms work on cards you select on the board during a round: select the cards, then press **Use**. Money charms can be used any time.
Changes to a card stay for the rest of the run.

| Charm | Effect |
|-------|--------|
| Red / Green / Blue / Black Paint | Turn up to 3 selected cards that color. |
| Count Up | +1 number on up to 2 selected cards (5 wraps to 1). |
| Prism | Make 1 selected card wild color. |
| Circle | Make 1 selected card wild suit. |
| Fire | Make up to 2 selected cards Mult cards. |
| Bonus | Make up to 2 selected cards Bonus cards. |
| Clover | Make up to 2 selected cards Lucky cards. |
| Glass | Make 1 selected card a Glass card. |
| Steel | Make 1 selected card a Steel card. |
| Piggy Bank | Double your money (gain up to $20). |
| Echo | Create the last charm you used this run (not Echo). |
| Appraisal | Gain the total sell value of your jokers (up to $50). |

Names and art are placeholders. The card counts follow Balatro's matching tarots.

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
| Board | 12 cards, 4 across and 3 down (was 16; ben trying 12, 2026-10-18) | `boardSize` |
| Play size | 1 to 4 cards (5 with the Fifth Card joker) | `minPlay`, `maxPlay` |
| Hands | 4 per round | `plays` |
| Discards | 2 per round, up to 4 cards each | `discards`, `maxDiscardSize` |

1. Your deck is shuffled (by the seed) into a draw pile, and 12 cards are dealt face up.
2. Select 1 to 4 cards (5 with Fifth Card). If they form a hand, the box on the right shows it with its points and mult. Press **Play hand** to score it.
3. Or select 1 to 4 cards and press **Discard** to swap them.
4. Played and discarded cards are replaced from the draw pile. When the pile is empty, their spots stay empty.
5. Reach the fight's target within 4 hands to win it.

**View deck** shows every card in your deck, sortable by color, number, shape or shading. Faded cards are used, outlined ones are on the board.

## Jokers

Jokers live in `data/jokers.js` (effects are data; `js/jokers.js` applies them). `jokers.html` shows every joker card.
A joker card has art on the top half, its name in the middle and a text box at the bottom. Names and art are placeholders.
You start with 2 joker slots and gain more from bosses (see The run). Scoring jokers apply **left to right**, after the cards have added their points.
Buy them in the shop or find them in Buffoon packs. You can also pick test jokers on the start menu to start a run with.

**Drop rates** (by rarity): common 60%, uncommon 25%, rare 12%, unique 3%. Legendary jokers never drop.
Many jokers will need to be unlocked first (`unlocked` in the data; all are unlocked for now).

**Words used on jokers**
- A **difference** is, in a set, each attribute that is all different; in an of-a-kind hand, each group of identical cards (a pair has 1, two pair has 2; a high card counts as 1 difference and 1 match).
- A **match** is, in a set, each attribute that is all the same; in an of-a-kind hand, each card (a pair has 2, three of a kind has 3).

| Rarity | Joker | Effect |
|--------|-------|--------|
| Common | Encore | +1 mult for each time this hand has been played this game (including this play). |
| Common | Variety | +1 mult for each difference in the hand. |
| Common | Overtime | +1 hand each round. |
| Common | Recycler | +1 discard each round. |
| Common | Plain Joker | +4 mult. |
| Common | Credit Union | At cash out, earn 20% interest on your money, up to $5. |
| Uncommon | Big Table | +2 cards on the board. |
| Uncommon | Odd One Out | Earn $1 for each difference in the hand. |
| Uncommon | Birds of a Feather | Earn $1 for each match in the hand. |
| Uncommon | Shopkeeper | +1 joker for sale in the shop. |
| Uncommon | Numberfile | +1 mult for each different number played. |
| Uncommon | Bank | At cash out, earn 10% interest on your money, up to $20. |
| Uncommon | Day Trader | At cash out: 50% chance your money ×1.25, 50% chance ×0.8 (only when above $0). |
| Rare | Kaleidoscope | Multiply mult by the number of differences in the hand. |
| Rare | Mirror | Multiply mult by the number of matches in the hand. No matches scores 0. |
| Rare | Fifth Card | Play up to 5 cards at a time (the normal limit is 4). |
| Rare | Copycat | If your first discard of the round is 1 card, add a copy of it to your deck. |
| Rare | Shredder | If your first discard of the round is 1 card, remove it from your deck. |
| Rare | Full Spectrum | ×5 mult if the hand is a set with every attribute different. |
| Rare | Treasury | At cash out, earn 5% interest on your money, with no limit. |
| Rare | Gambler | At cash out: 80% chance your money ×1.3, 20% chance it drops to $0 (only when above $0). |
| Rare | Loan Shark | You can go into debt (see Debt above). At cash out, pay 20% interest on your debt. |
| Rare | High Five | Each 5 played gives +5 mult. |
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
- Multiplayer: does "each person" mean players take turns on one board, or each has their own?
