// Round state and rules. Rendering lives in js/ui.js.
const Game = {
  state: null,

  newRun() {
    const cfg = window.SETTRY_CONFIG;
    const deck = Deck.runDeck(cfg.runDeckSize);
    Game.state = {
      deck,                                   // draw pile for this run
      board: deck.splice(0, cfg.boardSize),   // face-up cards
      selected: [],                           // indices into board
      setsMade: 0,
      discardsLeft: cfg.discards,
      message: "",
      over: null,                             // null, "won" or "lost"
    };
    Game.checkEnd();
  },

  toggle(i) {
    const s = Game.state;
    if (s.over) return;
    const at = s.selected.indexOf(i);
    if (at >= 0) s.selected.splice(at, 1);
    else if (s.selected.length < Math.max(window.SETTRY_CONFIG.setSize, window.SETTRY_CONFIG.maxDiscardSize)) s.selected.push(i);
    s.message = "";
  },

  canPlay() {
    return !Game.state.over && Game.state.selected.length === window.SETTRY_CONFIG.setSize;
  },

  canDiscard() {
    const s = Game.state;
    const n = s.selected.length;
    return !s.over && s.discardsLeft > 0 && n >= 1 && n <= window.SETTRY_CONFIG.maxDiscardSize;
  },

  playSet() {
    const s = Game.state;
    if (!Game.canPlay()) return;
    if (!Deck.isSet(s.selected.map((i) => s.board[i]))) {
      s.message = "Not a set.";
      s.selected = [];
      return;
    }
    s.setsMade++;
    s.message = "Set!";
    Game.replaceSelected();
    Game.checkEnd();
  },

  discard() {
    const s = Game.state;
    if (!Game.canDiscard()) return;
    s.discardsLeft--;
    s.message = `Discarded ${s.selected.length}.`;
    Game.replaceSelected();
    Game.checkEnd();
  },

  // Selected cards leave the board; new cards from the deck fill their spots.
  replaceSelected() {
    const s = Game.state;
    for (const i of s.selected) s.board[i] = s.deck.length ? s.deck.shift() : null;
    s.board = s.board.filter(Boolean);
    s.selected = [];
  },

  checkEnd() {
    const s = Game.state;
    if (s.setsMade >= window.SETTRY_CONFIG.setsToWin) s.over = "won";
    else if (!Deck.findSets(s.board).length && (s.discardsLeft === 0 || !s.deck.length)) s.over = "lost";
  },
};
