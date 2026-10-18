// Run and round settings. Change numbers here; docs/RULES.md explains each one.
window.SETTRY_CONFIG = {
  // Run
  antes: 8,            // beat the boss round of this ante to win the run
  anteTargets: [100, 250, 600, 1500, 3500, 6500, 11500, 16500],   // base score target per ante
  rounds: [            // the rounds in every ante, in order
    { name: "Small round", targetMult: 1,   reward: 3 },
    { name: "Big round",   targetMult: 1.5, reward: 5 },
    { name: "Boss round",  targetMult: 2,   reward: 8 },   // boss effects to come
  ],
  startMoney: 5,
  moneyPerHandLeft: 1, // paid for each unused hand when a round is won
  interestPer: 5,      // +$1 interest for every $5 held at cash out...
  interestMax: 5,      // ...up to $5

  // Shop
  shopJokerSlots: 2,   // jokers for sale at once (the Shopkeeper joker adds 1)
  shopPackSlots: 2,    // packs for sale at once
  rerollStart: 4,      // first reroll each shop costs this...
  rerollStep: 1,       // ...and each reroll after costs this much more
  jokerPrices: { common: 4, uncommon: 6, rare: 10, unique: 16, legendary: 20 },
  ignoreUnlocks: true, // until saves exist, every joker with an effect can show up in shops and packs

  // Round
  boardSize: 16,       // cards dealt face up (a 4x4 grid)
  minPlay: 2,          // fewest cards one play can use
  maxPlay: 4,          // most cards one play can use (the Fifth Card joker raises it to 5)
  plays: 4,            // hands per round
  discards: 2,         // discards per round
  jokerSlots: 5,       // most jokers you can hold
  maxDiscardSize: 4,   // most cards one discard can throw away
  allowPairs: false,   // let a set attribute also split into two pairs (A A B B); off per ben's set rule
};

// The four attributes. Every combination makes one card (4^4 = 256).
window.SETTRY_ATTRIBUTES = {
  count: [1, 2, 3, 4],
  shape: ["heart", "diamond", "spade", "club"],
  shading: ["empty", "solid", "striped", "checkered"],
  color: ["red", "green", "blue", "black"],
};

// How each color is drawn.
window.SETTRY_COLORS = { red: "#d22", green: "#1a1", blue: "#22c", black: "#111" };
