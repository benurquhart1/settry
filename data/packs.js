// Booster packs sold in the shop, like Balatro's. Open one to choose from a few options.
// kind "card": playing cards to add to your deck (each may come with a wild modification).
// kind "joker": jokers (rolled with the same rarity odds as the shop).
// weight: how often this pack shows up compared with the others.
window.SETTRY_PACKS = [
  { id: "standard",      name: "Standard Pack",      kind: "card",  price: 4, options: 3, picks: 1, weight: 4 },
  { id: "jumboStandard", name: "Jumbo Standard Pack", kind: "card",  price: 6, options: 5, picks: 1, weight: 2 },
  { id: "megaStandard",  name: "Mega Standard Pack",  kind: "card",  price: 8, options: 5, picks: 2, weight: 0.5 },
  { id: "buffoon",       name: "Buffoon Pack",        kind: "joker", price: 4, options: 2, picks: 1, weight: 1.2 },
  { id: "jumboBuffoon",  name: "Jumbo Buffoon Pack",  kind: "joker", price: 6, options: 4, picks: 1, weight: 0.6 },
  { id: "megaBuffoon",   name: "Mega Buffoon Pack",   kind: "joker", price: 8, options: 4, picks: 2, weight: 0.15 },
];

// Chance that a card in a Standard pack comes with one wild modification (chosen at random).
window.SETTRY_PACK_WILD_CHANCE = 0.25;
