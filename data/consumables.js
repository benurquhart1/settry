// Charms: one-use cards, like Balatro's tarot cards. You hold up to consumableSlots (data/config.js).
// They come in Charm packs (data/packs.js). js/consumables.js applies them.
// target: how many board cards to select first (up to `max`); none means use it any time.
// Actions:
//   paint      set the color of each selected card to `color`
//   countUp    +1 number on each selected card (5 wraps back to 1)
//   wild       add the wild modification `mod` (data/modifiers.js); wilds stack
//   enhance    give the enhancement `enh` (data/modifiers.js); replaces any it had
//   doubleMoney  double your money, gaining at most `max`
//   echo       create the last charm you used this run (not Echo itself)
//   sellValue  gain the total sell value of your jokers, at most `max`
window.SETTRY_CONSUMABLES = [
  { id: "paintRed",   name: "Red Paint",   art: "🟥", text: "Turn up to 3 selected cards red.",   action: "paint", color: "red",   target: 3 },
  { id: "paintGreen", name: "Green Paint", art: "🟩", text: "Turn up to 3 selected cards green.", action: "paint", color: "green", target: 3 },
  { id: "paintBlue",  name: "Blue Paint",  art: "🟦", text: "Turn up to 3 selected cards blue.",  action: "paint", color: "blue",  target: 3 },
  { id: "paintBlack", name: "Black Paint", art: "⬛", text: "Turn up to 3 selected cards black.", action: "paint", color: "black", target: 3 },
  { id: "countUp",    name: "Count Up",    art: "+1", text: "+1 number on up to 2 selected cards (5 wraps to 1).", action: "countUp", target: 2 },
  { id: "wildColor",  name: "Prism",       art: "🌈", text: "Make 1 selected card wild color.", action: "wild", mod: "wildColor", target: 1 },
  { id: "wildSuit",   name: "Circle",      art: "◯",  text: "Make 1 selected card wild suit.",  action: "wild", mod: "wildSuit",  target: 1 },
  { id: "multCard",   name: "Fire",        art: "🔥", text: "Make up to 2 selected cards Mult cards (+4 mult).", action: "enhance", enh: "mult", target: 2 },
  { id: "bonusCard",  name: "Bonus",       art: "➕", text: "Make up to 2 selected cards Bonus cards (+30 points).", action: "enhance", enh: "bonus", target: 2 },
  { id: "luckyCard",  name: "Clover",      art: "🍀", text: "Make up to 2 selected cards Lucky cards.", action: "enhance", enh: "lucky", target: 2 },
  { id: "glassCard",  name: "Glass",       art: "🔷", text: "Make 1 selected card a Glass card (×2 mult, may break).", action: "enhance", enh: "glass", target: 1 },
  { id: "steelCard",  name: "Steel",       art: "⚙",  text: "Make 1 selected card a Steel card (×5 mult while left on the board).", action: "enhance", enh: "steel", target: 1 },
  { id: "doubleMoney", name: "Piggy Bank", art: "🐷", text: "Double your money (gain up to $20).", action: "doubleMoney", max: 20 },
  { id: "echo",       name: "Echo",        art: "↺",  text: "Create the last charm you used this run (not Echo).", action: "echo" },
  { id: "sellValue",  name: "Appraisal",   art: "💰", text: "Gain the sell value of all your jokers (up to $50).", action: "sellValue", max: 50 },
];
