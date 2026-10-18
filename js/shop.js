// The shop, open after each boss fight. No DOM code here.
// State lives in Game.state.shop (offers) and Game.state.pack (a pack, or a fight's prize, being opened).
const Shop = {
  // `mod`: the shop modifier won from the boss (data/fights.js), or null.
  open(mod = null) {
    const s = Game.state;
    s.phase = "shop";
    s.shop = { jokers: [], packs: [], mod, rerollCost: mod?.rerollStart ?? window.SETTRY_CONFIG.rerollStart };
    Shop.fillJokers();
    Shop.fillPacks();
  },

  // Joker offers: shopJokerSlots of them (Shopkeeper adds one), none you own or already offered.
  fillJokers() {
    const s = Game.state;
    const slots = Jokers.setting("shopJokerSlots", s.jokers) + (s.shop.mod?.extraJokers || 0);
    s.shop.jokers = [];
    for (let i = 0; i < slots; i++) {
      const j = Jokers.roll(s.rng.shop, [...s.jokers, ...s.shop.jokers.map((o) => o.id)]);
      if (j) s.shop.jokers.push({ id: j.id, price: Jokers.price(j.id), sold: false });
    }
  },

  fillPacks() {
    const s = Game.state;
    const mod = s.shop.mod || {};
    s.shop.packs = Array.from({ length: window.SETTRY_CONFIG.shopPackSlots + (mod.extraPacks || 0) }, () => {
      const p = Shop.weighted(window.SETTRY_PACKS, s.rng.shop);
      return { ...p, price: mod.freePacks ? 0 : p.price, sold: false };
    });
  },

  weighted(list, random) {
    let x = random() * list.reduce((t, p) => t + p.weight, 0);
    return list.find((p) => (x -= p.weight) < 0) || list[list.length - 1];
  },

  canBuyJoker(i) {
    const s = Game.state;
    const o = s.shop.jokers[i];
    return o && !o.sold && Game.canSpend(o.price) && s.jokers.length < s.jokerSlots;
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
    Shop.openPack(p, "shop");
  },

  // Open a pack (or a fight's prize): roll its options. `after` is where to go once done:
  // "shop" back to the shop, "fight" on to choosing the next fight, "start" to the first fight.
  openPack(p, after) {
    const s = Game.state;
    const options = [];
    for (let n = 0; n < p.options; n++) {
      if (p.kind === "card") options.push({ card: Shop.packCard(p), taken: false });
      else if (p.kind === "charm") {
        const c = Consumables.roll(s.rng.pack, options.map((o) => o.charm));
        if (c) options.push({ charm: c.id, taken: false });
      } else {
        const j = Jokers.roll(s.rng.pack, [...s.jokers, ...options.map((o) => o.joker)], p.rarities);
        if (j) options.push({ joker: j.id, taken: false });
      }
    }
    s.pack = { ...p, options, picksLeft: p.picks, after };
    s.phase = "pack";
  },

  // A random card for a pack. Numbers 1 to 4 like starting decks; with deckLimited, only cards
  // your starting deck could have. Shop packs: sometimes a wild (SETTRY_PACK_WILD_CHANCE).
  // Prizes with modChance: that chance of one wild or enhancement, picked at random.
  packCard(p = {}, random = Game.state.rng.pack) {
    const s = Game.state;
    const all = Deck.pool(p.deckLimited ? s.deckDef : {});
    const card = { ...all[Rng.int(random, all.length)] };
    const wilds = Object.keys(window.SETTRY_MODIFIERS);
    if (p.modChance === undefined) {
      if (random() < window.SETTRY_PACK_WILD_CHANCE) card.mods = [wilds[Rng.int(random, wilds.length)]];
    } else if (random() < p.modChance) {
      const choices = [...wilds.map((m) => ["mod", m]), ...Object.keys(window.SETTRY_ENHANCEMENTS).map((e) => ["enh", e])];
      const [kind, id] = choices[Rng.int(random, choices.length)];
      if (kind === "mod") card.mods = [id];
      else card.enh = id;
    }
    return card;
  },

  canPick(n) {
    const s = Game.state;
    const o = s.pack?.options[n];
    if (!o || o.taken || s.pack.picksLeft <= 0) return false;
    if (o.charm) return Consumables.hasRoom();
    return !o.joker || s.jokers.length < s.jokerSlots;
  },

  pick(n) {
    const s = Game.state;
    if (!Shop.canPick(n)) return;
    const o = s.pack.options[n];
    o.taken = true;
    if (o.card) s.runDeck.push({ ...o.card, uid: s.nextUid++ });
    else if (o.charm) s.consumables.push({ id: o.charm, negative: false });
    else s.jokers.push(o.joker);
    if (--s.pack.picksLeft <= 0) Shop.closePack();
  },

  closePack() {
    const s = Game.state;
    const after = s.pack?.after;
    s.pack = null;
    if (after === "fight") Game.nextFight();
    else if (after === "start") s.phase = "choose";   // the first fight's opponents are already rolled
    else s.phase = "shop";
  },
};
