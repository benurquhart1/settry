// Round state and rules. Rendering lives in js/ui.js.
const Game = {
  state: null,

  // Start a round with a deck from data/decks.js and a seed for every random choice.
  start(deckDef, seed, jokers = []) {
    const setting = (name) => Jokers.setting(name, jokers);
    const random = Rng.create(seed);
    const runDeck = Deck.runDeck(deckDef, random);
    const pile = runDeck.slice();
    Game.state = {
      seed,
      deckDef,
      random,                                 // use for anything random later (rewards, shop)
      runDeck,                                // every card in this run's deck
      pile,                                   // draw pile, top first
      board: pile.splice(0, setting("boardSize")),   // face-up cards; empty spots are null
      selected: [],                           // indices into board
      used: new Set(),                        // uids of cards played or discarded
      jokers,                                 // held joker ids, applied left to right
      maxPlay: setting("maxPlay"),
      timesPlayed: {},                        // hand id -> times played this game
      money: 0,
      firstDiscardDone: false,                // for jokers that act on the round's first discard
      score: 0,
      playsLeft: setting("plays"),
      discardsLeft: setting("discards"),
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
    else if (s.selected.length < Math.max(s.maxPlay, window.SETTRY_CONFIG.maxDiscardSize)) s.selected.push(i);
    s.message = "";
  },

  // The hand the selected cards make, or null.
  selectedHand() {
    const s = Game.state;
    const n = s.selected.length;
    return n >= window.SETTRY_CONFIG.minPlay && n <= s.maxPlay
      ? Hands.best(Game.selectedCards(), { jokers: s.jokers, timesPlayed: s.timesPlayed })
      : null;
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
    const lucky = Jokers.chanceMoney(s.jokers, Game.selectedCards(), s.random);
    s.score += hand.total;
    s.money += hand.money + lucky;
    s.timesPlayed[hand.id] = (s.timesPlayed[hand.id] || 0) + 1;
    s.playsLeft--;
    s.message = `${hand.name}: ${hand.points} × ${hand.mult} = ${hand.total}` + (lucky ? ` · +$${lucky} from luck` : "");
    Game.replaceSelected();
    Game.checkEnd();
  },

  discard() {
    const s = Game.state;
    if (!Game.canDiscard()) return;
    s.discardsLeft--;
    s.message = `Discarded ${s.selected.length}.`;
    let removed = [];
    if (!s.firstDiscardDone && s.selected.length === 1) {
      const card = s.board[s.selected[0]];
      for (const j of Jokers.has(s.jokers, "singleDiscard")) {
        if (j.effect.action === "duplicate") {
          const copy = { ...card, uid: Math.max(...s.runDeck.map((c) => c.uid)) + 1 };
          s.runDeck.push(copy);
          Game.shuffleIntoPile([copy]);
          s.message += ` ${j.name} added a copy to your deck.`;
        }
        if (j.effect.action === "remove") {
          s.runDeck = s.runDeck.filter((c) => c.uid !== card.uid);
          removed = [card.uid];
          s.message += ` ${j.name} removed it from your deck.`;
        }
      }
    }
    s.firstDiscardDone = true;
    Game.replaceSelected(removed);
  },

  // Selected cards leave the board; cards from the draw pile take their spots.
  // Once the pile is empty, the spots stay empty. With Recycle, the cards then go back into the pile.
  replaceSelected(removed = []) {
    const s = Game.state;
    const gone = s.selected.map((i) => s.board[i]);
    for (const i of s.selected) s.board[i] = s.pile.length ? s.pile.shift() : null;
    s.selected = [];
    const back = Jokers.has(s.jokers, "recycle").length ? gone.filter((c) => !removed.includes(c.uid)) : [];
    for (const c of gone) if (!back.includes(c)) s.used.add(c.uid);
    Game.shuffleIntoPile(back);
  },

  // Put cards into the draw pile at random (seeded) places.
  shuffleIntoPile(cards) {
    const s = Game.state;
    for (const c of cards) s.pile.splice(Rng.int(s.random, s.pile.length + 1), 0, c);
  },

  checkEnd() {
    const s = Game.state;
    if (s.score >= window.SETTRY_CONFIG.roundTarget) s.over = "won";
    else if (s.playsLeft === 0) s.over = "lost";
  },
};
