// Plain rendering. Reads Game.state and draws it. Card drawing is in js/cards.js.
const $ = (id) => document.getElementById(id);
const decks = window.SETTRY_DECKS;
let deckIndex = 0;
let deckSort = "count";
let pickedJokers = [];

// Start menu ------------------------------------------------------------

function renderMenu() {
  const d = decks[deckIndex];
  const pool = Deck.pool(d);
  const sample = [pool[5], pool[22], pool[43], pool[63]];
  $("deck-choice").innerHTML = `<h2>${d.name}</h2><p>${d.text} ${d.size} cards.</p>
    <div class="sample">${sample.map((c) => `<div class="card">${cardSvg(c)}</div>`).join("")}</div>`;
}

function renderJokerPick() {
  $("joker-pick").innerHTML = window.SETTRY_JOKERS.map((j) => {
    const n = pickedJokers.indexOf(j.id);
    return jokerHtml(j, n >= 0 ? "on" : "").replace('<div class="joker-art">', `${n >= 0 ? `<b class="order">${n + 1}</b>` : ""}<div class="joker-art">`);
  }).join("");
}

$("joker-pick").addEventListener("click", (e) => {
  const el = e.target.closest(".joker");
  if (!el) return;
  const id = el.dataset.joker;
  if (pickedJokers.includes(id)) pickedJokers = pickedJokers.filter((x) => x !== id);
  else if (pickedJokers.length < window.SETTRY_CONFIG.jokerSlotsMax) pickedJokers.push(id);
  renderJokerPick();
});

function showMenu() {
  $("menu").hidden = false;
  $("game").hidden = true;
  $("seed").value = Rng.newSeed();
  renderMenu();
  renderJokerPick();
}

$("prev-deck").onclick = () => { deckIndex = (deckIndex + decks.length - 1) % decks.length; renderMenu(); };
$("next-deck").onclick = () => { deckIndex = (deckIndex + 1) % decks.length; renderMenu(); };
$("start").onclick = () => {
  Game.newRun(decks[deckIndex], $("seed").value.trim() || Rng.newSeed(), pickedJokers.slice());
  $("menu").hidden = true;
  $("game").hidden = false;
  render();
};
$("menu-btn").onclick = showMenu;
$("end-menu").onclick = showMenu;

// Round -----------------------------------------------------------------

let animating = false;

// The hand box. `shown` ({ points, mult, done }) overrides the numbers while a play is being scored.
function handBox(hand, shown) {
  if (!hand) {
    const n = Game.state.selected.length;
    return `<div class="hand-name muted">${n ? "Not a hand" : "Select cards"}</div>
      <div class="hand-score muted">points × mult</div>`;
  }
  const base = window.SETTRY_HANDS[hand.id].points;
  const points = shown ? shown.points : hand.points;
  const mult = shown ? shown.mult : hand.mult;
  const total = shown && !shown.done ? "" : ` = ${hand.total}`;
  const enhs = window.SETTRY_ENHANCEMENTS;
  const cardLines = [
    ...hand.steps.filter((st) => st.label).map((st) => `<div>${Game.scores(st.card) ? enhs[st.card.enh].name : "Banned card"}: ${st.label}</div>`),
    ...hand.heldSteps.map((st) => `<div>${enhs[st.card.enh].name} on the board: ${st.label}</div>`),
  ].join("");
  const jokers = hand.jokerSteps.map((st) => `<div>${Jokers.byId(st.joker).name}: ${st.label}</div>`).join("");
  return `<div class="hand-name">${hand.name}</div>
    <div class="hand-steps">${base}${hand.steps.map((st) => ` + ${st.add}`).join("")} points · ${hand.baseMult} mult</div>
    ${cardLines ? `<div class="card-steps">${cardLines}</div>` : ""}
    ${jokers ? `<div class="joker-steps">${jokers}</div>` : ""}
    <div class="hand-score"><span class="pts">${points}</span> × <span class="mult">${mult}</span>${total}</div>`;
}

