// Applies joker effects. No DOM code here.
const Jokers = {
  byId(id) {
    return window.SETTRY_JOKERS.find((j) => j.id === id);
  },

  // A round setting (plays, discards, boardSize, maxPlay) after "extra" jokers.
  setting(name, jokerIds) {
    let value = window.SETTRY_CONFIG[name];
    for (const id of jokerIds) {
      const e = Jokers.byId(id).effect;
      if (e.type === "extra" && e.setting === name) value += e.amount;
    }
    return value;
  },

  // Differences and matches in a played hand (see SETTRY_JOKER_GLOSSARY in data/jokers.js).
  counts(cards, handId, timesPlayed) {
    if (handId.startsWith("set")) {
      let different = 0;
      let same = 0;
      for (const k of Object.keys(window.SETTRY_ATTRIBUTES)) {
        const values = new Set(cards.filter((c) => !Deck.isWild(c, k)).map((c) => c[k]));
        if (values.size <= 1) same++;
        else different++;
      }
      return { different, same, timesPlayed };
    }
    const groups = { twoPair: 2, fullHouse: 2 }[handId] || 1;
    return { different: groups, same: cards.length, timesPlayed };
  },

  // Scoring steps for the held jokers, left to right, after the cards have added their points.
  // Returns { steps: [{ joker, label, mult }], mult, money }.
  apply(jokerIds, counts, mult) {
    const steps = [];
    let money = 0;
    for (const id of jokerIds) {
      const j = Jokers.byId(id);
      const e = j.effect;
      const n = counts[e.per];
      if (e.type === "addMult") { mult += n; steps.push({ joker: id, label: `+${n} mult`, mult }); }
      if (e.type === "mulMult") { mult *= n; steps.push({ joker: id, label: `×${n} mult`, mult }); }
      if (e.type === "money") { money += n; steps.push({ joker: id, label: `+$${n}`, mult }); }
    }
    return { steps, mult, money };
  },

  // Pick a random unlocked joker using the drop rates, with the game's seeded random().
  roll(random, ownedIds = []) {
    const rarities = window.SETTRY_JOKER_RARITIES;
    const pool = window.SETTRY_JOKERS.filter((j) => j.unlocked && !ownedIds.includes(j.id));
    const weighted = Object.entries(rarities).filter(([r, v]) => v.weight > 0 && pool.some((j) => j.rarity === r));
    let x = random() * weighted.reduce((t, [, v]) => t + v.weight, 0);
    const [rarity] = weighted.find(([, v]) => (x -= v.weight) < 0) || weighted[weighted.length - 1];
    const choices = pool.filter((j) => j.rarity === rarity);
    return choices[Rng.int(random, choices.length)];
  },
};
