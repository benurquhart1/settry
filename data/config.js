// Run and round settings. Change numbers here; docs/RULES.md explains each one.
window.SETTRY_CONFIG = {
  // Run: fights, targets and rewards live in data/fights.js.
  startMoney: 5,
  moneyPerHandLeft: 1, // paid for each unused hand when a round is won
  // No standard interest (ben, 2026-10-18): it comes from the Credit Union, Bank and Treasury jokers.

  // Shop (only open after boss fights)
  shopJokerSlots: 2,   // jokers for sale at once (the Shopkeeper joker adds 1)
  shopPackSlots: 2,    // packs for sale at once
  rerollStart: 4,      // first reroll each shop costs this...
  rerollStep: 1,       // ...and each reroll after costs this much more
  jokerPrices: { common: 4, uncommon: 6, rare: 10, unique: 16, legendary: 20 },
  prizeRerollCost: 5,  // reroll a fight's prize pack (ben, 2026-10-18); a joker gives 1 free per fight
  ignoreUnlocks: true, // until saves exist, every joker with an effect can show up in shops and packs

  // Round
  boardSize: 12,       // cards dealt face up (4 across, 3 down); ben trying 12 instead of 16
  minPlay: 1,          // fewest cards one play can use (1 = high card)
  maxPlay: 4,          // most cards one play can use (the Fifth Card joker raises it to 5)
  plays: 4,            // hands per round
  discards: 2,         // discards per round
  jokerSlotsStart: 2,  // jokers you can hold at the start of a run...
  jokerSlotsMax: 6,    // ...+1 after each boss before the final one, up to this (none in endless mode)
  maxDiscardSize: 4,   // most cards one discard can throw away
  consumableSlots: 2, // most charms (consumables) you can hold
  consumableSell: 1,  // what selling a charm gives back
  allowPairs: false,   // let a set attribute also split into two pairs (A A B B); off per ben's set rule
};

// The four attributes. Numbers go up to 5, but starting decks and Standard packs only use
// startCounts (1 to 4); 5s come from the Count Up charm, which wraps 5 back to 1.
window.SETTRY_ATTRIBUTES = {
  count: [1, 2, 3, 4, 5],
  shape: ["heart", "diamond", "spade", "club"],
  shading: ["empty", "solid", "striped", "checkered"],
  color: ["red", "green", "blue", "black"],
};

window.SETTRY_START_COUNTS = [1, 2, 3, 4];

// How each color is drawn.
window.SETTRY_COLORS = { red: "#d22", green: "#1a1", blue: "#22c", black: "#111" };
