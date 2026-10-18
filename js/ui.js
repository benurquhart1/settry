// Plain rendering. Reads Game.state and draws it. Card drawing is in js/cards.js.
const $ = (id) => document.getElementById(id);
const decks = window.SETTRY_DECKS;
let deckIndex = 0;
let deckSort = "count";
let pickedJokers = [];

// Start menu ------------------------------------------------------------

function renderMenu() {
  const d = decks[deckIndex];
  const pool = Deck.full().filter((c) => Object.entries(d.filter).every(([k, v]) => c[k] === v));
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
  else if (pickedJokers.length < window.SETTRY_CONFIG.jokerSlots) pickedJokers.push(id);
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
  Game.start(decks[deckIndex], $("seed").value.trim() || Rng.newSeed(), pickedJokers.slice());
  $("menu").hidden = true;
  $("game").hidden = false;
  render();
};
$("menu-btn").onclick = showMenu;

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
  const jokers = hand.jokerSteps.map((st) => `<div>${Jokers.byId(st.joker).name}: ${st.label}</div>`).join("");
  return `<div class="hand-name">${hand.name}</div>
    <div class="hand-steps">${base}${hand.steps.map((st) => ` + ${st.add}`).join("")} points · ${hand.baseMult} mult</div>
    ${jokers ? `<div class="joker-steps">${jokers}</div>` : ""}
    <div class="hand-score"><span class="pts">${points}</span> × <span class="mult">${mult}</span>${total}</div>`;
}

function render() {
  const s = Game.state;
  const cfg = window.SETTRY_CONFIG;
  const hand = Game.selectedHand();

  // Top row: the selected cards in the order clicked, with the points each adds.
  $("jokers").innerHTML = s.jokers.map((id) => jokerHtml(Jokers.byId(id))).join("");
  const slots = Array.from({ length: s.maxPlay }, (_, n) => {
    const i = s.selected[n];
    if (i === undefined) return `<div class="card empty"></div>`;
    const c = s.board[i];
    return `<button class="card" data-i="${i}" title="${c.id}">${cardSvg(c)}<span class="add">+${Hands.cardPoints(c)}</span></button>`;
  });
  $("picked").innerHTML = slots.join("");

  $("board").innerHTML = s.board
    .map((c, i) => c
      ? `<button class="card${s.selected.includes(i) ? " picked" : ""}" data-i="${i}" title="${c.id}">${cardSvg(c)}</button>`
      : `<div class="card empty"></div>`)
    .join("");

  $("hand-box").innerHTML = handBox(hand);
  $("info").innerHTML = `Score <b>${s.score}</b> / ${cfg.roundTarget} · $${s.money}<br>
    Hands left ${s.playsLeft} · Discards left ${s.discardsLeft}<br>
    Draw pile ${s.pile.length} · Seed ${s.seed}`;
  const over = s.over === "won" ? `You win with ${s.score}!` : s.over === "lost" ? `Out of hands at ${s.score}. You lose.` : "";
  $("msg").textContent = over || s.message;
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
  const hand = Game.selectedHand();
  if (!hand || !Game.canPlay()) return;
  animating = true;
  render();
  const slots = $("picked").querySelectorAll(".card");
  $("hand-box").innerHTML = handBox(hand, { points: window.SETTRY_HANDS[hand.id].points, mult: hand.baseMult });
  await wait(stepMs);
  for (const [n, st] of hand.steps.entries()) {
    slots[n].classList.add("scoring");
    $("hand-box").innerHTML = handBox(hand, { points: st.points, mult: hand.baseMult });
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
  Game.play();
  render();
};
$("discard").onclick = () => { if (!animating) { Game.discard(); render(); } };

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
  const onBoard = new Set(s.board.filter(Boolean).map((c) => c.uid));
  $("deck-title").textContent = `${s.deckDef.name}: ${s.runDeck.length} cards, ${s.pile.length} left to draw`;
  $("deck-list").innerHTML = cards.map((c) =>
    `<div class="card${s.used.has(c.uid) ? " used" : ""}${onBoard.has(c.uid) ? " sel" : ""}" title="${c.id}">${cardSvg(c)}</div>`).join("");
  for (const b of document.querySelectorAll("[data-sort]")) b.classList.toggle("on", b.dataset.sort === deckSort);
}

$("view-deck").onclick = () => { renderDeck(); $("deck-dialog").showModal(); };
$("close-deck").onclick = () => $("deck-dialog").close();
for (const b of document.querySelectorAll("[data-sort]")) b.onclick = () => { deckSort = b.dataset.sort; renderDeck(); };

showMenu();
