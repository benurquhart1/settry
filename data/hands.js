// Hands you can play, with their starting points and multiplier.
// Each played card then adds its own points (its number; a wild number adds 5). Score = points x mult.
// "Of a kind" means identical cards (same on all four attributes; wild attributes match anything). How each hand is recognized is in js/hands.js.
window.SETTRY_HANDS = {
  pair:        { name: "Pair",            points: 10,  mult: 2 },
  twoPair:     { name: "Two pair",        points: 30,  mult: 2 },
  set3:        { name: "Set of 3",        points: 10,  mult: 2 },
  threeKind:   { name: "Three of a kind", points: 20,  mult: 3 },
  set4:        { name: "Set of 4",        points: 20,  mult: 3 },
  fullHouse:   { name: "Full house",      points: 40,  mult: 4 },
  fourKind:    { name: "Four of a kind",  points: 50,  mult: 5 },
  fiveKind:    { name: "Five of a kind",  points: 100, mult: 8 },
};
