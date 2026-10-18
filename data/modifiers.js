// Card modifications. A card lists the ones it has in card.mods, e.g. { ..., mods: ["wildSuit"] }.
// These stack: one card can be wild in several attributes.
// wild: the attribute this modifier makes wild (counts as any value when checking a set).
// draw: how js/cards.js shows it.
window.SETTRY_MODIFIERS = {
  wildSuit: {
    name: "Wild suit",
    text: "Counts as any shape.",
    wild: "shape",
    draw: { shape: "circle" },   // drawn as a circle instead of a suit
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

// Enhancements, like Balatro's. A card has at most one, in card.enh; a new one replaces the old.
// Scored cards apply theirs one at a time in click order, right after adding their points.
// Steel works the other way round: it applies while the card stays on the board, unplayed.
// Chances ("1 in N") are rolled with the seed once, when the hand is played.
// draw: background tint and a tag along the bottom of the card.
window.SETTRY_ENHANCEMENTS = {
  mult:  { name: "Mult card",  text: "+4 mult when scored.", mult: 4,
           draw: { bg: "#fdecea", tag: "+4 MULT", color: "#c62828" } },
  bonus: { name: "Bonus card", text: "+30 points when scored.", points: 30,
           draw: { bg: "#e8f0fe", tag: "+30", color: "#1565c0" } },
  lucky: { name: "Lucky card", text: "When scored: 1 in 5 chance of +20 mult, 1 in 15 chance of $20.",
           luckyMult: { odds: 5, mult: 20 }, luckyMoney: { odds: 15, money: 20 },
           draw: { bg: "#fff8e1", tag: "LUCKY", color: "#b28704" } },
  glass: { name: "Glass card", text: "×2 mult when scored. 1 in 4 chance to break (leaves your deck).", xMult: 2, breakOdds: 4,
           draw: { bg: "#e0f7fa", tag: "GLASS ×2", color: "#00838f" } },
  steel: { name: "Steel card", text: "×5 mult while it stays on the board when you play a hand.", heldXMult: 5,
           draw: { bg: "#e0e0e0", tag: "STEEL ×5", color: "#424242" } },
};
