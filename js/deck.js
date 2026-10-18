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

  // A set: for each attribute, all three cards match or all three differ.
  isSet(a, b, c) {
    return Object.keys(window.SETTRY_ATTRIBUTES).every((k) => {
      const n = new Set([a[k], b[k], c[k]]).size;
      return n === 1 || n === 3;
    });
  },

  findSets(cards) {
    const found = [];
    for (let i = 0; i < cards.length; i++)
      for (let j = i + 1; j < cards.length; j++)
        for (let k = j + 1; k < cards.length; k++)
          if (Deck.isSet(cards[i], cards[j], cards[k])) found.push([i, j, k]);
    return found;
  },
};
