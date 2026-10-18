// Deck building and the Set rule. No DOM code here.
const Deck = {
  full() {
    const a = window.SETTRY_ATTRIBUTES;
    const cards = [];
    for (const count of a.count)
      for (const shape of a.shape)
        for (const shading of a.shading)
          for (const color of a.color)
            cards.push({ id: `${count}-${shape}-${shading}-${color}`, count, shape, shading, color });
    return cards;
  },

  // A run deck: deck.size cards drawn with replacement from the cards matching deck.filter.
  // Each drawn card gets its own uid, since the same card can appear more than once.
  runDeck(deck, random) {
    const pool = Deck.full().filter((c) => Object.entries(deck.filter || {}).every(([k, v]) => c[k] === v));
    return Array.from({ length: deck.size }, (_, i) => ({ ...pool[Rng.int(random, pool.length)], uid: i }));
  },

  // A shuffled copy, using a seeded random().
  shuffle(cards, random) {
    const c = cards.slice();
    for (let i = c.length - 1; i > 0; i--) {
      const j = Rng.int(random, i + 1);
      [c[i], c[j]] = [c[j], c[i]];
    }
    return c;
  },

  // A set (3 or 4 cards): for each attribute the cards are all the same or all different
  // (or, with allowPairs, split into equal pairs such as A A B B).
  // A wild card (see data/modifiers.js) counts as whatever value its attribute needs.
  isSet(cards) {
    return Object.keys(window.SETTRY_ATTRIBUTES).every((k) => {
      const tally = {};
      for (const c of cards) if (!Deck.isWild(c, k)) tally[c[k]] = (tally[c[k]] || 0) + 1;
      const counts = Object.values(tally);
      if (counts.length <= 1) return true;                         // all same
      if (counts.every((v) => v === 1)) return true;               // all different
      return window.SETTRY_CONFIG.allowPairs && cards.length % 2 === 0 &&
        counts.every((v) => v <= 2) && counts.length <= cards.length / 2;
    });
  },

  isWild(card, attribute) {
    return (card.mods || []).some((m) => window.SETTRY_MODIFIERS[m]?.wild === attribute);
  },
};