// Draws whichever screen the run is on.
function render() {
  const s = Game.state;
  const cfg = window.SETTRY_CONFIG;
  const r = Game.roundInfo();
  const total = window.SETTRY_FIGHTS.count;
  const fight = s.endless ? `Endless fight ${s.fightNumber}` : `Fight ${s.fightNumber}/${total}`;
  const where = s.phase === "pack" && s.pack.after === "start" ? "Pick a joker to start with"
    : s.phase === "pack" && s.pack.after === "fight" ? `Prize for beating ${r.name}`
    : s.phase === "shop" || s.phase === "pack" ? "Shop"
    : s.phase === "choose" ? "Choose your opponent"
    : `vs ${r.name}${r.boss ? " (boss)" : ""} · Target ${r.target}`;
  $("status").innerHTML = `<b>${fight}</b> · ${where} · <b>${s.money < 0 ? `-$${-s.money}` : `$${s.money}`}</b> · Jokers ${s.jokers.length}/${s.jokerSlots} · Seed ${s.seed}`;
  const selling = s.phase === "shop" || s.phase === "pack";
  $("jokers").innerHTML = s.jokers.map((id, k) => `<div class="held">${jokerHtml(Jokers.byId(id))}` +
    `${selling ? `<button class="sell" data-k="${k}">Sell $${Jokers.sellPrice(id)}</button>` : ""}</div>`).join("") ||
    `<p class="hint">No jokers yet (${s.jokers.length}/${s.jokerSlots}).</p>`;
  renderCharms(selling);
  $("choose-view").hidden = s.phase !== "choose";
  $("round-view").hidden = s.phase !== "round";
  $("cashout-view").hidden = s.phase !== "cashout";
  $("shop-view").hidden = s.phase !== "shop";
  $("pack-view").hidden = s.phase !== "pack";
  $("end-view").hidden = !(s.phase === "lost" || s.phase === "won");
  if (s.phase === "choose") renderChoose();
  if (s.phase === "round") renderRound();
  if (s.phase === "cashout") renderCashout();
  if (s.phase === "shop") renderShop();
  if (s.phase === "pack") renderPack();
  if (s.phase === "lost") {
    $("end-title").textContent = "Run over";
    $("end-text").textContent = s.lostReason || `You scored ${s.score} of ${s.target} against ${r.name} in fight ${s.fightNumber}.`;
  }
  if (s.phase === "won") {
    $("end-title").textContent = "You beat the run!";
    $("end-text").textContent = `All ${total} fights won with the ${s.deckDef.name.toLowerCase()}, finishing with $${s.money}. Keep going in endless mode, or head back to the menu.`;
  }
  $("endless").hidden = s.phase !== "won";
}

// The two opponents on offer for the next fight.
function renderChoose() {
  const s = Game.state;
  $("choose-title").textContent = `${Game.isBoss(s.fightNumber) ? "Boss fight" : "Fight"} ${s.fightNumber}: choose your opponent`;
  $("choices").innerHTML = s.choices.map((c, i) => `<div class="opponent${c.boss ? " boss" : ""}">
      <h3>${c.name}${c.boss ? " <small>Boss</small>" : ""}</h3>
      <div>Target <b>${c.target}</b></div>
      <div>Reward <b>$${c.reward}</b></div>
      ${c.prize ? `<div class="prize">Prize: <b>${c.prize.name}</b>, choose ${c.prize.picks} of ${c.prize.options}</div>` : ""}
      ${c.shopModifier ? `<div class="prize">Shop bonus: <b>${c.shopModifier.name}</b>. ${c.shopModifier.text}</div>` : ""}
      ${c.modifier ? `<div class="modifier"><b>${c.modifier.name}:</b> ${c.modifier.text}</div>` : `<div class="hint">No modifier</div>`}
      <button data-choose="${i}" class="big">Fight</button></div>`).join("");
}

// Held charms, with Use (and Sell in the shop). Empty slots show as outlines.
function renderCharms(selling) {
  const s = Game.state;
  const slots = window.SETTRY_CONFIG.consumableSlots;
  $("consumables").innerHTML = Array.from({ length: slots }, (_, k) => {
    const id = s.consumables[k];
    if (!id) return `<div class="charm empty">Charm slot</div>`;
    const why = animating ? "Scoring" : Consumables.blocker(k);
    return `<div class="held">${charmHtml(Consumables.byId(id))}
      <button class="use" data-use="${k}" ${why ? `disabled title="${why}"` : ""}>${why || "Use"}</button>
      ${selling ? `<button class="sell" data-sell-charm="${k}">Sell $${window.SETTRY_CONFIG.consumableSell}</button>` : ""}</div>`;
  }).join("");
}

