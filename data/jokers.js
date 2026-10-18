// Jokers. Effects are data; js/jokers.js applies them. Names and art are placeholders until ben picks them.
//
// effect types:
//   addMult   +N mult, N from `per`        mulMult  x N mult, N from `per`
//   money     +$N when the hand scores     extra    raise a round setting by `amount`
// `per` values (worked out by Hands.counts):
//   timesPlayed  times this hand type has been played this game, counting this one
//   different    sets: attributes that are all different; of-a-kind hands: groups of identical cards
//   same         sets: attributes that are all the same; of-a-kind hands: number of cards
// unlocked: false hides a joker from drops until it is unlocked (unlocks come later).

window.SETTRY_JOKER_RARITIES = {
  // Chance a dropped joker is this rarity. Legendary jokers never drop.
  common:    { name: "Common",    weight: 60, color: "#607d8b" },
  uncommon:  { name: "Uncommon",  weight: 25, color: "#2e7d32" },
  rare:      { name: "Rare",      weight: 12, color: "#c62828" },
  unique:    { name: "Unique",    weight: 3,  color: "#6a1b9a" },
  legendary: { name: "Legendary", weight: 0,  color: "#b8860b" },
};

window.SETTRY_JOKERS = [
  // Common
  { id: "encore", name: "Encore", rarity: "common", art: "↻",
    text: "+1 mult for each time this hand has been played this game.",
    effect: { type: "addMult", per: "timesPlayed" }, unlocked: true },
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

  // Unique and legendary: still to come.
];

// How "difference" and "match" are counted, shown on the jokers page.
window.SETTRY_JOKER_GLOSSARY = {
  difference: "In a set, each attribute that is all different. In a pair or other of-a-kind hand, each group of identical cards (a pair has 1, two pair has 2).",
  match: "In a set, each attribute that is all the same. In an of-a-kind hand, each card (a pair has 2, three of a kind has 3).",
};
