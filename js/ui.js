// Plain rendering. Reads Game.state and draws it. Card drawing is in js/cards.js.
const $ = (id) => document.getElementById(id);
const decks = window.SETTRY_DECKS;
let deckIndex = 0;
let deckSort = "count";

// Start menu ------------------------------------------------------------

function renderMenu() {
  const d = decks[deckIndex];
  const pool = Deck.full().filter((c) => Object.entries(d.filter).every(([k, v]) => c[k] === v));
  const sample = [pool[5], pool[22], pool[43], pool[63]];
  $("deck-choice").innerHTML = `<h2>${d.name}</h2><p>${d.text} ${d.size} cards.</p>
    <div class="sample">${sample.map((c) => `<div class="card">${cardSvg(c)}</div>`).join("")}</div>`;
}

function showMenu() {
  $("menu").hidden = false;
  $("game").hidden = true;
  $("seed").value = Rng.newSeed();
  renderMenu();
}

$("prev-deck").onclick = () => { deckIndex = (deckIndex + decks.length - 1) % decks.length; renderMenu(); };
$("next-deck").onclick = () => { deckIndex = (deckIndex + 1) % decks.length; renderMenu(); };
$("start").onclick = () => {
  Game.start(decks[deckIndex], $("seed").value.trim() || Rng.newSeed());
  $("menu").hidden = true;
  $("game").hidden = false;
  render();
};
$("menu-btn").onclick = showMenu;

// Round -----------------------------------------------------------------

function render() {
  const s = Game.state;
  const cfg = window.SETTRY_CONFIG;
  $("board").innerHTML = s.board
    .map((c, i) => c
      ? `<button class="card${s.selected.includes(i) ? " sel" : ""}" data-i="${i}" title="${c.id}">${cardSvg(c)}</button>`
      : `<div class="card empty"></div>`)
    .join("");

  const hand = Game.selectedHand();
  $("hand-box").innerHTML = hand
    ? `<div class="hand-name">${hand.name}</div>
       <div class="hand-score"><span class="pts">${hand.points}</span> × <span class="mult">${hand.mult}</span> = ${hand.score}</div>`
    : `<div class="hand-name muted">${s.selected.length ? "Not a hand" : "Select cards"}</div>
       <div class="hand-score muted">points × mult</div>`;

  $("info").innerHTML = `Score <b>${s.score}</b> / ${cfg.roundTarget}<br>
    Hands left ${s.playsLeft} · Discards left ${s.discardsLeft}<br>
    Draw pile ${s.pile.length} · Seed ${s.seed}`;
  const over = s.over === "won" ? `You win with ${s.score}!` : s.over === "lost" ? `Out of hands at ${s.score}. You lose.` : "";
  $("msg").textContent = over || s.message;
  $("play").disabled = !Game.canPlay();
  $("discard").disabled = !Game.canDiscard();
  $("discard").textContent = `Discard (${s.discardsLeft})`;
  $("play").textContent = `Play hand (${s.playsLeft})`;
}

$("board").addEventListener("click", (e) => {
  const el = e.target.closest("button.card");
  if (!el) return;
  Game.toggle(Number(el.dataset.i));
  render();
});
$("play").onclick = () => { Game.play(); render(); };
$("discard").onclick = () => { Game.discard(); render(); };

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
