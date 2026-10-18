// Card modifications. A card lists the ones it has in card.mods, e.g. { ..., mods: ["wildSuit"] }.
// wild: the attribute this modifier makes wild (counts as any value when checking a set).
window.SETTRY_MODIFIERS = {
  wildSuit: {
    name: "Wild suit",
    text: "Counts as any shape.",
    wild: "shape",
    // Drawn as one shape built from a quarter of each suit.
    draw: { topLeft: "heart", topRight: "club", bottomLeft: "spade", bottomRight: "diamond" },
  },
};
