// Draws one card as SVG. Used by the game and the card gallery.
const SHAPES = {
  heart: '<path d="M12 21C12 21 2 14.5 2 8.2 2 4.8 4.6 2.5 7.5 2.5 9.6 2.5 11.1 3.7 12 5.4 12.9 3.7 14.4 2.5 16.5 2.5 19.4 2.5 22 4.8 22 8.2 22 14.5 12 21 12 21Z"/>',
  diamond: '<path d="M12 1.5 20.5 12 12 22.5 3.5 12Z"/>',
  spade: '<path d="M12 2C12 2 2.5 9.5 2.5 14.5 2.5 17.3 4.6 19.2 7.1 19.2 8.8 19.2 10.2 18.4 11 17.2L9.8 22H14.2L13 17.2C13.8 18.4 15.2 19.2 16.9 19.2 19.4 19.2 21.5 17.3 21.5 14.5 21.5 9.5 12 2 12 2Z"/>',
  circle: '<circle cx="12" cy="12" r="10"/>',
  club: '<path d="M12 2.2A4.6 4.6 0 0 1 15.6 9.7 4.6 4.6 0 1 1 13.3 17.4L14.4 22H9.6L10.7 17.4A4.6 4.6 0 1 1 8.4 9.7 4.6 4.6 0 0 1 12 2.2Z"/>',
};

// Symbol positions (top-left corner, optional scale) inside an 80x100 card, by count.
const LAYOUTS = {
  1: [[14, 24, 2.2]],
  2: [[27, 20], [27, 54]],
  3: [[27, 20], [11, 54], [43, 54]],
  4: [[11, 20], [43, 20], [11, 54], [43, 54]],
};

// Wild number: symbols evenly spaced on a circle.
function circleLayout(n) {
  const size = 24 * 0.75;
  return Array.from({ length: n }, (_, i) => {
    const a = -Math.PI / 2 + (2 * Math.PI * i) / n;
    return [40 + 25 * Math.cos(a) - size / 2, 50 + 25 * Math.sin(a) - size / 2, 0.75];
  });
}

function wildDraw(card, attribute) {
  const mod = (card.mods || []).map((m) => window.SETTRY_MODIFIERS[m]).find((m) => m?.wild === attribute);
  return mod && mod.draw;
}

// Shared SVG defs: shading masks and the rainbow. Added to the page once.
function addPatterns() {
  const defs = [
    `<pattern id="p-striped" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="1.6" height="4" fill="#fff"/></pattern>`,
    `<pattern id="p-checkered" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="3" height="3" fill="#fff"/><rect x="3" y="3" width="3" height="3" fill="#fff"/></pattern>`,
    `<pattern id="p-dots" width="5" height="5" patternUnits="userSpaceOnUse"><circle cx="2.5" cy="2.5" r="1.4" fill="#fff"/></pattern>`,
  ];
  for (const p of ["striped", "checkered", "dots"])
    defs.push(`<mask id="m-${p}"><rect x="-50" y="-50" width="200" height="200" fill="url(#p-${p})"/></mask>`);
  const rainbow = window.SETTRY_MODIFIERS.wildColor.draw.rainbow;
  defs.push(`<linearGradient id="rainbow" gradientUnits="userSpaceOnUse" x1="22" y1="30" x2="58" y2="70">${rainbow
    .map((c, i) => `<stop offset="${i / (rainbow.length - 1)}" stop-color="${c}"/>`).join("")}</linearGradient>`);
  document.body.insertAdjacentHTML("afterbegin",
    `<svg width="0" height="0" style="position:absolute"><defs>${defs.join("")}</defs></svg>`);
}

// The shape markup for a card: its own suit, or the wild shape.
function shapeSvg(card) {
  const wild = wildDraw(card, "shape");
  return SHAPES[wild ? wild.shape : card.shape];
}

let maskId = 0;

function cardSvg(card) {
  const rainbow = wildDraw(card, "color");
  // A wild color card draws its symbols in white as a mask over one card-wide rainbow.
  const paint = rainbow ? "#fff" : window.SETTRY_COLORS[card.color];
  const wildShading = wildDraw(card, "shading");
  const shading = wildShading ? wildShading.pattern : card.shading;
  const wildCount = wildDraw(card, "count");
  const layout = wildCount ? circleLayout(wildCount.symbols) : LAYOUTS[card.count];
  const shape = shapeSvg(card);
  // Fill first (patterned shadings are the paint seen through a mask), then the outline.
  const fill = shading === "empty" ? "" : shading === "solid"
    ? `<g fill="${paint}">${shape}</g>`
    : `<g fill="${paint}" mask="url(#m-${shading})">${shape}</g>`;
  const symbols = layout.map(([x, y, scale = 1]) =>
    `<g transform="translate(${x} ${y}) scale(${scale})">${fill}` +
    `<g fill="none" stroke="${paint}" stroke-width="${1.5 / scale}" stroke-linejoin="round">${shape}</g></g>`);
  if (!rainbow) return `<svg viewBox="0 0 80 100">${symbols.join("")}</svg>`;
  const id = `rainbow-mask-${maskId++}`;
  return `<svg viewBox="0 0 80 100"><mask id="${id}">${symbols.join("")}</mask>` +
    `<rect width="80" height="100" fill="url(#rainbow)" mask="url(#${id})"/></svg>`;
}

addPatterns();
