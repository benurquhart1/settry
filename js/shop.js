// The shop between rounds, Balatro-style. No DOM code here.
// State lives in Game.state.shop (offers) and Game.state.pack (a pack being opened).
const Shop = {
  open() {
    const s = Game.state;
    s.phase = "shop";
    s.shop = { jokers: [], packs: [], rerollCost: window.SETTRY_CONFIG.rerollStart };
    Shop.fillJokers();
    Shop.fillPacks();
  },

  // Joker offers: shopJokerSlots of them (Shopkeeper adds one), none you own or already offered.
  fillJokers() {
    const s = Game.state;
    const slots = Jokers.setting("shopJokerSlots", s.jokers);
    s.shop.jokers = [];
    for (let i = 0; i < slots; i++) {
      const j = Jokers.roll(s.rng.shop, [...s.jokers, ...s.shop.jokers.map((o) => o.id)]);
      if (j) s.shop.jokers.push({ id: j.id, price: Jokers.price(j.id), sold: false });
    }
  },

  fillPacks() {
    const s = Game.state;
    s.shop.packs = Array.from({ length: window.SETTRY_CONFIG.shopPackSlots }, () =>
      ({ ...Shop.weighted(window.SETTRY_PACKS, s.rng.shop), sold: false }));
  },

  weighted(list, random) {
    let x = random() * list.reduce((t, p) => t + p.weight, 0);
    return list.find((p) => (x -= p.weight) < 0) || list[list.length - 1];
  },

  canBuyJoker(i) {
    const s = Game.state;
    const o = s.shop.jokers[i];
    return o && !o.sold && Game.canSpend(o.price) && s.jokers.length < window.SETTRY_CONFIG.jokerSlots;
  },

  buyJoker(i) {
    const s = Game.state;
    if (!Shop.canBuyJoker(i)) return;
    const o = s.shop.jokers[i];
    s.money -= o.price;
    o.sold = true;
    s.jokers.push(o.id);
  },

  // Rerolling replaces the joker offers (not the packs). Each reroll costs $1 more; resets next shop.
  reroll() {
    const s = Game.state;
    if (!Game.canSpend(s.shop.rerollCost)) return;
    s.money -= s.shop.rerollCost;
    s.shop.rerollCost += window.SETTRY_CONFIG.rerollStep;
    Shop.fillJokers();
  },

  // Buying a pack opens it: pick `picks` of its options, or skip.
  buyPack(i) {
    const s = Game.state;
    const p = s.shop.packs[i];
    if (!p || p.sold || !Game.canSpend(p.price)) return;
    s.money -= p.price;
    p.sold = true;
    const options = [];
    for (let n = 0; n < p.options; n++) {
      if (p.kind === "card") options.push({ card: Shop.packCard(), taken: false });
      else if (p.kind === "charm") {
        const c = Consumables.roll(s.rng.pack, options.map((o) => o.charm));
        if (c) options.push({ charm: c.id, taken: false });
      } else {
        const j = Jokers.roll(s.rng.pack, [...s.jokers, ...options.map((o) => o.joker)]);
        if (j) options.push({ joker: j.id, taken: false });
      }
    }
    s.pack = { ...p, options, picksLeft: p.picks };
    s.phase = "pack";
  },

  // A random card (numbers 1 to 4, like starting decks), sometimes with a wild modification.
  packCard() {
    const s = Game.state;
    const all = Deck.pool();
    const card = { ...all[Rng.int(s.rng.pack, all.length)] };
    if (s.rng.pack() < window.SETTRY_PACK_WILD_CHANCE) {
      const mods = Object.keys(window.SETTRY_MODIFIERS);
      card.mods = [mods[Rng.int(s.rng.pack, mods.length)]];
    }
    return card;
  },

  canPick(n) {
    const s = Game.state;
    const o = s.pack?.options[n];
    if (!o || o.taken || s.pack.picksLeft <= 0) return false;
    if (o.charm) return Consumables.hasRoom();
    return !o.joker || s.jokers.length < window.SETTRY_CONFIG.jokerSlots;
  },

  pick(n) {
    const s = Game.state;
    if (!Shop.canPick(n)) return;
    const o = s.pack.options[n];
    o.taken = true;
    if (o.card) s.runDeck.push({ ...o.card, uid: s.nextUid++ });
    else if (o.charm) s.consumables.push(o.charm);
    else s.jokers.push(o.joker);
    if (--s.pack.picksLeft <= 0) Shop.closePack();
  },

  closePack() {
    const s = Game.state;
    s.pack = null;
    s.phase = "shop";
  },
};
