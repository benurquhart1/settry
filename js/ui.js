// Plain rendering. Reads Game.state and draws it.
const COLORS = { red: "#d22", green: "#1a1", blue: "#22c" };

const SHAPES = {
  oval: '<rect x="2" y="2" width="56" height="20" rx="10"/>',
  diamond: '<polygon points="2,12 30,2 58,12 30,22"/>',
  squiggle: '<path d="M4,17 C4,6 16,2 26,7 C34,11 42,3 52,3 C58,3 58,10 55,14 C50,22 38,20 31,16 C23,12 14,23 8,21 C5,20 4,19 4,17 Z"/>',
};

function cardSvg(card) {
  const col = COLORS[card.color];
  const fill = card.shading === "solid" ? col : card.shading === "shaded" ? `url(#stripe-${card.color})` : "none";
  const symbols = [];
  const top = 50 - card.count * 15;
  for (let n = 0; n < card.count; n++)
    symbols.push(`<g transform="translate(10 ${top + n * 30 + 3})" fill="${fill}" stroke="${col}" stroke-width="2">${SHAPES[card.shape]}</g>`);
  return `<svg viewBox="0 0 80 100">${symbols.join("")}</svg>`;
}

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
