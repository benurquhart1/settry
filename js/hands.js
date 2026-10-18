// Works out which hand a play makes. No DOM code here.
const Hands = {
  // Cards are "of a kind" when they are identical: the same on all four attributes.
  // A wild attribute matches anything.
  identical(cards) {
    return Object.keys(window.SETTRY_ATTRIBUTES).every((k) =>
      new Set(cards.filter((c) => !Deck.isWild(c, k)).map((c) => c[k])).size <= 1);
  },

  // Can the cards be split into groups of identical cards with exactly these sizes (e.g. [3, 2])?
  kindGroups(cards, sizes) {
    if (!cards.length) return !sizes.length;
    const [first, ...others] = cards;
    // The first card belongs to some group: try each size for it, with every choice of partners.
    return [...new Set(sizes)].some((size) => {
      const rest = sizes.slice();
      rest.splice(rest.indexOf(size), 1);
      const pick = (start, chosen) => {
        if (chosen.length === size - 1)
          return Hands.identical([first, ...chosen]) && Hands.kindGroups(others.filter((c) => !chosen.includes(c)), rest);
        for (let i = start; i < others.length; i++) if (pick(i + 1, [...chosen, others[i]])) return true;
        return false;
      };
      return pick(0, []);
    });
  },

  // Does exactly this group of cards make the hand?
  checks: {
    pair: (c) => c.length === 2 && Hands.identical(c),
    threeKind: (c) => c.length === 3 && Hands.identical(c),
    fourKind: (c) => c.length === 4 && Hands.identical(c),
    fiveKind: (c) => c.length === 5 && Hands.identical(c),
    twoPair: (c) => c.length === 4 && Hands.kindGroups(c, [2, 2]),
    fullHouse: (c) => c.length === 5 && Hands.kindGroups(c, [3, 2]),
    set3: (c) => c.length === 3 && Deck.isSet(c),
    set4: (c) => c.length === 4 && Deck.isSet(c),
  },

  // Points a card adds when it scores: its number, plus 30 for a Bonus card.
  cardPoints(card) {
    return card.count + (window.SETTRY_ENHANCEMENTS[card.enh]?.points || 0);
  },

  // Scores a hand Balatro-style: start from the hand's points and mult, then each card,
  // in the order given (the order clicked), adds its points and applies its enhancement,
  // then Steel cards left on the board apply, then each joker applies left to right.
  // ctx: { jokers: [ids], timesPlayed: {handId: n} for plays already made this game,
  //        held: board cards not being played (for Steel),
  //        random: the game's random(), only when the hand is actually played }.
  // Chances (Lucky, Glass breaking) only roll with `random`; the preview shows the odds.
  score(cards, hand, id, ctx = {}) {
    const enhs = window.SETTRY_ENHANCEMENTS;
    const steps = [];
    const broken = [];
    let points = hand.points;
    let mult = hand.mult;
    let money = 0;
    const roll = (odds) => ctx.random() < 1 / odds;
    for (const card of cards) {
      const add = Hands.cardPoints(card);
      points += add;
      const e = enhs[card.enh] || {};
      const labels = [];
      if (e.mult) { mult += e.mult; labels.push(`+${e.mult} mult`); }
      if (e.luckyMult) {
        if (!ctx.random) labels.push(`1 in ${e.luckyMult.odds}: +${e.luckyMult.mult} mult, 1 in ${e.luckyMoney.odds}: $${e.luckyMoney.money}`);
        else {
          if (roll(e.luckyMult.odds)) { mult += e.luckyMult.mult; labels.push(`lucky +${e.luckyMult.mult} mult`); }
          if (roll(e.luckyMoney.odds)) { money += e.luckyMoney.money; labels.push(`lucky +$${e.luckyMoney.money}`); }
        }
      }
      if (e.xMult) { mult *= e.xMult; labels.push(`×${e.xMult} mult`); }
      if (e.breakOdds && ctx.random && roll(e.breakOdds)) { broken.push(card.uid); labels.push("broke"); }
      steps.push({ card, add, points, mult, label: labels.join(", ") });
    }
    const heldSteps = [];
    for (const card of ctx.held || []) {
      const x = enhs[card.enh]?.heldXMult;
      if (!x) continue;
      mult *= x;
      heldSteps.push({ card, points, mult, label: `×${x} mult` });
    }
    const counts = Jokers.counts(cards, id, ((ctx.timesPlayed || {})[id] || 0) + 1);
    const j = Jokers.apply(ctx.jokers || [], counts, cards, points, mult, ctx.random);
    return { steps, heldSteps, jokerSteps: j.steps, broken, cardPoints: points, cardMult: mult,
      points: j.points, baseMult: hand.mult, mult: j.mult, money: money + j.money, total: j.points * j.mult };
  },

  // The best-scoring hand made by all of the played cards together, or null.
  // Every played card has to be part of the hand: no extra cards.
  best(cards, ctx) {
    let best = null;
    for (const [id, hand] of Object.entries(window.SETTRY_HANDS)) {
      if (!Hands.checks[id]?.(cards)) continue;
      const scored = Hands.score(cards, hand, id, ctx);
      if (!best || scored.total > best.total) best = { id, ...hand, ...scored };
    }
    return best;
  },
};
