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
  isSet(cards) {
    const cfg = window.SETTRY_CONFIG;
    if (cards.length !== cfg.setSize) return false;
    return Object.keys(window.SETTRY_ATTRIBUTES).every((k) => {
      const tally = {};
      for (const c of cards) tally[c[k]] = (tally[c[k]] || 0) + 1;
      const n = Object.keys(tally).length;
      if (n === 1 || n === cards.length) return true;
      return cfg.allowPairs && Object.values(tally).every((v) => v === 2);
    });
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
