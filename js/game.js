// Round state and rules. Rendering lives in js/ui.js.
const Game = {
  state: null,

  // Start a round with a deck from data/decks.js and a seed for every random choice.
  start(deckDef, seed) {
    const cfg = window.SETTRY_CONFIG;
    const random = Rng.create(seed);
    const runDeck = Deck.runDeck(deckDef, random);
    const pile = runDeck.slice();
    Game.state = {
      seed,
      deckDef,
      random,                                 // use for anything random later (rewards, shop)
      runDeck,                                // every card in this run's deck
      pile,                                   // draw pile, top first
      board: pile.splice(0, cfg.boardSize),   // face-up cards; empty spots are null
      selected: [],                           // indices into board
      used: new Set(),                        // uids of cards played or discarded
      score: 0,
      playsLeft: cfg.plays,
      discardsLeft: cfg.discards,
      message: "",
      over: null,                             // null, "won" or "lost"
    };
  },

  selectedCards() {
    return Game.state.selected.map((i) => Game.state.board[i]);
  },

  toggle(i) {
    const s = Game.state;
    if (s.over || !s.board[i]) return;
    const at = s.selected.indexOf(i);
    if (at >= 0) s.selected.splice(at, 1);
    else if (s.selected.length < Math.max(window.SETTRY_CONFIG.maxPlay, window.SETTRY_CONFIG.maxDiscardSize)) s.selected.push(i);
    s.message = "";
  },

  // The hand the selected cards make, or null.
  selectedHand() {
    const cfg = window.SETTRY_CONFIG;
    const n = Game.state.selected.length;
    return n >= cfg.minPlay && n <= cfg.maxPlay ? Hands.best(Game.selectedCards()) : null;
  },

  canPlay() {
    return !Game.state.over && Game.state.playsLeft > 0 && !!Game.selectedHand();
  },

  canDiscard() {
    const s = Game.state;
    const n = s.selected.length;
    return !s.over && s.discardsLeft > 0 && n >= 1 && n <= window.SETTRY_CONFIG.maxDiscardSize;
  },

  play() {
    const s = Game.state;
    if (!Game.canPlay()) return;
    const hand = Game.selectedHand();
    s.score += hand.score;
    s.playsLeft--;
    s.message = `${hand.name}: ${hand.points} × ${hand.mult} = ${hand.score}`;
    Game.replaceSelected();
    Game.checkEnd();
  },

  discard() {
    const s = Game.state;
    if (!Game.canDiscard()) return;
    s.discardsLeft--;
    s.message = `Discarded ${s.selected.length}.`;
    Game.replaceSelected();
  },

  // Selected cards leave the board; cards from the draw pile take their spots.
  // Once the pile is empty, the spots stay empty.
  replaceSelected() {
    const s = Game.state;
    for (const i of s.selected) {
      s.used.add(s.board[i].uid);
      s.board[i] = s.pile.length ? s.pile.shift() : null;
    }
    s.selected = [];
  },

  checkEnd() {
    const s = Game.state;
    if (s.score >= window.SETTRY_CONFIG.roundTarget) s.over = "won";
    else if (s.playsLeft === 0) s.over = "lost";
  },
};
