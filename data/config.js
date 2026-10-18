// Run settings. Change numbers here; docs/RULES.md explains each one.
window.SETTRY_CONFIG = {
  runDeckSize: 30,     // cards drawn at random from the full deck at the start of a run
  handSize: 12,        // cards in your hand
  minPlay: 2,          // fewest cards one play can use
  maxPlay: 5,          // most cards one play can use
  plays: 4,            // plays per round
  roundTarget: 150,    // score needed to beat the round (placeholder until antes exist)
  discards: 2,         // discards per round
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
