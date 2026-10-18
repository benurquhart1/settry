// Works out which hand a play makes. No DOM code here.
const Hands = {
  // Numbers a card can stand for: its own, or any number if its number is wild.
  numbers(card) {
    return Deck.isWild(card, "count") ? window.SETTRY_ATTRIBUTES.count : [card.count];
  },

  // Every way to read the cards' numbers, trying each value for wild numbers.
  numberReadings(cards) {
    return cards.reduce((acc, c) => acc.flatMap((r) => Hands.numbers(c).map((n) => [...r, n])), [[]]);
  },

  // Group sizes of equal numbers, largest first, for the best reading. E.g. [3, 2] for a full house.
  kindGroups(cards, fits) {
    return Hands.numberReadings(cards).some((r) => {
      const tally = {};
      for (const n of r) tally[n] = (tally[n] || 0) + 1;
      return fits(Object.values(tally).sort((a, b) => b - a));
    });
  },

  // Does exactly this group of cards make the hand?
  checks: {
    pair: (c) => c.length === 2 && Hands.kindGroups(c, (g) => g[0] === 2),
    threeKind: (c) => c.length === 3 && Hands.kindGroups(c, (g) => g[0] === 3),
    fourKind: (c) => c.length === 4 && Hands.kindGroups(c, (g) => g[0] === 4),
    fiveKind: (c) => c.length === 5 && Hands.kindGroups(c, (g) => g[0] === 5),
    twoPair: (c) => c.length === 4 && Hands.kindGroups(c, (g) => g[0] === 2 && g[1] === 2),
    fullHouse: (c) => c.length === 5 && Hands.kindGroups(c, (g) => g[0] === 3 && g[1] === 2),
    set3: (c) => c.length === 3 && Deck.isSet(c),
    set4: (c) => c.length === 4 && Deck.isSet(c),
  },

  // The best-scoring hand made by any group of the played cards (extra cards just don't score).
  best(cards) {
    let best = null;
    const groups = Hands.subsets(cards);
    for (const [id, hand] of Object.entries(window.SETTRY_HANDS)) {
      const score = hand.points * hand.mult;
      if (best && score <= best.score) continue;
      const used = groups.find((g) => Hands.checks[id]?.(g));
      if (used) best = { id, ...hand, score, used };
    }
    return best;
  },

  subsets(cards) {
    return cards.reduce((acc, c) => acc.concat(acc.map((s) => [...s, c])), [[]]).filter((s) => s.length >= 2);
  },
};
