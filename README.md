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

A rule-based bot plays runs headless (same rules as the game) to measure how strong each joker is.

- **On GitHub (no computer needed):** Actions tab → "Bot sweep" → "Run workflow". When it finishes, the ranking shows on the run's summary page and the full data is under "Artifacts" → `sweep`.
- **On your computer:** `tools/sweep.sh 500` (needs Node and Python 3). Uses every CPU core and writes `sweep/report.txt` and `sweep/runs.csv`. About 0.3 s per run per core: 500 runs for each of ~115 jokers is roughly 80 minutes on 4 cores.
- Smaller tests: `node tools/bot.js --runs 100` (no forced joker) or `--joker plainJoker`.

Every joker is forced from the start of the run and compared with a no-joker baseline on the same seeds. The report lists each joker's win rate, change in fights reached (with ± error) and 90th-percentile best hand, then the jokers that aren't clearly better than no joker.