function renderRound() {
  const s = Game.state;
  const hand = Game.selectedHand();

  // Top row: the selected cards in the order clicked, with the points each adds.
  const slots = Array.from({ length: s.maxPlay }, (_, n) => {
    const i = s.selected[n];
    if (i === undefined) return `<div class="card empty"></div>`;
    const c = s.board[i];
    return `<button class="card${Game.scores(c) ? "" : " banned"}" data-i="${i}" title="${c.id}">${cardSvg(c)}<span class="add">+${Game.scores(c) ? Hands.cardPoints(c) : 0}</span></button>`;
  });
  $("picked").innerHTML = slots.join("");

  $("board").innerHTML = s.board
    .map((c, i) => c
      ? `<button class="card${s.selected.includes(i) ? " picked" : ""}${Game.scores(c) ? "" : " banned"}" data-i="${i}" title="${c.id}">${cardSvg(c)}</button>`
      : `<div class="card empty"></div>`)
    .join("");

  $("hand-box").innerHTML = handBox(hand);
  $("info").innerHTML = `Score <b>${s.score}</b> / ${s.target}<br>
    Hands left ${s.playsLeft} · Discards left ${s.discardsLeft}<br>
    Draw pile ${s.pile.length}`;
  $("msg").textContent = s.message;
  $("play").disabled = animating || !Game.canPlay();
  $("discard").disabled = animating || !Game.canDiscard();
  $("discard").textContent = `Discard (${s.discardsLeft})`;
  $("play").textContent = `Play hand (${s.playsLeft})`;
}

function onCardClick(e) {
  const el = e.target.closest("button.card");
  if (!el || animating) return;
  Game.toggle(Number(el.dataset.i));
  render();
}
$("board").addEventListener("click", onCardClick);
$("picked").addEventListener("click", onCardClick);

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const stepMs = matchMedia("(prefers-reduced-motion: reduce)").matches ? 120 : 450;

// Score the play one card at a time, in the order clicked, then apply it.
$("play").onclick = async () => {
  if (animating) return;
  const hand = Game.rollHand();
  if (!hand) return;
  animating = true;
  render();
  const slots = $("picked").querySelectorAll(".card");
  $("hand-box").innerHTML = handBox(hand, { points: window.SETTRY_HANDS[hand.id].points, mult: hand.baseMult });
  await wait(stepMs);
  for (const [n, st] of hand.steps.entries()) {
    slots[n].classList.add("scoring");
    if (st.label) slots[n].querySelector(".add").textContent += ` ${st.label}`;
    $("hand-box").innerHTML = handBox(hand, { points: st.points, mult: st.mult });
    await wait(stepMs);
  }
  const boardEls = $("board").querySelectorAll(".card");
  for (const st of hand.heldSteps) {
    const el = boardEls[Game.state.board.indexOf(st.card)];
    el.classList.add("held-scoring");
    el.dataset.label = st.label;
    $("hand-box").innerHTML = handBox(hand, { points: st.points, mult: st.mult });
    await wait(stepMs);
  }
  const jokerEls = $("jokers").querySelectorAll(".joker");
  for (const st of hand.jokerSteps) {
    const el = jokerEls[Game.state.jokers.indexOf(st.joker)];
    el.classList.add("scoring");
    el.dataset.label = st.label;
    $("hand-box").innerHTML = handBox(hand, { points: st.points, mult: st.mult });
    await wait(stepMs);
  }
  $("hand-box").innerHTML = handBox(hand, { points: hand.points, mult: hand.mult, done: true });
  await wait(stepMs * 2);
  animating = false;
  Game.play(hand);
  render();
};
$("discard").onclick = () => { if (!animating) { Game.discard(); render(); } };

// Cash out, shop and packs ---------------------------------------------

function renderCashout() {
  const e = Game.state.payout;
  const $n = (n) => n < 0 ? `-$${-n}` : `+$${n}`;
  $("cashout-lines").innerHTML = e.lines.map((l) => `<div class="line"><span>${l.label}</span><b>${$n(l.amount)}</b></div>`).join("") +
    `<div class="line total"><span>Total</span><b>${$n(e.total)}</b></div>`;
}

function rarityLabel(id) {
  return window.SETTRY_JOKER_RARITIES[Jokers.byId(id).rarity].name;
}

function renderShop() {
  const s = Game.state;
  $("shop-jokers").innerHTML = s.shop.jokers.map((o, i) => `<div class="offer">
      ${jokerHtml(Jokers.byId(o.id), o.sold ? "sold" : "")}
      <button data-buy-joker="${i}" ${Shop.canBuyJoker(i) ? "" : "disabled"}>${o.sold ? "Bought" : `Buy $${o.price}`}</button>
      <small>${rarityLabel(o.id)}</small></div>`).join("");
  $("shop-packs").innerHTML = s.shop.packs.map((p, i) => `<div class="offer">
      <div class="pack pack-${p.kind}${p.sold ? " sold" : ""}"><b>${p.name}</b>
        <span>Choose ${p.picks} of ${p.options} ${{ card: "cards to add to your deck", joker: "jokers", charm: "charms" }[p.kind]}</span></div>
      <button data-buy-pack="${i}" ${!p.sold && Game.canSpend(p.price) ? "" : "disabled"}>${p.sold ? "Opened" : `Buy $${p.price}`}</button></div>`).join("");
  $("shop-note").textContent = s.shop.mod ? `Boss bonus: ${s.shop.mod.name}. ${s.shop.mod.text}` : "";
  $("reroll").textContent = `Reroll $${s.shop.rerollCost}`;
  $("reroll").disabled = !Game.canSpend(s.shop.rerollCost);
}

