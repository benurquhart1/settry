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
//   singleDiscard    on the round's first discard, if it is 1 card: "remove" takes it out of your deck for good
//   firstHandSingle  if the fight's first hand is 1 card, "duplicate" adds a copy of it to your deck
//   cardGrowth after a hand, the played cards (`which: "all"`) or the first one (`"first"`) that scored
//              permanently gain `points` and/or `mult` (stored on the card as bonus / bonusMult)
//   recycle    played and discarded cards go back into the draw pile
//   interest   at cash out, +`rate` of your money (rounded down), at most `max` (null = no cap)
//   moneyGamble  at cash out, with chance `chance` your money x `win`, otherwise x `lose`
//              (only when your money is above $0)
//   loanShark  lets your money go below $0, down to (not reaching) `limit`; at cash out you pay
//              `rate` of your debt (rounded up). Reach `limit`, or be below $0 without it, and you lose.
//   addCard    at the start of each fight, add a random card to your deck (numbers 1 to 4).
//              deckLimited: only cards your starting deck could have. modChance: chance of a wild or enhancement.
//   negativeCharm  at the start of each fight, add a random negative charm (it doesn't take a charm slot)
//   addPoints  +N points, N from `per` (or a flat `amount`)
//              `each` multiplies N (e.g. per: "pile", each: 2 is +2 per card in the draw pile).
//              `when` (any effect): only when that condition holds (see Jokers.counts `when`).
//   cashMoney  at cash out, +$N (amount, or per: "discardsLeft"), with an optional `when`
//              (lowerReward, firstHandWin)
//   afterHand  after a hand matching `when`, `chance` (0-1) to `give` "hand" (+1 hand) or "charm"
//   retrigger  the first (`which: "first"`) or last played card scores twice
//   interchange  each card's `attribute` can count as either value of its pair in `pairs`
//   ignoreAttribute  `attribute` is ignored for sets and of-a-kind hands
//   lookalike  cards that differ in one attribute count as identical for of-a-kind hands
//   setMaster  sets of 3 score as sets of 4      glassMult  Glass cards give x `mult`
//   luckyBoost Lucky cards pay out `factor` times as often     scout  see the next `amount` cards
//   freePrizeReroll  `amount` free prize rerolls each fight     mimic  copies the joker to its right
//   extra may also take `settings: { name: amount, ... }` to change several settings.
//   none       no effect yet (still being designed)
// `per` values (worked out by Hands.counts):
//   timesPlayed  times this hand type has been played this game, counting this one
//   different    sets: attributes that are all different; of-a-kind hands: groups of identical cards
//   same         sets: attributes that are all the same; of-a-kind hands: number of cards
//   pile, pileFours  cards left in the draw pile (and that divided by 4, rounded down)
//   wilds        wild attributes on the played cards
//   handsPlayed, cardsDiscarded, charmsUsed, set4Played: run totals (handsPlayed and set4Played include this hand)
//   streak       fights won in a row with hands to spare     veteran  Veteran's current x mult
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
  { id: "workout", name: "Workout", rarity: "common", art: "💪",
    text: "Every played card permanently gains +2 points.",
    effect: { type: "cardGrowth", which: "all", points: 2 }, unlocked: true },
  { id: "lowball", name: "Lowball", rarity: "common", art: "1+",
    text: "Each 1 played gives +3 mult.",
    effect: { type: "cardsWith", attribute: "count", value: 1, mult: 3 }, unlocked: true },
  { id: "numberLine", name: "Number Line", rarity: "common", art: "123",
    text: "+20 points if the played numbers are in a row, like 2-3-4 (3 or more cards).",
    effect: { type: "addPoints", amount: 20, when: "numbersInRow" }, unlocked: true },
  { id: "snowball", name: "Snowball", rarity: "common", art: "❄",
    text: "+2 points for every hand played this run.",
    effect: { type: "addPoints", per: "handsPlayed", each: 2 }, unlocked: true },
  { id: "deepPile", name: "Deep Pile", rarity: "common", art: "▤",
    text: "+2 points for every card left in your draw pile.",
    effect: { type: "addPoints", per: "pile", each: 2 }, unlocked: true },
  { id: "scout", name: "Scout", rarity: "common", art: "👁",
    text: "See the next 3 cards in your draw pile.",
    effect: { type: "scout", amount: 3 }, unlocked: true },
  { id: "tipJar", name: "Tip Jar", rarity: "common", art: "🫙",
    text: "Earn $1 for each unused discard when you win a fight.",
    effect: { type: "cashMoney", per: "discardsLeft", each: 1 }, unlocked: true },
  { id: "underdog", name: "Underdog", rarity: "common", art: "🐕",
    text: "+$4 when you beat the lower-reward opponent.",
    effect: { type: "cashMoney", amount: 4, when: "lowerReward" }, unlocked: true },
  { id: "speedrun", name: "Speedrun", rarity: "common", art: "⏱",
    text: "+$3 when you win a fight with your first hand.",
    effect: { type: "cashMoney", amount: 3, when: "firstHandWin" }, unlocked: true },

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
  { id: "mentor", name: "Mentor", rarity: "uncommon", art: "🎓",
    text: "The first card of each hand permanently gains +2 mult.",
    effect: { type: "cardGrowth", which: "first", mult: 2 }, unlocked: true },
  { id: "apprentice", name: "Apprentice", rarity: "uncommon", art: "🔮",
    text: "1 in 4 chance to create a random charm when you play a set of 4 (needs a free charm slot).",
    effect: { type: "afterHand", when: "set4", chance: 0.25, give: "charm" }, unlocked: true },
  { id: "collector", name: "Collector", rarity: "uncommon", art: "▣",
    text: "+1 mult for each set of 4 played this run.",
    effect: { type: "addMult", per: "set4Played" }, unlocked: true },
  { id: "compost", name: "Compost", rarity: "uncommon", art: "♲",
    text: "+1 point for each card discarded this run.",
    effect: { type: "addPoints", per: "cardsDiscarded" }, unlocked: true },
  { id: "encoreCard", name: "Curtain Call", rarity: "uncommon", art: "🎭",
    text: "The last card in each hand scores twice.",
    effect: { type: "retrigger", which: "last" }, unlocked: true },
  { id: "fortuneTeller", name: "Fortune Teller", rarity: "uncommon", art: "🃏",
    text: "+1 mult for each charm used this run.",
    effect: { type: "addMult", per: "charmsUsed" }, unlocked: true },
  { id: "lastStand", name: "Last Stand", rarity: "uncommon", art: "⚔",
    text: "×3 mult on your last hand of a fight.",
    effect: { type: "mulMult", amount: 3, when: "lastHand" }, unlocked: true },
  { id: "luckyStars", name: "Lucky Stars", rarity: "uncommon", art: "✦",
    text: "Lucky cards are twice as likely to pay out.",
    effect: { type: "luckyBoost", factor: 2 }, unlocked: true },
  { id: "monochrome", name: "Monochrome", rarity: "uncommon", art: "◐",
    text: "×2 mult if every played card is the same color (2 or more cards).",
    effect: { type: "mulMult", amount: 2, when: "sameColor" }, unlocked: true },
  { id: "openingAct", name: "Opening Act", rarity: "uncommon", art: "🎬",
    text: "×2 mult on the first hand of each fight.",
    effect: { type: "mulMult", amount: 2, when: "firstHand" }, unlocked: true },
  { id: "longGame", name: "Long Game", rarity: "uncommon", art: "▥",
    text: "+1 mult for every 4 cards left in your draw pile.",
    effect: { type: "addMult", per: "pileFours" }, unlocked: true },
  { id: "purist", name: "Purist", rarity: "uncommon", art: "○",
    text: "×2 mult if no played card has a wild or enhancement.",
    effect: { type: "mulMult", amount: 2, when: "pure" }, unlocked: true },
  { id: "quartet", name: "Quartet", rarity: "uncommon", art: "4×",
    text: "×3 mult when you play a set of 4.",
    effect: { type: "mulMult", amount: 3, when: "set4" }, unlocked: true },
  { id: "rainbowRoad", name: "Rainbow Road", rarity: "uncommon", art: "🌈",
    text: "+10 mult if every played card is a different color (3 or more cards).",
    effect: { type: "addMult", amount: 10, when: "colorsDifferent" }, unlocked: true },
  { id: "streak", name: "Streak", rarity: "uncommon", art: "🔥",
    text: "+2 mult for each fight in a row won with hands to spare. Resets if you win on your last hand.",
    effect: { type: "addMult", per: "streak", each: 2 }, unlocked: true },
  { id: "twinPeaks", name: "Twin Peaks", rarity: "uncommon", art: "⛰",
    text: "+8 mult if the hand is a pair or contains one.",
    effect: { type: "addMult", amount: 8, when: "hasPair" }, unlocked: true },
  { id: "wildChild", name: "Wild Child", rarity: "uncommon", art: "✱",
    text: "+3 mult for each wild attribute among the played cards.",
    effect: { type: "addMult", per: "wilds", each: 3 }, unlocked: true },
  { id: "rerollTicket", name: "Second Look", rarity: "uncommon", art: "⟳",
    text: "One free prize reroll each fight.",
    effect: { type: "freePrizeReroll", amount: 1 }, unlocked: true },
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
    text: "If the first hand of a fight is a single card, add a copy of it to your deck.",
    effect: { type: "firstHandSingle", action: "duplicate" }, unlocked: true },
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

  { id: "blur", name: "Blur", rarity: "rare", art: "≋",
    text: "Shading is ignored for sets and of-a-kind hands.",
    effect: { type: "ignoreAttribute", attribute: "shading" }, unlocked: true },
  { id: "colorblind", name: "Colorblind", rarity: "rare", art: "◑",
    text: "Red and green are interchangeable, and so are blue and black: each card can count as either.",
    effect: { type: "interchange", attribute: "color", pairs: [["red", "green"], ["blue", "black"]] }, unlocked: true },
  { id: "shapeShifter", name: "Shape Shifter", rarity: "rare", art: "♡♢",
    text: "Hearts and diamonds are interchangeable, and so are spades and clubs: each card can count as either.",
    effect: { type: "interchange", attribute: "shape", pairs: [["heart", "diamond"], ["spade", "club"]] }, unlocked: true },
  { id: "crowdedTable", name: "Crowded Table", rarity: "rare", art: "▦+",
    text: "+2 cards on the board, but -1 hand each fight.",
    effect: { type: "extra", settings: { boardSize: 2, plays: -1 } }, unlocked: true },
  { id: "glassblower", name: "Glassblower", rarity: "rare", art: "🔥▢",
    text: "Glass cards give ×3 mult instead of ×2.",
    effect: { type: "glassMult", mult: 3 }, unlocked: true },
  { id: "grandSlam", name: "Grand Slam", rarity: "rare", art: "⚾",
    text: "Each time you play a set of 4, 50% chance to gain 1 hand.",
    effect: { type: "afterHand", when: "set4", chance: 0.5, give: "hand" }, unlocked: true },
  { id: "loneWolf", name: "Lone Wolf", rarity: "rare", art: "🐺",
    text: "High card gets ×4 mult.",
    effect: { type: "mulMult", amount: 4, when: "highCard" }, unlocked: true },
  { id: "lookalike", name: "Lookalike", rarity: "rare", art: "≈",
    text: "Cards that differ in only one attribute count as identical for of-a-kind hands.",
    effect: { type: "lookalike" }, unlocked: true },
  { id: "matchmaker", name: "Matchmaker", rarity: "rare", art: "💞",
    text: "×2 mult for two pair and full house.",
    effect: { type: "mulMult", amount: 2, when: "twoPairOrFullHouse" }, unlocked: true },
  { id: "mimic", name: "Mimic", rarity: "rare", art: "🪞",
    text: "Copies the effect of the joker to its right.",
    effect: { type: "mimic" }, unlocked: true },
  { id: "spotlight", name: "Spotlight", rarity: "rare", art: "🔦",
    text: "The first card you select scores twice.",
    effect: { type: "retrigger", which: "first" }, unlocked: true },
  { id: "veteran", name: "Veteran", rarity: "rare", art: "🎖",
    text: "Gains ×0.1 mult for every discard, loses ×1 for every hand played (never below ×1).",
    effect: { type: "mulMult", per: "veteran" }, unlocked: true },
  { id: "lastCall", name: "Last Call", rarity: "rare", art: "∅",
    text: "×5 mult if your draw pile is empty.",
    effect: { type: "mulMult", amount: 5, when: "pileEmpty" }, unlocked: true },

  // Unique (Recycle). The deck jokers below are common, one per starting deck.
  { id: "recycle", name: "Recycle", rarity: "unique", art: "♻",
    text: "Played and discarded cards go straight back into the draw pile.",
    effect: { type: "recycle" }, unlocked: false, unlock: "Run out of cards in the draw pile." },
  { id: "phantom", name: "Phantom", rarity: "unique", art: "👻",
    text: "At the start of each fight, add a negative copy of a random charm (it doesn't take a charm slot).",
    effect: { type: "negativeCharm" }, unlocked: true },
  { id: "setMaster", name: "Set Master", rarity: "unique", art: "★3",
    text: "Sets of 3 score as sets of 4.",
    effect: { type: "setMaster" }, unlocked: true },
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
