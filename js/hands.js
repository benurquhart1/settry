// Works out which hand a play makes. No DOM code here.
const Hands = {
  // Cards are "of a kind" when they are identical: the same on all four attributes.
  // A wild attribute matches anything. `rules` (from Jokers.rules) can bend this: interchangeable
  // values, ignored attributes, and Lookalike (one attribute may differ).
  identical(cards, rules = {}) {
    const differ = Object.keys(window.SETTRY_ATTRIBUTES)
      .filter((k) => !Deck.canBeSame(cards.map((c) => Deck.options(c, k, rules)))).length;
    return differ <= (rules.lookalike ? 1 : 0);
  },

  // Can the cards be split into groups of identical cards with exactly these sizes (e.g. [3, 2])?
  kindGroups(cards, sizes, rules) {
    if (!cards.length) return !sizes.length;
    const [first, ...others] = cards;
    // The first card belongs to some group: try each size for it, with every choice of partners.
    return [...new Set(sizes)].some((size) => {
      const rest = sizes.slice();
      rest.splice(rest.indexOf(size), 1);
      const pick = (start, chosen) => {
        if (chosen.length === size - 1)
          return Hands.identical([first, ...chosen], rules) && Hands.kindGroups(others.filter((c) => !chosen.includes(c)), rest, rules);
        for (let i = start; i < others.length; i++) if (pick(i + 1, [...chosen, others[i]])) return true;
        return false;
      };
      return pick(0, []);
    });
  },

  // Does exactly this group of cards make the hand?
  checks: {
    highCard: (c) => c.length === 1,
    pair: (c, r) => c.length === 2 && Hands.identical(c, r),
    threeKind: (c, r) => c.length === 3 && Hands.identical(c, r),
    fourKind: (c, r) => c.length === 4 && Hands.identical(c, r),
    fiveKind: (c, r) => c.length === 5 && Hands.identical(c, r),
    twoPair: (c, r) => c.length === 4 && Hands.kindGroups(c, [2, 2], r),
    fullHouse: (c, r) => c.length === 5 && Hands.kindGroups(c, [3, 2], r),
    set3: (c, r) => c.length === 3 && Deck.isSet(c, r),
    set4: (c, r) => c.length === 4 && Deck.isSet(c, r),
  },

  // Points a card adds when it scores: its number, plus 30 for a Bonus card (more with Polish),
  // plus what it gained (Workout).
  cardPoints(card, rules = {}) {
    const bonus = window.SETTRY_ENHANCEMENTS[card.enh]?.points;
    return card.count + (bonus ? bonus + (rules.enhBoost?.[card.enh] || 0) : 0) + (card.bonus || 0);
  },

  // Scores a hand Balatro-style: start from the hand's points and mult, then each card,
  // in the order given (the order clicked), adds its points and applies its enhancement,
  // then Steel cards left on the board apply, then each joker applies left to right.
  // ctx: { jokers: [ids], timesPlayed: {handId: n} for plays already made this game,
  //        held: board cards not being played (for Steel),
  //        scores(card): false for cards a boss stops from scoring (they still make the hand),
  //        rules: from Jokers.rules (retriggers, Glassblower, Lucky Stars...),
  //        pile, firstHand, lastHand, stats: for jokers (see Jokers.counts),
  //        random: the game's random(), only when the hand is actually played }.
  // Chances (Lucky, Glass breaking) only roll with `random`; the preview shows the odds.
  // Each step has `index`, the played card it belongs to (a retriggered card has two steps).
  score(cards, hand, id, ctx = {}) {
    const enhs = window.SETTRY_ENHANCEMENTS;
    const rules = ctx.rules || {};
    const steps = [];
    const broken = [];
    let points = hand.points;
    let mult = hand.mult;
    let money = 0;
    const luck = rules.luckyFactor || 1;
    const roll = (odds) => ctx.random() < luck / odds;
    const scores = ctx.scores || (() => true);
    for (const [index, card] of cards.entries()) {
      if (!scores(card)) { steps.push({ card, index, add: 0, points, mult, label: "doesn't score" }); continue; }
      const times = 1 + (index === 0 ? rules.retriggerFirst || 0 : 0) + (index === cards.length - 1 ? rules.retriggerLast || 0 : 0);
      for (let t = 0; t < times; t++) {
        const add = Hands.cardPoints(card, rules);
        points += add;
        const e = enhs[card.enh] || {};
        const labels = t ? ["again"] : [];
        if (e.mult) { const m = e.mult + (rules.enhBoost?.[card.enh] || 0); mult += m; labels.push(`+${m} mult`); }
        if (card.bonusMult) { mult += card.bonusMult; labels.push(`+${card.bonusMult} mult (gained)`); }
        if (e.luckyMult) {
          if (!ctx.random) labels.push(`${luck} in ${e.luckyMult.odds}: +${e.luckyMult.mult} mult, ${luck} in ${e.luckyMoney.odds}: $${e.luckyMoney.money}`);
          else {
            if (roll(e.luckyMult.odds)) { mult += e.luckyMult.mult; labels.push(`lucky +${e.luckyMult.mult} mult`); }
            if (roll(e.luckyMoney.odds)) { money += e.luckyMoney.money; labels.push(`lucky +$${e.luckyMoney.money}`); }
          }
        }
        const x = e.xMult && card.enh === "glass" && rules.glassMult ? rules.glassMult : e.xMult;
        if (x) { mult *= x; labels.push(`×${x} mult`); }
        if (e.breakOdds && ctx.random && !broken.includes(card.uid) && roll(e.breakOdds)) { broken.push(card.uid); labels.push("broke"); }
        steps.push({ card, index, add, points, mult, label: labels.join(", ") });
      }
    }
    const heldSteps = [];
    for (const card of (ctx.held || []).filter(scores)) {
      const x = enhs[card.enh]?.heldXMult;
      if (!x) continue;
      mult *= x;
      heldSteps.push({ card, points, mult, label: `×${x} mult` });
    }
    const counts = Jokers.counts(cards, id, ctx);
    const j = Jokers.apply(ctx.jokers || [], counts, cards.filter(scores), points, mult, ctx.random);
    return { steps, heldSteps, jokerSteps: j.steps, broken, cardPoints: points, cardMult: mult,
      points: j.points, baseMult: hand.mult, mult: j.mult, money: money + j.money, total: Math.round(j.points * j.mult) };
  },

  // The best-scoring hand made by all of the played cards together, or null.
  // Every played card has to be part of the hand: no extra cards.
  // With Set Master, a set of 3 scores (and counts) as a set of 4.
  best(cards, ctx = {}) {
    const rules = ctx.rules || {};
    let best = null;
    for (const [handId, data] of Object.entries(window.SETTRY_HANDS)) {
      if (!Hands.checks[handId]?.(cards, rules)) continue;
      const master = rules.setMaster && handId === "set3";
      const id = master ? "set4" : handId;
      const hand = window.SETTRY_HANDS[id];
      const scored = Hands.score(cards, hand, id, ctx);
      if (!best || scored.total > best.total) best = { id, ...hand, ...(master ? { name: "Set of 3 (as a set of 4)" } : {}), ...scored };
    }
    return best;
  },
};
