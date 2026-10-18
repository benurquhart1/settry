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
      return { different, same, timesPlayed, allDifferentSet: same === 0 };
    }
    const groups = { twoPair: 2, fullHouse: 2 }[handId] || 1;
    return { different: groups, same: cards.length, timesPlayed };
  },

  // Played cards that count as a color (a wild color counts as every color).
  colorCount(cards, color) {
    return cards.filter((c) => c.color === color || Deck.isWild(c, "color")).length;
  },

  // Scoring steps for the held jokers, left to right, after the cards have added their points.
  // Returns { steps: [{ joker, label, points, mult }], points, mult, money }.
  // Chance-based money is not rolled here (this also runs for the preview); see chanceMoney.
  apply(jokerIds, counts, cards, points, mult) {
    const steps = [];
    let money = 0;
    const step = (joker, label) => steps.push({ joker, label, points, mult });
    for (const id of jokerIds) {
      const e = Jokers.byId(id).effect;
      const n = counts[e.per];
      if (e.type === "addMult") { mult += n; step(id, `+${n} mult`); }
      if (e.type === "mulMult") { mult *= n; step(id, `×${n} mult`); }
      if (e.type === "money") { money += n; step(id, `+$${n}`); }
      if (e.type === "allDifferentSet" && counts.allDifferentSet) { mult *= e.mult; step(id, `×${e.mult} mult`); }
      if (e.type === "colorCards") {
        const k = Jokers.colorCount(cards, e.color);
        if (!k) continue;
        if (e.mult) { mult += k * e.mult; step(id, `+${k * e.mult} mult`); }
        if (e.points) { points += k * e.points; step(id, `+${k * e.points} points`); }
        if (e.chance) step(id, `${k} chance${k > 1 ? "s" : ""} at $${e.money}`);
      }
    }
    return { steps, points, mult, money };
  },

  // Rolls chance-based money for a play, with the game's seeded random(). Call once, when the hand is played.
  chanceMoney(jokerIds, cards, random) {
    let money = 0;
    for (const id of jokerIds) {
      const e = Jokers.byId(id).effect;
      if (e.type !== "colorCards" || !e.chance) continue;
      for (let i = 0; i < Jokers.colorCount(cards, e.color); i++) if (random() < e.chance) money += e.money;
    }
    return money;
  },

  has(jokerIds, type) {
    return jokerIds.map(Jokers.byId).filter((j) => j.effect.type === type);
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
