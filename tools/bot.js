// A rule-based bot that plays Settry runs headless in Node, for balancing.
// It uses the game's own logic files, so its results always follow the current rules.
//
//   node tools/bot.js --runs 100 --board 10                  plays 100 runs, prints a summary
//   node tools/bot.js --runs 500 --force-each --out runs.csv  every joker forced from the start,
//                                                            500 runs each, plus a baseline
// Options: --runs N, --board N (cards on the board, default 10), --deck id (default freeForAll),
//   --seed prefix, --joker id (force one joker), --force-each, --out file.csv, --endless N (keep
//   playing endless fights up to fight N).
// The same seeds are used for every forced joker, so each joker is compared with the baseline on
// identical runs. The bot itself makes no random choices: a seed always replays the same run.
// tools/analyze.py reads the CSV.
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");
global.window = global;
for (const f of ["data/config.js", "data/decks.js", "data/modifiers.js", "data/hands.js", "data/fights.js",
  "data/jokers.js", "data/packs.js", "data/consumables.js"]) vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), "utf8"));
vm.runInThisContext(["js/rng.js", "js/deck.js", "js/jokers.js", "js/hands.js", "js/consumables.js", "js/shop.js", "js/game.js"]
  .map((f) => fs.readFileSync(path.join(ROOT, f), "utf8")).join("\n") +
  "\n;Object.assign(globalThis, { Rng, Deck, Jokers, Hands, Consumables, Shop, Game });");

// ---- Choosing plays ------------------------------------------------------

// Every group of board indices from 1 to maxPlay cards.
function subsets(indices, max) {
  const out = [];
  const rec = (start, chosen) => {
    if (chosen.length) out.push(chosen.slice());
    if (chosen.length === max) return;
    for (let i = start; i < indices.length; i++) { chosen.push(indices[i]); rec(i + 1, chosen); chosen.pop(); }
  };
  rec(0, []);
  return out;
}

function permutations(a) {
  if (a.length <= 1) return [a];
  return a.flatMap((x, i) => permutations([...a.slice(0, i), ...a.slice(i + 1)]).map((p) => [x, ...p]));
}

// Scores of every legal play on the board (preview scores: chance effects not rolled).
function allPlays() {
  const s = Game.state;
  const idx = s.board.map((c, i) => (c ? i : -1)).filter((i) => i >= 0);
  const plays = [];
  for (const sel of subsets(idx, s.maxPlay)) {
    s.selected = sel;
    const h = Game.selectedHand();
    if (h) plays.push({ sel, total: h.total, id: h.id, size: sel.length });
  }
  s.selected = [];
  return plays.sort((a, b) => b.total - a.total);
}

// Click order matters (glass, retriggers): try every order of the chosen cards.
function bestOrder(sel) {
  const s = Game.state;
  let best = { sel, total: -1 };
  for (const p of sel.length <= 5 ? permutations(sel) : [sel]) {
    s.selected = p;
    const h = Game.selectedHand();
    if (h && h.total > best.total) best = { sel: p, total: h.total };
  }
  s.selected = [];
  return best.sel;
}

// Cards that show up least in the good plays are the ones to throw away.
function discardPick(plays) {
  const s = Game.state;
  const top = plays.slice(0, 15);
  const value = new Map();
  for (const p of top) for (const i of p.sel) value.set(i, (value.get(i) || 0) + p.total);
  const idx = s.board.map((c, i) => (c ? i : -1)).filter((i) => i >= 0);
  return idx.sort((a, b) => (value.get(a) || 0) - (value.get(b) || 0))
    .slice(0, Math.min(window.SETTRY_CONFIG.maxDiscardSize, s.pile.length || 0));
}

// Use charms that clearly help: money charms right away, enhancement stamps on the cards about
// to be played (Steel goes on a card that stays on the board).
function useCharms(play) {
  const s = Game.state;
  for (let k = s.consumables.length - 1; k >= 0; k--) {
    const c = Consumables.byId(s.consumables[k].id);
    if (["doubleMoney", "sellValue"].includes(c.action)) { Consumables.use(k); continue; }
    if (c.action !== "enhance" || !play) continue;
    let targets = play.sel.filter((i) => !s.board[i].enh);
    if (c.enh === "steel") targets = s.board.map((x, i) => (x && !x.enh && !play.sel.includes(i) ? i : -1)).filter((i) => i >= 0);
    if (!targets.length) continue;
    s.selected = targets.slice(0, c.target);
    Consumables.use(k);
    s.selected = [];
  }
}

function playRound() {
  const s = Game.state;
  let plays = allPlays();
  if (!plays.length) return false;
  useCharms(plays[0]);
  plays = allPlays();
  const need = s.target - s.score;
  const best = plays[0];
  // Discard when the best play leaves us well short of an even share of what's still needed.
  if (best.total < need && best.total * s.playsLeft < need * 1.1 && s.discardsLeft > 0 && s.pile.length > 0) {
    s.selected = discardPick(plays);
    if (s.selected.length) { Game.discard(); return true; }
  }
  s.selected = bestOrder(best.sel);
  Game.play();
  return true;
}

// ---- Choices between fights ------------------------------------------------

// A rough worth for a joker: rarity, plus a small bonus for multipliers.
function jokerWorth(id) {
  const j = Jokers.byId(id);
  const base = { common: 1, uncommon: 2, rare: 3, unique: 4, legendary: 5 }[j.rarity];
  return base + (j.effect.type === "mulMult" ? 0.5 : 0);
}

