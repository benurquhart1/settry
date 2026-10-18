// Run settings. Change numbers here; docs/RULES.md explains each one.
window.SETTRY_CONFIG = {
  runDeckSize: 30,     // cards drawn at random from the full 81 at the start of a run
  boardSize: 12,       // cards face up at once
  setsToWin: 4,        // sets needed to clear the round
  discards: 2,         // discards per round
  maxDiscardSize: 4,   // most cards one discard can throw away
  showSetCount: true,  // show how many sets are on the board (a helper while testing)
};

// The four Set attributes. Every combination makes one card (3^4 = 81).
window.SETTRY_ATTRIBUTES = {
  count: [1, 2, 3],
  shape: ["oval", "diamond", "squiggle"],
  shading: ["solid", "shaded", "empty"],
  color: ["red", "green", "blue"],
};
