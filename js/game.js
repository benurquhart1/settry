// Round state and rules. Rendering lives in js/ui.js.
const Game = {
  state: null,

  // Start a run with a deck from data/decks.js, a seed, and any test jokers.
  // Each kind of randomness has its own seeded stream, so (for example) rerolling the shop
  // never changes which cards you draw.
  newRun(deckDef, seed, jokers = []) {
    const rng = {};
    for (const stream of ["deck", "shuffle", "shop", "pack", "luck"]) rng[stream] = Rng.create(`${seed}/${stream}`);
    const runDeck = Deck.runDeck(deckDef, rng.deck);
    Game.state = {
      seed,
      deckDef,
      rng,
      runDeck,                                // every card in your deck; carries over between rounds
      nextUid: runDeck.length,                // uid for the next card added to the deck
      jokers,                                 // held joker ids, applied left to right
      consumables: [],                        // held charm ids (data/consumables.js)
      lastConsumable: null,                   // last charm used, for Echo
      money: window.SETTRY_CONFIG.startMoney,
      ante: 1,
      roundIndex: 0,                          // 0 small, 1 big, 2 boss (see config.rounds)
      timesPlayed: {},                        // hand id -> times played this run
      phase: "round",                         // round, cashout, shop, pack, lost, won
    };
    Game.startRound();
  },

  roundInfo() {
    const cfg = window.SETTRY_CONFIG;
    const s = Game.state;
    const r = cfg.rounds[s.roundIndex];
    return { ...r, target: Math.round(cfg.anteTargets[s.ante - 1] * r.targetMult) };
  },

  // Shuffle the whole deck into a fresh draw pile and deal the board.
  startRound() {
    const s = Game.state;
    const setting = (name) => Jokers.setting(name, s.jokers);
    s.pile = Deck.shuffle(s.runDeck, s.rng.shuffle);   // draw pile, top first
    Object.assign(s, {
      phase: "round",
      board: s.pile.splice(0, setting("boardSize")),   // face-up cards; empty spots are null
      selected: [],                           // indices into board, in the order clicked
      used: new Set(),                        // uids of cards played or discarded this round
      maxPlay: setting("maxPlay"),
      score: 0,
      target: Game.roundInfo().target,
      playsLeft: setting("plays"),
      discardsLeft: setting("discards"),
      firstDiscardDone: false,                // for jokers that act on the round's first discard
      message: "",
    });
  },

  // What winning the round pays: the round's reward and $1 per unused hand, then money jokers
  // (interest, gambles, Loan Shark's debt interest) left to right, each on the running balance.
  // Worked out once when the round is won (gambles roll with the seed), shown at cash out.
  earnings() {
    const cfg = window.SETTRY_CONFIG;
    const s = Game.state;
    const lines = [
      { label: `${Game.roundInfo().name} beaten`, amount: Game.roundInfo().reward },
      { label: `${s.playsLeft} unused hand${s.playsLeft === 1 ? "" : "s"}`, amount: s.playsLeft * cfg.moneyPerHandLeft },
    ].filter((l) => l.amount > 0);
    let money = s.money + lines.reduce((t, l) => t + l.amount, 0);
    for (const id of s.jokers) {
      const j = Jokers.byId(id);
      const e = j.effect;
      let amount = 0;
      let label = j.name;
      if (e.type === "interest" && money > 0) {
        amount = Math.floor(money * e.rate);
        if (e.max !== null) amount = Math.min(e.max, amount);
        label += ` (${Math.round(e.rate * 100)}% interest)`;
      }
      if (e.type === "moneyGamble" && money > 0) {
        const win = s.rng.luck() < e.chance;
        amount = Math.round(money * (win ? e.win : e.lose)) - money;
        label += win ? ` (×${e.win})` : ` (×${e.lose})`;
      }
      if (e.type === "loanShark" && money < 0) {
        amount = -Math.ceil(-money * e.rate);
        label += ` (${Math.round(e.rate * 100)}% interest on $${-money} debt)`;
      }
      if (!amount) continue;
      lines.push({ label, amount });
      money += amount;
    }
    return { lines, total: lines.reduce((t, l) => t + l.amount, 0) };
  },

  cashOut() {
    const s = Game.state;
    if (s.phase !== "cashout") return;
    s.money += s.payout.total;
    s.payout = null;
    if (Game.checkDebt()) return;
    Shop.open();
  },

  // Lowest your money can go before you lose: Loan Shark's limit, otherwise $0.
  // Returns the lowest balance spending may leave you with.
  minMoney() {
    const shark = Jokers.has(Game.state.jokers, "loanShark")[0];
    return shark ? shark.effect.limit + 1 : 0;
  },

  canSpend(amount) {
    return Game.state.money - amount >= Game.minMoney();
  },

  // Lose the run if your money is below what you're allowed (in debt without Loan Shark, or at its limit).
  checkDebt() {
    const s = Game.state;
    if (s.money >= Game.minMoney()) return false;
    s.phase = "lost";
    s.lostReason = Jokers.has(s.jokers, "loanShark").length
      ? `Your debt reached $${-s.money}: the Loan Shark came to collect.`
      : `You were $${-s.money} in debt without the Loan Shark.`;
    return true;
  },

  // Leave the shop: on to the next round, or the next ante after the boss.
  nextRound() {
    const s = Game.state;
    const cfg = window.SETTRY_CONFIG;
    s.roundIndex++;
    if (s.roundIndex >= cfg.rounds.length) { s.roundIndex = 0; s.ante++; }
    Game.startRound();
  },

  sellJoker(k) {
    const s = Game.state;
    const id = s.jokers[k];
    if (!id || s.phase === "round") return;
    s.money += Jokers.sellPrice(id);
    s.jokers.splice(k, 1);
    Game.checkDebt();
  },

  selectedCards() {
    return Game.state.selected.map((i) => Game.state.board[i]);
  },

  toggle(i) {
    const s = Game.state;
    if (s.phase !== "round" || !s.board[i]) return;
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
      ? Hands.best(Game.selectedCards(), { jokers: s.jokers, timesPlayed: s.timesPlayed, held: Game.heldCards() })
      : null;
  },

  // Board cards that are not selected (Steel cards work from here).
  heldCards() {
    const s = Game.state;
    return s.board.filter((c, i) => c && !s.selected.includes(i));
  },

  canPlay() {
    return Game.state.phase === "round" && Game.state.playsLeft > 0 && !!Game.selectedHand();
  },

  canDiscard() {
    const s = Game.state;
    const n = s.selected.length;
    return s.phase === "round" && s.discardsLeft > 0 && n >= 1 && n <= window.SETTRY_CONFIG.maxDiscardSize;
  },

  // Scores the selected cards for real, rolling any chance effects with the seed.
  // Call once per play, then pass the result to play().
  rollHand() {
    const s = Game.state;
    if (!Game.canPlay()) return null;
    const preview = Game.selectedHand();
    const scored = Hands.score(Game.selectedCards(), window.SETTRY_HANDS[preview.id], preview.id,
      { jokers: s.jokers, timesPlayed: s.timesPlayed, held: Game.heldCards(), random: s.rng.luck });
    return { ...preview, ...scored };
  },

  play(hand = Game.rollHand()) {
    const s = Game.state;
    if (!hand || !Game.canPlay()) return;
    s.score += hand.total;
    s.money += hand.money;
    s.timesPlayed[hand.id] = (s.timesPlayed[hand.id] || 0) + 1;
    s.playsLeft--;
    s.message = `${hand.name}: ${hand.points} × ${hand.mult} = ${hand.total}` + (hand.money ? ` · +$${hand.money}` : "");
    // Broken Glass cards leave the deck for good.
    if (hand.broken.length) {
      s.runDeck = s.runDeck.filter((c) => !hand.broken.includes(c.uid));
      s.message += ` · ${hand.broken.length} glass card${hand.broken.length === 1 ? "" : "s"} broke`;
    }
    Game.replaceSelected(hand.broken);
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
          const copy = { ...card, uid: s.nextUid++ };
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
    for (const c of cards) s.pile.splice(Rng.int(s.rng.shuffle, s.pile.length + 1), 0, c);
  },

  checkEnd() {
    const s = Game.state;
    if (s.score >= s.target) {
      const last = s.ante === window.SETTRY_CONFIG.antes && s.roundIndex === window.SETTRY_CONFIG.rounds.length - 1;
      s.phase = last ? "won" : "cashout";
      if (!last) s.payout = Game.earnings();
    } else if (s.playsLeft === 0) s.phase = "lost";
  },
};
