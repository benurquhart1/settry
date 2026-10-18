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

**Prizes** (ben, 2026-10-18). On top of the money, each regular opponent offers a prize from the reward pool for its place in the group of 4 (`rewardPools` in `data/fights.js`). The two opponents always offer different prizes. Winning opens the prize like a pack: choose from it, or skip. You can **reroll** a prize for new options for $5 (`prizeRerollCost`; ben, 2026-10-18), and the Second Look joker gives one free reroll each fight.
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
You hold up to **2** (`consumableSlots`); negative charms (from the Phantom joker) don't count toward that. They come from Charm packs in the shop. Sell one for $1 in the shop.
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

1. Your deck is shuffled (by the seed) into a draw pile, and 10 cards are dealt face up (ben, 2026-10-18).
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

**Drop rates** (by rarity): common 70%, uncommon 24%, rare 5%, unique 1% (ben, 2026-10-18; Balatro is 70/25/5). Legendary jokers never drop.
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
| Common | New Recruit | At the start of each fight, add a random card (numbers 1 to 4) to your deck. |
| Common | Credit Union | At cash out, earn 20% interest on your money, up to $5. |
| Uncommon | Big Table | +2 cards on the board. |
| Uncommon | Odd One Out | Earn $1 for each difference in the hand. |
| Uncommon | Birds of a Feather | Earn $1 for each match in the hand. |
| Uncommon | Shopkeeper | +1 joker for sale in the shop. |
| Uncommon | Numberfile | +1 mult for each different number played. |
| Uncommon | Loyal Recruit | At the start of each fight, add a random card your starting deck could have (e.g. only blue cards for the Blue deck). |
| Uncommon | Bank | At cash out, earn 10% interest on your money, up to $20. |
| Uncommon | Day Trader | At cash out: 50% chance your money ×1.25, 50% chance ×0.8 (only when above $0). |
| Rare | Kaleidoscope | Multiply mult by the number of differences in the hand. |
| Rare | Mirror | Multiply mult by the number of matches in the hand. No matches scores 0. |
| Rare | Fifth Card | Play up to 5 cards at a time (the normal limit is 4). |
| Rare | Copycat | If the first hand of a fight is a single card, add a copy of it to your deck (ben, 2026-10-18; replaced the discard version). |
| Rare | Shredder | If your first discard of the round is 1 card, remove it from your deck. |
| Rare | Full Spectrum | ×5 mult if the hand is a set with every attribute different. |
| Rare | Elite Recruit | At the start of each fight, add a random card your starting deck could have, always with a wild or an enhancement. |
| Rare | Treasury | At cash out, earn 5% interest on your money, with no limit. |
| Rare | Gambler | At cash out: 80% chance your money ×1.3, 20% chance it drops to $0 (only when above $0). |
| Rare | Loan Shark | You can go into debt (see Debt above). At cash out, pay 20% interest on your debt. |
| Rare | High Five | Each 5 played gives +5 mult. |
| Common | Solid Ground | Each solid card played gives +10 points. |
| Common | Empty Handed | Each empty card played gives +2 mult. |
| Common | Pinstripe | Each striped card played gives +1 mult and +5 points. |
| Common | Checkmate | Each checkered card played has a 1 in 3 chance to earn $1. |
| Common | Even Steven | Each 2 or 4 played gives +2 mult. |
| Common | Odd Job | Each 1 or 3 played gives +12 points. |
| Common | Top Heavy | Each 4 played gives +3 mult. |
| Common | Abacus | +3 points for every pip played (the sum of the played numbers × 3). |
| Common | Flush | +6 mult if every played card has the same shape (2 or more cards). |
| Common | Number Match | +5 mult if every played card has the same number (2 or more cards). |
| Common | Set Piece | +4 mult when you play a set of 3. |
| Common | Square Deal | +8 mult when you play a set of 4. |
| Common | Trio | +12 mult when you play three of a kind. |
| Common | Double Date | +10 mult when you play two pair. |
| Common | Harmony | +2 mult for each match in the hand. |
| Common | Contrast | +15 points for each difference in the hand. |
| Common | Small Talk | +4 mult if you play 2 or fewer cards. |
| Common | Fresh Start | +30 points on the first hand of each fight. |
| Common | Late Bloomer | +8 mult on your last hand of a fight. |
| Common | Kindling | +3 mult for each discard used this fight. |
| Common | Clean Sweep | +$3 when you win a fight without discarding. |
| Common | Dumpster Diver | +$1 each time you discard 4 cards at once. |
| Common | Allowance | +$2 at cash out. |
| Common | Skipper | +$5 when you skip a prize without taking anything. |
| Common | Big Game | +$2 when you beat the higher-reward opponent. |
| Common | Charm Bracelet | +3 mult for each charm you are holding. |
| Common | Polish | Mult cards give +3 more mult and Bonus cards +20 more points. |
| Common | Misprint | +0 to +10 mult, rolled each hand. |
| Common | Workout | Every played card that scores permanently gains +2 points. |
| Common | Lowball | Each 1 played gives +3 mult. |
| Common | Number Line | +20 points if the played numbers are in a row, like 2-3-4 (3 or more cards, no repeats). |
| Common | Snowball | +2 points for every hand played this run (including this one). |
| Common | Deep Pile | +2 points for every card left in your draw pile. |
| Common | Scout | See the next 3 cards in your draw pile. |
| Common | Tip Jar | Earn $1 for each unused discard when you win a fight. |
| Common | Underdog | +$4 when you beat the lower-reward opponent. |
| Common | Speedrun | +$3 when you win a fight with your first hand. |
| Uncommon | Extra Seat | +1 card on the board. |
| Uncommon | Giant Slayer | ×1.5 mult in boss fights. |
| Uncommon | Greedy | +1 mult for every $5 you have. |
| Uncommon | Loophole | On your last hand of a fight, boss card bans don't apply. |
| Uncommon | Double Dip | Each charm you use has a 1 in 2 chance to stay for one more use (a kept charm can't stay again). |
| Uncommon | Point Set | +40 points when you play any set. |
| Uncommon | Prize Hunter | Prizes show 1 more option. |
| Uncommon | Wallflower | +1 mult for each card left on the board when you play. |
| Uncommon | Wild Fan | Each played card with a wild attribute gives +10 points. |
| Uncommon | Mentor | The first card of each hand permanently gains +2 mult (if it scores). |
| Uncommon | Apprentice | 1 in 4 chance to create a random charm when you play a set of 4 (needs a free charm slot). |
| Uncommon | Collector | +1 mult for each set of 4 played this run. |
| Uncommon | Compost | +1 point for each card discarded this run. |
| Uncommon | Curtain Call | The last card in each hand scores twice. |
| Uncommon | Fortune Teller | +1 mult for each charm used this run. |
| Uncommon | Last Stand | ×3 mult on your last hand of a fight. |
| Uncommon | Lucky Stars | Lucky cards are twice as likely to pay out. |
| Uncommon | Monochrome | ×2 mult if every played card is the same color (2 or more cards). |
| Uncommon | Opening Act | ×2 mult on the first hand of each fight. |
| Uncommon | Long Game | +1 mult for every 4 cards left in your draw pile. |
| Uncommon | Purist | ×2 mult if no played card has a wild or enhancement. |
| Uncommon | Quartet | ×3 mult when you play a set of 4. |
| Uncommon | Rainbow Road | +10 mult if every played card is a different color (3 or more cards). |
| Uncommon | Streak | +2 mult for each fight in a row won with hands to spare. Resets if you win on your last hand. |
| Uncommon | Twin Peaks | +8 mult if the hand is a pair or contains one (two pair, three/four/five of a kind, full house). |
| Uncommon | Wild Child | +3 mult for each wild attribute among the played cards. |
| Uncommon | Second Look | One free prize reroll each fight. |
| Rare | Fibonacci | ×mult by the number of cards played: ×1, ×1, ×2, ×3, ×5 for 1 to 5 cards. |
| Rare | Blur | Shading is ignored for sets and of-a-kind hands. |
| Rare | Colorblind | Red and green are interchangeable, and so are blue and black: each card can count as either color of its pair. |
| Rare | Shape Shifter | Hearts and diamonds are interchangeable, and so are spades and clubs. |
| Rare | Crowded Table | +2 cards on the board, but -1 hand each fight. |
| Rare | Glassblower | Glass cards give ×3 mult instead of ×2. |
| Rare | Grand Slam | Each time you play a set of 4, 50% chance to gain 1 hand. |
| Rare | Lone Wolf | High card gets ×4 mult. |
| Rare | Lookalike | Cards that differ in only one attribute count as identical for of-a-kind hands. |
| Rare | Matchmaker | ×2 mult for two pair and full house. |
| Rare | Mimic | Copies the effect of the joker to its right. |
| Rare | Spotlight | The first card you select scores twice. |
| Rare | Veteran | Gains ×0.1 mult for every discard, loses ×0.1 for every hand played (never below ×1). |
| Rare | Last Call | ×5 mult if your draw pile is empty. |
| Unique | Recycle | Played and discarded cards go straight back into the draw pile (at random spots). Unlock: run out of cards in the draw pile. |
| Unique | Set Master | Sets of 3 score (and count) as sets of 4. |
| Unique | Phantom | At the start of each fight, add a negative copy of a random charm. Negative charms don't take up a charm slot. |

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

"This run" counts from the start of the run, not from when you got the joker.

Chance effects are rolled with the game's seed, once, when the hand is played; the preview just shows the odds.
A wild card counts as every color (or suit) for these jokers.

Legendary jokers: to come.

Unlocks are listed but not tracked yet: that needs user accounts and saves (see `docs/TODO.md`). The test picker on the start menu offers every joker, locked or not.

## Open questions

- Do cards add their own points (like Balatro card chips), or does only the hand score?
- Multiplayer: does "each person" mean players take turns on one board, or each has their own?
