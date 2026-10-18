// Applies joker effects. No DOM code here.
const Jokers = {
  byId(id) {
    return window.SETTRY_JOKERS.find((j) => j.id === id);
  },

  // A setting (plays, discards, boardSize, maxPlay, shopJokerSlots) after "extra" jokers.
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

  // Played cards whose attribute has this value (a wild card counts as every value).
  cardsWith(cards, attribute, value) {
    return cards.filter((c) => c[attribute] === value || Deck.isWild(c, attribute));
  },

  // Scoring steps for the held jokers, left to right, after the cards have added their points.
  // Returns { steps: [{ joker, label, points, mult }], points, mult, money }.
  // Chance effects only happen when `random` is given, which is once, when the hand is played;
  // without it (the preview) they show as a step with no effect.
  apply(jokerIds, counts, cards, points, mult, random) {
    const steps = [];
    let money = 0;
    const step = (joker, label) => steps.push({ joker, label, points, mult });
    for (const id of jokerIds) {
      const e = Jokers.byId(id).effect;
      const n = e.amount ?? counts[e.per];
      if (e.type === "addMult") { mult += n; step(id, `+${n} mult`); }
      if (e.type === "mulMult") { mult *= n; step(id, `×${n} mult`); }
      if (e.type === "money") { money += n; step(id, `+$${n}`); }
      if (e.type === "allDifferentSet" && counts.allDifferentSet) { mult *= e.mult; step(id, `×${e.mult} mult`); }
      if (e.type === "distinctNumbers") {
        const k = new Set(cards.filter((c) => !Deck.isWild(c, "count")).map((c) => c.count)).size;
        mult += k * e.mult;
        step(id, `+${k * e.mult} mult`);
      }
      if (e.type === "cardsWith") {
        const k = Jokers.cardsWith(cards, e.attribute, e.value).length;
        if (!k) continue;
        if (e.mult) { mult += k * e.mult; step(id, `+${k * e.mult} mult`); }
        if (e.points) { points += k * e.points; step(id, `+${k * e.points} points`); }
        if (!e.chance) continue;
        const prize = e.money ? `$${e.money}` : `×${e.xMult} mult`;
        if (!random) { step(id, `${k} × ${Math.round(e.chance * 100)}% at ${prize}`); continue; }
        for (let i = 0; i < k; i++) {
          if (random() >= e.chance) { step(id, "no luck"); continue; }
          if (e.money) money += e.money;
          if (e.xMult) mult *= e.xMult;
          step(id, prize.startsWith("$") ? `+${prize}` : prize);
        }
      }
    }
    return { steps, points, mult, money };
  },

  has(jokerIds, type) {
    return jokerIds.map(Jokers.byId).filter((j) => j.effect.type === type);
  },

  // Pick a random joker using the rarity odds, with one of the game's seeded random() streams.
  // Skips jokers in `exclude`, locked ones (unless ignoreUnlocks) and ones with no effect yet.
  // `only` limits the rarities (still weighted by their drop rates), e.g. ["rare", "unique"].
  roll(random, exclude = [], only = null) {
    const rarities = window.SETTRY_JOKER_RARITIES;
    const pool = window.SETTRY_JOKERS.filter((j) => (j.unlocked || window.SETTRY_CONFIG.ignoreUnlocks) &&
      j.effect.type !== "none" && !exclude.includes(j.id) && (!only || only.includes(j.rarity)));
    const weighted = Object.entries(rarities).filter(([r, v]) => v.weight > 0 && pool.some((j) => j.rarity === r));
    if (!weighted.length) return null;
    let x = random() * weighted.reduce((t, [, v]) => t + v.weight, 0);
    const [rarity] = weighted.find(([, v]) => (x -= v.weight) < 0) || weighted[weighted.length - 1];
    const choices = pool.filter((j) => j.rarity === rarity);
    return choices[Rng.int(random, choices.length)];
  },

  price(id) {
    return window.SETTRY_CONFIG.jokerPrices[Jokers.byId(id).rarity];
  },

  // Selling gives back half the price, rounded down, at least $1.
  sellPrice(id) {
    return Math.max(1, Math.floor(Jokers.price(id) / 2));
  },
};
