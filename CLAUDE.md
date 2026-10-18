# Settry notes for Claude

- Plain browser game, no build step, must keep working when `index.html` is opened from disk (so no `fetch` of local JSON; data files are scripts that set `window.SETTRY_*`).
- Rules in words go in `docs/RULES.md`; numbers in `data/config.js`; jokers in `data/jokers.js`; card modifications in `data/modifiers.js`; hands and their scores in `data/hands.js`. Change a rule in both the doc and the data in the same commit.
- Keep game logic in `js/deck.js`, `js/hands.js` and `js/game.js`, free of DOM code; `js/ui.js` only draws.
- Looks are deliberately plain for now.