function renderPack() {
  const p = Game.state.pack;
  $("pack-title").textContent = `${p.after === "fight" ? "Prize: " : ""}${p.name}: choose ${p.picksLeft} more`;
  $("pack-note").textContent = p.kind === "charm" && !Consumables.hasRoom()
    ? `Your ${window.SETTRY_CONFIG.consumableSlots} charm slots are full: use or sell one to take another.` : "";
  $("pack-options").innerHTML = p.options.map((o, n) => `<div class="offer">
      ${o.card ? `<div class="card${o.taken ? " used" : ""}">${cardSvg(o.card)}</div>`
        : o.charm ? charmHtml(Consumables.byId(o.charm), o.taken ? "sold" : "")
        : jokerHtml(Jokers.byId(o.joker), o.taken ? "sold" : "")}
      <button data-pick="${n}" ${Shop.canPick(n) ? "" : "disabled"}>${o.taken ? "Taken" : "Take"}</button>
      ${o.card?.mods || o.card?.enh ? `<small>${[...(o.card.mods || []).map((m) => window.SETTRY_MODIFIERS[m].name),
        ...(o.card.enh ? [window.SETTRY_ENHANCEMENTS[o.card.enh].name] : [])].join(", ")}</small>` : ""}
      ${o.joker ? `<small>${rarityLabel(o.joker)}</small>` : ""}</div>`).join("");
}

$("cash-out").onclick = () => { Game.cashOut(); render(); };
$("reroll").onclick = () => { Shop.reroll(); render(); };
$("next-round").onclick = () => { Game.leaveShop(); render(); };
$("endless").onclick = () => { Game.goEndless(); render(); };
$("skip-pack").onclick = () => { Shop.closePack(); render(); };
$("game").addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  if (b.dataset.choose) Game.chooseFight(Number(b.dataset.choose));
  else if (b.dataset.buyJoker) Shop.buyJoker(Number(b.dataset.buyJoker));
  else if (b.dataset.buyPack) Shop.buyPack(Number(b.dataset.buyPack));
  else if (b.dataset.pick) Shop.pick(Number(b.dataset.pick));
  else if (b.dataset.k) Game.sellJoker(Number(b.dataset.k));
  else if (b.dataset.use) Consumables.use(Number(b.dataset.use));
  else if (b.dataset.sellCharm) Consumables.sell(Number(b.dataset.sellCharm));
  else return;
  render();
});

// Deck viewer -----------------------------------------------------------

function renderDeck() {
  const s = Game.state;
  const attrs = window.SETTRY_ATTRIBUTES;
  const order = [deckSort, ...Object.keys(attrs).filter((k) => k !== deckSort)];
  const cards = s.runDeck.slice().sort((a, b) => {
    for (const k of order) {
      const d = attrs[k].indexOf(a[k]) - attrs[k].indexOf(b[k]);
      if (d) return d;
    }
    return a.uid - b.uid;
  });
  const inRound = s.phase === "round";
  const onBoard = new Set(inRound ? s.board.filter(Boolean).map((c) => c.uid) : []);
  $("deck-title").textContent = `${s.deckDef.name}: ${s.runDeck.length} cards` + (inRound ? `, ${s.pile.length} left to draw` : "");
  $("deck-list").innerHTML = cards.map((c) =>
    `<div class="card${inRound && s.used.has(c.uid) ? " used" : ""}${onBoard.has(c.uid) ? " sel" : ""}" title="${c.id}">${cardSvg(c)}</div>`).join("");
  for (const b of document.querySelectorAll("[data-sort]")) b.classList.toggle("on", b.dataset.sort === deckSort);
}

$("view-deck").onclick = $("view-deck-2").onclick = () => { renderDeck(); $("deck-dialog").showModal(); };
$("close-deck").onclick = () => $("deck-dialog").close();
for (const b of document.querySelectorAll("[data-sort]")) b.onclick = () => { deckSort = b.dataset.sort; renderDeck(); };

showMenu();
