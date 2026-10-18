// Round state and rules. Rendering lives in js/ui.js.
const Game = {
  state: null,

  // Start a run with a deck from data/decks.js, a seed, and any test jokers.
  // Each kind of randomness has its own seeded stream, so (for example) rerolling the shop
  // never changes which cards you draw.
  newRun(deckDef, seed, jokers = []) {
    const rng = {};
    for (const stream of ["deck", "shuffle", "shop", "pack", "luck", "fight"]) rng[stream] = Rng.create(`${seed}/${stream}`);
    const runDeck = Deck.runDeck(deckDef, rng.deck);
    Game.state = {
      seed,
      deckDef,
      rng,
      runDeck,                                // every card in your deck; carries over between rounds
      nextUid: runDeck.length,                // uid for the next card added to the deck
      jokers,                                 // held joker ids, applied left to right
      consumables: [],                        // held charms, { id, negative } (data/consumables.js)
      lastConsumable: null,                   // last charm used, for Echo
      jokerSlots: Math.max(window.SETTRY_CONFIG.jokerSlotsStart, jokers.length),
      money: window.SETTRY_CONFIG.startMoney,
      fightNumber: 0,                         // the fight being chosen or played, from 1
      endless: false,                         // true once you keep going after the last fight
      timesPlayed: {},                        // hand id -> times played this run
      phase: "choose",                        // choose, round, cashout, shop, pack, lost, won
    };
    Game.nextFight();
    Shop.openPack(window.SETTRY_FIGHTS.startPack, "start");
  },

  isBoss(n) {
    return n % window.SETTRY_FIGHTS.bossEvery === 0;
  },

  // Base target for fight n: one per group of 4 fights, growing in endless mode.
  baseTarget(n) {
    const f = window.SETTRY_FIGHTS;
    const g = Math.ceil(n / f.bossEvery) - 1;
    const last = f.groupTargets.length - 1;
    return g <= last ? f.groupTargets[g] : f.groupTargets[last] * f.endlessGrowth ** (g - last);
  },

  // Move on to the next fight and roll its two opponents.
  nextFight() {
    const s = Game.state;
    const f = window.SETTRY_FIGHTS;
    const n = ++s.fightNumber;
    const random = s.rng.fight;
    const pickTwo = (list) => {
      const a = Rng.int(random, list.length);
      const b = (a + 1 + Rng.int(random, list.length - 1)) % list.length;
      return [list[a], list[b]];
    };
    const names = pickTwo(f.names);
    const boss = Game.isBoss(n);
    const kinds = boss ? pickTwo(window.SETTRY_BOSS_MODIFIERS).map((modifier) => ({ ...f.boss, modifier }))
      : pickTwo(f.regular).sort((a, b) => a.reward - b.reward);
    // Regular fights offer prizes from the pool for their place in the group; bosses offer shop modifiers.
    const prizes = boss ? pickTwo(window.SETTRY_SHOP_MODIFIERS)
      : pickTwo(f.rewardPools[(n - 1) % f.bossEvery]);
    s.choices = kinds.map((k, i) => ({
      name: names[i],
      boss,
      reward: k.reward,
      prize: boss ? null : prizes[i],
      shopModifier: boss ? prizes[i] : null,
      modifier: k.modifier || null,
      target: Math.round(Game.baseTarget(n) * k.targetMult * (k.modifier?.targetMult || 1)),
    }));
    s.phase = "choose";
  },

  chooseFight(i) {
    const s = Game.state;
    if (s.phase !== "choose" || !s.choices[i]) return;
    s.fight = s.choices[i];
    Game.startRound();
  },

  // The fight being played (or just played).
  roundInfo() {
    return Game.state.fight;
  },

  // Does this card score in the current fight? (Boss "ban" modifiers stop some cards.)
  scores(card) {
    const d = Game.state.fight?.modifier?.debuff;
    return !d || card[d.attribute] !== d.value;
  },

  // Shuffle the whole deck into a fresh draw pile and deal the board.
  startRound() {
    const s = Game.state;
    const setting = (name) => Jokers.setting(name, s.jokers);
    // Recruit jokers add a random card to the deck first (rolled with the deck stream).
    // Phantom adds a negative charm (one that doesn't take a slot).
    const charms = Jokers.has(s.jokers, "negativeCharm").map((j) => {
      const c = Consumables.roll(s.rng.deck);
      s.consumables.push({ id: c.id, negative: true });
      return `${j.name} added a negative ${c.name}.`;
    });
    const added = Jokers.has(s.jokers, "addCard").map((j) => {
      const card = { ...Shop.packCard(j.effect, s.rng.deck), uid: s.nextUid++ };
      s.runDeck.push(card);
      return `${j.name} added a ${card.count} ${card.color} ${card.shading} ${card.shape}${card.enh ? ` (${window.SETTRY_ENHANCEMENTS[card.enh].name})` : ""}${card.mods ? ` (${card.mods.map((m) => window.SETTRY_MODIFIERS[m].name).join(", ")})` : ""}.`;
    });
    s.pile = Deck.shuffle(s.runDeck, s.rng.shuffle);   // draw pile, top first
    Object.assign(s, {
      phase: "round",
      board: s.pile.splice(0, setting("boardSize")),   // face-up cards; empty spots are null
      selected: [],                           // indices into board, in the order clicked
      used: new Set(),                        // uids of cards played or discarded this round
      maxPlay: Math.min(setting("maxPlay"), s.fight.modifier?.maxPlay || Infinity),
      score: 0,
      target: s.fight.target,
      playsLeft: setting("plays"),
      discardsLeft: setting("discards"),
      firstDiscardDone: false,                // for jokers that act on the round's first discard
      message: [...added, ...charms].join(" "),
    });
  },

  // What winning the round pays: the round's reward and $1 per unused hand, then money jokers
  // (interest, gambles, Loan Shark's debt interest) left to right, each on the running balance.
  // Worked out once when the round is won (gambles roll with the seed), shown at cash out.
  earnings() {
    const cfg = window.SETTRY_CONFIG;
    const s = Game.state;
    const lines = [
      { label: `${s.fight.name} beaten`, amount: s.fight.reward },
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
    const n = s.fightNumber;
    // Each boss before the last fight gives +1 joker slot (not the final boss, not endless mode).
    if (Game.isBoss(n) && n < window.SETTRY_FIGHTS.count)
      s.jokerSlots = Math.min(window.SETTRY_CONFIG.jokerSlotsMax, s.jokerSlots + 1);
    if (n === window.SETTRY_FIGHTS.count && !s.endless) s.phase = "won";
    else if (Game.isBoss(n)) Shop.open(s.fight.shopModifier);
    else Shop.openPack(s.fight.prize, "fight");
  },

  // After winning the run: keep going with endless fights, starting at the shop.
  goEndless() {
    const s = Game.state;
    if (s.phase !== "won") return;
    s.endless = true;
    Shop.open(s.fight.shopModifier);
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

  // Leave the shop: on to the next fight.
  leaveShop() {
    Game.nextFight();
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
      ? Hands.best(Game.selectedCards(), Game.scoreContext())
      : null;
  },

  scoreContext() {
    const s = Game.state;
    return { jokers: s.jokers, timesPlayed: s.timesPlayed, held: Game.heldCards(), scores: Game.scores };
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
      { ...Game.scoreContext(), random: s.rng.luck });
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
      s.phase = "cashout";
      s.payout = Game.earnings();
    } else if (s.playsLeft === 0) s.phase = "lost";
  },
};