// Put additive jokers first and multipliers last, so the multipliers apply to more.
function orderJokers() {
  const s = Game.state;
  const rank = (id) => ({ mulMult: 2, allDifferentSet: 2, mimic: 1.5 })[Jokers.byId(id).effect.type] || 0;
  s.jokers.sort((a, b) => rank(a) - rank(b));
}

// Pick the bigger reward when its target looks reachable, otherwise the easier fight.
function chooseFight(strength) {
  const s = Game.state;
  const byReward = s.choices.map((c, i) => ({ ...c, i })).sort((a, b) => b.reward - a.reward);
  const pick = byReward.find((c) => c.target <= strength * 0.8) || byReward.sort((a, b) => a.target - b.target)[0];
  Game.chooseFight(pick.i);
}

function openPack() {
  const s = Game.state;
  const order = s.pack.options.map((o, n) => ({ o, n }))
    .sort((a, b) => (b.o.joker ? jokerWorth(b.o.joker) : b.o.card ? +!!(b.o.card.enh || b.o.card.mods) : 1) -
      (a.o.joker ? jokerWorth(a.o.joker) : a.o.card ? +!!(a.o.card.enh || a.o.card.mods) : 1));
  for (const { n } of order) if (s.phase === "pack" && Shop.canPick(n)) Shop.pick(n);
  if (s.phase === "pack") Shop.closePack();
  orderJokers();
}

function shop() {
  const s = Game.state;
  const offers = s.shop.jokers.map((o, i) => ({ o, i })).sort((a, b) => jokerWorth(b.o.id) - jokerWorth(a.o.id));
  for (const { i } of offers) Shop.buyJoker(i);
  for (let i = 0; i < s.shop.packs.length && s.phase === "shop"; i++) {
    const p = s.shop.packs[i];
    if (p.kind === "joker" && s.jokers.length >= s.jokerSlots) continue;
    if (p.kind === "charm" && !Consumables.hasRoom()) continue;
    if (!Game.canSpend(p.price + 4)) continue;   // keep a little money back
    Shop.buyPack(i);
    while (s.phase === "pack") openPack();
  }
  orderJokers();
  Game.leaveShop();
}

// ---- A run -----------------------------------------------------------------

function run({ deck = "freeForAll", seed, jokers = [], endlessTo = 0 }) {
  Game.newRun(window.SETTRY_DECKS.find((d) => d.id === deck), seed, jokers.slice());
  const s = Game.state;
  const result = { seed, forced: jokers.join("+"), won: 0, fight: 0, bestHand: 0, totalScore: 0, money: 0, held: "" };
  let strength = 0;            // best single hand seen, times hands per fight: the bot's guess at what it can score
  const held = new Set(jokers);
  for (let guard = 0; guard < 20000; guard++) {
    if (s.phase === "choose") chooseFight(strength || 100);
    else if (s.phase === "round") {
      const before = s.score;
      if (!playRound()) { s.phase = "lost"; break; }
      const gained = s.score - before;
      result.bestHand = Math.max(result.bestHand, gained);
      result.totalScore += gained;
      strength = Math.max(strength * 0.9, result.bestHand * Jokers.setting("plays", s.jokers) * 0.6);
    } else if (s.phase === "cashout") Game.cashOut();
    else if (s.phase === "pack") openPack();
    else if (s.phase === "shop") shop();
    else if (s.phase === "won") { result.won = 1; if (s.fightNumber < endlessTo) Game.goEndless(); else break; }
    else break;
    for (const id of s.jokers) held.add(id);
  }
  result.fight = s.fightNumber;
  result.money = s.money;
  result.held = [...held].join("+");
  return result;
}

// ---- Command line ----------------------------------------------------------

function main() {
  const args = process.argv.slice(2);
  const opt = (name, dflt) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : dflt; };
  const flag = (name) => args.includes(`--${name}`);
  const runs = Number(opt("runs", 100));
  window.SETTRY_CONFIG.boardSize = Number(opt("board", 10));
  const deck = opt("deck", "freeForAll");
  const prefix = opt("seed", "BOT");
  const endlessTo = Number(opt("endless", 0));
  const forcedSets = flag("force-each")
    ? [[], ...window.SETTRY_JOKERS.filter((j) => j.effect.type !== "none").map((j) => [j.id])]
    : [opt("joker") ? [opt("joker")] : []];
  const rows = [];
  for (const jokers of forcedSets)
    for (let r = 0; r < runs; r++) rows.push(run({ deck, seed: `${prefix}-${r}`, jokers, endlessTo }));
  const out = opt("out");
  if (out) {
    const cols = Object.keys(rows[0]);
    fs.writeFileSync(out, [cols.join(","), ...rows.map((r) => cols.map((c) => r[c]).join(","))].join("\n") + "\n");
  }
  const groups = {};
  for (const r of rows) (groups[r.forced || "(none)"] ||= []).push(r);
  for (const [k, g] of Object.entries(groups)) {
    const avg = (f) => (g.reduce((t, r) => t + f(r), 0) / g.length).toFixed(2);
    console.log(`${k}: ${g.length} runs, won ${avg((r) => r.won)}, avg fight ${avg((r) => r.fight)}, avg best hand ${avg((r) => r.bestHand)}`);
  }
}

if (require.main === module) main();
module.exports = { run };
