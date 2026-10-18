// Starting decks to choose from on the start menu.
// A run deck is `size` cards drawn at random, with replacement, from the cards that pass `filter`,
// so the same card can show up more than once.
window.SETTRY_DECKS = [
  { id: "red", name: "Red deck", text: "Only red cards.", size: 40, filter: { color: "red" } },
  { id: "blue", name: "Blue deck", text: "Only blue cards.", size: 40, filter: { color: "blue" } },
  { id: "green", name: "Green deck", text: "Only green cards.", size: 40, filter: { color: "green" } },
  { id: "black", name: "Black deck", text: "Only black cards.", size: 40, filter: { color: "black" } },
  { id: "hearts", name: "Heart deck", text: "Only hearts.", size: 40, filter: { shape: "heart" } },
  { id: "diamonds", name: "Diamond deck", text: "Only diamonds.", size: 40, filter: { shape: "diamond" } },
  { id: "spades", name: "Spade deck", text: "Only spades.", size: 40, filter: { shape: "spade" } },
  { id: "clubs", name: "Club deck", text: "Only clubs.", size: 40, filter: { shape: "club" } },
];
