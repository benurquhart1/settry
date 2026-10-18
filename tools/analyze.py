"""Joker strength from a tools/bot.js --force-each CSV.

    python3 tools/analyze.py runs.csv

For each forced joker, compared with the baseline (no forced joker) on the same seeds:
  general strength: win rate and average fight reached (how far the joker carries a run),
  absolute strength: 90th-percentile best hand (how high it lets scores go).
Jokers that do no better than the baseline are listed at the end as low success.
"""
import csv
import math
import sys
from collections import defaultdict


def pct(values, q):
    v = sorted(values)
    return v[min(len(v) - 1, int(q * len(v)))] if v else 0


def main(path):
    rows = defaultdict(dict)  # forced joker -> seed -> row
    with open(path) as f:
        for r in csv.DictReader(f):
            rows[r["forced"]][r["seed"]] = r
    base = rows.pop("", None)
    if not base:
        sys.exit("No baseline runs (run bot.js with --force-each).")

    def stats(group):
        won = [int(r["won"]) for r in group.values()]
        fight = [int(r["fight"]) for r in group.values()]
        best = [int(r["bestHand"]) for r in group.values()]
        n = len(won)
        p = sum(won) / n
        return {"n": n, "win": p, "win_se": math.sqrt(p * (1 - p) / n), "fight": sum(fight) / n, "p90": pct(best, 0.9)}

    b = stats(base)
    print(f"Baseline: {b['n']} runs, win {b['win']:.1%}, avg fight {b['fight']:.2f}, p90 best hand {b['p90']}\n")
    table = []
    for joker, group in rows.items():
        s = stats(group)
        # Paired by seed: the same run with and without the joker.
        diffs = [int(r["fight"]) - int(base[seed]["fight"]) for seed, r in group.items() if seed in base]
        d = sum(diffs) / len(diffs)
        sd = math.sqrt(sum((x - d) ** 2 for x in diffs) / max(1, len(diffs) - 1))
        table.append((joker, s, d, sd / math.sqrt(len(diffs))))
    table.sort(key=lambda t: -t[2])
    print(f"{'joker':<18}{'runs':>6}{'win':>8}{'±':>6}{'fight +/-':>11}{'±':>6}{'p90 hand':>10}")
    for joker, s, d, se in table:
        print(f"{joker:<18}{s['n']:>6}{s['win']:>8.1%}{s['win_se']:>6.1%}{d:>+11.2f}{se:>6.2f}{s['p90']:>10}")
    weak = [j for j, s, d, se in table if d - 2 * se <= 0 and s["win"] <= b["win"] + 2 * s["win_se"]]
    print("\nLow success (not clearly better than no joker):", ", ".join(weak) or "none")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "runs.csv")
