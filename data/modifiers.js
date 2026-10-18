// Card modifications. A card lists the ones it has in card.mods, e.g. { ..., mods: ["wildSuit"] }.
// wild: the attribute this modifier makes wild (counts as any value when checking a set).
// draw: how js/cards.js shows it.
window.SETTRY_MODIFIERS = {
  wildSuit: {
    name: "Wild suit",
    text: "Counts as any shape.",
    wild: "shape",
    draw: { shape: "circle" },   // drawn as a circle instead of a suit
  },
  wildCount: {
    name: "Wild number",
    text: "Counts as any number.",
    wild: "count",
    points: 5,              // points the card adds when it scores
    draw: { symbols: 5 },   // this many symbols in a circle
  },
  wildColor: {
    name: "Wild color",
    text: "Counts as any color.",
    wild: "color",
    // Rainbow running diagonally from top left to bottom right.
    draw: { rainbow: ["#e53935", "#fb8c00", "#fdd835", "#43a047", "#1e88e5", "#8e24aa"] },
  },
  wildShading: {
    name: "Wild shading",
    text: "Counts as any shading.",
    wild: "shading",
    draw: { pattern: "dots" },   // polka dots inside the shape
  },
};
