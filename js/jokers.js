// Applies joker effects. No DOM code here.
const Jokers = {
  byId(id) {
    return window.SETTRY_JOKERS.find((j) => j.id === id);
  },

  // Each held joker with the effect it uses, left to right. Mimic uses the effect of the
  // nearest joker to its right that isn't a Mimic (none at the right end).
  effects(jokerIds) {
    return jokerIds.map((id, i) => {
      let k = i;
      while (k < jokerIds.length && Jokers.byId(jokerIds[k]).effect.type === "mimic") k++;
      const joker = Jokers.byId(id);
      return { id, name: joker.name, effect: k < jokerIds.length ? Jokers.byId(jokerIds[k]).effect : { type: "none" } };
    });
  },

  // A setting (plays, discards, boardSize, maxPlay, shopJokerSlots) after "extra" jokers.
  setting(name, jokerIds) {
    let value = window.SETTRY_CONFIG[name];
    for (const { effect: e } of Jokers.effects(jokerIds)) {
      if (e.type !== "extra") continue;
      if (e.setting === name) value += e.amount;
      value += e.settings?.[name] || 0;
    }
    return value;
  },

  // How held jokers bend the rules, for Deck.isSet, Hands.identical and Hands.score:
  // { interchange: {attribute: [[a, b], ...]}, ignore: [attributes], lookalike, setMaster,
  //   retriggerFirst, retriggerLast (extra times), glassMult, luckyFactor,
//   enhBoost: {enhancement: extra, ...} (Polish: Mult cards +3 mult, Bonus cards +20 points) }.
  rules(jokerIds) {
    const r = { interchange: {}, ignore: [], lookalike: false, setMaster: false,
      retriggerFirst: 0, retriggerLast: 0, glassMult: null, luckyFactor: 1, enhBoost: {} };
    for (const { effect: e } of Jokers.effects(jokerIds)) {
      if (e.type === "interchange") r.interchange[e.attribute] = e.pairs;
      if (e.type === "ignoreAttribute") r.ignore.push(e.attribute);
      if (e.type === "lookalike") r.lookalike = true;
      if (e.type === "setMaster") r.setMaster = true;
      if (e.type === "retrigger") r[e.which === "first" ? "retriggerFirst" : "retriggerLast"]++;
      if (e.type === "glassMult") r.glassMult = Math.max(r.glassMult || 0, e.mult);
      if (e.type === "luckyBoost") r.luckyFactor *= e.factor;
      if (e.type === "enhBoost") for (const [k, v] of Object.entries(e.boost)) r.enhBoost[k] = (r.enhBoost[k] || 0) + v;
    }
    return r;
  },

  // Differences and matches in a played hand (see SETTRY_JOKER_GLOSSARY in data/jokers.js),
  // plus the other numbers and conditions jokers use (`per` and `when` in data/jokers.js).
  // ctx: { timesPlayed, rules, pile, firstHand, lastHand, stats, held, discardsUsed, money, charms, boss } as in Hands.score.
  counts(cards, handId, ctx = {}) {
    const st = ctx.stats || {};
    const played = (k) => cards.map((c) => Deck.options(c, k, ctx.rules));
    const numbers = cards.map((c) => c.count).sort((a, b) => a - b);
    const extra = {
      timesPlayed: ((ctx.timesPlayed || {})[handId] || 0) + 1,
      pile: ctx.pile ?? 0,
      pileFours: Math.floor((ctx.pile ?? 0) / 4),
      wilds: cards.reduce((t, c) => t + (c.mods || []).length, 0),
      handsPlayed: (st.handsPlayed || 0) + 1,
      cardsDiscarded: st.cardsDiscarded || 0,
      charmsUsed: st.charmsUsed || 0,
      streak: st.streak || 0,
      set4Played: (st.set4Played || 0) + (handId === "set4" ? 1 : 0),
      veteran: st.veteran ?? 1,
      pipSum: cards.reduce((t, c) => t + c.count, 0),
      held: (ctx.held || []).length,
      discardsUsed: ctx.discardsUsed || 0,
      moneyFives: Math.max(0, Math.floor((ctx.money || 0) / 5)),
      charmsHeld: ctx.charms || 0,
      wildCards: cards.filter((c) => (c.mods || []).length).length,
      fibonacci: [0, 1, 1, 2, 3, 5][cards.length] || 1,
      when: {
        set3: handId === "set3",
        anySet: handId.startsWith("set"),
        threeKind: handId === "threeKind",
        twoPair: handId === "twoPair",
        smallHand: cards.length <= 2,
        sameShape: cards.length >= 2 && Deck.canBeSame(played("shape")),
        sameNumber: cards.length >= 2 && Deck.canBeSame(played("count")),
        boss: !!ctx.boss,
        firstHand: !!ctx.firstHand,
        lastHand: !!ctx.lastHand,
        pileEmpty: ctx.pile === 0,
        highCard: handId === "highCard",
        set4: handId === "set4",
        twoPairOrFullHouse: handId === "twoPair" || handId === "fullHouse",
        hasPair: ["pair", "twoPair", "threeKind", "fullHouse", "fourKind", "fiveKind"].includes(handId),
        sameColor: cards.length >= 2 && Deck.canBeSame(played("color")),
        colorsDifferent: cards.length >= 3 && Deck.canBeDifferent(played("color")),
        numbersInRow: cards.length >= 3 && new Set(numbers).size === cards.length && numbers.at(-1) - numbers[0] === cards.length - 1,
        pure: cards.every((c) => !(c.mods || []).length && !c.enh),
      },
    };
    if (handId.startsWith("set")) {
      let different = 0;
      let same = 0;
      for (const k of Object.keys(window.SETTRY_ATTRIBUTES)) {
        const values = new Set(cards.filter((c) => !Deck.isWild(c, k)).map((c) => c[k]));
        if (values.size <= 1) same++;
        else different++;
      }
      return { ...extra, different, same, allDifferentSet: same === 0 };
    }
    const groups = { twoPair: 2, fullHouse: 2 }[handId] || 1;
    return { ...extra, different: groups, same: cards.length };
  },

  // Played cards whose attribute has this value (a wild card counts as every value).
  // `value` may be an array of values (Even Steven: 2 or 4).
  cardsWith(cards, attribute, value) {
    const values = [].concat(value);
    return cards.filter((c) => values.includes(c[attribute]) || Deck.isWild(c, attribute));
  },

  // Scoring steps for the held jokers, left to right, after the cards have added their points.
  // Returns { steps: [{ joker, label, points, mult }], points, mult, money }.
  // Chance effects only happen when `random` is given, which is once, when the hand is played;
  // without it (the preview) they show as a step with no effect.
  apply(jokerIds, counts, cards, points, mult, random) {
    const steps = [];
    let money = 0;
    const step = (joker, label) => steps.push({ joker, label, points, mult });
    const round = (x) => Math.round(x * 100) / 100;
    for (const { id, effect: e } of Jokers.effects(jokerIds)) {
      if (e.when && !counts.when[e.when]) continue;
      const n = (e.amount ?? counts[e.per]) * (e.each ?? 1);
      if (e.type === "addMult" && n) { mult += n; step(id, `+${n} mult`); }
      if (e.type === "addPoints" && n) { points += n; step(id, `+${n} points`); }
      if (e.type === "mulMult") { mult = round(mult * n); step(id, `×${round(n)} mult`); }
      if (e.type === "money" && n) { money += n; step(id, `+$${n}`); }
      if (e.type === "randomMult") {
        if (!random) { step(id, `+${e.min} to +${e.max} mult`); continue; }
        const k = e.min + Rng.int(random, e.max - e.min + 1);
        mult += k;
        step(id, `+${k} mult`);
      }
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

  // Held jokers whose effect (Mimic's copied one included) is this type, as { id, name, effect }.
  has(jokerIds, type) {
    return Jokers.effects(jokerIds).filter((j) => j.effect.type === type);
  },

  // The total `amount` of held jokers of this type (e.g. Scout's cards shown).
  total(jokerIds, type) {
    return Jokers.has(jokerIds, type).reduce((t, j) => t + (j.effect.amount || 0), 0);
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
