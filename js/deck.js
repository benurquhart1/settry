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

  shuffle(cards) {
    const c = cards.slice();
    for (let i = c.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [c[i], c[j]] = [c[j], c[i]];
    }
    return c;
  },

  runDeck(size) {
    return Deck.shuffle(Deck.full()).slice(0, size);
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
