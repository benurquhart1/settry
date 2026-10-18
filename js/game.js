// Round state and rules. Rendering lives in js/ui.js.
const Game = {
  state: null,

  newRun() {
    const cfg = window.SETTRY_CONFIG;
    const deck = Deck.runDeck(cfg.runDeckSize);
    Game.state = {
      deck,                                   // draw pile for this run
      hand: deck.splice(0, cfg.handSize),     // cards you can play
      selected: [],                           // indices into hand
      score: 0,
      playsLeft: cfg.plays,
      discardsLeft: cfg.discards,
      message: "",
      over: null,                             // null, "won" or "lost"
    };
  },

  selectedCards() {
    return Game.state.selected.map((i) => Game.state.hand[i]);
  },

  toggle(i) {
    const s = Game.state;
    if (s.over) return;
    const at = s.selected.indexOf(i);
    if (at >= 0) s.selected.splice(at, 1);
    else if (s.selected.length < Math.max(window.SETTRY_CONFIG.maxPlay, window.SETTRY_CONFIG.maxDiscardSize)) s.selected.push(i);
    s.message = "";
  },

  canPlay() {
    const cfg = window.SETTRY_CONFIG;
    const n = Game.state.selected.length;
    return !Game.state.over && n >= cfg.minPlay && n <= cfg.maxPlay && !!Hands.best(Game.selectedCards());
  },

  canDiscard() {
    const s = Game.state;
    const n = s.selected.length;
    return !s.over && s.discardsLeft > 0 && n >= 1 && n <= window.SETTRY_CONFIG.maxDiscardSize;
  },

  play() {
    const s = Game.state;
    if (!Game.canPlay()) return;
    const hand = Hands.best(Game.selectedCards());
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

  // Selected cards leave the hand; new cards from the deck take their spots.
  replaceSelected() {
    const s = Game.state;
    for (const i of s.selected) s.hand[i] = s.deck.length ? s.deck.shift() : null;
    s.hand = s.hand.filter(Boolean);
    s.selected = [];
  },

  checkEnd() {
    const s = Game.state;
    if (s.score >= window.SETTRY_CONFIG.roundTarget) s.over = "won";
    else if (s.playsLeft === 0) s.over = "lost";
  },
};
