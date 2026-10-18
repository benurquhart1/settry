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

  // A set: for each attribute the cards are all the same, all different,
  // or (with allowPairs) split into equal pairs such as A A B B.
  // A wild card (see data/modifiers.js) counts as whatever value its attribute needs.
  isSet(cards) {
    const cfg = window.SETTRY_CONFIG;
    if (cards.length !== cfg.setSize) return false;
    return Object.keys(window.SETTRY_ATTRIBUTES).every((k) => {
      const tally = {};
      for (const c of cards) if (!Deck.isWild(c, k)) tally[c[k]] = (tally[c[k]] || 0) + 1;
      const counts = Object.values(tally);
      if (counts.length <= 1) return true;                         // all same
      if (counts.every((v) => v === 1)) return true;               // all different
      return cfg.allowPairs && cards.length % 2 === 0 &&           // two pairs
        counts.every((v) => v <= 2) && counts.length <= cards.length / 2;
    });
  },

  isWild(card, attribute) {
    return (card.mods || []).some((m) => window.SETTRY_MODIFIERS[m]?.wild === attribute);
  },

  findSets(cards) {
    const size = window.SETTRY_CONFIG.setSize;
    const found = [];
    const pick = (start, chosen) => {
      if (chosen.length === size) {
        if (Deck.isSet(chosen.map((i) => cards[i]))) found.push(chosen);
        return;
      }
      for (let i = start; i < cards.length; i++) pick(i + 1, [...chosen, i]);
    };
    pick(0, []);
    return found;
  },
};
