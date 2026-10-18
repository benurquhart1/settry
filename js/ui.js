// Plain rendering. Reads Game.state and draws it. Card drawing is in js/cards.js.
function render() {
  const s = Game.state;
  const cfg = window.SETTRY_CONFIG;
  document.getElementById("board").innerHTML = s.board
    .map((c, i) => `<button class="card${s.selected.includes(i) ? " sel" : ""}" data-i="${i}" title="${c.id}">${cardSvg(c)}</button>`)
    .join("");
  const setsOnBoard = Deck.findSets(s.board).length;
  document.getElementById("info").textContent =
    `Sets: ${s.setsMade}/${cfg.setsToWin} · Discards left: ${s.discardsLeft} · Deck: ${s.deck.length}` +
    (cfg.showSetCount ? ` · Sets on board: ${setsOnBoard}` : "");
  const over = s.over === "won" ? "You win!" : s.over === "lost" ? "Out of moves. You lose." : "";
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
document.getElementById("play").onclick = () => { Game.playSet(); render(); };
document.getElementById("discard").onclick = () => { Game.discard(); render(); };
document.getElementById("new").onclick = () => { Game.newRun(); render(); };

Game.newRun();
render();
