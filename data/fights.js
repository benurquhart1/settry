// The run: a ladder of fights (ben, 2026-10-18). Before each fight you choose one of two opponents,
// each with their own target and reward. Every 4th fight is a boss with a modifier.
// After fight `count` the run is won, and you can keep going in endless mode.
// Targets are placeholders until ben works on the scaling.
window.SETTRY_FIGHTS = {
  count: 20,           // fights in a run; beat the last one to win
  bossEvery: 4,        // fights 4, 8, 12, 16 and 20 are bosses (3 regular fights in between)
  groupTargets: [100, 300, 800, 2000, 5000],   // base target for fights 1-4, 5-8, 9-12, 13-16, 17-20
  endlessGrowth: 2.5,  // in endless mode, each new group of 4 fights has base target x this
  // Regular opponents: the two on offer get different rewards (and targets to match).
  regular: [
    { reward: 3, targetMult: 1 },
    { reward: 5, targetMult: 1.3 },
    { reward: 8, targetMult: 1.7 },
  ],
  // Bosses: both on offer pay the same but have different modifiers (SETTRY_BOSS_MODIFIERS).
  boss: { reward: 10, targetMult: 2 },
  // Placeholder opponent names.
  names: ["Ada", "Bram", "Cleo", "Dex", "Edie", "Finn", "Gus", "Hana", "Ivo", "Juno", "Kit", "Lev",
    "Mae", "Nico", "Olga", "Pip", "Quin", "Rosa", "Sol", "Tess", "Uma", "Vic", "Wren", "Yara", "Zed"],
};

// Boss modifiers. Usually only bosses have one. More to come from ben.
//   debuff    cards whose `attribute` is `value` don't score: no points, no enhancement, no joker effects
//             (they still count toward making the hand)
//   targetMult  the target is this many times bigger
//   maxPlay   most cards one play can use
window.SETTRY_BOSS_MODIFIERS = [
  { id: "noRed",    name: "Red Ban",     text: "Red cards don't score.",    debuff: { attribute: "color", value: "red" } },
  { id: "noGreen",  name: "Green Ban",   text: "Green cards don't score.",  debuff: { attribute: "color", value: "green" } },
  { id: "noBlue",   name: "Blue Ban",    text: "Blue cards don't score.",   debuff: { attribute: "color", value: "blue" } },
  { id: "noBlack",  name: "Black Ban",   text: "Black cards don't score.",  debuff: { attribute: "color", value: "black" } },
  { id: "noHearts", name: "Heart Ban",   text: "Hearts don't score.",       debuff: { attribute: "shape", value: "heart" } },
  { id: "noDiamonds", name: "Diamond Ban", text: "Diamonds don't score.",   debuff: { attribute: "shape", value: "diamond" } },
  { id: "noSpades", name: "Spade Ban",   text: "Spades don't score.",       debuff: { attribute: "shape", value: "spade" } },
  { id: "noClubs",  name: "Club Ban",    text: "Clubs don't score.",        debuff: { attribute: "shape", value: "club" } },
  { id: "giant",    name: "Giant",       text: "The target is 1.5 times bigger.", targetMult: 1.5 },
  { id: "threeCards", name: "Short Hands", text: "You can only play up to 3 cards.", maxPlay: 3 },
];
