// Charms (consumables). No DOM code here. Held charms live in Game.state.consumables as
// { id, negative }. Negative charms (from the Phantom joker) don't take up a charm slot.
const Consumables = {
  byId(id) {
    return window.SETTRY_CONSUMABLES.find((c) => c.id === id);
  },

  // A random charm for a pack, each equally likely, skipping ids in `exclude`.
  roll(random, exclude = []) {
    const pool = window.SETTRY_CONSUMABLES.filter((c) => !exclude.includes(c.id));
    return pool.length ? pool[Rng.int(random, pool.length)] : null;
  },

  hasRoom() {
    return Game.state.consumables.filter((c) => !c.negative).length < window.SETTRY_CONFIG.consumableSlots;
  },

  // Why the charm in slot k can't be used right now, or "" if it can.
  blocker(k) {
    const s = Game.state;
    const c = Consumables.byId(s.consumables[k]?.id);
    if (!c || s.phase === "lost" || s.phase === "won") return "Not now";
    if (c.target) {
      if (s.phase !== "round") return "Use during a round";
      const n = s.selected.length;
      if (!n || n > c.target) return `Select ${c.target === 1 ? "1 card" : `1 to ${c.target} cards`}`;
    }
    if (c.action === "echo" && (!s.lastConsumable || s.lastConsumable === "echo")) return "No charm used yet";
    return "";
  },

  // Use the charm in slot k on the selected board cards (if it needs them).
  use(k) {
    const s = Game.state;
    if (Consumables.blocker(k)) return;
    const held = s.consumables[k];
    const c = Consumables.byId(held.id);
    s.consumables.splice(k, 1);
    // Double Dip: a 1 in 2 chance (each) to keep the charm for one more use. The kept copy can't repeat again.
    const kept = !held.again && Jokers.has(s.jokers, "charmAgain").some((j) => s.rng.luck() < j.effect.chance);
    if (kept) s.consumables.splice(k, 0, { ...held, again: true });
    const cards = c.target ? Game.selectedCards() : [];
    for (const card of cards) {
      if (c.action === "paint") card.color = c.color;
      if (c.action === "countUp") card.count = card.count % window.SETTRY_ATTRIBUTES.count.length + 1;
      if (c.action === "wild" && !(card.mods || []).includes(c.mod)) card.mods = [...(card.mods || []), c.mod];
      if (c.action === "enhance") card.enh = c.enh;
      Deck.reid(card);
    }
    let note = "";
    if (c.action === "doubleMoney") {
      const gain = Math.min(c.max, Math.max(0, s.money));
      s.money += gain;
      note = ` +$${gain}.`;
    }
    if (c.action === "sellValue") {
      const gain = Math.min(c.max, s.jokers.reduce((t, id) => t + Jokers.sellPrice(id), 0));
      s.money += gain;
      note = ` +$${gain}.`;
    }
    if (c.action === "echo") {
      s.consumables.push({ id: s.lastConsumable, negative: false });
      note = ` Created ${Consumables.byId(s.lastConsumable).name}.`;
    }
    if (c.action !== "echo") s.lastConsumable = c.id;
    s.stats.charmsUsed++;
    s.message = `Used ${c.name}.${note}${kept ? " Double Dip: you can use it once more." : ""}`;
  },

  sell(k) {
    const s = Game.state;
    if (!s.consumables[k] || s.phase === "lost" || s.phase === "won") return;
    s.consumables.splice(k, 1);
    s.money += window.SETTRY_CONFIG.consumableSell;
  },
};
