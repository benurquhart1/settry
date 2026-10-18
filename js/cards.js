// Draws one card as SVG. Used by the game and the card gallery.
const SHAPES = {
  heart: '<path d="M12 21C12 21 2 14.5 2 8.2 2 4.8 4.6 2.5 7.5 2.5 9.6 2.5 11.1 3.7 12 5.4 12.9 3.7 14.4 2.5 16.5 2.5 19.4 2.5 22 4.8 22 8.2 22 14.5 12 21 12 21Z"/>',
  diamond: '<path d="M12 1.5 20.5 12 12 22.5 3.5 12Z"/>',
  spade: '<path d="M12 2C12 2 2.5 9.5 2.5 14.5 2.5 17.3 4.6 19.2 7.1 19.2 8.8 19.2 10.2 18.4 11 17.2L9.8 22H14.2L13 17.2C13.8 18.4 15.2 19.2 16.9 19.2 19.4 19.2 21.5 17.3 21.5 14.5 21.5 9.5 12 2 12 2Z"/>',
  club: '<path d="M12 2.2A4.6 4.6 0 0 1 15.6 9.7 4.6 4.6 0 1 1 13.3 17.4L14.4 22H9.6L10.7 17.4A4.6 4.6 0 1 1 8.4 9.7 4.6 4.6 0 0 1 12 2.2Z"/>',
};

// Symbol positions (top-left corners) inside an 80x100 card, by count.
const LAYOUTS = {
  1: [[27, 37]],
  2: [[27, 20], [27, 54]],
  3: [[27, 8], [27, 37], [27, 66]],
  4: [[11, 20], [43, 20], [11, 54], [43, 54]],
};

// Stripe and checker fills for every color, added to the page once.
function addPatterns() {
  const defs = Object.entries(window.SETTRY_COLORS).map(([name, hex]) => `
    <pattern id="striped-${name}" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="1.6" height="4" fill="${hex}"/></pattern>
    <pattern id="checkered-${name}" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="3" height="3" fill="${hex}"/><rect x="3" y="3" width="3" height="3" fill="${hex}"/></pattern>`);
  document.body.insertAdjacentHTML("afterbegin",
    `<svg width="0" height="0" style="position:absolute"><defs>${defs.join("")}</defs></svg>`);
}

function cardSvg(card) {
  const col = window.SETTRY_COLORS[card.color];
  const fill = card.shading === "solid" ? col : card.shading === "empty" ? "none" : `url(#${card.shading}-${card.color})`;
  const symbols = LAYOUTS[card.count].map(([x, y]) =>
    `<g transform="translate(${x} ${y})" fill="${fill}" stroke="${col}" stroke-width="1.5" stroke-linejoin="round">${SHAPES[card.shape]}</g>`);
  return `<svg viewBox="0 0 80 100">${symbols.join("")}</svg>`;
}

addPatterns();
