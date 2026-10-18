// Run settings. Change numbers here; docs/RULES.md explains each one.
window.SETTRY_CONFIG = {
  runDeckSize: 30,     // cards drawn at random from the full deck at the start of a run
  boardSize: 12,       // cards face up at once
  setSize: 4,          // cards in one set
  allowPairs: true,    // an attribute may also split into two pairs (A A B B), not only all same / all different
  setsToWin: 4,        // sets needed to clear the round
  discards: 2,         // discards per round
  maxDiscardSize: 4,   // most cards one discard can throw away
  showSetCount: true,  // show how many sets are on the board (a helper while testing)
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
