// Jokers. Effects are data; js/jokers.js applies them. Names and art are placeholders until ben picks them.
//
// effect types:
//   addMult    +N mult, N from `per` (or a flat `amount`)       mulMult   x N mult, N from `per`
//   money      +$N when the hand scores    extra     raise a round setting by `amount`
//   cardsWith  for each played card whose `attribute` is `value` (a wild card counts):
//              `mult` (+mult), `points` (+points), or a `chance` (0-1) of `money` or `xMult`.
//              Chances are rolled with the game's seed, only when the hand is played.
//   distinctNumbers  +`mult` for each different number among the played cards
//   allDifferentSet  x `mult` when the hand is a set with every attribute different
//   singleDiscard    on the round's first discard, if it is 1 card: "duplicate" adds a copy
//                    of it to your deck, "remove" takes it out of your deck for good
//   recycle    played and discarded cards go back into the draw pile
//   interest   at cash out, +`rate` of your money (rounded down), at most `max` (null = no cap)
//   moneyGamble  at cash out, with chance `chance` your money x `win`, otherwise x `lose`
//              (only when your money is above $0)
//   loanShark  lets your money go below $0, down to (not reaching) `limit`; at cash out you pay
//              `rate` of your debt (rounded up). Reach `limit`, or be below $0 without it, and you lose.
//   addCard    at the start of each fight, add a random card to your deck (numbers 1 to 4).
//              deckLimited: only cards your starting deck could have. modChance: chance of a wild or enhancement.
//   none       no effect yet (still being designed)
// `per` values (worked out by Hands.counts):
//   timesPlayed  times this hand type has been played this game, counting this one
//   different    sets: attributes that are all different; of-a-kind hands: groups of identical cards
//   same         sets: attributes that are all the same; of-a-kind hands: number of cards
// unlocked: false hides a joker from drops until it is unlocked; `unlock` says how (tracking comes later).

window.SETTRY_JOKER_RARITIES = {
  // Chance a dropped joker is this rarity. Legendary jokers never drop.
  common:    { name: "Common",    weight: 70, color: "#607d8b" },
  uncommon:  { name: "Uncommon",  weight: 24, color: "#2e7d32" },
  rare:      { name: "Rare",      weight: 5,  color: "#c62828" },
  unique:    { name: "Unique",    weight: 1,  color: "#6a1b9a" },
  legendary: { name: "Legendary", weight: 0,  color: "#b8860b" },
};

