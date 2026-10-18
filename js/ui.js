// Plain rendering. Reads Game.state and draws it. Card drawing is in js/cards.js.
function render() {
  const s = Game.state;
  const cfg = window.SETTRY_CONFIG;
  document.getElementById("board").innerHTML = s.hand
    .map((c, i) => `<button class="card${s.selected.includes(i) ? " sel" : ""}" data-i="${i}" title="${c.id}">${cardSvg(c)}</button>`)
    .join("");
  document.getElementById("info").textContent =
    `Score: ${s.score}/${cfg.roundTarget} · Plays left: ${s.playsLeft} · Discards left: ${s.discardsLeft} · Deck: ${s.deck.length}`;
  const picked = s.selected.length >= 2 ? Hands.best(Game.selectedCards()) : null;
  document.getElementById("preview").textContent = !s.selected.length ? "" : picked
    ? `${picked.name}: ${picked.points} × ${picked.mult} = ${picked.score}`
    : "Not a hand yet";
  const over = s.over === "won" ? `You win with ${s.score}!` : s.over === "lost" ? `Out of plays at ${s.score}. You lose.` : "";
  document.getElementById("msg").textContent = over || s.message;
  document.getElementById("play").disabled = !Game.canPlay();
  document.getElementById("discard").disabled = !Game.canDiscard();
  document.getElementById("discard").textContent = `Discard (up to ${cfg.maxDiscardSize})`;
}

document.getElementById("board").addEventListener("click", (e) => {
  const el = e.target.closest(".card");
  if (!el) return;
  Game.toggle(Number(el.dataset.i));
  render();
});
document.getElementById("play").onclick = () => { Game.play(); render(); };
document.getElementById("discard").onclick = () => { Game.discard(); render(); };
document.getElementById("new").onclick = () => { Game.newRun(); render(); };

Game.newRun();
render();
