# Settry

A card game that mixes Set with Balatro. Plays in the browser, locally, with no install or build step.

## Play

Open `index.html` in a browser. That's it.
(If your browser blocks local files, run `python3 -m http.server` in this folder and open http://localhost:8000.)

## Where things live

- `docs/RULES.md`: the rules, in words. Start here.
- `data/config.js`: the numbers (deck size, board size, sets to win, discards).
- `data/jokers.js`: jokers by rarity.
- `js/deck.js`: building the 81 cards and checking sets.
- `js/game.js`: round state and rules.
- `js/ui.js`, `index.html`, `style.css`: the plain look.