window.SETTRY_JOKERS = [
  // Common
  { id: "encore", name: "Encore", rarity: "common", art: "↻",
    text: "+1 mult for each time this hand has been played this game.",
    effect: { type: "addMult", per: "timesPlayed" }, unlocked: true },
  { id: "plainJoker", name: "Plain Joker", rarity: "common", art: "+4",
    text: "+4 mult.",
    effect: { type: "addMult", amount: 4 }, unlocked: true },
  { id: "newRecruit", name: "New Recruit", rarity: "common", art: "+🂠",
    text: "At the start of each fight, add a random card to your deck.",
    effect: { type: "addCard", modChance: 0 }, unlocked: true },
  { id: "creditUnion", name: "Credit Union", rarity: "common", art: "%",
    text: "At cash out, earn 20% interest on your money, up to $5.",
    effect: { type: "interest", rate: 0.2, max: 5 }, unlocked: true },
  { id: "variety", name: "Variety", rarity: "common", art: "≠",
    text: "+1 mult for each difference in the hand.",
    effect: { type: "addMult", per: "different" }, unlocked: true },
  { id: "overtime", name: "Overtime", rarity: "common", art: "+H",
    text: "+1 hand each round.",
    effect: { type: "extra", setting: "plays", amount: 1 }, unlocked: true },
  { id: "recycler", name: "Recycler", rarity: "common", art: "+D",
    text: "+1 discard each round.",
    effect: { type: "extra", setting: "discards", amount: 1 }, unlocked: true },

  // Uncommon
  { id: "bigTable", name: "Big Table", rarity: "uncommon", art: "▦",
    text: "+2 cards on the board.",
    effect: { type: "extra", setting: "boardSize", amount: 2 }, unlocked: true },
  { id: "oddOneOut", name: "Odd One Out", rarity: "uncommon", art: "$≠",
    text: "Earn $1 for each difference in the hand.",
    effect: { type: "money", per: "different" }, unlocked: true },
  { id: "birdsOfAFeather", name: "Birds of a Feather", rarity: "uncommon", art: "$=",
    text: "Earn $1 for each match in the hand.",
    effect: { type: "money", per: "same" }, unlocked: true },
  { id: "shopkeeper", name: "Shopkeeper", rarity: "uncommon", art: "+$",
    text: "+1 joker for sale in the shop.",
    effect: { type: "extra", setting: "shopJokerSlots", amount: 1 }, unlocked: true },
  { id: "numberfile", name: "Numberfile", rarity: "uncommon", art: "#",
    text: "+1 mult for each different number played.",
    effect: { type: "distinctNumbers", mult: 1 }, unlocked: true },
  { id: "loyalRecruit", name: "Loyal Recruit", rarity: "uncommon", art: "+🂠",
    text: "At the start of each fight, add a random card your starting deck could have to your deck.",
    effect: { type: "addCard", deckLimited: true, modChance: 0 }, unlocked: true },
  { id: "bank", name: "Bank", rarity: "uncommon", art: "🏦",
    text: "At cash out, earn 10% interest on your money, up to $20.",
    effect: { type: "interest", rate: 0.1, max: 20 }, unlocked: true },
  { id: "dayTrader", name: "Day Trader", rarity: "uncommon", art: "📈",
    text: "At cash out: 50% chance your money ×1.25, 50% chance ×0.8.",
    effect: { type: "moneyGamble", chance: 0.5, win: 1.25, lose: 0.8 }, unlocked: true },
  { id: "diamondJoker", name: "Diamond Joker", rarity: "common", art: "♦",
    text: "Each diamond played has a 50% chance of ×2 mult.",
    effect: { type: "cardsWith", attribute: "shape", value: "diamond", chance: 0.5, xMult: 2 }, unlocked: false, unlock: "Beat the diamond deck." },
  { id: "spadeJoker", name: "Spade Joker", rarity: "common", art: "♠", text: "TBD",
    effect: { type: "none" }, unlocked: false, unlock: "Beat the spade deck." },
  { id: "heartJoker", name: "Heart Joker", rarity: "common", art: "♥", text: "TBD",
    effect: { type: "none" }, unlocked: false, unlock: "Beat the heart deck." },
  { id: "clubJoker", name: "Club Joker", rarity: "common", art: "♣", text: "TBD",
    effect: { type: "none" }, unlocked: false, unlock: "Beat the club deck." },

  // Rare
  { id: "kaleidoscope", name: "Kaleidoscope", rarity: "rare", art: "×≠",
    text: "Multiply mult by the number of differences in the hand.",
    effect: { type: "mulMult", per: "different" }, unlocked: true },
  { id: "mirror", name: "Mirror", rarity: "rare", art: "×=",
    text: "Multiply mult by the number of matches in the hand. No matches scores 0.",
    effect: { type: "mulMult", per: "same" }, unlocked: true },
  { id: "fifthCard", name: "Fifth Card", rarity: "rare", art: "5",
    text: "Play up to 5 cards at a time.",
    effect: { type: "extra", setting: "maxPlay", amount: 1 }, unlocked: true },
  { id: "dna", name: "Copycat", rarity: "rare", art: "⧉",
    text: "If your first discard of the round is 1 card, add a copy of it to your deck.",
    effect: { type: "singleDiscard", action: "duplicate" }, unlocked: true },
  { id: "shredder", name: "Shredder", rarity: "rare", art: "✂",
    text: "If your first discard of the round is 1 card, remove it from your deck.",
    effect: { type: "singleDiscard", action: "remove" }, unlocked: true },
  { id: "rainbowSet", name: "Full Spectrum", rarity: "rare", art: "×5",
    text: "×5 mult if the hand is a set with every attribute different.",
    effect: { type: "allDifferentSet", mult: 5 }, unlocked: true },
  { id: "eliteRecruit", name: "Elite Recruit", rarity: "rare", art: "+★",
    text: "At the start of each fight, add a random modified card your starting deck could have to your deck.",
    effect: { type: "addCard", deckLimited: true, modChance: 1 }, unlocked: true },
  { id: "treasury", name: "Treasury", rarity: "rare", art: "🏛",
    text: "At cash out, earn 5% interest on your money, with no limit.",
    effect: { type: "interest", rate: 0.05, max: null }, unlocked: true },
  { id: "gambler", name: "Gambler", rarity: "rare", art: "🎲",
    text: "At cash out: 80% chance your money ×1.3, 20% chance it drops to $0.",
    effect: { type: "moneyGamble", chance: 0.8, win: 1.3, lose: 0 }, unlocked: true },
  { id: "loanShark", name: "Loan Shark", rarity: "rare", art: "🦈",
    text: "You can go into debt. Pay 20% interest on debt at cash out. Lose at -$50, or in debt without this joker.",
    effect: { type: "loanShark", rate: 0.2, limit: -50 }, unlocked: true },
  { id: "highFive", name: "High Five", rarity: "rare", art: "5+",
    text: "Each 5 played gives +5 mult.",
    effect: { type: "cardsWith", attribute: "count", value: 5, mult: 5 }, unlocked: true },

  // Unique (Recycle). The deck jokers below are common, one per starting deck.
  { id: "recycle", name: "Recycle", rarity: "unique", art: "♻",
    text: "Played and discarded cards go straight back into the draw pile.",
    effect: { type: "recycle" }, unlocked: false, unlock: "Run out of cards in the draw pile." },
  { id: "redJoker", name: "Red Joker", rarity: "common", art: "R",
    text: "+1 mult for each red card played.",
    effect: { type: "cardsWith", attribute: "color", value: "red", mult: 1 }, unlocked: false, unlock: "Beat the red deck." },
  { id: "blueJoker", name: "Blue Joker", rarity: "common", art: "B",
    text: "+10 points for each blue card played.",
    effect: { type: "cardsWith", attribute: "color", value: "blue", points: 10 }, unlocked: false, unlock: "Beat the blue deck." },
  { id: "greenJoker", name: "Green Joker", rarity: "common", art: "G",
    text: "Each green card played has a 50% chance to earn $1.",
    effect: { type: "cardsWith", attribute: "color", value: "green", chance: 0.5, money: 1 }, unlocked: false, unlock: "Beat the green deck." },
  { id: "blackJoker", name: "Black Joker", rarity: "common", art: "K",
    text: "TBD",
    effect: { type: "none" }, unlocked: false, unlock: "Beat the black deck." },

  // Legendary: still to come.
];

// How "difference" and "match" are counted, shown on the jokers page.
window.SETTRY_JOKER_GLOSSARY = {
  difference: "In a set, each attribute that is all different. In a pair or other of-a-kind hand, each group of identical cards (a pair has 1, two pair has 2).",
  match: "In a set, each attribute that is all the same. In an of-a-kind hand, each card (a pair has 2, three of a kind has 3).",
};
