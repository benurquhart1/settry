# Settry

A card game that mixes Set with Balatro. Plays in the browser, locally, with no install or build step.

## Play

Open `index.html` in a browser. That's it. `gallery.html` shows every card.
(If your browser blocks local files, run `python3 -m http.server` in this folder and open http://localhost:8000.)

## Where things live

- `docs/RULES.md`: the rules, in words. Start here.
- `docs/TODO.md`: things to come back to.
- `data/config.js`: the numbers (deck size, board size, sets to win, discards).
- `data/decks.js`: starting decks.
- `data/packs.js`: shop packs.
- `data/hands.js`: hands you can play and what they score.
- `data/jokers.js`: jokers, rarities and drop rates. `jokers.html` shows them.
- `js/jokers.js`: applying joker effects.
- `data/fights.js`: the 20 fights, opponents, targets, rewards and boss modifiers.
- `data/modifiers.js`: card modifications such as the wild suit, and enhancements (mult, bonus, lucky, glass, steel).
- `data/consumables.js`: charms (one-use cards, like tarots), applied by `js/consumables.js`.
- `gallery.html`: every card in the deck.
- `js/deck.js`: building the deck and checking sets.
- `js/cards.js`: how a card is drawn.
- `js/rng.js`: seeded randomness.
- `js/hands.js`: working out which hand a play makes.
- `js/shop.js`: the shop.
- `js/game.js`: run and round state and rules.
- `js/ui.js`, `index.html`, `style.css`: the plain look.

## Balancing bot

`node tools/bot.js --runs 500 --force-each --out runs.csv` plays runs headless with a rule-based bot (10-card board, like the game; `--board N` to try another size), forcing each joker in turn on the same seeds. `python3 tools/analyze.py runs.csv` ranks the jokers against the no-joker baseline. Each run takes about 0.2 s, so `--force-each` at 500 runs is roughly 2 hours.
