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

  // The best-scoring hand made by all of the played cards together, or null.
  // Every played card has to be part of the hand: no extra cards.
  best(cards) {
    let best = null;
    for (const [id, hand] of Object.entries(window.SETTRY_HANDS)) {
      const score = hand.points * hand.mult;
      if ((!best || score > best.score) && Hands.checks[id]?.(cards)) best = { id, ...hand, score };
    }
    return best;
  },
};
