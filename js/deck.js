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

  // The cards a starting deck draws from: those matching deck.filter, numbered 1 to 4.
  pool(deck = {}) {
    return Deck.full().filter((c) => window.SETTRY_START_COUNTS.includes(c.count) &&
      Object.entries(deck.filter || {}).every(([k, v]) => c[k] === v));
  },

  // Give a card the id matching its attributes (after a charm changes one).
  reid(card) {
    card.id = `${card.count}-${card.shape}-${card.shading}-${card.color}`;
    return card;
  },

  // A run deck: deck.size cards drawn with replacement from Deck.pool(deck).
  // Each drawn card gets its own uid, since the same card can appear more than once.
  runDeck(deck, random) {
    const pool = Deck.pool(deck);
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
  // `rules` (from Jokers.rules) can bend this: interchangeable values, ignored attributes.
  isSet(cards, rules = {}) {
    return Object.keys(window.SETTRY_ATTRIBUTES).every((k) => {
      const options = cards.map((c) => Deck.options(c, k, rules));
      if (Deck.canBeSame(options) || Deck.canBeDifferent(options)) return true;
      const tally = {};
      for (const c of cards) if (!Deck.isWild(c, k)) tally[c[k]] = (tally[c[k]] || 0) + 1;
      const counts = Object.values(tally);
      return window.SETTRY_CONFIG.allowPairs && cards.length % 2 === 0 &&
        counts.every((v) => v <= 2) && counts.length <= cards.length / 2;
    });
  },

  // The values a card can count as for one attribute: every value if it's wild or the
  // attribute is ignored (Blur), its pair if a joker makes values interchangeable
  // (Shape Shifter, Colorblind), otherwise just its own.
  options(card, attribute, rules = {}) {
    if (Deck.isWild(card, attribute) || (rules.ignore || []).includes(attribute)) return window.SETTRY_ATTRIBUTES[attribute];
    const pair = (rules.interchange?.[attribute] || []).find((p) => p.includes(card[attribute]));
    return pair || [card[attribute]];
  },

  // Can every card take the same value?
  canBeSame(options) {
    return options.length === 0 || options[0].some((v) => options.every((o) => o.includes(v)));
  },

  // Can every card take a different value?
  canBeDifferent(options, taken = []) {
    if (!options.length) return true;
    const [first, ...rest] = options;
    return first.some((v) => !taken.includes(v) && Deck.canBeDifferent(rest, [...taken, v]));
  },

  isWild(card, attribute) {
    return (card.mods || []).some((m) => window.SETTRY_MODIFIERS[m]?.wild === attribute);
  },
};
